# Advanced filter

Set `enableAdvancedFilter: true` to add a toolbar button that opens a dialog where users build compound filter rules — multiple conditions joined by **All** (AND) or **Any** (OR) logic. The button badges the number of active rules.

Example (`advanced-filter`):

```tsx
function AdvancedFilterExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableAdvancedFilter: true,
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
  enableAdvancedFilter: true,
})

return <DataTable table={table} />
```

## How it works

Each rule is a `{ columnId, operator, value }`. The available operators adapt to the column's `meta.filterVariant`:

| Variant                   | Operators                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| `text` (default)          | contains, does not contain, starts with, ends with, equals, not equals, is empty, is not empty |
| `select` / `multi-select` | equals, not equals, is empty, is not empty                                                     |
| `range` / `range-slider`  | equals, not equals, `>`, `≥`, `<`, `≤`, between, is empty, is not empty                        |
| `date` / `date-range`     | equals, not equals, `>`, `<`, between, is empty, is not empty                                  |
| `checkbox`                | equals                                                                                         |

Build your rules in the dialog, then click **Apply** to filter the table. Closing or cancelling the dialog discards unapplied edits.

> **Additive to column filters:** The advanced filter is independent of the per-column filter row and global
>   search: a row must pass <em>all</em> active filter systems to be shown. Clear
>   the panel's rules (or use "Clear all") to remove just the advanced filters.

## Controlled usage

Drive the filter from your own state with `state.advancedFilter` + `onAdvancedFilterChange` (or seed an uncontrolled table with `initialState.advancedFilter`).

```tsx
const [filter, setFilter] = React.useState<AdvancedFilterGroup>({
  logic: "and",
  rules: [],
})

const table = useDataTable({
  data,
  columns,
  enableAdvancedFilter: true,
  state: { advancedFilter: filter },
  onAdvancedFilterChange: setFilter,
})
```

## Related

<Cards>
  <Card href="/docs/guides/column-filtering" title="Column filtering" />
  <Card href="/docs/guides/filter-modes" title="Filter modes" />
  <Card href="/docs/api/use-data-table" title="useDataTable options" />
</Cards>
