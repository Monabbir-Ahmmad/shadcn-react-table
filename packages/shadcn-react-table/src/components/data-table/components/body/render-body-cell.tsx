"use client"

import { flexRender, type RowData } from "@tanstack/react-table"
import * as React from "react"

import type { DataTableInstance } from "../../core/types"
import { SUBSTRING_MODES } from "../../fns/filter-fns"
import { getEffectiveMode } from "../../helpers/effective-filter-mode"
import { stopPropagation } from "../../helpers/stop-propagation"
import { DataTableBodyCellContent } from "../editing/data-table-edit-cell"
import { Highlight } from "./highlight"
import type { DataTableCell } from "../../core/table-types"
import { dt } from "../../core/internal"
import {
  DEFAULT_AGGREGATION_LABELS,
  type DataTableLocalization,
} from "../../core/localization"

/** Table state every cell reads, taken once per body render rather than per
 *  cell (reading the state costs a few microseconds, times every cell). */
export interface CellRenderState {
  isGrouping: boolean
  globalFilter: unknown
}

export function getCellRenderState<TData extends RowData>(
  table: DataTableInstance<TData>
): CellRenderState {
  const { grouping, globalFilter } = table.getState()
  return { isGrouping: grouping.length > 0, globalFilter }
}

/**
 * Resolves a body cell's content, handling grouped / aggregated / placeholder
 * cells and falling back to the highlight-aware value renderer.
 */
export function renderBodyCell<TData extends RowData>(
  cell: DataTableCell<TData, unknown>,
  table: DataTableInstance<TData>,
  enableHighlight: boolean,
  columnsWithCustomCell: ReadonlySet<string>,
  localization: DataTableInstance<TData>["dataTable"]["localization"],
  shared: CellRenderState = getCellRenderState(table)
): React.ReactNode {
  const { row, column } = cell
  const icons = dt(table).icons
  const meta = column.columnDef.meta

  // Grouped/aggregated/placeholder cells are a grouping concept. Tree data
  // (getSubRows) also marks parent rows' cells as "aggregated", which would
  // bypass normal cell rendering (e.g. the expand chevron). Only take these
  // branches when grouping is actually active.
  const { isGrouping } = shared

  if (isGrouping && cell.getIsGrouped()) {
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
        style={{ paddingInlineStart: `${row.depth * 1}rem` }}
        className="flex items-center gap-1.5 text-start outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {row.getIsExpanded() ? (
          <icons.expanded className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <icons.collapsed className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
        )}
        <span className="font-medium">
          {meta?.renderGroupedCell
            ? meta.renderGroupedCell({ cell, row, column, table })
            : flexRender(column.columnDef.cell, {
                ...cell.getContext(),
                table,
              })}
        </span>
        <span className="text-xs text-muted-foreground">
          ({row.subRows.length})
        </span>
      </button>
    )
  }

  if (isGrouping && cell.getIsAggregated()) {
    if (meta?.renderAggregatedCell) {
      return meta.renderAggregatedCell({ cell, row, column, table })
    }
    return flexRender(
      column.columnDef.aggregatedCell ?? column.columnDef.cell,
      { ...cell.getContext(), table }
    )
  }

  if (isGrouping && cell.getIsPlaceholder()) {
    return meta?.renderPlaceholderCell
      ? meta.renderPlaceholderCell({ cell, row, column, table })
      : null
  }

  return (
    <DataTableBodyCellContent
      cell={cell}
      table={table}
      fallback={renderCellContent(
        cell,
        table,
        enableHighlight,
        columnsWithCustomCell,
        shared.globalFilter
      )}
    />
  )
}

/**
 * Renders a cell's value, auto-highlighting matched substrings for columns with
 * no custom cell renderer and an active string substring filter / global query.
 */
function renderCellContent<TData extends RowData>(
  cell: DataTableCell<TData, unknown>,
  table: DataTableInstance<TData>,
  enableHighlight: boolean,
  columnsWithCustomCell: ReadonlySet<string>,
  globalFilter: unknown
): React.ReactNode {
  const { column } = cell
  const value = cell.getValue()
  const canHighlight =
    enableHighlight &&
    column.columnDef.meta?.enableFilterMatchHighlighting !== false &&
    !columnsWithCustomCell.has(column.id) &&
    (typeof value === "string" || typeof value === "number")

  if (canHighlight) {
    const query = resolveHighlightQuery(cell, table, globalFilter)
    if (query) {
      return <Highlight text={String(value)} query={query} />
    }
  }

  return flexRender(column.columnDef.cell, { ...cell.getContext(), table })
}

/** The active highlight query for a cell: its column filter, else global search. */
function resolveHighlightQuery<TData extends RowData>(
  cell: DataTableCell<TData, unknown>,
  table: DataTableInstance<TData>,
  globalFilter: unknown
): string | null {
  const filterValue = cell.column.getFilterValue()
  if (
    typeof filterValue === "string" &&
    filterValue.length > 0 &&
    SUBSTRING_MODES.has(getEffectiveMode(cell.column, table))
  ) {
    return filterValue
  }
  if (
    typeof globalFilter === "string" &&
    globalFilter.length > 0 &&
    SUBSTRING_MODES.has(dt(table).globalFilterMode)
  ) {
    return globalFilter
  }
  return null
}

/**
 * The table's default `aggregatedCell`: several aggregations
 * (`aggregationFn: ["sum", "mean"]`) show each result with its label;
 * a single one shows its value, as TanStack's default does.
 */
export function DefaultAggregatedCell<TData extends RowData>({
  getValue,
  column,
  table,
}: {
  getValue: () => unknown
  column: { columnDef: { aggregationFn?: unknown } }
  table: unknown
}): React.ReactNode {
  const value = getValue()
  if (Array.isArray(column.columnDef.aggregationFn)) {
    return (
      <AggregationResults
        value={value}
        localization={dt(table as DataTableInstance<TData>).localization}
      />
    )
  }
  return (value as { toString?: () => string } | null)?.toString?.() ?? null
}

/** "Sum 4,000 · Mean 2,000": each aggregation's label and value. */
function AggregationResults({
  value,
  localization,
}: {
  value: unknown
  localization: DataTableLocalization
}) {
  if (value == null || typeof value !== "object")
    return <>{String(value ?? "")}</>
  const labels = {
    ...DEFAULT_AGGREGATION_LABELS,
    ...localization.aggregationFns,
  }
  const format = (result: unknown): string =>
    typeof result === "number"
      ? result.toLocaleString(localization.language)
      : Array.isArray(result)
        ? result.map(format).join(" – ")
        : String(result ?? "")
  return (
    <span className="inline-flex flex-wrap gap-x-3">
      {Object.entries(value).map(([name, result]) => (
        <span key={name}>
          <span className="text-muted-foreground">{labels[name] ?? name}</span>{" "}
          <span className="font-medium tabular-nums">{format(result)}</span>
        </span>
      ))}
    </span>
  )
}
