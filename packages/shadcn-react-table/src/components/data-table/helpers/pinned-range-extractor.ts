import { defaultRangeExtractor, type Range } from "@tanstack/react-virtual"

/**
 * A virtualizer's rendered indexes plus the given ones that must stay
 * rendered (those out of `0..count-1` are ignored), in ascending order.
 */
export function withKeptIndexes(
  indexes: number[],
  keep: number[],
  count: number
): number[] {
  const extra = keep.filter(
    (index) => index >= 0 && index < count && !indexes.includes(index)
  )
  if (!extra.length) return indexes
  return [...new Set([...indexes, ...extra])].sort((a, b) => a - b)
}

/**
 * Column-virtualizer range: the visible window plus every pinned column, so
 * sticky pinned columns stay rendered however far the table scrolls.
 */
export function pinnedRangeExtractor(
  range: Range,
  pinnedIndexes: number[]
): number[] {
  return withKeptIndexes(
    defaultRangeExtractor(range),
    pinnedIndexes,
    range.count
  )
}
