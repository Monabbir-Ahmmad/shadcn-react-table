# Column filtering

Each column can expose its own filter control in a per-column filter row. Toggle the row with the funnel icon in the toolbar, or have it open from the start with `initialState: { showColumnFilters: true }`.

Example (`column-filters`):

```tsx
function ColumnFiltersExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { showColumnFilters: true, pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}
```

## Choosing a filter control

The UI for each filter is chosen by the column's `meta.filterVariant`:

| Variant | Control | Values |
| --- | --- | --- |
| `"text"` (default) | Text box | Any |
| `"autocomplete"` | Text box suggesting the column's values | Any |
| `"select"` / `"multi-select"` | Dropdown / checklist | Strings |
| `"checkbox"` | Checkbox | Booleans |
| `"range"` / `"range-slider"` | Number boxes / slider | Numbers |
| `"date"` / `"date-range"` | Calendar | Dates, compared by day |
| `"datetime"` / `"datetime-range"` | Date-time box | Dates, compared to the minute |
| `"time"` / `"time-range"` | Time box | `"HH:mm"` strings or Dates, compared by time of day |

The date, date-time and time variants share the same modes (equals, before, after, between, empty…); the `-range` variants start in "between".

For `select`, `multi-select` and `autocomplete`, supply `meta.filterSelectOptions` as an array of `{ label, value }`. If you omit them, the options are derived from the column's faceted unique values.

```tsx
import { DataTable, useDataTable } from "@/components/ui/data-table"

const columns = [
  { accessorKey: "title", header: "Title", meta: { filterVariant: "text" } },
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      filterVariant: "select",
      filterSelectOptions: [
        { label: "Active", value: "active" },
        { label: "Archived", value: "archived" },
      ],
    },
  },
  { accessorKey: "score", header: "Score", meta: { filterVariant: "range" } },
]

const table = useDataTable({ data, columns, getRowId: (row) => row.id })
return <DataTable table={table} />
```

Example (`datetime-filters`):

```tsx
function DateTimeFiltersExample() {
  const table = useDataTable({
    data: SHIFTS,
    columns: SHIFT_COLUMNS,
    getRowId: (row) => row.id,
    initialState: { showColumnFilters: true, pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}
```

## Open the filter row by default

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  initialState: { showColumnFilters: true },
})
```

## Custom filter UI

Use `meta.renderColumnFilter` as an escape hatch to render your own filter control for a column.

## Match highlighting

Matched substrings in cells are highlighted by default. Disable it for the whole table with `enableFilterMatchHighlighting: false`, or for a single column with `meta.enableFilterMatchHighlighting: true`.

## Disabling a column's filter

Set `enableColumnFilter: false` on a column to remove its filter control entirely.

## Faceted values

Select / multi-select filters auto-derive their options, and range filters their min/max bounds, from the data's faceted values. This is on by default; set `enableFacetedValues: false` to skip computing the faceted row models (e.g. for very large client-side datasets) — then provide `meta.filterSelectOptions` explicitly for select-style filters.

Example (`faceted-values`):

```tsx
function FacetedValuesExample() {
  const data = React.useMemo(() => baseUsers, [])
  const table = useDataTable({
    data,
    columns: FACETED_COLUMNS,
    getRowId: (row) => row.id,
    initialState: {
      showColumnFilters: true,
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  })
  return <DataTable table={table} />
}
```

## Relevant options

`useDataTable` options that affect column filtering:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `onShowColumnFiltersChange` | `(showColumnFilters: boolean) => void` |  | Called whenever the filter row is shown or hidden. Set it with `initialState.showColumnFilters`, control it with `state.showColumnFilters`. |
| `enableColumnFilterModes` | `boolean` | `true` | Show the filter-mode menu adornment on filter fields. Default true. |
| `enableFilterMatchHighlighting` | `boolean` | `true` | Highlight matched substrings in cells. Default true. |
| `enableFacetedValues` | `boolean` | `true` | Compute faceted unique values / min-max (auto select options + range bounds). Default true; disable to skip the faceted row models. |
| `columnFilterDisplayMode` | `ColumnFilterDisplayMode` | `"subheader"` | Where column filter inputs live: `"subheader"` (a filter row under the header, default), `"popover"` (per-column popovers opened from the column header), or `"custom"` (you render them). |

Per-column, via `columnDef.meta`:

| meta key | Type | Default | Description |
| --- | --- | --- | --- |
| `filterVariant` | `FilterVariant` |  | Filter UI variant rendered in the filter row. Defaults to "text". |
| `filterSelectOptions` | `DataTableFilterOption[]` |  | Options for `select` / `multi-select` filter variants. If omitted for a select-style variant, options are derived from faceted unique values. |
| `filterMode` | `FilterMode` |  | Default filter mode for this column (overrides the per-variant default). |
| `enableColumnFilterModes` | `boolean` |  | Per-column override for the filter-mode menu (defaults to the table). |
| `renderColumnFilter` | `(props: { column: Column<TFeatures, TData, TValue> table: DataTableInstance<TData> }) => React.ReactNode` |  | Custom filter UI for this column (escape hatch). Replaces the variant. |
| `columnFilterModeOptions` | `FilterMode[]` |  | Restrict (and order) the filter-mode menu for this column to this subset of modes (built-in ones and custom `filterFns` names). Include the column's default mode. |
| `enableFilterMatchHighlighting` | `boolean` |  | `false` opts this column out of match highlighting (the table option of the same name turns it on or off for every column). |

## Related

<Cards>
  <Card href="/docs/guides/filter-modes" title="Filter modes" />
  <Card href="/docs/guides/display-modes" title="Display modes" />
  <Card href="/docs/api/column-options" title="Column options" />
</Cards>
