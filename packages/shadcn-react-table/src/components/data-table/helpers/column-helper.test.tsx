import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { DataTable } from "../core/data-table"
import { useDataTable } from "../core/use-data-table"
import { createDataTableColumnHelper } from "./column-helper"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Person = { id: string; name: string; age: number }

const people: Person[] = [
  { id: "1", name: "Ada", age: 36 },
  { id: "2", name: "Alan", age: 41 },
]

const helper = createDataTableColumnHelper<Person>()

const columns = helper.columns([
  helper.accessor("name", {
    header: "Name",
    // The table's own column options are typed on `meta`.
    meta: { filterVariant: "text", align: "left" },
  }),
  helper.accessor((row) => row.age * 12, {
    id: "months",
    header: "Months",
    cell: ({ getValue }) => `${getValue().toFixed(0)} mo`,
  }),
  helper.display({ id: "note", header: "Note", cell: () => "—" }),
])

// Type-level checks: these must not compile.
// @ts-expect-error not a key of Person
helper.accessor("email", {})
// @ts-expect-error not a filter variant
helper.accessor("name", { meta: { filterVariant: "nope" } })

function Table() {
  const table = useDataTable<Person>({
    data: people,
    columns,
    getRowId: (row) => row.id,
  })
  return <DataTable table={table} />
}

describe("createDataTableColumnHelper", () => {
  it("builds columns the table takes as they are", () => {
    render(<Table />)
    expect(screen.getByText("Name")).toBeDefined()
    expect(screen.getByText("Months")).toBeDefined()
    // The accessor function's number reached the cell typed as a number.
    expect(screen.getByText("432 mo")).toBeDefined()
    expect(screen.getAllByText("—")).toHaveLength(2)
  })
})
