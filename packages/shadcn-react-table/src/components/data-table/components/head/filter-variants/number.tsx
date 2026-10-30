"use client"

import type { RowData } from "@tanstack/react-table"

import { InputGroupInput } from "@workspace/ui/components/input-group"

import { VALUELESS_MODES } from "../../../fns/filter-fns"
import { getColumnLabel } from "../../../helpers/column-label"
import { getEffectiveMode } from "../../../helpers/effective-filter-mode"
import {
  BETWEEN_MODES,
  FilterInputGroup,
  GROUP_CONTROL_CLASS,
  RANGE_GROUP_CLASS,
  ValuelessLabel,
  type FilterFieldProps,
} from "./shared"
import { dt } from "../../../core/internal"

export function NumberFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization } = dt(table)
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
        <FilterInputGroup
          column={column}
          table={table}
          onClear={
            value[0] !== "" && value[0] != null
              ? () => setBound(0, "")
              : undefined
          }
          clearLabel={`${localization.clearFilter} (${localization.min})`}
          className={RANGE_GROUP_CLASS}
        >
          <InputGroupInput
            type="number"
            inputMode="decimal"
            value={String(value[0] ?? "")}
            onChange={(e) => setBound(0, e.target.value)}
            placeholder={localization.min}
            aria-label={localization.min}
            className={GROUP_CONTROL_CLASS}
          />
        </FilterInputGroup>
        <span className="text-muted-foreground">–</span>
        <FilterInputGroup
          column={column}
          table={table}
          modeMenu={false}
          onClear={
            value[1] !== "" && value[1] != null
              ? () => setBound(1, "")
              : undefined
          }
          clearLabel={`${localization.clearFilter} (${localization.max})`}
          className={RANGE_GROUP_CLASS}
        >
          <InputGroupInput
            type="number"
            inputMode="decimal"
            value={String(value[1] ?? "")}
            onChange={(e) => setBound(1, e.target.value)}
            placeholder={localization.max}
            aria-label={localization.max}
            className={GROUP_CONTROL_CLASS}
          />
        </FilterInputGroup>
      </div>
    )
  }

  const value = (column.getFilterValue() ?? "") as string
  return (
    <FilterInputGroup
      column={column}
      table={table}
      onClear={
        value !== "" ? () => column.setFilterValue(undefined) : undefined
      }
    >
      <InputGroupInput
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        placeholder={localization.filterPlaceholder(getColumnLabel(column))}
        aria-label={localization.filterByColumn(getColumnLabel(column))}
        className={GROUP_CONTROL_CLASS}
      />
    </FilterInputGroup>
  )
}
