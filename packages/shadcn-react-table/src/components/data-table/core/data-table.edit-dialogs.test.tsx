import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableInstance, UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

// jsdom lacks these; Radix Select / Base UI call them when opening.
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => {}
})

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Person = { id: string; name: string; team: string }

const people: Person[] = [
  { id: "1", name: "Mason", team: "a" },
  { id: "2", name: "Lily", team: "b" },
]

type Options = Partial<UseDataTableOptions<Person>>

function Harness({
  onTable,
  ...options
}: Options & { onTable?: (table: DataTableInstance<Person>) => void }) {
  const table = useDataTable<Person>({
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "team", header: "Team" },
    ],
    data: people,
    getRowId: (row) => row.id,
    enableEditing: true,
    editDisplayMode: "modal",
    ...options,
  })
  onTable?.(table)
  return <DataTable table={table} />
}

function mount(options: Options = {}) {
  let instance: DataTableInstance<Person> | undefined
  render(<Harness {...options} onTable={(t) => (instance = t)} />)
  return { table: () => instance! }
}

const row = (table: DataTableInstance<Person>, id: string) => table.getRow(id)

describe("cancel callbacks", () => {
  it("calls onEditingRowCancel when the user cancels, not after a save", () => {
    const onEditingRowCancel = vi.fn()
    const { table } = mount({
      onEditingRowCancel,
      onEditingRowSave: ({ exit }) => exit(),
    })
    act(() => table().beginRowEdit(row(table(), "2")))
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(onEditingRowCancel).toHaveBeenCalledTimes(1)
    expect(onEditingRowCancel.mock.calls[0]![0].row.id).toBe("2")

    act(() => table().beginRowEdit(row(table(), "1")))
    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(onEditingRowCancel).toHaveBeenCalledTimes(1)
    expect(table().getState().editingRowId).toBeNull()
  })

  it("calls onCreatingRowCancel when the create form is cancelled", () => {
    const onCreatingRowCancel = vi.fn()
    const { table } = mount({ onCreatingRowCancel })
    act(() => table().beginCreate())
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(onCreatingRowCancel).toHaveBeenCalledTimes(1)
    expect(table().getState().isCreating).toBe(false)
  })
})

describe("dialog content overrides", () => {
  it("renders your edit dialog content around the built-in fields", () => {
    const onEditingRowSave = vi.fn()
    const { table } = mount({
      onEditingRowSave,
      renderEditRowDialogContent: ({
        row,
        internalEditComponents,
        save,
        cancel,
      }) => (
        <div>
          <h2>Editing {row.original.name}</h2>
          {internalEditComponents}
          <button type="button" onClick={save}>
            Keep
          </button>
          <button type="button" onClick={cancel}>
            Drop
          </button>
        </div>
      ),
    })
    act(() => table().beginRowEdit(row(table(), "2")))
    expect(screen.getByText("Editing Lily")).toBeTruthy()
    expect(screen.getByDisplayValue("Lily")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Keep" }))
    expect(onEditingRowSave).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole("button", { name: "Drop" }))
    expect(table().getState().editingRowId).toBeNull()
  })

  it("renders your create dialog content", () => {
    const { table } = mount({
      renderCreateRowDialogContent: ({ internalEditComponents }) => (
        <section>
          <h2>New person</h2>
          {internalEditComponents}
        </section>
      ),
    })
    act(() => table().beginCreate())
    expect(screen.getByText("New person")).toBeTruthy()
    expect(screen.getAllByRole("textbox")).toHaveLength(2)
  })
})

describe("editSelectOptions as a function", () => {
  it("is called with the row being edited", () => {
    const editSelectOptions = vi.fn(({ row }: { row?: { id: string } }) => [
      { label: `Team of ${row?.id ?? "new"}`, value: "x" },
    ])
    const { table } = mount({
      columns: [
        { accessorKey: "name", header: "Name" },
        {
          accessorKey: "team",
          header: "Team",
          meta: { editVariant: "select", editSelectOptions },
        },
      ],
    })
    act(() => table().beginRowEdit(row(table(), "2")))
    expect(editSelectOptions.mock.calls.at(-1)![0].row!.id).toBe("2")
    act(() => table().cancelEdit())
    act(() => table().beginCreate())
    expect(editSelectOptions.mock.calls.at(-1)![0].row).toBeUndefined()
  })
})

describe("positionCreatingRow", () => {
  it("puts the inline create row after the data rows", () => {
    const { table } = mount({
      createDisplayMode: "row",
      positionCreatingRow: "bottom",
    })
    act(() => table().beginCreate())
    const rows = Array.from(document.querySelectorAll("tbody tr"))
    const createIndex = rows.findIndex(
      (tr) => tr.getAttribute("data-slot") === "data-table-create-row"
    )
    expect(createIndex).toBeGreaterThan(
      rows.findIndex((tr) => tr.textContent?.includes("Lily"))
    )
  })

  it("puts the inline create row before a row index", () => {
    const { table } = mount({
      createDisplayMode: "row",
      positionCreatingRow: 1,
    })
    act(() => table().beginCreate())
    const rows = Array.from(document.querySelectorAll("tbody tr"))
    expect(rows[0]!.textContent).toContain("Mason")
    expect(rows[1]!.getAttribute("data-slot")).toBe("data-table-create-row")
    // The create row's action strip (Cancel / Save) follows it.
    expect(rows[2]!.textContent).toContain("Save")
    expect(rows[3]!.textContent).toContain("Lily")
  })

  it("treats an index past the last row as the bottom", () => {
    const { table } = mount({
      createDisplayMode: "row",
      positionCreatingRow: 99,
    })
    act(() => table().beginCreate())
    const rows = Array.from(document.querySelectorAll("tbody tr"))
    expect(rows.at(-2)!.getAttribute("data-slot")).toBe("data-table-create-row")
  })
})
