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

/** The table store, as far as reading its current state needs it. */
interface ReadableStore {
  state: object
  subscribe: (listener: () => void) => unknown
}

// The latest state per store, kept by one listener. Reading `store.state`
// costs a few microseconds (it resolves the derived atom); cells read UI
// values thousands of times per render, so they read this copy instead. Only
// for reads during render and in event handlers: inside another store
// listener the copy can lag behind a nested update, so code there reads
// `store.state` (or `getState()`) directly.
const latestStates = new WeakMap<ReadableStore, { state: object }>()

function latestState(store: ReadableStore): { state: object } {
  let latest = latestStates.get(store)
  if (!latest) {
    const entry = { state: store.state }
    // Lives as long as the store (the table): no unsubscribe needed.
    store.subscribe(() => {
      entry.state = store.state
    })
    latestStates.set(store, entry)
    latest = entry
  }
  return latest
}

/**
 * Turns the UI state members of `config` into getters on the table store, so
 * reading them gives the current value whenever they are read, not the value
 * from the render that built `config`.
 */
export function withLiveUiState<T extends object>(
  config: T,
  store: ReadableStore
): T {
  const latest = latestState(store)
  for (const key of UI_STATE_KEYS) {
    Object.defineProperty(config, key, {
      get: () => (latest.state as DataTableUiState)[key],
      enumerable: true,
      configurable: true,
    })
  }
  return config
}
