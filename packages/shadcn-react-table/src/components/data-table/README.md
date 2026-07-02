# Shadcn React Table

A shadcn/ui data table with Material React Table (MRT V3) parity, built on
TanStack Table v8. Import from `@monabbir/shadcn-react-table/components/data-table`.

```tsx
const table = useDataTable({ data, columns /* + feature flags */ })
return <DataTable table={table} />
```

`useDataTable` extends the full TanStack `TableOptions`, so anything TanStack
accepts (state, `getRowId`, `manual*` flags, row models) passes straight
through. Our presentation/feature options and UI state live on `table.tableInstance`.

## Feature flags (all opt-in unless noted)

| Area                   | Options                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Sorting                | TanStack defaults; `enableMultiSort`, `sortDescFirst` per column                                                                |
| Selection              | `enableRowSelection`, `enableMultiRowSelection` (auto select column + alert banner)                                             |
| Density / fullscreen   | on by default                                                                                                                   |
| Sticky header / footer | on by default (`enableStickyHeader` / `enableStickyFooter`); engages when the surface scrolls (give it a `max-h` or virtualize) |
| Column filters         | `meta.variant`, `meta.filterMode`, `enableColumnFilterModes`, `enableFilterMatchHighlighting`                                   |
| Global search          | `enableGlobalFilter` (fuzzy via match-sorter), `enableGlobalFilterModes`                                                        |
| Column mgmt            | `enableColumnOrdering`, `enableColumnPinning`, `enableColumnResizing`                                                           |
| Row mgmt               | `enableRowOrdering` + `onRowOrderChange`, `enableRowPinning`, `enableRowNumbers`                                                |
| Grouping               | `enableGrouping` (drop-zone + menu + aggregation rows)                                                                          |
| Expansion              | `renderDetailPanel`, `getSubRows` (tree); `enableExpanding` auto-derives                                                        |
| Footer row             | per-column `footer` (rendered whenever defined; sticky by default)                                                              |
| Editing                | `enableEditing`, `editDisplayMode` (`cell`/`row`/`table`/`modal`), `onEditCellSave`/`onSaveRow`/`onCreateRow`                   |
| Actions / copy         | `renderRowActions`, `renderCellActionMenuItems`, `enableClickToCopy`                                                            |
| Virtualization         | `enableRowVirtualization` and `enableColumnVirtualization` (give the surface a bounded height)                                  |
| Export                 | `enableExport` (CSV/Excel) or call `exportToCsv` / `exportToExcel`                                                              |
| Event listeners        | `onRowClick` / `onRowDoubleClick` / `onCellClick` / `onCellDoubleClick`                                                         |
| Custom icons           | `icons` (override any subset; see `DataTableIcons`)                                                                             |
| Column widths          | `columnDef.size` is honored even without resizing                                                                               |

## Server-side / manual mode

For server-driven data, set the TanStack `manual*` flags and feed state back:

```tsx
const table = useDataTable({
  data,
  columns,
  rowCount,                 // total rows on the server (required for paging)
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  state: { pagination, sorting, columnFilters, globalFilter },
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  onGlobalFilterChange,
})
```

Notes:

- **Debouncing.** Filter and global-search inputs debounce (~300ms) before
  firing `onChange` when `manualFiltering` is set, so each keystroke doesn't hit
  the server.
- **Faceting is client-only.** In manual mode, supply `select`/`multi-select`
  options via `meta.options` (faceted unique values aren't computed server-side).
- **Fuzzy ranking is off** in manual mode — ranking is the server's job.
- **Export** (`exportToCsv`/`exportToExcel`) only sees rows currently loaded in
  the table; for full-dataset export, fetch all rows server-side first.

## Stability requirements

- Pass **stable `data` and `columns` references** (`useMemo`/`useState`) — a new
  array identity every render causes infinite re-renders and lost state.
- Provide **`getRowId`** when using selection/expansion so state survives
  sorting/filtering/pagination (defaults to the row index otherwise).

## Theming

Token-only styling (inherits the host shadcn theme + dark mode). The only added
token is `--highlight` (match highlighting), shipped with a fallback to
`--accent`. See `styles/globals.css`.

## Notes

- Column virtualization applies fixed column widths and is not combined with
  column pinning/ordering or grouped (multi-row) headers.
- React Compiler is disabled around `useReactTable`/`useVirtualizer` (a known
  TanStack v8 interaction); the lint warning is expected and benign.
