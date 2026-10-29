"use client"

import type { RowData } from "@tanstack/react-table"
import * as React from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Label } from "@workspace/ui/components/label"

import type { DataTableInstance } from "../../core/types"
import { useTableState } from "../../hooks/use-table-state"
import { getColumnLabel } from "../../helpers/column-label"
import { isColumnEditable } from "../../helpers/is-column-editable"
import { DataTableEditField } from "./data-table-edit-field"
import { dt } from "../../core/internal"

/**
 * Edit/create dialog for `editDisplayMode: "modal"` (and the create form in any
 * mode). Renders an editor per editable column bound to the shared row draft;
 * Save commits via `onEditingRowSave` / `onCreatingRowSave`.
 */
export function DataTableEditModal<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const {
    localization,
    editDisplayMode,
    createDisplayMode,
    editingRowId,
    isCreating,
    rowDraft,
    setRowDraftValue,
    cancelEdit,
    onEditingRowSave,
    onCreatingRowSave,
  } = dt(table)
  // The table around this dialog does not re-render for the edit draft.
  useTableState(table, (state) => [
    state.rowDraft,
    state.editingRowId,
    state.isCreating,
  ])

  // `table.getRow` throws when the id is gone (row deleted / refetched while
  // the dialog is open); look it up without throwing and bail out below.
  const editingRow =
    editingRowId != null
      ? table.getCoreRowModel().rowsById[editingRowId]
      : undefined
  const editingRowMissing = editingRowId != null && editingRow == null
  React.useEffect(() => {
    if (editingRowMissing) cancelEdit()
  }, [editingRowMissing, cancelEdit])

  const open =
    (isCreating && createDisplayMode === "modal") ||
    (editDisplayMode === "modal" && editingRowId != null && !editingRowMissing)
  if (!open) return null

  const editableColumns = table
    .getAllLeafColumns()
    .filter((column) => isColumnEditable(column))

  const hasErrors = editableColumns.some((column) => {
    const value =
      column.id in rowDraft
        ? rowDraft[column.id]
        : editingRow?.getValue(column.id)
    return column.columnDef.meta?.validate?.(value) != null
  })

  const submit = () => {
    if (hasErrors) return
    if (isCreating) {
      onCreatingRowSave?.({ values: rowDraft, table, exit: cancelEdit })
    } else if (editingRow) {
      onEditingRowSave?.({
        row: editingRow,
        values: rowDraft,
        table,
        exit: cancelEdit,
      })
    }
  }

  return (
    <Dialog open onOpenChange={(next) => !next && cancelEdit()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? localization.createNewRow : localization.editRow}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          {editableColumns.map((column) => {
            const meta = column.columnDef.meta
            const value =
              column.id in rowDraft
                ? rowDraft[column.id]
                : editingRow?.getValue(column.id)
            return (
              <div key={column.id} className="flex flex-col gap-1.5">
                <Label className="text-xs">{getColumnLabel(column)}</Label>
                <DataTableEditField
                  value={value}
                  variant={meta?.editVariant}
                  options={meta?.editSelectOptions ?? meta?.filterSelectOptions}
                  error={meta?.validate?.(value)}
                  ariaLabel={getColumnLabel(column)}
                  onChange={(next) => setRowDraftValue(column.id, next)}
                />
              </div>
            )
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={cancelEdit}>
            {localization.cancel}
          </Button>
          <Button size="sm" onClick={submit} disabled={hasErrors}>
            {localization.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
