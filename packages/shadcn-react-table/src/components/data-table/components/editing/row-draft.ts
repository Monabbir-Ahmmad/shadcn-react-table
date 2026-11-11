import type { RowData } from "@tanstack/react-table"

import { dt } from "../../core/internal"
import type { DataTableRow } from "../../core/table-types"
import type { DataTableInstance } from "../../core/types"
import { isColumnEditable } from "../../helpers/is-column-editable"

/**
 * Whether any editable column's value in the row draft fails its `validate`.
 * A column the draft has not touched is checked with the row's own value
 * (none while creating, when there is no row). Reads.
 */
export function hasRowDraftErrors<TData extends RowData>(
  table: DataTableInstance<TData>,
  row: DataTableRow<TData> | undefined
) {
  const { rowDraft } = dt(table)
  return table
    .getAllLeafColumns()
    .filter((column) => isColumnEditable(column, row))
    .some((column) => {
      const value =
        column.id in rowDraft ? rowDraft[column.id] : row?.getValue(column.id)
      return column.columnDef.meta?.validate?.(value) != null
    })
}

/** Saves the row being edited through `onEditingRowSave`, unless a field fails
 *  validation. */
export function saveEditedRow<TData extends RowData>(
  table: DataTableInstance<TData>,
  row: DataTableRow<TData>
) {
  if (hasRowDraftErrors(table, row)) return
  const { rowDraft, onEditingRowSave, cancelEdit } = dt(table)
  onEditingRowSave?.({ row, values: rowDraft, table, exit: cancelEdit })
}
