import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { getColumnPinningStyle } from "../utils/column-styles"
import type { DataTableColumnDef } from "./table-types"
import type { UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

// Behaviour lock for the TanStack engine. Uses only our public hook and
// instance members that keep their names across TanStack majors, so it runs
// unchanged before and after an engine upgrade.

type Person = {
  id: string
  name: string
  dept: string
  age: number
  salary: number
  children?: Person[]
}

const people: Person[] = [
  { id: "1", name: "Joanna", dept: "eng", age: 41, salary: 100 },
  { id: "2", name: "Annabel", dept: "eng", age: 29, salary: 80 },
  { id: "3", name: "Ann", dept: "ops", age: 35, salary: 60 },
  { id: "4", name: "Bob", dept: "ops", age: 52, salary: 40 },
]

const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name", meta: { filterMode: "contains" } },
  { accessorKey: "dept", header: "Dept" },
  { accessorKey: "age", header: "Age" },
  { accessorKey: "salary", header: "Salary", aggregationFn: "sum" },
]

type Options = Partial<UseDataTableOptions<Person>>

function setup(options: Options = {}) {
  return renderHook(() =>
    useDataTable<Person>({
      columns,
      data: people,
      getRowId: (row) => row.id,
      ...options,
    })
  )
}

const ids = (rows: { id: string }[]) => rows.map((row) => row.id)

