import {
  functionalUpdate,
  makeStateUpdater,
  type TableFeature,
  type Updater,
} from "@tanstack/react-table"

import type { FilterMode, GlobalFilterMode } from "../fns/filter-fns"
import type { AdvancedFilterGroup, Density, EditingCell } from "./types"

/**
 * The table's own UI state, kept in TanStack's store next to sorting,
 * filtering and the rest, so it has the same `initialState` / controlled
 * `state` / change-handler forms and parts of the table can subscribe to it.
 */
export interface DataTableUiState {
  density: Density
  isFullscreen: boolean
  showColumnFilters: boolean
  /** Active filter mode per column id (columns not listed use their default). */
  columnFilterModes: Record<string, FilterMode>
  globalFilterMode: GlobalFilterMode
  advancedFilter: AdvancedFilterGroup
  showAdvancedFilterPanel: boolean
  /** The cell being edited in cell mode, or `null`. */
  editingCell: EditingCell | null
  /** The row being edited in row or modal mode, or `null`. */
  editingRowId: string | null
  /** Whether the new-row editor is open. */
  isCreating: boolean
  /** Draft values of the row being edited or created, by column id. */
  rowDraft: Record<string, unknown>
  /** Text direction, measured from the rendered table. */
  direction: "ltr" | "rtl"
}

export type DataTableUiStateKey = keyof DataTableUiState

export const UI_STATE_KEYS = [
  "density",
  "isFullscreen",
  "showColumnFilters",
  "columnFilterModes",
  "globalFilterMode",
  "advancedFilter",
  "showAdvancedFilterPanel",
  "editingCell",
  "editingRowId",
  "isCreating",
  "rowDraft",
  "direction",
] as const satisfies readonly DataTableUiStateKey[]

export const EMPTY_ADVANCED_FILTER: AdvancedFilterGroup = {
  logic: "and",
  rules: [],
}

/** `density` → `onDensityChange`: TanStack's change-handler naming. */
export const changeHandlerKey = (key: DataTableUiStateKey) =>
  `on${key[0]!.toUpperCase()}${key.slice(1)}Change`

/** Minimal view of the table the UI-state helpers need. */
interface StoreTable {
  store: { state: object }
  baseAtoms: object
}

type WritableAtoms = Record<
  string,
  { set: (updater: (old: unknown) => unknown) => void } | undefined
>

/** The UI slices of the current state. */
export function getUiState(table: { store: { state: object } }) {
  return table.store.state as DataTableUiState
}

/**
 * Registers the UI slices as table state. Their starting values come from
 * `getDefaults` (the hook's `default*` options), under any `initialState`.
 */
export function createUiStateFeature(
  getDefaults: () => DataTableUiState
): TableFeature {
  return {
    getInitialState: (initialState) => ({ ...getDefaults(), ...initialState }),
    getDefaultTableOptions: (table) =>
      Object.fromEntries(
        UI_STATE_KEYS.map((key) => [
          changeHandlerKey(key),
          makeStateUpdater(key as never, table as never),
        ])
      ),
  }
}

/**
 * A change handler for one UI slice: stores the next value unless the slice is
 * controlled (then the owner's next `state` brings it in), and reports the
 * value to the consumer's callback either way.
 */
export function makeUiStateHandler<K extends DataTableUiStateKey>(
  getTable: () => StoreTable | null,
  key: K,
  isControlled: boolean,
  onChange?: (value: DataTableUiState[K]) => void
) {
  return (updater: Updater<DataTableUiState[K]>) => {
    const table = getTable()
    if (!table) return
    const current = getUiState(table)[key]
    const next = functionalUpdate(updater, current)
    if (Object.is(next, current)) return
    if (!isControlled) (table.baseAtoms as WritableAtoms)[key]?.set(() => next)
    onChange?.(next)
  }
}
