import { describe, expect, it } from "vitest"

import {
  MODE_FNS,
  SUBSTRING_MODES,
  VALUELESS_MODES,
  isInactive,
} from "./filter-modes"

describe("text modes", () => {
  it.each([
    ["contains", "Hello World", "world", true],
    ["contains", "Hello World", "xyz", false],
    ["equals", "ABC", "abc", true],
    ["equals", "ABC", "ab", false],
    ["notEquals", "ABC", "abc", false],
    ["notEquals", "ABC", "xyz", true],
    ["startsWith", "Hello", "he", true],
    ["startsWith", "Hello", "lo", false],
    ["endsWith", "Hello", "LO", true],
    ["endsWith", "Hello", "he", false],
  ] as const)("%s(%j, %j) -> %j", (mode, cell, val, expected) => {
    expect(MODE_FNS[mode](cell, val)).toBe(expected)
  })

  it("coerces non-string cells to strings", () => {
    expect(MODE_FNS.contains(12345, "234")).toBe(true)
    expect(MODE_FNS.equals(null, "")).toBe(true)
  })

  // KNOWN QUIRK: per-column fuzzy is a plain substring match, not ranked.
  it("fuzzy behaves exactly like contains", () => {
    expect(MODE_FNS.fuzzy("Hello World", "world")).toBe(true)
    expect(MODE_FNS.fuzzy("Hello World", "wrld")).toBe(false)
  })
})

describe("empty / notEmpty", () => {
  it.each([
    [null, true],
    [undefined, true],
    ["", true],
    [[], true],
    [0, false],
    ["a", false],
    [[""], false],
  ])("empty(%j) -> %j", (cell, expected) => {
    expect(MODE_FNS.empty(cell, undefined)).toBe(expected)
    expect(MODE_FNS.notEmpty(cell, undefined)).toBe(!expected)
  })
})

describe("numeric modes", () => {
  it.each([
    ["greaterThan", 5, 3, true],
    ["greaterThan", 3, 3, false],
    ["greaterThanOrEqualTo", 3, 3, true],
    ["lessThan", 2, 3, true],
    ["lessThanOrEqualTo", 3, 3, true],
  ] as const)("%s(%j, %j) -> %j", (mode, cell, val, expected) => {
    expect(MODE_FNS[mode](cell, val)).toBe(expected)
  })

  it("coerces numeric strings", () => {
    expect(MODE_FNS.greaterThan("10", "9")).toBe(true)
  })

  // KNOWN QUIRK: parseFloat-based coercion accepts trailing garbage.
  it("parseFloat coercion: '12abc' behaves as 12", () => {
    expect(MODE_FNS.greaterThan("12abc", 10)).toBe(true)
  })

  it("non-numeric cells never match ordering modes", () => {
    expect(MODE_FNS.greaterThan("abc", 1)).toBe(false)
    expect(MODE_FNS.lessThan("abc", 1)).toBe(false)
  })

  describe("between / betweenInclusive", () => {
    it("between is exclusive of both bounds", () => {
      expect(MODE_FNS.between(5, [1, 10])).toBe(true)
      expect(MODE_FNS.between(1, [1, 10])).toBe(false)
      expect(MODE_FNS.between(10, [1, 10])).toBe(false)
    })

    it("betweenInclusive includes the bounds", () => {
      expect(MODE_FNS.betweenInclusive(1, [1, 10])).toBe(true)
      expect(MODE_FNS.betweenInclusive(10, [1, 10])).toBe(true)
      expect(MODE_FNS.betweenInclusive(11, [1, 10])).toBe(false)
    })

    it("a blank bound is an open end", () => {
      expect(MODE_FNS.between(100, ["", 200])).toBe(true)
      expect(MODE_FNS.between(100, [50, ""])).toBe(true)
    })

    it("both bounds blank matches nothing", () => {
      expect(MODE_FNS.between(100, ["", ""])).toBe(false)
    })

    it("NaN cell matches nothing", () => {
      expect(MODE_FNS.between("abc", [1, 10])).toBe(false)
    })
  })
})

