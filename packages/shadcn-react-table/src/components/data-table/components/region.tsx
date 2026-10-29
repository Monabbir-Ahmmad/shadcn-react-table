"use client"

import type { RowData } from "@tanstack/react-table"
import * as React from "react"

import type { DataTableInstance } from "../core/types"
import { useTableState } from "../hooks/use-table-state"

/** State that the parts around the body never show: an in-progress column
 *  resize (it changes on every pointer move) and the target and draft of an
 *  inline edit (they change on every keystroke). */
export const TRANSIENT_STATE = new Set([
  "columnSizingInfo",
  "rowDraft",
  "editingCell",
  "editingRowId",
])

/** Inline-edit state only: for parts that do follow a resize. */
export const EDITING_STATE = new Set([
  "rowDraft",
  "editingCell",
  "editingRowId",
])

interface RegionProps {
  /** The table instance (generic over the row type, so typed loosely here). */
  table: unknown
  /** The table's options for this render of its holder. A new object when
   *  the holder re-renders (new data, new props), so the region follows. */
  config: unknown
}

/**
 * Wraps a part of the table (toolbar, header, pagination…) so it re-renders
 * when its props change or when table state changes, except the `skip`
 * slices it never shows. Consumer render props inside it still see every
 * other change.
 */
export function region<P extends object>(
  Component: React.ComponentType<P>,
  skip: ReadonlySet<string> = TRANSIENT_STATE
): React.ComponentType<Omit<P, "table"> & RegionProps> {
  // `config` only makes the memo compare a new value; the wrapped parts
  // ignore it.
  function Region(props: Omit<P, "table"> & RegionProps) {
    useTableState(props.table as DataTableInstance<RowData>, (state) =>
      Object.fromEntries(
        Object.entries(state).filter(([key]) => !skip.has(key))
      )
    )
    return <Component {...(props as unknown as P)} />
  }
  Region.displayName = `Region(${Component.displayName ?? Component.name})`
  return React.memo(Region)
}
