"use client"

import type { RowData } from "@tanstack/react-table"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

import type { DataTableInstance } from "../../../core/types"

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
  } = table.cnTable
  const count = advancedFilter.rules.length

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={localization.advancedFilters}
          aria-pressed={showAdvancedFilterPanel}
          onClick={() => setShowAdvancedFilterPanel((prev) => !prev)}
          className={cn(
            "relative size-8",
            (showAdvancedFilterPanel || count > 0) && "bg-muted text-foreground"
          )}
        >
          <icons.advancedFilter />
          {count > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 size-4 justify-center rounded-full p-0 text-[10px] tabular-nums">
              {count}
            </Badge>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{localization.advancedFilters}</TooltipContent>
    </Tooltip>
  )
}
