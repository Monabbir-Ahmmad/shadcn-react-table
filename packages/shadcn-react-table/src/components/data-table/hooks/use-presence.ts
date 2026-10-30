import * as React from "react"

import { readMotionTokens } from "../core/motion"

/** How far a strip slides as it comes and goes, in px. */
const SLIDE = 6

/** Whether the Web Animations API is there (jsdom has none). */
const canAnimate = () =>
  typeof HTMLElement !== "undefined" &&
  typeof HTMLElement.prototype.animate === "function"

/** The element's in-flow siblings after it: what it pushes down. */
function followers(el: HTMLElement) {
  const out: HTMLElement[] = []
  for (let n = el.nextElementSibling; n; n = n.nextElementSibling) {
    if (n instanceof HTMLElement) out.push(n)
  }
  return out
}

/** How far the siblings after `el` sit below where `el` starts. Reads. */
function pushOf(el: HTMLElement, next: HTMLElement | undefined) {
  if (!next) return 0
  return next.getBoundingClientRect().top - el.getBoundingClientRect().top
}

/**
 * Where an element sits in the box its absolute position is relative to
 * (its offset parent's padding box), to the subpixel. Reads.
 */
function placeIn(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const parent = el.offsetParent as HTMLElement | null
  if (!parent)
    return { top: el.offsetTop, left: el.offsetLeft, width: rect.width }
  const base = parent.getBoundingClientRect()
  return {
    top: rect.top - base.top - parent.clientTop + parent.scrollTop,
    left: rect.left - base.left - parent.clientLeft + parent.scrollLeft,
    width: rect.width,
  }
}

/**
 * Keeps a strip (the selection banner, the group drop zone) mounted while it
 * leaves. It slides in and fades in when `show` turns on; when `show` turns
 * off it is taken out of the flow (absolutely placed where it was) and fades
 * out, then unmounts. Either way the siblings after it in the column (the
 * table below) glide from where they were. Not on the first render, and
 * never unless `active`: then `present` just follows `show`.
 *
 * Attach `ref` to the strip's root element; render it while `present`.
 */
export function usePresence<T extends HTMLElement = HTMLElement>(
  show: boolean,
  active: boolean
) {
  const animates = active && canAnimate()
  const [present, setPresent] = React.useState(show)
  // Derived during render (React's "adjust state on a prop change"): it
  // shows at once, and without motion it goes at once.
  if (show && !present) setPresent(true)
  if (!show && present && !animates) setPresent(false)

  const ref = React.useRef<T | null>(null)
  const lastShow = React.useRef<boolean | null>(null)
  const running = React.useRef(new Set<Animation>())
  /** The strip's inline style before it was taken out of the flow. */
  const restore = React.useRef<{ el: HTMLElement; css: string } | null>(null)

  const stop = () => {
    for (const animation of running.current) animation.cancel()
    running.current.clear()
    if (restore.current) {
      const { el, css } = restore.current
      el.style.cssText = css
      el.removeAttribute("inert")
      restore.current = null
    }
  }

  React.useLayoutEffect(() => {
    const was = lastShow.current
    lastShow.current = show
    if (!animates) {
      stop()
      return
    }
    // The first render, or nothing changed.
    if (was === null || was === show) return
    stop()
    const el = ref.current
    if (!el) return
    const { duration, durationFast, ease } = readMotionTokens(el)
    const live = running.current
    const track = (animation: Animation) => {
      live.add(animation)
      const done = () => live.delete(animation)
      animation.finished.then(done, done)
      return animation
    }
    // Reads first: the siblings below, and how far the strip pushes them.
    const below = followers(el)
    const push = pushOf(el, below[0])
    const glide = (from: number) => {
      if (Math.abs(from) < 0.5) return
      for (const node of below) {
        track(
          node.animate(
            { transform: [`translateY(${from}px)`, "none"] },
            { duration, easing: ease }
          )
        )
      }
    }
    if (show) {
      track(
        el.animate(
          {
            opacity: [0, 1],
            transform: [`translateY(-${SLIDE}px)`, "none"],
          },
          { duration: durationFast, easing: ease }
        )
      )
      // They sat where the strip now starts.
      glide(-push)
      return
    }
    // Out of the flow, where it sat: the siblings move up at once and glide
    // there over it while it fades.
    const at = placeIn(el)
    restore.current = { el, css: el.style.cssText }
    Object.assign(el.style, {
      position: "absolute",
      top: `${at.top}px`,
      left: `${at.left}px`,
      width: `${at.width}px`,
      margin: "0",
      pointerEvents: "none",
    })
    el.setAttribute("inert", "")
    glide(push)
    track(
      el.animate(
        {
          opacity: [1, 0],
          transform: ["none", `translateY(-${SLIDE}px)`],
        },
        { duration: durationFast, easing: ease, fill: "forwards" }
      )
    ).finished.then(
      () => {
        // Unless it was asked back meanwhile.
        if (lastShow.current !== false) return
        restore.current = null
        setPresent(false)
      },
      // Cancelled: it came back, or the table stopped animating.
      () => {}
    )
  }, [show, animates])

  React.useEffect(() => {
    const live = running.current
    return () => {
      for (const animation of live) animation.cancel()
      live.clear()
    }
  }, [])

  return { present, ref }
}
