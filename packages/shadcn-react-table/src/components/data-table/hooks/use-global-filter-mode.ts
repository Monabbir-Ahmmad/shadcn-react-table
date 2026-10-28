"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"

import {
  createGlobalFilterFn,
  createRankedSortedRowModel,
  type GlobalFilterMode,
} from "../fns/filter-fns"
import { useControllableState } from "./use-controllable-state"
import type {
  DataTableFilterFn,
  DataTableRowModelFactory,
} from "../core/table-types"

interface UseGlobalFilterModeParams {
  globalFilterMode?: GlobalFilterMode
  defaultGlobalFilterMode: GlobalFilterMode
  onGlobalFilterModeChange?: (mode: GlobalFilterMode) => void
  enableGlobalFilterRankedResults: boolean
  manualSorting: boolean
  manualFiltering: boolean
  enableGrouping: boolean
}

export interface GlobalFilterModeState<TData extends RowData> {
  globalFilterMode: GlobalFilterMode
  setGlobalFilterMode: (mode: GlobalFilterMode) => void
  /** Mode-aware global filter fn (new identity per mode → re-runs filtering). */
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
  globalFilterMode: globalFilterModeProp,
  defaultGlobalFilterMode,
  onGlobalFilterModeChange,
  enableGlobalFilterRankedResults,
  manualSorting,
  manualFiltering,
  enableGrouping,
}: UseGlobalFilterModeParams): GlobalFilterModeState<TData> {
  const [globalFilterMode, setGlobalFilterMode] =
    useControllableState<GlobalFilterMode>(
      globalFilterModeProp,
      defaultGlobalFilterMode,
      onGlobalFilterModeChange
    )

  // Recreated per mode so it has a new identity: the filtered row model
  // (fns/advanced-filter.ts) keys its TanStack delegate on
  // `options.globalFilterFn` and rebuilds it when the fn changes. TanStack's
  // own memo ignores the fn, so without that the switch would not re-filter.
  const dynamicGlobalFilterFn = React.useMemo(
    () => createGlobalFilterFn<TData>(() => globalFilterMode),
    [globalFilterMode]
  )

  const rankingRef = React.useRef<{
    enabled: boolean
    mode: GlobalFilterMode
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
    mode: globalFilterMode,
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
        if (!c.enabled || c.mode !== "fuzzy") return false
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
    globalFilterMode,
    setGlobalFilterMode,
    dynamicGlobalFilterFn,
    rankedSortedRowModel,
  }
}
