"use client"

import * as React from "react"

const NAV_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "PageUp",
  "PageDown",
])

/** Controls a cell can hold (edit trigger, expand, copy, checkbox…). */
const FOCUSABLE =
  'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

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
  /** Right-to-left: ArrowLeft moves to the next column, ArrowRight back. */
  rtl?: boolean
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
  rtl = false,
}: UseGridNavigationOptions<T>) {
  const activeCellRef = React.useRef<GridCell>({ row: 0, col: 0 })
  const pendingFrameRef = React.useRef<number | null>(null)
  // The last element focused inside the grid (a cell or a control in one).
  const focusedRef = React.useRef<HTMLElement | null>(null)

  // After every render, exactly one rendered cell is the tab stop: the active
  // cell when it is rendered, otherwise the first rendered cell.
  React.useLayoutEffect(() => {
    const root = ref.current
    if (!enabled || !root) return
    // The focused element unmounted and focus fell to the page: an inline
    // editor closed, save/cancel buttons went away, the row was deleted, or it
    // scrolled out of a virtual window. Put focus back at the same cell
    // position (on its control when a control had it), or park it on the grid
    // so the keys keep working from the active cell.
    const focused = focusedRef.current
    if (
      focused &&
      !focused.isConnected &&
      (document.activeElement === document.body || !document.activeElement)
    ) {
      focusedRef.current = null
      const cell = findCell(root, activeCellRef.current)
      if (cell) {
        const inner = focused.matches("[data-cell-row]")
          ? null
          : cell.querySelector<HTMLElement>(FOCUSABLE)
        ;(inner ?? cell).focus({ preventScroll: true })
      } else {
        root.focus({ preventScroll: true })
      }
    }
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

  /** Enter / F2 / Ctrl+C on a focused cell (not on a control inside it). */
  const onCellCommand = (event: React.KeyboardEvent<T>, cell: HTMLElement) => {
    if (event.key === "Enter" || event.key === "F2") {
      // Activate the cell's control: open its editor, toggle, follow a link.
      const control = cell.querySelector<HTMLElement>(FOCUSABLE)
      if (!control) return
      event.preventDefault()
      if (EDITABLE.has(control.tagName)) control.focus()
      else control.click()
      return
    }
    const isCopy =
      (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c"
    if (isCopy && !window.getSelection()?.toString()) {
      event.preventDefault()
      void navigator.clipboard?.writeText(cell.textContent?.trim() ?? "")
    }
  }

  const onKeyDown = (event: React.KeyboardEvent<T>) => {
    if (!enabled) return
    const root = ref.current
    if (!root) return

    const active = document.activeElement as HTMLElement | null
    if (active && EDITABLE.has(active.tagName)) return

    if (!NAV_KEYS.has(event.key)) {
      if (active?.matches("[data-cell-row]") && root.contains(active)) {
        onCellCommand(event, active)
      }
      return
    }

    // Focus is on a cell, or parked on the grid itself (see above).
    const current = active?.closest<HTMLElement>("[data-cell-row]")
    let from: GridCell
    if (current && root.contains(current)) {
      from = {
        row: Number(current.dataset.cellRow),
        col: Number(current.dataset.cellCol),
      }
    } else if (active === root) {
      from = activeCellRef.current
    } else return

    const maxRow = rowCount() - 1
    const maxCol = colCount() - 1
    if (maxRow < 0 || maxCol < 0) return

    let { row, col } = from

    switch (event.key) {
      case "ArrowUp":
        row = Math.max(0, row - 1)
        break
      case "ArrowDown":
        row = Math.min(maxRow, row + 1)
        break
      case "PageUp":
      case "PageDown": {
        // About one screen of rows: the visible height over a row's height.
        const rowHeight = current?.offsetHeight || 40
        const step = Math.max(1, Math.floor(root.clientHeight / rowHeight) - 1)
        row =
          event.key === "PageDown"
            ? Math.min(maxRow, row + step)
            : Math.max(0, row - step)
        break
      }
      case "ArrowLeft":
      case "ArrowRight":
        // Columns run right to left in RTL, so the arrows swap meaning.
        if ((event.key === "ArrowRight") !== rtl) {
          col = Math.min(maxCol, col + 1)
        } else {
          col = Math.max(0, col - 1)
        }
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

    if (row === from.row && col === from.col && current) return
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
    focusedRef.current = event.target as HTMLElement
    activeCellRef.current = {
      row: Number(cell.dataset.cellRow),
      col: Number(cell.dataset.cellCol),
    }
  }

  /** Forgets the focused element once focus moves out of the grid, so a
   *  later unmount there does not pull focus back in. */
  const onBlur = (event: React.FocusEvent<T>) => {
    const root = ref.current
    const next = event.relatedTarget as Node | null
    const target = event.target as Node
    if (target.isConnected && root && (!next || !root.contains(next))) {
      focusedRef.current = null
    }
  }

  return { onKeyDown, onFocus, onBlur, activeCellRef }
}
