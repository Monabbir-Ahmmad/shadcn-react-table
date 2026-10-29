---
name: shadcn-react-table
description: Build data tables with shadcn-react-table (the shadcn/ui data table with Material React Table parity, on TanStack Table v9). Use when adding or changing a table that imports DataTable / useDataTable from "@/components/ui/data-table", or when someone asks for a sortable, filterable, editable or virtualized table in a shadcn/ui project.
---

# shadcn-react-table

A shadcn registry block: its source lives in the project at `components/ui/data-table/` and renders the project's own shadcn components. Full docs: https://monabbir-ahmmad.github.io/shadcn-react-table/llms-full.txt

## Install

The project needs shadcn/ui (`components.json`) and Tailwind CSS v4.

```bash
npx shadcn@latest add https://monabbir-ahmmad.github.io/shadcn-react-table/r/data-table.json
```

## The shape of every table

```tsx
"use client"

import {
  DataTable,
  useDataTable,
  type DataTableColumnDef,
} from "@/components/ui/data-table"

type Person = { id: string; name: string; age: number }

// Stable identity: define outside the component or memoize.
const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "age", header: "Age", meta: { filterVariant: "range" } },
]

export function People({ data }: { data: Person[] }) {
  const table = useDataTable({
    data, // stable identity too
    columns,
    getRowId: (row) => row.id,
  })
  return <DataTable table={table} />
}
```

## Rules that prevent most bugs

- **Always pass `getRowId`.** Selection, editing, pinning and row state key on it.
- **Keep `columns` and `data` stable** (module constants, `useMemo`, or query results). A new array every render rebuilds the table every render.
- **Type columns with `DataTableColumnDef<TData>`**, not TanStack's `ColumnDef` (v9 needs a feature-set parameter).
- **Table-specific column options go in `meta`**: `filterVariant`, `filterSelectOptions`, `filterMode`, `editVariant`, `editSelectOptions`, `validate`, `enableEditing`, `enableClickToCopy`, `align`, `label`, `slotProps`, `renderEditCell`, `renderColumnFilter`. TanStack's own options (`cell`, `header`, `footer`, `sortFn`, `filterFn`, `aggregationFn`, `enableSorting`, `size`) stay top-level.
- **State**: start it with `initialState`, control it with `state` plus the matching `on…Change`. This covers TanStack state and the table's own (`density`, `isFullscreen`, `showColumnFilters`, `columnFilterModes`, `globalFilterMode`, `editingCell`, `editingRowId`, `isCreating`, `rowDraft`, `advancedFilter`).
- **The component calling `useDataTable` does not re-render on state changes.** To show state, use `<table.Subscribe selector={(s) => s.rowSelection}>{(sel) => …}</table.Subscribe>` or the `stateSelector` option. Event handlers and the table's render options always see current state via `table.getState()`.
- **Methods are on `table`** (`table.setDensity`, `table.beginRowEdit(row)`, `table.beginCreate()`, `table.cancelEdit()`, `table.autoSizeColumn(id)`); resolved options and refs are on `table.dataTable` (`table.dataTable.refs.tableContainerRef`).
- **Saves don't change `data`.** `onEditingCellSave`, `onEditingRowSave` and `onCreatingRowSave` hand you values; update your data, then call `exit()` (row and create saves) to leave editing.
- **Style parts with `slotProps`** (`surface`, `bodyRow`, `bodyCell`, `headCell`, `topToolbar`, `searchInput`, `editField`, …), as props or `(context) => props`. Classes combine, handlers both run. Per column: `meta.slotProps`.
- **Bound the height for sticky headers and virtualization**: `slotProps: { surface: { className: "max-h-[600px]" } }`.
- **Server-side data**: set `manualPagination` / `manualSorting` / `manualFiltering`, pass `rowCount`, and control `pagination` / `sorting` / `columnFilters` through `state` + `on…Change`.
- **Custom functions by name** (`filterFns`, `sortFns`, `aggregationFns`) are registered when the table is created; define them outside the component.

## Common recipes

```tsx
// Row selection with a toolbar action
useDataTable({
  data, columns, getRowId: (r) => r.id,
  enableRowSelection: true,
  renderTopToolbarCustomActions: ({ table }) => (
    <Button onClick={() => remove(table.getSelectedRowModel().rows)}>Delete</Button>
  ),
})

// Inline cell editing
useDataTable({
  data, columns, getRowId: (r) => r.id,
  enableEditing: true, // or (row) => boolean
  editDisplayMode: "cell", // "row" | "modal" | "table"
  onEditingCellSave: ({ row, column, value }) => update(row.id, column.id, value),
})

// Large lists
useDataTable({
  data, columns, getRowId: (r) => r.id,
  enablePagination: false,
  enableRowVirtualization: true,
  slotProps: { surface: { className: "max-h-[600px]" } },
})
```

## Coming from Material React Table

Most options keep MRT's names. MRT column options move to `meta`, `mui*Props` become `slotProps` parts, `sortingFns` is `sortFns`, `table.setEditingRow(row)` is `table.beginRowEdit(row)`. Mapping: https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/migrating-from-mrt.md
