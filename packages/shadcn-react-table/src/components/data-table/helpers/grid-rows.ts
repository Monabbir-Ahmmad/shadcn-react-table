import type { RowData } from "@tanstack/react-table"

import type { DataTableInstance } from "../core/types"
import { dt } from "../core/internal"

/** Whether the per-column filter row renders under the headers. */
export function isFilterRowVisible<TData extends RowData>(
  table: DataTableInstance<TData>
): boolean {
  const { enableColumnFilters, showColumnFilters, columnFilterDisplayMode } =
    dt(table)
  return (
    enableColumnFilters &&
    showColumnFilters &&
    columnFilterDisplayMode === "subheader" &&
    table.getAllColumns().some((column) => column.getCanFilter())
  )
}

/** Rows in `<thead>`: one per header group, plus the filter row. Body rows
 *  are numbered after these for `aria-rowindex`. */
export function getHeaderRowCount<TData extends RowData>(
  table: DataTableInstance<TData>
): number {
  return table.getHeaderGroups().length + (isFilterRowVisible(table) ? 1 : 0)
}

/** Data rows in display order (top-pinned, center, bottom-pinned). */
export function getDataRowCount<TData extends RowData>(
  table: DataTableInstance<TData>
): number {
  return (
    table.getTopRows().length +
    table.getCenterRows().length +
    table.getBottomRows().length
  )
}
