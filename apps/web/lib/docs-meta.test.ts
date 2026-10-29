import { describe, expect, it } from "vitest"

import { docsFlatNav, docsNav } from "./docs-nav"
import { groupFor, summaryFor } from "./docs-meta"

describe("docs nav metadata", () => {
  it("gives every group an icon", () => {
    for (const group of docsNav) expect(group.icon).toBeTypeOf("function")
  })

  it("has a summary for every page", () => {
    for (const item of docsFlatNav) {
      expect(summaryFor(item.href), item.href).not.toBe("")
    }
  })

  it("finds a page's group", () => {
    expect(groupFor("/docs/guides/sorting")?.title).toBe(
      "Sorting, grouping & expanding"
    )
    expect(groupFor("/docs/guides/sorting/")?.title).toBe(
      "Sorting, grouping & expanding"
    )
    expect(groupFor("/nowhere")).toBeUndefined()
  })

  it("marks the 1.0 pages as new", () => {
    const badged = docsFlatNav
      .filter((i) => i.badge === "New")
      .map((i) => i.href)
    expect(badged).toContain("/docs/guides/slot-props")
    expect(badged).toContain("/docs/ai")
  })
})
