# Column pinning

Set `enableColumnPinning: true` to let users pin columns left or right from the column-actions menu. Pinned columns stay sticky while the table scrolls horizontally.

Example (`column-pinning`):

```tsx
function ColumnPinningExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableColumnPinning: true,
    initialState: {
      columnPinning: { left: ["firstName"], right: ["salary"] },
      pagination: { pageSize: 10 },
    },
  })
  return <DataTable table={table} />
}
```

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableColumnPinning: true,
})

return <DataTable table={table} />
```

## Initial pins
Pin columns from the start with `initialState.columnPinning`, grouping ids into `left` and `right`.

```tsx
const table = useDataTable({
  data,
  columns,
  enableColumnPinning: true,
  initialState: {
    columnPinning: {
      left: ["firstName"],
      right: ["salary"],
    },
  },
})
```

Table options and `table.getState()` use `left` / `right`, while instance methods such as `column.pin` and `column.getIsPinned` use TanStack v9's `start` / `end`.

> **Sticky positioning:** Pinned columns rely on the same sticky behavior used elsewhere in the table. See the sticky guide for how that interacts with headers and footers.

## Related

<Cards>
  <Card href="/docs/guides/column-ordering" title="Column ordering" />
  <Card href="/docs/guides/sticky" title="Sticky" />
  <Card href="/docs/api/use-data-table" title="useDataTable options" />
</Cards>
