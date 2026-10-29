import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import {
  DataTable,
  DataTableDensityToggle,
  DataTableGlobalFilter,
  DataTablePagination,
  DataTableProvider,
  useDataTable,
  useDataTableInstance,
} from "../index"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Person = { id: string; name: string }

const people: Person[] = [
  { id: "1", name: "Mason" },
  { id: "2", name: "Lily" },
]

const columns = [{ accessorKey: "name", header: "Name" }]

function RowCount() {
  const table = useDataTableInstance<Person>()
  return <span>rows: {table.getRowModel().rows.length}</span>
}

describe("composition", () => {
  it("hands the instance to components inside the table", () => {
    function Harness() {
      const table = useDataTable<Person>({
        columns,
        data: people,
        getRowId: (row) => row.id,
        renderTopToolbarCustomActions: () => <RowCount />,
      })
      return <DataTable table={table} />
    }
    render(<Harness />)
    expect(screen.getByText("rows: 2")).toBeTruthy()
  })

  it("lets you lay out the exported parts yourself", () => {
    function Custom() {
      const table = useDataTable<Person>({
        columns,
        data: people,
        getRowId: (row) => row.id,
      })
      return (
        <DataTableProvider table={table}>
          <div>
            <DataTableGlobalFilter table={table} />
            <DataTableDensityToggle table={table} />
            <RowCount />
          </div>
          <DataTablePagination table={table} />
        </DataTableProvider>
      )
    }
    render(<Custom />)
    expect(screen.getByText("rows: 2")).toBeTruthy()
    expect(screen.getByRole("button", { name: /density/i })).toBeTruthy()
  })

  it("explains when the hook is used outside a table", () => {
    expect(() => render(<RowCount />)).toThrow(/inside <DataTable>/)
  })
})
