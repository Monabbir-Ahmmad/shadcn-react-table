import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, it } from "vitest"

import { DataTable } from "../../core/data-table"
import type { DataTableColumnDef } from "../../core/table-types"
import type { DataTableInstance } from "../../core/types"
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

describe("edit modal", () => {
  it("closes instead of throwing when the edited row disappears from data", () => {
    let instance!: DataTableInstance<Person>
    function Consumer({ data }: { data: Person[] }) {
      const table = useDataTable<Person>({
        columns,
        data,
        getRowId: (row) => row.id,
        enableEditing: true,
        editDisplayMode: "modal",
      })
      instance = table
      return <DataTable table={table} />
    }
    const view = render(<Consumer data={people} />)
    act(() => instance.tableInstance.beginRowEdit(instance.getRow("1")))
    expect(screen.getByRole("dialog")).toBeTruthy()

    expect(() =>
      view.rerender(<Consumer data={people.slice(1)} />)
    ).not.toThrow()
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(instance.tableInstance.editingRowId).toBeNull()
  })
})
