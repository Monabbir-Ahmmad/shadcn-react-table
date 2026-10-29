"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"

import {
  createDynamicFilterFn,
  defaultModeForVariant,
  type CustomFilterFns,
  type FilterMode,
} from "../fns/filter-fns"
import { columnKey } from "../helpers/column-key"
import { flattenLeafColumns } from "../helpers/flatten-leaf-columns"
import type { DataTableColumnDef, DataTableFilterFn } from "../core/table-types"

export interface ColumnFilterModes<TData extends RowData> {
  /** Resolve the active mode for a column (active → default → "contains"). */
  getColumnMode: (columnId: string) => FilterMode
  /** Single dynamic filter fn assigned to every column via `defaultColumn`. */
  dynamicFilterFn: DataTableFilterFn<TData>
}

/**
 * The dynamic filter function behind per-column filter modes. The chosen modes
 * are table state (`columnFilterModes`, read through `getModes` at filter
 * time); defaults come from each column's `meta.filterMode` / `meta.filterVariant`.
 * The filter fn keeps a stable identity (changing it would thrash the filtered
 * row model every render).
 *
 * The value-resetting `setColumnFilterMode` action lives in `useDataTable`
 * because it needs the table instance, which can't exist before this hook
 * supplies `dynamicFilterFn`.
 */
export function useColumnFilterModes<TData extends RowData>(
  columns: ReadonlyArray<DataTableColumnDef<TData, unknown>>,
  getModes: () => Record<string, FilterMode>,
  /** The consumer's `filterFns`, read when filtering. */
  getCustomFns: () => CustomFilterFns<TData>
): ColumnFilterModes<TData> {
  // Per-column default mode derived from `meta.filterMode` / `meta.filterVariant`.
  const defaultModes = React.useMemo(() => {
    const map: Record<string, FilterMode> = {}
    for (const def of flattenLeafColumns(columns)) {
      const key = columnKey(def as { id?: string; accessorKey?: unknown })
      if (!key) continue
      const meta = def.meta
      map[key] =
        meta?.filterMode ?? defaultModeForVariant(meta?.filterVariant ?? "text")
    }
    return map
  }, [columns])

  // Refs let the dynamic filterFn read current modes without re-creating its
  // identity (which would thrash the filtered row model on every render).
  // The render-phase writes are load-bearing: TanStack filters during render,
  // so the filterFn must see this render's modes (an effect write would
  // filter with stale modes for a full frame).
  const getModesRef = React.useRef(getModes)
  // eslint-disable-next-line react-hooks/refs
  getModesRef.current = getModes
  const defaultModesRef = React.useRef(defaultModes)
  // eslint-disable-next-line react-hooks/refs
  defaultModesRef.current = defaultModes
  const getCustomFnsRef = React.useRef(getCustomFns)
  // eslint-disable-next-line react-hooks/refs
  getCustomFnsRef.current = getCustomFns

  const getColumnMode = React.useCallback(
    (columnId: string): FilterMode =>
      getModesRef.current()[columnId] ??
      defaultModesRef.current[columnId] ??
      "contains",
    []
  )

  // The getters read refs inside TanStack's filtering pass, not during this
  // hook's render.
  /* eslint-disable react-hooks/refs */
  const dynamicFilterFn = React.useMemo(
    () =>
      createDynamicFilterFn<TData>(getColumnMode, () =>
        getCustomFnsRef.current()
      ),
    [getColumnMode]
  )
  /* eslint-enable react-hooks/refs */

  return {
    getColumnMode,
    dynamicFilterFn,
  }
}
