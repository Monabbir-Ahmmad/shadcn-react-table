import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

import { MODE_FNS } from "../fns/filter-modes"
import { parseDate } from "./parse-date"

// Date-only ISO strings parse as UTC midnight, which is the previous day west
// of UTC. Node re-reads TZ, so pin a western zone for these tests.
beforeAll(() => {
  vi.stubEnv("TZ", "America/New_York")
})
afterAll(() => {
  vi.unstubAllEnvs()
})

describe("parseDate", () => {
  it("reads a date-only string as local midnight", () => {
    const d = parseDate("2025-01-10")!
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([
      2025, 0, 10, 0,
    ])
  })

  it("keeps datetimes, Dates and timestamps as given", () => {
    const date = new Date(2025, 0, 10, 15)
    expect(parseDate(date)).toBe(date)
    expect(parseDate("2025-01-10T15:00:00")!.getHours()).toBe(15)
    expect(parseDate(date.getTime())!.getTime()).toBe(date.getTime())
  })

  it("returns null for blanks and unparseable values", () => {
    expect(parseDate(null)).toBeNull()
    expect(parseDate("")).toBeNull()
    expect(parseDate("not-a-date")).toBeNull()
    expect(parseDate("2025-02-30")).toBeNull()
  })
})

describe("date filters with date-only cell values", () => {
  it("compare the cell's own calendar day", () => {
    const jan9 = new Date(2025, 0, 9)
    const jan10 = new Date(2025, 0, 10)
    expect(MODE_FNS.after!("2025-01-10", jan9)).toBe(true)
    expect(MODE_FNS.before!("2025-01-10", jan10)).toBe(false)
    expect(MODE_FNS.betweenDates!("2025-01-10", [jan10, jan10])).toBe(true)
  })
})
