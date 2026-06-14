"use client"

import type { RowData } from "@tanstack/react-table"

import { cn } from "@monabbir/tablecn/lib/utils"

import { DataTableExportMenu } from "./data-table-export-menu"
import { DataTableGlobalFilter } from "./data-table-global-filter"
import {
  DataTableDensityToggle,
  DataTableFilterToggle,
  DataTableFullscreenToggle,
} from "./data-table-toolbar-controls"
import { DataTableViewOptions } from "./data-table-view-options"
import type { DataTableInstance } from "./types"

/**
 * Top toolbar. Left region: title slot + consumer toolbar actions. Right
 * region: the MRT-ordered icon cluster (global search → filters funnel →
 * column visibility → density → full screen).
 */
export function DataTableToolbar<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const {
    title,
    renderToolbarActions,
    enableColumnFilters,
    enableColumnActions,
    enableExport,
    exportFileName,
  } = table.cnTable

  const anyFilterable = table
    .getAllColumns()
    .some((column) => column.getCanFilter())

  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <div className="flex min-h-9 flex-1 flex-wrap items-center gap-2">
        {title != null && (
          <div className="text-sm font-semibold tracking-wide">{title}</div>
        )}
        {renderToolbarActions?.({ table })}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <DataTableGlobalFilter table={table} />
        {enableColumnFilters && anyFilterable && (
          <DataTableFilterToggle table={table} />
        )}
        {enableColumnActions && <DataTableViewOptions table={table} />}
        {enableExport && (
          <DataTableExportMenu table={table} fileName={exportFileName} />
        )}
        <DataTableDensityToggle table={table} />
        <DataTableFullscreenToggle table={table} />
      </div>
    </div>
  )
}

/**
 * Selection alert banner shown between the toolbar and the table when any rows
 * are selected: a muted strip with the localized count and a Clear action.
 */
export function DataTableAlertBanner<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const { localization, enableRowSelection } = table.cnTable
  if (!enableRowSelection) return null

  const selectedCount = table.getSelectedRowModel().rows.length
  if (selectedCount === 0) return null

  const totalCount = table.getPrePaginationRowModel().rows.length

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-md border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground"
      )}
      role="status"
    >
      <span>{localization.rowsSelected(selectedCount, totalCount)}</span>
      <button
        type="button"
        onClick={() => table.resetRowSelection()}
        className="font-semibold tracking-wide text-foreground underline-offset-4 hover:underline"
      >
        {localization.clearSelection}
      </button>
    </div>
  )
}
