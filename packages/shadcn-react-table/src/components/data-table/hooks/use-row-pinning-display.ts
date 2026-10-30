"use client"

import type { RowData } from "@tanstack/react-table"
import * as React from "react"

import { dt } from "../core/internal"
import type { DataTableInstance } from "../core/types"

const sameSet = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((id) => b.includes(id))

/**
 * Publishes the sticky header's and footer's heights on the scroll surface
 * (`--dt-head-h`, `--dt-foot-h`); unchanged values are not written again.
 * Also called by the row motion, before it measures the rows after a change
 * that resizes the header: the resize observer would publish only after it.
 */
export function publishStickyOffsets<TData extends RowData>(
  table: DataTableInstance<TData>,
  surface: HTMLElement,
  {
    stickyHeader,
    stickyFooter,
  }: { stickyHeader: boolean; stickyFooter: boolean }
) {
  const { tableHeadRef, tableFooterRef } = table.dataTable.refs
  const head = stickyHeader ? (tableHeadRef.current?.offsetHeight ?? 0) : 0
  const foot = stickyFooter ? (tableFooterRef.current?.offsetHeight ?? 0) : 0
  for (const [name, px] of [
    ["--dt-head-h", head],
    ["--dt-foot-h", foot],
  ] as const) {
    const value = `${px}px`
    if (surface.style.getPropertyValue(name) !== value) {
      surface.style.setProperty(name, value)
    }
  }
}

/**
 * Supports `rowPinningDisplayMode`:
 * - publishes the sticky header's and footer's heights on the scroll surface
 *   (`--dt-head-h`, `--dt-foot-h`), so pinned row groups stick just inside
 *   them;
 * - in the select modes, keeps `rowPinning` equal to the selected rows (new
 *   selections are added after the rows already pinned).
 */
export function useRowPinningDisplay<TData extends RowData>({
  table,
  surfaceRef,
  stickyHeader,
  stickyFooter,
}: {
  table: DataTableInstance<TData>
  surfaceRef: React.RefObject<HTMLElement | null>
  stickyHeader: boolean
  stickyFooter: boolean
}) {
  React.useLayoutEffect(() => {
    const surface = surfaceRef.current
    const { tableHeadRef, tableFooterRef } = table.dataTable.refs
    if (!surface) return
    const publish = () =>
      publishStickyOffsets(table, surface, { stickyHeader, stickyFooter })
    publish()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(publish)
    for (const el of [tableHeadRef.current, tableFooterRef.current]) {
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [table, surfaceRef, stickyHeader, stickyFooter])

  React.useEffect(() => {
    const sync = () => {
      const mode = dt(table).rowPinningDisplayMode
      if (mode !== "select-top" && mode !== "select-bottom") return
      const { rowSelection, rowPinning } = table.getState()
      const selected = Object.keys(rowSelection).filter(
        (id) => rowSelection[id]
      )
      const side = mode === "select-top" ? "top" : "bottom"
      const current = [...(rowPinning.top ?? []), ...(rowPinning.bottom ?? [])]
      const next = [
        ...current.filter((id) => selected.includes(id)),
        ...selected.filter((id) => !current.includes(id)),
      ]
      const pinnedSide = rowPinning[side] ?? []
      const otherSide = rowPinning[side === "top" ? "bottom" : "top"] ?? []
      if (sameSet(pinnedSide, next) && otherSide.length === 0) return
      table.setRowPinning(
        side === "top" ? { top: next, bottom: [] } : { top: [], bottom: next }
      )
    }
    sync()
    const subscription = table.store.subscribe(sync)
    return () => subscription.unsubscribe()
  }, [table])
}
