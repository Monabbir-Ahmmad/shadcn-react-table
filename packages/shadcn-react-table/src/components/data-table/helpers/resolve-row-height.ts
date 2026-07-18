import type { Row, RowData } from "@tanstack/react-table"

export interface RowHeightOptions<TData extends RowData> {
  /** Flat height (px) applied to every row. */
  rowHeight?: number
  /** Per-row height: a px number, `"auto"` (wrap and grow), or `null` to fall
   *  back to `rowHeight` / the density default. */
  getRowHeight?: (row: Row<TData>) => number | "auto" | null
}

/**
 * Resolves a row's height from the `getRowHeight` / `rowHeight` options.
 * Precedence: `getRowHeight(row)` (unless it returns null/undefined) →
 * `rowHeight` → `undefined` (meaning "use the density default").
 */
export function resolveRowHeight<TData extends RowData>(
  row: Row<TData>,
  { getRowHeight, rowHeight }: RowHeightOptions<TData>
): number | "auto" | undefined {
  const resolved = getRowHeight?.(row)
  if (resolved != null) return resolved
  return rowHeight
}
