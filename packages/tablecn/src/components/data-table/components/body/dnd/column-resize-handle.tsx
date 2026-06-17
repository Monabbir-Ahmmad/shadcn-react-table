"use client"

import type { Header, RowData } from "@tanstack/react-table"

import { cn } from "@workspace/ui/lib/utils"

import type { DataTableInstance } from "../../../core/types"

/** Drag handle to grab the resize edge of a column header. */
export function ColumnResizeHandle<TData extends RowData, TValue>({
  header,
  table,
}: {
  header: Header<TData, TValue>
  table: DataTableInstance<TData>
}) {
  if (!header.column.getCanResize()) return null
  return (
    <span
      role="separator"
      aria-label={table.cnTable.localization.resizeColumn}
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      onDoubleClick={() =>
        table.cnTable.enableColumnAutosize
          ? table.cnTable.autoSizeColumn(header.column.id)
          : header.column.resetSize()
      }
      className={cn(
        // A faint divider is always visible so the handle is discoverable;
        // it strengthens on hover and turns primary while actively resizing.
        "absolute top-0 right-0 z-10 h-full w-1 cursor-col-resize touch-none select-none bg-border/60 transition-colors hover:bg-primary",
        header.column.getIsResizing() && "bg-primary"
      )}
    />
  )
}
