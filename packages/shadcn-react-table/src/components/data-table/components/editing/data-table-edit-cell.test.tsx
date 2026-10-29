import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react"
import * as React from "react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { DataTable } from "../../core/data-table"
import type { DataTableColumnDef } from "../../core/table-types"
import type { DataTableInstance, UseDataTableOptions } from "../../core/types"
import { useDataTable } from "../../core/use-data-table"

// jsdom lacks these; Radix Select / Base UI call them when opening.
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => {}
})

// Vitest globals are off in this package, so Testing Library does not
// auto-cleanup; without this the DOM leaks between tests.
afterEach(cleanup)

type Person = { id: string; name: string; status: string }

const people: Person[] = [
  { id: "1", name: "Mason", status: "a" },
  { id: "2", name: "Lily", status: "b" },
  { id: "3", name: "Jack", status: "a" },
]

const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      editVariant: "select",
      filterSelectOptions: [
        { label: "a", value: "a" },
        { label: "b", value: "b" },
      ],
    },
  },
]

type Options = Partial<UseDataTableOptions<Person>>

/** Mounts a table and hands the instance back through `onTable`. */
function Harness({
  onTable,
  ...options
}: Options & { onTable?: (table: DataTableInstance<Person>) => void }) {
  const table = useDataTable<Person>({
    columns,
    data: people,
    getRowId: (row) => row.id,
    ...options,
  })
  onTable?.(table)
  return <DataTable table={table} />
}

function mount(options: Options = {}) {
  let instance!: DataTableInstance<Person>
  const view = render(<Harness {...options} onTable={(t) => (instance = t)} />)
  return { view, table: () => instance }
}

async function pickOption(name: string) {
  const trigger = within(screen.getByRole("grid")).getAllByRole("combobox")[0]!
  trigger.focus()
  fireEvent.keyDown(trigger, { key: "Enter" })
  const option = await screen.findByRole("option", { name })
  option.focus()
  fireEvent.keyDown(option, { key: "Enter" })
}

describe("select cell editor", () => {
  it("saves the picked value in cell mode and exits editing", async () => {
    const onEditingCellSave = vi.fn()
    const { table } = mount({
      enableEditing: true,
      editDisplayMode: "cell",
      onEditingCellSave,
    })
    act(() => table().setEditingCell({ rowId: "1", columnId: "status" }))
    await pickOption("b")
    expect(onEditingCellSave).toHaveBeenCalledTimes(1)
    expect(onEditingCellSave.mock.calls[0]![0].value).toBe("b")
    expect(table().getState().editingCell).toBeNull()
  })

  it("saves the picked value, not the previous one, in table mode", async () => {
    const onEditingCellSave = vi.fn()
    mount({ enableEditing: true, editDisplayMode: "table", onEditingCellSave })
    await pickOption("b")
    expect(onEditingCellSave).toHaveBeenCalledTimes(1)
    expect(onEditingCellSave.mock.calls[0]![0].value).toBe("b")
  })

  it("does not save when validation rejects the picked value", async () => {
    const onEditingCellSave = vi.fn()
    const validating: DataTableColumnDef<Person>[] = columns.map((c) =>
      "accessorKey" in c && c.accessorKey === "status"
        ? {
            ...c,
            meta: {
              ...c.meta,
              validate: (v: unknown) => (v === "b" ? "no b" : undefined),
            },
          }
        : c
    )
    render(
      <Harness
        columns={validating}
        enableEditing
        editDisplayMode="table"
        onEditingCellSave={onEditingCellSave}
      />
    )
    await pickOption("b")
    expect(onEditingCellSave).not.toHaveBeenCalled()
    expect(screen.getAllByText("no b").length).toBeGreaterThan(0)
  })

  it("keeps a numeric column's values numeric", async () => {
    type Task = { id: string; priority: number }
    const onEditingCellSave = vi.fn()
    function Numeric() {
      const table = useDataTable<Task>({
        columns: [
          {
            accessorKey: "priority",
            header: "Priority",
            meta: {
              editVariant: "select",
              filterSelectOptions: [
                { label: "1", value: "1" },
                { label: "2", value: "2" },
              ],
            },
          },
        ],
        data: [{ id: "1", priority: 1 }],
        getRowId: (row) => row.id,
        enableEditing: true,
        editDisplayMode: "table",
        onEditingCellSave,
      })
      return <DataTable table={table} />
    }
    render(<Numeric />)
    await pickOption("2")
    expect(onEditingCellSave).toHaveBeenCalledTimes(1)
    expect(onEditingCellSave.mock.calls[0]![0].value).toBe(2)
  })
})
