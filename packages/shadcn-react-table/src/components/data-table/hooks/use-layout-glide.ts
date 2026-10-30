import * as React from "react"

import { readMotionTokens } from "../core/motion"

/** `data-slot` of the short-lived copy a keyed item leaves behind. */
export const GLIDE_COPY_SLOT = "data-table-glide-copy"

/**
 * Marks two elements as one item in a gliding container (the search button
 * and the search box it opens into): when one replaces the other, the new one
 * grows out of the old one's box while a copy of the old one shrinks into the
 * new one's box and fades.
 */
export const GLIDE_KEY_ATTR = "data-glide-key"

/** An item that carries a glide key, as it was before the change. */
type Keyed = { el: Element; rect: DOMRect; radius: string; copy: HTMLElement }

/** What a change found before React touched the container. */
type Before = { rects: Map<Element, DOMRect>; keyed: Map<string, Keyed> }

// Attributes a copy drops so nothing mistakes it for the live item.
const COPY_DROPS = ["id", "name", "for", "tabindex"]

function changed(a: unknown[] | null, b: unknown[]) {
  return !a || a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]))
}

/** The container's own items (never a copy it holds). */
function items(container: HTMLElement) {
  return [...container.children].filter(
    (el) => el.getAttribute("data-slot") !== GLIDE_COPY_SLOT
  )
}

/** An inert copy of an item, to play its leave. */
function copyOf(el: Element) {
  const copy = el.cloneNode(true) as HTMLElement
  for (const node of [copy, ...copy.querySelectorAll("*")]) {
    for (const name of COPY_DROPS) node.removeAttribute(name)
  }
  copy.removeAttribute(GLIDE_KEY_ATTR)
  copy.setAttribute("data-slot", GLIDE_COPY_SLOT)
  copy.setAttribute("aria-hidden", "true")
  copy.setAttribute("inert", "")
  return copy
}

/** `inset()` from `outer` in to `inner` (never outwards), with corners. */
function insetTo(outer: DOMRect, inner: DOMRect, radius: string) {
  const sides = [
    inner.top - outer.top,
    outer.right - inner.right,
    outer.bottom - inner.bottom,
    inner.left - outer.left,
  ].map((v) => `${Math.max(0, v)}px`)
  return `inset(${sides.join(" ")} round ${radius})`
}

const FULL = (radius: string) => `inset(0px round ${radius})`

/**
 * FLIP for a row of items (the top toolbar's buttons): when `signal` changes,
 * the items that stayed glide from where they were to where they are now;
 * a new item fades in; a keyed item that replaced another (see
 * `GLIDE_KEY_ATTR`) grows out of its box while a copy of the old one fades.
 * Off (no `animate()`, nothing measured) unless `active`.
 *
 * Like `useRowAnimations`, it reads the items in an insertion effect, before
 * React updates them, so it must be called from a component that commits
 * before the container: a sibling rendered ahead of it (React runs a
 * component's insertion effects after its own children's DOM updates, and a
 * sibling's before the next sibling's). Copies are drawn in the container,
 * which must be positioned (`relative`).
 */
export function useLayoutGlide(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean,
  signal: unknown[]
) {
  const lastSignal = React.useRef<unknown[] | null>(null)
  const before = React.useRef<Before | null>(null)
  const running = React.useRef(new Set<Animation>())
  const copies = React.useRef(new Set<HTMLElement>())

  const stop = () => {
    for (const animation of running.current) animation.cancel()
    running.current.clear()
    for (const copy of copies.current) copy.remove()
    copies.current.clear()
  }

  // Before React touches the items: where they sit, and copies of the keyed
  // ones (one of them may be about to go).
  React.useInsertionEffect(() => {
    before.current = null
    const isChange = changed(lastSignal.current, signal)
    lastSignal.current = signal
    if (!isChange) return
    const container = containerRef.current
    // The container mounts with this commit (no baseline yet) or the
    // table does not animate.
    if (!active || !container || typeof container.animate !== "function") {
      stop()
      return
    }
    const rects = new Map<Element, DOMRect>()
    const keyed = new Map<string, Keyed>()
    for (const el of items(container)) {
      const rect = el.getBoundingClientRect()
      rects.set(el, rect)
      const key = el.getAttribute(GLIDE_KEY_ATTR)
      if (key) {
        const radius = getComputedStyle(el).borderTopLeftRadius
        keyed.set(key, { el, rect, radius, copy: copyOf(el) })
      }
    }
    before.current = { rects, keyed }
  })

  // After the update: glide, fade in, and play the keyed swaps.
  React.useLayoutEffect(() => {
    const work = before.current
    before.current = null
    const container = containerRef.current
    if (!work || !container) return
    // Items mid-glide were measured where they showed: restart from there.
    stop()
    const { duration, durationFast, ease } = readMotionTokens(container)
    const live = running.current
    const track = (animation: Animation) => {
      live.add(animation)
      const done = () => live.delete(animation)
      animation.finished.then(done, done)
    }
    // All reads before the first animation.
    const box = container.getBoundingClientRect()
    const now = items(container).map((el) => {
      const key = el.getAttribute(GLIDE_KEY_ATTR)
      return {
        el,
        rect: el.getBoundingClientRect(),
        radius: key ? getComputedStyle(el).borderTopLeftRadius : "0px",
        was: work.rects.get(el),
        swapped: key && !work.rects.has(el) ? work.keyed.get(key) : undefined,
      }
    })
    for (const { el, rect, radius, was, swapped } of now) {
      if (was) {
        const dx = was.left - rect.left
        const dy = was.top - rect.top
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue
        track(
          el.animate(
            { transform: [`translate(${dx}px, ${dy}px)`, "none"] },
            { duration, easing: ease }
          )
        )
      } else if (swapped) {
        // Grows out of the old item's box as it fades in…
        track(
          el.animate(
            {
              clipPath: [insetTo(rect, swapped.rect, radius), FULL(radius)],
              opacity: [0, 1],
            },
            { duration, easing: ease }
          )
        )
        // …while a copy of the old one shrinks into the new box and fades.
        const { copy, rect: from, radius: corner } = swapped
        Object.assign(copy.style, {
          position: "absolute",
          top: `${from.top - box.top}px`,
          left: `${from.left - box.left}px`,
          width: `${from.width}px`,
          height: `${from.height}px`,
          margin: "0",
          pointerEvents: "none",
        })
        container.append(copy)
        copies.current.add(copy)
        const remove = () => {
          copy.remove()
          copies.current.delete(copy)
        }
        const leave = copy.animate(
          {
            clipPath: [FULL(corner), insetTo(from, rect, corner)],
            opacity: [1, 0],
          },
          { duration, easing: ease, fill: "forwards" }
        )
        track(leave)
        leave.finished.then(remove, remove)
      } else {
        track(
          el.animate(
            { opacity: [0, 1] },
            { duration: durationFast, easing: ease }
          )
        )
      }
    }
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
