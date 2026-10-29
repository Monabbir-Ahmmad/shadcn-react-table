import * as React from "react"
import { createRoot } from "react-dom/client"
import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import type { DataTableColumnDef } from "../core/table-types"
import type { DataTableInstance, UseDataTableOptions } from "../core/types"
import { useDataTable } from "../core/use-data-table"

type Person = { id: string; name: string }

const data: Person[] = Array.from({ length: 30 }, (_, i) => ({
  id: String(i),
  name: `name-${i}`,
}))
const columns: DataTableColumnDef<Person>[] = [{ accessorKey: "name" }]

/** A table on its third page (10 rows a page). */
const setup = (options: Partial<UseDataTableOptions<Person>> = {}) =>
  renderHook(() =>
    useDataTable<Person>({
      columns,
      data,
      getRowId: (r) => r.id,
      initialState: { pagination: { pageIndex: 2, pageSize: 10 } },
      ...options,
    })
  ).result

const pageIndex = (table: DataTableInstance<Person>) =>
  table.getState().pagination.pageIndex

describe("usePageResetOnFilterChange", () => {
  it("resets to the first page when a column filter changes", () => {
    const result = setup()
    act(() => result.current.getColumn("name")!.setFilterValue("name"))
    expect(pageIndex(result.current)).toBe(0)
  })

  it("resets to the first page when the global filter changes", () => {
    const result = setup()
    act(() => result.current.setGlobalFilter("name"))
    expect(pageIndex(result.current)).toBe(0)
  })

  it("resets to the first page when the advanced filter changes", () => {
    const result = setup({ enableAdvancedFilter: true })
    act(() =>
      result.current.tableInstance.setAdvancedFilter({
        logic: "and",
        rules: [
          { id: "r", columnId: "name", operator: "contains", value: "1" },
        ],
      })
    )
    expect(pageIndex(result.current)).toBe(0)
  })

  it("does not reset on a plain mount or a page change", () => {
    const result = setup()
    expect(pageIndex(result.current)).toBe(2)
    act(() => result.current.setPageIndex(1))
    expect(pageIndex(result.current)).toBe(1)
  })

  it("skips the reset under manual pagination", () => {
    const result = setup({ manualPagination: true, rowCount: 30 })
    act(() => result.current.getColumn("name")!.setFilterValue("name"))
    expect(pageIndex(result.current)).toBe(2)
  })

  it("skips the reset when the consumer opted into native auto-reset", () => {
    const result = setup({ autoResetPageIndex: false })
    act(() => result.current.getColumn("name")!.setFilterValue("name"))
    expect(pageIndex(result.current)).toBe(2)
  })

  describe("StrictMode mount (issue #11)", () => {
    // React only simulates the StrictMode effect remount (mount → cleanup →
    // remount) OUTSIDE act(), so this renders with a raw createRoot — same as
    // a real dev browser — instead of testing-library's act-wrapped helpers.
    let actEnvBefore: unknown

    beforeEach(() => {
      actEnvBefore = (globalThis as Record<string, unknown>)
        .IS_REACT_ACT_ENVIRONMENT
      ;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = false
    })

    afterEach(() => {
      ;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT =
        actEnvBefore
    })

    it("does not reset the page on StrictMode's double-invoked mount effect", async () => {
      let table!: DataTableInstance<Person>
      function Harness() {
        table = useDataTable<Person>({
          columns,
          data,
          getRowId: (r) => r.id,
          initialState: { pagination: { pageIndex: 2, pageSize: 10 } },
        })
        return null
      }

      const container = document.createElement("div")
      document.body.appendChild(container)
      const root = createRoot(container)
      root.render(
        <React.StrictMode>
          <Harness />
        </React.StrictMode>
      )
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(pageIndex(table)).toBe(2)
      root.unmount()
      container.remove()
    })
  })
})
