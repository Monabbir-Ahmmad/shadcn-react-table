"use client"

import type { RowData } from "@tanstack/react-table"

import type { DataTableIcons } from "../core/icons"
import type { DataTableLocalization } from "../core/localization"
import type { DataTableColumnDef } from "../core/table-types"
import { RowPinButton } from "./row-pin-button"

export const ROW_PIN_COLUMN_ID = "cn-row-pin"

/** Standalone pin column, injected when `enableRowPinning` is on but
 *  `enableRowNumbers` is off (otherwise the pin lives in the number column). */
export function createRowPinColumn<TData extends RowData>(
  localization: DataTableLocalization,
  icons: DataTableIcons
): DataTableColumnDef<TData> {
  return {
    id: ROW_PIN_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableResizing: false,
    enableGrouping: false,
    size: 40,
    minSize: 40,
    meta: { enableColumnActions: false, align: "center" },
    header: () => <span className="sr-only">{localization.pinRow}</span>,
    cell: ({ row }) => (
      <RowPinButton row={row} localization={localization} icons={icons} />
    ),
  }
}
