/**
 * Localization string table for the data table. Every user-facing string
 * (labels, aria text, pagination range) flows through here so the table can be
 * fully translated. Function-valued entries handle interpolation/plurals.
 *
 * Default is English. Override per instance via `useDataTable({ localization })`.
 */
export interface DataTableLocalization {
  // Selection
  selectAll: string
  selectRow: string
  clearSelection: string
  rowsSelected: (selected: number, total: number) => string

  // Sorting
  sortByColumnAsc: (column: string) => string
  sortByColumnDesc: (column: string) => string
  sortAscending: string
  sortDescending: string
  clearSort: string
  sortedAscending: string
  sortedDescending: string

  // Column actions
  columnActions: string
  hideColumn: string
  showAllColumns: string
  pinToLeft: string
  pinToRight: string
  unpin: string
  reorderColumn: string
  reorderRow: string
  pinRow: string
  unpinRow: string
  resizeColumn: string

  // Grouping / expansion
  groupByColumn: (column: string) => string
  ungroupByColumn: (column: string) => string
  groupedBy: string
  dropToGroupBy: string
  expand: string
  collapse: string
  expandAll: string
  collapseAll: string
  toggleRowExpanded: string

  // Column visibility
  columnVisibility: string
  toggleColumnVisibility: string

  // Filtering
  filterByColumn: (column: string) => string
  clearFilter: string
  filterMode: string
  changeFilterMode: string
  filterPlaceholder: (column: string) => string
  showColumnFilters: string
  hideColumnFilters: string
  min: string
  max: string
  pickDate: string
  pickDateRange: string
  /** Labels for each filter mode, keyed by the `FilterMode` string. */
  filterModes: Record<string, string>

  // Advanced filter panel
  advancedFilters: string
  advancedFiltersMatchLabel: string
  advancedFiltersMatchAll: string
  advancedFiltersMatchAny: string
  advancedFiltersOf: string
  advancedFiltersAddRule: string
  advancedFiltersApply: string
  advancedFiltersClearAll: string
  advancedFiltersColumn: string
  advancedFiltersOperator: string
  advancedFiltersValue: string
  advancedFiltersEmpty: string
  removeFilterRule: string
  /** Operator labels, keyed by `AdvancedFilterOperator`. */
  advancedFilterOperators: Record<string, string>

  // Global search
  search: string
  searchPlaceholder: string
  clearSearch: string
  globalFilterMode: string

  // Density
  toggleDensity: string
  densityComfortable: string
  densityCompact: string
  densitySpacious: string

  // Full screen
  enterFullscreen: string
  exitFullscreen: string

  // Pagination
  rowsPerPage: string
  paginationRange: (start: number, end: number, total: number) => string
  goToFirstPage: string
  goToPreviousPage: string
  goToNextPage: string
  goToLastPage: string
  goToPage: (page: number) => string

  // Editing / actions
  rowActions: string
  edit: string
  save: string
  cancel: string
  delete: string
  create: string
  createNewRow: string
  editRow: string
  required: string
  copy: string
  copied: string
  cellActions: string

  // Empty / loading
  noRecordsToDisplay: string
  loading: string
}

