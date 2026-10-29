"use client"

import type { Announcements, ScreenReaderInstructions } from "@dnd-kit/core"
import type { RowData } from "@tanstack/react-table"
import * as React from "react"

import { GROUP_DROPZONE_ID } from "../components/toolbar/data-table-grouping"
import type { DataTableInstance } from "../core/types"
import { getColumnLabel } from "../helpers/column-label"

/** dnd-kit screen-reader text in the table's language, naming columns by
 *  their label, rows by their position (counting earlier pages) and the group
 *  drop zone by the grouping it would make, instead of raw ids. */
export function useDragAnnouncements<TData extends RowData>(
  table: DataTableInstance<TData>
): {
  announcements: Announcements
  screenReaderInstructions: ScreenReaderInstructions
} {
  const { localization } = table.tableInstance
  return React.useMemo(() => {
    const label = (
      id: string | number,
      data: Record<string, unknown> | undefined
    ): string => {
      const key = String(id)
      if (data?.type === "column") {
        const column = table.getColumn(key)
        if (column) return getColumnLabel(column)
      }
      if (data?.type === "row") {
        const index = table.getRowModel().rows.findIndex((r) => r.id === key)
        if (index >= 0) {
          const { pageIndex, pageSize } = table.getState().pagination
          const offset = table.tableInstance.enablePagination
            ? pageIndex * pageSize
            : 0
          return localization.dragRowLabel(offset + index + 1)
        }
      }
      return key
    }
    type Item = { id: string | number; data: { current?: unknown } }
    const name = (item: Item) =>
      label(item.id, item.data.current as Record<string, unknown> | undefined)
    // The drop target, phrased for the item being dragged.
    const target = (active: Item, over: Item) =>
      over.id === GROUP_DROPZONE_ID
        ? localization.groupByColumn(name(active))
        : name(over)
    return {
      announcements: {
        onDragStart: ({ active }) =>
          localization.dragStart(label(active.id, active.data.current)),
        onDragOver: ({ active, over }) =>
          over
            ? localization.dragOver(name(active), target(active, over))
            : undefined,
        onDragEnd: ({ active, over }) =>
          over
            ? localization.dragEnd(name(active), target(active, over))
            : localization.dragCancel(name(active)),
        onDragCancel: ({ active }) =>
          localization.dragCancel(label(active.id, active.data.current)),
      },
      screenReaderInstructions: { draggable: localization.dragInstructions },
    }
  }, [table, localization])
}
