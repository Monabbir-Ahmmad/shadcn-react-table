import { describe, expect, it } from "vitest"

import { MODE_FNS } from "./filter-modes"

describe("MODE_FNS smoke", () => {
  it("contains is case-insensitive", () => {
    expect(MODE_FNS.contains("Hello World", "world")).toBe(true)
  })
})
