"use client"

import type { RowData } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import * as React from "react"

import type { DataTableInstance } from "../core/types"
import { getPinSide } from "../helpers/column-pinning"
import { pinnedRangeExtractor } from "../helpers/pinned-range-extractor"
import { resolveRowHeight } from "../helpers/resolve-row-height"
import { getVirtualHeaderRuns } from "../helpers/virtual-header-runs"
import type { DataTableRow } from "../core/table-types"

export interface VirtualRowItem<TData extends RowData> {
  row: DataTableRow<TData>
  detail: boolean
}

/** Lays out one cell per virtual column with spacers for the skipped columns. */
export type WithColumnSpacers = (
  cells: React.ReactNode[],
  keyPrefix: string
) => React.ReactNode

/** Where a header cell lands under column virtualization. */
export interface VirtualHeaderLayout {
  key: string
  /** Rendered columns the cell spans (fewer than `colSpan` when cut off). */
  colSpan: number
  /** Width override when the cell spans only part of its columns. */
  widthStyle?: React.CSSProperties
}

/** Lays out one header/footer row (any depth) with spacers. */
export type WithHeaderSpacers = <H extends { id: string; colSpan: number }>(
  headers: H[],
  render: (header: H, layout: VirtualHeaderLayout) => React.ReactNode,
  keyPrefix: string
) => React.ReactNode

/**
 * Row + column virtualization for {@link DataTable}. Builds the flattened
 * virtualization list (center rows + their expanded detail panels), wires both
 * `@tanstack/react-virtual` instances, exposes them via the optional instance
 * refs, and returns the helpers the header/body/footer need to render only the
 * visible window with left/right column spacers.
 */
