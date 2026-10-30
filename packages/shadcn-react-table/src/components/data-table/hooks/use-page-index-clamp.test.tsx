import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { DataTableColumnDef } from "../core/table-types"
import { useDataTable } from "../core/use-data-table"

type Person = { id: string; name: string }
const columns: DataTableColumnDef<Person>[] = [{ accessorKey: "name" }]
const make = (n: number): Person[] =>
  Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    name: `P${i + 1}`,
  }))

describe("page index clamp", () => {
  it("moves to the last page when data shrinks below the current page", () => {
    const { result, rerender } = renderHook(
      ({ data }) =>
        useDataTable<Person>({
          columns,
          data,
          getRowId: (r) => r.id,
          initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
        }),
      { initialProps: { data: make(25) } }
    )
    act(() => result.current.setPageIndex(2))
    expect(result.current.getState().pagination.pageIndex).toBe(2)

    rerender({ data: make(15) })
    expect(result.current.getState().pagination.pageIndex).toBe(1)
    expect(result.current.getRowModel().rows).toHaveLength(5)
  })

  it("goes to page 0 when there are no rows", () => {
    const { result, rerender } = renderHook(
      ({ data }) =>
        useDataTable<Person>({ columns, data, getRowId: (r) => r.id }),
      { initialProps: { data: make(25) } }
    )
    act(() => result.current.setPageIndex(2))
    rerender({ data: [] })
    expect(result.current.getState().pagination.pageIndex).toBe(0)
  })

  it("leaves the page alone under manual pagination", () => {
    const { result, rerender } = renderHook(
      ({ data }) =>
        useDataTable<Person>({
          columns,
          data,
          getRowId: (r) => r.id,
          manualPagination: true,
          rowCount: 25,
        }),
      { initialProps: { data: make(10) } }
    )
    act(() => result.current.setPageIndex(5))
    rerender({ data: make(5) })
    expect(result.current.getState().pagination.pageIndex).toBe(5)
  })

  it("leaves the page alone while loading", () => {
    const { result, rerender } = renderHook(
      ({ data, isLoading }) =>
        useDataTable<Person>({
          columns,
          data,
          getRowId: (r) => r.id,
          isLoading,
        }),
      { initialProps: { data: make(25), isLoading: false } }
    )
    act(() => result.current.setPageIndex(2))
    rerender({ data: [], isLoading: true })
    expect(result.current.getState().pagination.pageIndex).toBe(2)
    rerender({ data: make(25), isLoading: false })
    expect(result.current.getState().pagination.pageIndex).toBe(2)
  })
})
