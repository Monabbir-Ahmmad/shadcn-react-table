import { describe, expect, it } from "vitest"

import { deckSlot } from "./deck"

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
