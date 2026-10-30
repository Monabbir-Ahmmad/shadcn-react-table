"use client"

import type { RowData } from "@tanstack/react-table"
import type * as React from "react"
import { flushSync } from "react-dom"

import { cn } from "@workspace/ui/lib/utils"

import { getColumnGrowVar } from "../../../utils/column-styles"
import type { DataTableInstance } from "../../../core/types"
import type { DataTableHeader } from "../../../core/table-types"
import { dt } from "../../../core/internal"

/** Drag handle to grab the resize edge of a column header. */
export function ColumnResizeHandle<TData extends RowData, TValue>({
  header,
  table,
}: {
  header: DataTableHeader<TData, TValue>
  table: DataTableInstance<TData>
}) {
  if (!header.column.getCanResize()) return null
  const { column } = header
  // In grid mode a growing column is wider than its size by its share of the
  // spare width (written on the surface, see `useColumnGrow`). Read when
  // used: the shares change without re-rendering the header.
  const growOf = (columnId: string) => {
    const surface = dt(table).refs.tableContainerRef.current
    if (dt(table).layoutMode !== "grid" || !surface) return 0
    return (
      Number(surface.style.getPropertyValue(getColumnGrowVar(columnId))) || 0
    )
  }
  const size = column.getSize()
  const { minSize, maxSize } = column.columnDef
  const min = typeof minSize === "number" ? minSize : 0
  const max =
    typeof maxSize === "number" && maxSize < Number.MAX_SAFE_INTEGER
      ? maxSize
      : undefined

  const resizeTo = (next: number) => {
    const clamped = Math.round(Math.min(max ?? Infinity, Math.max(min, next)))
    table.setColumnSizing((prev) => ({ ...prev, [column.id]: clamped }))
  }

  // Arrow keys resize by 10px (Shift: 50px), toward the column's far edge on
  // the right in left-to-right tables and mirrored right to left; Home / End
  // jump to the limits; Enter fits the column to its content.
  const onKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    const step = event.shiftKey ? 50 : 10
    const grow = dt(table).direction === "rtl" ? "ArrowLeft" : "ArrowRight"
    const shrink = grow === "ArrowRight" ? "ArrowLeft" : "ArrowRight"
    const shown = size + growOf(column.id)
    if (event.key === grow) resizeTo(shown + step)
    else if (event.key === shrink) resizeTo(shown - step)
    else if (event.key === "Home") resizeTo(min)
    else if (event.key === "End" && max != null) resizeTo(max)
    else if (event.key === "Enter") {
      if (dt(table).enableColumnAutosize) dt(table).autoSizeColumn(column.id)
      else column.resetSize()
    } else return
    event.preventDefault()
    event.stopPropagation()
  }

  // A drag starts from the width the column shows: in grid mode a growing
  // column first takes its grown width as its size (so it stops growing, and
  // the drag moves its edge from where it is), committed before TanStack
  // reads the start size.
  const resizeHandler = header.getResizeHandler()
  const startResize = (event: unknown) => {
    const grown = header
      .getLeafHeaders()
      .filter((leaf) => !leaf.subHeaders.length)
      .flatMap(({ column: leaf }) => {
        const grow = growOf(leaf.id)
        return grow > 0 ? [[leaf.id, leaf.getSize() + grow] as const] : []
      })
    if (grown.length)
      flushSync(() =>
        table.setColumnSizing((prev) => ({
          ...prev,
          ...Object.fromEntries(grown),
        }))
      )
    resizeHandler(event)
  }

  return (
    <span
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-valuenow={Math.round(size)}
      aria-valuemin={min}
      aria-valuemax={max}
      onKeyDown={onKeyDown}
      aria-label={dt(table).localization.resizeColumn}
      onMouseDown={startResize}
      onTouchStart={startResize}
      onDoubleClick={() =>
        dt(table).enableColumnAutosize
          ? dt(table).autoSizeColumn(header.column.id)
          : header.column.resetSize()
      }
      className={cn(
        // Hidden at rest; a faint divider appears while the cursor is anywhere
        // in the header row (group/th), strengthens to primary on direct hover,
        // and stays primary while actively resizing.
        "absolute end-0 top-0 z-10 h-full w-1 cursor-col-resize touch-none bg-transparent transition-colors outline-none select-none group-hover/th:bg-border/60 hover:bg-primary focus-visible:bg-primary focus-visible:ring-2 focus-visible:ring-ring/40",
        // Touch devices can't hover, so the grip would be invisible: on a coarse
        // pointer reveal it at rest and widen the hit area for a finger.
        "pointer-coarse:w-1.5",
        header.column.getIsResizing()
          ? "bg-primary"
          : "pointer-coarse:bg-border/60"
      )}
    />
  )
}
