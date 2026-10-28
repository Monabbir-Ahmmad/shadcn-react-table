"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"

import type { DataTableInstance } from "../core/types"

interface PageIndexClampParams {
  enablePagination: boolean
  manualPagination?: boolean
}

/**
 * Keeps `pageIndex` inside the available pages when the row count shrinks
 * (data refetched, rows deleted, filters narrowed) so the user is never left
 * on an empty page. Runs in an effect, not during render. Skipped under
 * manual pagination (the server owns the page).
 */
export function usePageIndexClamp<TData extends RowData>(
  table: DataTableInstance<TData>,
  { enablePagination, manualPagination }: PageIndexClampParams
): void {
  // Runs after every render but is a no-op on the first page, so the row count
  // (which computes the filtered/sorted row models) is only read when the user
  // is actually past page 0.
  React.useEffect(() => {
    if (!enablePagination || manualPagination) return
    const { pageIndex, pageSize } = table.getState().pagination
    if (pageIndex === 0) return
    const lastPage = Math.max(0, Math.ceil(table.getRowCount() / pageSize) - 1)
    if (pageIndex > lastPage) table.setPageIndex(lastPage)
  })
}
