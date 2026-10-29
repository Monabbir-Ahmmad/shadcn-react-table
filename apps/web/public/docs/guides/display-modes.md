# Display modes

Several features expose a `*DisplayMode` option that changes _how_ the UI is presented without changing the underlying behavior. Each defaults to the current look, so setting them is always opt-in.

## Pagination display mode

`paginationDisplayMode` controls the pagination control style:

- `"default"` — a `start–end of total` range label with first / previous / next / last buttons.
- `"pages"` — numbered page buttons (with previous / next and collapsed ellipses for long ranges).
- `"custom"` — renders nothing; supply your own via `renderBottomToolbarCustomActions`.

```tsx
const table = useDataTable({
  data,
  columns,
  paginationDisplayMode: "pages",
})
```

Example (`pagination-pages`):

```tsx
function PaginationPagesExample() {
  const data = React.useMemo(() => makeUsers(120), [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    paginationDisplayMode: "pages",
    positionPagination: "both",
    pageSizeOptions: [5, 10, 20],
    initialState: { pagination: { pageSize: 5 } },
  })
  return <DataTable table={table} />
}
```

## Column filter display mode

`columnFilterDisplayMode` controls where per-column filter inputs live:

- `"subheader"` — a filter row beneath the header (toggled by the toolbar funnel button).
- `"popover"` — a filter button on each filterable column header that opens the filter in a popover. The toolbar funnel and the "filter by" menu item are hidden in this mode.
- `"custom"` — neither is rendered; supply your own filter UI per column via `meta.renderColumnFilter`.

```tsx
const table = useDataTable({
  data,
  columns,
  columnFilterDisplayMode: "popover",
})
```

Example (`popover-filters`):

```tsx
function PopoverFiltersExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    // Each header gets a filter button that opens its field, Excel-style.
    columnFilterDisplayMode: "popover",
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  })
  return <DataTable table={table} />
}
```

Example (`custom-filter-sidebar`):

```tsx
function CustomFilterSidebarExample() {
  const data = React.useMemo(() => baseUsers, [])
  const table = useDataTable({
    data,
    columns: FACETED_COLUMNS,
    getRowId: (row) => row.id,
    // Filter fields render where you put them.
    columnFilterDisplayMode: "custom",
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  })
  return (
    <DataTableProvider table={table}>
      <div className="flex flex-col gap-4 md:flex-row">
        <aside className="flex w-full shrink-0 flex-col gap-3 md:w-56">
          <h3 className="text-sm font-medium">Filters</h3>
          <table.Subscribe selector={(state) => state.columnFilters}>
            {() =>
              table
                .getFlatHeaders()
                .filter((header) => header.column.getCanFilter())
                .map((header) => (
                  <label
                    key={header.id}
                    className="flex flex-col gap-1 text-xs"
                  >
                    <span className="text-muted-foreground">
                      {String(header.column.columnDef.header)}
                    </span>
                    <DataTableColumnFilter header={header} table={table} />
                  </label>
                ))
            }
          </table.Subscribe>
        </aside>
        <div className="min-w-0 flex-1">
          <DataTable table={table} />
        </div>
      </div>
    </DataTableProvider>
  )
}
```

## Create display mode

`createDisplayMode` decouples the create form from `editDisplayMode`:

- `"modal"` — the create form opens in a dialog (default).
- `"row"` — an inline editable row appears at the top of the table, with Save / Cancel beneath it.
- `"custom"` — nothing is rendered; build your own UI from the `isCreating` / `rowDraft` instance state.

```tsx
const table = useDataTable({
  data,
  columns,
  enableEditing: true,
  createDisplayMode: "row",
  onCreatingRowSave: ({ values, exit }) => {
    // persist the new row, then:
    exit()
  },
})

// trigger the create form from a toolbar action:
// table.beginCreate()
```

> **editDisplayMode is independent:** `createDisplayMode` only affects the create flow. You can edit existing rows
>   inline (`editDisplayMode: "row"`) while creating new ones in a modal, or any
>   other combination.

## Relevant options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `paginationDisplayMode` | `PaginationDisplayMode` | `"default"` | Pagination control style: `"default"` (range label + first/prev/next/last buttons), `"pages"` (numbered page buttons), or `"custom"` (render your own via `renderBottomToolbarCustomActions`). Default "default". |
| `columnFilterDisplayMode` | `ColumnFilterDisplayMode` | `"subheader"` | Where column filter inputs live: `"subheader"` (a filter row under the header, default), `"popover"` (per-column popovers opened from the column header), or `"custom"` (you render them). |
| `createDisplayMode` | `CreateDisplayMode` | `"modal"` | How the create form is surfaced, independent of `editDisplayMode`: `"modal"` (dialog, default), `"row"` (an inline editable row at the top of the table), or `"custom"` (you render it from `isCreating` + `rowDraft`). |

## Related

- [Editing](/docs/guides/editing)
- [Column filtering](/docs/guides/column-filtering)
- [Toolbar customization](/docs/guides/toolbar)
- [useDataTable options](/docs/api/use-data-table)
