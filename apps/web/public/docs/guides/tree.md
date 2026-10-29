# Tree data

For hierarchical data, provide TanStack Table's `getSubRows` to tell the table where each row's children live. Expansion turns on automatically.

Example (`tree`):

```tsx
function TreeExample() {
  const data = React.useMemo(() => orgData, [])
  const columns = React.useMemo(() => orgColumns, [])
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getSubRows: (row) => row.subRows,
    enablePagination: false,
    initialState: { expanded: true },
  })
  return <DataTable table={table} />
}
```

## Usage

Return the children array from each row. Set `initialState.expanded: true` to start fully expanded, and usually disable pagination so the tree isn't split across pages.

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  getSubRows: (row) => row.subRows,
  enablePagination: false,
  initialState: {
    expanded: true,
  },
})

return <DataTable table={table} />
```

> **Indentation:** Use `row.depth` inside a cell renderer to indent child rows so the hierarchy reads clearly.

## Expand-all toggle

The expand column's header toggles every row. Hide it with `enableExpandAll: false`.

## Related

- [Detail panel](/docs/guides/detail-panel)
- [Grouping & aggregation](/docs/guides/grouping)
