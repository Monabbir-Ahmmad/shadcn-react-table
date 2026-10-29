import { describe, expect, it } from "vitest"

import {
  coverflow,
  deckSlot,
  frameTheme,
  STYLE_DEFAULT,
  STYLE_DEFAULTS,
} from "./deck"
import { FONTS } from "./theme-presets"

describe("deckSlot", () => {
  it("puts the rotated-to card in front", () => {
    expect(deckSlot(2, 2, 6)).toEqual({ angle: 0, front: true, depth: 1 })
  })

  it("spaces cards evenly and normalizes angles", () => {
    expect(deckSlot(3, 2, 6).angle).toBe(60)
    expect(deckSlot(1, 2, 6).angle).toBe(-60)
    expect(deckSlot(5, 2, 6).angle).toBe(180)
    expect(deckSlot(0, 5, 6).angle).toBe(60)
  })

  it("handles fractional rotation while dragging", () => {
    const slot = deckSlot(2, 2.4, 6)
    expect(slot.angle).toBeCloseTo(-24, 5)
    expect(slot.front).toBe(true)
    expect(deckSlot(3, 2.4, 6).front).toBe(false)
    expect(deckSlot(5, 2, 6).depth).toBe(-1)
  })
})

describe("frameTheme", () => {
  const choice = {
    accent: "lime",
    base: "neutral",
    font: STYLE_DEFAULT,
    radius: STYLE_DEFAULT,
    icons: "lucide" as const,
  }

  it("gives each style its own font and radius by default", () => {
    expect(frameTheme(choice, "lyra", false)).toEqual({
      ...choice,
      font: "mono",
      radius: "0rem",
      dark: false,
    })
    expect(frameTheme(choice, "maia", true)).toMatchObject({
      font: "raleway",
      radius: "1rem",
      dark: true,
    })
  })

  it("applies a picked font and radius to every style", () => {
    const picked = { ...choice, font: "geist", radius: "0.625rem" }
    for (const style of Object.keys(STYLE_DEFAULTS))
      expect(frameTheme(picked, style, false)).toMatchObject({
        font: "geist",
        radius: "0.625rem",
      })
  })

  it("only names fonts the presets know", () => {
    for (const { font } of Object.values(STYLE_DEFAULTS))
      expect(FONTS.some((f) => f.name === font)).toBe(true)
  })
})

describe("coverflow", () => {
  it("keeps the front card flat, centred and solid", () => {
    expect(coverflow(0)).toEqual({ x: 0, z: -0, turn: 0, opacity: 1 })
  })

  it("turns, pushes back and dims the two neighbours", () => {
    const right = coverflow(1)
    expect(right.x).toBeGreaterThan(0.5)
    expect(right.z).toBeLessThan(0)
    expect(right.turn).toBe(35)
    expect(right.opacity).toBeCloseTo(0.6, 5)
    expect(coverflow(-1)).toEqual({ ...right, x: -right.x, turn: -35 })
  })

  it("hides every card beyond the neighbours", () => {
    expect(coverflow(2).opacity).toBe(0)
    expect(coverflow(-3).opacity).toBe(0)
    expect(coverflow(1.5).opacity).toBeCloseTo(0.3, 5)
  })
})
