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

## How it works

It is a thin, opinionated layer over TanStack Table:

- It wraps TanStack's `useTable` with sensible defaults (row models wired for you, an auto-injected selection column, localization) and adds to the instance: its UI state in `table.getState()`, methods such as `table.setDensity`, and its resolved options on `table.dataTable`.
- Controlled state (`sorting`, `columnFilters`, `pagination`, `rowSelection`, …), the `manual*` server-side flags, and `getRowId` all **pass straight through** to TanStack. If you know TanStack Table, you already know this table.
- The `<DataTable />` component reads `table.dataTable` to render the toolbar, filter row, body, footer, and pagination — no prop drilling.

## For AI tools

Coding agents can install and use the table from one prompt, a skill file, the shadcn MCP server, or the docs as Markdown (`/llms.txt`, and `.md` after any page URL). See [AI agent setup](/docs/ai).

## Start here

<Cards>
  <Card href="/docs/installation" title="Installation" />
  <Card href="/docs/quick-start" title="Quick start" />
  <Card href="/docs/ai" title="AI agent setup" />
  <Card href="/docs/guides/migrating-from-mrt" title="Migrating from MRT" />
</Cards>

## Popular guides

<Cards>
  <Card href="/docs/guides/column-filtering" title="Column filtering" />
  <Card href="/docs/guides/editing" title="Editing" />
  <Card href="/docs/guides/server-side" title="Server-side data" />
  <Card href="/docs/guides/slot-props" title="Part props (slotProps)" />
  <Card href="/docs/guides/virtualization" title="Virtualization" />
  <Card href="/docs/guides/row-selection" title="Row selection" />
</Cards>

[Browse all guides →](/docs/guides)
