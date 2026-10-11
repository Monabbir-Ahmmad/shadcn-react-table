import type { RowData } from "@tanstack/react-table"
import type { DataTableColumn } from "../core/table-types"

/** Best-effort human label for a column: explicit meta.label, else its
 *  string header, else its id. */
export function getColumnLabel<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>
): string {
  const meta = column.columnDef.meta
  if (meta?.label) return meta.label
  const header = column.columnDef.header
  if (typeof header === "string" && header.length > 0) return header
  return column.id
}
