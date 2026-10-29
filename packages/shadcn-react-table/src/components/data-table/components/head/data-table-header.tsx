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

import { DENSITY_CELL_PADDING } from "../../core/constants"
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
import type { DataTableHeader } from "../../core/table-types"

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
    density,
    enableColumnResizing,
    enableColumnVirtualization,
    enableColumnFilters,
    showColumnFilters,
    columnFilterDisplayMode,
    enableStickyHeader,
    refs,
  } = table.tableInstance

  const controls = headerControlsOptionsFromTable(table)
  const padding = DENSITY_CELL_PADDING[density]
  const leafColumnIds = table.getVisibleLeafColumns().map((c) => c.id)

  const anyFilterable = table
    .getAllColumns()
    .some((column) => column.getCanFilter())
  const filterRowVisible =
    enableColumnFilters &&
    showColumnFilters &&
    anyFilterable &&
    columnFilterDisplayMode === "subheader"

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
      colSpan={layout?.colSpan ?? header.colSpan}
      style={{
        ...(layout?.widthStyle ?? getWidthStyle(header.column, table)),
        ...getColumnPinningStyle(header.column),
      }}
      className={cn("bg-card", getColumnPinningClass(header.column))}
    >
      <DataTableColumnFilter header={header} table={table} />
    </TableHead>
  )

  return (
    <TableHeader
      // Forwarding the exposed DOM ref object as a JSX ref (not reading
      // .current during render).
      // eslint-disable-next-line react-hooks/refs
      ref={refs.tableHeadRef}
      className={cn(enableStickyHeader && "sticky top-0 z-20 bg-card")}
    >
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow
          key={headerGroup.id}
          className="group/th hover:bg-transparent"
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
        table
          .getHeaderGroups()
          .slice(-1)
          .map((headerGroup) => (
            <TableRow
              key={`${headerGroup.id}-filters`}
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
