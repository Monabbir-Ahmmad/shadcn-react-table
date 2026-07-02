"use client"

import type { RowData } from "@tanstack/react-table"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

import type { DataTableInstance } from "../../core/types"
import { getColumnLabel } from "../../helpers/column-label"

/**
 * Column visibility menu (toolbar icon cluster). Lists every hideable column
 * as a checkbox item; the header `label`/string is used for the menu text.
 */
export function DataTableViewOptions<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const { localization, icons } = table.tableInstance
  const hideableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanHide())

  if (hideableColumns.length === 0) return null

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label={localization.columnVisibility}
              className="size-8"
            >
              <icons.columnVisibility />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{localization.columnVisibility}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-52">
        {/* Base UI's GroupLabel requires a Group ancestor; Radix renders the
            group as an inert wrapper. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>{localization.columnVisibility}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {hideableColumns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            className="capitalize"
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
            onSelect={(e) => e.preventDefault()}
          >
            {getColumnLabel(column)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
