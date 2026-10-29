# Column visibility

A "Columns" toggle in the toolbar lets users show or hide columns. Each column-actions menu also has a Hide item for the same effect.

Example (`column-visibility`):

```tsx
function ColumnVisibilityExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: {
      columnVisibility: { startDate: false, progress: false },
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
})

return <DataTable table={table} />
```

## Initial hidden columns
Hide columns from the start with `initialState.columnVisibility`, mapping a column id to `false`.

```tsx
const table = useDataTable({
  data,
  columns,
  initialState: {
    columnVisibility: { startDate: false },
  },
})
```

## Prevent hiding a column
Use TanStack's `enableHiding: false` on a column definition to keep it always visible. It will not appear in the toggle or expose a Hide item.

```tsx
const columns = [
  { accessorKey: "firstName", enableHiding: false },
]
```

> **Always-on columns:** Columns with `enableHiding: false` stay rendered regardless of toolbar or menu actions.

## Leaving a column out of the menu

Set `meta.visibleInShowHideMenu: false` to keep a column out of the show / hide columns menu while still letting it be hidden from code (`column.toggleVisibility`).

## Related

<Cards>
  <Card href="/docs/guides/density" title="Density" />
  <Card href="/docs/api/use-data-table" title="useDataTable options" />
  <Card href="/docs/api/column-options" title="Column options" />
</Cards>
