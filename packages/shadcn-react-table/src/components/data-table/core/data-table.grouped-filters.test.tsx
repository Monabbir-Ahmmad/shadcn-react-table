import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import { useDataTable } from "./use-data-table"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Person = { id: string; first: string; last: string; age: number }

const people: Person[] = [
  { id: "1", first: "Mason", last: "Lee", age: 30 },
  { id: "2", first: "Lily", last: "Kim", age: 25 },
]

const columns: DataTableColumnDef<Person>[] = [
  {
    id: "name",
    header: "Name",
    columns: [
      { accessorKey: "first", header: "First" },
      { accessorKey: "last", header: "Last" },
    ],
  },
  { accessorKey: "age", header: "Age" },
]

function Table() {
  const table = useDataTable<Person>({
    columns,
    data: people,
    getRowId: (row) => row.id,
    showColumnFilters: true,
  })
  return <DataTable table={table} />
}

describe("column filter row with grouped headers", () => {
  it("renders one filter row, under the leaf headers", () => {
    const { container } = render(<Table />)
    const rows = container.querySelectorAll("thead tr")
    // Two header rows (group + leaf) and a single filter row.
    expect(rows).toHaveLength(3)
    expect(rows[2]!.querySelectorAll("th")).toHaveLength(3)
  })
})
