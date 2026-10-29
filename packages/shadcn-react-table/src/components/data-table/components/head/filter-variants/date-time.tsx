"use client"

import type { RowData } from "@tanstack/react-table"
import { format } from "date-fns"

import { Input } from "@workspace/ui/components/input"

import { VALUELESS_MODES } from "../../../fns/filter-fns"
import { getColumnLabel } from "../../../helpers/column-label"
import { getEffectiveMode } from "../../../helpers/effective-filter-mode"
import { parseDate } from "../../../helpers/parse-date"
import { FIELD_CLASS, ValuelessLabel, type FilterFieldProps } from "./shared"
import { dt } from "../../../core/internal"

type Kind = "datetime" | "time"

/** The native input's value for a filter value: a Date for date-times, an
 *  "HH:mm" string for times. */
function toInputValue(kind: Kind, value: unknown): string {
  if (kind === "time") return typeof value === "string" ? value : ""
  const date = parseDate(value)
  return date ? format(date, "yyyy-MM-dd'T'HH:mm") : ""
}

function fromInputValue(kind: Kind, value: string): Date | string | undefined {
  if (value === "") return undefined
  // A "yyyy-MM-ddTHH:mm" string without an offset is read as local time.
  return kind === "time" ? value : (parseDate(value) ?? undefined)
}

/** A native date-time or time input; the `betweenDates` mode (and the range
 *  variants) shows two. */
export function DateTimeFilterField<TData extends RowData, TValue>({
  column,
  table,
  kind,
}: FilterFieldProps<TData, TValue> & { kind: Kind }) {
  const { localization } = dt(table)
  const mode = getEffectiveMode(column, table)
  const label = localization.filterByColumn(getColumnLabel(column))
  const type = kind === "time" ? "time" : "datetime-local"

  if (VALUELESS_MODES.has(mode)) {
    return <ValuelessLabel label={localization.filterModes[mode] ?? mode} />
  }

  if (mode === "betweenDates") {
    const value = (column.getFilterValue() ?? []) as unknown[]
    const setBound = (index: 0 | 1, next: string) => {
      const draft = [value[0], value[1]]
      draft[index] = fromInputValue(kind, next)
      column.setFilterValue(
        draft[0] == null && draft[1] == null ? undefined : draft
      )
    }
    return (
      <div className="flex items-center gap-1">
        <Input
          type={type}
          value={toInputValue(kind, value[0])}
          onChange={(e) => setBound(0, e.target.value)}
          aria-label={`${label} (${localization.min})`}
          className={FIELD_CLASS}
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type={type}
          value={toInputValue(kind, value[1])}
          onChange={(e) => setBound(1, e.target.value)}
          aria-label={`${label} (${localization.max})`}
          className={FIELD_CLASS}
        />
      </div>
    )
  }

  return (
    <Input
      type={type}
      value={toInputValue(kind, column.getFilterValue())}
      onChange={(e) =>
        column.setFilterValue(fromInputValue(kind, e.target.value))
      }
      aria-label={label}
      className={FIELD_CLASS}
    />
  )
}
