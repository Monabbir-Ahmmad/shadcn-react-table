# Display columns

Some features add columns of their own: row selection, the expand toggle, row actions, row numbers, row pinning and the row drag handle. Change any of them with `displayColumnDefOptions`, keyed by the column's id — it takes the same options as your own columns.

| Column | Id | Added by |
| --- | --- | --- |
| Selection checkboxes | `cn-select` | `enableRowSelection` |
| Expand toggle | `cn-expand` | `renderDetailPanel`, `getSubRows` |
| Row actions | `cn-row-actions` | `renderRowActions`, `renderRowActionMenuItems`, row / modal editing |
| Row numbers | `cn-row-number` | `enableRowNumbers` |
| Row pin button | `cn-row-pin` | `enableRowPinning` (without row numbers) |
| Drag handle | `cn-row-drag` | `enableRowOrdering` |

```tsx
const table = useDataTable({
  data,
  columns,
  enableRowNumbers: true,
  enableRowSelection: true,
  displayColumnDefOptions: {
    "cn-row-number": {
      header: "#",
      size: 56,
      cell: ({ row }) => <span className="text-muted-foreground">{row.index + 1}</span>,
    },
    "cn-select": { size: 44 },
  },
})
```

To change all of them at once, use `defaultDisplayColumn`; per-id options apply on top of it.

```tsx
useDataTable({
  data,
  columns,
  defaultDisplayColumn: { enableResizing: false, meta: { align: "center" } },
})
```

`meta` is merged with the column's own, so you only list what you change. The column ids are fixed; use them in `initialState.columnPinning` or `columnOrder` too.

> **Memoize for speed:** Inline options work, but a new object on every render also re-renders every row. Define them outside your component, or wrap them in `useMemo`, to skip that.

Example (`display-columns`):

```tsx
function DisplayColumnsExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowNumbers: true,
    enableRowSelection: true,
    initialState: { pagination: { pageSize: 10 } },
    displayColumnDefOptions: {
      "cn-row-number": {
        header: "#",
        size: 56,
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {row.index + 1}
          </span>
        ),
      },
      "cn-select": { size: 40 },
    },
  })
  return <DataTable table={table} />
}
```

## Related

- [Row selection](/docs/guides/row-selection)
- [Row actions](/docs/guides/row-actions)
- [Row numbers](/docs/guides/row-numbers)
