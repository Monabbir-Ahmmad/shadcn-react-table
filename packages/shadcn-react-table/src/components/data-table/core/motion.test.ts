import { afterEach, describe, expect, it, vi } from "vitest"

import {
  getReducedMotion,
  MOTION_CSS_VARS,
  MOTION_DEFAULTS,
  readMotionTokens,
} from "./motion"

afterEach(() => vi.unstubAllGlobals())

describe("motion tokens", () => {
  it("exposes the defaults as CSS variables", () => {
    expect(MOTION_CSS_VARS).toEqual({
      "--dt-motion-duration": "280ms",
      "--dt-motion-duration-fast": "160ms",
      "--dt-motion-ease": "cubic-bezier(0.22, 1, 0.36, 1)",
    })
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