describe("date modes", () => {
  // Local-time Date constructors avoid string-parsing timezone variance.
  const jan5Morning = new Date(2024, 0, 5, 10, 0)
  const jan5Midnight = new Date(2024, 0, 5, 0, 0)
  const jan4 = new Date(2024, 0, 4, 12, 0)
  const jan6 = new Date(2024, 0, 6, 12, 0)

  it("before: cell strictly earlier than start-of-day of the filter", () => {
    expect(MODE_FNS.before(jan4, jan5Morning)).toBe(true)
    expect(MODE_FNS.before(jan5Midnight, jan5Morning)).toBe(false)
  })

  // KNOWN QUIRK: only the filter side is floored to start-of-day, so a cell
  // WITH a time-of-day on the same date still counts as "after" that date.
  it("after: same-day cell with a later clock time matches", () => {
    expect(MODE_FNS.after(jan5Morning, jan5Midnight)).toBe(true)
    expect(MODE_FNS.after(jan6, jan5Morning)).toBe(true)
    expect(MODE_FNS.after(jan4, jan5Morning)).toBe(false)
  })

  it("unparseable dates never match", () => {
    expect(MODE_FNS.after("not-a-date", jan5Morning)).toBe(false)
    expect(MODE_FNS.before(jan4, "not-a-date")).toBe(false)
  })

  describe("betweenDates", () => {
    it("inclusive of same-day boundaries via start-of-day flooring", () => {
      expect(MODE_FNS.betweenDates(jan5Morning, [jan5Midnight, jan6])).toBe(
        true
      )
      expect(MODE_FNS.betweenDates(jan4, [jan5Midnight, jan6])).toBe(false)
    })

    it("open-ended ranges work with one bound", () => {
      expect(MODE_FNS.betweenDates(jan6, [jan5Midnight, null])).toBe(true)
      expect(MODE_FNS.betweenDates(jan4, [null, jan5Midnight])).toBe(true)
    })

    it("no bounds matches nothing", () => {
      expect(MODE_FNS.betweenDates(jan5Morning, [null, null])).toBe(false)
      expect(MODE_FNS.betweenDates(jan5Morning, "not-an-array")).toBe(false)
    })
  })
})

describe("fixed modes", () => {
  it("equalsString is case-sensitive exact match", () => {
    expect(MODE_FNS.equalsString("ABC", "ABC")).toBe(true)
    expect(MODE_FNS.equalsString("ABC", "abc")).toBe(false)
  })

  it("arrIncludesSome matches membership; empty selection matches all", () => {
    expect(MODE_FNS.arrIncludesSome("a", ["a", "b"])).toBe(true)
    expect(MODE_FNS.arrIncludesSome("c", ["a", "b"])).toBe(false)
    expect(MODE_FNS.arrIncludesSome("anything", [])).toBe(true)
  })

  it("equalsBool compares truthiness", () => {
    expect(MODE_FNS.equalsBool(true, true)).toBe(true)
    expect(MODE_FNS.equalsBool(0, false)).toBe(true)
    expect(MODE_FNS.equalsBool("x", true)).toBe(true)
  })
})

describe("mode sets and isInactive", () => {
  it("valueless modes are exactly empty/notEmpty", () => {
    expect([...VALUELESS_MODES].sort()).toEqual(["empty", "notEmpty"])
  })

  it("substring modes drive highlighting", () => {
    expect(SUBSTRING_MODES.has("contains")).toBe(true)
    expect(SUBSTRING_MODES.has("between")).toBe(false)
  })

  it.each([
    [null, true],
    ["", true],
    [["", null], true],
    ["0", false],
    [0, false],
    [["", "5"], false],
  ])("isInactive(%j) -> %j", (value, expected) => {
    expect(isInactive(value)).toBe(expected)
  })
})
