"use client"

import * as React from "react"

import { GridSyncContext } from "../../hooks/use-grid-navigation"
import { useRowState } from "./row-state-hub"

const sameItems = (a: readonly unknown[], b: readonly unknown[]) =>
  a.length === b.length && a.every((value, i) => Object.is(value, b[i]))

interface MemoRowProps {
  /** Identifies the rendered row for its state subscription. */
  stateKey: string
  /** What places the row: the row object, its position. */
  rowKey: readonly unknown[]
  /** Reads the state only this row shows (selection, expansion, pinning,
   *  editing), live from the table. */
  selectRowState: () => readonly unknown[]
  /** Inputs every row reads (table state and options); one array shared by
   *  all rows of a render. */
  tableDeps: readonly unknown[]
  /** Renders the row with the current closure. */
  render: () => React.ReactNode
}

/**
 * A body row that re-renders on its own: when its placement or the
 * table-wide inputs change (the body passes new props), or when the state
 * only it shows changes (through the body's row state hub). Selecting a row or
 * typing in an inline editor re-renders that row and nothing else. `render`
 * is left out of the comparison: it is a fresh closure every time, and
 * everything it reads is covered above or read live.
 */
export const MemoRow = React.memo(
  function MemoRow({ stateKey, selectRowState, render }: MemoRowProps) {
    useRowState(stateKey, selectRowState)
    // Keyboard navigation fixes focus and the tab stop after rows render.
    const scheduleGridSync = React.useContext(GridSyncContext)
    React.useLayoutEffect(() => {
      scheduleGridSync?.()
    })
    return <>{render()}</>
  },
  (prev, next) =>
    sameItems(prev.rowKey, next.rowKey) &&
    sameItems(prev.tableDeps, next.tableDeps)
)
