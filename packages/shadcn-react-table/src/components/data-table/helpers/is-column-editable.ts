import type { RowData } from "@tanstack/react-table"
import type { DataTableColumn, DataTableRow } from "../core/table-types"

/**
 * A column is editable when it has an accessor and isn't opted out via
 * `meta.enableEditing` — `false`, or a function returning false for `row`.
 * Without a row (the create form) a function counts as editable.
 */
export function isColumnEditable<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>,
  row?: DataTableRow<TData>
): boolean {
  if (column.accessorFn == null) return false
  const enabled = column.columnDef.meta?.enableEditing
  if (typeof enabled === "function") return row ? enabled(row) : true
  return enabled !== false
}
