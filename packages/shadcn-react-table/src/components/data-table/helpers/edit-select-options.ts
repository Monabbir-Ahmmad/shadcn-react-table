import type { RowData } from "@tanstack/react-table"

import type { DataTableColumn, DataTableRow } from "../core/table-types"
import type { DataTableFilterOption, DataTableInstance } from "../core/types"

/** A column's select options for editing `row` (undefined when creating):
 *  `meta.editSelectOptions` (resolved when a function), else
 *  `meta.filterSelectOptions`. */
export function getEditSelectOptions<TData extends RowData>(
  column: DataTableColumn<TData, unknown>,
  table: DataTableInstance<TData>,
  row?: DataTableRow<TData>
): DataTableFilterOption[] | undefined {
  const meta = column.columnDef.meta
  const options = meta?.editSelectOptions
  if (typeof options === "function") return options({ row, column, table })
  return options ?? meta?.filterSelectOptions
}
