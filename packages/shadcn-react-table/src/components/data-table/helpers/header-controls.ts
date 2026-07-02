import type { Column, ColumnDef, RowData } from "@tanstack/react-table"

import { DISPLAY_COLUMN_IDS } from "../core/constants"
import type { ColumnFilterDisplayMode, DataTableInstance } from "../core/types"

/**
 * Feature flags that decide which affordances a column header renders. Single
 * source of truth so the autosize measurement, the per-column minimum width,
 * and the header components themselves can never disagree about what shows (the
 * disagreement that let controls get clipped under the fixed table layout).
 */
export interface HeaderControlsOptions {
  enableColumnActions: boolean
  enableColumnOrdering: boolean
  enableGrouping: boolean
  enableColumnPinning: boolean
  enableColumnVirtualization: boolean
  columnFilterDisplayMode: ColumnFilterDisplayMode
}

// size-7 (28px) icon button + the header's gap-0.5 (2px) between affordances.
const ICON_BUTTON_WIDTH = 30
// The sort glyph + its gap, rendered inside the label button.
const SORT_INDICATOR_WIDTH = 20
// Horizontal cell padding + a sliver of label, so a column never collapses to
// controls-only. A coarse constant: the exact (density-dependent) padding isn't
// knowable without the DOM, and over-reserving a few px is harmless.
const LABEL_AND_PADDING_MIN = 56
// Rough width of one uppercase, letter-spaced header character at the header's
// text-xs scale. Deterministic (no canvas) so the SSR and client size vars
// agree — a canvas measurement would differ between them and warn on hydration.
const HEADER_CHAR_WIDTH = 8.5
// Horizontal cell padding reserved around the header label.
const HEADER_PADDING = 24
// Cap so a very long header can't create an enormous default column.
const HEADER_LABEL_MAX = 260

/** Build {@link HeaderControlsOptions} from a live table's resolved config. */
export function headerControlsOptionsFromTable<TData extends RowData>(
  table: DataTableInstance<TData>
): HeaderControlsOptions {
  const config = table.tableInstance
  return {
    enableColumnActions: config.enableColumnActions,
    enableColumnOrdering: config.enableColumnOrdering,
    enableGrouping: config.enableGrouping,
    enableColumnPinning: config.enableColumnPinning,
    enableColumnVirtualization: config.enableColumnVirtualization,
    columnFilterDisplayMode: config.columnFilterDisplayMode,
  }
}

/** Whether the column-reorder drag grip renders in this column's header. */
export function shouldShowColumnDragGrip<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  opts: HeaderControlsOptions
): boolean {
  if (DISPLAY_COLUMN_IDS.has(column.id)) return false
  return (
    (opts.enableColumnOrdering ||
      (opts.enableGrouping && column.getCanGroup())) &&
    !opts.enableColumnVirtualization &&
    !column.getIsPinned()
  )
}

/** Whether the column-actions (⋮) trigger renders in this column's header. */
export function shouldShowColumnActions<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  opts: HeaderControlsOptions
): boolean {
  return (
    opts.enableColumnActions &&
    !column.columnDef.meta?.disableColumnActions &&
    (column.getCanSort() ||
      column.getCanHide() ||
      column.getCanFilter() ||
      (opts.enableColumnPinning && column.getCanPin()) ||
      (opts.enableGrouping && column.getCanGroup()))
  )
}

/** Whether the popover filter button renders in this column's header. */
export function shouldShowColumnFilterButton<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  opts: HeaderControlsOptions
): boolean {
  return opts.columnFilterDisplayMode === "popover" && column.getCanFilter()
}

/**
 * Width (px) to reserve beside the label for the header affordances that will
 * actually render for this column — the sort indicator plus any of the drag
 * grip, actions trigger, and filter button. Used as `extraWidth` when
 * autosizing and as the controls portion of {@link getHeaderControlsMinWidth}.
 */
export function getHeaderControlsWidth<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  opts: HeaderControlsOptions
): number {
  return (
    (column.getCanSort() ? SORT_INDICATOR_WIDTH : 0) +
    (shouldShowColumnDragGrip(column, opts) ? ICON_BUTTON_WIDTH : 0) +
    (shouldShowColumnActions(column, opts) ? ICON_BUTTON_WIDTH : 0) +
    (shouldShowColumnFilterButton(column, opts) ? ICON_BUTTON_WIDTH : 0)
  )
}

