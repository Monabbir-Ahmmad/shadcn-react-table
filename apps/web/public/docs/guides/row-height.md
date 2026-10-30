# Row height

By default rows size to their content (and the virtualizer measures them). For explicit control, set a flat `rowHeight` or a per-row `getRowHeight`.

Example (`auto-row-height`):

```tsx
function AutoRowHeightExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = React.useMemo<DataTableColumnDef<User>[]>(() => {
    const bio: DataTableColumnDef<User> = {
      id: "bio",
      header: "Bio",
      size: 300,
      accessorFn: (row) =>
        `${row.firstName} ${row.lastName} is a ${row.role} in ${row.department}, ` +
        `based in ${row.city}, ${row.country}. Reach them at ${row.email}.`,
      cell: ({ getValue }) => <span>{getValue<string>()}</span>,
    }
    return [...userColumns().slice(0, 3), bio]
  }, [])
  // getRowHeight: "auto" wraps and grows each row — even with resizing on.
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableColumnResizing: true,
    getRowHeight: () => "auto",
    initialState: { pagination: { pageSize: 8 } },
  })
  return <DataTable table={table} />
}
```

## Auto height (wrap & grow)

Return `"auto"` from `getRowHeight` to let a row wrap its content and grow to fit — even when column resizing is on (which otherwise clips cells to a single line).

```tsx
import { DataTable, useDataTable } from "@/components/ui/data-table"

const table = useDataTable({
  data,
  columns,
  enableColumnResizing: true,
  getRowHeight: () => "auto",
})

return <DataTable table={table} />
```

## Fixed height

A number pins the row to that pixel height and clips overflowing content. Use a flat `rowHeight` for every row, or return a number per row from `getRowHeight`.

```tsx
const table = useDataTable({
  data,
  columns,
  rowHeight: 64, // every row is 64px
})
```

```tsx
const table = useDataTable({
  data,
  columns,
  // Tall rows only where there's extra content; default height elsewhere.
  getRowHeight: (row) => (row.original.notes ? "auto" : 44),
})
```

Example (`fixed-row-height`):

```tsx
function FixedRowHeightExample() {
  const data = React.useMemo(() => makeUsers(200), [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableRowVirtualization: true,
    rowHeight: 36,
    slotProps: { surface: { className: "max-h-[420px]" } },
  })
  return <DataTable table={table} />
}
```

## Precedence

For each row: `getRowHeight(row)` wins unless it returns `null`/`undefined`, then `rowHeight`, then the density default.

> **Works with virtualization:** Per-row heights feed the row virtualizer's estimate; `"auto"` rows are
>   measured after render, so large virtualized datasets with variable heights
>   scroll accurately. See [Virtualization](/docs/guides/virtualization).

> **Per row, not per column:** `getRowHeight` sets the height of the whole row. There's no per-column wrap
>   toggle — an `"auto"` row wraps all of its cells.

## Relevant options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `rowHeight` | `number` |  | Flat height (px) applied to every row. Overridden per-row by `getRowHeight`. Also seeds the virtualizer estimate. |
| `getRowHeight` | `(row: DataTableRow<TData>) => number \| "auto" \| null` |  | Per-row height. Return a px number to pin the row, `"auto"` to let it wrap and grow to fit its content (even with column resizing on), or `null` to fall back to `rowHeight` / the density default. Applies to data rows. |
| `estimateRowHeight` | `number` | `52` | Estimated row height (px) for the virtualizer. Default 52. |

## Related

- [Virtualization](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/virtualization): Virtualization renders only the cells currently in view, keeping large tables fast.
- [Density](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/density): Density controls the vertical padding of table rows.
- [useDataTable options](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/use-data-table): useDataTable(options) accepts everything TanStack's TableOptions accepts (controlled state, on*Change, manual* flags, getRowId, getSubRows, initialState, …; column pinning in state/initialState keeps the left/right shape) plus the data-table options below.