export function useTableVirtualizers<TData extends RowData>(
  table: DataTableInstance<TData>,
  gridRef: React.RefObject<HTMLDivElement | null>
) {
  const {
    enableRowVirtualization,
    enableColumnVirtualization,
    renderDetailPanel,
    estimateRowHeight,
    rowHeight,
    getRowHeight,
    virtualOverscan,
    rowVirtualizerOptions,
    columnVirtualizerOptions,
    rowVirtualizerInstanceRef,
    columnVirtualizerInstanceRef,
    direction,
  } = table.tableInstance

  // Flatten center rows (+ expanded detail panels) into a virtualization list.
  const virtualItems: VirtualRowItem<TData>[] = []
  if (enableRowVirtualization) {
    for (const row of table.getCenterRows()) {
      virtualItems.push({ row, detail: false })
      if (renderDetailPanel && row.getIsExpanded() && !row.getIsGrouped()) {
        virtualItems.push({ row, detail: true })
      }
    }
  }

  // User-supplied passthrough options, resolved from their value-or-function form.
  const rowVOptions =
    typeof rowVirtualizerOptions === "function"
      ? rowVirtualizerOptions({ table })
      : rowVirtualizerOptions
  const columnVOptions =
    typeof columnVirtualizerOptions === "function"
      ? columnVirtualizerOptions({ table })
      : columnVirtualizerOptions

  // The React Compiler bails on TanStack Virtual's mutable instance; expected.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: virtualItems.length,
    getScrollElement: () => gridRef.current,
    // Per-row estimate: an exact px number pins the row; "auto" (or no override)
    // uses the flat estimate and lets `measureElement` correct to the real
    // height. Detail-panel rows always fall back to the flat estimate.
    estimateSize: (index) => {
      const item = virtualItems[index]
      if (!item || item.detail) return estimateRowHeight
      const resolved = resolveRowHeight(item.row, { rowHeight, getRowHeight })
      return typeof resolved === "number" ? resolved : estimateRowHeight
    },
    overscan: virtualOverscan,
    measureElement:
      typeof window !== "undefined"
        ? (el) => el?.getBoundingClientRect().height ?? 0
        : undefined,
    ...rowVOptions,
  })

  // Horizontal virtualizer for wide tables. When off, count is 0 and the
  // helpers below fall through to rendering all columns. Leaf columns are taken
  // in render order (pinned columns moved to the edges, as cells and headers
  // are); `getVisibleLeafColumns` ignores pinning.
  const leafColumns = (table.getHeaderGroups().at(-1)?.headers ?? []).map(
    (header) => header.column
  )
  const pinnedIndexes = leafColumns.flatMap((column, index) =>
    getPinSide(column) ? [index] : []
  )
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: enableColumnVirtualization ? leafColumns.length : 0,
    getScrollElement: () => gridRef.current,
    estimateSize: (index) => leafColumns[index]?.getSize() ?? 150,
    getItemKey: (index) => leafColumns[index]?.id ?? index,
    // Pinned columns are sticky, so they must render even when scrolled out.
    rangeExtractor: (range) => pinnedRangeExtractor(range, pinnedIndexes),
    // Right-to-left scroll offsets run negative.
    isRtl: direction === "rtl",
    overscan: virtualOverscan,
    ...columnVOptions,
  })

  // Sizes are estimates, which the virtualizer caches; re-measure when a
  // column is resized, reordered, hidden or pinned.
  const columnLayoutKey = leafColumns
    .map((column) => `${column.id}:${column.getSize()}`)
    .join()
  React.useEffect(() => {
    if (enableColumnVirtualization) columnVirtualizer.measure()
  }, [columnLayoutKey, enableColumnVirtualization, columnVirtualizer])

  // Expose the virtualizer instances for imperative control (e.g. scrollToIndex).
  React.useEffect(() => {
    if (rowVirtualizerInstanceRef)
      rowVirtualizerInstanceRef.current = rowVirtualizer
  })
  React.useEffect(() => {
    if (columnVirtualizerInstanceRef)
      columnVirtualizerInstanceRef.current = columnVirtualizer
  })

  const virtualColumns = enableColumnVirtualization
    ? columnVirtualizer.getVirtualItems()
    : []
  const totalColumnWidth = columnVirtualizer.getTotalSize()

  /**
   * Lays out a row's cells (one per virtual column, in the same order) with a
   * spacer wherever columns are skipped: before the window, after it, and
   * between the window and any pinned columns rendered outside it.
   */
  const withColumnSpacers = (
    cells: React.ReactNode[],
    keyPrefix: string
  ): React.ReactNode => {
    if (!enableColumnVirtualization) return cells
    // An empty cell collapses under auto table layout unless it has a min width.
    const spacer = (key: string, width: number) => (
      <td
        key={`${keyPrefix}-${key}`}
        aria-hidden
        style={{ width, minWidth: width, padding: 0 }}
      />
    )
    const out: React.ReactNode[] = []
    let end = 0
    virtualColumns.forEach((vc, i) => {
      if (vc.start > end) out.push(spacer(`gap-${vc.index}`, vc.start - end))
      out.push(cells[i])
      end = vc.end
    })
    if (totalColumnWidth > end)
      out.push(spacer("gap-end", totalColumnWidth - end))
    return out
  }

  /**
   * Header and footer rows hold group headers spanning several columns, so
   * each rendered column maps to the header covering it, and adjacent columns
   * under one header share a cell.
   */
  const withHeaderSpacers: WithHeaderSpacers = (headers, render, keyPrefix) => {
    const cells: React.ReactNode[] = virtualColumns.map(() => null)
    const runs = getVirtualHeaderRuns(
      headers,
      virtualColumns.map((vc) => vc.index)
    )
    for (const { header, start, span } of runs) {
      const covered = virtualColumns.slice(start, start + span)
      const width = covered.reduce((sum, vc) => sum + vc.size, 0)
      cells[start] = render(header, {
        key: `${header.id}-${covered[0]!.index}`,
        colSpan: span,
        widthStyle:
          span < header.colSpan ? { width, minWidth: width } : undefined,
      })
    }
    return withColumnSpacers(cells, keyPrefix)
  }

  // Kept stable while the rendered column window is unchanged, so the
  // (memoized) header and footer skip renders that do not move it.
  const columnWindowKey = [
    enableColumnVirtualization,
    totalColumnWidth,
    ...virtualColumns.map((vc) => `${vc.index}:${vc.start}:${vc.size}`),
  ].join()
  const stableHeaderSpacers = React.useMemo(
    () => withHeaderSpacers,
    // The key captures everything the function reads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnWindowKey]
  )

  return {
    rowVirtualizer,
    columnVirtualizer,
    virtualItems,
    virtualColumns,
    withColumnSpacers,
    withHeaderSpacers: stableHeaderSpacers,
  }
}
