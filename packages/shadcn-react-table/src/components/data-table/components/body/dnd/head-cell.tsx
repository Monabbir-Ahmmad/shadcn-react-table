"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Button } from "@workspace/ui/components/button"
import { TableHead } from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { getSlotProps, mergeProps } from "../../../helpers/slot-props"

import {
  getColumnPinningClass,
  getColumnPinningStyle,
} from "../../../utils/column-styles"
import type { IconComponent } from "../../../core/icons"
import type { DataTableInstance } from "../../../core/types"
import { getPinSide } from "../../../helpers/column-pinning"
import { ColumnResizeHandle } from "./column-resize-handle"
import type {
  DataTableColumn,
  DataTableHeader,
} from "../../../core/table-types"
import { setColumnDragVars } from "../../../utils/column-styles"
import { DndKeyContext, useDndId } from "../../../core/dnd-scope"

/** dnd-kit activator props for the current column's drag handle. */
export interface ColumnDragHandleProps {
  attributes: Record<string, unknown>
  listeners: Record<string, unknown> | undefined
  setActivatorNodeRef: (el: HTMLElement | null) => void
}

/** Provided by the sortable header cell, consumed by {@link ColumnDragHandle}
 *  so the grip can live inside the column header (beside the actions menu)
 *  while the dnd-kit wiring stays on the cell. Null when the column isn't
 *  draggable. */
export const ColumnDragContext =
  React.createContext<ColumnDragHandleProps | null>(null)

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
  colSpan = header.colSpan,
  children,
}: {
  header: DataTableHeader<TData, TValue>
  table: DataTableInstance<TData>
  draggable: boolean
  resizable: boolean
  widthStyle: React.CSSProperties
  padding: string
  /** Overrides `header.colSpan` (column virtualization renders part of a group). */
  colSpan?: number
  children: React.ReactNode
}) {
  const column = header.column
  const tableKey = React.useContext(DndKeyContext)
  const dndId = useDndId()
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition: sortTransition,
    isDragging,
  } = useSortable({
    id: dndId(column.id),
    disabled: !draggable,
    data: { type: "column", tableKey, columnId: column.id },
  })

  // While a column is dragged, its header follows the pointer and the others
  // slide aside; the same offsets go to CSS variables on the scroll surface so
  // the body, filter and footer cells move with their headers (no row
  // re-renders). Reduced motion: no slide animation.
  const offsetX = transform?.x ?? 0
  // The surface is found from this cell, not from `refs.tableContainerRef`,
  // which is briefly detached while the table commits a re-render.
  const cellRef = React.useRef<HTMLTableCellElement | null>(null)
  const setCellRef = React.useCallback(
    (node: HTMLTableCellElement | null) => {
      cellRef.current = node
      setNodeRef(node)
    },
    [setNodeRef]
  )
  const surfaceOf = () =>
    cellRef.current?.closest<HTMLElement>('[data-slot="data-table-surface"]')
  const written = React.useRef("0:false")
  React.useLayoutEffect(() => {
    const surface = surfaceOf()
    const key = `${offsetX}:${isDragging}`
    if (!surface || written.current === key) return
    written.current = key
    setColumnDragVars(
      surface,
      column.id,
      offsetX,
      isDragging,
      !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    )
  })
  React.useEffect(() => {
    const surface = surfaceOf()
    return () => {
      if (surface) setColumnDragVars(surface, column.id, 0, false, false)
    }
    // Clean up once, when the column's header goes away.
  }, [column.id])

  const pinningStyle = getColumnPinningStyle(column)
  const style: React.CSSProperties = {
    ...widthStyle,
    ...pinningStyle,
    transform: CSS.Translate.toString(transform),
    // Animate width for programmatic changes (autosize, pinning) but not during
    // an active drag, where the easing makes the header lag behind the cursor;
    // the other headers slide aside with dnd-kit's own transition.
    transition: column.getIsResizing()
      ? undefined
      : ["width 0.15s ease", !isDragging && offsetX !== 0 && sortTransition]
          .filter(Boolean)
          .join(", "),
    opacity: isDragging ? 0.85 : undefined,
    // A pinned header keeps its pinning layer, above the headers under it.
    zIndex: isDragging ? 30 : pinningStyle.zIndex,
  }

  // Hand the drag-activator props to the header (via context) so the grip can
  // render next to the column-actions menu instead of crowding the left edge.
  const dragProps = React.useMemo<ColumnDragHandleProps>(
    () => ({
      attributes: attributes as unknown as Record<string, unknown>,
      listeners: listeners as Record<string, unknown> | undefined,
      setActivatorNodeRef,
    }),
    [attributes, listeners, setActivatorNodeRef]
  )

  return (
    <TableHead
      {...mergeProps(
        // The ref callback is handed to the cell, not read during render.
        // eslint-disable-next-line react-hooks/refs
        {
          ref: setCellRef,
          colSpan,
          style,
          "data-pinned": getPinSide(column) || undefined,
          // Found by the column motion, which leaves a dragged column's drop
          // to dnd-kit's own animation.
          "data-column-id": column.id,
          "data-dragging": isDragging || undefined,
          "aria-sort": ariaSort(column.getIsSorted()),
          className: cn(
            "relative bg-card",
            padding,
            // Match the body: under fixed layout, keep long header labels from
            // bleeding past the (resizable) column edge.
            resizable && "overflow-hidden",
            getColumnPinningClass(column)
          ),
        } as React.ComponentProps<"th">,
        getSlotProps(
          table,
          "headCell",
          {
            header: header as DataTableHeader<TData, unknown>,
            column: column as DataTableColumn<TData, unknown>,
          },
          column.columnDef.meta?.slotProps?.headCell
        )
      )}
    >
      <ColumnDragContext.Provider value={draggable ? dragProps : null}>
        {children}
      </ColumnDragContext.Provider>
      {resizable && <ColumnResizeHandle header={header} table={table} />}
    </TableHead>
  )
}

/** Column reorder grip. Reads dnd-kit props from {@link ColumnDragContext} and
 *  renders nothing when the column isn't draggable. Lives inside the column
 *  header, just before the column-actions menu. */
export function ColumnDragHandle({
  label,
  Icon,
}: {
  label: string
  Icon: IconComponent
}) {
  const ctx = React.useContext(ColumnDragContext)
  if (!ctx) return null
  const { attributes, listeners, setActivatorNodeRef } = ctx
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      ref={setActivatorNodeRef}
      // dnd-kit injects an aria-describedby id that can differ between the
      // server and client render; suppress that benign attribute mismatch.
      suppressHydrationWarning
      {...attributes}
      {...listeners}
      // touch-none: let dnd-kit's pointer sensor own the touch gesture
      // (otherwise the browser scrolls/selects text before a drag can start on
      // a phone). size-7 matches the actions menu for a finger-friendly target.
      className="size-7 shrink-0 cursor-grab touch-none text-muted-foreground opacity-70 transition-opacity group-hover/th:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
    >
      <Icon className="size-3.5" />
    </Button>
  )
}

function ariaSort(
  sorted: false | "asc" | "desc"
): React.AriaAttributes["aria-sort"] {
  if (sorted === "asc") return "ascending"
  if (sorted === "desc") return "descending"
  return "none"
}
