"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"

import {
  createExpandColumn,
  createRowDragHandleColumn,
  createRowNumberColumn,
  createRowPinColumn,
} from "../injected-columns/injected-columns"
import { createRowActionsColumn } from "../injected-columns/data-table-row-actions"
import { createSelectionColumn } from "../injected-columns/selection-column"
import type { DataTableIcons } from "../core/icons"
import type { DataTableLocalization } from "../core/localization"
import type { EditDisplayMode, UseDataTableOptions } from "../core/types"
import type { DataTableColumnDef } from "../core/table-types"
import {
  applyDisplayColumnOptions,
  displayColumnOptionsKey,
  type DisplayColumnOptions,
} from "../helpers/display-column-options"

interface UseResolvedColumnsParams<TData extends RowData> {
  columns: ReadonlyArray<DataTableColumnDef<TData, unknown>>
  enableRowOrdering: boolean
  enableRowSelection: boolean
  selectAllMode: "page" | "all"
  enableSelectAll: boolean
  needsExpandColumn: boolean
  positionExpandColumn: "first" | "last"
  enableRowNumbers: boolean
  rowNumberMode: "static" | "original"
  enableRowPinning: boolean
  renderRowActions: UseDataTableOptions<TData>["renderRowActions"]
  renderRowActionMenuItems: UseDataTableOptions<TData>["renderRowActionMenuItems"]
  positionActionsColumn: "first" | "last"
  enableEditing: boolean
  editDisplayMode: EditDisplayMode
  localization: DataTableLocalization
  icons: DataTableIcons
  /** `defaultDisplayColumn` / `displayColumnDefOptions`. */
  displayColumnOptions: DisplayColumnOptions<TData>
}

/**
 * Injects the display columns around the user's columns, memoized so TanStack
 * never receives a new `columns` identity per render (a classic infinite-loop /
 * lost-state trap). Leading order: drag handle → selection → expand → row
 * number (or pin) → user columns. The expand and row-actions columns can move to the
 * trailing/leading edge via `positionExpandColumn` / `positionActionsColumn`.
 */
export function useResolvedColumns<TData extends RowData>({
  columns,
  enableRowOrdering,
  enableRowSelection,
  selectAllMode,
  enableSelectAll,
  needsExpandColumn,
  positionExpandColumn,
  enableRowNumbers,
  rowNumberMode,
  enableRowPinning,
  renderRowActions,
  renderRowActionMenuItems,
  positionActionsColumn,
  enableEditing,
  editDisplayMode,
  localization,
  icons,
  displayColumnOptions,
}: UseResolvedColumnsParams<TData>): ReadonlyArray<
  DataTableColumnDef<TData, unknown>
> {
  // The overrides' functions are read through this ref, so the columns are
  // rebuilt only when their plain values change (see `optionsKey`).
  const optionsRef = React.useRef(displayColumnOptions)
  // eslint-disable-next-line react-hooks/refs
  optionsRef.current = displayColumnOptions
  const optionsKey = displayColumnOptionsKey(displayColumnOptions)

  // The column functions read the ref when they run, not during this render.
  /* eslint-disable react-hooks/refs */
  return React.useMemo(() => {
    const leading = []
    const trailing = []
    if (enableRowOrdering) {
      leading.push(createRowDragHandleColumn<TData>(localization, icons))
    }
    if (enableRowSelection) {
      leading.push(
        createSelectionColumn<TData>(
          localization,
          selectAllMode,
          enableSelectAll
        )
      )
    }
    if (needsExpandColumn) {
      const expand = createExpandColumn<TData>(localization, icons)
      if (positionExpandColumn === "last") trailing.push(expand)
      else leading.push(expand)
    }
    if (enableRowNumbers) {
      leading.push(
        createRowNumberColumn<TData>(
          localization,
          rowNumberMode,
          enableRowPinning,
          icons
        )
      )
    } else if (enableRowPinning) {
      leading.push(createRowPinColumn<TData>(localization, icons))
    }
    const showRowActions =
      !!renderRowActions ||
      !!renderRowActionMenuItems ||
      (enableEditing &&
        (editDisplayMode === "row" || editDisplayMode === "modal"))
    if (showRowActions) {
      const actions = createRowActionsColumn<TData>(positionActionsColumn)
      if (positionActionsColumn === "first") leading.unshift(actions)
      else trailing.push(actions)
    }
    const withOptions = (column: DataTableColumnDef<TData, unknown>) =>
      applyDisplayColumnOptions(column, () => optionsRef.current)
    return leading.length > 0 || trailing.length > 0
      ? [...leading.map(withOptions), ...columns, ...trailing.map(withOptions)]
      : columns
    // `optionsKey` stands in for the options themselves (read via the ref).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    columns,
    enableRowOrdering,
    enableRowSelection,
    selectAllMode,
    enableSelectAll,
    needsExpandColumn,
    positionExpandColumn,
    enableRowNumbers,
    rowNumberMode,
    enableRowPinning,
    renderRowActions,
    renderRowActionMenuItems,
    positionActionsColumn,
    enableEditing,
    editDisplayMode,
    localization,
    icons,
    optionsKey,
  ])
  /* eslint-enable react-hooks/refs */
}
