# Toolbar customization

The table renders a **top toolbar** (title slot + your actions on the left, an icon-action cluster on the right) and a **bottom toolbar** (pagination). Every part can be hidden, replaced, or extended.

## Showing / hiding the toolbars

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableTopToolbar: false, // remove the entire top toolbar
  enableBottomToolbar: false, // remove the entire bottom toolbar
})
```

Example (`body-only`):

```tsx
function BodyOnlyExample() {
  const table = useDataTable({
    data: ACTIVITY,
    columns: [
      { accessorKey: "who", header: "Who" },
      { accessorKey: "what", header: "What" },
      {
        accessorKey: "when",
        header: "When",
        meta: { align: "right" },
      },
    ],
    getRowId: (row) => row.id,
    enableTableHead: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableKeyboardNavigation: false,
    initialState: { density: "compact" },
  })
  return <DataTable table={table} />
}
```

## Internal actions (the icon cluster)

The right-hand cluster holds global search, the filter toggle, column visibility, the density toggle, and the full-screen toggle. Hide individual items, or the whole cluster:

```tsx
useDataTable({
  // per-item
  enableGlobalFilter: false,
  enableColumnFilters: false,
  enableColumnActions: false, // column visibility menu
  enableDensityToggle: false,
  enableFullscreenToggle: false,
  // …or hide all of them at once
  enableToolbarInternalActions: false,
})
```

## Custom actions

Add your own buttons without replacing anything. `renderTopToolbarCustomActions` fills the top toolbar's left region (next to the title); `renderBottomToolbarCustomActions` fills the bottom toolbar's left region (next to pagination):

```tsx
useDataTable({
  renderTopToolbarCustomActions: ({ table }) => (
    <Button size="sm" onClick={() => table.beginCreate()}>
      Add row
    </Button>
  ),
  renderBottomToolbarCustomActions: ({ table }) => (
    <span className="text-xs text-muted-foreground">
      {table.getSelectedRowModel().rows.length} selected
    </span>
  ),
})
```

## Facet filters

`DataTableFacetFilter` puts a column filter on the toolbar as a button. It is dashed while nothing is picked and names the pick in a badge once something is. It reads and writes the table's `columnFilters` by id, so it works the same with or without the header filter row. `DataTableResetFilters` clears every column filter, and renders nothing while none is set.

```tsx
useDataTable({
  renderTopToolbarCustomActions: ({ table }) => (
    <>
      {/* one choice; options come from the column's meta.filterSelectOptions */}
      <DataTableFacetFilter table={table} columnId="role" />
      {/* several choices, with a heading and a count beside each option */}
      <DataTableFacetFilter
        table={table}
        columnId="status"
        multiple
        menuLabel="Show people who are"
        counts={{ active: 12, pending: 4 }}
      />
      <DataTableResetFilters table={table} />
    </>
  ),
})
```

Example (`facet-filter`):

```tsx
function FacetFilterExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  // A count beside each status, from the full data set.
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const user of data)
      counts[user.status] = (counts[user.status] ?? 0) + 1
    return counts
  }, [data])
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageSize: 10 } },
    renderTopToolbarCustomActions: ({ table }) => (
      <div className="flex flex-wrap items-center gap-2">
        <DataTableFacetFilter table={table} columnId="role" />
        <DataTableFacetFilter
          table={table}
          columnId="status"
          multiple
          menuLabel="Show people who are"
          counts={statusCounts}
        />
        <DataTableFacetFilter table={table} columnId="department" multiple />
        <DataTableResetFilters table={table} />
      </div>
    ),
  })
  return <DataTable table={table} />
}
```

Pass `options` to list values the column doesn't define, and `title` to rename the button. For a filter your page keeps outside the table, pass `value` and `onValueChange`; the table's own `columnFilters` are then left alone. Give `DataTableResetFilters` the matching `active` and `onReset` so it clears that filter too.

## Replacing a whole toolbar

For full control, replace the built-in toolbar entirely. The render slot receives the table instance:

```tsx
useDataTable({
  renderTopToolbar: ({ table }) => <MyToolbar table={table} />,
  renderBottomToolbar: ({ table }) => <MyFooter table={table} />,
  // or replace just the icon cluster, keeping the title/actions layout:
  renderToolbarInternalActions: ({ table }) => <MyIconButtons table={table} />,
})
```

## Pagination placement

`positionPagination` controls where the pagination controls render. `"none"` keeps pagination active (the data is still paged) but hides the controls.

```tsx
useDataTable({
  positionPagination: "both", // "top" | "bottom" | "both" | "none"
})
```

## Search placement

`positionGlobalFilter` moves the global search to the left region (next to the title/actions) or keeps it in the right-hand icon cluster. `"none"` hides it (same as `enableGlobalFilter: false`).

```tsx
useDataTable({
  positionGlobalFilter: "left", // "left" | "right" | "none"
})
```

## Alert banner & drop zone

The row-selection alert banner and the group-by drop zone default to the top. Reposition or hide them independently:

```tsx
useDataTable({
  positionToolbarAlertBanner: "bottom", // "top" | "bottom" | "head-overlay" | "none"
  positionToolbarDropZone: "both", // "top" | "bottom" | "both" | "none"
})
```

## Styling

Every toolbar slot exposes a `data-slot` attribute, so you can target it with a Tailwind selector instead of a styling prop — no per-slot props needed:

| Slot | Type | Default | Description |
| --- | --- | --- | --- |
| `data-table-toolbar` |  |  | Top toolbar root. |
| `data-table-toolbar-actions` |  |  | Internal actions cluster (search, filters, density, full screen, …). |
| `data-table-alert-banner` |  |  | Selection alert banner (`data-position="head-overlay"` when it lies over the header row). |
| `data-table-bottom-toolbar` |  |  | Bottom toolbar (custom actions and/or pagination). |
| `data-table-pagination` |  |  | Pagination controls. |
| `data-table-facet-filter` |  |  | Trigger button of a `DataTableFacetFilter` (dashed border while nothing is picked). |
| `data-table-reset-filters` |  |  | The `DataTableResetFilters` button (rendered only while a column filter is set). |

```tsx
<DataTable table={table} className="[&_[data-slot=data-table-toolbar]]:px-2" />
```

## Related

- [State management](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/state): The data table keeps all of its state in TanStack Table's store: the standard table state (sorting, filters, selection…) and its own UI state (density, editing, filter modes…).
- [Density](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/density): Density controls the vertical padding of table rows and the padding around the toolbars.
- [Global search](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/global-search): An expandable global search box appears in the toolbar by default (enableGlobalFilter: true).
- [Export](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/export): The table ships no built-in export — the same stance as Material React Table — so the block carries no CSV or spreadsheet dependencies.
