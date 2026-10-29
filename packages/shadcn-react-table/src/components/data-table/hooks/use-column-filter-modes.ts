"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"

import {
  createDynamicFilterFn,
  defaultModeForVariant,
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
  getModes: () => Record<string, FilterMode>
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

  const getColumnMode = React.useCallback(
    (columnId: string): FilterMode =>
      getModesRef.current()[columnId] ??
      defaultModesRef.current[columnId] ??
      "contains",
    []
  )

  const dynamicFilterFn = React.useMemo(
    // getColumnMode reads refs inside TanStack's filtering pass, not during
    // this hook's render.
    // eslint-disable-next-line react-hooks/refs
    () => createDynamicFilterFn<TData>(getColumnMode),
    [getColumnMode]
  )

  return {
    getColumnMode,
    dynamicFilterFn,
  }
}
