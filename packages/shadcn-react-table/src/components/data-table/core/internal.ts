import type { RowData } from "@tanstack/react-table"

import type { DataTableConfig, DataTableOptionsResolved } from "./types"

/**
 * The table's full configuration for its own parts: `table.dataTable` plus
 * the live UI state, the methods and internal members its public type leaves
 * out (the runtime object is the same).
 */
export function dt<TData extends RowData>(table: {
  dataTable: DataTableOptionsResolved<TData>
}): DataTableConfig<TData> {
  return table.dataTable as unknown as DataTableConfig<TData>
}
