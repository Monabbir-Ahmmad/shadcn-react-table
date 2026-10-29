"use client"

import type { RowData } from "@tanstack/react-table"

import type { DataTableIcons } from "../core/icons"
import type { DataTableLocalization } from "../core/localization"
import type { DataTableColumnDef } from "../core/table-types"
import { stopPropagation } from "../helpers/stop-propagation"
import { dt } from "../core/internal"

export const EXPAND_COLUMN_ID = "cn-expand"

/** Expand/collapse column for detail panels and tree (sub-row) expansion. */
export function createExpandColumn<TData extends RowData>(
  localization: DataTableLocalization,
  icons: DataTableIcons
): DataTableColumnDef<TData> {
  return {
    id: EXPAND_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableResizing: false,
    size: 44,
    minSize: 44,
    meta: { enableColumnActions: false },
    header: ({ table }) =>
      dt(table as never).enableExpandAll && table.getCanSomeRowsExpand() ? (
        <button
          type="button"
          aria-label={localization.expandAll}
          onClick={table.getToggleAllRowsExpandedHandler()}
          className="flex items-center justify-center text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {table.getIsAllRowsExpanded() ? (
            <icons.expanded className="size-4" />
          ) : (
            <icons.collapsed className="size-4 rtl:rotate-180" />
          )}
        </button>
      ) : null,
    cell: ({ row }) => {
      if (!row.getCanExpand()) return null
      return (
        <button
          type="button"
          aria-label={localization.toggleRowExpanded}
          aria-expanded={row.getIsExpanded()}
          onClick={(event) => {
            stopPropagation(event)
            row.getToggleExpandedHandler()()
          }}
          onDoubleClick={stopPropagation}
          className="flex items-center justify-center text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {row.getIsExpanded() ? (
            <icons.expanded className="size-4" />
          ) : (
            <icons.collapsed className="size-4 rtl:rotate-180" />
          )}
        </button>
      )
    },
  }
}
