# Column resizing

Set `enableColumnResizing: true` to add a drag handle on each column's edge. Users drag the handle to widen or narrow a column.

Example (`column-resizing`):

```tsx
function ColumnResizingExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableColumnResizing: true,
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
  enableColumnResizing: true,
})

return <DataTable table={table} />
```

## Keyboard

Each resize handle is focusable. With it focused, the arrow keys widen or narrow the column by 10px (50px with Shift) — mirrored in right-to-left tables — Home and End jump to the column's `minSize` and `maxSize`, and Enter fits the column to its content (or resets it when auto-size is off). Screen readers hear it as a separator with the column's current width.

## Resize mode

The resize mode defaults to `"onChange"`, so columns resize live as the handle moves. Pass TanStack's `columnResizeMode: "onEnd"` to defer the resize until the handle is released.

```tsx
const table = useDataTable({
  data,
  columns,
  enableColumnResizing: true,
  columnResizeMode: "onEnd",
})
```

## Width constraints

Column widths come from `size`, `minSize`, and `maxSize` on the column definition.

```tsx
const columns = [
  { accessorKey: "firstName", size: 200, minSize: 120, maxSize: 320 },
]
```

> **Set sensible bounds:** Define `minSize` and `maxSize` so users cannot collapse or stretch a column
>   past a usable width.

## Auto-sizing

Double-click a column's resize handle to size it to fit its widest value — header and data, across the full dataset (not just the rows currently on screen). This is on by default whenever `enableColumnResizing` is set, and respects each column's `minSize`/`maxSize` bounds.

Set `enableColumnAutosize: false` to turn it off; double-clicking the handle then resets the column to its default size instead.

```tsx
const table = useDataTable({
  data,
  columns,
  enableColumnResizing: true,
  enableColumnAutosize: true, // default: matches enableColumnResizing
})
```

You can also trigger it imperatively from the table instance:

```tsx
table.autoSizeColumn("firstName")
table.autoSizeAllColumns()
```

Example (`column-autosize`):

```tsx
function ColumnAutosizeExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableColumnResizing: true,
    enableColumnAutosize: true,
    initialState: { pagination: { pageSize: 10 } },
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        size="sm"
        variant="outline"
        onClick={() => table.autoSizeAllColumns()}
      >
        Fit all columns
      </Button>
    ),
  })
  return <DataTable table={table} />
}
```

## Layout mode and grow

`layoutMode` decides how the table hands out its width, as in Material React Table:

- `"semantic"` (default) — the browser's table layout. Columns with a `size` keep it and the others share what's left.
- `"grid"` — every column keeps its `size`, and the spare width (the container's width minus the columns' sizes) goes to the growing columns, so the table fills its container. When the columns are wider than the container, nothing grows and the table scrolls.
- `"grid-no-grow"` — every column keeps its `size` and nothing grows; the table is exactly as wide as its columns.

In grid mode every data column grows by default. Set `meta.grow` on a column to change that: `false` (or `0`) keeps it at its size, and a number sets its share — a column with `grow: 2` takes twice the spare width of one with `grow: 1`. The table's own columns (selection, expand, row numbers, row drag, row pin, row actions) never grow.

```tsx
const columns = [
  { accessorKey: "firstName", size: 150 },
  { accessorKey: "email", size: 220, meta: { grow: 2 } },
  { accessorKey: "role", size: 130, meta: { grow: false } },
]

const table = useDataTable({
  data,
  columns,
  layoutMode: "grid",
  enableColumnResizing: true,
})
```

Resizing works in every mode. In grid mode, resizing a growing column starts from the width it shows, and from then on the column keeps the size you gave it (it has a size in `columnSizing`, so it stops growing); the other growing columns take up the difference. Resetting the column (`column.resetSize()`) lets it grow again. A column given a size through `initialState.columnSizing` does not grow either.

Example (`layout-mode`):

```tsx
function LayoutModeExample() {
  const data = React.useMemo(() => baseUsers, [])
  const [layoutMode, setLayoutMode] = React.useState<LayoutMode>("grid")
  const table = useDataTable({
    data,
    columns: layoutModeColumns,
    getRowId: (row) => row.id,
    layoutMode,
    enableColumnResizing: true,
    enableRowSelection: true,
    initialState: { pagination: { pageSize: 5 } },
    renderTopToolbarCustomActions: () => (
      <div className="flex gap-1">
        {LAYOUT_MODES.map((mode) => (
          <Button
            key={mode}
            size="sm"
            variant={mode === layoutMode ? "default" : "outline"}
            aria-pressed={mode === layoutMode}
            onClick={() => setLayoutMode(mode)}
          >
            {mode}
          </Button>
        ))}
      </div>
    ),
  })
  return <DataTable table={table} />
}
```

## Related

- [Column options](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/column-options): Per-column configuration lives on the standard TanStack columnDef.meta object, which the table augments with the fields below (fully typed wherever meta is read).
- [useDataTable options](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/use-data-table): useDataTable(options) accepts everything TanStack's TableOptions accepts (controlled state, on*Change, manual* flags, getRowId, getSubRows, initialState, …; column pinning in state/initialState keeps the left/right shape) plus the data-table options below.
