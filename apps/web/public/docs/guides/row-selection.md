# Row selection

Set `enableRowSelection: true` to add a leading checkbox column. When rows are selected, a selection alert banner appears showing the current count.

`enableRowSelection` accepts a boolean or a `(row) => boolean` predicate (standard TanStack), so you can allow selecting only certain rows.

> **Stable selection keys:** Always provide `getRowId` so selection keys stay stable across re-renders,
>   sorting, and pagination. Without it, selection is keyed by row index and can
>   drift.

## row-selection

Multi-row selection with a select-all checkbox in the header.

Example (`row-selection`):

```tsx
function RowSelectionExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}
```

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableRowSelection: true,
})

return <DataTable table={table} />
```

Read the current selection at any time. To show it in your own component's render, subscribe to it with `stateSelector` (the component holding the table does not re-render on table changes by default; see [State management](/docs/guides/state#reading-state-in-your-component)):

```tsx
const table = useDataTable({
  // …
  enableRowSelection: true,
  stateSelector: (state) => state.rowSelection,
})

const selected = table.getState().rowSelection
```

Or control it from your own state:

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableRowSelection: true,
  state: { rowSelection },
  onRowSelectionChange: setRowSelection,
})
```

You can also gate selection per row with a predicate:

```tsx
enableRowSelection: (row) => row.original.status !== "archived"
```

## single-selection

For single selection, add `enableMultiRowSelection: false`. The checkboxes become radio buttons and the select-all checkbox goes away.

Example (`single-selection`):

```tsx
function SingleSelectionExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    enableMultiRowSelection: false,
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}
```

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableRowSelection: true,
  enableMultiRowSelection: false,
})

return <DataTable table={table} />
```

## Selecting a range

Click one row's checkbox, then shift-click another: every row between them takes the same state — selected, or cleared if the shift-clicked row was selected. Ranges follow the rows as displayed (sorted and filtered). Turn it off with `enableBatchRowSelection: false`.

Example (`selection-actions`):

```tsx
function SelectionActionsExample() {
  const [data, setData] = React.useState(() => baseUsers.slice(0, 20))
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    initialState: { pagination: { pageSize: 10 } },
    renderTopToolbarCustomActions: ({ table }) => (
      <table.Subscribe selector={(state) => state.rowSelection}>
        {(selection) => {
          const count = Object.keys(selection).length
          return (
            <Button
              size="sm"
              variant="destructive"
              disabled={count === 0}
              onClick={() => {
                setData((prev) => prev.filter((user) => !selection[user.id]))
                table.resetRowSelection()
              }}
            >
              <RiDeleteBinLine />
              Delete {count > 0 ? count : ""}
            </Button>
          )
        }}
      </table.Subscribe>
    ),
  })
  return <DataTable table={table} />
}
```

## Select-all behavior

The selection column header carries a select-all checkbox. `selectAllMode` controls its scope — `"page"` (default) toggles the current page, `"all"` toggles every row across pages. Set `enableSelectAll: false` to hide the header checkbox entirely.

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableRowSelection: true,
  selectAllMode: "all", // "page" | "all"
  enableSelectAll: true,
})
```

## Where the selection banner shows

`positionToolbarAlertBanner` places the banner with the selected count and **Clear selection**: `"top"` (default, between the toolbar and the table), `"bottom"` (under the table), `"head-overlay"` or `"none"`.

With `"head-overlay"` (as in Material React Table) the banner lies over the header row instead, with the select-all checkbox at its start, so selecting rows never pushes the table down. It stays over a sticky header while the table scrolls, spans the visible width when it scrolls sideways, and goes away when nothing is selected, leaving the header clickable again. If you Tab into a header control while it shows, it steps aside until focus leaves the header row. It needs the table head (`enableTableHead`).

Example (`selection-banner-overlay`):

```tsx
function SelectionBannerOverlayExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    positionToolbarAlertBanner: "head-overlay",
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}
```

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableRowSelection: true,
  positionToolbarAlertBanner: "head-overlay", // "top" | "bottom" | "head-overlay" | "none"
})
```

## Relevant options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `enableSelectAll` | `boolean` | `true` | Show the select-all checkbox in the selection column header. Default true. |
| `selectAllMode` | `"page" \| "all"` | `"page"` | Select-all scope for the header checkbox: the current page ("page", default) or every row ("all"). |
| `enableBatchRowSelection` | `boolean` | `true` | Shift-click a row's checkbox to select (or clear) every row since the last one clicked. Default true. |
| `positionToolbarAlertBanner` | `"top" \| "bottom" \| "head-overlay" \| "none"` | `"top"` | Where the row-selection alert banner renders: above the table (`"top"`, default), below it (`"bottom"`), over the header row (`"head-overlay"`, with the select-all checkbox, so selecting rows does not move the table; needs the table head), or nowhere (`"none"`). |

## Related

- [useDataTable options](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/use-data-table): useDataTable(options) accepts everything TanStack's TableOptions accepts (controlled state, on*Change, manual* flags, getRowId, getSubRows, initialState, …; column pinning in state/initialState keeps the left/right shape) plus the data-table options below.
- [Table instance](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/table-instance): useDataTable returns the standard TanStack table instance with three additions: the table's UI state in table.getState() (density, editing, filter modes…), methods to change it on table itself, and the resolved options and DOM refs on table.dataTable.
- [Export](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/export): The table ships no built-in export — the same stance as Material React Table — so the block carries no CSV or spreadsheet dependencies.
