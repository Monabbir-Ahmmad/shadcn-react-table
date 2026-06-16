"use client"

import type { RowData } from "@tanstack/react-table"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

import { exportToCsv, exportToExcel } from "../../utils/export-utils"
import type { DataTableInstance } from "../../core/types"

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
              size="icon"
              aria-label={localization.export}
              className="size-8"
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
