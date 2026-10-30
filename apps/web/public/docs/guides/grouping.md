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

Example (`multi-aggregation`):

```tsx
function MultiAggregationExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = React.useMemo<DataTableColumnDef<User>[]>(
    () => [
      { accessorKey: "department", header: "Department" },
      { accessorKey: "firstName", header: "First name" },
      {
        accessorKey: "salary",
        header: "Salary",
        aggregationFn: ["sum", "mean", "max"],
        cell: ({ getValue }) => currency.format(getValue() as number),
        meta: { align: "right" },
      },
      { accessorKey: "age", header: "Age", aggregationFn: ["min", "max"] },
    ],
    []
  )
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableGrouping: true,
    initialState: {
      grouping: ["department"],
      pagination: { pageIndex: 0, pageSize: 20 },
    },
  })
  return <DataTable table={table} />
}
```

## Grouped column mode

TanStack's `groupedColumnMode` decides where a grouped column goes: `"reorder"` (default) moves it first, `"remove"` hides it, and `false` leaves it in place.

Example (`grouped-column-mode`):

```tsx
function GroupedColumnModeExample() {
  const [mode, setMode] = React.useState<false | "reorder" | "remove">(
    "reorder"
  )
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableGrouping: true,
    // TanStack's own option: move grouped columns first, hide them, or leave them.
    groupedColumnMode: mode,
    initialState: {
      grouping: ["department"],
      expanded: true,
      pagination: { pageIndex: 0, pageSize: 20 },
    },
  })
  return (
    <div className="flex flex-col gap-3">
      <Choice
        label="groupedColumnMode"
        value={mode}
        options={GROUPED_MODES}
        onChange={setMode}
      />
      <DataTable table={table} />
    </div>
  )
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

Example (`customized-grouping`):

```tsx
function CustomizedGroupingExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = React.useMemo<DataTableColumnDef<User>[]>(
    () =>
      userColumns().map((column) =>
        "accessorKey" in column && column.accessorKey === "department"
          ? {
              ...column,
              meta: {
                ...column.meta,
                // A custom group header: name, count and total salary.
                renderGroupedCell: ({ row }) => (
                  <span className="flex items-center gap-2">
                    <span className="font-medium">
                      {String(row.getValue("department"))}
                    </span>
                    <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground">
                      {row.subRows.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {currency.format(
                        row.subRows.reduce(
                          (sum, r) => sum + (r.original as User).salary,
                          0
                        )
                      )}
                    </span>
                  </span>
                ),
              },
            }
          : column
      ),
    []
  )
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableGrouping: true,
    initialState: {
      grouping: ["department"],
      density: "compact",
      pagination: { pageIndex: 0, pageSize: 20 },
    },
  })
  return <DataTable table={table} />
}
```

## Related

- [Sticky header & footer](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/sticky): The header row (enableStickyHeader, default true) sticks to the top of the scroll surface.
- [Column options](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/column-options): Per-column configuration lives on the standard TanStack columnDef.meta object, which the table augments with the fields below (fully typed wherever meta is read).
