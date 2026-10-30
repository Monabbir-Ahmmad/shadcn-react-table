import { describe, expect, it } from "vitest"

import { DEFAULT_PREFS, migratePrefs } from "./theme-store"
import { RADII } from "./theme-presets"

describe("migratePrefs", () => {
  it("fills missing prefs from the defaults", () => {
    expect(migratePrefs({})).toEqual(DEFAULT_PREFS)
    expect(migratePrefs({ accent: "blue" })).toEqual({
      ...DEFAULT_PREFS,
      accent: "blue",
    })
  })

  it("moves the old 0.65rem radius to the 0.625rem preset", () => {
    expect(migratePrefs({ radius: "0.65rem" }).radius).toBe("0.625rem")
    expect(RADII).toContain("0.625rem")
  })

  it("keeps current radii as they are", () => {
    for (const radius of RADII)
      expect(migratePrefs({ radius }).radius).toBe(radius)
  })
})
