"use client"

import type { RowData } from "@tanstack/react-table"

import { Button } from "@workspace/ui/components/button"

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
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={localization.expandAll}
          onClick={table.getToggleAllRowsExpandedHandler()}
        >
          {table.getIsAllRowsExpanded() ? (
            <icons.expanded />
          ) : (
            <icons.collapsed className="rtl:rotate-180" />
          )}
        </Button>
      ) : (
        <span className="sr-only">{localization.toggleRowExpanded}</span>
      ),
    cell: ({ row }) => {
      if (!row.getCanExpand()) return null
      return (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={localization.toggleRowExpanded}
          aria-expanded={row.getIsExpanded()}
          onClick={(event) => {
            stopPropagation(event)
            row.getToggleExpandedHandler()()
          }}
          onDoubleClick={stopPropagation}
        >
          {row.getIsExpanded() ? (
            <icons.expanded />
          ) : (
            <icons.collapsed className="rtl:rotate-180" />
          )}
        </Button>
      )
    },
  }
}
