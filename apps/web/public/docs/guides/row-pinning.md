# Row pinning

Set `enableRowPinning: true` to add a pin toggle inside the row-number column. Pinned rows stick to the top while you scroll the rest of the table.

Because the toggle lives in the row-number column, row pinning pairs with `enableRowNumbers: true`.

Example (`row-pinning`):

```tsx
function RowPinningExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowNumbers: true,
    enableRowPinning: true,
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
  enableRowPinning: true,
})

return <DataTable table={table} />
```

> **Enable row numbers:** Turn on `enableRowNumbers` so the pin toggle has a column to live in.

## Related

- [useDataTable options](/docs/api/use-data-table)
- [Table instance](/docs/api/table-instance)
- [Row numbers](/docs/guides/row-numbers)
