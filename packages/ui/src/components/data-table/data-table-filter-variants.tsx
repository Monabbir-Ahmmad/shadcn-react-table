"use client"

import * as React from "react"
import type { Column, RowData } from "@tanstack/react-table"
import { format } from "date-fns"

import { Badge } from "@monabbir/tablecn/components/badge"
import { Button } from "@monabbir/tablecn/components/button"
import { Calendar } from "@monabbir/tablecn/components/calendar"
import { Checkbox } from "@monabbir/tablecn/components/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@monabbir/tablecn/components/command"
import { Input } from "@monabbir/tablecn/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@monabbir/tablecn/components/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monabbir/tablecn/components/select"
import { Slider } from "@monabbir/tablecn/components/slider"
import { cn } from "@monabbir/tablecn/lib/utils"

import { getColumnLabel } from "./data-table-column-actions"
import { getEffectiveMode } from "./data-table-filter-mode-menu"
import { VALUELESS_MODES } from "./filter-fns"
import type { IconComponent } from "./icons"
import type { DataTableFilterOption, DataTableInstance } from "./types"

export interface FilterFieldProps<TData extends RowData, TValue> {
  column: Column<TData, TValue>
  table: DataTableInstance<TData>
}

const FIELD_CLASS =
  "h-8 rounded-sm text-xs font-normal tracking-normal normal-case"

const BETWEEN_MODES = new Set(["between", "betweenInclusive"])

/** A muted pill shown for valueless modes (empty / not empty). */
function ValuelessLabel({ label }: { label: string }) {
  return (
    <div className="flex h-8 items-center rounded-sm border border-dashed px-2 text-xs text-muted-foreground">
      {label}
    </div>
  )
}

/** Options for select-style variants: explicit `meta.options` or faceted values. */
function useSelectOptions<TData extends RowData, TValue>(
  column: Column<TData, TValue>
): { options: DataTableFilterOption[]; counts: Map<string, number> } {
  const facets = column.getFacetedUniqueValues()
  return React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const [value, count] of facets) {
      if (value == null) continue
      counts.set(String(value), count)
    }
    const explicit = column.columnDef.meta?.options
    if (explicit && explicit.length > 0) {
      return { options: explicit, counts }
    }
    const options = Array.from(counts.keys())
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ label: value, value }))
    return { options, counts }
  }, [facets, column.columnDef.meta?.options])
}

export function TextFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization, icons } = table.cnTable
  const mode = getEffectiveMode(column, table)
  if (VALUELESS_MODES.has(mode)) {
    return <ValuelessLabel label={localization.filterModes[mode] ?? mode} />
  }
  const value = (column.getFilterValue() ?? "") as string
  return (
    <ClearableInput
      value={value}
      onChange={(next) => column.setFilterValue(next || undefined)}
      placeholder={localization.filterPlaceholder(getColumnLabel(column))}
      ariaLabel={localization.filterByColumn(getColumnLabel(column))}
      clearLabel={localization.clearFilter}
      ClearIcon={icons.clear}
    />
  )
}

export function NumberFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization } = table.cnTable
  const mode = getEffectiveMode(column, table)

  if (VALUELESS_MODES.has(mode)) {
    return <ValuelessLabel label={localization.filterModes[mode] ?? mode} />
  }

  if (BETWEEN_MODES.has(mode)) {
    const value = (column.getFilterValue() ?? ["", ""]) as [
      string | number,
      string | number,
    ]
    const setBound = (index: 0 | 1, next: string) => {
      const draft: [string | number, string | number] = [
        value[0] ?? "",
        value[1] ?? "",
      ]
      draft[index] = next
      column.setFilterValue(
        draft[0] === "" && draft[1] === "" ? undefined : draft
      )
    }
    return (
      <div className="flex items-center gap-1">
        <Input
          type="number"
          inputMode="decimal"
          value={String(value[0] ?? "")}
          onChange={(e) => setBound(0, e.target.value)}
          placeholder={localization.min}
          aria-label={localization.min}
          className={FIELD_CLASS}
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="number"
          inputMode="decimal"
          value={String(value[1] ?? "")}
          onChange={(e) => setBound(1, e.target.value)}
          placeholder={localization.max}
          aria-label={localization.max}
          className={FIELD_CLASS}
        />
      </div>
    )
  }

  const value = (column.getFilterValue() ?? "") as string
  return (
    <Input
      type="number"
      inputMode="decimal"
      value={value}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      placeholder={localization.filterPlaceholder(getColumnLabel(column))}
      aria-label={localization.filterByColumn(getColumnLabel(column))}
      className={FIELD_CLASS}
    />
  )
}

