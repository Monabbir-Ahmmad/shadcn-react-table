import {
  getFilteredRowModel,
  type Row,
  type RowData,
  type RowModel,
  type Table,
} from "@tanstack/react-table"

import type {
  AdvancedFilterGroup,
  AdvancedFilterOperator,
  AdvancedFilterRule,
  FilterVariant,
} from "../core/types"

/** A value that contributes nothing to a filter (no cell value / no input). */
function isEmptyValue(value: unknown): boolean {
  return (
    value == null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  )
}

/** Parse a number from a value, or null if it isn't numeric. */
function asNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isNaN(value) ? null : value
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value)
    return Number.isNaN(n) ? null : n
  }
  return null
}

/** Parse an epoch time from a Date or date-ish string, or null. */
function asTime(value: unknown): number | null {
  if (value instanceof Date) return value.getTime()
  if (typeof value === "string" && value.trim() !== "") {
    const t = Date.parse(value)
    return Number.isNaN(t) ? null : t
  }
  return null
}

/** Order two cell-ish values: numeric first, then date, then string. */
function compareValues(a: unknown, b: unknown): number {
  const na = asNumber(a)
  const nb = asNumber(b)
  if (na != null && nb != null) return na - nb
  const ta = asTime(a)
  const tb = asTime(b)
  if (ta != null && tb != null) return ta - tb
  return String(a).localeCompare(String(b))
}

/** Loose equality: numeric when both sides parse as numbers, else case- and
 *  whitespace-insensitive string compare (so "Active" matches a "active" rule). */
function looseEquals(cell: unknown, value: unknown): boolean {
  const nc = asNumber(cell)
  const nv = asNumber(value)
  if (nc != null && nv != null) return nc === nv
  if (typeof cell === "boolean" || typeof value === "boolean") {
    return String(cell) === String(value)
  }
  return (
    String(cell).trim().toLowerCase() === String(value).trim().toLowerCase()
  )
}

const VALUELESS_OPERATORS: ReadonlySet<AdvancedFilterOperator> = new Set([
  "isEmpty",
  "isNotEmpty",
])

/**
 * Evaluate one operator against a cell value. Rules whose value input is
 * incomplete are treated as inactive (return true) so a half-typed rule doesn't
 * blank the table. An empty cell only matches `isEmpty` / `notEquals` /
 * `notContains`; every other operator needs a value to compare against.
 */
export function applyOperator(
  cellValue: unknown,
  operator: AdvancedFilterOperator,
  value: unknown,
  value2: unknown
): boolean {
  if (operator === "isEmpty") return isEmptyValue(cellValue)
  if (operator === "isNotEmpty") return !isEmptyValue(cellValue)

  const cellEmpty = isEmptyValue(cellValue)

  if (operator === "between") {
    if (isEmptyValue(value) || isEmptyValue(value2)) return true
    if (cellEmpty) return false
    const lo = compareValues(cellValue, value)
    const hi = compareValues(cellValue, value2)
    return lo >= 0 && hi <= 0
  }

  // A value-requiring operator with no value is inactive.
  if (isEmptyValue(value)) return true

  if (operator === "notEquals")
    return cellEmpty || !looseEquals(cellValue, value)
  if (operator === "notContains") {
    return (
      cellEmpty ||
      !String(cellValue).toLowerCase().includes(String(value).toLowerCase())
    )
  }

  // Remaining operators can't match an empty cell.
  if (cellEmpty) return false

  switch (operator) {
    case "equals":
      return looseEquals(cellValue, value)
    case "contains":
      return String(cellValue)
        .toLowerCase()
        .includes(String(value).toLowerCase())
    case "startsWith":
      return String(cellValue)
        .toLowerCase()
        .startsWith(String(value).toLowerCase())
    case "endsWith":
      return String(cellValue)
        .toLowerCase()
        .endsWith(String(value).toLowerCase())
    case "greaterThan":
      return compareValues(cellValue, value) > 0
    case "greaterThanOrEqual":
      return compareValues(cellValue, value) >= 0
    case "lessThan":
      return compareValues(cellValue, value) < 0
    case "lessThanOrEqual":
      return compareValues(cellValue, value) <= 0
    default:
      return true
  }
}

