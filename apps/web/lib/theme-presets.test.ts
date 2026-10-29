import { describe, expect, it } from "vitest"

import { ACCENTS, BASE_COLORS, FONTS, RADII, themeVars } from "./theme-presets"

describe("themeVars", () => {
  it("sets the accent, radius and font", () => {
    const vars = themeVars(
      {
        accent: ACCENTS[0]!.name,
        base: "neutral",
        font: "geist",
        radius: "0.5rem",
      },
      false
    )
    expect(vars["--primary"]).toBe(ACCENTS[0]!.light.primary)
    expect(vars["--radius"]).toBe("0.5rem")
    expect(vars["--font-sans"]).toBe(
      FONTS.find((f) => f.name === "geist")!.value
    )
    expect(vars["--background"]).toBeDefined()
  })

  it("uses the dark ramp and dark accent in dark mode", () => {
    const prefs = {
      accent: "lime",
      base: "zinc",
      font: "geist",
      radius: "0rem",
    }
    const light = themeVars(prefs, false)
    const dark = themeVars(prefs, true)
    expect(dark["--background"]).not.toBe(light["--background"])
    expect(dark["--primary"]).toBe(
      ACCENTS.find((a) => a.name === "lime")!.dark.primary
    )
  })

  it("falls back to the first preset for unknown names", () => {
    const vars = themeVars(
      { accent: "nope", base: "nope", font: "nope", radius: "0rem" },
      false
    )
    expect(vars["--primary"]).toBe(ACCENTS[0]!.light.primary)
    expect(BASE_COLORS.length).toBeGreaterThan(1)
  })
})

describe("FONTS", () => {
  it("offers the mono font the site loads", () => {
    const mono = FONTS.find((f) => f.name === "mono")
    expect(mono?.value).toBe("var(--font-mono)")
    expect(
      themeVars(
        { accent: "lime", base: "neutral", font: "mono", radius: "0rem" },
        false
      )["--font-sans"]
    ).toBe("var(--font-mono)")
  })
})

describe("RADII", () => {
  it("includes shadcn's default radius", () => {
    expect(RADII).toContain("0.625rem")
    expect(RADII).not.toContain("0.65rem")
  })
})
