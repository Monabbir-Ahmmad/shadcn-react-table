import { describe, expect, it } from "vitest"

import { defaultModeForVariant, modeOptionsForVariant } from "./variant-modes"

describe("defaultModeForVariant", () => {
  it.each([
    ["range", "betweenInclusive"],
    ["range-slider", "betweenInclusive"],
    ["date", "equals"],
    ["date-range", "betweenDates"],
    ["select", "equalsString"],
    ["multi-select", "arrIncludesSome"],
    ["checkbox", "equalsBool"],
    ["text", "contains"],
  ] as const)("%s -> %s", (variant, mode) => {
    expect(defaultModeForVariant(variant)).toBe(mode)
  })
})

describe("modeOptionsForVariant", () => {
  it("lists the default range mode first", () => {
    expect(modeOptionsForVariant("range")[0]).toBe("betweenInclusive")
    expect(modeOptionsForVariant("range-slider")[0]).toBe("betweenInclusive")
  })
  it("offers no mode menu for fixed-mode variants", () => {
    expect(modeOptionsForVariant("select")).toEqual([])
  })
})
