"use client"

import type { RowData } from "@tanstack/react-table"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

import { getColumnLabel } from "../../../helpers/column-label"
import { FIELD_CLASS, useSelectOptions, type FilterFieldProps } from "./shared"
import { dt } from "../../../core/internal"

export function MultiSelectFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization } = dt(table)
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
          className={cn(FIELD_CLASS, "w-full justify-between")}
          aria-label={localization.filterByColumn(getColumnLabel(column))}
        >
          {selected.length > 0 ? (
            <span className="flex min-w-0 items-center gap-1">
              <Badge variant="secondary">{selected.length}</Badge>
              <span className="truncate">{selected.join(", ")}</span>
            </span>
          ) : (
            <span className="truncate text-muted-foreground">
              {localization.filterPlaceholder(getColumnLabel(column))}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder={localization.search} />
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
                  >
                    <Checkbox
                      checked={isSelected}
                      className="pointer-events-none"
                    />
                    <span className="flex-1 truncate">{option.label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
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
