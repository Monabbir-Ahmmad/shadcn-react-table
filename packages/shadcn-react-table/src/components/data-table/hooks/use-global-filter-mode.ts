"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"

import {
  createGlobalFilterFn,
  createRankedSortedRowModel,
  type CustomFilterFns,
  type GlobalFilterMode,
} from "../fns/filter-fns"
import type {
  DataTableFilterFn,
  DataTableRowModelFactory,
} from "../core/table-types"

interface UseGlobalFilterModeParams<TData extends RowData> {
  /** The current mode (table state), read when filtering and ranking. */
  getMode: () => GlobalFilterMode
  /** The consumer's `filterFns`, read when filtering. */
  getCustomFns: () => CustomFilterFns<TData>
  enableGlobalFilterRankedResults: boolean
  manualSorting: boolean
  manualFiltering: boolean
  enableGrouping: boolean
}

export interface GlobalFilterModeState<TData extends RowData> {
  /** Mode-aware global filter fn. Stable: it reads the mode when it runs, and
   *  the filtered row model re-filters when the mode changes. */
  dynamicGlobalFilterFn: DataTableFilterFn<TData>
  /** Sorted row model that re-orders by fuzzy rank when ranking is active. */
  rankedSortedRowModel: DataTableRowModelFactory<TData>
}

/**
 * Global-search mode state plus the two row-model pieces it drives: the
 * mode-aware global filter fn and the fuzzy-ranked sorted row model. While a
 * fuzzy global search is active and the user hasn't sorted, rows are ordered by
 * best match; the current config is read through a ref so the model factory
 * keeps a stable identity (recreating it would defeat TanStack's memoization).
 */
export function useGlobalFilterMode<TData extends RowData>({
  getMode,
  getCustomFns,
  enableGlobalFilterRankedResults,
  manualSorting,
  manualFiltering,
  enableGrouping,
}: UseGlobalFilterModeParams<TData>): GlobalFilterModeState<TData> {
  const getModeRef = React.useRef(getMode)
  // eslint-disable-next-line react-hooks/refs
  getModeRef.current = getMode
  const getCustomFnsRef = React.useRef(getCustomFns)
  // eslint-disable-next-line react-hooks/refs
  getCustomFnsRef.current = getCustomFns
  // Stable; the filtered row model (fns/advanced-filter.ts) re-filters when
  // the mode changes, since TanStack's own memo ignores filter functions.
  // Read inside TanStack's filtering pass, not during this render.
  /* eslint-disable react-hooks/refs */
  const dynamicGlobalFilterFn = React.useMemo(
    () =>
      createGlobalFilterFn<TData>(
        () => getModeRef.current(),
        () => getCustomFnsRef.current()
      ),
    []
  )
  /* eslint-enable react-hooks/refs */

  const rankingRef = React.useRef<{
    enabled: boolean
    manualSorting: boolean
    manualFiltering: boolean
    grouping: boolean
  }>(null!)
  // Render-phase latest-ref write is load-bearing: TanStack computes row
  // models during render, and the stable factory below must see this render's
  // config (an effect write would rank with stale config for a full frame).
  // eslint-disable-next-line react-hooks/refs
  rankingRef.current = {
    enabled: enableGlobalFilterRankedResults,
    manualSorting,
    manualFiltering,
    grouping: enableGrouping,
  }
  const rankedSortedRowModel = React.useMemo(
    () =>
      // The predicate runs inside TanStack's row-model computation, not
      // during this hook's render.
      // eslint-disable-next-line react-hooks/refs
      createRankedSortedRowModel<TData>((t) => {
        const c = rankingRef.current
        if (!c.enabled || getModeRef.current() !== "fuzzy") return false
        if (c.manualSorting || c.manualFiltering) return false
        const s = t.store.state
        if (!s.globalFilter) return false
        if (s.sorting.some(Boolean)) return false
        if (c.grouping && s.grouping.length > 0) return false
        if (s.expanded === true || Object.values(s.expanded).some(Boolean))
          return false
        return true
      }),
    []
  )

  return {
    dynamicGlobalFilterFn,
    rankedSortedRowModel,
  }
}
