"use client"

import type { ColumnFiltersState, RowData } from "@tanstack/react-table"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"

import type { DataTableFilterOption, DataTableInstance } from "../../core/types"
import { dt } from "../../core/internal"

interface DataTableFacetFilterProps<TData extends RowData> {
  table: DataTableInstance<TData>
  /**
   * The `columnFilters` id it reads and writes. It need not be a visible column: a filter on a
   * derived value (a bucket, "raised by me") keeps an id of its own, and a server-filtered table
   * reads it from its state like any other.
   */
  columnId: string
  /** The button's label. Defaults to the column's header. */
  title?: string
  /** Defaults to the column's `meta.filterSelectOptions`. */
  options?: readonly DataTableFilterOption[]
  /** Several values at once (the filter value is a string array) instead of one. */
  multiple?: boolean
  /** The single-choice option that clears the filter. */
  anyLabel?: string
  /** Heading over a multi-choice list, e.g. "Show loans that are". */
  menuLabel?: string
  /** A count beside each option, by option value. */
  counts?: Readonly<Record<string, number>>
  /**
   * Controlled from outside the table — a filter the page applies itself (e.g. one the summary
   * cells above also set). Given, the table's `columnFilters` are neither read nor written.
   */
  value?: string | readonly string[]
  onValueChange?: (value: string | string[] | undefined) => void
}

function readValue(filters: ColumnFiltersState, id: string): unknown {
  return filters.find((f) => f.id === id)?.value
}

/**
 * A toolbar filter on one `columnFilters` entry: a button, dashed while nothing is picked, naming
 * the pick in a badge, over a single- or multi-choice menu. The faceted filter of the shadcn table
 * examples, for filters kept on the toolbar rather than in the header filter row. Writes through
 * `table.setColumnFilters`, so a controlled table (URL-synced state) sees every change.
 */
export function DataTableFacetFilter<TData extends RowData>({
  table,
  columnId,
  title,
  options: given,
  multiple = false,
  anyLabel,
  menuLabel,
  counts,
  value: controlled,
  onValueChange,
}: DataTableFacetFilterProps<TData>) {
  const { localization, icons } = dt(table)
  // Not `getColumn`: a filter-only id has no column, and TanStack warns on a missing one.
  const column = table.getAllLeafColumns().find((c) => c.id === columnId)
  const options = given ?? column?.columnDef.meta?.filterSelectOptions ?? []
  const label =
    title ??
    (typeof column?.columnDef.header === "string"
      ? column.columnDef.header
      : columnId)
  const isControlled = onValueChange !== undefined
  const raw = isControlled
    ? controlled
    : readValue(table.getState().columnFilters, columnId)

  const set = (value: string | string[] | undefined) => {
    const empty =
      value === undefined || (Array.isArray(value) && value.length === 0)
    if (isControlled) return onValueChange(empty ? undefined : value)
    table.setColumnFilters((prev) => {
      const rest = prev.filter((f) => f.id !== columnId)
      return empty ? rest : [...rest, { id: columnId, value }]
    })
  }

  const picked: string[] = multiple
    ? Array.isArray(raw)
      ? raw.map(String)
      : []
    : raw === undefined || raw === null || raw === ""
      ? []
      : [String(raw)]
  const pickedLabels = options
    .filter((o) => picked.includes(o.value))
    .map((o) => o.label)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          data-slot="data-table-facet-filter"
          className={cn(picked.length === 0 && "border-dashed")}
        >
          {/* The list-filter glyph: the funnel (`icons.filter`) toggles the header filter row. */}
          <icons.advancedFilter data-icon="inline-start" />
          {label}
          {pickedLabels.length > 0 && (
            <Badge variant="secondary" className="ml-1 max-w-40 truncate">
              {pickedLabels.join(", ")}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-80 w-60 overflow-y-auto"
      >
        <DropdownMenuLabel>{menuLabel ?? label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {multiple ? (
          options.map((o) => (
            <DropdownMenuCheckboxItem
              key={o.value}
              checked={picked.includes(o.value)}
              // Stays open, so several can be ticked in one go.
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={(on) =>
                set(
                  on
                    ? [...picked, o.value]
                    : picked.filter((v) => v !== o.value)
                )
              }
            >
              <span className="flex-1 truncate">{o.label}</span>
              {counts && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {counts[o.value] ?? 0}
                </span>
              )}
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <DropdownMenuRadioGroup
            value={picked[0] ?? ""}
            onValueChange={(next) => set(next || undefined)}
          >
            <DropdownMenuRadioItem value="">
              {anyLabel ?? localization.facetFilterAny}
            </DropdownMenuRadioItem>
            {options.map((o) => (
              <DropdownMenuRadioItem key={o.value} value={o.value}>
                <span className="flex-1 truncate">{o.label}</span>
                {counts && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {counts[o.value] ?? 0}
                  </span>
                )}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Clears every column filter. Renders nothing while none is set, so it can sit at the end of the
 * toolbar filters for good.
 */
export function DataTableResetFilters<TData extends RowData>({
  table,
  active,
  onReset,
}: {
  table: DataTableInstance<TData>
  /** For filters kept outside the table: whether any is set. */
  active?: boolean
  /** For filters kept outside the table: clears them (the table's own are cleared too). */
  onReset?: () => void
}) {
  const { localization, icons } = dt(table)
  const anyInTable = table.getState().columnFilters.length > 0
  if (!anyInTable && !active) return null
  return (
    <Button
      variant="ghost"
      data-slot="data-table-reset-filters"
      onClick={() => {
        if (anyInTable) table.setColumnFilters([])
        onReset?.()
      }}
    >
      {localization.resetFilters}
      <icons.clear data-icon="inline-end" />
    </Button>
  )
}
