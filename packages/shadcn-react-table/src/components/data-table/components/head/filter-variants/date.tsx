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

import { VALUELESS_MODES } from "../../../fns/filter-fns"
import { getColumnLabel } from "../../../helpers/column-label"
import { getEffectiveMode } from "../../../helpers/effective-filter-mode"
import { parseDate } from "../../../helpers/parse-date"
import { DateRangeFilterField } from "./date-range"
import {
  calendarFormatters,
  CALENDAR_NAV_PROPS,
  FilterInputGroup,
  formatDate,
  GROUP_CONTROL_CLASS,
  ValuelessLabel,
  type FilterFieldProps,
} from "./shared"
import { dt } from "../../../core/internal"

export function DateFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization, icons } = dt(table)
  const mode = getEffectiveMode(column, table)

  if (VALUELESS_MODES.has(mode)) {
    return (
      <ValuelessLabel
        column={column}
        table={table}
        label={localization.filterModes[mode] ?? mode}
      />
    )
  }

  // The `betweenDates` mode (and the date-range variant) selects a range.
  if (mode === "betweenDates") {
    return <DateRangeFilterField column={column} table={table} />
  }

  const value = column.getFilterValue() as Date | undefined
  const shown = value
    ? formatDate(value, localization.language)
    : localization.pickDate
  return (
    <FilterInputGroup
      column={column}
      table={table}
      onClear={value ? () => column.setFilterValue(undefined) : undefined}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            data-slot="input-group-control"
            className={cn(
              GROUP_CONTROL_CLASS,
              "min-w-0 flex-1 justify-start gap-2 px-2 hover:bg-transparent focus-visible:ring-0 aria-expanded:bg-transparent"
            )}
            // The visible text is part of the name (WCAG 2.5.3).
            aria-label={`${localization.filterByColumn(getColumnLabel(column))}: ${shown}`}
          >
            <icons.calendar className="text-muted-foreground" />
            {value ? (
              <span className="truncate">
                {formatDate(value, localization.language)}
              </span>
            ) : (
              <span className="truncate text-muted-foreground">
                {localization.pickDate}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            // Open on the picked date's month, not today's.
            defaultMonth={parseDate(value) ?? undefined}
            onSelect={(date) => column.setFilterValue(date ?? undefined)}
            autoFocus
            formatters={calendarFormatters(localization.language)}
            {...CALENDAR_NAV_PROPS}
          />
        </PopoverContent>
      </Popover>
    </FilterInputGroup>
  )
}
