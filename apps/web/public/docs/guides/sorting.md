# Sorting

Sorting is on by default. Click a column header to cycle ascending → descending → unsorted; the header shows the current direction and the column-actions menu offers explicit sort/clear items.

Example (`basic`):

```tsx
function BasicExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}
```

## Multi-column sorting

Enable `enableMultiSort` to sort by several columns at once (shift-click headers). An order badge indicates each column's position in the sort.

```tsx
const table = useDataTable({
  data,
  columns,
  enableMultiSort: true,
  initialState: {
    sorting: [
      { id: "department", desc: false },
      { id: "salary", desc: true },
    ],
  },
})
```

Example (`sorting`):

```tsx
function SortingExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableMultiSort: true,
    initialState: {
      sorting: [
        { id: "department", desc: false },
        { id: "salary", desc: true },
      ],
      pagination: { pageSize: 10 },
    },
  })
  return <DataTable table={table} />
}
```

## Per-column control

Sorting is standard TanStack, so the usual column knobs apply:

- `enableSorting: false` — disable sorting for a column.
- `sortDescFirst: true` — start from descending (handy for numeric columns).
- `sortFn` — a built-in sort function's name, a comparator, or the name of one of your own from the `sortFns` option.

```tsx
const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: "id", header: "ID", enableSorting: false },
  { accessorKey: "salary", header: "Salary", sortDescFirst: true },
]
```

To reuse a comparator across columns, register it by name with `sortFns`:

```tsx
const PRIORITY = ["low", "medium", "high"]

const table = useDataTable({
  data,
  columns: [{ accessorKey: "priority", header: "Priority", sortFn: "byPriority" }],
  sortFns: {
    byPriority: (rowA, rowB, columnId) =>
      PRIORITY.indexOf(rowA.getValue(columnId)) -
      PRIORITY.indexOf(rowB.getValue(columnId)),
  },
})
```

## Controlled sorting

Pass `state.sorting` and `onSortingChange` to control it yourself — for example to sort on the server (`manualSorting: true`).

```tsx
const [sorting, setSorting] = React.useState([])
const table = useDataTable({
  data,
  columns,
  state: { sorting },
  onSortingChange: setSorting,
  manualSorting: true,
})
```

## Related

- [useDataTable options](/docs/api/use-data-table) — `enableMultiSort` and other sort flags pass through to TanStack.
- TanStack Table [sorting guide](https://tanstack.com/table/latest).
