"use client"

import type { RowData } from "@tanstack/react-table"

import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

import { getColumnLabel } from "../../../helpers/column-label"
import { parseDate } from "../../../helpers/parse-date"
import {
  calendarFormatters,
  CALENDAR_NAV_PROPS,
  FIELD_CLASS,
  formatDate,
  type FilterFieldProps,
} from "./shared"
import { dt } from "../../../core/internal"

export function DateRangeFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization, icons } = dt(table)
  const value = (column.getFilterValue() as [Date?, Date?]) ?? [
    undefined,
    undefined,
  ]
  const from = value[0]
  const to = value[1]
  const shown =
    from || to
      ? `${from ? formatDate(from, localization.language) : "…"} – ${to ? formatDate(to, localization.language) : "…"}`
      : localization.pickDateRange
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            FIELD_CLASS,
            "w-full justify-start gap-2 px-2 font-normal"
          )}
          // The visible text is part of the name (WCAG 2.5.3).
          aria-label={`${localization.filterByColumn(getColumnLabel(column))}: ${shown}`}
        >
          <icons.calendar className="text-muted-foreground" />
          {from || to ? (
            <span className="truncate">
              {from ? formatDate(from, localization.language) : "…"} –{" "}
              {to ? formatDate(to, localization.language) : "…"}
            </span>
          ) : (
            <span className="truncate text-muted-foreground">
              {localization.pickDateRange}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from, to }}
          // Open on the range's month, not today's.
          defaultMonth={parseDate(from) ?? parseDate(to) ?? undefined}
          onSelect={(range) =>
            column.setFilterValue(
              range?.from || range?.to ? [range?.from, range?.to] : undefined
            )
          }
          autoFocus
          formatters={calendarFormatters(localization.language)}
          {...CALENDAR_NAV_PROPS}
        />
      </PopoverContent>
    </Popover>
  )
}
