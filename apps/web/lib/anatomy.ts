/** The anatomy section's state at a scroll progress (0…1). */
export type AnatomyFrame = {
  /** How far apart the layers are (0 = touching, 1 = fully exploded). */
  spread: number
  /** How flat the stack lies (0 = tilted in 3D, 1 = flat like the real table). */
  flat: number
  /** The highlighted layer (0…4), or null. */
  active: number | null
  /** Opacity of the hero copy (1 at the top). */
  intro: number
}

const INTRO_END = 0.08
const LAYERS_END = 0.83
const COUNT = 5

const clamp = (n: number) => Math.min(1, Math.max(0, n))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const round = (n: number) => Math.round(n * 1000) / 1000

export function anatomyFrame(progress: number): AnatomyFrame {
  const p = clamp(progress)
  if (p < INTRO_END) {
    const t = p / INTRO_END
    return {
      spread: round(lerp(0.25, 1, t)),
      flat: 0,
      active: null,
      intro: round(1 - t),
    }
  }
  if (p < LAYERS_END) {
    const index = Math.min(
      COUNT - 1,
      Math.floor(((p - INTRO_END) / (LAYERS_END - INTRO_END)) * COUNT)
    )
    return { spread: 1, flat: 0, active: index, intro: 0 }
  }
  const t = (p - LAYERS_END) / (1 - LAYERS_END)
  return { spread: round(1 - t), flat: round(t), active: null, intro: 0 }
}
