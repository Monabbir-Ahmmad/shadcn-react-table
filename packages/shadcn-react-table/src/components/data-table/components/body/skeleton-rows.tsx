"use client"

import type { RowData } from "@tanstack/react-table"
import type * as React from "react"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { TableCell, TableRow } from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { BODY_CELL_CLASS, NON_DATA_COLUMN_IDS } from "../../core/constants"
import type { DataTableColumn } from "../../core/table-types"
import type { DataTableInstance } from "../../core/types"
import { getPinSide } from "../../helpers/column-pinning"
import { getSlotProps, mergeProps } from "../../helpers/slot-props"
import {
  getColumnPinningClass,
  getColumnPinningStyle,
  getWidthStyle,
} from "../../utils/column-styles"

/** A stable 40–90% width for the bar in a row and column, so placeholder rows
 *  look like text of varying length and render the same on server and client. */
function barWidth(rowIndex: number, columnId: string): number {
  let hash = (rowIndex + 1) * 2654435761
  for (let i = 0; i < columnId.length; i++) {
    hash = Math.imul(hash ^ columnId.charCodeAt(i), 16777619)
  }
  return 40 + ((hash >>> 0) % 51)
}

/** The skeleton for one cell: a short square in the table's own columns
 *  (select, expand, actions…), a bar elsewhere. */
export function SkeletonBar<TData extends RowData>({
  table,
  column,
  rowIndex,
}: {
  table: DataTableInstance<TData>
  column: DataTableColumn<TData, unknown>
  rowIndex: number
}) {
  const square = NON_DATA_COLUMN_IDS.has(column.id)
  return (
    <Skeleton
      {...mergeProps(
        {
          className: square ? "size-4" : "h-4 max-w-full",
          style: square
            ? undefined
            : { width: `${barWidth(rowIndex, column.id)}%` },
        } as React.ComponentProps<"div">,
        getSlotProps(table, "skeleton", { column, rowIndex })
      )}
    />
  )
}

/**
 * Placeholder rows while the first data loads: one cell per visible column,
 * sized and pinned like the real cells, so the skeleton lines up with the
 * header. With column virtualization (only some columns render) each row is
 * one full-width cell instead.
 */
export function SkeletonRows<TData extends RowData>({
  table,
  rowCount,
  padding,
  virtualColumns,
}: {
  table: DataTableInstance<TData>
  rowCount: number
  padding: string
  virtualColumns: boolean
}) {
  const columns = table.getVisibleLeafColumns()
  return (
    <>
      {Array.from({ length: Math.max(1, rowCount) }, (_, rowIndex) => (
        <TableRow key={rowIndex} className="hover:bg-transparent">
          {virtualColumns ? (
            <TableCell colSpan={columns.length} className={padding}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ) : (
            columns.map((column) => (
              <TableCell
                key={column.id}
                data-pinned={getPinSide(column) || undefined}
                style={{
                  ...getWidthStyle(column, table),
                  ...getColumnPinningStyle(column),
                }}
                className={cn(
                  BODY_CELL_CLASS,
                  padding,
                  getColumnPinningClass(column)
                )}
              >
                <SkeletonBar
                  table={table}
                  column={column as DataTableColumn<TData, unknown>}
                  rowIndex={rowIndex}
                />
              </TableCell>
            ))
          )}
        </TableRow>
      ))}
    </>
  )
}
