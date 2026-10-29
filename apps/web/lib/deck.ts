import type { FrameTheme } from "./style-frame-protocol"

/** The deck's picker values (font and radius may be STYLE_DEFAULT). */
export type FrameChoice = Omit<FrameTheme, "dark">

/** Where a card sits on the style carousel for a rotation (in card steps). */
export function deckSlot(index: number, rotation: number, count: number) {
  const step = 360 / count
  let angle = ((index - rotation) * step) % 360
  if (angle <= -180) angle += 360
  if (angle > 180) angle -= 360
  angle = Math.round(angle * 1e6) / 1e6
  const depth = Math.round(Math.cos((angle * Math.PI) / 180) * 1000) / 1000
  return {
    angle: angle === 0 ? 0 : angle,
    front: Math.abs(angle) < step / 2,
    depth,
  }
}

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

/** Coverflow: neighbours this far to the side, in card widths. */
const SIDE_X = 0.62
/** ...this far back, in card widths. */
const SIDE_Z = 0.34
/** ...turned this far towards the viewer's centre. */
const SIDE_TURN = 35
/** ...and dimmed to this opacity. */
const SIDE_OPACITY = 0.6

/**
 * Where a card sits in the coverflow for its slot offset (`angle / step`, in
 * cards from the front): the front card flat and centred, its two neighbours
 * turned and pushed back, the rest faded out beyond them.
 */
export function coverflow(offset: number) {
  const a = Math.min(Math.abs(offset), 2)
  const sign = Math.sign(offset)
  const near = Math.min(a, 1)
  const far = Math.max(a - 1, 0)
  // `+ 0` turns -0 into 0, so the front card's values are plain zeros.
  return {
    x: sign * (near * SIDE_X + far * SIDE_X * 0.4) + 0,
    z: -(near * SIDE_Z + far * SIDE_Z) + 0,
    turn: sign * near * SIDE_TURN + 0,
    opacity:
      a <= 1 ? 1 - (1 - SIDE_OPACITY) * a : SIDE_OPACITY * Math.max(0, 1 - far),
  }
}
