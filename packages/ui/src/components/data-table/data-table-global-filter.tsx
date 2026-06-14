"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"

import { Button } from "@monabbir/tablecn/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@monabbir/tablecn/components/dropdown-menu"
import { Input } from "@monabbir/tablecn/components/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@monabbir/tablecn/components/tooltip"
import { cn } from "@monabbir/tablecn/lib/utils"

import type { GlobalFilterMode } from "./filter-fns"
import type { DataTableInstance } from "./types"

const GLOBAL_MODES: GlobalFilterMode[] = [
  "fuzzy",
  "contains",
  "startsWith",
  "endsWith",
  "equals",
]

/**
 * Expandable global search (MRT order: first in the toolbar icon cluster). The
 * search button expands into an input with a leading icon, an optional
 * search-mode menu, and a clear affordance. Input is debounced in manual
 * (server) mode so each keystroke doesn't fire a request.
 */
export function DataTableGlobalFilter<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const {
    localization,
    icons,
    enableGlobalFilter,
    enableGlobalFilterModes,
    globalFilterMode,
    setGlobalFilterMode,
  } = table.cnTable

  const external = (table.getState().globalFilter ?? "") as string
  const [expanded, setExpanded] = React.useState(external.length > 0)
  const [value, setValue] = React.useState(external)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const debounceMs = table.options.manualFiltering ? 300 : 0

  React.useEffect(() => {
    if (value === (table.getState().globalFilter ?? "")) return
    const id = setTimeout(
      () => table.setGlobalFilter(value || undefined),
      debounceMs
    )
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, debounceMs])

  if (!enableGlobalFilter) return null

  if (!expanded) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label={localization.search}
            className="size-8"
            onClick={() => {
              setExpanded(true)
              requestAnimationFrame(() => inputRef.current?.focus())
            }}
          >
            <icons.search />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{localization.search}</TooltipContent>
      </Tooltip>
    )
  }

  const clear = () => {
    setValue("")
    table.setGlobalFilter(undefined)
    setExpanded(false)
  }

  return (
    <div className="flex h-9 items-center gap-0.5 rounded-md border bg-background pr-1 pl-2 focus-within:border-ring">
      <icons.search className="size-3.5 shrink-0 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          if (!value) setExpanded(false)
        }}
        placeholder={localization.searchPlaceholder}
        aria-label={localization.search}
        className={cn(
          "h-7 w-40 border-0 px-1 text-xs font-normal tracking-normal normal-case shadow-none focus-visible:ring-0 sm:w-56"
        )}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={localization.clearSearch}
          onClick={clear}
          className="size-7"
        >
          <icons.clear />
        </Button>
      )}
      {enableGlobalFilterModes && (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={localization.globalFilterMode}
                  className="size-7"
                >
                  <icons.search className="size-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>{localization.globalFilterMode}</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              {localization.globalFilterMode}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={globalFilterMode}
              onValueChange={(mode) =>
                setGlobalFilterMode(mode as GlobalFilterMode)
              }
            >
              {GLOBAL_MODES.map((mode) => (
                <DropdownMenuRadioItem key={mode} value={mode}>
                  {localization.filterModes[mode] ?? mode}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
