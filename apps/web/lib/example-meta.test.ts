import { describe, expect, it } from "vitest"

import { EXAMPLE_META } from "./example-meta.generated"

describe("EXAMPLE_META", () => {
  it("lists every example", () => {
    expect(EXAMPLE_META.length).toBeGreaterThan(70)
  })

  it("has unique slugs", () => {
    const slugs = EXAMPLE_META.map((e) => e.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("gives every example a title and category", () => {
    for (const e of EXAMPLE_META) {
      expect(e.title).not.toBe("")
      expect(e.category).not.toBe("")
    }
  })
})
