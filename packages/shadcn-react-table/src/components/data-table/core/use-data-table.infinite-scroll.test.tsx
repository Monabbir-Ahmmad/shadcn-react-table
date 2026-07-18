import { getCoreRowModel } from "@tanstack/react-table"
import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useDataTable } from "./use-data-table"

const columns = [{ accessorKey: "name", header: "Name" }]
const data = [{ name: "a" }, { name: "b" }]

function render(options: Record<string, unknown> = {}) {
  return renderHook(() =>
    useDataTable({
      columns,
      data,
      getCoreRowModel: getCoreRowModel(),
      ...options,
    })
  )
}

describe("useDataTable — infinite scroll wiring", () => {
  it("forces pagination off when enableInfiniteScroll is on", () => {
    const { result } = render({ enableInfiniteScroll: true })
    expect(result.current.tableInstance.enableInfiniteScroll).toBe(true)
    // Auto-hide pager: a single growing page renders every appended row.
    expect(result.current.tableInstance.enablePagination).toBe(false)
  })

  it("leaves pagination on by default (no infinite scroll)", () => {
    const { result } = render()
    expect(result.current.tableInstance.enableInfiniteScroll).toBe(false)
    expect(result.current.tableInstance.enablePagination).toBe(true)
  })

  it("passes the controlled fetch flags and default threshold through", () => {
    const { result } = render({
      enableInfiniteScroll: true,
      hasNextPage: true,
      isFetchingNextPage: true,
    })
    const instance = result.current.tableInstance
    expect(instance.hasNextPage).toBe(true)
    expect(instance.isFetchingNextPage).toBe(true)
    expect(instance.infiniteScrollThreshold).toBe(200)
  })

  it("honors an explicit infiniteScrollThreshold", () => {
    const { result } = render({
      enableInfiniteScroll: true,
      infiniteScrollThreshold: 500,
    })
    expect(result.current.tableInstance.infiniteScrollThreshold).toBe(500)
  })
})
