import { afterEach, describe, expect, it, vi } from "vitest"

import {
  getReducedMotion,
  MOTION_DEFAULTS,
  MOTION_ROOT_CLASS,
  readMotionTokens,
} from "./motion"

afterEach(() => vi.unstubAllGlobals())

describe("motion tokens", () => {
  it("falls back to the defaults in the root's control timing", () => {
    // Literal for Tailwind, so the numbers are checked here instead.
    expect(MOTION_ROOT_CLASS).toContain(
      `var(--dt-motion-duration,${MOTION_DEFAULTS.duration}ms)`
    )
    expect(MOTION_ROOT_CLASS).toContain(
      `var(--dt-motion-ease,${MOTION_DEFAULTS.ease.replace(/ /g, "")})`
    )
    // Without animations, the root sets 0ms (nested tables included).
    expect(MOTION_ROOT_CLASS).toMatch(/(^| )\[--dt-ctl-duration:0ms\]/)
  })

  it("reads overrides from an element and falls back to the defaults", () => {
    const el = document.createElement("div")
    el.style.setProperty("--dt-motion-duration", "0.5s")
    el.style.setProperty("--dt-motion-ease", "linear")
    document.body.append(el)
    expect(readMotionTokens(el)).toEqual({
      duration: 500,
      durationFast: MOTION_DEFAULTS.durationFast,
      ease: "linear",
    })
    expect(readMotionTokens(null)).toEqual(MOTION_DEFAULTS)
    el.remove()
  })

  it("reports reduced motion from matchMedia", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({
      matches: q.includes("reduce"),
      addEventListener() {},
      removeEventListener() {},
    }))
    expect(getReducedMotion()).toBe(true)
  })
})
