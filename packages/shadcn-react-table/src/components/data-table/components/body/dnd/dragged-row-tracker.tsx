"use client"

import { useDndMonitor } from "@dnd-kit/core"

type DragData = { type?: string; tableKey?: string | null; rowId?: string }

/**
 * Reports which of this table's rows is being dragged (null when none), so
 * the row virtualizer keeps it rendered (see `useTableVirtualizers`). Renders
 * inside the drag context the rows use: the table's own, or the
 * `DataTableDndProvider`'s, where `tableKey` tells this table's rows apart.
 */
export function DraggedRowTracker({
  tableKey,
  onChange,
}: {
  tableKey: string | null
  onChange: (rowId: string | null) => void
}) {
  useDndMonitor({
    onDragStart: ({ active }) => {
      const data = (active.data.current ?? {}) as DragData
      if (data.type === "row" && (data.tableKey ?? null) === tableKey) {
        onChange(data.rowId ?? null)
      }
    },
    onDragEnd: () => onChange(null),
    onDragCancel: () => onChange(null),
  })
  return null
}
