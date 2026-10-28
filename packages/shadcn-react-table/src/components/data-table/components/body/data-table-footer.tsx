"use client"

import { flexRender, type RowData } from "@tanstack/react-table"
import type { VirtualItem } from "@tanstack/react-virtual"

import {
  TableCell,
  TableFooter,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import {
  ALIGN_CELL,
  DENSITY_CELL_PADDING,
  FOOTER_CELL_CLASS,
} from "../../core/constants"
import type { DataTableInstance } from "../../core/types"
import type { WithColumnSpacers } from "../../hooks/use-table-virtualizers"
import {
  getColumnPinningClass,
  getColumnPinningStyle,
  getWidthStyle,
} from "../../utils/column-styles"
import type { DataTableHeader } from "../../core/table-types"

interface DataTableFooterProps<TData extends RowData> {
  table: DataTableInstance<TData>
  virtualColumns: VirtualItem[]
  withColumnSpacers: WithColumnSpacers
}

/** Whether any leaf column defines a footer (controls whether a `<tfoot>` renders). */
export function hasFooter<TData extends RowData>(
  table: DataTableInstance<TData>
): boolean {
  return table.getAllLeafColumns().some((c) => c.columnDef.footer != null)
}

/**
 * The table `<tfoot>` (aggregation / footer cells). Stickiness is controlled by
 * `enableStickyFooter` (off by default), independent of whether a footer exists.
 */
export function DataTableFooter<TData extends RowData>({
  table,
  virtualColumns,
  withColumnSpacers,
}: DataTableFooterProps<TData>) {
  const { density, enableColumnVirtualization, enableStickyFooter, refs } =
    table.tableInstance
  const padding = DENSITY_CELL_PADDING[density]

  return (
    <TableFooter
      // Forwarding the exposed DOM ref object as a JSX ref (not reading
      // .current during render).
      // eslint-disable-next-line react-hooks/refs
      ref={refs.tableFooterRef}
      className={cn(enableStickyFooter && "sticky bottom-0 z-20")}
    >
      {table.getFooterGroups().map((footerGroup) => {
        const headers = enableColumnVirtualization
          ? (virtualColumns
              .map((vc) => footerGroup.headers[vc.index])
              .filter(Boolean) as DataTableHeader<TData, unknown>[])
          : footerGroup.headers
        const cells = headers.map((header) => (
          <TableCell
            key={header.id}
            colSpan={header.colSpan}
            style={{
              ...getWidthStyle(header.column, table),
              ...getColumnPinningStyle(header.column),
            }}
            className={cn(
              FOOTER_CELL_CLASS,
              padding,
              ALIGN_CELL[header.column.columnDef.meta?.align ?? "left"],
              getColumnPinningClass(header.column)
            )}
          >
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.footer, {
                  ...header.getContext(),
                  table,
                })}
          </TableCell>
        ))
        return (
          <TableRow key={footerGroup.id} className="hover:bg-transparent">
            {withColumnSpacers(cells, `footer-${footerGroup.id}`)}
          </TableRow>
        )
      })}
    </TableFooter>
  )
}
