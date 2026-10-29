# Virtualization

Virtualization renders only the cells currently in view, keeping large tables fast. The data table supports both row and column virtualization.

## Row virtualization

Set `enableRowVirtualization: true` to render only the visible rows. This is recommended once you have more than roughly 100 rows.

Example (`virtualized`):

```tsx
function VirtualizedExample() {
  const data = React.useMemo(() => makeUsers(1000), [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableRowVirtualization: true,
  })
  return <DataTable table={table} />
}
```

With row virtualization on, the table surface becomes the scroll container, so give it a bounded height via `slotProps.surface` (it defaults to a viewport-based height).

```tsx
import { DataTable, useDataTable } from "@/components/ui/data-table"

const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableRowVirtualization: true,
  slotProps: { surface: { className: "max-h-[600px]" } },
  estimateRowHeight: 52,
  virtualOverscan: 8,
})

return <DataTable table={table} />
```

Tune the behavior with `estimateRowHeight` (default `52`) and `virtualOverscan` (default `8`, the number of extra rows rendered above and below the viewport).

## Advanced virtualizer control

For finer control, both virtualizers expose the underlying [`@tanstack/react-virtual`](https://tanstack.com/virtual) API.

Pass `rowVirtualizerOptions` / `columnVirtualizerOptions` to merge extra options into the `useVirtualizer` call. They override the built-in `count`, `estimateSize`, `overscan`, and `measureElement`, and accept either an object or a `({ table }) => options` function:

```tsx
const table = useDataTable({
  data,
  columns,
  enableRowVirtualization: true,
  rowVirtualizerOptions: { overscan: 12, gap: 4 },
})
```

To drive the virtualizer imperatively (for example, to scroll to a row), pass a ref via `rowVirtualizerInstanceRef` / `columnVirtualizerInstanceRef`:

```tsx
import { useRef } from "react"
import type { DataTableRowVirtualizer } from "@/components/ui/data-table"

const rowVirtualizerRef = useRef<DataTableRowVirtualizer>(null)

const table = useDataTable({
  data,
  columns,
  enableRowVirtualization: true,
  rowVirtualizerInstanceRef: rowVirtualizerRef,
})

// later, e.g. in an effect or event handler:
rowVirtualizerRef.current?.scrollToIndex(100)
```

> **Row drag-ordering is disabled:** Row virtualization is incompatible with row drag-ordering. If you need to
>   reorder rows by dragging, leave virtualization off. See
>   [Row ordering](/docs/guides/row-ordering).

## Column virtualization

For very wide tables, set `enableColumnVirtualization: true` to virtualize columns. This applies fixed column widths. Column pinning (pinned columns stay in place while you scroll sideways), column ordering and grouped headers all work with it.

Example (`column-virtualization`):

```tsx
function ColumnVirtualizationExample() {
  const data = React.useMemo(() => makeUsers(300), [])
  const columns = React.useMemo(() => wideColumns(), [])
  const table = useDataTable({
    slotProps: { surface: { className: "max-h-[600px]" } },
    data,
    columns,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableRowVirtualization: true,
    enableColumnVirtualization: true,
  })
  return <DataTable table={table} />
}
```

```tsx
import { DataTable, useDataTable } from "@/components/ui/data-table"

const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableColumnVirtualization: true,
  enablePagination: false,
})

return <DataTable table={table} />
```

> **Pair with no pagination:** Column virtualization is usually paired with `enablePagination: false` so all
>   rows scroll within one virtualized surface.

## Relevant options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `enableRowVirtualization` | `boolean` | `false` | Virtualize body rows for large datasets (recommended past ~100 rows). The table surface becomes the scroll container — give it a bounded height via `className`/`style` (defaults to `max-h-[600px]`). Disables row DnD. |
| `enableColumnVirtualization` | `boolean` | `false` | Virtualize columns for very wide tables. Applies fixed column widths; works with column pinning (pinned columns stay rendered), column ordering and grouped headers. |
| `estimateRowHeight` | `number` | `52` | Estimated row height (px) for the virtualizer. Default 52. |
| `virtualOverscan` | `number` | `8` | Extra rows rendered above/below the viewport. Default 8. |
| `rowVirtualizerOptions` | `RowVirtualizerOptions<TData>` |  | Partial `@tanstack/react-virtual` options merged into the row virtualizer (overrides the built-in `count`/`estimateSize`/`overscan`/`measureElement`). Accepts an object or a `({ table }) => options` function. |
| `columnVirtualizerOptions` | `ColumnVirtualizerOptions<TData>` |  | Partial `@tanstack/react-virtual` options merged into the column virtualizer. Accepts an object or a `({ table }) => options` function. |
| `rowVirtualizerInstanceRef` | `React.RefObject<DataTableRowVirtualizer \| null>` |  | Ref populated with the row `Virtualizer` instance for imperative control (e.g. `scrollToIndex`). Only set when `enableRowVirtualization`. |
| `columnVirtualizerInstanceRef` | `React.RefObject<DataTableColumnVirtualizer \| null>` |  | Ref populated with the column `Virtualizer` instance. Only set when `enableColumnVirtualization`. |

## Related

- [Row ordering](/docs/guides/row-ordering)
- [DataTable props](/docs/api/data-table-props)
- [useDataTable options](/docs/api/use-data-table)