export function RangeSliderFilterField<TData extends RowData, TValue>({
  column,
}: FilterFieldProps<TData, TValue>) {
  const facetedMinMax = column.getFacetedMinMaxValues()
  const min = Math.floor(facetedMinMax?.[0] ?? 0)
  const max = Math.ceil(facetedMinMax?.[1] ?? 100)
  const value = (column.getFilterValue() ?? [min, max]) as [number, number]
  const current: [number, number] = [
    value[0] === ("" as unknown) || value[0] == null ? min : Number(value[0]),
    value[1] === ("" as unknown) || value[1] == null ? max : Number(value[1]),
  ]
  return (
    <div className="flex flex-col gap-1.5 px-1 pt-1">
      <Slider
        min={min}
        max={max}
        step={1}
        value={current}
        onValueChange={(next) =>
          column.setFilterValue(
            next[0] === min && next[1] === max ? undefined : next
          )
        }
        aria-label={getColumnLabel(column)}
      />
      <div className="flex justify-between text-[10px] tabular-nums text-muted-foreground">
        <span>{current[0]}</span>
        <span>{current[1]}</span>
      </div>
    </div>
  )
}

export function SelectFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization, icons } = table.cnTable
  const { options } = useSelectOptions(column)
  const value = (column.getFilterValue() as string) || ""
  return (
    <div className="flex items-center gap-1">
      <Select
        value={value || undefined}
        onValueChange={(next) => column.setFilterValue(next || undefined)}
      >
        <SelectTrigger
          size="sm"
          className={cn(FIELD_CLASS, "flex-1 px-2")}
          aria-label={localization.filterByColumn(getColumnLabel(column))}
        >
          <SelectValue
            placeholder={localization.filterPlaceholder(getColumnLabel(column))}
          />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={localization.clearFilter}
          onClick={() => column.setFilterValue(undefined)}
          className="size-7"
        >
          <icons.clear />
        </Button>
      )}
    </div>
  )
}

export function MultiSelectFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization } = table.cnTable
  const { options, counts } = useSelectOptions(column)
  const selected = (column.getFilterValue() as string[]) ?? []

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    column.setFilterValue(next.length > 0 ? next : undefined)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(FIELD_CLASS, "w-full justify-between px-2 font-normal")}
          aria-label={localization.filterByColumn(getColumnLabel(column))}
        >
          {selected.length > 0 ? (
            <span className="flex items-center gap-1">
              <Badge variant="secondary" className="rounded-sm px-1">
                {selected.length}
              </Badge>
              <span className="truncate">{selected.join(", ")}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">
              {localization.filterPlaceholder(getColumnLabel(column))}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder={localization.search} className="h-8" />
          <CommandList>
            <CommandEmpty>{localization.noRecordsToDisplay}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => toggle(option.value)}
                    className="gap-2"
                  >
                    <Checkbox checked={isSelected} className="pointer-events-none" />
                    <span className="flex-1 truncate">{option.label}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {counts.get(option.value) ?? 0}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function CheckboxFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization } = table.cnTable
  const value = column.getFilterValue()
  const checked = value === true
  return (
    <label className="flex h-8 items-center gap-2 text-xs text-muted-foreground">
      <Checkbox
        checked={checked}
        onCheckedChange={(next) =>
          column.setFilterValue(next === true ? true : undefined)
        }
        aria-label={localization.filterByColumn(getColumnLabel(column))}
      />
      {getColumnLabel(column)}
    </label>
  )
}

export function DateFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization, icons } = table.cnTable
  const mode = getEffectiveMode(column, table)

  if (VALUELESS_MODES.has(mode)) {
    return <ValuelessLabel label={localization.filterModes[mode] ?? mode} />
  }

  // The `betweenDates` mode (and the date-range variant) selects a range.
  if (mode === "betweenDates") {
    return <DateRangeFilterField column={column} table={table} />
  }

  const value = column.getFilterValue() as Date | undefined
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(FIELD_CLASS, "w-full justify-start gap-2 px-2 font-normal")}
          aria-label={localization.filterByColumn(getColumnLabel(column))}
        >
          <icons.calendar className="text-muted-foreground" />
          {value ? (
            format(value, "PP")
          ) : (
            <span className="text-muted-foreground">{localization.pickDate}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => column.setFilterValue(date ?? undefined)}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export function DateRangeFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization, icons } = table.cnTable
  const value = (column.getFilterValue() as [Date?, Date?]) ?? [undefined, undefined]
  const from = value[0]
  const to = value[1]
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(FIELD_CLASS, "w-full justify-start gap-2 px-2 font-normal")}
          aria-label={localization.filterByColumn(getColumnLabel(column))}
        >
          <icons.calendar className="text-muted-foreground" />
          {from || to ? (
            <span>
              {from ? format(from, "PP") : "…"} – {to ? format(to, "PP") : "…"}
            </span>
          ) : (
            <span className="text-muted-foreground">
              {localization.pickDateRange}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from, to }}
          onSelect={(range) =>
            column.setFilterValue(
              range?.from || range?.to ? [range?.from, range?.to] : undefined
            )
          }
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

/** A text input with a trailing clear affordance. */
function ClearableInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  clearLabel,
  ClearIcon,
}: {
  value: string
  onChange: (next: string) => void
  placeholder: string
  ariaLabel: string
  clearLabel: string
  ClearIcon: IconComponent
}) {
  return (
    <div className="relative flex-1">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(FIELD_CLASS, value && "pr-7")}
      />
      {value && (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-1.5 flex items-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <ClearIcon className="size-3.5" />
        </button>
      )}
    </div>
  )
}
