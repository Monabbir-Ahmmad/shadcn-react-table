import type { RankingInfo } from "@tanstack/match-sorter-utils"
import {
  aggregationFns,
  createExpandedRowModel,
  createFacetedMinMaxValues,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createGroupedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  metaHelper,
  sortFns,
  stockFeatures,
  tableFeatures,
  type AggregationFnDef,
  type BuiltInAggregationFn,
  type BuiltInFilterFn,
  type BuiltInSortFn,
  type FilterFn,
  type RowData,
  type SortFn,
  type TableFeature,
  type TableFeatures,
} from "@tanstack/react-table"

import { toDataTableState } from "../helpers/table-state"
import type { DataTableCoreTable } from "./table-types"
import type { DataTableMethodKey } from "./types"
import { createUiStateFeature, type DataTableUiState } from "./ui-state"

// TanStack types `aggregationFns` with a type alias it doesn't export, which
// declaration emit can't name. A named interface over the same type gives the
// emitted `DataTableFeatures` something it can reference.
// The index signatures let columns name the consumer's own functions
// (`sortFn: "byPriority"`), registered per table from the hook's options.
/* eslint-disable @typescript-eslint/no-explicit-any */
interface BuiltInAggregationFns extends Pick<
  typeof aggregationFns,
  BuiltInAggregationFn
> {
  [name: string]: AggregationFnDef<any, any, any, any>
}
interface FilterFnRegistry extends Pick<typeof filterFns, BuiltInFilterFn> {
  [name: string]: FilterFn<any, any>
}
interface SortFnRegistry extends Pick<typeof sortFns, BuiltInSortFn> {
  [name: string]: SortFn<any, any>
}
/* eslint-enable @typescript-eslint/no-explicit-any */
const builtInAggregationFns: BuiltInAggregationFns = aggregationFns
const filterFnRegistry: FilterFnRegistry = filterFns
const sortFnRegistry: SortFnRegistry = sortFns

// Our instance members (`getState()` in our state shape, `dataTable`, the methods) as a
// TanStack feature, so TanStack's own types for tables built with this feature
// set carry them (see the `Table_FeatureMap` augmentation in `types.ts`). The
// base entry is a placeholder that puts the key on `DataTableFeatures`; each
// table gets the working one from `createDataTableFeatures`.
const dataTableInstanceFeature: TableFeature = {}
// Placeholder for the typed feature map; `createDataTableFeatures` supplies
// the real one (it needs the hook's defaults).
const dataTableUiFeature: TableFeature = {}

// Filtering and sorting are filled per table with our own factories, each
// typed for the hook's `TData`. Their slots take TanStack's own declared type
// for a custom row model (the factory receives the table untyped), which any
// such factory fits. The type `createFilteredRowModel()` infers on its own
// expects `Table<any, any>`, whose filter meta is TanStack's empty
// `FilterMeta`, not our `RankingInfo`, so our factories wouldn't fit it.
type FilteredRowModelSlot = NonNullable<TableFeatures["filteredRowModel"]>
type SortedRowModelSlot = NonNullable<TableFeatures["sortedRowModel"]>
const filteredRowModel: FilteredRowModelSlot = createFilteredRowModel()
const sortedRowModel: SortedRowModelSlot = createSortedRowModel()

// Every built-in feature (MRT parity) plus every row model and the full fn
// registries, so string fns like "sum" / "mean" / "includesString" and the
// "auto" defaults resolve as they did on TanStack v8. `filterMeta` types what
// the fuzzy global filter stores via `addMeta` (match-sorter's RankingInfo).
const baseFeatures = tableFeatures({
  ...stockFeatures,
  dataTableInstanceFeature,
  dataTableUiFeature,
  filteredRowModel,
  sortedRowModel,
  groupedRowModel: createGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  facetedMinMaxValues: createFacetedMinMaxValues(),
  filterFns: filterFnRegistry,
  sortFns: sortFnRegistry,
  aggregationFns: builtInAggregationFns,
  filterMeta: metaHelper<RankingInfo>(),
})

export type DataTableFeatures = typeof baseFeatures

/** Which row-model stages run. Read on every row-model call, so they track
 *  the latest options without recreating the (cached-once) factories. */
export interface RowModelGates {
  pagination: boolean
  grouping: boolean
  expanding: boolean
  faceting: boolean
}

const EMPTY_FACETS = new Map<unknown, number>()

/* eslint-disable @typescript-eslint/no-explicit-any */
interface CustomFns {
  filterFns?: Record<string, FilterFn<any, any>>
  sortFns?: Record<string, SortFn<any, any>>
  aggregationFns?: Record<string, AggregationFnDef<any, any, any, any>>
}

/**
 * The consumer's filter or sort functions as registry entries that call the
 * latest version by name (the registry is built once per table). Each keeps
 * the original's own properties (`autoRemove`, …).
 */
function liveFns<K extends "filterFns" | "sortFns">(
  getCustomFns: () => CustomFns,
  key: K
): NonNullable<CustomFns[K]> {
  const out: Record<string, (...args: any[]) => any> = {}
  for (const [name, fn] of Object.entries(getCustomFns()[key] ?? {})) {
    out[name] = Object.assign(
      (...args: any[]) =>
        ((getCustomFns()[key]?.[name] ?? fn) as (...a: any[]) => any)(...args),
      fn
    )
  }
  return out as NonNullable<CustomFns[K]>
}

