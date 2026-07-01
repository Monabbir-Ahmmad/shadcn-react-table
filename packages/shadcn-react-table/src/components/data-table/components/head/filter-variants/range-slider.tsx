"use client"

import type { RowData } from "@tanstack/react-table"

import { Slider } from "@workspace/ui/components/slider"

import { getColumnLabel } from "../../../helpers/column-label"
import type { FilterFieldProps } from "./shared"

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
        onValueChange={(next) => {
          // Radix always emits `number[]`; Base UI emits `number` for a
          // single-thumb slider. Normalize to a pair so both flavors index
          // safely.
          const pair = Array.isArray(next) ? next : [next, next]
          column.setFilterValue(
            pair[0] === min && pair[1] === max ? undefined : pair
          )
        }}
        aria-label={getColumnLabel(column)}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
        <span>{current[0]}</span>
        <span>{current[1]}</span>
      </div>
    </div>
  )
}
