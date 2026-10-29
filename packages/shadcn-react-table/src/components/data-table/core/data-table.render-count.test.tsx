import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import type { DataTableInstance, UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Row = { id: string; name: string; city: string }

const ROWS = 20

const data: Row[] = Array.from({ length: ROWS }, (_, i) => ({
  id: String(i + 1),
  name: `name-${i + 1}`,
  city: `city-${i + 1}`,
}))

/** Columns whose cell renderer counts how often body cells render. */
function makeColumns(renders: { count: number }) {
  const cell = ({ getValue }: { getValue: () => unknown }) => {
    renders.count++
    return String(getValue())
  }
  return [
    { accessorKey: "name", header: "Name", cell },
    { accessorKey: "city", header: "City", cell },
  ] as DataTableColumnDef<Row>[]
}

function Table({
  renders,
  onTable,
  ...options
}: Partial<UseDataTableOptions<Row>> & {
  renders: { count: number }
  onTable?: (table: DataTableInstance<Row>) => void
}) {
  const columns = React.useMemo(() => makeColumns(renders), [renders])
  const table = useDataTable<Row>({
    columns,
    data,
    getRowId: (row) => row.id,
    enablePagination: false,
    // Inline handlers, as consumers usually write them.
    onRowClick: () => {},
    ...options,
  })
  onTable?.(table)
  return <DataTable table={table} />
}

describe("body re-renders", () => {
  it("re-renders only the toggled row when selecting one row", () => {
    const renders = { count: 0 }
    render(<Table renders={renders} enableRowSelection />)
    renders.count = 0
    fireEvent.click(
      screen.getAllByRole("checkbox", { name: /select row/i })[3]!
    )
    // One row of two cells (a render may run twice in development).
    expect(renders.count).toBeGreaterThan(0)
    expect(renders.count).toBeLessThanOrEqual(4)
  })

  it("re-renders only the edited row when cell editing starts", () => {
    const renders = { count: 0 }
    let table!: DataTableInstance<Row>
    render(
      <Table
        renders={renders}
        enableEditing
        editDisplayMode="cell"
        onTable={(t) => (table = t)}
      />
    )
    renders.count = 0
    act(() =>
      table.tableInstance.setEditingCell({ rowId: "5", columnId: "city" })
    )
    expect(renders.count).toBeLessThanOrEqual(4)
    expect(screen.getByRole("textbox")).toBeTruthy()
  })

  it("re-renders every row when something table-wide changes", () => {
    const renders = { count: 0 }
    let table!: DataTableInstance<Row>
    render(<Table renders={renders} onTable={(t) => (table = t)} />)
    renders.count = 0
    act(() => table.tableInstance.setDensity("compact"))
    expect(renders.count).toBeGreaterThanOrEqual(ROWS * 2)
  })

  it("calls the latest row click handler from a skipped row", () => {
    const renders = { count: 0 }
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(<Table renders={renders} onRowClick={first} />)
    rerender(<Table renders={renders} onRowClick={second} />)
    fireEvent.click(screen.getByText("name-2"))
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })
})
