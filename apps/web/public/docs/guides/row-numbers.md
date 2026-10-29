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

<Cards>
  <Card href="/docs/api/use-data-table" title="useDataTable options" />
  <Card href="/docs/api/table-instance" title="Table instance" />
  <Card href="/docs/guides/row-pinning" title="Row pinning" />
</Cards>
