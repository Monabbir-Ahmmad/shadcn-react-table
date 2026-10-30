# Column pinning

Set `enableColumnPinning: true` to let users pin columns left or right from the column-actions menu. Pinned columns stay sticky while the table scrolls horizontally, with a solid line and a soft shadow on their inner edge.

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

- [Column ordering](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/column-ordering): Set enableColumnOrdering: true to add a drag grip to each header.
- [Sticky](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/sticky): The header row (enableStickyHeader, default true) sticks to the top of the scroll surface.
- [useDataTable options](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/use-data-table): useDataTable(options) accepts everything TanStack's TableOptions accepts (controlled state, on*Change, manual* flags, getRowId, getSubRows, initialState, …; column pinning in state/initialState keeps the left/right shape) plus the data-table options below.
