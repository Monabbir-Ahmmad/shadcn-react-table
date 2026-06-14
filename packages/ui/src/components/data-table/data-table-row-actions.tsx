"use client"

import type { ColumnDef, Row, RowData } from "@tanstack/react-table"

import { Button } from "@monabbir/tablecn/components/button"

import type { DataTableInstance } from "./types"

export const ROW_ACTIONS_COLUMN_ID = "cn-row-actions"

/** Trailing actions column: edit/save/cancel controls + the consumer's
 *  `renderRowActions` slot. */
export function createRowActionsColumn<TData extends RowData>(): ColumnDef<TData> {
  return {
    id: ROW_ACTIONS_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableResizing: false,
    enableGrouping: false,
    size: 90,
    minSize: 80,
    meta: { disableColumnActions: true, align: "right" },
    header: () => null,
    cell: ({ row, table }) => (
      <RowActionsCell row={row} table={table as DataTableInstance<TData>} />
    ),
  }
}

function RowActionsCell<TData extends RowData>({
  row,
  table,
}: {
  row: Row<TData>
  table: DataTableInstance<TData>
}) {
  const {
    localization,
    icons,
    enableEditing,
    editDisplayMode,
    editingRowId,
    rowDraft,
    onSaveRow,
    beginRowEdit,
    cancelEdit,
    renderRowActions,
  } = table.cnTable

  const isEditingThisRow =
    editDisplayMode === "row" && editingRowId === row.id

  if (isEditingThisRow) {
    return (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={localization.save}
          onClick={() =>
            onSaveRow?.({ row, values: rowDraft, table, exit: cancelEdit })
          }
        >
          <icons.save />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={localization.cancel}
          onClick={cancelEdit}
        >
          <icons.cancel />
        </Button>
      </div>
    )
  }

  const canInlineEdit =
    enableEditing &&
    (editDisplayMode === "row" || editDisplayMode === "modal")

  return (
    <div className="flex items-center justify-end gap-1">
      {canInlineEdit && (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={localization.edit}
          onClick={() => beginRowEdit(row)}
        >
          <icons.edit />
        </Button>
      )}
      {renderRowActions?.({ row, table })}
    </div>
  )
}
