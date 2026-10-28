"use client"

import type { RowData } from "@tanstack/react-table"

import { cn } from "@workspace/ui/lib/utils"

import type { DataTableIcons } from "../core/icons"
import type { DataTableLocalization } from "../core/localization"
import type { DataTableColumnDef } from "../core/table-types"
import { RowPinButton } from "./row-pin-button"

export const ROW_NUMBER_COLUMN_ID = "cn-row-number"

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
    meta: { disableColumnActions: true, align: "center", label: "#" },
    header: () => <span className="text-muted-foreground">#</span>,
    cell: ({ row, table }) => {
      const number =
        mode === "original"
          ? row.index + 1
          : table.getRowModel().rows.indexOf(row) +
            1 +
            table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize

      if (!enableRowPinning) {
        return (
          <span className="text-xs text-muted-foreground tabular-nums">
            {number}
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
            {number}
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
