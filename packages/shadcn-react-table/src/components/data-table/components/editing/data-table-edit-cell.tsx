"use client"

import type { RowData } from "@tanstack/react-table"
import * as React from "react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@workspace/ui/components/context-menu"

import type { DataTableInstance } from "../../core/types"
import { getColumnLabel } from "../../helpers/column-label"
import { isColumnEditable } from "../../helpers/is-column-editable"
import { stopPropagation } from "../../helpers/stop-propagation"
import { ClickToCopy, copyText } from "../body/click-to-copy"
import { DataTableEditField } from "./data-table-edit-field"
import type { DataTableCell } from "../../core/table-types"
import { dt } from "../../core/internal"
import { ALIGN_CELL } from "../../core/constants"
import { getSlotProps } from "../../helpers/slot-props"
import { getEditSelectOptions } from "../../helpers/edit-select-options"

/**
 * Resolves a leaf data cell's interactive content: an inline editor when this
 * cell/row is being edited (cell/row/table modes), otherwise the value wrapped
 * with click-to-copy, click-to-edit (cell mode), and/or a cell-actions context
 * menu as configured. `fallback` is the normal rendered value.
 */
export function DataTableBodyCellContent<TData extends RowData>({
  cell,
  table,
  fallback,
}: {
  cell: DataTableCell<TData, unknown>
  table: DataTableInstance<TData>
  fallback: React.ReactNode
}) {
  const cn = dt(table)
  const { row, column } = cell
  const editable = cn.getCanEditRow(row) && isColumnEditable(column, row)
  const mode = cn.editDisplayMode

  const isCellEditing =
    mode === "cell" &&
    cn.editingCell?.rowId === row.id &&
    cn.editingCell?.columnId === column.id
  const isRowEditing = mode === "row" && cn.editingRowId === row.id
  const isTableEditing = mode === "table"

  if (editable && (isCellEditing || isRowEditing || isTableEditing)) {
    const renderEditCell = column.columnDef.meta?.renderEditCell
    if (renderEditCell) {
      return renderEditCell({ cell, row, column, table })
    }
    return mode === "row" ? (
      <RowDraftEditor cell={cell} table={table} />
    ) : (
      <LocalDraftEditor
        cell={cell}
        table={table}
        exitOnCommit={mode === "cell"}
      />
    )
  }

  let node: React.ReactNode = fallback

  const copyOption =
    column.columnDef.meta?.enableClickToCopy ?? cn.enableClickToCopy
  const copyMode =
    typeof copyOption === "function" ? copyOption(cell) : copyOption
  if (copyMode === true) {
    node = (
      <ClickToCopy
        value={String(cell.getValue() ?? "")}
        copyLabel={cn.localization.copy}
        copiedLabel={cn.localization.copied}
      >
        {node}
      </ClickToCopy>
    )
  } else if (editable && mode === "cell") {
    node = (
      <button
        type="button"
        onClick={(event) => {
          stopPropagation(event)
          cn.setEditingCell({ rowId: row.id, columnId: column.id })
        }}
        onDoubleClick={stopPropagation}
        // Aligned like the cell: a button would center or start its text.
        className={`-mx-1 w-full rounded-sm px-1 ${ALIGN_CELL[column.columnDef.meta?.align ?? "left"]} transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40`}
      >
        {node}
      </button>
    )
  }

  const cellActions =
    typeof cn.enableCellActions === "function"
      ? cn.enableCellActions(cell)
      : cn.enableCellActions
  // Copy shows in the menu when copying is on; Edit when the cell can start
  // editing (table mode is always editing).
  const menuCopy = copyMode === "context-menu" || (cellActions && !!copyMode)
  const menuEdit = cellActions && editable && mode !== "table"
  if (cn.renderCellActionMenuItems || menuCopy || menuEdit) {
    node = (
      <CellActionsMenu
        cell={cell}
        table={table}
        copy={menuCopy}
        edit={menuEdit}
      >
        {node}
      </CellActionsMenu>
    )
  }

  return node
}

