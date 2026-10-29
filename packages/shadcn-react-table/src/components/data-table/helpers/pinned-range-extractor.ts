import { defaultRangeExtractor, type Range } from "@tanstack/react-virtual"

/**
 * Column-virtualizer range: the visible window plus every pinned column, so
 * sticky pinned columns stay rendered however far the table scrolls.
 */
export function pinnedRangeExtractor(
  range: Range,
  pinnedIndexes: number[]
): number[] {
  const indexes = defaultRangeExtractor(range)
  if (!pinnedIndexes.length) return indexes
  const merged = new Set(indexes)
  for (const index of pinnedIndexes) {
    if (index >= 0 && index < range.count) merged.add(index)
  }
  return [...merged].sort((a, b) => a - b)
}
