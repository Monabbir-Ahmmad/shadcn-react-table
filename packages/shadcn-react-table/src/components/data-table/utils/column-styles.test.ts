import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { DataTableColumnDef } from "../core/table-types"
import type { UseDataTableOptions } from "../core/types"
import { useDataTable } from "../core/use-data-table"
import {
  getColumnGrowVars,
  getColumnPinningStyle,
  getColumnWidthStyle,
  getWidthStyle,
} from "./column-styles"

type Row = { id: string; a: string; b: string; c: string; d: string }

const columns: DataTableColumnDef<Row>[] = [
  { accessorKey: "a", header: "A", size: 200 },
  { accessorKey: "b", header: "B", size: 200, meta: { grow: 3 } },
  { accessorKey: "c", header: "C", size: 200, meta: { grow: false } },
  { accessorKey: "d", header: "D", size: 200 },
]

function setup(options: Partial<UseDataTableOptions<Row>> = {}) {
  return renderHook(() =>
    useDataTable<Row>({
      columns,
      data: [],
      layoutMode: "grid",
      ...options,
    })
  ).result.current
}

describe("getColumnGrowVars", () => {
  it("shares the spare width by weight and totals it", () => {
    const vars = getColumnGrowVars(setup(), 1300)
    expect(vars).toEqual({
      "--table-grow": "500",
      "--col-a-grow": "100",
      "--col-b-grow": "300",
      "--col-d-grow": "100",
    })
  })

  it("adds the grown widths of the pinned columns before a pinned column", () => {
    const table = setup({
      enableColumnPinning: true,
      initialState: { columnPinning: { left: ["a", "b"], right: ["c", "d"] } },
    })
    const vars = getColumnGrowVars(table, 1300)
    expect(vars["--col-a-pin-grow"]).toBeUndefined()
    expect(vars["--col-b-pin-grow"]).toBe("100")
    expect(vars["--col-d-pin-grow"]).toBeUndefined()
    expect(vars["--col-c-pin-grow"]).toBe("100")
  })

  it("leaves resized columns and a full surface alone", () => {
    expect(getColumnGrowVars(setup(), 700)).toEqual({})
    const vars = getColumnGrowVars(
      setup({ initialState: { columnSizing: { a: 250 } } }),
      1250
    )
    expect(vars["--col-a-grow"]).toBeUndefined()
    expect(vars["--col-b-grow"]).toBe("300")
  })
})

describe("grid layout styles", () => {
  it("adds the column's share to its width", () => {
    const table = setup()
    expect(getWidthStyle(table.getColumn("a")!, table)).toEqual({
      width: "calc((var(--col-a-size) + var(--col-a-grow, 0)) * 1px)",
    })
    const noGrow = setup({ layoutMode: "grid-no-grow" })
    expect(getWidthStyle(noGrow.getColumn("a")!, noGrow)).toEqual(
      getColumnWidthStyle("a")
    )
  })

  it("adds the grown widths before a pinned column to its offset", () => {
    const table = setup({
      enableColumnPinning: true,
      initialState: { columnPinning: { left: ["a", "b"] } },
    })
    expect(getColumnPinningStyle(table.getColumn("b")!)).toMatchObject({
      insetInlineStart: "calc(200px + var(--col-b-pin-grow, 0) * 1px)",
    })
    const semantic = setup({
      layoutMode: "semantic",
      enableColumnPinning: true,
      initialState: { columnPinning: { left: ["a", "b"] } },
    })
    expect(getColumnPinningStyle(semantic.getColumn("b")!)).toMatchObject({
      insetInlineStart: 200,
    })
  })
})

describe("getColumnWidthStyle", () => {
  it("uses the id verbatim when it is a valid custom-property name", () => {
    expect(getColumnWidthStyle("first_name")).toEqual({
      width: "calc(var(--col-first_name-size) * 1px)",
    })
  })

  it("escapes spaces, dots and other punctuation", () => {
    expect(getColumnWidthStyle("first name.v2")).toEqual({
      width: "calc(var(--col-first_name_v2-size) * 1px)",
    })
  })

  it("keeps non-ASCII letters, which CSS names allow", () => {
    expect(getColumnWidthStyle("fødsel")).toEqual({
      width: "calc(var(--col-fødsel-size) * 1px)",
    })
    expect(getColumnWidthStyle("fødsel")).not.toEqual(
      getColumnWidthStyle("fådsel")
    )
  })
})
