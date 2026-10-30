// Barrel for the filtering engine. Internal modules:
//   filter-modes.ts     — mode predicates (MODE_FNS), value coercers, mode sets
//   filter-factories.ts — the per-column / global dynamic FilterFn factories
//   ranked-row-model.ts — fuzzy-rank sorted row model
//   variant-modes.ts    — variant → default mode + mode-menu options
// Most of the module imports from here ("../fns/filter-fns"); keep this surface
// stable when adding to the sub-modules.

export {
  MODE_FNS,
  GLOBAL_FILTER_MODES,
  VALUELESS_MODES,
  SUBSTRING_MODES,
  getModeFn,
  isInactive,
  type BuiltInFilterMode,
  type BuiltInGlobalFilterMode,
  type FilterMode,
  type GlobalFilterMode,
} from "./filter-modes"
export {
  createDynamicFilterFn,
  createGlobalFilterFn,
  type CustomFilterFns,
} from "./filter-factories"
export { rankGlobalFuzzy, createRankedSortedRowModel } from "./ranked-row-model"
export { defaultModeForVariant, modeOptionsForVariant } from "./variant-modes"
