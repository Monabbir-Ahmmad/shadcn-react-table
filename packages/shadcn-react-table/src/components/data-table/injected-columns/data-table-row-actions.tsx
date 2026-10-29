"use client"

import type { RowData } from "@tanstack/react-table"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import type { DataTableInstance } from "../core/types"
import type { DataTableColumnDef, DataTableRow } from "../core/table-types"
import { stopPropagation } from "../helpers/stop-propagation"

export const ROW_ACTIONS_COLUMN_ID = "cn-row-actions"

/** Actions column: edit/save/cancel controls + the consumer's
 *  `renderRowActions` slot. When positioned `"first"` the controls align to the
 *  left edge; when `"last"` (default) they align to the right. */
export function createRowActionsColumn<TData extends RowData>(
  position: "first" | "last" = "last"
): DataTableColumnDef<TData> {
  const align = position === "first" ? "left" : "right"
  return {
    id: ROW_ACTIONS_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableResizing: false,
    enableGrouping: false,
    size: 90,
    minSize: 80,
    meta: { enableColumnActions: false, align },
    header: () => null,
    cell: ({ row, table }) => (
      <RowActionsCell
        row={row}
        table={table as DataTableInstance<TData>}
        align={align}
      />
    ),
  }
}

function RowActionsCell<TData extends RowData>({
  row,
  table,
  align,
}: {
  row: DataTableRow<TData>
  table: DataTableInstance<TData>
  align: "left" | "right"
}) {
  const justify = align === "left" ? "justify-start" : "justify-end"
  const {
    localization,
    icons,
    enableEditing,
    editDisplayMode,
    editingRowId,
    rowDraft,
    onEditingRowSave,
    beginRowEdit,
    cancelEdit,
    renderRowActions,
    renderRowActionMenuItems,
  } = table.tableInstance

  const isEditingThisRow = editDisplayMode === "row" && editingRowId === row.id

  if (isEditingThisRow) {
    return (
      <div
        className={`flex items-center gap-1 ${justify}`}
        onClick={stopPropagation}
        onDoubleClick={stopPropagation}
      >
        <Button
          variant="ghost"
          size="icon"
          aria-label={localization.save}
          className="size-7"
          onClick={() =>
            onEditingRowSave?.({ row, values: rowDraft, table, exit: cancelEdit })
          }
        >
          <icons.save />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={localization.cancel}
          className="size-7"
          onClick={cancelEdit}
        >
          <icons.cancel />
        </Button>
      </div>
    )
  }

  const canInlineEdit =
    enableEditing && (editDisplayMode === "row" || editDisplayMode === "modal")

  return (
    <div
      className={`flex items-center gap-1 ${justify}`}
      onClick={stopPropagation}
      onDoubleClick={stopPropagation}
    >
      {canInlineEdit && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={localization.edit}
          className="size-7"
          onClick={() => beginRowEdit(row)}
        >
          <icons.edit />
        </Button>
      )}
      {renderRowActions?.({ row, table })}
      {renderRowActionMenuItems && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={localization.rowActions}
              className="size-7"
            >
              <icons.columnActions />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {renderRowActionMenuItems({ row, table })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
