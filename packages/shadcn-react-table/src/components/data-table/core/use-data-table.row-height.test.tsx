import { getCoreRowModel } from "@tanstack/react-table"
import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { resolveRowHeight } from "../helpers/resolve-row-height"
import { useDataTable } from "./use-data-table"

const columns = [{ accessorKey: "name", header: "Name" }]
const data = [{ name: "a" }, { name: "b" }]

function render(options: Record<string, unknown> = {}) {
  return renderHook(() =>
    useDataTable({
      columns,
      data,
      getRowId: (row) => row.id,
      getCoreRowModel: getCoreRowModel(),
      ...options,
    })
  )
}

describe("useDataTable — row height wiring", () => {
  it("exposes rowHeight and getRowHeight on the instance", () => {
    const getRowHeight = () => "auto" as const
    const { result } = render({ rowHeight: 64, getRowHeight })
    expect(result.current.tableInstance.rowHeight).toBe(64)
    expect(result.current.tableInstance.getRowHeight).toBe(getRowHeight)
  })

  it("leaves both undefined by default", () => {
    const { result } = render()
    expect(result.current.tableInstance.rowHeight).toBeUndefined()
    expect(result.current.tableInstance.getRowHeight).toBeUndefined()
  })

  it("resolves real rows through the exposed options", () => {
    const { result } = render({
      getRowHeight: (row: { original: { name: string } }) =>
        row.original.name === "a" ? "auto" : 40,
    })
    const instance = result.current.tableInstance
    const rows = result.current.getRowModel().rows
    expect(
      resolveRowHeight(rows[0]!, {
        rowHeight: instance.rowHeight,
        getRowHeight: instance.getRowHeight,
      })
    ).toBe("auto")
    expect(
      resolveRowHeight(rows[1]!, {
        rowHeight: instance.rowHeight,
        getRowHeight: instance.getRowHeight,
      })
    ).toBe(40)
  })
})
