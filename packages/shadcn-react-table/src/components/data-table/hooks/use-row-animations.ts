import * as React from "react"

import { LEAVE_COPY_SLOT, readMotionTokens } from "../core/motion"
import {
  MAX_ANIMATED_ROWS,
  planRowAnimations,
  type RowSnapshot,
} from "../helpers/plan-row-animations"

type Args = {
  /** The `<table>` element. */
  tableRef: React.RefObject<HTMLTableElement | null>
  /** Whether the table animates (see `useAnimationsActive`). */
  active: boolean
  /** Identities whose change means the rows may have moved, entered or left. */
  signal: unknown[]
  /** Every row key now (row ids + "<id>:detail" for open panels). Built only
   *  when `signal` changes. */
  members: () => ReadonlySet<string>
  /** True while rows must not move (a cell or row is being edited, or a new
   *  row created). Motion in flight stops when it turns true. A row drag in
   *  progress is detected by the hook itself (`tr[data-dragging]`). */
  paused: () => boolean
  /** Whether the head shows its filter row (`tr[data-filter-row]`). Include
   *  it in `signal`: the body rows glide as it comes or goes, its inputs fade
   *  in as it appears and a copy of it fades out as it goes. */
  filterRow?: boolean
  /** Brings what the change resized up to date before the rows are measured
   *  in their new places: the offsets the sticky pinned row groups stick at,
   *  which follow the header's height. */
  sync?: (table: HTMLTableElement) => void
  /** A value whose change re-measures the rows (the density), and whether
   *  the rows are virtualized. Scrolled away from the top, the virtualizer
   *  moves its window and the scroll after such a change, so the rows would
   *  jump mid-glide: they snap instead. */
  remeasure?: { value: unknown; virtual: boolean }
}

/** A copy of a leaving row and where it sat, relative to the motion layer. */
type Leaving = {
  node: HTMLTableRowElement
  top: number
  left: number
  width: number
  widths: number[]
}

/** What a change found before React touched the DOM. */
type Job = {
  prev: RowSnapshot
  members: ReadonlySet<string>
  leaving: Leaving[]
  /** The filter row just appeared: fade its inputs in. */
  revealFilterRow: boolean
  /** The pinned groups' edge rows before the change (see `pinnedEdges`). */
  edges: PinnedEdge[]
}

// The table's own rows: not the rows of a table nested in a detail panel.
const ROWS = ":scope > tbody > tr[data-row-id]"

// The head's filter row (see `DataTableHeader`).
const FILTER_ROW = ":scope > thead > tr[data-filter-row]"

// Attributes a leave copy drops so nothing mistakes it for the live row:
// keys the planner and grid navigation look up, ids, tab stops, and form
// control names (a copied checked radio would uncheck the live one).
const COPY_DROPS = [
  "id",
  "name",
  "for",
  "tabindex",
  "data-row-id",
  "data-cell-row",
  "data-cell-col",
  "data-index",
  "aria-rowindex",
  "aria-colindex",
]

// A detail panel opens top-down and closes bottom-up. Only clipped, never
// resized: the rows below already glide by the panel's height, so a height
// animation would move them twice (and lay the table out every frame).
const CLIPPED = "inset(0 0 100% 0)"
const REVEAL: Keyframe[] = [
  { clipPath: CLIPPED, opacity: 0 },
  { clipPath: "inset(0)", opacity: 1 },
]
const HIDE: Keyframe[] = [
  { clipPath: "inset(0)", opacity: 1 },
  { clipPath: CLIPPED, opacity: 0 },
]
const FADE: Keyframe[] = [{ opacity: 1 }, { opacity: 0 }]
// The filter inputs come in from above, the side the row opens from.
const DROP_IN: Keyframe[] = [
  { opacity: 0, transform: "translateY(-4px)" },
  { opacity: 1, transform: "none" },
]

const isDetail = (tr: HTMLTableRowElement) => tr.dataset.rowKind === "detail"

/** Whether the Web Animations API is there (jsdom has none). */
const canAnimate = () =>
  typeof Element !== "undefined" &&
  typeof Element.prototype.animate === "function"

function changed(a: unknown[] | null, b: unknown[]) {
  return !a || a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]))
}

/** Whether the table's scroll surface is scrolled down from its top. */
function scrolledFromTop(table: HTMLTableElement) {
  const surface = table.closest<HTMLElement>('[data-slot="data-table-surface"]')
  return (surface?.scrollTop ?? 0) > 0
}