/** The right-click menu on a cell: built-in Copy / Edit items, or the
 *  consumer's `renderCellActionMenuItems`. */
function CellActionsMenu<TData extends RowData>({
  cell,
  table,
  copy,
  edit,
  children,
}: {
  cell: DataTableCell<TData, unknown>
  table: DataTableInstance<TData>
  copy: boolean
  edit: boolean
  children: React.ReactNode
}) {
  const cn = dt(table)
  const { row, column } = cell
  // The context menu has no controlled `open`; remounting closes it.
  const [instance, setInstance] = React.useState(0)
  const closeMenu = () => setInstance((n) => n + 1)

  const internalMenuItems = (
    <>
      {copy && (
        <ContextMenuItem
          onClick={() => void copyText(String(cell.getValue() ?? ""))}
        >
          <cn.icons.copy />
          {cn.localization.copy}
        </ContextMenuItem>
      )}
      {edit && (
        <ContextMenuItem
          onClick={() =>
            cn.editDisplayMode === "cell"
              ? cn.setEditingCell({ rowId: row.id, columnId: column.id })
              : cn.beginRowEdit(row)
          }
        >
          <cn.icons.edit />
          {cn.localization.edit}
        </ContextMenuItem>
      )}
    </>
  )

  return (
    <ContextMenu key={instance}>
      <ContextMenuTrigger asChild>
        <span className="block">{children}</span>
      </ContextMenuTrigger>
      <ContextMenuContent
        onClick={stopPropagation}
        onDoubleClick={stopPropagation}
      >
        {cn.renderCellActionMenuItems
          ? cn.renderCellActionMenuItems({
              cell,
              row,
              table,
              internalMenuItems,
              closeMenu,
            })
          : internalMenuItems}
      </ContextMenuContent>
    </ContextMenu>
  )
}

/** Editor bound to the shared row draft (row/modal editing). */
function RowDraftEditor<TData extends RowData>({
  cell,
  table,
}: {
  cell: DataTableCell<TData, unknown>
  table: DataTableInstance<TData>
}) {
  const cn = dt(table)
  const { column } = cell
  const meta = column.columnDef.meta
  const value =
    column.id in cn.rowDraft ? cn.rowDraft[column.id] : cell.getValue()
  const error = meta?.validate?.(value)
  return (
    <DataTableEditField
      value={value}
      variant={meta?.editVariant}
      options={getEditSelectOptions(column, table, cell.row)}
      error={error}
      ariaLabel={getColumnLabel(column)}
      onChange={(next) => cn.setRowDraftValue(column.id, next)}
      fieldProps={getSlotProps(
        table,
        "editField",
        { column, row: cell.row },
        meta?.slotProps?.editField
      )}
    />
  )
}

/** Editor with local draft state (cell + table editing). */
function LocalDraftEditor<TData extends RowData>({
  cell,
  table,
  exitOnCommit,
}: {
  cell: DataTableCell<TData, unknown>
  table: DataTableInstance<TData>
  exitOnCommit: boolean
}) {
  const cn = dt(table)
  const { row, column } = cell
  const meta = column.columnDef.meta
  const [draft, setDraft] = React.useState<unknown>(() => cell.getValue())
  const error = meta?.validate?.(draft)

  const commit = (next: unknown = draft) => {
    if (meta?.validate?.(next)) return
    if (next !== cell.getValue()) {
      cn.onEditingCellSave?.({ row, column, value: next, table })
    }
    if (exitOnCommit) cn.setEditingCell(null)
  }

  const cancel = () => {
    setDraft(cell.getValue())
    if (exitOnCommit) cn.setEditingCell(null)
  }

  return (
    <DataTableEditField
      value={draft}
      variant={meta?.editVariant}
      options={getEditSelectOptions(column, table, row)}
      error={error}
      ariaLabel={getColumnLabel(column)}
      autoFocus={exitOnCommit}
      onChange={setDraft}
      onCommit={commit}
      onCancel={cancel}
      fieldProps={getSlotProps(
        table,
        "editField",
        { column, row },
        meta?.slotProps?.editField
      )}
    />
  )
}
