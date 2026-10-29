import type { RowData } from "@tanstack/react-table"
import type { CSSProperties } from "react"

import type { DataTableInstance } from "../core/types"
import type { DataTableColumn, DataTableCoreTable } from "../core/table-types"
import {
  getPinOffset,
  getPinSide,
  isPinnedEdgeColumn,
} from "../helpers/column-pinning"
import { dt } from "../core/internal"

/**
 * Sticky positioning for a pinned column. Offsets come from TanStack
 * (`getStart`/`getAfter`) so multiple pinned columns stack correctly.
 */
export function getColumnPinningStyle<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>
): CSSProperties {
  const side = getPinSide(column)
  if (!side) return {}
  // Logical insets: a left (start) pinned column sticks to the right edge in a
  // right-to-left table, matching where TanStack's column order puts it.
  const inset = side === "left" ? "insetInlineStart" : "insetInlineEnd"
  return { position: "sticky", zIndex: 2, [inset]: getPinOffset(column, side) }
}

/**
 * Edge-shadow class for the boundary pinned columns (last left / first right),
 * built from `--border` (via a utility) so it reads in light and dark.
 */
export function getColumnPinningClass<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>
): string {
  const side = getPinSide(column)
  if (!side || !isPinnedEdgeColumn(column, side)) return ""
  return side === "left"
    ? "after:pointer-events-none after:absolute after:inset-y-0 after:-end-px after:w-2 after:translate-x-full after:bg-gradient-to-r after:from-border/60 after:to-transparent rtl:after:-translate-x-full rtl:after:bg-gradient-to-l"
    : "before:pointer-events-none before:absolute before:inset-y-0 before:-start-px before:w-2 before:-translate-x-full before:bg-gradient-to-l before:from-border/60 before:to-transparent rtl:before:translate-x-full rtl:before:bg-gradient-to-r"
}

/** Column ids go into CSS custom-property names; ASCII punctuation and spaces
 *  (dots, slashes…) would make `var()` invalid. Non-ASCII letters are valid
 *  name characters, so ids like `fødsel` and `fådsel` stay distinct. */
export function cssVarId(id: string): string {
  return id.replace(/[^A-Za-z0-9_\u0080-￿-]/g, "_")
}

/**
 * CSS custom properties holding each column's size, set once on the table
 * element. Cells read them via `width: calc(var(--col-…-size) * 1px)` so a
 * resize drag updates a variable instead of re-rendering every cell.
 */
export function getColumnSizeVars<TData extends RowData>(
  table: DataTableCoreTable<TData>
): Record<string, string> {
  const headers = table.getFlatHeaders()
  const vars: Record<string, string> = {}
  for (const header of headers) {
    vars[`--header-${cssVarId(header.id)}-size`] = `${header.getSize()}`
    vars[`--col-${cssVarId(header.column.id)}-size`] =
      `${header.column.getSize()}`
  }
  return vars
}

export function getColumnWidthStyle(columnId: string): CSSProperties {
  return { width: `calc(var(--col-${cssVarId(columnId)}-size) * 1px)` }
}

/**
 * Resolves a column's width style. While resizing, widths come from CSS vars.
 * Otherwise honor an explicitly defined `columnDef.size` (MRT behaviour) but
 * leave unsized columns to the browser's auto layout so the table still fills
 * its container. Column virtualization needs every column to have a concrete
 * width.
 */
export function getWidthStyle<TData extends RowData>(
  column: DataTableColumn<TData, unknown>,
  table: DataTableInstance<TData>
): CSSProperties {
  const { enableColumnResizing, enableColumnVirtualization } = dt(table)
  if (enableColumnResizing) return getColumnWidthStyle(column.id)
  if (enableColumnVirtualization || column.columnDef.size != null) {
    const size = column.getSize()
    return { width: size, minWidth: size }
  }
  return {}
}
