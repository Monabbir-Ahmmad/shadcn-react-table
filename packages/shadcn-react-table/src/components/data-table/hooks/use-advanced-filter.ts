"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"

import { createAdvancedFilteredRowModel } from "../fns/advanced-filter"
import type { GlobalFilterMode } from "../fns/filter-fns"
import type { AdvancedFilterGroup } from "../core/types"
import { EMPTY_ADVANCED_FILTER } from "../core/ui-state"
import type { DataTableRowModelFactory } from "../core/table-types"

interface UseAdvancedFilterParams {
  enableAdvancedFilter: boolean
  /** The current group (table state), read when filtering. */
  getGroup: () => AdvancedFilterGroup
  /** The current global search mode (table state): a change re-filters. */
  getGlobalFilterMode: () => GlobalFilterMode
}

/**
 * The filtered row model behind the advanced filter: it applies the group on
 * top of the normal column/global filters. The group is table state
 * (`advancedFilter`), read when filtering, so the factory keeps a stable
 * identity; with the feature off it is a pass-through.
 */
export function useAdvancedFilter<TData extends RowData>({
  enableAdvancedFilter,
  getGroup,
  getGlobalFilterMode,
}: UseAdvancedFilterParams): DataTableRowModelFactory<TData> {
  const configRef = React.useRef({
    enableAdvancedFilter,
    getGroup,
    getGlobalFilterMode,
  })
  // Render-phase latest-ref write is load-bearing: TanStack computes row
  // models during render, and the stable factory below must see this render's
  // config (an effect write would filter with a stale config for a frame).
  // eslint-disable-next-line react-hooks/refs
  configRef.current = { enableAdvancedFilter, getGroup, getGlobalFilterMode }

  // The getters run inside TanStack's row-model computation, not during this
  // hook's render.
  const readGroup = () =>
    configRef.current.enableAdvancedFilter
      ? configRef.current.getGroup()
      : EMPTY_ADVANCED_FILTER
  const readMode = () => configRef.current.getGlobalFilterMode()
  // eslint-disable-next-line react-hooks/refs
  const [model] = React.useState(() =>
    createAdvancedFilteredRowModel<TData>(readGroup, readMode)
  )
  return model
}
