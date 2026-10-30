import { describe, expect, it } from "vitest"

import { pinnedRangeExtractor, withKeptIndexes } from "./pinned-range-extractor"

const range = { startIndex: 10, endIndex: 14, overscan: 2, count: 40 }

describe("pinnedRangeExtractor", () => {
  it("returns the overscanned window when nothing is pinned", () => {
    expect(pinnedRangeExtractor(range, [])).toEqual([
      8, 9, 10, 11, 12, 13, 14, 15, 16,
    ])
  })

  it("adds pinned columns outside the window in order", () => {
    expect(pinnedRangeExtractor(range, [0, 39])).toEqual([
      0, 8, 9, 10, 11, 12, 13, 14, 15, 16, 39,
    ])
  })

  it("does not duplicate pinned columns inside the window", () => {
    expect(pinnedRangeExtractor(range, [12])).toEqual([
      8, 9, 10, 11, 12, 13, 14, 15, 16,
    ])
  })

  it("ignores indexes past the column count", () => {
    expect(pinnedRangeExtractor(range, [40])).not.toContain(40)
  })
})

describe("withKeptIndexes", () => {
  it("adds a kept index outside the window in order", () => {
    expect(withKeptIndexes([5, 6, 7], [0], 10)).toEqual([0, 5, 6, 7])
    expect(withKeptIndexes([5, 6, 7], [9], 10)).toEqual([5, 6, 7, 9])
  })

  it("returns the window as is when nothing needs adding", () => {
    const window = [5, 6, 7]
    expect(withKeptIndexes(window, [6], 10)).toBe(window)
    expect(withKeptIndexes(window, [-1, 10], 10)).toBe(window)
  })
})
