"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@workspace/ui/components/input-group"
import { cn } from "@workspace/ui/lib/utils"

import { dt } from "../../../core/internal"
import type {
  DataTableFilterOption,
  DataTableInstance,
} from "../../../core/types"
import type { DataTableColumn } from "../../../core/table-types"
import { DataTableFilterModeMenu } from "../../menus/data-table-filter-mode-menu"

export interface FilterFieldProps<TData extends RowData, TValue> {
  column: DataTableColumn<TData, TValue>
  table: DataTableInstance<TData>
}

export const FIELD_CLASS =
  "h-8 rounded-sm text-xs font-normal tracking-normal normal-case"

/** The control inside a `FilterInputGroup` (the group carries the height). */
export const GROUP_CONTROL_CLASS =
  "h-full text-xs font-normal tracking-normal normal-case"

const GREGORIAN = "gregory"

/**
 * A formatter per language, built once. A malformed tag ("en_US", "") falls
 * back to English and the fallback is cached under that tag, so a bad tag does
 * not throw on every render.
 */
function memoizeByLanguage<T>(
  build: (language: string) => T
): (language: string) => T {
  const cache = new Map<string, T>()
  return (language) => {
    let value = cache.get(language)
    if (value === undefined) {
      try {
        value = build(language)
      } catch {
        // A malformed tag must not take the table down.
        value = build("en")
      }
      cache.set(language, value)
    }
    return value
  }
}

const getDateFormatter = memoizeByLanguage(
  (language) =>
    new Intl.DateTimeFormat(language, {
      dateStyle: "medium",
      calendar: GREGORIAN,
    })
)

/** A filter date in the localization's language (date-fns "PP" equivalent).
 *  Always Gregorian, like the picker. Falls back to English when the language
 *  tag is malformed. */
export function formatDate(value: Date, language: string): string {
  return getDateFormatter(language).format(value)
}

/** react-day-picker formatters that render the calendar in `language`. */
export type CalendarFormatters = Record<
  | "formatCaption"
  | "formatMonthDropdown"
  | "formatYearDropdown"
  | "formatWeekdayName"
  | "formatDay",
  (date: Date) => string
>

export const calendarFormatters = memoizeByLanguage(
  (language): CalendarFormatters => {
    const format = (options: Intl.DateTimeFormatOptions) => {
      const formatter = new Intl.DateTimeFormat(language, {
        ...options,
        calendar: GREGORIAN,
      })
      return (date: Date) => formatter.format(date)
    }
    return {
      formatCaption: format({ month: "long", year: "numeric" }),
      formatMonthDropdown: format({ month: "short" }),
      formatYearDropdown: format({ year: "numeric" }),
      formatWeekdayName: format({ weekday: "short" }),
      formatDay: format({ day: "numeric" }),
    }
  }
)

export const BETWEEN_MODES = new Set(["between", "betweenInclusive"])

/**
 * Shared Calendar props so the month/year dropdowns are usable regardless of
 * which base Calendar component the consumer ships. The year dropdown derives
 * its options from the startMonth/endMonth range.
 */
export const CALENDAR_NAV_PROPS = {
  captionLayout: "dropdown",
  startMonth: new Date(new Date().getFullYear() - 100, 0),
  endMonth: new Date(new Date().getFullYear() + 10, 11),
} as const

/**
 * The input group a text-like filter renders in: the filter-mode menu leads
 * (unless `modeMenu` is off), the control fills the middle, and a clear button
 * trails when `onClear` is given (pass it only while there is a value).
 */
export function FilterInputGroup<TData extends RowData, TValue>({
  column,
  table,
  modeMenu = true,
  onClear,
  clearLabel,
  className,
  children,
}: FilterFieldProps<TData, TValue> & {
  modeMenu?: boolean
  onClear?: () => void
  /** Defaults to `localization.clearFilter`. */
  clearLabel?: string
  className?: string
  children: React.ReactNode
}) {
  const { localization, icons } = dt(table)
  return (
    <InputGroup className={cn("h-8 rounded-sm", className)}>
      {modeMenu && (
        <DataTableFilterModeMenu column={column} table={table} addon />
      )}
      {children}
      {onClear && (
        <InputGroupAddon align="inline-end" className="py-0">
          <InputGroupButton
            size="icon-xs"
            aria-label={clearLabel ?? localization.clearFilter}
            onClick={onClear}
            className="text-muted-foreground"
          >
            <icons.clear className="size-3.5" />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

/** A muted, dashed field shown for valueless modes (empty / not empty), with
 *  the mode menu inside so the mode can be changed back. */
export function ValuelessLabel<TData extends RowData, TValue>({
  column,
  table,
  label,
}: FilterFieldProps<TData, TValue> & { label: string }) {
  return (
    <FilterInputGroup
      column={column}
      table={table}
      className="border-dashed border-border"
    >
      <InputGroupText className="min-w-0 px-2 text-xs">
        <span className="truncate">{label}</span>
      </InputGroupText>
    </FilterInputGroup>
  )
}

/** Options for select-style variants: explicit `meta.filterSelectOptions` or faceted values. */
export function useSelectOptions<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>
): { options: DataTableFilterOption[]; counts: Map<string, number> } {
  const facets = column.getFacetedUniqueValues()
  return React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const [value, count] of facets) {
      if (value == null) continue
      counts.set(String(value), count)
    }
    const explicit = column.columnDef.meta?.filterSelectOptions
    if (explicit && explicit.length > 0) {
      return { options: explicit, counts }
    }
    const options = Array.from(counts.keys())
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ label: value, value }))
    return { options, counts }
  }, [facets, column.columnDef.meta?.filterSelectOptions])
}

/** A text input in a `FilterInputGroup`, with a clear button while it has a
 *  value. */
export function ClearableInput<TData extends RowData, TValue>({
  column,
  table,
  value,
  onChange,
  placeholder,
  ariaLabel,
  list,
}: FilterFieldProps<TData, TValue> & {
  value: string
  onChange: (next: string) => void
  placeholder: string
  ariaLabel: string
  /** Id of a `<datalist>` of suggestions. */
  list?: string
}) {
  return (
    <FilterInputGroup
      column={column}
      table={table}
      onClear={value ? () => onChange("") : undefined}
    >
      <InputGroupInput
        list={list}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={GROUP_CONTROL_CLASS}
      />
    </FilterInputGroup>
  )
}
