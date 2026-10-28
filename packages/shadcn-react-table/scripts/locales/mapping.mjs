// Maps every key of `defaultLocalization` to Material React Table's locale
// strings (vendored in ./mrt-3.2.1).
//
// Mapping shapes:
//   { mrt: "<mrtKey>" }          copy the MRT string as-is
//   { template: "..." }          composite; `{word}` is an MRT key when `word`
//                                exists in the MRT locale, otherwise a
//                                function parameter. `params` renames the
//                                placeholders inside the referenced MRT
//                                strings to our parameter names.
//   { object: { sub: Mapping } } for `filterModes`/`advancedFilterOperators`
//   { gap: true }                no MRT equivalent; translated by hand

const same = (key) => [key, { mrt: key }]

const SAME_NAME = [
  "language",
  "clearSelection",
  "sortByColumnAsc",
  "sortByColumnDesc",
  "clearSort",
  "columnActions",
  "showAllColumns",
  "pinToLeft",
  "pinToRight",
  "unpin",
  "groupByColumn",
  "ungroupByColumn",
  "groupedBy",
  "expand",
  "collapse",
  "expandAll",
  "collapseAll",
  "filterByColumn",
  "clearFilter",
  "changeFilterMode",
  "min",
  "max",
  "search",
  "clearSearch",
  "toggleDensity",
  "rowsPerPage",
  "goToFirstPage",
  "goToPreviousPage",
  "goToNextPage",
  "goToLastPage",
  "rowActions",
  "edit",
  "save",
  "cancel",
  "copy",
  "noRecordsToDisplay",
]

// Keys that share a name with an MRT key but not its shape: MRT's string takes
// a `{column}`/`{filterType}` placeholder while ours is a plain string, so
// copying it would leak a raw placeholder into the UI. They stay gaps.
//   hideColumn     MRT "Hide {column} column"        ours "Hide column"
//   dropToGroupBy  MRT "Drop to group by {column}"   ours "Drag a column here..."
//   filterMode     MRT "Filter Mode: {filterType}"   ours "Filter mode"

const MAPPING = {
  ...Object.fromEntries(SAME_NAME.map(same)),

  // By meaning
  selectAll: { mrt: "toggleSelectAll" },
  selectRow: { mrt: "toggleSelectRow" },
  rowsSelected: {
    template: "{selectedCountOfRowCountRowsSelected}",
    params: { selectedCount: "selected", rowCount: "total" },
  },
  paginationRange: { template: "{start}–{end} {of} {total}" },
  reorderColumn: { mrt: "move" },
  reorderRow: { mrt: "move" },
  pinRow: { mrt: "pin" },
  columnVisibility: { mrt: "showHideColumns" },
  toggleColumnVisibility: { mrt: "toggleVisibility" },
  globalFilterMode: { mrt: "changeSearchMode" },
  copied: { mrt: "copiedToClipboard" },

  filterModes: {
    object: {
      fuzzy: { mrt: "filterFuzzy" },
      contains: { mrt: "filterContains" },
      startsWith: { mrt: "filterStartsWith" },
      endsWith: { mrt: "filterEndsWith" },
      equals: { mrt: "filterEquals" },
      notEquals: { mrt: "filterNotEquals" },
      empty: { mrt: "filterEmpty" },
      notEmpty: { mrt: "filterNotEmpty" },
      between: { mrt: "filterBetween" },
      betweenInclusive: { mrt: "filterBetweenInclusive" },
      greaterThan: { mrt: "filterGreaterThan" },
      greaterThanOrEqualTo: { mrt: "filterGreaterThanOrEqualTo" },
      lessThan: { mrt: "filterLessThan" },
      lessThanOrEqualTo: { mrt: "filterLessThanOrEqualTo" },
      equalsString: { mrt: "filterEqualsString" },
      arrIncludesSome: { mrt: "filterArrIncludesSome" },
      equalsBool: { mrt: "filterEquals" },
      before: { gap: true },
      after: { gap: true },
      betweenDates: { gap: true },
    },
  },
  advancedFilterOperators: {
    object: {
      contains: { mrt: "filterContains" },
      startsWith: { mrt: "filterStartsWith" },
      endsWith: { mrt: "filterEndsWith" },
      equals: { mrt: "filterEquals" },
      notEquals: { mrt: "filterNotEquals" },
      isEmpty: { mrt: "filterEmpty" },
      isNotEmpty: { mrt: "filterNotEmpty" },
      greaterThan: { mrt: "filterGreaterThan" },
      greaterThanOrEqual: { mrt: "filterGreaterThanOrEqualTo" },
      lessThan: { mrt: "filterLessThan" },
      lessThanOrEqual: { mrt: "filterLessThanOrEqualTo" },
      between: { mrt: "filterBetween" },
      notContains: { gap: true },
    },
  },
}

// Everything else is a gap. Listed explicitly so `print-gaps.mjs` can tell a
// deliberate gap from a key that was forgotten.
const GAP_KEYS = [
  "sortAscending",
  "sortDescending",
  "sortedAscending",
  "sortedDescending",
  "hideColumn",
  "unpinRow",
  "resizeColumn",
  "dropToGroupBy",
  "toggleRowExpanded",
  "filterMode",
  "filterPlaceholder",
  "showColumnFilters",
  "hideColumnFilters",
  "pickDate",
  "pickDateRange",
  "true",
  "false",
  "advancedFilters",
  "advancedFiltersMatchLabel",
  "advancedFiltersMatchAll",
  "advancedFiltersMatchAny",
  "advancedFiltersOf",
  "advancedFiltersAddRule",
  "advancedFiltersApply",
  "advancedFiltersClearAll",
  "advancedFiltersColumn",
  "advancedFiltersOperator",
  "advancedFiltersValue",
  "advancedFiltersEmpty",
  "removeFilterRule",
  "searchPlaceholder",
  "densityComfortable",
  "densityCompact",
  "densitySpacious",
  "enterFullscreen",
  "exitFullscreen",
  "goToPage",
  "delete",
  "create",
  "createNewRow",
  "editRow",
  "required",
  "cellActions",
  "loading",
  "loadingMore",
  "dragStart",
  "dragOver",
  "dragEnd",
  "dragCancel",
  "dragInstructions",
  "dragRowLabel",
]

for (const key of GAP_KEYS) {
  if (key in MAPPING) throw new Error(`mapping: "${key}" is mapped and a gap`)
  MAPPING[key] = { gap: true }
}

export default MAPPING
