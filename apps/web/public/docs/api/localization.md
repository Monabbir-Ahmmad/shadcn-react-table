# Localization

Every user-facing string flows through a localization table. Override any subset per instance via `useDataTable({ localization })`, or app-wide via [`DataTableConfigProvider`](/docs/guides/custom-icons). Function-valued entries handle interpolation and plurals.

```tsx
const table = useDataTable({
  data,
  columns,
  localization: {
    search: "Buscar",
    rowsPerPage: "Filas por página",
    paginationRange: (start, end, total) => `${start}–${end} de ${total}`,
  },
})
```

See the [Localization guide](/docs/guides/localization) for a full example. The complete key set and English defaults:

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `language` | `string` | `en` | BCP 47 tag used to format dates (e.g. "en", "de"). Numbers are formatted by the function keys of each localization, with that file's own tag. |
| `selectAll` | `string` | `Select all` |  |
| `selectRow` | `string` | `Select row` |  |
| `clearSelection` | `string` | `Clear selection` |  |
| `rowsSelected` | `(selected: number, total: number) => string` | `(selected, total) => `${selected.toLocaleString("en")} of ${total.toLocaleString("en")} row${total === 1 ? "" : "s"} selected`` |  |
| `sortByColumnAsc` | `(column: string) => string` | `(column) => `Sort by ${column} ascending`` |  |
| `sortByColumnDesc` | `(column: string) => string` | `(column) => `Sort by ${column} descending`` |  |
| `sortAscending` | `string` | `Sort ascending` |  |
| `sortDescending` | `string` | `Sort descending` |  |
| `clearSort` | `string` | `Clear sort` |  |
| `sortedAscending` | `string` | `Sorted ascending` |  |
| `sortedDescending` | `string` | `Sorted descending` |  |
| `columnActions` | `string` | `Column actions` |  |
| `hideColumn` | `string` | `Hide column` |  |
| `showAllColumns` | `string` | `Show all columns` |  |
| `pinToLeft` | `string` | `Pin to left` |  |
| `pinToRight` | `string` | `Pin to right` |  |
| `unpin` | `string` | `Unpin` |  |
| `reorderColumn` | `string` | `Reorder column` |  |
| `reorderRow` | `string` | `Reorder row` |  |
| `pinRow` | `string` | `Pin row` |  |
| `unpinRow` | `string` | `Unpin row` |  |
| `resizeColumn` | `string` | `Resize column` |  |
| `groupByColumn` | `(column: string) => string` | `(column) => `Group by ${column}`` |  |
| `ungroupByColumn` | `(column: string) => string` | `(column) => `Ungroup by ${column}`` |  |
| `groupedBy` | `string` | `Grouped by` |  |
| `dropToGroupBy` | `string` | `Drag a column here to group by it` |  |
| `expand` | `string` | `Expand` |  |
| `collapse` | `string` | `Collapse` |  |
| `expandAll` | `string` | `Expand all` |  |
| `collapseAll` | `string` | `Collapse all` |  |
| `toggleRowExpanded` | `string` | `Toggle row expanded` |  |
| `columnVisibility` | `string` | `Column visibility` |  |
| `toggleColumnVisibility` | `string` | `Toggle column visibility` |  |
| `filterByColumn` | `(column: string) => string` | `(column) => `Filter by ${column}`` |  |
| `clearFilter` | `string` | `Clear filter` |  |
| `filterMode` | `string` | `Filter mode` |  |
| `changeFilterMode` | `string` | `Change filter mode` |  |
| `filterPlaceholder` | `(column: string) => string` | `(column) => `Filter ${column}…`` |  |
| `showColumnFilters` | `string` | `Show filters` |  |
| `hideColumnFilters` | `string` | `Hide filters` |  |
| `min` | `string` | `Min` |  |
| `max` | `string` | `Max` |  |
| `pickDate` | `string` | `Pick a date` |  |
| `pickDateRange` | `string` | `Pick a date range` |  |
| `true` | `string` | `True` |  |
| `false` | `string` | `False` |  |
| `filterModes` | `Record<string, string>` | `{     fuzzy: "Fuzzy",     contains: "Contains",     startsWith: "Starts with",     endsWith: "Ends with",     equals: "Equals",     notEquals: "Not equals",     empty: "Empty",     notEmpty: "Not empty",     between: "Between (exclusive)",     betweenInclusive: "Between (inclusive)",     greaterThan: "Greater than",     greaterThanOrEqualTo: "Greater than or equal to",     lessThan: "Less than",     lessThanOrEqualTo: "Less than or equal to",     before: "Before",     after: "After",     betweenDates: "Between",     equalsString: "Equals",     arrIncludesSome: "Includes",     equalsBool: "Equals",   }` | Labels for each filter mode, keyed by the `FilterMode` string. |
| `advancedFilters` | `string` | `Advanced filters` |  |
| `advancedFiltersMatch` | `(logic: string) => string` | `(logic) => `Match ${logic} of the following rules`` | The "Match All/Any of the following rules" sentence; `logic` marks where the All/Any picker goes, so each language can order the words. |
| `advancedFiltersMatchAll` | `string` | `All` |  |
| `advancedFiltersMatchAny` | `string` | `Any` |  |
| `advancedFiltersAddRule` | `string` | `Add filter` |  |
| `advancedFiltersApply` | `string` | `Apply` |  |
| `advancedFiltersClearAll` | `string` | `Clear all` |  |
| `advancedFiltersColumn` | `string` | `Column` |  |
| `advancedFiltersOperator` | `string` | `Operator` |  |
| `advancedFiltersValue` | `string` | `Value` |  |
| `advancedFiltersEmpty` | `string` | `No filters yet. Add one to get started.` |  |
| `removeFilterRule` | `string` | `Remove filter` |  |
| `advancedFilterOperators` | `Record<string, string>` | `{     contains: "contains",     notContains: "does not contain",     startsWith: "starts with",     endsWith: "ends with",     equals: "equals",     notEquals: "does not equal",     isEmpty: "is empty",     isNotEmpty: "is not empty",     greaterThan: "greater than",     greaterThanOrEqual: "greater than or equal",     lessThan: "less than",     lessThanOrEqual: "less than or equal",     between: "is between",   }` | Operator labels, keyed by `AdvancedFilterOperator`. |
| `search` | `string` | `Search` |  |
| `searchPlaceholder` | `string` | `Search…` |  |
| `clearSearch` | `string` | `Clear search` |  |
| `globalFilterMode` | `string` | `Search mode` |  |
| `toggleDensity` | `string` | `Toggle density` |  |
| `densityComfortable` | `string` | `Comfortable` |  |
| `densityCompact` | `string` | `Compact` |  |
| `densitySpacious` | `string` | `Spacious` |  |
| `enterFullscreen` | `string` | `Enter full screen` |  |
| `exitFullscreen` | `string` | `Exit full screen` |  |
| `rowsPerPage` | `string` | `Rows per page` |  |
| `paginationRange` | `(start: number, end: number, total: number) => string` | `(start, end, total) => `${start.toLocaleString("en")}–${end.toLocaleString("en")} of ${total.toLocaleString("en")}`` |  |
| `goToFirstPage` | `string` | `Go to first page` |  |
| `goToPreviousPage` | `string` | `Go to previous page` |  |
| `goToNextPage` | `string` | `Go to next page` |  |
| `goToLastPage` | `string` | `Go to last page` |  |
| `goToPage` | `(page: number) => string` | `(page) => `Go to page ${page.toLocaleString("en")}`` |  |
| `rowActions` | `string` | `Row actions` |  |
| `edit` | `string` | `Edit` |  |
| `save` | `string` | `Save` |  |
| `cancel` | `string` | `Cancel` |  |
| `delete` | `string` | `Delete` |  |
| `create` | `string` | `Create` |  |
| `createNewRow` | `string` | `Create new row` |  |
| `editRow` | `string` | `Edit row` |  |
| `required` | `string` | `Required` |  |
| `copy` | `string` | `Copy` |  |
| `copied` | `string` | `Copied` |  |
| `cellActions` | `string` | `Cell actions` |  |
| `noRecordsToDisplay` | `string` | `No records to display` |  |
| `loading` | `string` | `Loading…` |  |
| `loadingMore` | `string` | `Loading more…` |  |
| `dragStart` | `(label: string) => string` | `(label) => `Picked up ${label}.`` |  |
| `dragOver` | `(label: string, over: string) => string` | `(label, over) => `${label} is over ${over}.`` |  |
| `dragEnd` | `(label: string, over: string) => string` | `(label, over) => `${label} was dropped on ${over}.`` |  |
| `dragCancel` | `(label: string) => string` | `(label) => `Dragging was cancelled. ${label} was dropped.`` |  |
| `dragInstructions` | `string` | `To pick up an item, press space or enter. While dragging, use the arrow keys to move it. Press space or enter again to drop it, or press escape to cancel.` |  |
| `dragRowLabel` | `(position: number) => string` | `(position) => `Row ${position.toLocaleString("en")}`` |  |
