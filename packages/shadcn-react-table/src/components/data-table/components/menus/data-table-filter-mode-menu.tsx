"use client"

import type { RowData } from "@tanstack/react-table"

import { Button } from "@workspace/ui/components/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  InputGroupAddon,
  InputGroupButton,
} from "@workspace/ui/components/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

import type { DataTableInstance } from "../../core/types"
import { modeOptionsForVariant, type FilterMode } from "../../fns/filter-fns"
import { getEffectiveMode } from "../../helpers/effective-filter-mode"
import type { DataTableColumn } from "../../core/table-types"
import { dt } from "../../core/internal"

/**
 * The `Filter` adornment that opens a mode menu (contains/equals/…; numeric and
 * date variants get their own sets). Swapping the mode changes the column's
 * `filterFn` and resets the stale value. Hidden when the variant has a single
 * fixed mode or modes are disabled. With `addon`, it renders as the leading
 * addon of the filter's `InputGroup` (text-like filters), else as a standalone
 * button beside the field.
 */
export function DataTableFilterModeMenu<TData extends RowData, TValue>({
  column,
  table,
  addon = false,
}: {
  column: DataTableColumn<TData, TValue>
  table: DataTableInstance<TData>
  /** Render inside an `InputGroup`: an inline-start addon with an
   *  `InputGroupButton` trigger. */
  addon?: boolean
}) {
  const {
    localization,
    icons,
    setColumnFilterMode,
    enableColumnFilterModes,
    renderColumnFilterModeMenuItems,
    filterFns,
    columnFilterModeOptions,
  } = dt(table)
  const variant = column.columnDef.meta?.filterVariant ?? "text"
  const perColumn = column.columnDef.meta?.enableColumnFilterModes
  const enabled = perColumn ?? enableColumnFilterModes
  const variantModes = modeOptionsForVariant(variant)
  // Restrict (and order) to the column's allowed subset, else the table's
  // (which leaves single-mode variants alone). Custom functions are kept
  // whatever the variant.
  const allowed =
    column.columnDef.meta?.columnFilterModeOptions ??
    (variantModes.length > 0 ? columnFilterModeOptions : undefined)
  const modes = allowed
    ? allowed.filter(
        (mode) => variantModes.includes(mode) || Object.hasOwn(filterFns, mode)
      )
    : variantModes

  if (!enabled || modes.length === 0) return null

  const current = getEffectiveMode(column, table)

  const trigger = addon ? (
    <InputGroupButton size="icon-xs" aria-label={localization.changeFilterMode}>
      <icons.filter />
    </InputGroupButton>
  ) : (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={localization.changeFilterMode}
      className="shrink-0"
    >
      <icons.filter />
    </Button>
  )

  const menu = (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{localization.filterMode}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="w-52">
        {/* Base UI's GroupLabel requires a Group ancestor; Radix renders the
            group as an inert wrapper. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>{localization.filterMode}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {renderColumnFilterModeMenuItems ? (
          renderColumnFilterModeMenuItems({
            column: column as DataTableColumn<TData, unknown>,
            modes,
            currentMode: current,
            onSelect: (mode) => setColumnFilterMode(column.id, mode),
            table,
          })
        ) : (
          <DropdownMenuRadioGroup
            value={current}
            onValueChange={(value) =>
              setColumnFilterMode(column.id, value as FilterMode)
            }
          >
            {modes.map((mode) => (
              <DropdownMenuRadioItem key={mode} value={mode}>
                {localization.filterModes[mode] ?? mode}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return addon ? (
    <InputGroupAddon align="inline-start">{menu}</InputGroupAddon>
  ) : (
    menu
  )
}
