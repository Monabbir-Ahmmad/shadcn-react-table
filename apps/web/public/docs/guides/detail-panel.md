# Detail panel

Provide `renderDetailPanel` to render an expandable panel beneath each row. An expand chevron column is added automatically, and row expansion is enabled for you.

Example (`detail-panel`):

```tsx
function DetailPanelExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageSize: 10 } },
    renderDetailPanel: ({ row }) => (
      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <Field label="City">{row.original.city}</Field>
        <Field label="Country">{row.original.country}</Field>
        <Field label="Start date">
          {row.original.startDate.toLocaleDateString()}
        </Field>
        <Field label="Salary">{currency.format(row.original.salary)}</Field>
      </dl>
    ),
  })
  return <DataTable table={table} />
}
```

## Usage

`renderDetailPanel` receives `{ row, table }`. Return any React node — here a small definition list built from `row.original`.

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  renderDetailPanel: ({ row }) => (
    <dl className="grid grid-cols-2 gap-2 p-4">
      <dt className="text-muted-foreground">Email</dt>
      <dd>{row.original.email}</dd>
      <dt className="text-muted-foreground">Phone</dt>
      <dd>{row.original.phone}</dd>
      <dt className="text-muted-foreground">Address</dt>
      <dd>{row.original.address}</dd>
    </dl>
  ),
})

return <DataTable table={table} />
```

> **Expansion is automatic:** You don't need to configure `getExpandedRowModel` or add a chevron column
>   yourself — defining `renderDetailPanel` turns on row expansion and inserts the
>   expander column.

## Charts and lazy content

The panel renders only while the row is expanded, so it can hold anything — a chart, or content that loads when the row opens.

Example (`chart-detail-panel`):

```tsx
function ChartDetailPanelExample() {
  const data = React.useMemo(() => baseUsers.slice(0, 10), [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enablePagination: false,
    renderDetailPanel: ({ row }) => {
      // Deterministic monthly hours per person.
      const seed = Number(row.original.id.replace(/\D/g, ""))
      const hours = MONTHS.map((month, i) => ({
        month,
        hours: 120 + ((seed * (i + 3)) % 60),
      }))
      return (
        <ChartContainer
          config={{ hours: { label: "Hours", color: "var(--chart-1)" } }}
          className="h-40 w-full max-w-xl"
        >
          <BarChart data={hours}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <Bar dataKey="hours" fill="var(--color-hours)" radius={4} />
          </BarChart>
        </ChartContainer>
      )
    },
  })
  return <DataTable table={table} />
}
```

Example (`lazy-detail-panel`):

```tsx
function LazyDetailPanelExample() {
  const data = React.useMemo(() => baseUsers.slice(0, 10), [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enablePagination: false,
    // The panel mounts on expand, so it loads only then.
    renderDetailPanel: ({ row }) => <LazyDetails user={row.original} />,
  })
  return <DataTable table={table} />
}
```

## Positioning the expander

The expander column leads the data columns by default. Set `positionExpandColumn: "last"` to move it to the trailing edge.

```tsx
useDataTable({
  renderDetailPanel: ({ row }) => <Detail row={row} />,
  positionExpandColumn: "last", // "first" | "last"
})
```

## Related

<Cards>
  <Card href="/docs/guides/tree" title="Tree data" />
</Cards>
