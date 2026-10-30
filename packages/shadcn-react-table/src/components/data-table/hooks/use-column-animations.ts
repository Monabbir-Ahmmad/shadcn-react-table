import * as React from "react"

import { LEAVE_COPY_SLOT, readMotionTokens } from "../core/motion"
import { layerClip, motionLayer } from "./use-row-animations"

/**
 * Above this many cells to move or fade (the table's drawn rows, header and
 * footer rows included, times the columns that move or come in), a column
 * change just happens: one `animate()` per cell, and a reshuffle that large
 * reads as a jump anyway.
 */
export const MAX_ANIMATED_CELLS = 3000

/** The column a cell belongs to (header, filter, body and footer cells). */
const COLUMN = "data-column-id"

type Args = {
  /** The `<table>` element. */
  tableRef: React.RefObject<HTMLTableElement | null>
  /** Whether the table animates (see `useAnimationsActive`). */
  active: boolean
  /** Identities whose change means the columns may have moved, come or gone:
   *  their order, visibility and pinning. Never their sizes: a resize must
   *  not animate. */
  signal: unknown[]
  /** Every header column id now (leaf and group columns). Built only when
   *  `signal` changes. */
  members: () => ReadonlySet<string>
  /** True while columns must not move (a cell or row is being edited, or a
   *  new row created). Motion in flight stops when it turns true. A column
   *  drag is detected by the hook itself (`th[data-dragging]`). */
  paused: () => boolean
}

/** A copy of a leaving column's header cell and where it sat. */
type HeadCopy = { node: HTMLTableCellElement; rect: DOMRect }

/** What a change found before React touched the DOM. */
type Job = {
  /** The header column ids before the change. */
  prev: ReadonlySet<string>
  /** Each drawn column's left edge before the change (px, on screen). */
  lefts: Map<string, number>
  leaving: HeadCopy[]
}

// Attributes a header copy drops so nothing mistakes it for the live cell.
const COPY_DROPS = [
  "id",
  "name",
  "for",
  "tabindex",
  COLUMN,
  "data-dragging",
  "aria-sort",
  "aria-colindex",
  "aria-describedby",
]

/** Whether the Web Animations API is there (jsdom has none). */
const canAnimate = () =>
  typeof Element !== "undefined" &&
  typeof Element.prototype.animate === "function"

function changed(a: unknown[] | null, b: unknown[]) {
  return !a || a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]))
}

/** A column is being dragged: dnd-kit animates its moves and its drop. */
const dragging = (table: HTMLTableElement) =>
  !!table.querySelector(":scope > thead > tr > th[data-dragging]")

/** The table's own header cells that belong to a column. */
function headCells(table: HTMLTableElement) {
  const cells: HTMLTableCellElement[] = []
  for (const tr of table.tHead?.rows ?? []) {
    for (const cell of tr.cells) if (cell.hasAttribute(COLUMN)) cells.push(cell)
  }
  return cells
}

/**
 * Each drawn column's left edge on screen, from its first header cell (or,
 * with no header, from the first row that has column cells). The table's
 * own rows only: never those of a table nested in a detail panel. Reads.
 */
function leftsOf(table: HTMLTableElement) {
  let cells = headCells(table)
  if (cells.length === 0) {
    for (const tr of table.rows) {
      cells = [...tr.cells].filter((cell) => cell.hasAttribute(COLUMN))
      if (cells.length > 0) break
    }
  }
  const lefts = new Map<string, number>()
  for (const cell of cells) {
    const id = cell.getAttribute(COLUMN)!
    if (!lefts.has(id)) lefts.set(id, cell.getBoundingClientRect().left)
  }
  return lefts
}

/** An inert copy of a header cell, unstuck and undragged. Reads the rect. */
function copyHead(cell: HTMLTableCellElement): HeadCopy {
  const node = cell.cloneNode(true) as HTMLTableCellElement
  for (const el of [node, ...node.querySelectorAll("*")]) {
    for (const name of COPY_DROPS) el.removeAttribute(name)
  }
  return { node, rect: cell.getBoundingClientRect() }
}

