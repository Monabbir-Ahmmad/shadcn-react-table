"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"

import type { DataTableInstance } from "../core/types"
import { useTableStateListener } from "./use-table-state"

interface PageResetParams {
  enablePagination: boolean
  manualPagination?: boolean
  autoResetPageIndex?: boolean
}

const filtersKey = <TData extends RowData>(table: DataTableInstance<TData>) => {
  const { columnFilters, globalFilter, advancedFilter } = table.getState()
  return JSON.stringify([columnFilters, globalFilter, advancedFilter])
}

/**
 * Goes back to the first page when the filters change (column filters, global
 * search or the advanced filter; MRT behaviour), replacing TanStack's
 * render-phase auto-reset (which warns in React 19 dev). Listens to the table
 * store, so it works whether or not the component holding the table
 * re-renders. Skipped under manual pagination (the server owns it) and when
 * the consumer opted into the native auto-reset.
 */
export function usePageResetOnFilterChange<TData extends RowData>(
  table: DataTableInstance<TData>,
  { enablePagination, manualPagination, autoResetPageIndex }: PageResetParams
): void {
  const prevKeyRef = React.useRef<string | null>(null)
  useTableStateListener(table, () => {
    const key = filtersKey(table)
    const prevKey = prevKeyRef.current
    prevKeyRef.current = key
    if (prevKey === null || prevKey === key) return
    if (enablePagination && !manualPagination && autoResetPageIndex == null) {
      if (table.getState().pagination.pageIndex !== 0) table.setPageIndex(0)
    }
  })
  // The starting filters, so the first change is compared against them.
  React.useEffect(() => {
    if (prevKeyRef.current === null) prevKeyRef.current = filtersKey(table)
  }, [table])
}
