---
name: shadcn-react-table
description: Install and use shadcn-react-table, a shadcn/ui data table with Material React Table parity built on TanStack Table v9. Use when a project needs a table with sorting, filtering, search, pagination, selection, editing, grouping, pinning, drag and drop or virtualization, when it already has components/ui/data-table, or when moving a table off Material React Table.
---

# shadcn-react-table

A shadcn registry block: `shadcn add` copies the table's source into the project (`components/ui/data-table/`) and installs the shadcn/ui components it uses in the project's own style. The project owns the files.

Docs for agents: https://monabbir-ahmmad.github.io/shadcn-react-table/llms.txt (index) and https://monabbir-ahmmad.github.io/shadcn-react-table/llms-full.txt (everything). Any docs page is available as Markdown by adding `.md` to its URL.

## Install

1. Requirements: shadcn/ui (a `components.json`), Tailwind CSS v4, React 19. Radix UI and Base UI projects both work: the shadcn CLI adapts the source to the project's library.
   No `components.json` yet: run `pnpm dlx shadcn@latest init` first and ask the user which style and library they want.
2. Add the table:
   ```bash
   pnpm dlx shadcn@latest add https://monabbir-ahmmad.github.io/shadcn-react-table/r/data-table.json
   ```
   Use the project's package manager (`npx`, `yarn dlx`, `bunx`).
3. Verify: `components/ui/data-table/index.ts` exists and the project type-checks.

What it adds: `components/ui/data-table/`, the shadcn/ui components it needs (button, dialog, dropdown-menu, popover, select, table, tooltip, …) when missing, and the npm packages `@tanstack/react-table`, `@tanstack/react-virtual`, `@tanstack/match-sorter-utils`, `@dnd-kit/*`, `date-fns`, `lucide-react`. Re-run with `--overwrite` to update; that replaces local edits in that directory.

Other languages are separate items: `pnpm dlx shadcn@latest add https://monabbir-ahmmad.github.io/shadcn-react-table/r/data-table-locale-de.json`, then `import { dataTableLocalizationDe } from "@/components/ui/data-table/locales/de"` and pass `localization: dataTableLocalizationDe`.

Optional namespace (also lets the shadcn MCP server browse the items): add `"registries": { "@shadcn-react-table": "https://monabbir-ahmmad.github.io/shadcn-react-table/r/{name}.json" }` to `components.json`, then `pnpm dlx shadcn@latest add @shadcn-react-table/data-table`.

## Use

```tsx
"use client"

import {
  DataTable,
  useDataTable,
  type DataTableColumnDef,
} from "@/components/ui/data-table"

type Person = { id: string; name: string; age: number }

// Stable identity: module scope, useMemo or useState.
const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "age", header: "Age", meta: { filterVariant: "range" } },
]

export function People({ data }: { data: Person[] }) {
  const table = useDataTable({ data, columns, getRowId: (row) => row.id })
  return <DataTable table={table} />
}
```

## Rules

- **Always pass `getRowId`.** Selection, editing, pinning and dragging key rows by id.
- **Keep `columns` and `data` stable** (module scope, `useMemo`, `useState`, or query results). A new array every render rebuilds the table every render.
- **Type columns with `DataTableColumnDef<TData>`**, not TanStack's `ColumnDef`.
- **The table's own column options go in `meta`**: `filterVariant`, `filterSelectOptions`, `filterMode`, `columnFilterModeOptions`, `editVariant`, `editSelectOptions`, `validate`, `enableEditing`, `enableClickToCopy`, `align`, `label`, `slotProps`, `renderEditCell`, `renderColumnFilter`, `visibleInShowHideMenu`. TanStack's options (`cell`, `header`, `footer`, `sortFn`, `filterFn`, `aggregationFn`, `enableSorting`, `size`) stay top-level.
- **State**: start it with `initialState`, control it with `state` plus the matching `on…Change`. This covers TanStack's state and the table's own (`density`, `isFullscreen`, `showColumnFilters`, `showGlobalFilter`, `columnFilterModes`, `globalFilterMode`, `editingCell`, `editingRowId`, `isCreating`, `rowDraft`, `advancedFilter`).
- **The component calling `useDataTable` does not re-render on state changes.** To show state there, use `<table.Subscribe selector={(s) => s.rowSelection}>{(sel) => …}</table.Subscribe>` or the `stateSelector` option. Event handlers and the table's render options always see current state through `table.getState()`.
- **Methods are on `table`** (`table.setDensity`, `table.beginRowEdit(row)`, `table.beginCreate()`, `table.cancelEdit()`, `table.autoSizeColumn(id)`); resolved options and refs are on `table.dataTable`.
- **Saves don't change `data`.** `onEditingCellSave`, `onEditingRowSave` and `onCreatingRowSave` hand over values; update the data, then call `exit()` (row and create saves) to leave editing.
- **Style parts with `slotProps`** (`surface`, `bodyRow`, `bodyCell`, `headCell`, `topToolbar`, `searchInput`, `editField`, `skeleton`, …), as props or `(context) => props`. Classes combine and handlers both run. Per column: `meta.slotProps`.
- **Bound the height for sticky headers, pinned rows and virtualization**: `slotProps: { surface: { className: "max-h-[600px]" } }`.
- **Server-side data**: set `manualPagination` / `manualSorting` / `manualFiltering`, pass `rowCount`, and control `pagination` / `sorting` / `columnFilters` / `globalFilter` through `state` + `on…Change`. Pass `isLoading` while fetching.
- **Custom functions by name** (`filterFns`, `sortFns`, `aggregationFns`): the names are read when the table is created; the functions stay current.
- **Moving rows between tables**: wrap them in `DataTableDndProvider`, set `enableRowDragging`, and update the data in `onRowDragEnd`.

## Where to look

Read the page before changing those options (all Markdown):

- Every `useDataTable` option: https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/use-data-table.md
- Column options (`meta`): https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/column-options.md
- Table methods and `table.dataTable`: https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/table-instance.md
- A feature: https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/<feature>.md (for example `editing`, `server-side`, `row-selection`, `slot-props`, `filter-modes`, `virtualization`)
- Coming from Material React Table: https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/migrating-from-mrt.md

## Pulling in an example

Every guide page embeds live examples; its `.md` version contains each example's full source under "Example (`slug`)". To add one: fetch the guide's `.md`, copy the example function, and adapt the data and columns to the project. The examples import `DataTable` / `useDataTable` from `@/components/ui/data-table` like the project does.
