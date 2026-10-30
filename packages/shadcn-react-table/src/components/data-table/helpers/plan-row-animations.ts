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
  /** Rows already in the data, drawn now but not before: a change brought
   *  them into a virtual window. */
  arrivals: string[]
  skipped: boolean
}

/** Above this many animated rows the table just updates. */
export const MAX_ANIMATED_ROWS = 300

/** An empty plan: a fresh object each time, so no caller can share it. */
const none = (skipped = false): RowAnimationPlan => ({
  moves: [],
  enters: [],
  leaves: [],
  arrivals: [],
  skipped,
})

/**
 * What changed between two snapshots: rows to glide (with the distance), rows
 * that appeared in the data and rows that left it. Rows that were in the data
 * but are newly drawn are arrivals, not entering; rows no longer drawn but
 * still in the data are not leaving. Only call it for a row change: a scroll
 * would make every row new to the window an arrival.
 */
export function planRowAnimations(
  prev: RowSnapshot | null,
  next: RowSnapshot,
  limit = MAX_ANIMATED_ROWS
): RowAnimationPlan {
  if (!prev) return none()
  const moves: { key: string; dy: number }[] = []
  const enters: string[] = []
  const arrivals: string[] = []
  for (const [key, top] of next.tops) {
    const before = prev.tops.get(key)
    if (before !== undefined) {
      if (before !== top) moves.push({ key, dy: before - top })
    } else if (prev.members.has(key)) {
      arrivals.push(key)
    } else {
      enters.push(key)
    }
  }
  const leaves: string[] = []
  for (const key of prev.tops.keys()) {
    if (!next.members.has(key)) leaves.push(key)
  }
  const count = moves.length + enters.length + leaves.length + arrivals.length
  if (count > limit) return none(true)
  return { moves, enters, leaves, arrivals, skipped: false }
}
