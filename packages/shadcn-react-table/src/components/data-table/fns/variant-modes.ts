import type { FilterVariant } from "../core/types"
import type { FilterMode } from "./filter-modes"

/** Default mode for a variant when the consumer hasn't chosen one. */
export function defaultModeForVariant(variant: FilterVariant): FilterMode {
  switch (variant) {
    case "range":
    case "range-slider":
      // Inclusive, like MRT: a slider at [min, x] must keep rows equal to min.
      return "betweenInclusive"
    case "date":
    case "datetime":
    case "time":
      return "equals"
    case "date-range":
    case "datetime-range":
    case "time-range":
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
    case "autocomplete":
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
        "betweenInclusive",
        "between",
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
    case "datetime":
    case "datetime-range":
    case "time":
    case "time-range":
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
