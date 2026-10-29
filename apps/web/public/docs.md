# Shadcn React Table

A **shadcn/ui data table** with [Material React Table](https://www.material-react-table.com/) (MRT V3) feature parity, built on [TanStack Table v9](https://tanstack.com/table/latest). It ships as a shadcn **registry** component — you install the source into your own project with the shadcn CLI, so it inherits your style, base color, and theme tokens and you own every line.

Example (`advanced`):

```tsx
function AdvancedExample() {
  const [data, setData] = React.useState(() => baseUsers)
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    enableMultiSort: true,
    enableColumnOrdering: true,
    enableColumnPinning: true,
    enableColumnResizing: true,
    enableRowNumbers: true,
    enableRowPinning: true,
    enableGrouping: true,
    enableStickyFooter: true,
    enableEditing: true,
    editDisplayMode: "row",
    initialState: { showColumnFilters: true, pagination: { pageSize: 10 } },
    onEditingRowSave: ({ row, values, exit }) => {
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, ...(values as Partial<User>) } : r
        )
      )
      exit()
    },
    renderRowActions: ({ row }) => (
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Delete row"
        onClick={() =>
          setData((prev) => prev.filter((r) => r.id !== row.original.id))
        }
      >
        <RiDeleteBinLine />
      </Button>
    ),
  })
  return <DataTable table={table} />
}
```

## Why this table

MRT is the most complete React table, but it's tied to Material UI. This table brings that same breadth of features to the shadcn/ui ecosystem:

- **One hook, one component.** `useDataTable(options)` returns an enriched TanStack instance; `<DataTable table={table} />` renders it. Everything is driven by options.
- **Feature-complete.** Sorting, per-column filtering with mode menus, fuzzy global search, column ordering / pinning / resizing / visibility, density, sticky header & footer, row selection, row numbers, row pinning, drag-to-reorder rows, grouping with aggregation, detail panels, tree data, inline editing (cell / row / table / modal), row & cell actions, click-to-copy, row & column virtualization, CSV / Excel export, full localization, and swappable icons.
- **Style-agnostic.** It only uses standard shadcn primitive APIs (`button`, `table`, `popover`, `command`, …), declared as registry dependencies. `shadcn add` installs them in _your_ configured style, so the table adopts your look with nothing to override.
- **You own the source.** No opaque dependency — the component lands in your repo under `components/ui/data-table/` and is yours to extend.

## How it works

It is a thin, opinionated layer over TanStack Table:

- It wraps TanStack's `useTable` with sensible defaults (row models wired for you, an auto-injected selection column, localization) and adds to the instance: its UI state in `table.getState()`, methods such as `table.setDensity`, and its resolved options on `table.dataTable`.
- Controlled state (`sorting`, `columnFilters`, `pagination`, `rowSelection`, …), the `manual*` server-side flags, and `getRowId` all **pass straight through** to TanStack. If you know TanStack Table, you already know this table.
- The `<DataTable />` component reads `table.dataTable` to render the toolbar, filter row, body, footer, and pagination — no prop drilling.

## For AI tools

Coding agents can install and use the table from one prompt, a skill file, the shadcn MCP server, or the docs as Markdown (`/llms.txt`, and `.md` after any page URL). See [AI agent setup](/docs/ai).

## Next steps

- [Installation](/docs/installation) — add the table to your project via the shadcn registry.
- [Quick start](/docs/quick-start) — a minimal table in a few lines.
- [Usage](/docs/usage) — the mental model: options in, instance out.
- [Guides](/docs/guides/sorting) — one page per feature, each with a live example.
- [API reference](/docs/api/use-data-table) — every option, prop, and token, generated from the source types.
