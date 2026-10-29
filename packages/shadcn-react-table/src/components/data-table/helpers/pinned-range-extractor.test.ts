import { describe, expect, it } from "vitest"

import { pinnedRangeExtractor } from "./pinned-range-extractor"

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
