"use client"

import type { RowData } from "@tanstack/react-table"

import { cn } from "@workspace/ui/lib/utils"

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
  return (
    <span
      role="separator"
      aria-label={dt(table).localization.resizeColumn}
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      onDoubleClick={() =>
        dt(table).enableColumnAutosize
          ? dt(table).autoSizeColumn(header.column.id)
          : header.column.resetSize()
      }
      className={cn(
        // Hidden at rest; a faint divider appears while the cursor is anywhere
        // in the header row (group/th), strengthens to primary on direct hover,
        // and stays primary while actively resizing.
        "absolute end-0 top-0 z-10 h-full w-1 cursor-col-resize touch-none bg-transparent transition-colors select-none group-hover/th:bg-border/60 hover:bg-primary",
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
