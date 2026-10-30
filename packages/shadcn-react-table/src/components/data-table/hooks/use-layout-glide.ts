import * as React from "react"

import { readMotionTokens } from "../core/motion"

function changed(a: unknown[] | null, b: unknown[]) {
  return !a || a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]))
}

/**
 * FLIP for a row of items (the top toolbar's buttons): when `signal` changes,
 * the items that stayed glide from where they were to where they are now, and
 * a new item fades in. Off (no `animate()`, nothing measured) unless `active`.
 *
 * Like `useRowAnimations`, it reads the items in an insertion effect, before
 * React updates them, so it must be called from a component that commits
 * before the container: a sibling rendered ahead of it (React runs a
 * component's insertion effects after its own children's DOM updates, and a
 * sibling's before the next sibling's).
 */
export function useLayoutGlide(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean,
  signal: unknown[]
) {
  const lastSignal = React.useRef<unknown[] | null>(null)
  const before = React.useRef<Map<Element, DOMRect> | null>(null)
  const running = React.useRef(new Set<Animation>())

  /** Drops all motion at once. */
  const stop = () => {
    for (const animation of running.current) animation.cancel()
    running.current.clear()
  }

  // Before React touches the items: where they sit.
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
    for (const el of container.children) {
      rects.set(el, el.getBoundingClientRect())
    }
    before.current = rects
  })

  // After the update: glide and fade in.
  React.useLayoutEffect(() => {
    const rects = before.current
    before.current = null
    const container = containerRef.current
    if (!rects || !container) return
    const { duration, durationFast, ease } = readMotionTokens(container)
    // Items mid-glide were measured where they showed: restart from there.
    stop()
    const live = running.current
    const track = (animation: Animation) => {
      live.add(animation)
      const done = () => live.delete(animation)
      animation.finished.then(done, done)
    }
    // All reads before the first animation.
    const now = [...container.children].map((el) => ({
      el,
      rect: el.getBoundingClientRect(),
      was: rects.get(el),
    }))
    for (const { el, rect, was } of now) {
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
    return () => {
      for (const animation of live) animation.cancel()
      live.clear()
    }
  }, [])
}
