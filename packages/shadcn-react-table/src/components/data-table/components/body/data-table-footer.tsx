"use client"

import type * as React from "react"

import { flexRender, type RowData } from "@tanstack/react-table"

import {
  TableCell,
  TableFooter,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import {
  ALIGN_CELL,
  CELL_PADDING_Y,
  FOOTER_CELL_CLASS,
} from "../../core/constants"
import type { DataTableInstance } from "../../core/types"
import { getDataRowCount, getHeaderRowCount } from "../../helpers/grid-rows"
import type {
  VirtualHeaderLayout,
  WithHeaderSpacers,
} from "../../hooks/use-table-virtualizers"
import {
  getColumnDragStyle,
  getColumnPinningClass,
  getColumnPinningStyle,
  getWidthStyle,
} from "../../utils/column-styles"
import type { DataTableHeader } from "../../core/table-types"
import { dt } from "../../core/internal"
import { getSlotProps, mergeProps } from "../../helpers/slot-props"

interface DataTableFooterProps<TData extends RowData> {
  table: DataTableInstance<TData>
  withHeaderSpacers: WithHeaderSpacers
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
  withHeaderSpacers,
}: DataTableFooterProps<TData>) {
  const {
    enableColumnVirtualization,
    enableStickyFooter,
    enableKeyboardNavigation,
    refs,
  } = dt(table)
  const padding = CELL_PADDING_Y

  return (
    <TableFooter
      {...mergeProps(
        {
          // Forwarding the exposed DOM ref object as a JSX ref.
          ref: refs.tableFooterRef,
          className: cn(enableStickyFooter && "sticky bottom-0 z-20"),
        } as React.ComponentProps<"tfoot">,
        getSlotProps(table, "footer", {})
      )}
    >
      {table.getFooterGroups().map((footerGroup, index) => (
        <TableRow
          key={footerGroup.id}
          {...mergeProps(
            {
              // Grid row position, after the header and data rows.
              "aria-rowindex": enableKeyboardNavigation
                ? getHeaderRowCount(table) + getDataRowCount(table) + index + 1
                : undefined,
              className: "hover:bg-transparent",
            } as React.ComponentProps<"tr">,
            getSlotProps(table, "footerRow", { footerGroup })
          )}
        >
          {enableColumnVirtualization
            ? withHeaderSpacers(
                footerGroup.headers,
                renderFooterCell,
                `footer-${footerGroup.id}`
              )
            : footerGroup.headers.map((header) => renderFooterCell(header))}
        </TableRow>
      ))}
    </TableFooter>
  )

  function renderFooterCell(
    header: DataTableHeader<TData, unknown>,
    layout?: VirtualHeaderLayout
  ) {
    return (
      <TableCell
        key={layout?.key ?? header.id}
        {...mergeProps(
          {
            colSpan: layout?.colSpan ?? header.colSpan,
            style: {
              ...(layout?.widthStyle ?? getWidthStyle(header.column, table)),
              ...getColumnPinningStyle(header.column),
              // Follows its header while the column is dragged.
              ...(dt(table).enableColumnOrdering &&
                getColumnDragStyle(
                  header.column.id,
                  getColumnPinningStyle(header.column).zIndex as
                    number | undefined
                )),
            },
            className: cn(
              FOOTER_CELL_CLASS,
              padding,
              ALIGN_CELL[header.column.columnDef.meta?.align ?? "left"],
              getColumnPinningClass(header.column)
            ),
          } as React.ComponentProps<"td">,
          getSlotProps(
            table,
            "footerCell",
            { header, column: header.column },
            header.column.columnDef.meta?.slotProps?.footerCell
          )
        )}
      >
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.footer, {
              ...header.getContext(),
              table,
            })}
      </TableCell>
    )
  }
}
