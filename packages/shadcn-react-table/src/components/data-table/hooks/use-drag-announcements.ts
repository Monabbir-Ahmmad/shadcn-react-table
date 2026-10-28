"use client"

import type { Announcements, ScreenReaderInstructions } from "@dnd-kit/core"
import type { RowData } from "@tanstack/react-table"
import * as React from "react"

import type { DataTableInstance } from "../core/types"
import { getColumnLabel } from "../helpers/column-label"

/** dnd-kit screen-reader text in the table's language, naming columns by
 *  their label and rows by their position instead of raw ids. */
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
        if (index >= 0) return localization.dragRowLabel(index + 1)
      }
      return key
    }
    return {
      announcements: {
        onDragStart: ({ active }) =>
          localization.dragStart(label(active.id, active.data.current)),
        onDragOver: ({ active, over }) =>
          over
            ? localization.dragOver(
                label(active.id, active.data.current),
                label(over.id, over.data.current)
              )
            : undefined,
        onDragEnd: ({ active, over }) =>
          over
            ? localization.dragEnd(
                label(active.id, active.data.current),
                label(over.id, over.data.current)
              )
            : localization.dragCancel(label(active.id, active.data.current)),
        onDragCancel: ({ active }) =>
          localization.dragCancel(label(active.id, active.data.current)),
      },
      screenReaderInstructions: { draggable: localization.dragInstructions },
    }
  }, [table, localization])
}
