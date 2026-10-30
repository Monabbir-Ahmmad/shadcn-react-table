import { describe, expect, it } from "vitest"

import { getVirtualHeaderRuns } from "./virtual-header-runs"

const a = { id: "a", colSpan: 3 }
const b = { id: "b", colSpan: 3 }
const c = { id: "c", colSpan: 2 }

describe("getVirtualHeaderRuns", () => {
  it("gives each leaf header its own run", () => {
    const leaves = Array.from({ length: 4 }, (_, i) => ({ id: i, colSpan: 1 }))
    expect(getVirtualHeaderRuns(leaves, [1, 2])).toEqual([
      { header: leaves[1], start: 0, span: 1 },
      { header: leaves[2], start: 1, span: 1 },
    ])
  })

  it("merges adjacent columns under one group header", () => {
    expect(getVirtualHeaderRuns([a, b, c], [2, 3, 4, 5, 6])).toEqual([
      { header: a, start: 0, span: 1 },
      { header: b, start: 1, span: 3 },
      { header: c, start: 4, span: 1 },
    ])
  })

  it("splits a group at a gap in the rendered columns", () => {
    // Column 0 (pinned) and the window 4..5 are rendered; 1..3 are skipped.
    expect(getVirtualHeaderRuns([a, b, c], [0, 4, 5])).toEqual([
      { header: a, start: 0, span: 1 },
      { header: b, start: 1, span: 2 },
    ])
    expect(getVirtualHeaderRuns([a, b, c], [1, 2, 6, 7])).toEqual([
      { header: a, start: 0, span: 2 },
      { header: c, start: 2, span: 2 },
    ])
    expect(getVirtualHeaderRuns([a, b], [0, 2, 3])).toEqual([
      { header: a, start: 0, span: 1 },
      { header: a, start: 1, span: 1 },
      { header: b, start: 2, span: 1 },
    ])
  })
})
