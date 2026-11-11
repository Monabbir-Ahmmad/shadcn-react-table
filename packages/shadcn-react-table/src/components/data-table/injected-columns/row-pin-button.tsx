"use client"

import type { RowData } from "@tanstack/react-table"

import { Button } from "@workspace/ui/components/button"

import type { DataTableIcons } from "../core/icons"
import type { DataTableLocalization } from "../core/localization"
import type { DataTableRow } from "../core/table-types"
import { stopPropagation } from "../helpers/stop-propagation"
import { dt } from "../core/internal"

/** Pin / unpin toggle for one row (pins to the top). Shared by the row-number
 *  column (hover-revealed) and the standalone pin column (always visible). */
export function RowPinButton<TData extends RowData>({
  row,
  localization,
  icons,
  className,
}: {
  row: DataTableRow<TData>
  localization: DataTableLocalization
  icons: DataTableIcons
  className?: string
}) {
  const pinned = row.getIsPinned()
  // `rowPinningDisplayMode: "bottom"` pins to the bottom; other modes the top.
  const side =
    dt(row.table as never).rowPinningDisplayMode === "bottom" ? "bottom" : "top"
  return (
    <Button
      // Pinned: the button's secondary variant.
      variant={pinned ? "secondary" : "ghost"}
      size="icon-xs"
      aria-label={pinned ? localization.unpinRow : localization.pinRow}
      aria-pressed={!!pinned}
      onClick={(event) => {
        stopPropagation(event)
        row.pin(pinned ? false : side)
      }}
      onDoubleClick={stopPropagation}
      className={className}
    >
      {pinned ? (
        <icons.pinnedRow />
      ) : side === "bottom" ? (
        <icons.pinBottom />
      ) : (
        <icons.pinTop />
      )}
    </Button>
  )
}
