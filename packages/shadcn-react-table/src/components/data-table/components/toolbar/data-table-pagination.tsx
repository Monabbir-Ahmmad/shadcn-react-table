"use client"

import type { RowData } from "@tanstack/react-table"
import * as React from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

import type { DataTableInstance } from "../../core/types"
import { formatInteger } from "../../helpers/format-integer"
import { dt } from "../../core/internal"
import { getSlotProps, mergeProps } from "../../helpers/slot-props"

interface DataTablePaginationProps<TData extends RowData> {
  table: DataTableInstance<TData>
}

/** Below Tailwind's `sm`: phones get the native page-size picker. */
const PHONE = "(max-width: 639px)"

function subscribePhone(onChange: () => void) {
  if (typeof matchMedia !== "function") return () => {}
  const media = matchMedia(PHONE)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

/** Whether the screen is phone-sized; false on the server and in hydration. */
function usePhone() {
  return React.useSyncExternalStore(
    subscribePhone,
    () => typeof matchMedia === "function" && matchMedia(PHONE).matches,
    () => false
  )
}

/**
 * Bottom toolbar. Left: rows-per-page select (the native picker on phones). Right: MRT-style "start–end of
 * total" range label + first/prev/next/last icon buttons. Works in client and
 * manual/server pagination (counts come from the table instance).
 */
export function DataTablePagination<TData extends RowData>({
  table,
}: DataTablePaginationProps<TData>) {
  const { localization, icons, paginationDisplayMode, pageSizeOptions } =
    dt(table)
  const phone = usePhone()
  if (paginationDisplayMode === "custom") return null

  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getRowCount()
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div
      {...mergeProps(
        {
          "data-slot": "data-table-pagination",
          className: "flex flex-wrap items-center justify-between gap-4 py-1",
        } as React.ComponentProps<"div">,
        getSlotProps(table, "pagination", {})
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium tracking-wide text-muted-foreground">
          {localization.rowsPerPage}
        </span>
        {phone ? (
          // The phone's own picker: easier to use by touch than a popover.
          <select
            value={pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
            aria-label={localization.rowsPerPage}
            className="h-8 w-18 rounded-md border border-input bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {formatInteger(size, localization.language)}
              </option>
            ))}
          </select>
        ) : (
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-18"
              aria-label={localization.rowsPerPage}
            >
              <SelectValue
                placeholder={formatInteger(pageSize, localization.language)}
              />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {formatInteger(size, localization.language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {paginationDisplayMode === "pages" ? (
        <div className="flex items-center gap-1">
          <PaginationButton
            label={localization.goToPreviousPage}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <icons.pagePrev className="rtl:rotate-180" />
          </PaginationButton>
          {getPageList(pageIndex + 1, table.getPageCount()).map((item, i) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="px-1 text-xs text-muted-foreground"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                variant={item === pageIndex + 1 ? "default" : "outline"}
                size="icon"
                aria-label={localization.goToPage(item)}
                aria-current={item === pageIndex + 1 ? "page" : undefined}
                onClick={() => table.setPageIndex(item - 1)}
                className="size-8 text-xs tabular-nums"
              >
                {formatInteger(item, localization.language)}
              </Button>
            )
          )}
          <PaginationButton
            label={localization.goToNextPage}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <icons.pageNext className="rtl:rotate-180" />
          </PaginationButton>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium tracking-wide text-muted-foreground tabular-nums">
            {localization.paginationRange(start, end, totalRows)}
          </span>
          <div className="flex items-center gap-1">
            <PaginationButton
              label={localization.goToFirstPage}
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <icons.pageFirst className="rtl:rotate-180" />
            </PaginationButton>
            <PaginationButton
              label={localization.goToPreviousPage}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <icons.pagePrev className="rtl:rotate-180" />
            </PaginationButton>
            <PaginationButton
              label={localization.goToNextPage}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <icons.pageNext className="rtl:rotate-180" />
            </PaginationButton>
            <PaginationButton
              label={localization.goToLastPage}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <icons.pageLast className="rtl:rotate-180" />
            </PaginationButton>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Windowed page list for "pages" mode: always shows the first and last page and
 * the current page ± 1, collapsing the gaps to an `"ellipsis"` marker. Lists
 * every page when there are 7 or fewer. Page numbers are 1-based.
 */
function getPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 1) return total === 1 ? [1] : []
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const wanted = [1, total, current, current - 1, current + 1].filter(
    (p) => p >= 1 && p <= total
  )
  const sorted = [...new Set(wanted)].sort((a, b) => a - b)
  const result: (number | "ellipsis")[] = []
  let prev = 0
  for (const page of sorted) {
    if (page - prev > 1) result.push("ellipsis")
    result.push(page)
    prev = page
  }
  return result
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
          size="icon"
          aria-label={label}
          onClick={onClick}
          disabled={disabled}
          className="size-8"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