export const defaultLocalization: DataTableLocalization = {
  selectAll: "Select all",
  selectRow: "Select row",
  clearSelection: "Clear selection",
  rowsSelected: (selected, total) =>
    `${selected} of ${total} row${total === 1 ? "" : "s"} selected`,

  sortByColumnAsc: (column) => `Sort by ${column} ascending`,
  sortByColumnDesc: (column) => `Sort by ${column} descending`,
  sortAscending: "Sort ascending",
  sortDescending: "Sort descending",
  clearSort: "Clear sort",
  sortedAscending: "Sorted ascending",
  sortedDescending: "Sorted descending",

  columnActions: "Column actions",
  hideColumn: "Hide column",
  showAllColumns: "Show all columns",
  pinToLeft: "Pin to left",
  pinToRight: "Pin to right",
  unpin: "Unpin",
  reorderColumn: "Reorder column",
  reorderRow: "Reorder row",
  pinRow: "Pin row",
  unpinRow: "Unpin row",
  resizeColumn: "Resize column",

  groupByColumn: (column) => `Group by ${column}`,
  ungroupByColumn: (column) => `Ungroup by ${column}`,
  groupedBy: "Grouped by",
  dropToGroupBy: "Drag a column here to group by it",
  expand: "Expand",
  collapse: "Collapse",
  expandAll: "Expand all",
  collapseAll: "Collapse all",
  toggleRowExpanded: "Toggle row expanded",

  columnVisibility: "Column visibility",
  toggleColumnVisibility: "Toggle column visibility",

  filterByColumn: (column) => `Filter by ${column}`,
  clearFilter: "Clear filter",
  filterMode: "Filter mode",
  changeFilterMode: "Change filter mode",
  filterPlaceholder: (column) => `Filter ${column}…`,
  showColumnFilters: "Show filters",
  hideColumnFilters: "Hide filters",
  min: "Min",
  max: "Max",
  pickDate: "Pick a date",
  pickDateRange: "Pick a date range",
  filterModes: {
    fuzzy: "Fuzzy",
    contains: "Contains",
    startsWith: "Starts with",
    endsWith: "Ends with",
    equals: "Equals",
    notEquals: "Not equals",
    empty: "Empty",
    notEmpty: "Not empty",
    between: "Between (exclusive)",
    betweenInclusive: "Between (inclusive)",
    greaterThan: "Greater than",
    greaterThanOrEqualTo: "Greater than or equal to",
    lessThan: "Less than",
    lessThanOrEqualTo: "Less than or equal to",
    before: "Before",
    after: "After",
    betweenDates: "Between",
    equalsString: "Equals",
    arrIncludesSome: "Includes",
    equalsBool: "Equals",
  },

  advancedFilters: "Advanced filters",
  advancedFiltersMatchLabel: "Match",
  advancedFiltersMatchAll: "All",
  advancedFiltersMatchAny: "Any",
  advancedFiltersOf: "of the following rules",
  advancedFiltersAddRule: "Add filter",
  advancedFiltersApply: "Apply",
  advancedFiltersClearAll: "Clear all",
  advancedFiltersColumn: "Column",
  advancedFiltersOperator: "Operator",
  advancedFiltersValue: "Value",
  advancedFiltersEmpty: "No filters yet. Add one to get started.",
  removeFilterRule: "Remove filter",
  advancedFilterOperators: {
    contains: "contains",
    notContains: "does not contain",
    startsWith: "starts with",
    endsWith: "ends with",
    equals: "equals",
    notEquals: "does not equal",
    isEmpty: "is empty",
    isNotEmpty: "is not empty",
    greaterThan: "greater than",
    greaterThanOrEqual: "greater than or equal",
    lessThan: "less than",
    lessThanOrEqual: "less than or equal",
    between: "is between",
  },

  search: "Search",
  searchPlaceholder: "Search…",
  clearSearch: "Clear search",
  globalFilterMode: "Search mode",

  toggleDensity: "Toggle density",
  densityComfortable: "Comfortable",
  densityCompact: "Compact",
  densitySpacious: "Spacious",

  enterFullscreen: "Enter full screen",
  exitFullscreen: "Exit full screen",

  rowsPerPage: "Rows per page",
  paginationRange: (start, end, total) => `${start}–${end} of ${total}`,
  goToFirstPage: "Go to first page",
  goToPreviousPage: "Go to previous page",
  goToNextPage: "Go to next page",
  goToLastPage: "Go to last page",
  goToPage: (page) => `Go to page ${page}`,

  rowActions: "Row actions",
  edit: "Edit",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  create: "Create",
  createNewRow: "Create new row",
  editRow: "Edit row",
  required: "Required",
  copy: "Copy",
  copied: "Copied",
  cellActions: "Cell actions",

  noRecordsToDisplay: "No records to display",
  loading: "Loading…",
}
