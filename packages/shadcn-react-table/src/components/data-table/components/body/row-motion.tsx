"use client"

import type { RowData } from "@tanstack/react-table"
import type * as React from "react"

import { dt } from "../../core/internal"
import type { DataTableInstance } from "../../core/types"
import { isFilterRowVisible } from "../../helpers/grid-rows"
import { useRowAnimations } from "../../hooks/use-row-animations"
import { publishStickyOffsets } from "../../hooks/use-row-pinning-display"
import { useTableState } from "../../hooks/use-table-state"

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
  const { renderDetailPanel, density } = dt(table)
  const hasDetailPanel = !!renderDetailPanel
  const filterRow = isFilterRowVisible(table)
  // Its own subscription: the table root does not re-render when an edit
  // starts, and starting one must stop the motion in flight.
  const editing = useTableState(
    table,
    (state) =>
      state.editingCell != null ||
      state.editingRowId != null ||
      state.isCreating
  )
  useRowAnimations({
    tableRef,
    active,
    // The row lists are memoized: new only when the rows, their order or
    // pinning change, never on scroll. Rows are measured from the table's
    // top, so the head growing (the filter row) or the rows' height changing
    // (the density) moves them too.
    signal: [
      table.getTopRows(),
      table.getCenterRows(),
      table.getBottomRows(),
      table.getState().expanded,
      hasDetailPanel,
      density,
      filterRow,
    ],
    members: () => rowKeys(table, hasDetailPanel),
    paused: () => editing,
    filterRow,
    // The pinned row groups stick under the header at `--dt-head-h`, which
    // must follow the filter row before the rows are measured.
    sync: (el) => {
      const surface = el.closest<HTMLElement>(
        '[data-slot="data-table-surface"]'
      )
      const { enableStickyHeader, enableStickyFooter } = dt(table)
      if (surface) {
        publishStickyOffsets(table, surface, {
          stickyHeader: enableStickyHeader,
          stickyFooter: enableStickyFooter,
        })
      }
    },
  })
  return null
}
