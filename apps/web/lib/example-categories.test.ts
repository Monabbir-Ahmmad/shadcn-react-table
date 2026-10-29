import { describe, expect, it } from "vitest"

import { exampleCategories } from "./example-categories"

describe("exampleCategories", () => {
  it("groups by category in first-seen order with counts and three titles", () => {
    const result = exampleCategories([
      { slug: "a", title: "A", category: "Basics" },
      { slug: "b", title: "B", category: "Data" },
      { slug: "c", title: "C", category: "Basics" },
      { slug: "d", title: "D", category: "Basics" },
      { slug: "e", title: "E", category: "Basics" },
    ])
    expect(result).toEqual([
      { category: "Basics", count: 4, titles: ["A", "C", "D"] },
      { category: "Data", count: 1, titles: ["B"] },
    ])
  })
})
