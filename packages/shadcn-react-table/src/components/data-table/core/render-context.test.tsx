import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { DataTableColumnDef } from "./table-types"
import { useDataTable } from "./use-data-table"

// Column renderers receive TanStack's render context. Its `table` must expose
// our members (`getState()` in our shape, `tableInstance`) both in the types
// (this file must typecheck) and at runtime, even when read straight off a
// cell's context rather than through our `flexRender` call sites.

type Person = { id: string; name: string }

const columns: DataTableColumnDef<Person>[] = [
  {
    accessorKey: "name",
    cell: ({ table }) =>
      `${table.getState().pagination.pageIndex}:${table.tableInstance.density}`,
  },
]

describe("render context table", () => {
  it("types and exposes our instance members on the context table", () => {
    const { result } = renderHook(() =>
      useDataTable<Person>({
        columns,
        data: [{ id: "1", name: "Ann" }],
        getRowId: (row) => row.id,
      })
    )
    const cell = result.current
      .getRow("1")
      .getAllCells()
      .find((c) => c.column.id === "name")!
    const context = cell.getContext()

    expect(context.table.getState().columnPinning).toEqual({
      left: [],
      right: [],
    })
    expect(context.table.tableInstance).toBe(result.current.tableInstance)

    const render = cell.column.columnDef.cell as (ctx: typeof context) => string
    expect(render(context)).toBe("0:comfortable")
  })
})
