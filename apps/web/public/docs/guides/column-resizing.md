# Column resizing

Set `enableColumnResizing: true` to add a drag handle on each column's edge. Users drag the handle to widen or narrow a column.

Example (`column-resizing`):

```tsx
function ColumnResizingExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableColumnResizing: true,
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
  enableColumnResizing: true,
})

return <DataTable table={table} />
```

## Resize mode

The resize mode defaults to `"onChange"`, so columns resize live as the handle moves. Pass TanStack's `columnResizeMode: "onEnd"` to defer the resize until the handle is released.

```tsx
const table = useDataTable({
  data,
  columns,
  enableColumnResizing: true,
  columnResizeMode: "onEnd",
})
```

## Width constraints

Column widths come from `size`, `minSize`, and `maxSize` on the column definition.

```tsx
const columns = [
  { accessorKey: "firstName", size: 200, minSize: 120, maxSize: 320 },
]
```

> **Set sensible bounds:** Define `minSize` and `maxSize` so users cannot collapse or stretch a column
>   past a usable width.

## Auto-sizing

Double-click a column's resize handle to size it to fit its widest value — header and data, across the full dataset (not just the rows currently on screen). This is on by default whenever `enableColumnResizing` is set, and respects each column's `minSize`/`maxSize` bounds.

Set `enableColumnAutosize: false` to turn it off; double-clicking the handle then resets the column to its default size instead.

```tsx
const table = useDataTable({
  data,
  columns,
  enableColumnResizing: true,
  enableColumnAutosize: true, // default: matches enableColumnResizing
})
```

You can also trigger it imperatively from the table instance:

```tsx
table.autoSizeColumn("firstName")
table.autoSizeAllColumns()
```

Example (`column-autosize`):

```tsx
function ColumnAutosizeExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableColumnResizing: true,
    enableColumnAutosize: true,
    initialState: { pagination: { pageSize: 10 } },
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        size="sm"
        variant="outline"
        onClick={() => table.autoSizeAllColumns()}
      >
        Fit all columns
      </Button>
    ),
  })
  return <DataTable table={table} />
}
```

## Related

- [Column options](/docs/api/column-options)
- [useDataTable options](/docs/api/use-data-table)
