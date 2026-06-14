"use client"

import * as React from "react"

const NAV_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
])

const EDITABLE = new Set(["INPUT", "TEXTAREA", "SELECT"])

/**
 * Roving-tabindex keyboard navigation for body cells (MRT V3 parity). Cells
 * carry `data-cell-row` / `data-cell-col`; the grid is a single tab stop and
 * arrow keys / Home / End move focus between cells. Skipped while focus is in
 * an editable control so typing in a filter/edit field isn't hijacked.
 */
export function useGridNavigation<T extends HTMLElement>(enabled: boolean) {
  const ref = React.useRef<T>(null)

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<T>) => {
      if (!enabled || !NAV_KEYS.has(event.key)) return
      const root = ref.current
      if (!root) return

      const active = document.activeElement as HTMLElement | null
      if (active && EDITABLE.has(active.tagName)) return

      const current = active?.closest<HTMLElement>("[data-cell-row]")
      if (!current || !root.contains(current)) return

      const cells = Array.from(
        root.querySelectorAll<HTMLElement>("[data-cell-row]")
      )
      if (cells.length === 0) return

      let maxRow = 0
      let maxCol = 0
      for (const cell of cells) {
        maxRow = Math.max(maxRow, Number(cell.dataset.cellRow))
        maxCol = Math.max(maxCol, Number(cell.dataset.cellCol))
      }

      let row = Number(current.dataset.cellRow)
      let col = Number(current.dataset.cellCol)

      switch (event.key) {
        case "ArrowUp":
          row = Math.max(0, row - 1)
          break
        case "ArrowDown":
          row = Math.min(maxRow, row + 1)
          break
        case "ArrowLeft":
          col = Math.max(0, col - 1)
          break
        case "ArrowRight":
          col = Math.min(maxCol, col + 1)
          break
        case "Home":
          col = 0
          if (event.ctrlKey) row = 0
          break
        case "End":
          col = maxCol
          if (event.ctrlKey) row = maxRow
          break
      }

      const next = cells.find(
        (cell) =>
          Number(cell.dataset.cellRow) === row &&
          Number(cell.dataset.cellCol) === col
      )
      if (!next || next === current) return

      event.preventDefault()
      for (const cell of cells) cell.tabIndex = -1
      next.tabIndex = 0
      next.focus()
    },
    [enabled]
  )

  return { ref, onKeyDown }
}