/** The consumer's aggregation functions, calling the latest version. */
function liveAggregationFns(
  getCustomFns: () => CustomFns
): NonNullable<CustomFns["aggregationFns"]> {
  const out: NonNullable<CustomFns["aggregationFns"]> = {}
  for (const [name, def] of Object.entries(
    getCustomFns().aggregationFns ?? {}
  )) {
    const latest = () => getCustomFns().aggregationFns?.[name] ?? def
    out[name] = {
      aggregate: (context) => latest().aggregate(context),
      ...(def.merge && {
        merge: (context: any) => (latest().merge ?? def.merge!)(context),
      }),
    }
  }
  return out
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Every method the table adds to the TanStack instance. */
export const DATA_TABLE_METHODS = [
  "setDensity",
  "setIsFullscreen",
  "setShowColumnFilters",
  "setShowGlobalFilter",
  "setColumnFilterMode",
  "setGlobalFilterMode",
  "setAdvancedFilter",
  "setShowAdvancedFilterPanel",
  "setEditingCell",
  "setRowDraftValue",
  "beginRowEdit",
  "beginCreate",
  "cancelEdit",
  "autoSizeColumn",
  "autoSizeAllColumns",
] as const satisfies readonly DataTableMethodKey[]

/**
 * The per-table feature set. TanStack builds each row model once, on first
 * use, from whatever is on `features` at that moment, so stages that our
 * options can switch off are wrapped in gates that read the current config
 * instead of being omitted. Filtering and sorting take our own factories (the
 * advanced-filter and fuzzy-rank wrappers).
 */
export function createDataTableFeatures({
  gates,
  getTableInstance,
  filteredRowModel,
  sortedRowModel,
  uiDefaults,
  getCustomFns,
}: {
  /** The consumer's `filterFns` / `sortFns` / `aggregationFns`, added to the
   *  built-in registries so columns can name them. Read once for the names;
   *  each registered function calls the latest version. */
  getCustomFns: () => CustomFns
  gates: () => RowModelGates
  /** Starting values of the UI state slices (see `ui-state.ts`). */
  uiDefaults: () => DataTableUiState
  /** The hook's `dataTable` config, read lazily. */
  getTableInstance: () => unknown
  filteredRowModel: DataTableFeatures["filteredRowModel"]
  sortedRowModel: DataTableFeatures["sortedRowModel"]
}): DataTableFeatures {
  return {
    ...baseFeatures,
    dataTableInstanceFeature: {
      // Render contexts, `row.table` and `column.table` hand out TanStack's
      // core table, not the hook's instance, so mirror our members onto it.
      // Non-enumerable, so they aren't copied onto the hook's instance (which
      // has its own).
      constructTableAPIs: (table) => {
        const core = table as unknown as DataTableCoreTable<RowData>
        Object.defineProperties(core, {
          getState: { value: () => toDataTableState(core.store.state) },
          dataTable: { get: getTableInstance },
          // The methods, for render contexts (`cell: ({ table }) => …`),
          // which hold TanStack's own instance.
          ...Object.fromEntries(
            DATA_TABLE_METHODS.map((key) => [
              key,
              {
                get: () =>
                  (getTableInstance() as Record<string, unknown> | undefined)?.[
                    key
                  ],
              },
            ])
          ),
        })
      },
    },
    dataTableUiFeature: createUiStateFeature(uiDefaults),
    filterFns: {
      ...baseFeatures.filterFns,
      ...liveFns(getCustomFns, "filterFns"),
    },
    sortFns: { ...baseFeatures.sortFns, ...liveFns(getCustomFns, "sortFns") },
    aggregationFns: {
      ...baseFeatures.aggregationFns,
      ...liveAggregationFns(getCustomFns),
    },
    filteredRowModel,
    sortedRowModel,
    groupedRowModel: (table) => {
      const model = baseFeatures.groupedRowModel(table)
      return () => (gates().grouping ? model() : table.getPreGroupedRowModel())
    },
    expandedRowModel: (table) => {
      const model = baseFeatures.expandedRowModel(table)
      return () =>
        gates().expanding ? model() : table.getPreExpandedRowModel()
    },
    paginatedRowModel: (table) => {
      const model = baseFeatures.paginatedRowModel(table)
      return () =>
        gates().pagination ? model() : table.getPrePaginatedRowModel()
    },
    facetedRowModel: (table, columnId) => {
      const model = baseFeatures.facetedRowModel(table, columnId)
      return () => (gates().faceting ? model() : table.getPreFilteredRowModel())
    },
    facetedUniqueValues: (table, columnId) => {
      const values = baseFeatures.facetedUniqueValues(table, columnId)
      return () => (gates().faceting ? values() : EMPTY_FACETS)
    },
    facetedMinMaxValues: (table, columnId) => {
      const values = baseFeatures.facetedMinMaxValues(table, columnId)
      return () => (gates().faceting ? values() : undefined)
    },
  }
}
