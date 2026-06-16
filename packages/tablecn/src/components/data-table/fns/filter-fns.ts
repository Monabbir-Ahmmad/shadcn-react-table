import type { FilterFn, RowData } from "@tanstack/react-table"
import { rankItem } from "@tanstack/match-sorter-utils"
import { isAfter, isBefore, startOfDay } from "date-fns"

import type { FilterVariant } from "../core/types"

/** Global-search modes offered in the global filter-mode menu. */
export type GlobalFilterMode =
  | "fuzzy"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "equals"

/** All supported filter modes across variants. */
export type FilterMode =
  // text
  | "contains"
  | "equals"
  | "notEquals"
  | "startsWith"
  | "endsWith"
  | "fuzzy"
  // shared
  | "empty"
  | "notEmpty"
  // numeric
  | "between"
  | "betweenInclusive"
  | "greaterThan"
  | "greaterThanOrEqualTo"
  | "lessThan"
  | "lessThanOrEqualTo"
  // date
  | "before"
  | "after"
  | "betweenDates"
  // fixed (no mode menu)
  | "equalsString"
  | "arrIncludesSome"
  | "equalsBool"

const str = (v: unknown): string => (v == null ? "" : String(v))
const lower = (v: unknown): string => str(v).toLowerCase()
const num = (v: unknown): number =>
  typeof v === "number" ? v : parseFloat(str(v))
const isBlank = (v: unknown): boolean =>
  v == null || v === "" || (Array.isArray(v) && v.length === 0)
const toDate = (v: unknown): Date | null => {
  if (v == null || v === "") return null
  const d = v instanceof Date ? v : new Date(v as string)
  return Number.isNaN(d.getTime()) ? null : d
}

// Each entry: (row value already resolved) decides inclusion. The dynamic
// `filterFn` below resolves `row.getValue(columnId)` and dispatches by mode.
type ModeFn = (cellValue: unknown, filterValue: unknown) => boolean

const MODE_FNS: Record<FilterMode, ModeFn> = {
  contains: (cell, val) => lower(cell).includes(lower(val)),
  equals: (cell, val) => lower(cell) === lower(val),
  notEquals: (cell, val) => lower(cell) !== lower(val),
  startsWith: (cell, val) => lower(cell).startsWith(lower(val)),
  endsWith: (cell, val) => lower(cell).endsWith(lower(val)),
  fuzzy: (cell, val) => lower(cell).includes(lower(val)),

  empty: (cell) => isBlank(cell),
  notEmpty: (cell) => !isBlank(cell),

  greaterThan: (cell, val) => num(cell) > num(val),
  greaterThanOrEqualTo: (cell, val) => num(cell) >= num(val),
  lessThan: (cell, val) => num(cell) < num(val),
  lessThanOrEqualTo: (cell, val) => num(cell) <= num(val),
  between: (cell, val) => betweenNum(cell, val, false),
  betweenInclusive: (cell, val) => betweenNum(cell, val, true),

  before: (cell, val) => {
    const c = toDate(cell)
    const v = toDate(val)
    return c != null && v != null && isBefore(c, startOfDay(v))
  },
  after: (cell, val) => {
    const c = toDate(cell)
    const v = toDate(val)
    return c != null && v != null && isAfter(c, startOfDay(v))
  },
  betweenDates: (cell, val) => {
    const c = toDate(cell)
    const range = (Array.isArray(val) ? val : []) as unknown[]
    const from = toDate(range[0])
    const to = toDate(range[1])
    if (c == null) return false
    if (from != null && isBefore(c, startOfDay(from))) return false
    if (to != null && isAfter(c, startOfDay(to))) return false
    return from != null || to != null
  },

  equalsString: (cell, val) => str(cell) === str(val),
  arrIncludesSome: (cell, val) => {
    const arr = (Array.isArray(val) ? val : []) as unknown[]
    if (arr.length === 0) return true
    return arr.map(str).includes(str(cell))
  },
  equalsBool: (cell, val) => Boolean(cell) === Boolean(val),
}

