# Global search

An expandable global search box appears in the toolbar by default (`enableGlobalFilter: true`). It filters across all searchable columns at once, complementing the per-column filters.

Example (`global-search`):

```tsx
function GlobalSearchExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableGlobalFilter: true,
    initialState: { globalFilterMode: "fuzzy", pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}
```

## Search modes

When `enableGlobalFilterModes: true` (the default), the search box shows a mode menu — fuzzy, contains, and more. The initial mode comes from `initialState.globalFilterMode`, which defaults to `"fuzzy"`.

```tsx
import { DataTable, useDataTable } from "@/components/ui/data-table"

const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableGlobalFilter: true,
  enableGlobalFilterModes: true,
  initialState: { globalFilterMode: "fuzzy" },
})
return <DataTable table={table} />
```

## Opening the search box

The search box starts closed (a search button) unless a search is set. Its open state is table state, `showGlobalFilter`: start it open with `initialState: { showGlobalFilter: true }`, control it with `state.showGlobalFilter` and `onShowGlobalFilterChange`, or open it from code with `table.setShowGlobalFilter(true)`. Setting a search value from outside opens it too.

## Custom search modes

Limit or reorder the search mode menu with `globalFilterModeOptions`. It can also list your own [custom filter functions](/docs/guides/filter-modes#custom-filter-functions) by name; the search runs them on each searchable column, and a row matches when any column passes.

```tsx
const table = useDataTable({
  data,
  columns,
  filterFns: {
    exact: (row, columnId, value) => String(row.getValue(columnId)) === value,
  },
  globalFilterModeOptions: ["contains", "fuzzy", "exact"],
  initialState: { globalFilterMode: "contains" },
  localization: { filterModes: { exact: "Exact match" } },
})
```

## Disabling global search

Set `enableGlobalFilter: false` to remove the search box from the toolbar.

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableGlobalFilter: false,
})
```

## Custom mode menu

Replace the built-in mode radio items with `renderGlobalFilterModeMenuItems`. It receives the allowed `modes`, the `currentMode`, and an `onSelect(mode)` to switch.

```tsx
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

useDataTable({
  renderGlobalFilterModeMenuItems: ({ modes, currentMode, onSelect }) =>
    modes.map((mode) => (
      <DropdownMenuItem
        key={mode}
        disabled={mode === currentMode}
        onClick={() => onSelect(mode)}
      >
        {mode}
      </DropdownMenuItem>
    )),
})
```

## Ranked results

In fuzzy mode, each match carries a relevance score. Set `enableGlobalFilterRankedResults` to order rows by that score — best matches first — for as long as a search is active.

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  initialState: { globalFilterMode: "fuzzy" },
  enableGlobalFilterRankedResults: true,
})
```

The ranking yields to the user: the moment they click a column to sort, their sort takes over, and clearing the search restores the original order. It applies only in `"fuzzy"` mode and is skipped while grouping or row expansion is active, or under `manualSorting` / `manualFiltering` (the server owns ordering there).

> **Off by default:** Material React Table enables this by default; the data table keeps it off so adding a
>   search box never silently reorders your rows. Opt in when relevance ordering
>   is what you want.

## Placement

Move the search to the left toolbar region with `positionGlobalFilter: "left"` — see [Toolbar customization](/docs/guides/toolbar#search-placement).

## Relevant options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `enableGlobalFilter` | `boolean` | `true` | Show the expandable global search in the toolbar. Default true. |
| `enableGlobalFilterModes` | `boolean` | `true` | Show the global search mode menu (fuzzy/contains/…). Default true. |
| `onShowGlobalFilterChange` | `(showGlobalFilter: boolean) => void` |  | Called whenever the global search box opens or closes. Set it with `initialState.showGlobalFilter`, control it with `state.showGlobalFilter`. |
| `globalFilterModeOptions` | `GlobalFilterMode[]` | `GLOBAL_FILTER_MODES as GlobalFilterMode[]` | Restrict (and order) the global search mode menu: built-in modes and custom `filterFns` names. |
| `enableGlobalFilterRankedResults` | `boolean` | `false` | While the global search is in fuzzy mode, order rows by best match (most relevant first) until the user applies their own sort. Default false — MRT defaults this on, but the data table keeps it off so searching never silently reorders rows unless opted in. Ignored for non-fuzzy modes, when grouping or expanded, or under manual sorting/filtering. |
| `onGlobalFilterModeChange` | `(mode: GlobalFilterMode) => void` |  | Called whenever the global search mode changes (default `"fuzzy"`). Set it with `initialState.globalFilterMode`, control it with `state.globalFilterMode`. |
| `positionGlobalFilter` | `"left" \| "right" \| "none"` | `"right"` | Which toolbar region the global search renders in. Default "right" (the internal-actions cluster). "left" places it next to the title/actions; "none" hides it (same as `enableGlobalFilter: false`). |

## Related

- [Column filtering](/docs/guides/column-filtering)
- [Filter modes](/docs/guides/filter-modes)
