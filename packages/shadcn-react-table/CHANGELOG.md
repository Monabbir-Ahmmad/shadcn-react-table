# Changelog

The version applies to the registry block: `/r/data-table.json` carries it
in `meta.version`. After installing, record the version you received —
see the [updating guide](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/updating).

## Unreleased

- **Changed (breaking):** the component that calls `useDataTable` no longer
  re-renders when the table's state changes; `<DataTable>` subscribes to what
  it shows. Code that reads the state during that component's render (a
  "3 selected" label) needs `stateSelector: (state) => state.rowSelection`, or
  `table.Subscribe` around the part that shows it. Event handlers, effects and
  the table's render props are unaffected.
- **Added:** `stateSelector` option: re-render the component holding the table
  when the selected part of the state changes.
- **Added:** the table's UI state is TanStack table state: `density`,
  `isFullscreen`, `showColumnFilters`, `columnFilterModes`,
  `globalFilterMode`, `advancedFilter`, `showAdvancedFilterPanel`,
  `editingCell`, `editingRowId`, `isCreating`, `rowDraft` and `direction` are
  in `table.getState()`, take `initialState` and controlled `state`, and reset
  with `table.reset()`. New callbacks `onColumnFilterModesChange`,
  `onShowAdvancedFilterPanelChange`, `onEditingCellChange`,
  `onEditingRowIdChange`, `onIsCreatingChange` and `onRowDraftChange`; the
  existing props (`density`, `onDensityChange`, `defaultDensity`, …) still
  work.
- **Changed:** parts of the table re-render only for the state they show, and
  each row for its own selection and editing state. On 1,000 rows: selecting a
  row takes ~9 ms instead of ~57 ms, typing in a row editor ~4.5 ms instead of
  ~56 ms; sorting is ~10% faster.
- **Added:** 37 locales (38 languages with English), each its own registry
  item: `data-table-locale-<lang>`. Translations are adapted from Material
  React Table; lines marked "needs review" await a native speaker.
- **Added:** localization keys `language`, `true`, `false`, `dragStart`,
  `dragOver`, `dragEnd`, `dragCancel`, `dragInstructions`, `dragRowLabel`.
- **Changed:** `range` / `range-slider` filters default to `betweenInclusive`
  (rows equal to a bound are kept, as in Material React Table).
- **Changed:** the column `fuzzy` filter mode now matches fuzzily, like the
  global search (it was a plain substring match); it does not reorder rows.
- **Changed:** date filters treat the chosen date as a whole day: `after`
  excludes the whole chosen day, `betweenDates` includes the whole end day.
- **Changed:** the page index is clamped to the last page when the row count
  shrinks (not while loading).
- **Changed:** a consumer-supplied `globalFilterFn` should keep a stable
  identity; a new function each render now re-filters every render.
- **Changed:** English numbers in row counts and pagination now show `1,000`;
  each locale formats its own numbers; date filters and the date picker follow
  `language` (Gregorian calendar); drag-and-drop announcements use column
  labels and row positions.
- **Changed:** `DataTableLocalization` has ten new required keys (the nine
  above plus `advancedFiltersMatch`). A custom localization that spreads
  `defaultLocalization` (or a locale) keeps compiling; one written out in full
  needs the new keys.
- **Fixed:** clicks on controls inside a row (edit, save, cancel, row-action
  menu and its items, expand, pin, copy, drag handle, inline editors) no longer
  also fire `onRowClick` / `onCellClick`.
- **Fixed:** picking a value in a `select` cell editor saves that value (cell
  mode exited without saving; table mode saved the previous pick).
- **Fixed:** columns nested inside header groups now get their variant's
  default filter mode and are excluded from auto-highlighting when they have a
  custom `cell`.
- **Fixed:** `enableRowPinning` without `enableRowNumbers` renders a pin column.
- **Fixed:** footer cells are opaque (sticky / pinned footers no longer show
  body text through) and honor `meta.align`.
