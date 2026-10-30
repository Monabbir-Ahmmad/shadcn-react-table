"use client"

import type { RowData } from "@tanstack/react-table"
import type * as React from "react"

import { dt } from "../../core/internal"
import type { DataTableInstance } from "../../core/types"
import { getUiState } from "../../core/ui-state"
import { useRowAnimations } from "../../hooks/use-row-animations"

/** Every row key: row ids, plus "<id>:detail" for open detail panels. */
function rowKeys<TData extends RowData>(
  table: DataTableInstance<TData>,
  hasDetailPanel: boolean
) {
  const keys = new Set<string>()
  for (const rows of [
    table.getTopRows(),
    table.getCenterRows(),
    table.getBottomRows(),
  ]) {
    for (const row of rows) {
      keys.add(row.id)
      if (hasDetailPanel && row.getIsExpanded() && !row.getIsGrouped()) {
        keys.add(`${row.id}:detail`)
      }
    }
  }
  return keys
}

/**
 * Runs the row animations. Renders nothing; it sits before the `<table>` so
 * its insertion effect sees the rows before React updates them (React runs a
 * component's insertion effects after updating its own children, and a
 * sibling's before the next sibling's DOM updates). That order is React's
 * internal behaviour, not a documented guarantee; the leave, glide and
 * detail-panel tests in `data-table.animations.browser.test.tsx` catch a
 * change (see `useRowAnimations`).
 */
export function DataTableRowMotion<TData extends RowData>({
  table,
  tableRef,
  active,
}: {
  table: DataTableInstance<TData>
  tableRef: React.RefObject<HTMLTableElement | null>
  active: boolean
}) {
  const hasDetailPanel = !!dt(table).renderDetailPanel
  useRowAnimations({
    tableRef,
    active,
    // The row lists are memoized: new only when the rows, their order or
    // pinning change, never on scroll.
    signal: [
      table.getTopRows(),
      table.getCenterRows(),
      table.getBottomRows(),
      table.getState().expanded,
      hasDetailPanel,
    ],
    members: () => rowKeys(table, hasDetailPanel),
    paused: () => {
      const { editingCell, editingRowId } = getUiState(table)
      return editingCell != null || editingRowId != null
    },
  })
  return null
}
