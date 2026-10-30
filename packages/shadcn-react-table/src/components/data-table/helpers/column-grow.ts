import { NON_DATA_COLUMN_IDS } from "../core/constants"
import type { LayoutMode } from "../core/types"

export type { LayoutMode }

/** A column's `meta.grow` as a weight: on (`true` or unset) is 1, off
 *  (`false`, 0, negative or not a number) is 0, a number is its weight. */
export function growWeight(grow: boolean | number | undefined): number {
  if (grow === undefined || grow === true) return 1
  if (grow === false) return 0
  return Number.isFinite(grow) && grow > 0 ? grow : 0
}

/**
 * How much of the spare width a column takes in `layoutMode: "grid"`, by
 * weight: the table's own columns (selection, row numbers, actions…) and
 * columns with a size in `columnSizing` (resized by the user) never grow.
 */
export function getColumnGrowWeight(
  columnId: string,
  grow: boolean | number | undefined,
  columnSizing: Record<string, number>
): number {
  if (NON_DATA_COLUMN_IDS.has(columnId)) return 0
  if (Object.prototype.hasOwnProperty.call(columnSizing, columnId)) return 0
  return growWeight(grow)
}

export interface GrowItem {
  id: string
  size: number
  weight: number
}

/**
 * Shares the spare width (`available` minus the columns' sizes, in whole
 * pixels) between the columns by weight. Each share is a whole pixel count;
 * the pixels rounding leaves over go to the largest remainders, so the
 * shares add up to the spare width exactly. Returns each growing column's
 * share; columns that do not grow (or no spare width) are left out.
 */
export function distributeGrowth(
  items: readonly GrowItem[],
  available: number
): Map<string, number> {
  const shares = new Map<string, number>()
  const totalSize = items.reduce((sum, item) => sum + item.size, 0)
  const spare = Math.floor(available - totalSize)
  const growing = items.filter((item) => item.weight > 0)
  const totalWeight = growing.reduce((sum, item) => sum + item.weight, 0)
  if (!(spare > 0) || totalWeight <= 0) return shares

  let given = 0
  const remainders = growing.map((item, index) => {
    const exact = (spare * item.weight) / totalWeight
    const whole = Math.floor(exact)
    shares.set(item.id, whole)
    given += whole
    return { index, rest: exact - whole }
  })
  remainders.sort((a, b) => b.rest - a.rest || a.index - b.index)
  for (let i = 0; i < spare - given; i++) {
    const id = growing[remainders[i]!.index]!.id
    shares.set(id, shares.get(id)! + 1)
  }
  return shares
}
