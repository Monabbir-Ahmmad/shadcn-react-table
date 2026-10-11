import type { OnChangeFn, RowData } from "@tanstack/react-table"

import type { DataTableColumn } from "../core/table-types"

// Column pinning speaks physical left/right in our API. TanStack v9 speaks
// logical start/end; this module is the only place that translates, so the
// rest of the table never sees TanStack's pinning vocabulary.

export type PinSide = "left" | "right"

/** Column pinning state as consumers pass it (`initialState`, `state`). */
export interface DataTableColumnPinningState {
  left?: string[]
  right?: string[]
}

/** TanStack v9's column pinning state shape. */
export interface CoreColumnPinningState {
  start: string[]
  end: string[]
}

export function getPinSide<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>
): PinSide | false {
  const pinned = column.getIsPinned()
  return pinned === "start" ? "left" : pinned === "end" ? "right" : false
}

export function pinColumn<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>,
  side: PinSide | false
): void {
  column.pin(side === "left" ? "start" : side === "right" ? "end" : false)
}

/** Sticky offset from the pinned edge, so stacked pinned columns line up. */
export function getPinOffset<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>,
  side: PinSide
): number {
  return side === "left" ? column.getStart("start") : column.getAfter("end")
}

/** The boundary column of a pinned group: last on the left, first on the right. */
export function isPinnedEdgeColumn<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>,
  side: PinSide
): boolean {
  return side === "left"
    ? column.getIsLastColumn("start")
    : column.getIsFirstColumn("end")
}

export function toCorePinning(
  state: DataTableColumnPinningState
): CoreColumnPinningState {
  return { start: state.left ?? [], end: state.right ?? [] }
}

export function fromCorePinning(
  state: Partial<CoreColumnPinningState>
): Required<DataTableColumnPinningState> {
  return { left: state.start ?? [], right: state.end ?? [] }
}

/** Adapts a consumer's left/right change handler to TanStack's start/end one.
 *  Always hands the consumer a functional updater (TanStack's convention). */
export function mapPinningUpdater(
  onChange: OnChangeFn<DataTableColumnPinningState>
): OnChangeFn<CoreColumnPinningState> {
  return (updater) =>
    onChange((prev) =>
      fromCorePinning(
        typeof updater === "function" ? updater(toCorePinning(prev)) : updater
      )
    )
}
