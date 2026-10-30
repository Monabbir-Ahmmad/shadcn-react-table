"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"

import type { DataTableInstance } from "../core/types"
import { useTableStateListener } from "./use-table-state"

interface PageIndexClampParams {
  enablePagination: boolean
  manualPagination?: boolean
  isLoading: boolean
  showSkeletons: boolean
}

/**
 * Keeps `pageIndex` inside the available pages when the row count shrinks
 * (data refetched, rows deleted, filters narrowed) so the user is never left
 * on an empty page. Runs in an effect, not during render. Skipped under
 * manual pagination (the server owns the page) and while loading (an empty
 * `data` during a refetch must not drop the user to the first page).
 */
export function usePageIndexClamp<TData extends RowData>(
  table: DataTableInstance<TData>,
  {
    enablePagination,
    manualPagination,
    isLoading,
    showSkeletons,
  }: PageIndexClampParams
): void {
  // A no-op on the first page, so the row count (which computes the
  // filtered/sorted row models) is only read when the user is past page 0.
  const clamp = () => {
    if (!enablePagination || manualPagination || isLoading || showSkeletons)
      return
    const { pageIndex, pageSize } = table.getState().pagination
    if (pageIndex === 0) return
    const lastPage = Math.max(0, Math.ceil(table.getRowCount() / pageSize) - 1)
    if (pageIndex > lastPage) table.setPageIndex(lastPage)
  }
  // After renders of the component holding the table (new data), and after
  // state changes (narrower filters), which may not re-render it.
  React.useEffect(clamp)
  useTableStateListener(table, clamp)
}