/** The drawn rows by key. */
function drawnRows(table: HTMLTableElement) {
  const rows = new Map<string, HTMLTableRowElement>()
  table.querySelectorAll<HTMLTableRowElement>(ROWS).forEach((tr) => {
    rows.set(tr.dataset.rowId!, tr)
  })
  return rows
}

/** Where each drawn row sits: px from the table's top edge. */
function topsOf(
  table: HTMLTableElement,
  rows: Map<string, HTMLTableRowElement>
) {
  const origin = table.getBoundingClientRect().top
  const tops = new Map<string, number>()
  for (const [key, tr] of rows) {
    tops.set(key, tr.getBoundingClientRect().top - origin)
  }
  return tops
}

/** The row on a sticky pinned group's inner edge, beside its divider. */
type PinnedEdge = { side: "top" | "bottom"; key: string }

/**
 * The last top-pinned and the first bottom-pinned row: the rows along the
 * dividers the sticky groups draw (`getRowPinningClass`). Static pinning has
 * no groups, so none. Work proportional to the pinned rows.
 */
function pinnedEdges(table: HTMLTableElement): PinnedEdge[] {
  const edges: PinnedEdge[] = []
  for (const side of ["top", "bottom"] as const) {
    const rows = table.querySelectorAll<HTMLTableRowElement>(
      `:scope > tbody[data-pinned-rows="${side}"] > tr[data-row-id]`
    )
    const tr = side === "top" ? rows[rows.length - 1] : rows[0]
    if (tr) edges.push({ side, key: tr.dataset.rowId! })
  }
  return edges
}

function motionLayer(table: HTMLTableElement) {
  return table
    .closest('[data-slot="data-table-surface"]')
    ?.querySelector<HTMLElement>(
      ':scope > [data-slot="data-table-motion-layer"]'
    )
}

/**
 * How far down the motion layer shows its copies (it clips the rest): to the
 * table's bottom, or the surface's visible height if that is taller. That is
 * never past what the table itself scrolls to, so the copies never extend the
 * surface's scroll area: when a change shrinks the content, the browser
 * clamps the scroll with the change, rather than with a jump when the copies
 * go. The trade-off: in a scrolled surface, a leaving row that sat below the
 * table's new bottom is clipped instead of fading out. Reads only.
 */
function layerClip(layer: HTMLElement, table: HTMLTableElement) {
  const top = layer.getBoundingClientRect().top
  const bottom = table.getBoundingClientRect().bottom - top
  return Math.max(bottom, layer.parentElement?.clientHeight ?? 0)
}

/** An inert copy of a row to fade out in the motion layer. */
function copyRow(tr: HTMLTableRowElement) {
  const copy = tr.cloneNode(true) as HTMLTableRowElement
  for (const el of [copy, ...copy.querySelectorAll("*")]) {
    for (const name of COPY_DROPS) el.removeAttribute(name)
  }
  return copy
}

/** A leaving row's copy and where it sat, relative to the layer. Reads. */
function leaveCopy(tr: HTMLTableRowElement, base: DOMRect): Leaving {
  const rect = tr.getBoundingClientRect()
  return {
    node: copyRow(tr),
    top: rect.top - base.top,
    left: rect.left - base.left,
    width: rect.width,
    widths: [...tr.cells].map((c) => c.getBoundingClientRect().width),
  }
}

/**
 * Above this many gliding rows, their cells draw no border line while they
 * glide (the table's border is still cleared). The lines are box-shadow
 * animations, painted on the main thread every frame for every cell, and in
 * a reshuffle that large a missing separator for 280 ms goes unnoticed.
 */
const MAX_BORDER_LINES = 100

/**
 * The layers gliding rows paint on: above the rows they cross (whose pinned
 * cells sit at z 2), under the pinned row groups (z 10) and the sticky header
 * (z 20). The farther a row travels, the higher its layer, so a long glide
 * passes over the short ones instead of sliding under them.
 */
const GLIDE_Z = { min: 3, levels: 7 }

/** Each glide's layer, by its distance (equal distances share one). */
function glideLayers(dys: number[]) {
  const distances = dys.map(Math.abs).sort((a, b) => a - b)
  return dys.map((dy) => {
    const rank = distances.indexOf(Math.abs(dy))
    return GLIDE_Z.min + Math.floor((rank * GLIDE_Z.levels) / dys.length)
  })
}

/** A gliding row's bottom border, drawn by its cells (see `moveBorder`). */
type BorderLine = {
  tr: HTMLTableRowElement
  /** The border as an inset shadow line; null when the row has none. */
  line: string | null
  /** Each cell's own box-shadow, kept under the line. */
  shadows: string[]
}