- **Fixed:** `enableFilters: false` also ignores filters supplied through `state`.
- **Fixed:** a consumer `ref` on `<DataTable>` no longer disables
  `refs.tablePaperRef`.
- **Fixed:** switching a column's filter mode when it has no value no longer
  emits an `onColumnFiltersChange`.
- **Fixed:** the global search box follows `setGlobalFilter` /
  `resetGlobalFilter` and controlled state.
- **Fixed:** the edit modal closes instead of throwing when the edited row
  leaves `data`.
- **Fixed:** column ids with spaces or punctuation no longer break resizable
  column widths.
- **Fixed:** changing the global filter mode re-filters the rows.
- **Fixed:** the block compiles on `@tanstack/react-table` 9.3 (two row-model
  casts failed `tsc` in fresh installs). The registry now asks for `^9.3.1`.
- **Fixed:** pinned columns stay visible while scrolling sideways with column
  virtualization on, and the table can scroll all the way to its last column.
- **Fixed:** keyboard navigation reaches every row and column with
  virtualization on, skips over open detail panels, and keeps a single Tab stop.
- **Fixed:** `rowHeight` / `getRowHeight` set the whole row's height (the cell
  padding was added on top).
- **Fixed:** infinite scroll no longer misses the bottom when the browser
  reports several visibility changes at once.
- **Fixed:** grouped (multi-level) headers and footers line up with their
  columns under column virtualization.
- **Fixed:** keyboard navigation keeps working after the focused cell is
  scrolled out of a virtualized table.
- **Fixed:** grouped headers render a single column filter row (an empty row
  was added per group level).
- **Fixed:** date filters read date-only values (`"2025-01-10"`) as that local
  day; west of UTC they matched the previous day.
- **Fixed:** double-clicks on in-row controls no longer fire
  `onRowDoubleClick` / `onCellDoubleClick`.
- **Fixed:** with `enableFilters: false`, cells no longer highlight filter or
  search text kept in state.
- **Fixed:** the expand and row-actions columns no longer show a column drag
  grip.
- **Fixed:** column ids that differ only in non-ASCII letters (`fødsel`,
  `fådsel`) no longer share a resize width.
- **Fixed:** picking an option in a select editor keeps a numeric column's
  value a number.
- **Fixed:** the date filter pickers open on the selected month, not today's.
- **Added:** column reordering works with column virtualization.
- **Fixed:** the search box keeps what the user is typing when a controlled
  `globalFilter` stores earlier keystrokes late (router or async state).
- **Fixed:** drag-and-drop announcements count rows across pages and name the
  group drop zone ("Group by Name") instead of its internal id.
- **Fixed:** page buttons, page-size options and row numbers use the
  language's digits (Persian, Nepali…), like the rest of the pagination text.
- **Added:** right-to-left layouts. The table follows `dir="rtl"` on itself or
  an ancestor: columns, pinned columns, resizing, chevrons, arrow keys and
  column virtualization all mirror. See the Right-to-left guide.
- **Changed:** cell and header alignment use logical classes: `meta.align`
  `"left"` / `"right"` mean the start / end of the cell (`text-start` /
  `text-end`), and pinned columns use `inset-inline-start` / `-end`. Left-to-
  right tables look the same.
- **Added:** with keyboard navigation on (the default) the table is an ARIA
  grid: `role="grid"`, `aria-rowcount` / `aria-colcount`, `aria-rowindex` on
  rows, `aria-colindex` on cells and `aria-selected` on selectable rows. Tests
  that query `getByRole("table")` need `getByRole("grid")`.
- **Added:** cell commands: Enter or F2 activates the focused cell's control
  (opens its editor), PageUp / PageDown move a screen of rows, Ctrl+C / Cmd+C
  copies the cell's text.
- **Added:** focus stays in the table when the focused element goes away: an
  inline editor closing, save / cancel buttons disappearing, or a deleted row.
- **Added:** full screen is a modal dialog: Escape leaves, Tab stays inside,
  the page behind stops scrolling, and focus returns afterwards.
