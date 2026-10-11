# Changelog

The version applies to the registry block: `/r/data-table.json` carries it
in `meta.version`. After installing, record the version you received —
see the [updating guide](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/updating).

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
  `getState().columnSizingInfo` keeps its name. The table instance keeps a
  stable identity across renders, and render contexts
  (`cell: ({ table }) => …`, likewise `header`, `footer`, `aggregatedCell`)
  still receive the enriched instance and are typed as such, so
  `table.getState()` and `table.tableInstance` type-check and work as before.
- **Removed options:** `getCoreRowModel` and the other `get*RowModel` options;
  the table wires every row model itself.
- **Instance APIs follow TanStack v9:** `column.pin("start" | "end")`,
  `column.getIsPinned()` returns `"start" | "end"`, and
  `getPrePaginationRowModel()` is now `getPrePaginatedRowModel()`. Custom
  aggregation functions use `constructAggregationFn({ aggregate })`.
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
