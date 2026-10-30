"use client"

import type * as React from "react"

import { flexRender, type RowData } from "@tanstack/react-table"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

import { defaultIcons } from "../../core/icons"
import { MOTION_TIMING_CLASS } from "../../core/motion"
import type { DataTableInstance } from "../../core/types"
import { getColumnLabel } from "../../helpers/column-label"
import {
  headerControlsOptionsFromTable,
  shouldShowColumnActions,
  shouldShowColumnFilterButton,
} from "../../helpers/header-controls"
import { ColumnDragHandle } from "../body/dnd"
import { DataTableColumnActions } from "../menus/data-table-column-actions"
import { DataTableColumnFilter } from "./data-table-column-filter"
import type { DataTableHeader } from "../../core/table-types"
import { dt } from "../../core/internal"

interface DataTableColumnHeaderProps<TData extends RowData, TValue> {
  header: DataTableHeader<TData, TValue>
  table: DataTableInstance<TData>
}

// Right alignment reverses the row so the label hugs the right edge with its
// controls on the inside; a reversed main axis starts on the right.
const ALIGN_CLASS = {
  left: "justify-start text-start",
  center: "justify-center text-center",
  right: "flex-row-reverse justify-start text-end",
} as const

/**
 * Wraps every header cell with the MRT layout: label (sort trigger) · sort
 * indicator · multi-sort order badge · column-actions menu, left-aligned by
 * default. Clicking the label cycles asc → desc → none; shift-click multi-sorts
 * (both via TanStack's `getToggleSortingHandler`).
 */
export function DataTableColumnHeader<TData extends RowData, TValue>({
  header,
  table,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const { column } = header
  const { localization, icons } = dt(table)
  const controls = headerControlsOptionsFromTable(table)
  const align = column.columnDef.meta?.align ?? "left"

  const showFilterPopover = shouldShowColumnFilterButton(column, controls)
  const hasFilter = column.getFilterValue() != null
  const filterPopover = showFilterPopover ? (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={localization.filterByColumn(getColumnLabel(column))}
              className={cn(
                "size-7 shrink-0 opacity-70 transition-opacity group-hover/th:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100",
                hasFilter && "text-primary opacity-100"
              )}
            >
              {hasFilter ? <icons.filter /> : <icons.filterOff />}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {localization.filterByColumn(getColumnLabel(column))}
        </TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-64 gap-2">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {localization.filterByColumn(getColumnLabel(column))}
        </span>
        <DataTableColumnFilter header={header} table={table} />
      </PopoverContent>
    </Popover>
  ) : null

  const labelNode = header.isPlaceholder
    ? null
    : flexRender(column.columnDef.header, { ...header.getContext(), table })

  const canSort = column.getCanSort()
  const sorted = column.getIsSorted() // false | "asc" | "desc"
  const sortIndex = column.getSortIndex()
  const isMultiSort = table.getState().sorting.length > 1 && sortIndex >= 0

  const showActions = shouldShowColumnActions(column, controls)

  const dragHandle = (
    <ColumnDragHandle
      label={localization.reorderColumn}
      Icon={icons.dragHandle}
    />
  )

  // Non-interactive header (e.g. the selection column): render content plainly.
  if (!canSort && !showActions) {
    return (
      <div
        className={cn("group/th flex items-center gap-1", ALIGN_CLASS[align])}
      >
        {labelNode}
        {dragHandle}
        {filterPopover}
      </div>
    )
  }

  const sortTooltip = !sorted
    ? localization.sortByColumnAsc(getColumnLabel(column))
    : sorted === "asc"
      ? localization.sortByColumnDesc(getColumnLabel(column))
      : localization.clearSort

  return (
    <div
      className={cn("group/th flex items-center gap-0.5", ALIGN_CLASS[align])}
    >
      {canSort ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={column.getToggleSortingHandler()}
              aria-label={sortTooltip}
              className="-mx-1.5 flex min-w-0 items-center gap-1 rounded-sm px-1.5 py-1 text-xs font-medium tracking-wider text-muted-foreground uppercase transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 data-[sorted=true]:text-foreground"
              data-sorted={!!sorted}
            >
              <span className="min-w-0 truncate">{labelNode}</span>
              <SortIndicator sorted={sorted} icons={icons} />
              {isMultiSort && (
                <Badge
                  variant="secondary"
                  className="ms-0.5 h-4 min-w-4 shrink-0 justify-center rounded-sm px-1 text-[10px] leading-none tabular-nums"
                >
                  {sortIndex + 1}
                </Badge>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>{sortTooltip}</TooltipContent>
        </Tooltip>
      ) : (
        <span className="min-w-0 truncate px-0 text-xs font-medium tracking-wider uppercase">
          {labelNode}
        </span>
      )}

      {dragHandle}
      {showActions && (
        <DataTableColumnActions
          column={column}
          table={table}
          className="-my-1"
        />
      )}
      {filterPopover}
    </div>
  )
}

/** One stacked icon layer; only the shown one is visible. */
const SORT_LAYER_CLASS = cn(
  "col-start-1 row-start-1 flex items-center justify-center group-data-[animations]/table:transition-[opacity,visibility]",
  MOTION_TIMING_CLASS
)

/** The today-look of the unsorted icon (faded, brighter on header hover). */
const UNSORTED_ICON_CLASS =
  "size-3.5 shrink-0 opacity-50 transition-opacity group-hover/th:opacity-70"

/**
 * The sort state icon. Every state's icon stays mounted, stacked in one grid
 * cell, and only the current one is visible, so a change fades between them
 * (under `[data-animations]`) instead of swapping nodes. With the default
 * icons, one arrow serves both directions and turns 180° for descending.
 * Custom icons are shown as given and only fade.
 */
function SortIndicator({
  sorted,
  icons,
}: {
  sorted: false | "asc" | "desc"
  icons: DataTableInstance["dataTable"]["icons"]
}) {
  const direction = sorted || "none"
  const defaultArrows =
    icons.sortAscending === defaultIcons.sortAscending &&
    icons.sortDescending === defaultIcons.sortDescending

  const layer = (shown: boolean, icon: React.ReactNode, key: string) => (
    <span
      key={key}
      data-shown={shown ? "" : undefined}
      className={cn(SORT_LAYER_CLASS, !shown && "invisible opacity-0")}
    >
      {icon}
    </span>
  )

  return (
    <span
      data-slot="data-table-sort-indicator"
      data-direction={direction}
      aria-hidden="true"
      className="inline-grid shrink-0 place-items-center"
    >
      {layer(
        direction === "none",
        <icons.sortUnsorted className={UNSORTED_ICON_CLASS} />,
        "none"
      )}
      {defaultArrows ? (
        layer(
          direction !== "none",
          <icons.sortAscending
            className={cn(
              "size-3.5 shrink-0 group-data-[animations]/table:transition-[rotate]",
              MOTION_TIMING_CLASS,
              direction === "desc" && "rotate-180"
            )}
          />,
          "arrow"
        )
      ) : (
        <>
          {layer(
            direction === "asc",
            <icons.sortAscending className="size-3.5 shrink-0" />,
            "asc"
          )}
          {layer(
            direction === "desc",
            <icons.sortDescending className="size-3.5 shrink-0" />,
            "desc"
          )}
        </>
      )}
    </span>
  )
}
