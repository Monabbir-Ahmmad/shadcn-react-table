"use client"

import * as React from "react"

import { useDroppable } from "@dnd-kit/core"
import type { RowData } from "@tanstack/react-table"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

import type { DataTableInstance } from "../../core/types"
import { getColumnLabel } from "../../helpers/column-label"
import { dt } from "../../core/internal"
import { DndKeyContext, useDndId } from "../../core/dnd-scope"
import { mergeProps } from "../../helpers/slot-props"

export const GROUP_DROPZONE_ID = "cn-group-dropzone"

/**
 * The MRT "drop to group by" zone: a dashed strip below the toolbar showing
 * chips for the active grouping columns (each removable) and acting as a drop
 * target for column drags (handled by the column DnD context in `<DataTable>`).
 */
export function DataTableDropToGroupZone<TData extends RowData>({
  table,
  presenceRef,
  leaving = false,
  flushTop = false,
  flushBottom = false,
}: {
  table: DataTableInstance<TData>
  /** Receives the zone's element as well, for its enter and exit motion
   *  (see `usePresence`). */
  presenceRef?: React.Ref<HTMLDivElement>
  /** It is fading out: it no longer takes a drop. */
  leaving?: boolean
  /** The top toolbar or pagination sits above it: its padding already spaces
   *  them, so the zone drops its own top margin. */
  flushTop?: boolean
  /** The bottom toolbar sits below it: the same, for its bottom margin. */
  flushBottom?: boolean
}) {
  const { localization, icons } = dt(table)
  const grouping = table.getState().grouping
  const tableKey = React.useContext(DndKeyContext)
  const dndId = useDndId()
  const { setNodeRef, isOver } = useDroppable({
    id: dndId(GROUP_DROPZONE_ID),
    data: { type: "group-zone", tableKey },
    disabled: leaving,
  })

  return (
    <div
      {...mergeProps({ ref: setNodeRef } as React.ComponentProps<"div">, {
        ref: presenceRef,
      })}
      data-slot="data-table-group-zone"
      className={cn(
        // The card's spacing all round, the same as the toolbars' padding.
        "m-4 flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground transition-colors",
        // A selection banner shown right next to it has no padding of its own.
        flushTop && "mt-0 [[data-slot=data-table-alert-banner]+&]:mt-4",
        flushBottom && "mb-0 has-[+[data-slot=data-table-alert-banner]]:mb-4",
        isOver && "border-primary bg-muted text-foreground"
      )}
    >
      <icons.group className="size-3.5 shrink-0" />
      {grouping.length === 0 ? (
        <span>{localization.dropToGroupBy}</span>
      ) : (
        grouping.map((columnId) => {
          const column = table.getColumn(columnId)
          if (!column) return null
          return (
            <Badge key={columnId} variant="secondary">
              {getColumnLabel(column)}
              <button
                type="button"
                aria-label={localization.ungroupByColumn(
                  getColumnLabel(column)
                )}
                onClick={() => column.toggleGrouping()}
                className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <icons.clear className="size-3" />
              </button>
            </Badge>
          )
        })
      )}
    </div>
  )
}
