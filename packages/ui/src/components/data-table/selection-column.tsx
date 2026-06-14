"use client"

import type { ColumnDef, RowData } from "@tanstack/react-table"

import { SelectionCheckbox } from "./selection-checkbox"
import type { DataTableLocalization } from "./localization"

export const SELECTION_COLUMN_ID = "cn-select"

/**
 * Builds the auto-injected selection column. The header carries the
 * select-all checkbox (with indeterminate state) for multi-select tables; for
 * single-select tables the header is empty. Clicks are isolated from row
 * click handlers via `stopPropagation`.
 */
export function createSelectionColumn<TData extends RowData>(
  localization: DataTableLocalization
): ColumnDef<TData> {
  return {
    id: SELECTION_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableResizing: false,
    size: 44,
    minSize: 44,
    meta: { disableColumnActions: true, align: "center" },
    header: ({ table }) => {
      // Single-select tables have no select-all affordance.
      if (table.options.enableMultiRowSelection === false) return null
      const allSelected = table.getIsAllPageRowsSelected()
      const someSelected = table.getIsSomePageRowsSelected()
      return (
        <div
          className="flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <SelectionCheckbox
            aria-label={localization.selectAll}
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        </div>
      )
    },
    cell: ({ row }) => (
      <div
        className="flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <SelectionCheckbox
          aria-label={localization.selectRow}
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
  }
}
