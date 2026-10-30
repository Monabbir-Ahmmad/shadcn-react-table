import type { RowData } from "@tanstack/react-table"

import type { DataTableColumnDef } from "../core/table-types"

/** Leaf column defs in document order, descending through header groups
 *  (`columns: [...]`). Per-column state keyed by column id must be derived
 *  from leaves, or a column nested in a group silently gets the defaults. */
export function flattenLeafColumns<TData extends RowData>(
  columns: ReadonlyArray<DataTableColumnDef<TData, unknown>>
): DataTableColumnDef<TData, unknown>[] {
  const leaves: DataTableColumnDef<TData, unknown>[] = []
  for (const def of columns) {
    const children = (def as { columns?: DataTableColumnDef<TData, unknown>[] })
      .columns
    if (children && children.length > 0) {
      leaves.push(...flattenLeafColumns(children))
    } else {
      leaves.push(def)
    }
  }
  return leaves
}
