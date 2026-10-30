/** Built-in global-search modes offered in the global filter-mode menu. */
export type BuiltInGlobalFilterMode =
  "fuzzy" | "contains" | "startsWith" | "endsWith" | "equals"

/** The global search mode menu's default modes. */
export const GLOBAL_FILTER_MODES: readonly BuiltInGlobalFilterMode[] = [
  "fuzzy",
  "contains",
  "startsWith",
  "endsWith",
  "equals",
]

/** A global-search mode: a built-in one, or the name of a custom function in
 *  the `filterFns` option. */
export type GlobalFilterMode = BuiltInGlobalFilterMode | (string & {})

/** A filter mode: a built-in one, or the name of a custom function in the
 *  `filterFns` option. */
export type FilterMode = BuiltInFilterMode | (string & {})

/** The built-in filter modes across variants. */
export type BuiltInFilterMode =
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

import { rankItem } from "@tanstack/match-sorter-utils"
import { endOfDay, isAfter, isBefore, startOfDay } from "date-fns"

import { parseDate } from "../helpers/parse-date"

const str = (v: unknown): string => (v == null ? "" : String(v))
const lower = (v: unknown): string => str(v).toLowerCase()
const num = (v: unknown): number =>
  typeof v === "number" ? v : parseFloat(str(v))
const isBlank = (v: unknown): boolean =>
  v == null || v === "" || (Array.isArray(v) && v.length === 0)
const toDate = parseDate

// Each entry: (row value already resolved) decides inclusion. The dynamic
// `filterFn` resolves `row.getValue(columnId)` and dispatches by mode.
type ModeFn = (cellValue: unknown, filterValue: unknown) => boolean

export const MODE_FNS: Record<BuiltInFilterMode, ModeFn> = {
  contains: (cell, val) => lower(cell).includes(lower(val)),
  equals: (cell, val) => lower(cell) === lower(val),
  notEquals: (cell, val) => lower(cell) !== lower(val),
  startsWith: (cell, val) => lower(cell).startsWith(lower(val)),
  endsWith: (cell, val) => lower(cell).endsWith(lower(val)),
  fuzzy: (cell, val) => rankItem(str(cell), str(val)).passed,

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
    return c != null && v != null && isAfter(c, endOfDay(v))
  },
  betweenDates: (cell, val) => {
    const c = toDate(cell)
    const range = (Array.isArray(val) ? val : []) as unknown[]
    const from = toDate(range[0])
    const to = toDate(range[1])
    if (c == null) return false
    if (from != null && isBefore(c, startOfDay(from))) return false
    if (to != null && isAfter(c, endOfDay(to))) return false
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

const TIME_OF_DAY = /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/

/** Minutes since midnight from a Date, an "HH:mm[:ss]" string or a
 *  date-time string; null when it is none of those. */
function toMinutesOfDay(value: unknown): number | null {
  if (typeof value === "string") {
    const match = TIME_OF_DAY.exec(value.trim())
    if (match) return Number(match[1]) * 60 + Number(match[2])
  }
  const date = toDate(value)
  return date ? date.getHours() * 60 + date.getMinutes() : null
}

/** A date-time to the minute (epoch minutes), or null. */
function toMinute(value: unknown): number | null {
  const date = toDate(value)
  return date ? Math.floor(date.getTime() / 60_000) : null
}

/** The date modes, comparing values converted by `convert` (inclusive
 *  ranges, open-ended when one bound is blank). */
function comparedModes(
  convert: (value: unknown) => number | null
): Partial<Record<BuiltInFilterMode, ModeFn>> {
  const both = (cell: unknown, val: unknown) => {
    const c = convert(cell)
    const v = convert(val)
    return c != null && v != null ? ([c, v] as const) : null
  }
  return {
    equals: (cell, val) => {
      const pair = both(cell, val)
      return pair != null && pair[0] === pair[1]
    },
    notEquals: (cell, val) => {
      const pair = both(cell, val)
      return pair == null || pair[0] !== pair[1]
    },
    before: (cell, val) => {
      const pair = both(cell, val)
      return pair != null && pair[0] < pair[1]
    },
    after: (cell, val) => {
      const pair = both(cell, val)
      return pair != null && pair[0] > pair[1]
    },
    betweenDates: (cell, val) => {
      const c = convert(cell)
      const range = (Array.isArray(val) ? val : []) as unknown[]
      const from = convert(range[0])
      const to = convert(range[1])
      if (c == null || (from == null && to == null)) return false
      return (from == null || c >= from) && (to == null || c <= to)
    },
  }
}

const DATETIME_MODE_FNS = comparedModes(toMinute)
const TIME_MODE_FNS = comparedModes(toMinutesOfDay)

/** Variants whose values compare differently from the mode's default: date
 *  modes on date-times compare to the minute, on times by time of day. */
export const VARIANT_MODE_FNS: Readonly<
  Record<string, Partial<Record<BuiltInFilterMode, ModeFn>>>
> = {
  datetime: DATETIME_MODE_FNS,
  "datetime-range": DATETIME_MODE_FNS,
  time: TIME_MODE_FNS,
  "time-range": TIME_MODE_FNS,
}

/** The built-in function for a mode, if it is one. */
export function getModeFn(mode: string, variant?: string): ModeFn | undefined {
  if (!Object.hasOwn(MODE_FNS, mode)) return undefined
  const builtIn = mode as BuiltInFilterMode
  return (variant && VARIANT_MODE_FNS[variant]?.[builtIn]) || MODE_FNS[builtIn]
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
export function isInactive(value: unknown): boolean {
  if (Array.isArray(value)) return value.every((v) => v == null || v === "")
  return value == null || value === ""
}
