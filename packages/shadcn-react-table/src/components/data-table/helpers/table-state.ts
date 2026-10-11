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

export function toDataTableState(state: CoreState): DataTableState {
  return {
    ...state,
    columnPinning: fromCorePinning(state.columnPinning),
    columnSizingInfo: state.columnResizing,
  }
}
