# Table refs

The table instance exposes DOM refs to its structural elements on `table.dataTable.refs`. Use them for imperative access — focusing the search box, measuring the toolbar, or scrolling the container — without wiring up your own refs.

```tsx
import { DataTable, useDataTable } from "@/components/ui/data-table"

const table = useDataTable({ data, columns })

// e.g. focus the global search box in an effect or event handler:
table.dataTable.refs.searchInputRef.current?.focus()

// or scroll the table body back to the top:
table.dataTable.refs.tableContainerRef.current?.scrollTo({ top: 0 })

return <DataTable table={table} />
```

## Available refs

| Ref | Type | Default | Description |
| --- | --- | --- | --- |
| `tablePaperRef` | `React.RefObject<HTMLDivElement \| null>` |  | The outermost `data-slot="data-table"` wrapper. Always present. |
| `tableContainerRef` | `React.RefObject<HTMLDivElement \| null>` |  | The scroll container (`data-slot="data-table-surface"`) — the single scroll container for both axes. Always present. |
| `topToolbarRef` | `React.RefObject<HTMLDivElement \| null>` |  | The top toolbar root (`data-slot="data-table-toolbar"`). `null` when the top toolbar is disabled or replaced via `renderTopToolbar`. |
| `bottomToolbarRef` | `React.RefObject<HTMLDivElement \| null>` |  | The bottom toolbar root (`data-slot="data-table-bottom-toolbar"`). `null` when there is no bottom toolbar, or it is replaced via `renderBottomToolbar`. |
| `tableHeadRef` | `React.RefObject<HTMLTableSectionElement \| null>` |  | The `<thead>` element. Always present. |
| `tableFooterRef` | `React.RefObject<HTMLTableSectionElement \| null>` |  | The `<tfoot>` element. `null` unless a column defines a `footer`. |
| `searchInputRef` | `React.RefObject<HTMLInputElement \| null>` |  | The global-search `<input>`. `null` until the search box is expanded. |

> **Populated after mount:** Refs are `null` during the first render and on the server. Read them inside an
>   effect or an event handler, and guard against `null` for elements that may not
>   be rendered (see the notes above).

## Related

<Cards>
  <Card href="/docs/guides/virtualization" title="Virtualization" />
  <Card href="/docs/guides/toolbar" title="Toolbar customization" />
  <Card href="/docs/api/table-instance" title="Table instance" />
</Cards>
