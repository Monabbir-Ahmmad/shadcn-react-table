import { describe, expect, it } from "vitest"

import {
  distributeGrowth,
  getColumnGrowWeight,
  growWeight,
} from "./column-grow"

describe("growWeight", () => {
  it("grows by default and with true", () => {
    expect(growWeight(undefined)).toBe(1)
    expect(growWeight(true)).toBe(1)
  })

  it("does not grow with false, 0, negative or non-finite numbers", () => {
    expect(growWeight(false)).toBe(0)
    expect(growWeight(0)).toBe(0)
    expect(growWeight(-2)).toBe(0)
    expect(growWeight(Number.NaN)).toBe(0)
    expect(growWeight(Number.POSITIVE_INFINITY)).toBe(0)
  })

  it("uses a number as the weight", () => {
    expect(growWeight(2.5)).toBe(2.5)
  })
})

describe("getColumnGrowWeight", () => {
  it("never grows the table's own columns", () => {
    for (const id of [
      "cn-select",
      "cn-expand",
      "cn-row-actions",
      "cn-row-number",
      "cn-row-pin",
      "cn-row-drag",
    ])
      expect(getColumnGrowWeight(id, true, {})).toBe(0)
  })

  it("stops growing a column the user has resized", () => {
    expect(getColumnGrowWeight("name", undefined, { name: 200 })).toBe(0)
    expect(getColumnGrowWeight("name", 2, { other: 200 })).toBe(2)
  })
})

describe("distributeGrowth", () => {
  const items = [
    { id: "a", size: 100, weight: 1 },
    { id: "b", size: 100, weight: 2 },
    { id: "c", size: 100, weight: 0 },
  ]

  it("splits the spare width by weight", () => {
    const shares = distributeGrowth(items, 600)
    expect(shares.get("a")).toBe(100)
    expect(shares.get("b")).toBe(200)
    expect(shares.has("c")).toBe(false)
  })

  it("hands out whole pixels that add up to the spare width", () => {
    const shares = distributeGrowth(
      [
        { id: "a", size: 10, weight: 1 },
        { id: "b", size: 10, weight: 1 },
        { id: "c", size: 10, weight: 1 },
      ],
      130.6
    )
    const values = [...shares.values()]
    expect(values.every(Number.isInteger)).toBe(true)
    expect(values.reduce((sum, v) => sum + v, 0)).toBe(100)
    expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(1)
  })

  it("gives nothing when the columns fill or overflow the width", () => {
    expect(distributeGrowth(items, 300).size).toBe(0)
    expect(distributeGrowth(items, 250).size).toBe(0)
  })

  it("gives nothing when no column grows", () => {
    expect(
      distributeGrowth([{ id: "a", size: 100, weight: 0 }], 500).size
    ).toBe(0)
  })
})
