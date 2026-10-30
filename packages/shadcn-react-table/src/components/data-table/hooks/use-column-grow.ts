"use client"

import type { RowData } from "@tanstack/react-table"
import * as React from "react"

import type { DataTableInstance } from "../core/types"
import { getColumnGrowVars, setColumnGrowVars } from "../utils/column-styles"

/**
 * `layoutMode: "grid"`: shares the surface's spare width between the growing
 * columns. The shares are CSS variables on the scroll surface (see
 * `getColumnGrowVars`), which the cells' widths and the pinned columns'
 * offsets read, so a container resize updates them without re-rendering a
 * row. They are recomputed after every render of the table (a resize,
 * hidden, pinned or reordered column) and whenever the surface changes size.
 */
export function useColumnGrow<TData extends RowData>(
  table: DataTableInstance<TData>,
  surfaceRef: React.RefObject<HTMLElement | null>,
  enabled: boolean
) {
  const written = React.useRef<Record<string, string>>({})
  const apply = React.useCallback(() => {
    const surface = surfaceRef.current
    if (!surface) return
    const vars = enabled ? getColumnGrowVars(table, surface.clientWidth) : {}
    written.current = setColumnGrowVars(surface, vars, written.current)
  }, [table, surfaceRef, enabled])

  // Every render: the inputs (sizes, visibility, pinning) live in table state.
  React.useLayoutEffect(apply)

  React.useEffect(() => {
    const surface = surfaceRef.current
    if (!enabled || !surface || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => apply())
    observer.observe(surface)
    return () => observer.disconnect()
  }, [apply, enabled, surfaceRef])
}
