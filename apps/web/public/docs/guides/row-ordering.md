# Row ordering

Set `enableRowOrdering: true` to add a drag-handle column for drag-and-drop row reordering.

You own the data: the table reports the move via `onRowOrderChange: (activeRowId, overRowId) => void`, and it is up to you to reorder your array. Provide `getRowId` so the ids passed to the callback are stable, and typically set `enablePagination: false` so dragging spans the full list.

Example (`row-ordering`):

```tsx
function RowOrderingExample() {
  const [data, setData] = React.useState(() => makeUsers(12))
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowOrdering: true,
    enablePagination: false,
    onRowOrderChange: (activeId, overId) =>
      setData((prev) => {
        const from = prev.findIndex((r) => r.id === activeId)
        const to = prev.findIndex((r) => r.id === overId)
        if (from === -1 || to === -1) return prev
        const next = [...prev]
        const [moved] = next.splice(from, 1)
        if (moved) next.splice(to, 0, moved)
        return next
      }),
  })
  return <DataTable table={table} />
}
```

```tsx
const [data, setData] = useState(initialData)

const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableRowOrdering: true,
  enablePagination: false,
  onRowOrderChange: (activeRowId, overRowId) => {
    setData((prev) => {
      const next = [...prev]
      const from = next.findIndex((row) => row.id === activeRowId)
      const to = next.findIndex((row) => row.id === overRowId)
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  },
})

return <DataTable table={table} />
```

> **Not compatible with virtualization:** Row drag-and-drop is incompatible with row virtualization. Disable virtualization when you enable row ordering.

## Related

- [useDataTable options](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/use-data-table): useDataTable(options) accepts everything TanStack's TableOptions accepts (controlled state, on*Change, manual* flags, getRowId, getSubRows, initialState, …; column pinning in state/initialState keeps the left/right shape) plus the data-table options below.
- [Table instance](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/table-instance): useDataTable returns the standard TanStack table instance with three additions: the table's UI state in table.getState() (density, editing, filter modes…), methods to change it on table itself, and the resolved options and DOM refs on table.dataTable.
- [Row selection](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/row-selection): Set enableRowSelection: true to add a leading checkbox column.
