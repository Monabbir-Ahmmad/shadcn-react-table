"use client"

import * as React from "react"
import type { ColumnDef, RowData } from "@tanstack/react-table"

import { cn } from "@monabbir/tablecn/lib/utils"

import type { DataTableIcons, IconComponent } from "./icons"
import type { DataTableLocalization } from "./localization"

export const ROW_NUMBER_COLUMN_ID = "cn-row-number"
export const ROW_DRAG_COLUMN_ID = "cn-row-drag"
export const EXPAND_COLUMN_ID = "cn-expand"

/** Expand/collapse column for detail panels and tree (sub-row) expansion. */
export function createExpandColumn<TData extends RowData>(
  localization: DataTableLocalization,
  icons: DataTableIcons
): ColumnDef<TData> {
  return {
    id: EXPAND_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableResizing: false,
    size: 44,
    minSize: 44,
    meta: { disableColumnActions: true },
    header: ({ table }) =>
      table.getCanSomeRowsExpand() ? (
        <button
          type="button"
          aria-label={localization.expandAll}
          onClick={table.getToggleAllRowsExpandedHandler()}
          className="flex items-center justify-center text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {table.getIsAllRowsExpanded() ? (
            <icons.expanded className="size-4" />
          ) : (
            <icons.collapsed className="size-4" />
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
          onClick={row.getToggleExpandedHandler()}
          className="flex items-center justify-center text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {row.getIsExpanded() ? (
            <icons.expanded className="size-4" />
          ) : (
            <icons.collapsed className="size-4" />
          )}
        </button>
      )
    },
  }
}

/** dnd-kit activator props for the current row's drag handle. */
export interface RowDragHandleProps {
  attributes: Record<string, unknown>
  listeners: Record<string, unknown> | undefined
  setActivatorNodeRef: (el: HTMLElement | null) => void
}

export const RowDragContext = React.createContext<RowDragHandleProps | null>(
  null
)

/** Drag-handle column for row ordering. The handle reads dnd-kit props from
 *  {@link RowDragContext}, set by the sortable row wrapper. */
export function createRowDragHandleColumn<TData extends RowData>(
  localization: DataTableLocalization,
  icons: DataTableIcons
): ColumnDef<TData> {
  return {
    id: ROW_DRAG_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableResizing: false,
    size: 40,
    minSize: 40,
    meta: { disableColumnActions: true, align: "center" },
    header: () => null,
    cell: () => (
      <RowDragHandle label={localization.reorderRow} Icon={icons.dragHandle} />
    ),
  }
}

function RowDragHandle({
  label,
  Icon,
}: {
  label: string
  Icon: IconComponent
}) {
  const ctx = React.useContext(RowDragContext)
  return (
    <button
      type="button"
      aria-label={label}
      ref={ctx?.setActivatorNodeRef}
      suppressHydrationWarning
      {...(ctx?.attributes ?? {})}
      {...(ctx?.listeners ?? {})}
      className="flex cursor-grab items-center justify-center text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 active:cursor-grabbing"
    >
      <Icon className="size-4" />
    </button>
  )
}

/** Row-number column. `static` numbers track the current view (page-aware);
 *  `original` uses the stable source index. Optionally shows a pin toggle. */
export function createRowNumberColumn<TData extends RowData>(
  localization: DataTableLocalization,
  mode: "static" | "original",
  enableRowPinning: boolean,
  icons: DataTableIcons
): ColumnDef<TData> {
  return {
    id: ROW_NUMBER_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableResizing: false,
    size: 56,
    minSize: 48,
    meta: { disableColumnActions: true, align: "center", label: "#" },
    header: () => <span className="text-muted-foreground">#</span>,
    cell: ({ row, table }) => {
      const number =
        mode === "original"
          ? row.index + 1
          : table.getRowModel().rows.indexOf(row) +
            1 +
            table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize

      if (!enableRowPinning) {
        return (
          <span className="text-xs tabular-nums text-muted-foreground">
            {number}
          </span>
        )
      }

      const pinned = row.getIsPinned()
      return (
        <span className="group/rownum relative flex items-center justify-center">
          <span
            className={cn(
              "text-xs tabular-nums text-muted-foreground",
              "group-hover/rownum:opacity-0"
            )}
          >
            {number}
          </span>
          <button
            type="button"
            aria-label={pinned ? localization.unpinRow : localization.pinRow}
            onClick={() => row.pin(pinned ? false : "top")}
            className={cn(
              "absolute inset-0 flex items-center justify-center text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover/rownum:opacity-100",
              pinned && "text-primary opacity-100"
            )}
          >
            {pinned ? (
              <icons.pinnedRow className="size-3.5" />
            ) : (
              <icons.pin className="size-3.5" />
            )}
          </button>
        </span>
      )
    },
  }
}
