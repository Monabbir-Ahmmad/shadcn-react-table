"use client"

import {
  setStateSlice,
  type RowData,
  type Updater,
} from "@tanstack/react-table"

import type { EditingCell } from "../core/types"
import type { DataTableRow } from "../core/table-types"
import type { DataTableUiState, DataTableUiStateKey } from "../core/ui-state"

export interface EditingActions<TData extends RowData> {
  setEditingCell: (updater: Updater<EditingCell | null>) => void
  setRowDraftValue: (columnId: string, value: unknown) => void
  beginRowEdit: (row: DataTableRow<TData>) => void
  beginCreate: () => void
  cancelEdit: () => void
}

/** The table, as far as the editing transitions need it. */
interface StateTable {
  options: object
  store: { state: object }
}

/**
 * Inline editing / create-form transitions. The state they move between
 * (`editingCell`, `editingRowId`, `isCreating`, `rowDraft`) is table state, so
 * each step goes through the slice's change handler like any TanStack setter.
 * The draft is seeded from the row's accessor cells on edit, or from
 * `createRowDefaults` on create. Created once per table: everything is read
 * through the getters when an action runs.
 */
export function createEditingActions<TData extends RowData>(
  getTable: () => StateTable | null,
  getCreateRowDefaults: () => Record<string, unknown> | undefined
): EditingActions<TData> {
  const set = <K extends DataTableUiStateKey>(
    key: K,
    updater: Updater<DataTableUiState[K]>
  ) => {
    const table = getTable()
    if (table) setStateSlice(table as never, key as never, updater as never)
  }

  return {
    setEditingCell: (updater) => set("editingCell", updater),
    setRowDraftValue: (columnId, value) =>
      set("rowDraft", (prev) => ({ ...prev, [columnId]: value })),
    beginRowEdit: (row) => {
      const draft: Record<string, unknown> = {}
      for (const cell of row.getAllCells()) {
        if (cell.column.accessorFn != null) {
          draft[cell.column.id] = cell.getValue()
        }
      }
      set("rowDraft", draft)
      set("editingRowId", row.id)
      set("isCreating", false)
      set("editingCell", null)
    },
    beginCreate: () => {
      const defaults = getCreateRowDefaults()
      set("rowDraft", defaults ? { ...defaults } : {})
      set("isCreating", true)
      set("editingRowId", null)
      set("editingCell", null)
    },
    cancelEdit: () => {
      set("editingCell", null)
      set("editingRowId", null)
      set("isCreating", false)
      set("rowDraft", {})
    },
  }
}
