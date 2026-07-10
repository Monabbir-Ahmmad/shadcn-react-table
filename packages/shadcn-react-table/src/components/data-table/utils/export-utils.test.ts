import { describe, expect, it } from "vitest"

import { escapeCsvCell } from "./export-utils"

describe("escapeCsvCell", () => {
  it.each([
    ["=SUM(A1:A2)", "'=SUM(A1:A2)"],
    ["+1234", "'+1234"],
    ["-cmd", "'-cmd"],
    ["@import", "'@import"],
    ["\tleading-tab", "'\tleading-tab"],
    ["\rleading-cr", "'\rleading-cr"],
  ])("neutralizes formula trigger %j", (input, expected) => {
    expect(escapeCsvCell(input)).toBe(expected)
  })

  it.each(["plain text", "a=b", "safe -dash- inside", ""])(
    "leaves safe string %j untouched",
    (input) => {
      expect(escapeCsvCell(input)).toBe(input)
    }
  )

  it("never touches non-string values", () => {
    expect(escapeCsvCell(-5)).toBe(-5)
    expect(escapeCsvCell(0)).toBe(0)
    expect(escapeCsvCell(true)).toBe(true)
    expect(escapeCsvCell(null)).toBe(null)
  })
})
