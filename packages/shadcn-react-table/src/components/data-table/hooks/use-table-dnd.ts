"use client"

import {
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import type { RowData } from "@tanstack/react-table"

import type { DataTableInstance } from "../core/types"
import { dt } from "../core/internal"

/**
 * Sensors + drag-end handler for the single `DndContext` that drives both
 * column and row reordering. The active item's `data.type` (set in useSortable)
 * routes to the right handler — two nested contexts can't be used: dnd-kit
 * renders an a11y `<div>` that is invalid inside `<tbody>`, and a body-wrapping
 * context would swallow header drags.
 */
type DragData = { type?: string; rowId?: string; columnId?: string }

export function useTableDnd<TData extends RowData>(
  table: DataTableInstance<TData>
) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // The group drop zone should accept a drop anywhere inside its bounds, not
  // only near its center. Prefer a pointer-within hit on the zone; otherwise
  // fall back to closestCenter for column/row reordering (and keyboard dnd,
  // where pointerWithin yields nothing). Only targets of the dragged item's
  // own type are considered, so a row can't land on a header and vice versa;
  // the untyped group zone is reachable by column drags only.
  const collisionDetection: CollisionDetection = (args) => {
    const activeType = args.active.data.current?.type
    const isGroupZone = (id: string | number) =>
      args.droppableContainers.find((c) => c.id === id)?.data.current?.type ===
      "group-zone"
    if (activeType === "column") {
      const groupHit = pointerWithin(args).find((c) => isGroupZone(c.id))
      if (groupHit) return [groupHit]
    }
    const sameType = args.droppableContainers.filter(
      (c) =>
        c.data.current?.type === activeType ||
        (activeType === "column" && c.data.current?.type === "group-zone")
    )
    return closestCenter({ ...args, droppableContainers: sameType })
  }

  const onRowOrderChange = dt(table).onRowOrderChange

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    // Ids may carry a provider prefix; the drag data has the plain ones.
    const from = (active.data.current ?? {}) as DragData
    const to = (over.data.current ?? {}) as DragData

    if (from.type === "row") {
      // Reordering applies with row ordering on (a row may be draggable only
      // to move it out of the table).
      if (!dt(table).enableRowOrdering || to.type !== "row") return
      if (from.rowId !== to.rowId) {
        onRowOrderChange?.(from.rowId!, to.rowId!)
      }
      return
    }

    // column drag → drop on the group zone groups by that column
    if (to.type === "group-zone") {
      const column = table.getColumn(from.columnId!)
      if (column && !column.getIsGrouped()) column.toggleGrouping()
      return
    }
    // Otherwise it's a reorder, which only applies when ordering is enabled
    // (a column may be draggable solely to support drag-to-group).
    if (!dt(table).enableColumnOrdering) return
    if (from.columnId === to.columnId) return
    const base =
      table.getState().columnOrder.length > 0
        ? table.getState().columnOrder
        : table.getAllLeafColumns().map((c) => c.id)
    const oldIndex = base.indexOf(from.columnId!)
    const newIndex = base.indexOf(to.columnId!)
    if (oldIndex === -1 || newIndex === -1) return
    table.setColumnOrder(arrayMove(base, oldIndex, newIndex))
  }

  return { sensors, collisionDetection, handleDragEnd }
}
