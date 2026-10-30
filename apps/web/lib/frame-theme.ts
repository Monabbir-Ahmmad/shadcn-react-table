import type { FrameTheme } from "./style-frame-protocol"

/** The customizer's picker values (font and radius may be STYLE_DEFAULT). */
export type FrameChoice = Omit<FrameTheme, "dark">

/** Picker value meaning "each style uses its own font / radius". */
export const STYLE_DEFAULT = "style"

/** Each style's own font and radius, like shadcn's create page pairs them. */
export const STYLE_DEFAULTS: Record<string, { font: string; radius: string }> =
  {
    vega: { font: "geist", radius: "0.625rem" },
    nova: { font: "geist", radius: "0.5rem" },
    maia: { font: "raleway", radius: "1rem" },
    lyra: { font: "mono", radius: "0rem" },
    mira: { font: "geist", radius: "0.45rem" },
    sera: { font: "serif", radius: "0rem" },
  }

/** The theme one style's frame gets: picks win, "style" keeps its own. */
export function frameTheme(
  choice: FrameChoice,
  style: string,
  dark: boolean
): FrameTheme {
  const own = STYLE_DEFAULTS[style] ?? { font: "geist", radius: "0.625rem" }
  return {
    ...choice,
    font: choice.font === STYLE_DEFAULT ? own.font : choice.font,
    radius: choice.radius === STYLE_DEFAULT ? own.radius : choice.radius,
    dark,
  }
}
