/** Rows the table knows about and where the drawn ones sit. */
export type RowSnapshot = {
  /** Every row key in the row model (plus "<id>:detail" for open panels). */
  members: ReadonlySet<string>
  /** Drawn rows only: px from the table's top edge. */
  tops: ReadonlyMap<string, number>
}

export type RowAnimationPlan = {
  moves: { key: string; dy: number }[]
  enters: string[]
  leaves: string[]
  skipped: boolean
}

/** Above this many animated rows the table just updates. */
export const MAX_ANIMATED_ROWS = 300

/** An empty plan: a fresh object each time, so no caller can share it. */
const none = (skipped = false): RowAnimationPlan => ({
  moves: [],
  enters: [],
  leaves: [],
  skipped,
})

/**
 * What changed between two snapshots: rows to glide (with the distance), rows
 * that appeared in the data and rows that left it. Rows that only scrolled
 * into or out of the drawn window are neither entering nor leaving.
 */
export function planRowAnimations(
  prev: RowSnapshot | null,
  next: RowSnapshot,
  limit = MAX_ANIMATED_ROWS
): RowAnimationPlan {
  if (!prev) return none()
  const moves: { key: string; dy: number }[] = []
  const enters: string[] = []
  for (const [key, top] of next.tops) {
    const before = prev.tops.get(key)
    if (before !== undefined) {
      if (before !== top) moves.push({ key, dy: before - top })
    } else if (!prev.members.has(key)) {
      enters.push(key)
    }
  }
  const leaves: string[] = []
  for (const key of prev.tops.keys()) {
    if (!next.members.has(key)) leaves.push(key)
  }
  if (moves.length + enters.length + leaves.length > limit) {
    return none(true)
  }
  return { moves, enters, leaves, skipped: false }
}
