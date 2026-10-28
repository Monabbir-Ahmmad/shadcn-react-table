import { describe, expect, it } from "vitest"

import { formatDate } from "./shared"

const date = new Date(2026, 3, 29)
const medium = (language: string) =>
  new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(date)

describe("formatDate", () => {
  it("formats in the given language", () => {
    expect(formatDate(date, "de")).toBe(medium("de"))
    expect(formatDate(date, "de")).not.toBe(formatDate(date, "en"))
  })

  it("uses the Gregorian calendar even for languages that default to another", () => {
    const text = formatDate(date, "fa")
    expect(text).toContain((2026).toLocaleString("fa", { useGrouping: false }))
    expect(text).not.toContain("۱۴۰۵")
  })

  it("falls back to English for a malformed language tag", () => {
    expect(() => formatDate(date, "en_US")).not.toThrow()
    expect(formatDate(date, "en_US")).toBe(formatDate(date, "en"))
    expect(formatDate(date, "")).toBe(formatDate(date, "en"))
    expect(formatDate(date, "en-")).toBe(formatDate(date, "en"))
  })
})
