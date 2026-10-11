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
  type BuiltInAggregationFn,
  type RowData,
  type TableFeature,
} from "@tanstack/react-table"

import { toDataTableState } from "../helpers/table-state"
import type { DataTableCoreTable } from "./table-types"

// TanStack types `aggregationFns` with a type alias it doesn't export, which
// declaration emit can't name. A named interface over the same type gives the
// emitted `DataTableFeatures` something it can reference.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface BuiltInAggregationFns extends Pick<
  typeof aggregationFns,
  BuiltInAggregationFn
> {}
const builtInAggregationFns: BuiltInAggregationFns = aggregationFns

// Our instance members (`getState()` in our state shape, `tableInstance`) as a
// TanStack feature, so TanStack's own types for tables built with this feature
// set carry them (see the `Table_FeatureMap` augmentation in `types.ts`). The
// base entry is a placeholder that puts the key on `DataTableFeatures`; each
// table gets the working one from `createDataTableFeatures`.
const dataTableInstanceFeature: TableFeature = {}

// Every built-in feature (MRT parity) plus every row model and the full fn
// registries, so string fns like "sum" / "mean" / "includesString" and the
// "auto" defaults resolve as they did on TanStack v8. `filterMeta` types what
// the fuzzy global filter stores via `addMeta` (match-sorter's RankingInfo).
const baseFeatures = tableFeatures({
  ...stockFeatures,
  dataTableInstanceFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  groupedRowModel: createGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  facetedMinMaxValues: createFacetedMinMaxValues(),
  filterFns,
  sortFns,
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
}: {
  gates: () => RowModelGates
  /** The hook's `tableInstance` config, read lazily. */
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
          tableInstance: { get: getTableInstance },
        })
      },
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