- **Added:** `aria-busy` on the table and a screen-reader status message while
  loading.
- **Changed:** body rows re-render only when their own state (selection,
  expansion, pinning, editing) or something table-wide changes, so selecting a
  row or editing a cell no longer re-renders every row. Row and cell click
  handlers always call the latest callback.
- **Added:** `direction` on the table instance (`"ltr"` or `"rtl"`, measured
  from the page).
- **Changed:** the advanced filter sentence is one localization key,
  `advancedFiltersMatch: (logic) => string`, so each language can place the
  All/Any picker where its grammar needs it. `advancedFiltersMatchLabel` and
  `advancedFiltersOf` are deprecated and unused; a custom localization that
  spreads `defaultLocalization` (or a locale) keeps compiling.

## 0.5.0

- **Breaking — TanStack Table v9:** the engine now runs on
  `@tanstack/react-table` v9 (native `useTable` with every built-in feature,
  row model, and sort/filter/aggregation function registered, so behaviour
  matches 0.4.x). Re-add the block to pick up the new dependencies. See the
  [upgrade guide](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/updating).
- **New `DataTableColumnDef<TData>` type** (plus `DataTableRow`,
  `DataTableColumn`, `DataTableCell`, `DataTableHeader`, `DataTableState`,
  `DataTableColumnPinningState`, `DataTableFeatures`). Type your columns with
  `DataTableColumnDef` instead of TanStack's `ColumnDef`, which now needs a
  feature-set parameter.
- **Unchanged API:** column pinning in `initialState` / `state` /
  `onColumnPinningChange` and in `table.getState()` keeps `left` / `right`, and
  the value returned by `table.getState()` keeps its `columnSizingInfo` name
  (the `columnSizingInfo` options below are renamed). The table instance keeps a
  stable identity across renders, and render contexts
  (`cell: ({ table }) => …`, likewise `header`, `footer`, `aggregatedCell`)
  still receive the enriched instance and are typed as such, so
  `table.getState()` and `table.tableInstance` type-check and work as before.
- **Removed options:** `getCoreRowModel` and the other `get*RowModel` options;
  the table wires every row model itself.
- **Instance APIs follow TanStack v9:** `column.pin("start" | "end")`,
  `column.getIsPinned()` returns `"start" | "end"`, and
  `getPrePaginationRowModel()` is now `getPrePaginatedRowModel()` and
  `getPaginationRowModel()` is now `getPaginatedRowModel()`. `getLeft*` /
  `getRight*` are `getStart*` / `getEnd*` (leaf columns, visible cells, header
  groups, total size), and `column.getStart("left")` / `column.getAfter("right")`
  take `"start"` / `"end"`. Custom aggregation functions use
  `constructAggregationFn({ aggregate })`.
- **Renamed options reach you too:** the column option `sortingFn` is now
  `sortFn`, and `state.columnSizingInfo`, `initialState.columnSizingInfo` and
  `onColumnSizingInfoChange` are now `columnResizing` and
  `onColumnResizingChange`.
- **Removed options:** `filterFns`, `sortingFns` and `aggregationFns`. Pass
  custom functions inline on the column (`filterFn`, `sortFn`,
  `aggregationFn`); built-in string names still work. Type inline filter
  functions with the exported `DataTableFilterFn<TData>`.
- **Row type must satisfy `RowData`:** TanStack v9 requires
  `Record<string, any> | Array<any>`, so `unknown` is no longer accepted.
  `DataTableInstance<unknown>` and `useDataTable<unknown>` need a concrete row
  type; `DataTableInstance` with no type argument now defaults to `RowData`.
