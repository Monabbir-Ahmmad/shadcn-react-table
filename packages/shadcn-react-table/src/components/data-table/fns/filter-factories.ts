import type { RowData } from "@tanstack/react-table"
import { rankItem } from "@tanstack/match-sorter-utils"

import {
  MODE_FNS,
  getModeFn,
  isInactive,
  type FilterMode,
  type GlobalFilterMode,
} from "./filter-modes"
import type { DataTableFilterFn } from "../core/table-types"

/** The consumer's `filterFns`, by name. */
export type CustomFilterFns<TData extends RowData> = Record<
  string,
  DataTableFilterFn<TData>
>

/**
 * Single dynamic filter function assigned to every column via `defaultColumn`.
 * It reads the column's current mode from the provided lookup and dispatches.
 * Mode state lives in the hook; this closure reads it through `getMode` (a ref
 * getter) so the function identity stays stable across renders.
 */
export function createDynamicFilterFn<TData extends RowData>(
  getMode: (columnId: string) => FilterMode,
  getCustomFns: () => CustomFilterFns<TData> = () => ({})
): DataTableFilterFn<TData> {
  const fn: DataTableFilterFn<TData> = (
    row,
    columnId,
    filterValue,
    addMeta
  ) => {
    const mode = getMode(columnId)
    const custom = getCustomFns()[mode]
    if (custom) return custom(row, columnId, filterValue, addMeta)
    const modeFn = getModeFn(mode) ?? MODE_FNS.contains
    return modeFn(row.getValue(columnId), filterValue)
  }
  // Keep valueless modes active even with a blank value; otherwise drop blanks.
  fn.autoRemove = (value) => isInactive(value)
  return fn
}

/**
 * Mode-aware global search. `fuzzy` uses match-sorter's `rankItem` (MRT's own
 * choice); other modes reuse the column mode functions. Matches across every
 * searchable column (TanStack runs this per column and ORs the results).
 */
export function createGlobalFilterFn<TData extends RowData>(
  getMode: () => GlobalFilterMode,
  getCustomFns: () => CustomFilterFns<TData> = () => ({})
): DataTableFilterFn<TData> {
  const fn: DataTableFilterFn<TData> = (
    row,
    columnId,
    filterValue,
    addMeta
  ) => {
    const value = String(filterValue ?? "")
    if (value === "") return true
    const mode = getMode()
    const custom = getCustomFns()[mode]
    if (custom) return custom(row, columnId, value, addMeta)
    if (mode === "fuzzy") {
      // Stash the rank so `enableGlobalFilterRankedResults` can order rows by
      // match quality; `rankGlobalFuzzy` reads it back off columnFiltersMeta.
      const itemRank = rankItem(row.getValue(columnId), value)
      addMeta?.(itemRank)
      return itemRank.passed
    }
    const modeFn = getModeFn(mode) ?? MODE_FNS.contains
    return modeFn(row.getValue(columnId), value)
  }
  fn.autoRemove = (value) => value == null || value === ""
  return fn
}
