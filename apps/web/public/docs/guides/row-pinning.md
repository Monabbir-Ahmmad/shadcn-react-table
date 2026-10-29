# Row pinning

Set `enableRowPinning: true` to add a pin toggle inside the row-number column. Pinned rows stick to the top while you scroll the rest of the table.

Because the toggle lives in the row-number column, row pinning pairs with `enableRowNumbers: true`.

Example (`row-pinning`):

```tsx
function RowPinningExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowNumbers: true,
    enableRowPinning: true,
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
  enableRowNumbers: true,
  enableRowPinning: true,
})

return <DataTable table={table} />
```

> **Enable row numbers:** Turn on `enableRowNumbers` so the pin toggle has a column to live in.

## Display modes

`rowPinningDisplayMode` sets where pinned rows show and how rows get pinned:

| Mode | Pinned rows | Pinned by |
| --- | --- | --- |
| `"top-and-bottom"` (default) | Stay in view above (or below) the other rows while scrolling | The pin button (to the top), or `row.pin("bottom")` |
| `"top"` / `"bottom"` | The same | The pin button, to that side |
| `"static"` | Listed first (or last), and scroll away with the rest | The pin button |
| `"select-top"` / `"select-bottom"` | Stay in view on that side | Selecting the row; deselecting unpins it. No pin buttons |

```tsx
useDataTable({
  data,
  columns,
  enableRowSelection: true,
  enableRowPinning: true,
  rowPinningDisplayMode: "select-top", // selected rows stay in view at the top
})
```

Sticky pinned rows need a bounded scroll surface, which the table has by default (see [Sticky header & footer](/docs/guides/sticky)).

## Related

- [useDataTable options](/docs/api/use-data-table)
- [Table instance](/docs/api/table-instance)
- [Row numbers](/docs/guides/row-numbers)