/**
 * Reads what `moveBorder` needs. Reads only: every gliding row is read before
 * any animation starts, so the whole batch costs one style pass. (Rows don't
 * all share one border: the last row of a group usually has none.)
 */
function readBorder(tr: HTMLTableRowElement): BorderLine {
  const style = getComputedStyle(tr)
  const width = style.borderBottomWidth
  if (style.borderBottomStyle === "none" || width === "0px") {
    return { tr, line: null, shadows: [] }
  }
  return {
    tr,
    line: `inset 0 -${width} 0 0 ${style.borderBottomColor}`,
    shadows: [...tr.cells].map((cell) => getComputedStyle(cell).boxShadow),
  }
}

const CLEAR_BORDER: PropertyIndexedKeyframes = {
  borderBottomColor: ["transparent", "transparent"],
}

/**
 * The table draws a row's bottom border where the row is laid out, under its
 * cells and unmoved by the row's transform: a gliding row covers it, or it
 * cuts across whatever passes there. While the row glides, its cells draw the
 * border instead (an inset line on top of their own shadows: the selection
 * mark, a focus ring) and the table's stays clear. Writes only.
 */
function moveBorder({ tr, line, shadows }: BorderLine, duration: number) {
  if (!line) return []
  const lines = [...tr.cells].map((cell, i) => {
    const own = shadows[i] ?? "none"
    const shadow = own === "none" ? line : `${line}, ${own}`
    return cell.animate({ boxShadow: [shadow, shadow] }, { duration })
  })
  return [...lines, tr.animate(CLEAR_BORDER, { duration })]
}

/** Draws a leave copy at its row's last place and animates it out. */
function animateOutCopy(
  layer: HTMLElement,
  table: HTMLTableElement,
  { node, top, left, width, widths }: Leaving,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
  ghosts: Set<HTMLElement>,
  onRemoved: () => void
) {
  const ghost = document.createElement("table")
  ghost.className = table.className
  // Column size variables and the like live on the table's own style.
  ghost.style.cssText = table.style.cssText
  Object.assign(ghost.style, {
    position: "absolute",
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    minWidth: "0",
    margin: "0",
    tableLayout: "fixed",
  })
  ghost.inert = true
  ghost.setAttribute("data-slot", LEAVE_COPY_SLOT)
  ;[...node.cells].forEach((cell, i) => {
    const w = `${widths[i] ?? 0}px`
    Object.assign(cell.style, { width: w, minWidth: w, maxWidth: w })
  })
  const body = document.createElement("tbody")
  body.append(node)
  ghost.append(body)
  layer.append(ghost)
  ghosts.add(ghost)
  const remove = () => {
    ghost.remove()
    ghosts.delete(ghost)
    onRemoved()
  }
  ghost
    .animate(keyframes, { ...options, fill: "forwards" })
    .finished.then(remove, remove)
}

/**
 * Glides drawn rows to their new places, fades rows that entered the data in
 * and rows that left it out (from copies in the motion layer), using the Web
 * Animations API. Runs only when `signal` changes, never on scroll; the work
 * is proportional to the drawn rows, except `members()` (once per change).
 *
 * Must be called from a component that commits before the table body: its
 * insertion effect reads the rows as they were, before React updates them.
 * That leans on React's commit order, which is internal rather than
 * documented: a sibling's insertion effects run before the next sibling's DOM
 * mutations (React 19.2 runs a component's own insertion effects only after
 * its children's mutations, hence a sibling placed before `<table>`, see
 * `DataTableRowMotion`). If an upgrade changes that, the old positions and the
 * leave copies come from the new DOM. The browser tests in
 * `data-table.animations.browser.test.tsx` that guard it: "glides rows when
 * sorting", "fades out rows that leave and removes the copies", "draws a
 * leave copy where the row was, in a scrolled surface" and "hides a detail
 * panel as the rows below glide up".
 */