/**
 * Glides the drawn columns to their new places when they are hidden, shown,
 * pinned or reordered, fades the columns that came in, and fades a copy of a
 * leaving column's header out, using the Web Animations API. Runs only when
 * `signal` changes, never on scroll or resize; the work is proportional to
 * the drawn cells, and skipped past `MAX_ANIMATED_CELLS`.
 *
 * Each cell of a moved column (header, filter, body and footer) animates
 * `translateX(dx) → none`, measured from the column's header: horizontal
 * offsets on screen, so right to left needs nothing special, and a pinned
 * cell stays sticky under its transform. A pinned column's divider is its
 * edge cell's pseudo-element, so it travels with the cell. Only the header
 * of a leaving column fades out: copying every body cell would cost a clone
 * per drawn row for a 160 ms fade the moving columns mostly cover, while the
 * header copy keeps the cue of what went.
 *
 * A column drag is left to dnd-kit, which already animates the moves and the
 * drop: a change made while a header carries `data-dragging` (the drop's
 * commit still finds it there) is skipped.
 *
 * Like `useRowAnimations`, it must be called from a component that commits
 * before the table: its insertion effect reads the cells before React
 * updates them (see `DataTableRowMotion`).
 */
export function useColumnAnimations({
  tableRef,
  active,
  signal,
  members,
  paused,
}: Args) {
  const lastSignal = React.useRef<unknown[] | null>(null)
  const lastMembers = React.useRef<ReadonlySet<string> | null>(null)
  const job = React.useRef<Job | null>(null)
  const running = React.useRef(new Set<Animation>())
  const copies = React.useRef(new Set<HTMLElement>())
  /** The motion layer, while this hook has sized it to show copies. */
  const sized = React.useRef<HTMLElement | null>(null)

  /** Back to a zero-height layer once no copy is left in it. */
  const unclip = () => {
    if (copies.current.size > 0 || !sized.current) return
    // The row motion's leave copies may still be there: it unclips then.
    if (sized.current.childElementCount === 0) {
      sized.current.style.removeProperty("height")
    }
    sized.current = null
  }

  /** Drops the motion in flight, so it never plays against a new layout. */
  const stop = () => {
    for (const animation of running.current) animation.cancel()
    running.current.clear()
    for (const copy of copies.current) copy.remove()
    copies.current.clear()
    unclip()
  }

  // Before React touches the cells: where the columns sit, and copies of the
  // headers about to leave.
  React.useInsertionEffect(() => {
    job.current = null
    const isChange = changed(lastSignal.current, signal)
    lastSignal.current = signal
    if (!active || !canAnimate()) {
      lastMembers.current = null
      stop()
      return
    }
    const table = tableRef.current
    // Unchanged columns: nothing to do, unless animations just turned on and
    // the next change needs a baseline, or an edit or a drag just started
    // under motion still in flight.
    if (!isChange && lastMembers.current) {
      const moving = running.current.size > 0 || copies.current.size > 0
      if (moving && (paused() || (table && dragging(table)))) stop()
      return
    }
    const next = members()
    const prev = lastMembers.current
    lastMembers.current = next
    // On the first commit the table is not attached yet: `next` is the
    // baseline for the next change.
    if (!prev || !table) return
    if (paused() || dragging(table)) {
      stop()
      return
    }
    const leaving = motionLayer(table)
      ? headCells(table)
          .filter((cell) => !next.has(cell.getAttribute(COLUMN)!))
          .map(copyHead)
      : []
    job.current = { prev, lefts: leftsOf(table), leaving }
  })

  // After the update: glide, fade in, and fade the header copies out.
  React.useLayoutEffect(() => {
    const work = job.current
    job.current = null
    const table = tableRef.current
    if (!work || !table) return
    // Columns mid-glide were measured where they showed; restart from there.
    stop()
    const { duration, durationFast, ease } = readMotionTokens(table)

    const moves = new Map<string, number>()
    const enters = new Map<string, number>()
    for (const [id, left] of leftsOf(table)) {
      const was = work.lefts.get(id)
      if (was === undefined) {
        // New to the table: in as the leaving header fades. Drawn now but
        // not before (a virtual window that shifted): at once.
        enters.set(id, work.prev.has(id) ? 0 : durationFast / 2)
      } else if (Math.abs(was - left) >= 0.5) {
        moves.set(id, was - left)
      }
    }
    const cells = moves.size + enters.size
    if (cells > 0 && table.rows.length * cells > MAX_ANIMATED_CELLS) return

    // All reads before the first animation.
    const layer = work.leaving.length > 0 ? motionLayer(table) : null
    const box = layer?.getBoundingClientRect()
    const bounds = layer ? table.getBoundingClientRect() : null
    const clip = layer ? layerClip(layer, table) : 0

    const live = running.current
    const track = (animation: Animation) => {
      live.add(animation)
      const done = () => live.delete(animation)
      animation.finished.then(done, done)
    }
    if (cells > 0) {
      for (const tr of table.rows) {
        for (const cell of tr.cells) {
          const id = cell.getAttribute(COLUMN)
          if (id === null) continue
          const dx = moves.get(id)
          if (dx !== undefined) {
            track(
              cell.animate(
                { transform: [`translateX(${dx}px)`, "none"] },
                { duration, easing: ease }
              )
            )
            continue
          }
          const delay = enters.get(id)
          if (delay === undefined) continue
          track(
            cell.animate(
              { opacity: [0, 1] },
              { duration: durationFast, easing: ease, delay, fill: "backwards" }
            )
          )
        }
      }
    }
    if (!layer || !box || !bounds) return
    if (clip > (parseFloat(layer.style.height) || 0)) {
      layer.style.height = `${clip}px`
    }
    sized.current = layer
    for (const { node, rect } of work.leaving) {
      // Kept within the table's new width, so a copy past its end never
      // widens the surface's scroll area.
      const left = Math.max(rect.left, bounds.left)
      const right = Math.min(rect.right, bounds.right)
      if (right - left < 1) continue
      const copy = document.createElement("div")
      copy.setAttribute("data-slot", LEAVE_COPY_SLOT)
      copy.inert = true
      Object.assign(copy.style, {
        position: "absolute",
        top: `${rect.top - box.top}px`,
        left: `${left - box.left}px`,
        width: `${right - left}px`,
        height: `${rect.height}px`,
        overflow: "hidden",
        // Above the sticky header (z 20), which would hide it.
        zIndex: "21",
      })
      const ghost = document.createElement("table")
      ghost.className = table.className
      // Column size variables and the like live on the table's own style.
      ghost.style.cssText = table.style.cssText
      Object.assign(ghost.style, {
        position: "absolute",
        top: "0",
        left: `${rect.left - left}px`,
        width: `${rect.width}px`,
        minWidth: "0",
        margin: "0",
        tableLayout: "fixed",
      })
      const w = `${rect.width}px`
      // Not sticky (it would stick inside the copy), nor dragged.
      Object.assign(node.style, {
        width: w,
        minWidth: w,
        maxWidth: w,
        height: `${rect.height}px`,
        position: "relative",
        insetInlineStart: "auto",
        insetInlineEnd: "auto",
        transform: "none",
        translate: "none",
        transition: "none",
      })
      const head = document.createElement("thead")
      const tr = document.createElement("tr")
      tr.append(node)
      head.append(tr)
      ghost.append(head)
      copy.append(ghost)
      layer.append(copy)
      copies.current.add(copy)
      const remove = () => {
        copy.remove()
        copies.current.delete(copy)
        unclip()
      }
      const fade = copy.animate(
        { opacity: [1, 0] },
        { duration: durationFast, easing: ease, fill: "forwards" }
      )
      track(fade)
      fade.finished.then(remove, remove)
    }
    unclip()
  })

  React.useEffect(() => {
    const live = running.current
    const held = copies.current
    return () => {
      for (const animation of live) animation.cancel()
      live.clear()
      for (const copy of held) copy.remove()
      held.clear()
    }
  }, [])
}
