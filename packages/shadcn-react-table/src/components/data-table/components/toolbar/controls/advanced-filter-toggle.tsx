"use client"

import type { RowData } from "@tanstack/react-table"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

import type { DataTableInstance } from "../../../core/types"
import { dt } from "../../../core/internal"

/** Toolbar button that opens the advanced filter panel; badges the active-rule
 *  count when any rules are set. */
export function DataTableAdvancedFilterToggle<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const {
    localization,
    icons,
    advancedFilter,
    showAdvancedFilterPanel,
    setShowAdvancedFilterPanel,
  } = dt(table)
  const count = advancedFilter.rules.length

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          // Open or holding rules: the button's secondary variant.
          variant={
            showAdvancedFilterPanel || count > 0 ? "secondary" : "outline"
          }
          size="icon"
          aria-label={localization.advancedFilters}
          aria-pressed={showAdvancedFilterPanel}
          onClick={() => setShowAdvancedFilterPanel((prev) => !prev)}
          className="relative"
        >
          <icons.advancedFilter />
          {count > 0 && (
            <Badge className="absolute -end-2 -top-2">{count}</Badge>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{localization.advancedFilters}</TooltipContent>
    </Tooltip>
  )
}
