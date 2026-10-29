"use client"

import * as React from "react"

const sameItems = (a: readonly unknown[], b: readonly unknown[]) =>
  a.length === b.length && a.every((value, i) => Object.is(value, b[i]))

interface MemoRowProps {
  /** Inputs that only this row reads: its selection, expansion, pinning,
   *  editing state and position. */
  rowDeps: readonly unknown[]
  /** Inputs every row reads (table state and options); one array shared by
   *  all rows of a render. */
  tableDeps: readonly unknown[]
  /** Renders the row with the current closure. */
  render: () => React.ReactNode
}

/**
 * A body row that skips re-rendering when neither its own inputs nor the
 * table-wide ones changed, so selecting a row or editing a cell re-renders
 * that row alone. `render` is left out of the comparison: it is a fresh
 * closure every time, and everything it reads is covered by the deps.
 */
export const MemoRow = React.memo(
  function MemoRow({ render }: MemoRowProps) {
    return <>{render()}</>
  },
  (prev, next) =>
    sameItems(prev.rowDeps, next.rowDeps) &&
    sameItems(prev.tableDeps, next.tableDeps)
)
