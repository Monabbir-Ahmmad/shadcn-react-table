import * as React from "react"
import { createRoot } from "react-dom/client"
import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { DataTableInstance } from "../core/types"
import { usePageResetOnFilterChange } from "./use-page-reset-on-filter-change"

interface StubState {
  columnFilters: { id: string; value: unknown }[]
  globalFilter: unknown
}

function makeTable() {
  const state: StubState = { columnFilters: [], globalFilter: undefined }
  const setPageIndex = vi.fn()
  const table = {
    getState: () => ({ ...state }),
    setPageIndex,
  } as unknown as DataTableInstance<unknown>
  return { table, state, setPageIndex }
}

const defaultParams = {
  enablePagination: true,
  manualPagination: false,
  autoResetPageIndex: undefined,
}

describe("usePageResetOnFilterChange", () => {
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
      const { table, setPageIndex } = makeTable()

      function Harness() {
        usePageResetOnFilterChange(table, defaultParams)
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
      // Wait for passive effects (mount → cleanup → remount) to flush.
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(setPageIndex).not.toHaveBeenCalled()
      root.unmount()
      container.remove()
    })
  })

  it("resets to the first page when a column filter changes", () => {
    const { table, state, setPageIndex } = makeTable()
    const { rerender } = renderHook(() =>
      usePageResetOnFilterChange(table, defaultParams)
    )
    state.columnFilters = [{ id: "name", value: "a" }]
    rerender()
    expect(setPageIndex).toHaveBeenCalledTimes(1)
    expect(setPageIndex).toHaveBeenCalledWith(0)
  })

  it("resets to the first page when the global filter changes", () => {
    const { table, state, setPageIndex } = makeTable()
    const { rerender } = renderHook(() =>
      usePageResetOnFilterChange(table, defaultParams)
    )
    state.globalFilter = "search"
    rerender()
    expect(setPageIndex).toHaveBeenCalledWith(0)
  })

  it("does not reset on a plain mount", () => {
    const { table, setPageIndex } = makeTable()
    renderHook(() => usePageResetOnFilterChange(table, defaultParams))
    expect(setPageIndex).not.toHaveBeenCalled()
  })

  it("skips the reset under manual pagination", () => {
    const { table, state, setPageIndex } = makeTable()
    const { rerender } = renderHook(() =>
      usePageResetOnFilterChange(table, {
        ...defaultParams,
        manualPagination: true,
      })
    )
    state.columnFilters = [{ id: "name", value: "a" }]
    rerender()
    expect(setPageIndex).not.toHaveBeenCalled()
  })

  it("skips the reset when the consumer opted into native auto-reset", () => {
    const { table, state, setPageIndex } = makeTable()
    const { rerender } = renderHook(() =>
      usePageResetOnFilterChange(table, {
        ...defaultParams,
        autoResetPageIndex: true,
      })
    )
    state.columnFilters = [{ id: "name", value: "a" }]
    rerender()
    expect(setPageIndex).not.toHaveBeenCalled()
  })
})
