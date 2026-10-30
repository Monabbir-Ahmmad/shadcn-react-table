import * as React from "react"

/** Default timing for the table's motion (ms and a CSS easing). */
export const MOTION_DEFAULTS = {
  duration: 280,
  durationFast: 160,
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const

function toMs(value: string, fallback: number): number {
  const v = value.trim()
  if (!v) return fallback
  const n = parseFloat(v)
  if (Number.isNaN(n)) return fallback
  return v.endsWith("ms") ? n : v.endsWith("s") ? n * 1000 : n
}

/** A custom property's value: inline first (cheap), then computed. */
function readVar(el: Element, name: string): string {
  const inline = (el as HTMLElement).style?.getPropertyValue(name)
  if (inline && inline.trim()) return inline
  return getComputedStyle(el).getPropertyValue(name)
}

/** The motion timing in effect on an element (theme overrides included). */
export function readMotionTokens(el: Element | null) {
  if (!el || typeof getComputedStyle === "undefined") {
    return { ...MOTION_DEFAULTS }
  }
  return {
    duration: toMs(
      readVar(el, "--dt-motion-duration"),
      MOTION_DEFAULTS.duration
    ),
    durationFast: toMs(
      readVar(el, "--dt-motion-duration-fast"),
      MOTION_DEFAULTS.durationFast
    ),
    ease: readVar(el, "--dt-motion-ease").trim() || MOTION_DEFAULTS.ease,
  }
}

/** `data-slot` of the short-lived copies of leaving rows (motion layer). */
export const LEAVE_COPY_SLOT = "data-table-leave-copy"

/** Selector suffix that keeps a query out of the leave copies. */
export const NOT_IN_LEAVE_COPY = `:not([data-slot="${LEAVE_COPY_SLOT}"] *)`

const QUERY = "(prefers-reduced-motion: reduce)"

/** Whether the user asked for reduced motion (false where unknown). */
export function getReducedMotion(): boolean {
  return typeof matchMedia === "function" ? matchMedia(QUERY).matches : false
}

/** Subscribe to reduced-motion changes (for useSyncExternalStore). */
export function subscribeReducedMotion(cb: () => void): () => void {
  if (typeof matchMedia !== "function") return () => {}
  const mql = matchMedia(QUERY)
  mql.addEventListener("change", cb)
  return () => mql.removeEventListener("change", cb)
}

/** Whether this table should animate right now. */
export function useAnimationsActive(enabled: boolean): boolean {
  const reduced = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false
  )
  return enabled && !reduced
}

/**
 * Set on every table root: the timing its own controls use. With
 * `[data-animations]` it is the motion tokens (`--dt-motion-*`, with the
 * `MOTION_DEFAULTS` as fallbacks), otherwise 0ms. Each root sets it, so the
 * nearest root wins: a non-animated table nested in an animated one (in a
 * detail panel, say) keeps its controls still. Literal strings, so Tailwind
 * sees the classes; a test keeps the numbers in step with `MOTION_DEFAULTS`.
 */
export const MOTION_ROOT_CLASS =
  "[--dt-ctl-duration:0ms] data-[animations]:[--dt-ctl-duration:var(--dt-motion-duration,280ms)] data-[animations]:[--dt-ctl-ease:var(--dt-motion-ease,cubic-bezier(0.22,1,0.36,1))]"

/**
 * Tailwind classes that time a control's CSS transition with its table's
 * control timing (see `MOTION_ROOT_CLASS`): 0ms, so an instant change, when
 * that table does not animate (off, or reduced motion).
 */
export const MOTION_TIMING_CLASS =
  "duration-[var(--dt-ctl-duration,0ms)] ease-[var(--dt-ctl-ease,ease)]"
