"use client"

import type { RowData } from "@tanstack/react-table"

import { SelectionCheckbox } from "../components/body/selection-checkbox"
import type { DataTableLocalization } from "../core/localization"
import type { DataTableColumnDef } from "../core/table-types"
import { getSlotProps } from "../helpers/slot-props"
import type { DataTableCoreTable, DataTableRow } from "../core/table-types"
import { dt } from "../core/internal"

export const SELECTION_COLUMN_ID = "cn-select"

/** The row last clicked in each table: the anchor of a shift-click range. */
const rangeAnchors = new WeakMap<object, string>()

/**
 * Toggles `row`; with shift held (and batch selection on) sets every row from
 * the last-clicked one to `row`, in display order, to the same value.
 */
function toggleRow<TData extends RowData>(
  table: DataTableCoreTable<TData>,
  row: DataTableRow<TData>,
  value: boolean,
  shiftKey: boolean
) {
  const anchorId = rangeAnchors.get(table)
  rangeAnchors.set(table, row.id)
  const batch =
    shiftKey &&
    anchorId != null &&
    anchorId !== row.id &&
    table.options.enableMultiRowSelection !== false &&
    dt(table as never).enableBatchRowSelection
  if (!batch) {
    row.toggleSelected(value)
    return
  }
  const rows = table.getRowModel().rows
  const from = rows.findIndex((r) => r.id === anchorId)
  const to = rows.findIndex((r) => r.id === row.id)
  if (from === -1 || to === -1) {
    row.toggleSelected(value)
    return
  }
  const range = rows.slice(Math.min(from, to), Math.max(from, to) + 1)
  table.setRowSelection((prev) => {
    const next = { ...prev }
    for (const r of range) {
      if (!r.getCanSelect()) continue
      if (value) next[r.id] = true
      else delete next[r.id]
    }
    return next
  })
}

/**
 * Builds the auto-injected selection column. The header carries the
 * select-all checkbox (with indeterminate state) for multi-select tables; for
 * single-select tables the header is empty. `selectAllMode` selects the current
 * page ("page", default) or every row ("all"); `enableSelectAll: false` hides
 * the header checkbox. Clicks are isolated from row click handlers via
 * `stopPropagation`.
 */
export function createSelectionColumn<TData extends RowData>(
  localization: DataTableLocalization,
  selectAllMode: "page" | "all" = "page",
  enableSelectAll = true
): DataTableColumnDef<TData> {
  return {
    id: SELECTION_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableResizing: false,
    size: 44,
    minSize: 44,
    meta: { enableColumnActions: false, align: "center" },
    header: ({ table }) => {
      // No select-all affordance for single-select tables or when disabled.
      if (!enableSelectAll) return null
      if (table.options.enableMultiRowSelection === false) return null
      const allMode = selectAllMode === "all"
      const allSelected = allMode
        ? table.getIsAllRowsSelected()
        : table.getIsAllPageRowsSelected()
      const someSelected = allMode
        ? table.getIsSomeRowsSelected()
        : table.getIsSomePageRowsSelected()
      return (
        <div
          className="flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <SelectionCheckbox
            {...getSlotProps(table as never, "selectCheckbox", {})}
            aria-label={localization.selectAll}
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onCheckedChange={(value) =>
              allMode
                ? table.toggleAllRowsSelected(!!value)
                : table.toggleAllPageRowsSelected(!!value)
            }
          />
        </div>
      )
    },
    cell: ({ row, table }) => {
      const single = table.options.enableMultiRowSelection === false
      return (
        <div
          className="flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <SelectionCheckbox
            {...getSlotProps(table as never, "selectCheckbox", {
              row: row as never,
            })}
            aria-label={localization.selectRow}
            variant={single ? "radio" : "checkbox"}
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(value, event) =>
              toggleRow(
                table as unknown as DataTableCoreTable<TData>,
                row as unknown as DataTableRow<TData>,
                value,
                event.shiftKey
              )
            }
          />
        </div>
      )
    },
  }
}
