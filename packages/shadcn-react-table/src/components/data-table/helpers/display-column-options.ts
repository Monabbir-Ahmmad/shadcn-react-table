import type { RowData } from "@tanstack/react-table"

import type { DataTableColumnDef } from "../core/table-types"
import type { DisplayColumnId } from "../core/types"

type ColumnOverride<TData extends RowData> = Partial<
  DataTableColumnDef<TData, unknown>
>

export interface DisplayColumnOptions<TData extends RowData> {
  defaultDisplayColumn?: ColumnOverride<TData>
  displayColumnDefOptions?: Partial<
    Record<DisplayColumnId, ColumnOverride<TData>>
  >
}

/**
 * A string that changes only when the options' shape or plain values change.
 * Functions count as equal, since `applyDisplayColumnOptions` reads them
 * live, so options written inline don't rebuild the columns every render.
 */
export function displayColumnOptionsKey<TData extends RowData>(
  options: DisplayColumnOptions<TData>
): string {
  // Only plain objects and arrays are walked: React elements, DOM nodes and
  // class instances (which can be circular) count as equal, like functions.
  return JSON.stringify(options, (_key, value: unknown) => {
    if (typeof value === "function") return "ƒ"
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const proto = Object.getPrototypeOf(value)
      if (
        (proto !== Object.prototype && proto !== null) ||
        "$$typeof" in value
      ) {
        return "◇"
      }
    }
    return value
  })
}

/**
 * An injected column with the consumer's overrides: `defaultDisplayColumn`,
 * then its own `displayColumnDefOptions` entry. `meta` merges with the
 * column's; the id never changes. Function props call the latest options
 * through `getOptions`, so they stay current while the definition is reused.
 */
export function applyDisplayColumnOptions<TData extends RowData>(
  column: DataTableColumnDef<TData, unknown>,
  getOptions: () => DisplayColumnOptions<TData>
): DataTableColumnDef<TData, unknown> {
  const id = column.id as DisplayColumnId
  const pick = (options: DisplayColumnOptions<TData>) => [
    options.defaultDisplayColumn,
    options.displayColumnDefOptions?.[id],
  ]
  const overrides = pick(getOptions())
  if (!overrides.some(Boolean)) return column

  const merged: Record<string, unknown> = { ...column }
  for (const override of overrides) {
    if (!override) continue
    for (const [key, value] of Object.entries(override)) {
      if (key === "id") continue
      if (key === "meta") {
        merged.meta = { ...(merged.meta as object), ...(value as object) }
      } else if (typeof value === "function") {
        // Call whichever override supplies this key now (per-id wins).
        merged[key] = (...args: unknown[]) => {
          const latest = pick(getOptions())
            .map((o) => (o as Record<string, unknown> | undefined)?.[key])
            .filter((fn) => typeof fn === "function")
            .pop() as ((...args: unknown[]) => unknown) | undefined
          return latest?.(...args)
        }
      } else {
        merged[key] = value
      }
    }
  }
  return merged as unknown as DataTableColumnDef<TData, unknown>
}
