import { describe, expect, it } from "vitest"

import { frameTheme, STYLE_DEFAULT, STYLE_DEFAULTS } from "./deck"
import { FONTS } from "./theme-presets"

describe("frameTheme", () => {
  const choice = {
    accent: "lime",
    base: "neutral",
    font: STYLE_DEFAULT,
    radius: STYLE_DEFAULT,
    icons: "lucide" as const,
  }

  it("gives each style its own font and radius by default", () => {
    expect(frameTheme(choice, "lyra", false)).toEqual({
      ...choice,
      font: "mono",
      radius: "0rem",
      dark: false,
    })
    expect(frameTheme(choice, "maia", true)).toMatchObject({
      font: "raleway",
      radius: "1rem",
      dark: true,
    })
  })

  it("applies a picked font and radius to every style", () => {
    const picked = { ...choice, font: "geist", radius: "0.625rem" }
    for (const style of Object.keys(STYLE_DEFAULTS))
      expect(frameTheme(picked, style, false)).toMatchObject({
        font: "geist",
        radius: "0.625rem",
      })
  })

  it("only names fonts the presets know", () => {
    for (const { font } of Object.values(STYLE_DEFAULTS))
      expect(FONTS.some((f) => f.name === font)).toBe(true)
  })
})
