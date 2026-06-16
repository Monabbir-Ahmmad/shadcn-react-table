"use client"

import * as React from "react"
import type { Header, Row, RowData } from "@tanstack/react-table"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { TableHead, TableRow } from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { getColumnPinningClass, getColumnPinningStyle } from "../../utils/column-styles"
import { RowDragContext } from "../../hooks/display-columns/display-columns"
import type { DataTableInstance } from "../../core/types"

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
      onDoubleClick={() => header.column.resetSize()}
      className={cn(
        "absolute top-0 right-0 z-10 h-full w-1 cursor-col-resize touch-none select-none bg-transparent transition-colors hover:bg-border",
        header.column.getIsResizing() && "bg-primary"
      )}
    />
  )
}

/**
 * Header cell. `useSortable` is always called (disabled when ordering is off or
 * for display columns) to keep hook order stable. Applies pinning + width
 * styles, an optional drag grip, and the resize handle.
 */
export function DataTableHeadCell<TData extends RowData, TValue>({
  header,
  table,
  draggable,
  resizable,
  widthStyle,
  padding,
  children,
}: {
  header: Header<TData, TValue>
  table: DataTableInstance<TData>
  draggable: boolean
  resizable: boolean
  widthStyle: React.CSSProperties
  padding: string
  children: React.ReactNode
}) {
  const column = header.column
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } =
    useSortable({ id: column.id, disabled: !draggable, data: { type: "column" } })

  const style: React.CSSProperties = {
    ...widthStyle,
    ...getColumnPinningStyle(column),
    transform: CSS.Translate.toString(transform),
    transition: "width 0.15s ease",
    opacity: isDragging ? 0.7 : undefined,
    zIndex: isDragging ? 30 : undefined,
  }

  return (
    <TableHead
      ref={setNodeRef}
      colSpan={header.colSpan}
      style={style}
      data-pinned={column.getIsPinned() || undefined}
      aria-sort={ariaSort(column.getIsSorted())}
      className={cn(
        "relative bg-background",
        padding,
        getColumnPinningClass(column)
      )}
    >
      <div className="flex items-center gap-0.5">
        {draggable && (
          <button
            type="button"
            ref={setActivatorNodeRef}
            aria-label={table.cnTable.localization.reorderColumn}
            // dnd-kit injects an aria-describedby id that can differ between the
            // server and client render; suppress that benign attribute mismatch.
            suppressHydrationWarning
            className="-ml-1 flex cursor-grab items-center text-muted-foreground opacity-70 transition-opacity outline-none group-hover/th:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <table.cnTable.icons.dragHandle className="size-3.5" />
          </button>
        )}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {resizable && <ColumnResizeHandle header={header} table={table} />}
    </TableHead>
  )
}

/**
 * Body row. `useSortable` is always called (disabled when row ordering is off).
 * Exposes its drag-handle props through {@link RowDragContext} so the drag
 * column's handle can activate it. Applies the selected-row accent.
 */
export function DataTableBodyRow<TData extends RowData>({
  row,
  draggable,
  children,
  className,
  onClick,
  onDoubleClick,
}: {
  row: Row<TData>
  draggable: boolean
  children: React.ReactNode
  className?: string
  onClick?: React.MouseEventHandler<HTMLTableRowElement>
  onDoubleClick?: React.MouseEventHandler<HTMLTableRowElement>
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id, disabled: !draggable, data: { type: "row" } })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: isDragging ? "relative" : undefined,
    zIndex: isDragging ? 1 : undefined,
  }

  const dragProps = React.useMemo(
    () => ({
      attributes: attributes as unknown as Record<string, unknown>,
      listeners: listeners as Record<string, unknown> | undefined,
      setActivatorNodeRef,
    }),
    [attributes, listeners, setActivatorNodeRef]
  )

  return (
    <RowDragContext.Provider value={dragProps}>
      <TableRow
        ref={setNodeRef}
        style={style}
        data-state={row.getIsSelected() ? "selected" : undefined}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={cn(
          "data-[state=selected]:shadow-[inset_2px_0_0_0_var(--primary)]",
          isDragging && "bg-muted",
          (onClick || onDoubleClick) && "cursor-pointer",
          className
        )}
      >
        {children}
      </TableRow>
    </RowDragContext.Provider>
  )
}

function ariaSort(
  sorted: false | "asc" | "desc"
): React.AriaAttributes["aria-sort"] {
  if (sorted === "asc") return "ascending"
  if (sorted === "desc") return "descending"
  return "none"
}
