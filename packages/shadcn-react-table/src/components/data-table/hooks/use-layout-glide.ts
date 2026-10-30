import * as React from "react"

import { GLIDE_COPY_SLOT, readMotionTokens } from "../core/motion"

/**
 * Marks two elements as one item in a gliding container (the search button
 * and the search box it opens into): when one replaces the other, the new one
 * grows out of the old one's box while a copy of the old one shrinks into the
 * new one's box and fades.
 */
export const GLIDE_KEY_ATTR = "data-glide-key"

/** An item that carries a glide key, as it was before the change. */
type Keyed = {
  el: Element
  rect: DOMRect
  radius: string
  /** Its clip and opacity as shown (mid-swap, they are animated). */
  clip: string | null
  opacity: string
  copy: HTMLElement
}

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

/** An element's shown clip-path, or null for none. Reads. */
function shownClip(style: CSSStyleDeclaration) {
  const clip = style.clipPath
  return clip && clip !== "none" ? clip : null
}

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
  /** Each copy on screen, with the animation it plays out. */
  const copies = React.useRef(new Map<HTMLElement, Animation>())

  /** Drops all motion at once, copies included. */
  const stop = () => {
    for (const animation of running.current) animation.cancel()
    running.current.clear()
    for (const [copy, animation] of copies.current) {
      animation.cancel()
      copy.remove()
    }
    copies.current.clear()
  }

  /** Plays a copy out, then removes it (unless a newer play took over). */
  const playOut = (
    copy: HTMLElement,
    keyframes: PropertyIndexedKeyframes,
    options: KeyframeAnimationOptions
  ) => {
    const held = copies.current
    const animation = copy.animate(keyframes, { ...options, fill: "forwards" })
    held.set(copy, animation)
    animation.finished.then(
      () => {
        if (held.get(copy) !== animation) return
        copy.remove()
        held.delete(copy)
      },
      // Cancelled: `stop` removed it, or a new change fades it from here.
      () => {}
    )
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
        const style = getComputedStyle(el)
        keyed.set(key, {
          el,
          rect,
          radius: style.borderTopLeftRadius,
          clip: shownClip(style),
          opacity: style.opacity || "1",
          copy: copyOf(el),
        })
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
    const { duration, durationFast, ease } = readMotionTokens(container)
    // The previous change's copies fade out from where they are, rather than
    // vanish: read how they show before dropping their animations.
    const fading = [...copies.current.keys()].map((copy) => {
      const style = getComputedStyle(copy)
      return { copy, clip: shownClip(style), opacity: style.opacity || "1" }
    })
    // Items mid-glide were measured where they showed: restart from there.
    for (const animation of running.current) animation.cancel()
    running.current.clear()
    for (const animation of copies.current.values()) animation.cancel()
    for (const { copy, clip, opacity } of fading) {
      playOut(
        copy,
        clip
          ? { opacity: [opacity, "0"], clipPath: [clip, clip] }
          : { opacity: [opacity, "0"] },
        { duration: durationFast, easing: ease }
      )
    }
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
        const { copy, rect: from, radius: corner, clip, opacity } = swapped
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
        // From how the old one showed: mid-swap, part clipped and faded.
        playOut(
          copy,
          {
            clipPath: [clip ?? FULL(corner), insetTo(from, rect, corner)],
            opacity: [opacity, "0"],
          },
          { duration, easing: ease }
        )
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
      for (const [copy, animation] of held) {
        animation.cancel()
        copy.remove()
      }
      held.clear()
    }
  }, [])
}
