"use client"

import type { RowData } from "@tanstack/react-table"

import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

import type { DataTableInstance } from "../../../core/types"
import { dt } from "../../../core/internal"

/** Funnel toggle that shows/hides the filter row. */
export function DataTableFilterToggle<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const { localization, icons, showColumnFilters, setShowColumnFilters } =
    dt(table)
  const label = showColumnFilters
    ? localization.hideColumnFilters
    : localization.showColumnFilters
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          // Shown: the button's secondary variant.
          variant={showColumnFilters ? "secondary" : "outline"}
          size="icon"
          aria-label={label}
          aria-pressed={showColumnFilters}
          onClick={() => setShowColumnFilters((prev) => !prev)}
        >
          <icons.filter />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