describe("useDataTable engine behaviour", () => {
  it("renders every row in data order by default", () => {
    const { result } = setup()
    expect(ids(result.current.getRowModel().rows)).toEqual(["1", "2", "3", "4"])
  })

  it("sorts client-side", () => {
    const { result } = setup()
    act(() => result.current.setSorting([{ id: "age", desc: false }]))
    expect(ids(result.current.getRowModel().rows)).toEqual(["2", "3", "1", "4"])
  })

  it("filters a column by its mode and re-filters when the mode changes", () => {
    const { result } = setup()
    act(() => result.current.getColumn("name")!.setFilterValue("ann"))
    expect(ids(result.current.getRowModel().rows)).toEqual(["1", "2", "3"])

    // Switching mode clears the value, then the new mode applies.
    act(() =>
      result.current.tableInstance.setColumnFilterMode("name", "startsWith")
    )
    expect(ids(result.current.getRowModel().rows)).toEqual(["1", "2", "3", "4"])
    act(() => result.current.getColumn("name")!.setFilterValue("ann"))
    expect(ids(result.current.getRowModel().rows)).toEqual(["2", "3"])
  })

  it("global fuzzy search keeps data order when ranking is off", () => {
    const { result } = setup()
    act(() => result.current.setGlobalFilter("ann"))
    expect(ids(result.current.getRowModel().rows)).toEqual(["1", "2", "3"])
  })

  it("global fuzzy search orders by match rank when ranking is on", () => {
    const { result } = setup({ enableGlobalFilterRankedResults: true })
    act(() => result.current.setGlobalFilter("ann"))
    // equal > starts-with > contains
    expect(ids(result.current.getRowModel().rows)).toEqual(["3", "2", "1"])
  })

  it("re-filters when the global filter mode changes", () => {
    const { result } = setup()
    act(() => result.current.setGlobalFilter("ann"))
    act(() => result.current.tableInstance.setGlobalFilterMode("startsWith"))
    expect(ids(result.current.getRowModel().rows)).toEqual(["2", "3"])
  })

  it("applies the advanced filter group", () => {
    const { result } = setup({ enableAdvancedFilter: true })
    act(() =>
      result.current.tableInstance.setAdvancedFilter({
        logic: "and",
        rules: [
          { id: "r1", columnId: "age", operator: "greaterThan", value: 40 },
        ],
      })
    )
    expect(ids(result.current.getRowModel().rows)).toEqual(["1", "4"])
  })

  it("paginates client-side, and shows every row when pagination is off", () => {
    const initialState = { pagination: { pageIndex: 0, pageSize: 2 } }
    expect(
      ids(setup({ initialState }).result.current.getRowModel().rows)
    ).toEqual(["1", "2"])
    expect(
      ids(
        setup({
          initialState,
          enablePagination: false,
        }).result.current.getRowModel().rows
      )
    ).toEqual(["1", "2", "3", "4"])
  })

  it("computes faceted values, and skips them when faceting is off or manual", () => {
    const on = setup().result.current
    expect(
      Object.fromEntries(on.getColumn("dept")!.getFacetedUniqueValues())
    ).toEqual({
      eng: 2,
      ops: 2,
    })
    expect(on.getColumn("age")!.getFacetedMinMaxValues()).toEqual([29, 52])

    const off = setup({ enableFacetedValues: false }).result.current
    expect(off.getColumn("dept")!.getFacetedUniqueValues().size).toBe(0)
    expect(off.getColumn("age")!.getFacetedMinMaxValues()).toBeUndefined()

    const manual = setup({ manualFiltering: true }).result.current
    expect(manual.getColumn("dept")!.getFacetedUniqueValues().size).toBe(0)
  })

  it("groups and aggregates only when grouping is enabled", () => {
    const initialState = { grouping: ["dept"] }
    const grouped = setup({ enableGrouping: true, initialState }).result.current
    const rows = grouped.getRowModel().rows
    expect(rows).toHaveLength(2)
    expect(rows.every((row) => row.getIsGrouped())).toBe(true)
    const eng = rows.find((row) => row.getValue("dept") === "eng")!
    expect(eng.getValue("salary")).toBe(180)

    const flat = setup({ initialState }).result.current
    expect(ids(flat.getRowModel().rows)).toEqual(["1", "2", "3", "4"])
  })

  it("expands tree data from getSubRows", () => {
    const tree: Person[] = [
      {
        id: "t1",
        name: "Root",
        dept: "eng",
        age: 50,
        salary: 1,
        children: [{ id: "t2", name: "Leaf", dept: "eng", age: 20, salary: 1 }],
      },
      { id: "t3", name: "Solo", dept: "ops", age: 30, salary: 1 },
    ]
    const base = { data: tree, getSubRows: (row: Person) => row.children }
    expect(ids(setup(base).result.current.getRowModel().rows)).toEqual([
      "t1",
      "t3",
    ])
    expect(
      ids(
        setup({
          ...base,
          initialState: { expanded: true },
        }).result.current.getRowModel().rows
      )
    ).toEqual(["t1", "t2", "t3"])
  })

  it("pins rows to the top", () => {
    const { result } = setup({ enableRowPinning: true })
    act(() => result.current.getRow("3").pin("top"))
    expect(ids(result.current.getTopRows())).toEqual(["3"])
    expect(ids(result.current.getCenterRows())).toEqual(["1", "2", "4"])
  })

  it("pins columns left/right from initialState and reports left/right state", () => {
    const { result } = setup({
      enableColumnPinning: true,
      initialState: { columnPinning: { left: ["name"], right: ["salary"] } },
    })
    const table = result.current
    expect(getColumnPinningStyle(table.getColumn("name")!)).toMatchObject({
      position: "sticky",
      left: 0,
    })
    expect(getColumnPinningStyle(table.getColumn("salary")!)).toMatchObject({
      position: "sticky",
      right: 0,
    })
    expect(table.getColumn("age")!.getIsPinned()).toBeFalsy()
    expect(table.getState().columnPinning).toEqual({
      left: ["name"],
      right: ["salary"],
    })
  })

  it("pins columns from controlled left/right state", () => {
    const table = setup({
      enableColumnPinning: true,
      state: { columnPinning: { left: ["age"], right: [] } },
    }).result.current
    expect(getColumnPinningStyle(table.getColumn("age")!)).toMatchObject({
      position: "sticky",
      left: 0,
    })
  })

  it("sizes columns and exposes resize info under columnSizingInfo", () => {
    const { result } = setup({ enableColumnResizing: true })
    act(() => result.current.setColumnSizing({ age: 400 }))
    expect(result.current.getColumn("age")!.getSize()).toBe(400)
    expect(result.current.getState().columnSizingInfo.isResizingColumn).toBe(
      false
    )
  })

  it("selects rows", () => {
    const { result } = setup({ enableRowSelection: true })
    act(() => result.current.getRow("2").toggleSelected(true))
    expect(ids(result.current.getSelectedRowModel().rows)).toEqual(["2"])
  })

  it("follows controlled left/right column pinning across rerenders", () => {
    const { result, rerender } = renderHook(
      ({ state }: { state: Options["state"] }) =>
        useDataTable<Person>({
          columns,
          data: people,
          getRowId: (row) => row.id,
          enableColumnPinning: true,
          state,
        }),
      {
        initialProps: {
          state: { columnPinning: { left: ["age"], right: [] } },
        },
      }
    )
    expect(
      getColumnPinningStyle(result.current.getColumn("age")!)
    ).toMatchObject({ position: "sticky", left: 0 })

    rerender({ state: { columnPinning: { left: ["name"], right: [] } } })
    expect(
      getColumnPinningStyle(result.current.getColumn("name")!)
    ).toMatchObject({ position: "sticky", left: 0 })
    expect(getColumnPinningStyle(result.current.getColumn("age")!)).toEqual({})
  })
})
