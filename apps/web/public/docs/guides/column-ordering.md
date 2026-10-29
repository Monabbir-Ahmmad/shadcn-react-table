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

## While you drag

The whole column moves with its header — body, filter and footer cells included — and the other columns slide aside to show where it will land. The movement comes from CSS variables on the scroll surface, so dragging doesn't re-render any rows. With "reduce motion" turned on in the operating system, the columns move without the slide animation.

Example (`column-drag`):

```tsx
function ColumnDragExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    // Drag a header's grip: the whole column follows and the others make room.
    enableColumnOrdering: true,
    enableColumnPinning: true,
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
  })
  return <DataTable table={table} />
}
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

<Cards>
  <Card href="/docs/guides/column-pinning" title="Column pinning" />
  <Card href="/docs/api/use-data-table" title="useDataTable options" />
  <Card href="/docs/api/column-options" title="Column options" />
</Cards>
