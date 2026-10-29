# Grouping & aggregation

Set `enableGrouping: true` to let users group rows by a column. Once enabled, users can drag a column header onto the drop-to-group zone, or pick **Group by** from a column's actions menu.

Example (`grouping`):

```tsx
function GroupingExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableGrouping: true,
    enableStickyFooter: true,
    initialState: {
      grouping: ["department"],
      expanded: true,
      pagination: { pageSize: 50 },
    },
  })
  return <DataTable table={table} />
}
```

## Initial groups

Seed the grouped state with `initialState.grouping` and expand all groups on first render with `initialState.expanded`.

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableGrouping: true,
  initialState: {
    grouping: ["department"],
    expanded: true,
  },
})

return <DataTable table={table} />
```

## Aggregations

Aggregations use the standard TanStack Table column options. Set `aggregationFn` to a built-in (`"sum"`, `"mean"`, ...), a custom function (built with TanStack v9's `constructAggregationFn({ aggregate })`), or the name of one registered with the `aggregationFns` option (see below), render the rolled-up value with `aggregatedCell`, and add a `footer` for a grand total.

```tsx
const columns = [
  {
    accessorKey: "salary",
    header: "Salary",
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => (
      <strong>{formatCurrency(getValue<number>())}</strong>
    ),
    footer: ({ table }) => {
      const total = table
        .getRowModel()
        .rows.reduce((sum, row) => sum + row.getValue<number>("salary"), 0)
      return <strong>{formatCurrency(total)}</strong>
    },
  },
]
```

To reuse an aggregation across columns, register it by name with `aggregationFns`. Each entry has an `aggregate` function that receives the group's `rows` and a `getValue(row)` helper:

```tsx
const table = useDataTable({
  data,
  columns: [
    { accessorKey: "department", header: "Department" },
    { accessorKey: "salary", header: "Salary", aggregationFn: "spread" },
  ],
  aggregationFns: {
    spread: {
      aggregate: ({ rows, getValue }) => {
        const values = rows.map((row) => Number(getValue(row)))
        return Math.max(...values) - Math.min(...values)
      },
    },
  },
  enableGrouping: true,
})
```

Pass several aggregations as an array and each result shows with its label — `Sum 4,000 · Mean 2,000`, with numbers in the table's language. Rename the labels with `localization.aggregationFns`, or render them yourself with `aggregatedCell`, which receives every result (`getValue()` returns `{ sum, mean }`).

```tsx
{
  accessorKey: "salary",
  header: "Salary",
  aggregationFn: ["sum", "mean"],
}
```

> **Keep totals in view:** Grouping pairs well with a pinned footer. Add `enableStickyFooter: true` so
>   the grand total stays visible while scrolling long groups.

Example (`custom-aggregation`):

```tsx
function CustomAggregationExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = React.useMemo<DataTableColumnDef<User>[]>(
    () => [
      { accessorKey: "department", header: "Department" },
      { accessorKey: "firstName", header: "First name" },
      {
        accessorKey: "salary",
        header: "Salary",
        aggregationFn: "spread",
        cell: ({ getValue }) => currency.format(getValue() as number),
        aggregatedCell: ({ getValue }) => (
          <span className="text-muted-foreground">
            spread {currency.format(getValue() as number)}
          </span>
        ),
        meta: { align: "right" },
      },
    ],
    []
  )
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableGrouping: true,
    // The gap between the highest and lowest salary in each group.
    aggregationFns: {
      spread: {
        aggregate: ({ rows, getValue }) => {
          const values = rows.map((row) => Number(getValue(row)))
          return Math.max(...values) - Math.min(...values)
        },
      },
    },
    initialState: { grouping: ["department"], pagination: { pageSize: 20 } },
  })
  return <DataTable table={table} />
}
```

## Custom group cells

For finer control over how grouped rows render, the column `meta` exposes render hooks that receive the full table instance: `renderGroupedCell` (the group-header cell), `renderAggregatedCell` (overrides `aggregatedCell`), and `renderPlaceholderCell` (cells with no value because another column owns the group; empty by default).

```tsx
{
  accessorKey: "department",
  header: "Department",
  meta: {
    renderGroupedCell: ({ row }) => (
      <span className="font-medium">
        {row.getValue("department")} · {row.subRows.length}
      </span>
    ),
  },
}
```

## Related

- [Sticky header & footer](/docs/guides/sticky)
- [Column options](/docs/api/column-options)
