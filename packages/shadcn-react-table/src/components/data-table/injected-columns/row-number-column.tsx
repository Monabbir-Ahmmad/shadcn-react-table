"use client"

import type { RowData } from "@tanstack/react-table"

import { cn } from "@workspace/ui/lib/utils"

import type { DataTableIcons } from "../core/icons"
import type { DataTableLocalization } from "../core/localization"
import type { DataTableColumnDef } from "../core/table-types"
import { formatInteger } from "../helpers/format-integer"
import { RowPinButton } from "./row-pin-button"

export const ROW_NUMBER_COLUMN_ID = "cn-row-number"

/** Each row's position in a row model's `rows`, built once per row model:
 *  a virtualized body renders new rows on every scroll frame, and searching
 *  the whole list for each would cost a pass over all rows per row. */
const rowPositions = new WeakMap<readonly object[], Map<object, number>>()

function indexOfRow(rows: readonly object[], row: object): number {
  let positions = rowPositions.get(rows)
  if (!positions) {
    positions = new Map()
    for (const [i, r] of rows.entries()) {
      if (!positions.has(r)) positions.set(r, i)
    }
    rowPositions.set(rows, positions)
  }
  return positions.get(row) ?? -1
}

/** Row-number column. `static` numbers track the current view (page-aware);
 *  `original` uses the stable source index. Optionally shows a pin toggle. */
export function createRowNumberColumn<TData extends RowData>(
  localization: DataTableLocalization,
  mode: "static" | "original",
  enableRowPinning: boolean,
  icons: DataTableIcons
): DataTableColumnDef<TData> {
  return {
    id: ROW_NUMBER_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableResizing: false,
    size: 56,
    minSize: 48,
    meta: { enableColumnActions: false, align: "center", label: "#" },
    header: () => <span className="text-muted-foreground">#</span>,
    cell: ({ row, table }) => {
      const number =
        mode === "original"
          ? row.index + 1
          : indexOfRow(table.getRowModel().rows, row) +
            1 +
            table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize
      const label = formatInteger(number, localization.language)

      if (!enableRowPinning) {
        return (
          <span className="text-xs text-muted-foreground tabular-nums">
            {label}
          </span>
        )
      }

      const pinned = row.getIsPinned()
      return (
        <span className="group/rownum relative flex items-center justify-center">
          <span
            className={cn(
              "text-xs text-muted-foreground tabular-nums",
              "group-hover/rownum:opacity-0"
            )}
          >
            {label}
          </span>
          <RowPinButton
            row={row}
            localization={localization}
            icons={icons}
            className={cn(
              "absolute inset-0 opacity-0 group-hover/rownum:opacity-100 focus-visible:opacity-100",
              pinned && "opacity-100"
            )}
          />
        </span>
      )
    },
  }
}
