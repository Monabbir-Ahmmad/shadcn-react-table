import { describe, expect, it } from "vitest"

import {
  ACCENTS,
  BASE_COLORS,
  FONTS,
  MENU_ACCENTS,
  RADII,
  themeVars,
} from "./theme-presets"

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

describe("heading font", () => {
  it("sets --font-heading from its own pick, separate from the body", () => {
    const vars = themeVars(
      {
        accent: "lime",
        base: "neutral",
        font: "geist",
        heading: "serif",
        radius: "0rem",
      },
      false
    )
    expect(vars["--font-sans"]).toBe("var(--font-geist)")
    expect(vars["--font-heading"]).toBe("var(--font-noto-serif)")
  })
})

describe("menu accent", () => {
  const prefs = { accent: "blue", base: "zinc", font: "geist", radius: "0rem" }

  it("subtle keeps the base color's quiet highlight", () => {
    const vars = themeVars({ ...prefs, menuAccent: "subtle" }, false)
    expect(vars["--accent"]).toBe(themeVars(prefs, false)["--accent"])
    expect(vars["--accent"]).not.toBe(vars["--primary"])
  })

  it("bold highlights with the accent color", () => {
    for (const dark of [false, true]) {
      const vars = themeVars({ ...prefs, menuAccent: "bold" }, dark)
      expect(vars["--accent"]).toBe(vars["--primary"])
      expect(vars["--accent-foreground"]).toBe(vars["--primary-foreground"])
    }
  })
})

describe("choices", () => {
  it("has unique names in every list", () => {
    for (const list of [ACCENTS, BASE_COLORS, FONTS, MENU_ACCENTS]) {
      const names = list.map((x) => x.name)
      expect(new Set(names).size).toBe(names.length)
    }
    expect(new Set(RADII).size).toBe(RADII.length)
  })

  it("offers at least nine accents and seven fonts", () => {
    expect(ACCENTS.length).toBeGreaterThanOrEqual(9)
    expect(FONTS.length).toBeGreaterThanOrEqual(7)
  })
})
