"use client"

import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import type { RowData } from "@tanstack/react-table"
import * as React from "react"

import {
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { CELL_PADDING_Y } from "../../core/constants"
import type { DataTableInstance } from "../../core/types"
import {
  headerControlsOptionsFromTable,
  shouldShowColumnDragGrip,
} from "../../helpers/header-controls"
import type {
  VirtualHeaderLayout,
  WithHeaderSpacers,
} from "../../hooks/use-table-virtualizers"
import {
  getColumnPinningClass,
  getColumnPinningStyle,
  getWidthStyle,
} from "../../utils/column-styles"
import { DataTableHeadCell } from "../body/dnd"
import { DataTableColumnFilter } from "./data-table-column-filter"
import { DataTableColumnHeader } from "./data-table-column-header"
import { isFilterRowVisible } from "../../helpers/grid-rows"
import { getSlotProps, mergeProps } from "../../helpers/slot-props"
import type { DataTableHeader } from "../../core/table-types"
import { dt } from "../../core/internal"

interface DataTableHeaderProps<TData extends RowData> {
  table: DataTableInstance<TData>
  withHeaderSpacers: WithHeaderSpacers
}

/**
 * The table `<thead>`: the (optionally sticky) header-group rows and, when
 * enabled, the per-column filter subheader row. Honors column virtualization,
 * ordering (drag handles), pinning, and resizing.
 */
export function DataTableHeader<TData extends RowData>({
  table,
  withHeaderSpacers,
}: DataTableHeaderProps<TData>) {
  const {
    enableColumnResizing,
    enableColumnVirtualization,
    enableStickyHeader,
    enableKeyboardNavigation,
    refs,
  } = dt(table)

  const controls = headerControlsOptionsFromTable(table)
  const padding = CELL_PADDING_Y
  const leafColumnIds = table.getVisibleLeafColumns().map((c) => c.id)

  const filterRowVisible = isFilterRowVisible(table)
  const headerGroups = table.getHeaderGroups()
  // Grid row positions (keyboard navigation makes the table a grid).
  const rowIndex = (index: number) =>
    enableKeyboardNavigation ? index + 1 : undefined

  const renderHeadCell = (
    header: DataTableHeader<TData, unknown>,
    layout?: VirtualHeaderLayout
  ) => (
    <DataTableHeadCell
      key={layout?.key ?? header.id}
      header={header}
      table={table}
      colSpan={layout?.colSpan}
      // Draggable for reordering (column ordering) or to drag onto the group
      // zone (grouping) — the drag-end handler routes by the drop target. The
      // grip's presence drives the column's reserved width, so both read the
      // same predicate (see helpers/header-controls).
      draggable={shouldShowColumnDragGrip(header.column, controls)}
      resizable={enableColumnResizing}
      widthStyle={layout?.widthStyle ?? getWidthStyle(header.column, table)}
      padding={padding}
    >
      {header.isPlaceholder ? null : (
        <DataTableColumnHeader header={header} table={table} />
      )}
    </DataTableHeadCell>
  )

  const renderFilterCell = (
    header: DataTableHeader<TData, unknown>,
    layout?: VirtualHeaderLayout
  ) => (
    <TableHead
      key={layout?.key ?? header.id}
      {...mergeProps(
        {
          colSpan: layout?.colSpan ?? header.colSpan,
          style: {
            ...(layout?.widthStyle ?? getWidthStyle(header.column, table)),
            ...getColumnPinningStyle(header.column),
          },
          className: cn("bg-card", getColumnPinningClass(header.column)),
        } as React.ComponentProps<"th">,
        getSlotProps(
          table,
          "filterCell",
          { header, column: header.column },
          header.column.columnDef.meta?.slotProps?.filterCell
        )
      )}
    >
      <DataTableColumnFilter header={header} table={table} />
    </TableHead>
  )

  return (
    <TableHeader
      {...mergeProps(
        {
          // Forwarding the exposed DOM ref object as a JSX ref.
          ref: refs.tableHeadRef,
          className: cn(enableStickyHeader && "sticky top-0 z-20 bg-card"),
        } as React.ComponentProps<"thead">,
        getSlotProps(table, "head", {})
      )}
    >
      {headerGroups.map((headerGroup, index) => (
        <TableRow
          key={headerGroup.id}
          {...mergeProps(
            {
              "aria-rowindex": rowIndex(index),
              className: "group/th hover:bg-transparent",
            } as React.ComponentProps<"tr">,
            getSlotProps(table, "headRow", { headerGroup })
          )}
        >
          <SortableContext
            items={leafColumnIds}
            strategy={horizontalListSortingStrategy}
          >
            {enableColumnVirtualization
              ? withHeaderSpacers(
                  headerGroup.headers,
                  renderHeadCell,
                  `head-${headerGroup.id}`
                )
              : headerGroup.headers.map((header) => renderHeadCell(header))}
          </SortableContext>
        </TableRow>
      ))}

      {filterRowVisible &&
        // Only leaf columns filter; group header rows would render empty.
        headerGroups.slice(-1).map((headerGroup) => (
          <TableRow
            key={`${headerGroup.id}-filters`}
            aria-rowindex={rowIndex(headerGroups.length)}
            className="hover:bg-transparent"
          >
            {enableColumnVirtualization
              ? withHeaderSpacers(
                  headerGroup.headers,
                  renderFilterCell,
                  `filter-${headerGroup.id}`
                )
              : headerGroup.headers.map((header) => renderFilterCell(header))}
          </TableRow>
        ))}
    </TableHeader>
  )
}
