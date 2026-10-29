import { describe, expect, it } from "vitest"

import { anatomyFrame } from "./anatomy"

describe("anatomyFrame", () => {
  it("starts as a slightly separated stack with the hero copy", () => {
    expect(anatomyFrame(0)).toEqual({
      spread: 0.25,
      flat: 0,
      active: null,
      intro: 1,
    })
  })

  it("walks the five layers in order", () => {
    const slice = 0.75 / 5
    for (let i = 0; i < 5; i++) {
      const f = anatomyFrame(0.08 + slice * i + slice / 2)
      expect(f.active).toBe(i)
      expect(f.spread).toBe(1)
      expect(f.intro).toBe(0)
    }
  })

  it("closes and lies flat at the end", () => {
    expect(anatomyFrame(1)).toEqual({
      spread: 0,
      flat: 1,
      active: null,
      intro: 0,
    })
    const mid = anatomyFrame(0.915)
    expect(mid.spread).toBeCloseTo(0.5, 1)
    expect(mid.flat).toBeCloseTo(0.5, 1)
  })

  it("clamps out-of-range progress", () => {
    expect(anatomyFrame(-1)).toEqual(anatomyFrame(0))
    expect(anatomyFrame(2)).toEqual(anatomyFrame(1))
  })
})
