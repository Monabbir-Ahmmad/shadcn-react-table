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

## Relevant options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `enableSelectAll` | `boolean` | `true` | Show the select-all checkbox in the selection column header. Default true. |
| `selectAllMode` | `"page" \| "all"` | `"page"` | Select-all scope for the header checkbox: the current page ("page", default) or every row ("all"). |
| `enableBatchRowSelection` | `boolean` | `true` | Shift-click a row's checkbox to select (or clear) every row since the last one clicked. Default true. |

## Related

- [useDataTable options](/docs/api/use-data-table)
- [Table instance](/docs/api/table-instance)
- [Export](/docs/guides/export)