- **`table.options`** is now the options object the table was created with on
  each render (TanStack v9's React adapter behaviour), not TanStack's
  internally merged options with feature defaults.
- **Type registration:** the block's types register a small TanStack feature
  (`dataTableInstanceFeature`) through TanStack's `Plugins` /
  `Table_FeatureMap` interfaces, scoped to tables built with the block's
  feature set. Other TanStack tables in your app are unaffected, except ones
  typed `Table<any, …>`.

## 0.4.2

- **Changed default (surface color):** the table surface, header and body
  cells now use the shadcn card color (`bg-card`) instead of the page
  background, so the table matches a `<Card>` out of the box. No visible change
  in the default light theme; in dark mode the table reads as a raised card.
  Restore the old look for one table with
  `surfaceClassName="[--card:var(--background)]"`.
- **Fix (row hover and state highlights):** body cells are opaque (so pinned
  columns cover scrolled content), which hid the row's hover, open-menu and
  dragging highlights. Rows now publish their tint as `--row-tint` and cells
  paint it over the card, so hover, open-menu, selected and dragging states all
  show — including on rows with `onRowClick`.
- **Fix (pinned columns on selected rows):** selected-row cells no longer turn
  transparent, so content scrolled under a pinned column stays hidden. The
  selected accent bar now sits on the row's first cell.

## 0.4.1

- **Fix (infinite scroll):** the load trigger now fires when the table is
  scrolled horizontally. The bottom sentinel is pinned to the horizontal
  viewport (`position: sticky; left: 0`) so a wide, horizontally-scrolled table
  still registers the intersection and requests the next chunk.
- **Changed default:** `enableStickyFooter` now defaults to `false` (was `true`).
  `enableStickyHeader` still defaults to `true`; opt into a pinned footer
  explicitly when you have an aggregation/footer row.

## 0.4.0

- **Infinite row loading** (`enableInfiniteScroll`): append the next chunk of
  rows as the user scrolls near the bottom, driven by controlled
  `onLoadMore` / `hasNextPage` / `isFetchingNextPage` props (maps directly onto
  TanStack Query's `useInfiniteQuery`). A bottom sentinel + `IntersectionObserver`
  triggers the load; `infiniteScrollThreshold` (px, default 200) sets the
  prefetch distance. Enabling it hides the pager and renders one growing page.
  Works with or without row virtualization. New `loadingMore` localization
  string. See the [infinite scroll guide](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/infinite-scroll).
- **Row height control** (`rowHeight`, `getRowHeight`): set a flat pixel height
  for every row, or a per-row height via `getRowHeight(row) => number | "auto" |
null`. `"auto"` wraps and grows the row to fit its content — even with column
  resizing on (which otherwise clips cells to one line); a number pins the row
  and clips overflow. Per-row heights feed the virtualizer estimate, and `"auto"`
  rows are measured after render so variable heights virtualize accurately. See
  the [row height guide](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/row-height).

## 0.3.0

- While `enableStickyHeader` is on (the default), the scroll surface now gets
  a default viewport-bound max-height
  (`clamp(350px, calc(100dvh - 200px), 9999px)`), so tall content (long
  groups, trees, detail panels) scrolls internally under the pinned header
  instead of stretching the page — matching MRT's sticky-implies-bounded
  behavior. Override the bound with any `max-h-*` via `surfaceClassName`, or
  remove it (and the pinning) with `enableStickyHeader: false`.

## 0.2.0

- **Breaking:** removed the built-in export feature — `enableExport`,
  `exportFileName`, `exportToCsv` / `exportToExcel`, `DataTableExportMenu`,
  the `export` / `exportCsv` / `exportExcel` localization strings, and the
  `export` / `fileCsv` / `fileExcel` icons — along with the `papaparse` and
  `xlsx` dependencies. MRT ships no OOTB export either; the export guide now
  documents a bring-your-own recipe built on the table state model.

## 0.1.0

- CSV and Excel export engines (`papaparse`, `xlsx`) now load on demand
  instead of shipping in the initial bundle.
- CSV export neutralizes formula injection: string cells starting with
  `=`, `+`, `-`, `@`, tab, or CR are prefixed with `'`.
- `exportToCsv` / `exportToExcel` are now async (`Promise<void>`).
- Fixed `useControllableState` so functional updates queued in the same
  React batch chain correctly instead of overwriting each other.
- The registry item now carries its version in `meta.version`.
