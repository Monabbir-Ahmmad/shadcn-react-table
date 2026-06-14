"use client"

import type * as React from "react"
import type { RowData } from "@tanstack/react-table"

import { Button } from "@monabbir/tablecn/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monabbir/tablecn/components/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@monabbir/tablecn/components/tooltip"

import type { DataTableInstance } from "./types"

interface DataTablePaginationProps<TData extends RowData> {
  table: DataTableInstance<TData>
  pageSizeOptions?: number[]
}

/**
 * Bottom toolbar. Left: rows-per-page select. Right: MRT-style "start–end of
 * total" range label + first/prev/next/last icon buttons. Works in client and
 * manual/server pagination (counts come from the table instance).
 */
export function DataTablePagination<TData extends RowData>({
  table,
  pageSizeOptions = [5, 10, 25, 50, 100],
}: DataTablePaginationProps<TData>) {
  const { localization, icons } = table.cnTable
  const { pageIndex, pageSize } = table.getState().pagination

  const totalRows = table.getRowCount()
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium tracking-wide text-muted-foreground">
          {localization.rowsPerPage}
        </span>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger
            size="sm"
            className="h-8 w-[4.5rem]"
            aria-label={localization.rowsPerPage}
          >
            <SelectValue placeholder={`${pageSize}`} />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-medium tracking-wide tabular-nums text-muted-foreground">
          {localization.paginationRange(start, end, totalRows)}
        </span>
        <div className="flex items-center gap-1">
          <PaginationButton
            label={localization.goToFirstPage}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <icons.pageFirst />
          </PaginationButton>
          <PaginationButton
            label={localization.goToPreviousPage}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <icons.pagePrev />
          </PaginationButton>
          <PaginationButton
            label={localization.goToNextPage}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <icons.pageNext />
          </PaginationButton>
          <PaginationButton
            label={localization.goToLastPage}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <icons.pageLast />
          </PaginationButton>
        </div>
      </div>
    </div>
  )
}

function PaginationButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={label}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
