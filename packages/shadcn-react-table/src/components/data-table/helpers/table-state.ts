import type { TableState } from "@tanstack/react-table"

import type { DataTableFeatures } from "../core/features"
import {
  fromCorePinning,
  type DataTableColumnPinningState,
} from "./column-pinning"

type CoreState = TableState<DataTableFeatures>

/** Table state in our stable shape: v8-style left/right column pinning and
 *  the v8 `columnSizingInfo` name for TanStack v9's `columnResizing`. Every
 *  other slice is passed through by reference (memo deps stay stable). */
export type DataTableState = Omit<CoreState, "columnPinning"> & {
  columnPinning: Required<DataTableColumnPinningState>
  columnSizingInfo: CoreState["columnResizing"]
}

// TanStack v9 replaces the store's state object only when a slice changes, so
// keying on it hands back the same snapshot (and the same slice references)
// until the next change, like v8's stored state.
const snapshots = new WeakMap<CoreState, DataTableState>()
// The converted pinning is cached on TanStack's own pinning object, so it
// keeps its identity while other slices change (row memo deps compare it).
const pinnings = new WeakMap<
  CoreState["columnPinning"],
  Required<DataTableColumnPinningState>
>()

function stablePinning(
  pinning: CoreState["columnPinning"]
): Required<DataTableColumnPinningState> {
  let converted = pinnings.get(pinning)
  if (!converted) {
    converted = fromCorePinning(pinning)
    pinnings.set(pinning, converted)
  }
  return converted
}

export function toDataTableState(state: CoreState): DataTableState {
  let snapshot = snapshots.get(state)
  if (!snapshot) {
    snapshot = {
      ...state,
      columnPinning: stablePinning(state.columnPinning),
      columnSizingInfo: state.columnResizing,
    }
    snapshots.set(state, snapshot)
  }
  return snapshot
}
