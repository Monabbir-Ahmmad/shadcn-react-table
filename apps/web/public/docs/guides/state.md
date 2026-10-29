# State management

The data table keeps all of its state in TanStack Table's store: the standard table state (sorting, filters, selection…) and its own UI state (density, editing, filter modes…). Every slice can be left uncontrolled, observed, or fully controlled, and parts of the table re-render only for the slices they show.

## TanStack table state

All the standard table state — sorting, column filters, global filter, pagination, row selection, column visibility, ordering, pinning, sizing, expansion, grouping — is plain TanStack Table state. `useDataTable` spreads its options straight into TanStack's `useTable`, so you control it exactly as you would in TanStack: pass `state` + the matching `onXChange` setter (and optionally `initialState` for uncontrolled seeds).

```tsx
const [sorting, setSorting] = React.useState<SortingState>([])
const [rowSelection, setRowSelection] = React.useState({})

const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  state: { sorting, rowSelection },
  onSortingChange: setSorting,
  onRowSelectionChange: setRowSelection,
})
```

For server-side data, combine this with the `manual*` flags — see [Server-side data](/docs/guides/server-side).

## Data table UI state

The state the table adds on top of TanStack is table state too: **density**, **full screen**, **filter-row visibility**, the **global search mode**, **column filter modes**, the **advanced filter** and its dialog, and **inline editing** (the cell or row being edited, the create form, the draft). It sits in `table.getState()` next to sorting, takes `initialState` and controlled `state` like any slice, and reports changes through `on…Change` callbacks with the new value.

```tsx
const [editingCell, setEditingCell] = React.useState<EditingCell | null>(null)

const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  initialState: { density: "compact", showColumnFilters: true },
  state: { editingCell },
  onEditingCellChange: setEditingCell,
})
```

Observe a slice without taking it over with its `on…Change` callback:

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  initialState: { density: "compact" },
  onDensityChange: (density) => saveToLocalStorage("density", density),
})
```

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `onDensityChange` | `(density: Density) => void` |  | Called whenever the density changes (toolbar toggle or programmatic). Set it with `initialState.density`, control it with `state.density`. |
| `onIsFullscreenChange` | `(isFullscreen: boolean) => void` |  | Called whenever the full-screen state is toggled. Control it with `state.isFullscreen`. |
| `onShowColumnFiltersChange` | `(showColumnFilters: boolean) => void` |  | Called whenever the filter row is shown or hidden. Set it with `initialState.showColumnFilters`, control it with `state.showColumnFilters`. |
| `onGlobalFilterModeChange` | `(mode: GlobalFilterMode) => void` |  | Called whenever the global search mode changes (default `"fuzzy"`). Set it with `initialState.globalFilterMode`, control it with `state.globalFilterMode`. |
| `onColumnFilterModesChange` | `(modes: Record<string, FilterMode>) => void` |  | Called when a column's filter mode changes, with every column's mode. Control it with `state.columnFilterModes`. |
| `onShowAdvancedFilterPanelChange` | `(open: boolean) => void` |  | Called when the advanced filter dialog opens or closes. Control it with `state.showAdvancedFilterPanel`. |
| `onEditingCellChange` | `(cell: EditingCell \| null) => void` |  | Called when cell editing starts or ends (`null`). Control it with `state.editingCell`. |
| `onEditingRowIdChange` | `(rowId: string \| null) => void` |  | Called when row editing starts or ends (`null`). Control it with `state.editingRowId`. |
| `onIsCreatingChange` | `(isCreating: boolean) => void` |  | Called when the new-row editor opens or closes. Control it with `state.isCreating`. |
| `onRowDraftChange` | `(draft: Record<string, unknown>) => void` |  | Called when the draft of the row being edited or created changes. Control it with `state.rowDraft`. |

Example (`controlled-state`):

```tsx
function ControlledStateExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "salary", desc: true },
  ])
  const [density, setDensity] = React.useState<Density>("compact")
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageSize: 10 } },
    state: { sorting, density },
    onSortingChange: setSorting,
    onDensityChange: setDensity,
  })
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSorting([{ id: "age", desc: false }])}
        >
          Sort by age
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setDensity((d) => (d === "compact" ? "spacious" : "compact"))
          }
        >
          Toggle density
        </Button>
        <code className="text-xs text-muted-foreground">
          {JSON.stringify({ sorting, density })}
        </code>
      </div>
      <DataTable table={table} />
    </div>
  )
}
```

## Reading state in your component

`<DataTable>` subscribes to the state it shows. The component that calls `useDataTable` does **not** re-render when the table's state changes, so code there that reads the state during render would show an old value. Tell `useDataTable` what your render reads with `stateSelector`; the component then re-renders when that part changes (compared shallowly):

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableRowSelection: true,
  stateSelector: (state) => state.rowSelection,
})

const selectedCount = Object.keys(table.getState().rowSelection).length
```

To re-render only a small part of your component, use `table.Subscribe` instead:

```tsx
<table.Subscribe selector={(state) => state.rowSelection}>
  {(rowSelection) => <span>{Object.keys(rowSelection).length} selected</span>}
</table.Subscribe>
```

Event handlers, effects and the table's own render props (`renderTopToolbarCustomActions`, `renderBottomToolbarCustomActions`, …) always see the current state; only reads during your component's render need this.

## Reading and setting from the instance

Whether controlled or not, the current values are in `table.getState()` and the setters are methods on `table`:

```tsx
table.getState().density // "comfortable" | "compact" | "spacious"
table.setDensity("compact")
table.setIsFullscreen(true)
table.setShowColumnFilters((prev) => !prev)
```

> **Persisting state:** Mirror any of these into local storage or a query param, then restore via the
>   matching `default*` (uncontrolled) or controlled value on the next load.

## Styling without props

The table is styled with Tailwind, not per-component style props. Structural slots emit a `data-slot` attribute you can target with a selector — see the table in [Toolbar customization](/docs/guides/toolbar#styling).

## Related

- [Toolbar customization](/docs/guides/toolbar)
- [Server-side data](/docs/guides/server-side)
- [Table instance](/docs/api/table-instance)
