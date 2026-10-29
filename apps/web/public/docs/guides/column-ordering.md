# Column ordering

Set `enableColumnOrdering: true` to add a drag grip to each header. Users can grab the grip and drag a column to a new position.

Example (`column-ordering`):

```tsx
function ColumnOrderingExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableColumnOrdering: true,
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
  enableColumnOrdering: true,
})

return <DataTable table={table} />
```

## Initial order
Provide the starting order with `initialState.columnOrder`, an array of column ids.

```tsx
const table = useDataTable({
  data,
  columns,
  enableColumnOrdering: true,
  initialState: {
    columnOrder: ["firstName", "lastName", "salary"],
  },
})
```

> **Pair with pinning:** Pinned columns stay anchored while the rest reorder. Combine ordering with pinning to keep key columns in view.

## Related
- [Column pinning](/docs/guides/column-pinning)
- [useDataTable options](/docs/api/use-data-table)
- [Column options](/docs/api/column-options)
