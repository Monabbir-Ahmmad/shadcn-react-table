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