/** Evaluate a single rule against a row. */
export function evaluateRule<TData extends RowData>(
  row: Row<TData>,
  rule: AdvancedFilterRule
): boolean {
  return applyOperator(
    row.getValue(rule.columnId),
    rule.operator,
    rule.value,
    rule.value2
  )
}

/** Evaluate the whole group against a row (AND/OR over its rules). */
export function evaluateAdvancedFilterGroup<TData extends RowData>(
  row: Row<TData>,
  group: AdvancedFilterGroup
): boolean {
  if (group.rules.length === 0) return true
  return group.logic === "and"
    ? group.rules.every((rule) => evaluateRule(row, rule))
    : group.rules.some((rule) => evaluateRule(row, rule))
}

/** Operators offered for a column, by its filter variant. */
export function getOperatorsForVariant(
  variant: FilterVariant
): AdvancedFilterOperator[] {
  switch (variant) {
    case "select":
    case "multi-select":
      return ["equals", "notEquals", "isEmpty", "isNotEmpty"]
    case "range":
    case "range-slider":
      return [
        "equals",
        "notEquals",
        "greaterThan",
        "greaterThanOrEqual",
        "lessThan",
        "lessThanOrEqual",
        "between",
        "isEmpty",
        "isNotEmpty",
      ]
    case "date":
    case "date-range":
      return [
        "equals",
        "notEquals",
        "greaterThan",
        "lessThan",
        "between",
        "isEmpty",
        "isNotEmpty",
      ]
    case "checkbox":
      return ["equals"]
    default:
      return [
        "contains",
        "notContains",
        "startsWith",
        "endsWith",
        "equals",
        "notEquals",
        "isEmpty",
        "isNotEmpty",
      ]
  }
}

/** Whether an operator hides its value input(s). */
export function isValuelessOperator(operator: AdvancedFilterOperator): boolean {
  return VALUELESS_OPERATORS.has(operator)
}

/** Rebuild a row model from a filtered set of top-level rows, recomputing the
 *  flat list + id map from the kept rows and their descendants. */
function filterRowModel<TData extends RowData>(
  model: RowModel<TData>,
  predicate: (row: Row<TData>) => boolean
): RowModel<TData> {
  const rows = model.rows.filter(predicate)
  const flatRows: Row<TData>[] = []
  const rowsById: Record<string, Row<TData>> = {}
  const collect = (rs: Row<TData>[]) => {
    for (const row of rs) {
      flatRows.push(row)
      rowsById[row.id] = row
      if (row.subRows.length) collect(row.subRows)
    }
  }
  collect(rows)
  return { rows, flatRows, rowsById }
}

/**
 * Wraps TanStack's filtered row model and additionally applies the advanced
 * filter group on top, so both filter systems are active simultaneously. The
 * group is read through `getGroup` at evaluation time (the factory keeps a
 * stable identity to preserve memoization), and results are cached per
 * underlying model + group so they only recompute when something changes.
 */
export function createAdvancedFilteredRowModel<TData extends RowData>(
  getGroup: () => AdvancedFilterGroup
): (table: Table<TData>) => () => RowModel<TData> {
  const base = getFilteredRowModel<TData>()
  return (table) => {
    const delegate = base(table)
    let cachedFor: RowModel<TData> | null = null
    let cachedGroup: AdvancedFilterGroup | null = null
    let cached: RowModel<TData> | null = null
    return () => {
      const model = delegate()
      const group = getGroup()
      if (group.rules.length === 0) return model
      if (cached && cachedFor === model && cachedGroup === group) return cached
      cached = filterRowModel(model, (row) =>
        evaluateAdvancedFilterGroup(row, group)
      )
      cachedFor = model
      cachedGroup = group
      return cached
    }
  }
}
