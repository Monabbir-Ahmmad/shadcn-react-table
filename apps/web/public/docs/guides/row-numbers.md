# Row numbers

Set `enableRowNumbers: true` to add a leading row-number column to the table.

Example (`row-numbers`):

```tsx
function RowNumbersExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowNumbers: true,
    rowNumberMode: "static",
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
  enableRowNumbers: true,
})

return <DataTable table={table} />
```

## Numbering mode

`rowNumberMode` controls how the numbers are computed:

- `"static"` (default) numbers the current view and is page-aware, so the first visible row on each page restarts the count appropriately.
- `"original"` uses the source row index, so each row keeps the same number regardless of sorting or pagination.

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableRowNumbers: true,
  rowNumberMode: "original",
})
```

> **Pairs with row pinning:** The row-number column is also where the pin toggle lives, so it works well alongside row pinning.

## Related

- [useDataTable options](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/use-data-table): useDataTable(options) accepts everything TanStack's TableOptions accepts (controlled state, on*Change, manual* flags, getRowId, getSubRows, initialState, …; column pinning in state/initialState keeps the left/right shape) plus the data-table options below.
- [Table instance](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/table-instance): useDataTable returns the standard TanStack table instance with three additions: the table's UI state in table.getState() (density, editing, filter modes…), methods to change it on table itself, and the resolved options and DOM refs on table.dataTable.
- [Row pinning](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/row-pinning): Set enableRowPinning: true to add a pin toggle inside the row-number column.
