"use client"

import type { RowData } from "@tanstack/react-table"

import { Button } from "@monabbir/tablecn/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@monabbir/tablecn/components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@monabbir/tablecn/components/tooltip"

import { exportToCsv, exportToExcel } from "./export-utils"
import type { DataTableInstance } from "./types"

/**
 * Toolbar export menu (CSV / Excel). Exports the selected rows when any are
 * selected, otherwise the full filtered set across all pages.
 */
export function DataTableExportMenu<TData extends RowData>({
  table,
  fileName,
}: {
  table: DataTableInstance<TData>
  fileName?: string
}) {
  const { localization, icons } = table.cnTable
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={localization.export}
            >
              <icons.export />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{localization.export}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => exportToCsv(table, { fileName })}>
          <icons.fileCsv />
          {localization.exportCsv}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToExcel(table, { fileName })}>
          <icons.fileExcel />
          {localization.exportExcel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