function betweenNum(cell: unknown, val: unknown, inclusive: boolean): boolean {
  const arr = (Array.isArray(val) ? val : []) as unknown[]
  const n = num(cell)
  if (Number.isNaN(n)) return false
  const min = arr[0] === "" || arr[0] == null ? null : num(arr[0])
  const max = arr[1] === "" || arr[1] == null ? null : num(arr[1])
  if (min != null && (inclusive ? n < min : n <= min)) return false
  if (max != null && (inclusive ? n > max : n >= max)) return false
  return min != null || max != null
}

/** Modes that activate without a typed value (they test the cell only). */
export const VALUELESS_MODES: ReadonlySet<FilterMode> = new Set([
  "empty",
  "notEmpty",
])

/** Modes whose string value should drive match highlighting in cells. */
export const SUBSTRING_MODES: ReadonlySet<FilterMode> = new Set([
  "contains",
  "startsWith",
  "endsWith",
  "equals",
  "fuzzy",
])

/**
 * A value is "inactive" (filter should auto-remove) when blank — unless the
 * mode is valueless, where any truthy sentinel keeps it active.
 */
function isInactive(value: unknown): boolean {
  if (Array.isArray(value)) return value.every((v) => v == null || v === "")
  return value == null || value === ""
}

/**
 * Single dynamic filter function assigned to every column via `defaultColumn`.
 * It reads the column's current mode from the provided lookup and dispatches.
 * Mode state lives in the hook; this closure reads it through `getMode` (a ref
 * getter) so the function identity stays stable across renders.
 */
export function createDynamicFilterFn<TData extends RowData>(
  getMode: (columnId: string) => FilterMode
): FilterFn<TData> {
  const fn: FilterFn<TData> = (row, columnId, filterValue) => {
    const mode = getMode(columnId)
    const modeFn = MODE_FNS[mode] ?? MODE_FNS.contains
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
  getMode: () => GlobalFilterMode
): FilterFn<TData> {
  const fn: FilterFn<TData> = (row, columnId, filterValue) => {
    const value = String(filterValue ?? "")
    if (value === "") return true
    const mode = getMode()
    if (mode === "fuzzy") {
      return rankItem(row.getValue(columnId), value).passed
    }
    const modeFn = MODE_FNS[mode] ?? MODE_FNS.contains
    return modeFn(row.getValue(columnId), value)
  }
  fn.autoRemove = (value) => value == null || value === ""
  return fn
}

/** Default mode for a variant when the consumer hasn't chosen one. */
export function defaultModeForVariant(variant: FilterVariant): FilterMode {
  switch (variant) {
    case "range":
    case "range-slider":
      return "between"
    case "date":
      return "equals"
    case "date-range":
      return "betweenDates"
    case "select":
      return "equalsString"
    case "multi-select":
      return "arrIncludesSome"
    case "checkbox":
      return "equalsBool"
    default:
      return "contains"
  }
}

/** Modes offered in the mode menu per variant. Empty array → no mode menu. */
export function modeOptionsForVariant(variant: FilterVariant): FilterMode[] {
  switch (variant) {
    case "text":
      return [
        "fuzzy",
        "contains",
        "startsWith",
        "endsWith",
        "equals",
        "notEquals",
        "empty",
        "notEmpty",
      ]
    case "range":
    case "range-slider":
      return [
        "between",
        "betweenInclusive",
        "equals",
        "notEquals",
        "greaterThan",
        "greaterThanOrEqualTo",
        "lessThan",
        "lessThanOrEqualTo",
        "empty",
        "notEmpty",
      ]
    case "date":
    case "date-range":
      return [
        "equals",
        "notEquals",
        "before",
        "after",
        "betweenDates",
        "empty",
        "notEmpty",
      ]
    default:
      // select / multi-select / checkbox have a single fixed mode
      return []
  }
}