// ----------------------------------------------------------------------------
// ColumnDef-based reservation
//
// The functions above read a *built* column (capabilities via getCan*). The
// size/minSize floors, however, must be baked into the column defs *before*
// `useReactTable` — a pure transform, so React Compiler keeps it and SSR/client
// agree (mutating a built column in an effect/memo gets dead-code-eliminated on
// the client and desyncs hydration). These mirror the predicates above but
// derive capabilities from the def + flags. They err toward reserving (a column
// counts as sortable/filterable unless explicitly disabled) so the reservation
// is always ≥ what actually renders — controls can never end up clipped.
// ----------------------------------------------------------------------------

type AnyColumnDef<TData extends RowData> = ColumnDef<TData, unknown> & {
  accessorKey?: unknown
  accessorFn?: unknown
  columns?: unknown
  enableSorting?: boolean
  enableHiding?: boolean
  enableColumnFilter?: boolean
  enableGrouping?: boolean
  enablePinning?: boolean
  minSize?: number
  size?: number
}

function hasAccessor<TData extends RowData>(def: AnyColumnDef<TData>): boolean {
  return def.accessorKey != null || def.accessorFn != null
}

function defLabel<TData extends RowData>(def: AnyColumnDef<TData>): string {
  if (def.meta?.label) return def.meta.label
  if (typeof def.header === "string" && def.header.length > 0) return def.header
  if (typeof def.accessorKey === "string") return def.accessorKey
  return ""
}

function getColumnDefControlsWidth<TData extends RowData>(
  def: AnyColumnDef<TData>,
  opts: HeaderControlsOptions
): number {
  const canSort = def.enableSorting !== false && hasAccessor(def)
  const canHide = def.enableHiding !== false
  const canFilter = def.enableColumnFilter !== false && hasAccessor(def)
  const canGroup = def.enableGrouping !== false && hasAccessor(def)
  const canPin = def.enablePinning !== false

  const showGrip =
    (opts.enableColumnOrdering || (opts.enableGrouping && canGroup)) &&
    !opts.enableColumnVirtualization
  const showActions =
    opts.enableColumnActions &&
    !def.meta?.disableColumnActions &&
    (canSort ||
      canHide ||
      canFilter ||
      (opts.enableColumnPinning && canPin) ||
      (opts.enableGrouping && canGroup))
  const showFilter = opts.columnFilterDisplayMode === "popover" && canFilter

  return (
    (canSort ? SORT_INDICATOR_WIDTH : 0) +
    (showGrip ? ICON_BUTTON_WIDTH : 0) +
    (showActions ? ICON_BUTTON_WIDTH : 0) +
    (showFilter ? ICON_BUTTON_WIDTH : 0)
  )
}

/** {@link getHeaderControlsMinWidth} computed from a column def (pre-build). */
export function getColumnDefMinWidth<TData extends RowData>(
  def: ColumnDef<TData, unknown>,
  opts: HeaderControlsOptions
): number {
  return LABEL_AND_PADDING_MIN + getColumnDefControlsWidth(def, opts)
}

/** {@link getHeaderPreferredWidth} computed from a column def (pre-build). */
export function getColumnDefPreferredWidth<TData extends RowData>(
  def: ColumnDef<TData, unknown>,
  opts: HeaderControlsOptions
): number {
  const labelWidth = Math.min(
    HEADER_LABEL_MAX,
    defLabel(def).length * HEADER_CHAR_WIDTH
  )
  return Math.ceil(
    HEADER_PADDING + labelWidth + getColumnDefControlsWidth(def, opts)
  )
}

/** True for a leaf user/data column def (not an injected display column or a
 *  header group) — the only defs that get a control-aware size/minSize. */
export function isDataColumnDef<TData extends RowData>(
  def: ColumnDef<TData, unknown>
): boolean {
  const anyDef = def as AnyColumnDef<TData>
  if (Array.isArray(anyDef.columns)) return false
  if (def.id != null && DISPLAY_COLUMN_IDS.has(def.id)) return false
  return hasAccessor(anyDef)
}
