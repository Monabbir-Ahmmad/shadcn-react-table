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

/** Frames to wait for a scrolled-to cell to render before giving up. */
const MAX_FOCUS_FRAMES = 30

export interface GridCell {
  row: number
  col: number
}

export interface UseGridNavigationOptions<T extends HTMLElement> {
  enabled: boolean
  /** The grid element whose `[data-cell-row]` cells are navigated. */
  ref: React.RefObject<T | null>
  /** Number of navigable rows (display order: top, center, bottom). */
  rowCount: () => number
  /** Number of navigable columns (visible leaf columns). */
  colCount: () => number
  /** Brings a cell that is not rendered (virtualized) into view. */
  scrollToCell: (cell: GridCell) => void
}

const findCell = (root: HTMLElement, { row, col }: GridCell) =>
  root.querySelector<HTMLElement>(
    `[data-cell-row="${row}"][data-cell-col="${col}"]`
  )

/**
 * Roving-tabindex keyboard navigation for body cells (MRT V3 parity). Cells
 * carry `data-cell-row` / `data-cell-col`; the grid is a single tab stop and
 * arrow keys / Home / End move focus between cells. Bounds come from the data,
 * not the DOM, so virtualized rows and columns are reachable: a target that is
 * not rendered is scrolled into view, then focused once it renders. Skipped
 * while focus is in an editable control so typing in a filter/edit field isn't
 * hijacked.
 */
export function useGridNavigation<T extends HTMLElement>({
  enabled,
  ref,
  rowCount,
  colCount,
  scrollToCell,
}: UseGridNavigationOptions<T>) {
  const activeCellRef = React.useRef<GridCell>({ row: 0, col: 0 })
  const pendingFrameRef = React.useRef<number | null>(null)

  // After every render, exactly one rendered cell is the tab stop: the active
  // cell when it is rendered, otherwise the first rendered cell.
  React.useLayoutEffect(() => {
    const root = ref.current
    if (!enabled || !root) return
    const cells = root.querySelectorAll<HTMLElement>("[data-cell-row]")
    if (cells.length === 0) return
    const stop = findCell(root, activeCellRef.current) ?? cells[0]!
    for (const cell of cells) cell.tabIndex = cell === stop ? 0 : -1
  })

  React.useEffect(
    () => () => {
      if (pendingFrameRef.current != null)
        cancelAnimationFrame(pendingFrameRef.current)
    },
    []
  )

  const focusCell = (root: HTMLElement, el: HTMLElement) => {
    for (const cell of root.querySelectorAll<HTMLElement>("[data-cell-row]"))
      cell.tabIndex = -1
    el.tabIndex = 0
    el.focus()
  }

  const moveTo = (root: HTMLElement, target: GridCell) => {
    activeCellRef.current = target
    if (pendingFrameRef.current != null)
      cancelAnimationFrame(pendingFrameRef.current)
    pendingFrameRef.current = null

    const el = findCell(root, target)
    if (el) {
      focusCell(root, el)
      return
    }
    // Virtualized: scroll the target into view, then focus it once rendered.
    scrollToCell(target)
    let frames = 0
    const tryFocus = () => {
      pendingFrameRef.current = null
      const rendered = findCell(root, target)
      if (rendered) {
        if (activeCellRef.current === target) focusCell(root, rendered)
        return
      }
      if (++frames < MAX_FOCUS_FRAMES)
        pendingFrameRef.current = requestAnimationFrame(tryFocus)
    }
    pendingFrameRef.current = requestAnimationFrame(tryFocus)
  }

  const onKeyDown = (event: React.KeyboardEvent<T>) => {
    if (!enabled || !NAV_KEYS.has(event.key)) return
    const root = ref.current
    if (!root) return

    const active = document.activeElement as HTMLElement | null
    if (active && EDITABLE.has(active.tagName)) return

    const current = active?.closest<HTMLElement>("[data-cell-row]")
    if (!current || !root.contains(current)) return

    const maxRow = rowCount() - 1
    const maxCol = colCount() - 1
    if (maxRow < 0 || maxCol < 0) return

    let row = Number(current.dataset.cellRow)
    let col = Number(current.dataset.cellCol)
    const from = { row, col }

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

    if (row === from.row && col === from.col) return
    event.preventDefault()
    moveTo(root, { row, col })
  }

  /** Keeps the active cell in sync when a cell is focused by click or Tab. */
  const onFocus = (event: React.FocusEvent<T>) => {
    if (!enabled) return
    const cell = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-cell-row]"
    )
    if (!cell) return
    activeCellRef.current = {
      row: Number(cell.dataset.cellRow),
      col: Number(cell.dataset.cellCol),
    }
  }

  return { onKeyDown, onFocus, activeCellRef }
}
