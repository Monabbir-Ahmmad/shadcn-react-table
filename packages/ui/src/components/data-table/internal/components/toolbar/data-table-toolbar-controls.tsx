"use client"

import type { RowData } from "@tanstack/react-table"

import { Button } from "@monabbir/tablecn/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@monabbir/tablecn/components/tooltip"
import { cn } from "@monabbir/tablecn/lib/utils"

import { DENSITY_ORDER } from "../../../types"
import type { DataTableInstance } from "../../../types"

/** Funnel toggle that shows/hides the filter row. */
export function DataTableFilterToggle<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const { localization, icons, showColumnFilters, setShowColumnFilters } =
    table.cnTable
  const label = showColumnFilters
    ? localization.hideColumnFilters
    : localization.showColumnFilters
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={label}
          aria-pressed={showColumnFilters}
          onClick={() => setShowColumnFilters((prev) => !prev)}
          className={cn("size-8", showColumnFilters && "bg-muted text-foreground")}
        >
          <icons.filter />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

const DENSITY_LABEL_KEYS = {
  comfortable: "densityComfortable",
  compact: "densityCompact",
  spacious: "densitySpacious",
} as const

/** Single button that cycles comfortable → compact → spacious. */
export function DataTableDensityToggle<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const { localization, icons, density, setDensity } = table.cnTable
  const currentLabel = localization[DENSITY_LABEL_KEYS[density]]
  const label = `${localization.toggleDensity} (${currentLabel})`
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={label}
          className="size-8"
          onClick={() =>
            setDensity((prev) => {
              const next =
                DENSITY_ORDER[
                  (DENSITY_ORDER.indexOf(prev) + 1) % DENSITY_ORDER.length
                ]
              return next ?? "comfortable"
            })
          }
        >
          <icons.density />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** Full-screen toggle (state-driven; the surface fixes itself to the viewport). */
export function DataTableFullscreenToggle<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const { localization, icons, isFullscreen, setIsFullscreen } = table.cnTable
  const label = isFullscreen
    ? localization.exitFullscreen
    : localization.enterFullscreen
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={label}
          aria-pressed={isFullscreen}
          onClick={() => setIsFullscreen((prev) => !prev)}
          className="size-8"
        >
          {isFullscreen ? <icons.fullscreenExit /> : <icons.fullscreenEnter />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
