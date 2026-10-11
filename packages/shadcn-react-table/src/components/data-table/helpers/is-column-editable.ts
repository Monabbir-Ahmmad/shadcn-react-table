import type { RowData } from "@tanstack/react-table"
import type { DataTableColumn } from "../core/table-types"

/** A column is editable when it has an accessor and isn't opted out via meta. */
export function isColumnEditable<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>
): boolean {
  return (
    column.accessorFn != null && column.columnDef.meta?.enableEditing !== false
  )
}