export function useRowAnimations({
  tableRef,
  active,
  signal,
  members,
  paused,
  filterRow = false,
  sync,
  remeasure,
}: Args) {
  const lastSignal = React.useRef<unknown[] | null>(null)
  const lastRemeasure = React.useRef<unknown>(remeasure?.value)
  const lastMembers = React.useRef<ReadonlySet<string> | null>(null)
  const job = React.useRef<Job | null>(null)
  const running = React.useRef(new Set<Animation>())
  const ghosts = React.useRef(new Set<HTMLElement>())
  /** The motion layer, while it is sized to show copies (see `layerClip`). */
  const sized = React.useRef<HTMLElement | null>(null)
  /** The surface, and its own overflow-y, while it hides the glide's. */
  const hidden = React.useRef<{ el: HTMLElement; was: string } | null>(null)

  /** Back to an empty, zero-height layer once no copy is left. */
  const unclip = () => {
    if (ghosts.current.size > 0 || !sized.current) return
    sized.current.style.removeProperty("height")
    sized.current = null
  }

  /** The surface scrolls as it did, once no row glides. */
  const unhide = () => {
    if (running.current.size > 0 || !hidden.current) return
    hidden.current.el.style.overflowY = hidden.current.was
    hidden.current = null
  }

  /** Drops the motion in flight, so it never plays against a new layout. */
  const stop = () => {
    for (const animation of running.current) animation.cancel()
    running.current.clear()
    for (const ghost of ghosts.current) ghost.remove()
    ghosts.current.clear()
    unclip()
    unhide()
  }

  // Before React touches the rows: where they sit, and copies of the rows
  // about to leave.
  React.useInsertionEffect(() => {
    job.current = null
    const isChange = changed(lastSignal.current, signal)
    lastSignal.current = signal
    const remeasured = remeasure?.value !== lastRemeasure.current
    lastRemeasure.current = remeasure?.value
    if (!active || !canAnimate()) {
      lastMembers.current = null
      stop()
      return
    }
    // Unchanged rows: nothing to do, unless animations just turned on and
    // the next change needs a baseline, or an edit just started under motion
    // still in flight.
    if (!isChange && lastMembers.current) {
      const moving = running.current.size > 0 || ghosts.current.size > 0
      if (moving && paused()) stop()
      return
    }
    const next = members()
    const prev = lastMembers.current
    lastMembers.current = next
    // On the first commit the table is not attached yet: `next` is the
    // baseline for the next change.
    const table = tableRef.current
    if (!prev || !table) return
    if (paused() || table.querySelector(":scope > tbody > tr[data-dragging]")) {
      stop()
      return
    }
    if (remeasured && remeasure?.virtual && scrolledFromTop(table)) {
      stop()
      return
    }
    const rows = drawnRows(table)
    // Far more drawn rows than could animate: the planner would skip this
    // change, so skip it before reading every row's position.
    if (rows.size > 3 * MAX_ANIMATED_ROWS) {
      stop()
      return
    }
    const tops = topsOf(table, rows)
    const gone = [...rows.keys()].filter((key) => !next.has(key))
    const base = motionLayer(table)?.getBoundingClientRect()
    const leaving: Leaving[] = []
    // Past the limit the planner skips the change, so copy nothing.
    if (base && gone.length <= MAX_ANIMATED_ROWS) {
      for (const key of gone) leaving.push(leaveCopy(rows.get(key)!, base))
    }
    // The filter row goes: a copy fades out where it was while the rows
    // glide up over it. Cheaper than keeping the row mounted to fade it, and
    // the layout changes at once, as for any other change.
    const filter = table.querySelector<HTMLTableRowElement>(FILTER_ROW)
    if (base && filter && !filterRow) leaving.push(leaveCopy(filter, base))
    job.current = {
      prev: { members: prev, tops },
      members: next,
      leaving,
      revealFilterRow: !filter && filterRow,
      edges: pinnedEdges(table),
    }
  })

  // After the update: glide, fade in, and fade out the copies.
  React.useLayoutEffect(() => {
    const work = job.current
    job.current = null
    const table = tableRef.current
    if (!work || !table) return
    // Rows mid-animation were measured where they showed; restart from
    // there. The previous change's leave copies would fade over the new
    // layout: drop them too.
    stop()
    const live = running.current

    sync?.(table)
    const rows = drawnRows(table)
    const plan = planRowAnimations(work.prev, {
      members: work.members,
      tops: topsOf(table, rows),
    })
    if (plan.skipped) {
      stop()
      return
    }
    const { duration, durationFast, ease } = readMotionTokens(table)
    const layer = work.leaving.length > 0 ? motionLayer(table) : null
    const clip = layer ? layerClip(layer, table) : 0
    // A surface that does not scroll in the new layout: rows gliding from
    // past its bottom (a shorter table) would flash a scrollbar.
    const surface = table.closest<HTMLElement>(
      '[data-slot="data-table-surface"]'
    )
    const fits = !!surface && surface.scrollHeight <= surface.clientHeight
    const track = (animation: Animation) => {
      live.add(animation)
      const done = () => {
        live.delete(animation)
        unhide()
      }
      animation.finished.then(done, done)
    }

    const glides = plan.moves.flatMap(({ key, dy }) => {
      const tr = rows.get(key)
      return tr ? [{ tr, dy }] : []
    })
    // All reads before the first animation: a read after a write would
    // force another style pass, once per row.
    const borders =
      glides.length <= MAX_BORDER_LINES
        ? glides.map(({ tr }) => readBorder(tr))
        : null
    const layers = glideLayers(glides.map(({ dy }) => dy))
    glides.forEach(({ tr, dy }, i) => {
      // Positioned only while it glides, so its z-index applies; sticky
      // pinned cells inside it stay sticky.
      const layer = { position: "relative", zIndex: layers[i] }
      track(
        tr.animate(
          [
            { transform: `translateY(${dy}px)`, ...layer },
            { transform: "none", ...layer },
          ],
          { duration, easing: ease }
        )
      )
      const border = borders?.[i]
      if (border) {
        for (const animation of moveBorder(border, duration)) track(animation)
      } else if (!borders) {
        track(tr.animate(CLEAR_BORDER, { duration }))
      }
    })
    // A sticky pinned group draws its divider (a pseudo-element) along its
    // edge, which snaps to the new layout: while the row on that edge glides
    // (a density change, the filter row), the divider glides with it, as a
    // gliding row's border does (see `moveBorder`). A new edge row (a row
    // pinned or unpinned there) is a new edge: the divider just moves.
    for (const { side, key } of pinnedEdges(table)) {
      if (!work.edges.some((e) => e.side === side && e.key === key)) continue
      const move = plan.moves.find((m) => m.key === key)
      const group = rows.get(key)?.parentElement
      if (!move || !group) continue
      track(
        group.animate(
          { transform: [`translateY(${move.dy}px)`, "none"] },
          { duration, easing: ease, pseudoElement: "::after" }
        )
      )
    }
    // The filter row appeared: its inputs fade in and drop into place, timed
    // like an entering row. Its cells show at once, so the rows glide out
    // from under them.
    if (work.revealFilterRow) {
      const filter = table.querySelector<HTMLTableRowElement>(FILTER_ROW)
      for (const cell of filter?.cells ?? []) {
        for (const el of cell.children) {
          track(
            el.animate(DROP_IN, {
              duration: durationFast,
              easing: ease,
              delay: durationFast / 2,
              fill: "backwards",
            })
          )
        }
      }
    }
    // Rows new to a virtual window came with the change (from outside the
    // drawn rows, so there is no place to glide from): they fade in too, at
    // once, as the rows they replace are gone (still in the data: no copies).
    const arrived = new Set(plan.arrivals)
    for (const key of [...plan.enters, ...plan.arrivals]) {
      const tr = rows.get(key)
      if (!tr) continue
      if (isDetail(tr)) {
        // Clip the cells (the panel is one full-width cell). Same timing as
        // the glide, so the panel's bottom edge and the row below move
        // together.
        for (const cell of tr.cells) {
          track(
            cell.animate(REVEAL, {
              duration,
              easing: ease,
              fill: "backwards",
            })
          )
        }
        // The table draws the row's collapsed bottom border, which no clip
        // or opacity on the cells or the row hides: keep it clear until the
        // panel's bottom edge reaches it.
        track(tr.animate(CLEAR_BORDER, { duration }))
        continue
      }
      track(
        tr.animate(
          [
            { opacity: 0, transform: "translateY(4px)" },
            { opacity: 1, transform: "none" },
          ],
          {
            duration: durationFast,
            easing: ease,
            // Starts as the leaving rows fade, hidden until then. With none
            // leaving (grouping turned on, a filter cleared) there is nothing
            // to wait for: a delay would leave gaps the other rows glide past.
            delay:
              arrived.has(key) || work.leaving.length === 0
                ? 0
                : durationFast / 2,
            fill: "backwards",
          }
        )
      )
    }
    if (fits && live.size > 0) {
      hidden.current = { el: surface, was: surface.style.overflowY }
      surface.style.overflowY = "hidden"
    }
    if (!layer) return
    layer.style.height = `${clip}px`
    sized.current = layer
    for (const copy of work.leaving) {
      // A panel closes with the glide of the rows below; other rows fade.
      const detail = isDetail(copy.node)
      animateOutCopy(
        layer,
        table,
        copy,
        detail ? HIDE : FADE,
        { duration: detail ? duration : durationFast, easing: ease },
        ghosts.current,
        unclip
      )
    }
  })

  React.useEffect(() => {
    const live = running.current
    const copies = ghosts.current
    return () => {
      for (const animation of live) animation.cancel()
      live.clear()
      for (const ghost of copies) ghost.remove()
      copies.clear()
    }
  }, [])
}
