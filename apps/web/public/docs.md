# Shadcn React Table

A **shadcn/ui data table** with [Material React Table](https://www.material-react-table.com/) (MRT V3) feature parity, built on [TanStack Table v9](https://tanstack.com/table/latest). It ships as a shadcn **registry** component — you install the source into your own project with the shadcn CLI, so it inherits your style, base color, and theme tokens and you own every line.

Example (`advanced`):

```tsx
function PlaygroundExample() {
  const [data, setData] = React.useState(() => baseUsers)
  const columns = useUserColumns()
  // Every switch in the Settings menu, starting from the kitchen sink.
  const defaults = {
    rowSelection: true,
    rowNumbers: true,
    rowPinning: true,
    rowOrdering: false,
    detailPanel: false,
    columnOrdering: true,
    columnPinning: true,
    columnResizing: true,
    grouping: true,
    columnFilters: true,
    stickyHeader: true,
    stickyFooter: true,
    animations: true,
    virtualization: false,
    editing: true,
  }
  type Feature = keyof typeof defaults
  const [features, setFeatures] = React.useState(defaults)
  const [editMode, setEditMode] = React.useState<EditDisplayMode>("row")
  // One row per feature: the row is the toggle, the switch shows its state.
  const toggle = (feature: Feature, label: string) => (
    <DropdownMenuItem
      role="menuitemcheckbox"
      aria-checked={features[feature]}
      onSelect={(event) => {
        // Keep the menu open while switching several features.
        event.preventDefault()
        setFeatures((prev) => ({ ...prev, [feature]: !prev[feature] }))
      }}
    >
      {label}
      <Switch
        size="sm"
        checked={features[feature]}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none ms-auto"
      />
    </DropdownMenuItem>
  )

  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableMultiSort: true,
    enableRowSelection: features.rowSelection,
    enableRowNumbers: features.rowNumbers,
    enableRowPinning: features.rowPinning,
    enableRowOrdering: features.rowOrdering,
    onRowOrderChange: (activeId, overId) =>
      setData((prev) => {
        const from = prev.findIndex((r) => r.id === activeId)
        const to = prev.findIndex((r) => r.id === overId)
        const next = [...prev]
        next.splice(to, 0, ...next.splice(from, 1))
        return next
      }),
    renderDetailPanel: features.detailPanel
      ? ({ row }) => (
          <p className="text-sm text-muted-foreground">
            {row.original.email} · {row.original.city}, {row.original.country}
          </p>
        )
      : undefined,
    enableColumnOrdering: features.columnOrdering,
    enableColumnPinning: features.columnPinning,
    enableColumnResizing: features.columnResizing,
    enableGrouping: features.grouping,
    enableColumnFilters: features.columnFilters,
    enableStickyHeader: features.stickyHeader,
    enableStickyFooter: features.stickyFooter,
    enableAnimations: features.animations,
    // Virtualization scrolls through every row instead of paging them.
    enableRowVirtualization: features.virtualization,
    enablePagination: !features.virtualization,
    enableEditing: features.editing,
    editDisplayMode: editMode,
    initialState: { showColumnFilters: true, pagination: { pageSize: 10 } },
    onEditingRowSave: ({ row, values, exit }) => {
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, ...(values as Partial<User>) } : r
        )
      )
      exit()
    },
    onEditingCellSave: ({ row, column, value }) =>
      setData((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, [column.id]: value } : r))
      ),
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
    renderTopToolbarCustomActions: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <RiSettings3Line />
            Settings
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Rows</DropdownMenuLabel>
            {toggle("rowSelection", "Selection")}
            {toggle("rowNumbers", "Row numbers")}
            {toggle("rowPinning", "Row pinning")}
            {toggle("rowOrdering", "Row dragging")}
            {toggle("detailPanel", "Detail panel")}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Columns</DropdownMenuLabel>
            {toggle("columnOrdering", "Ordering")}
            {toggle("columnPinning", "Pinning")}
            {toggle("columnResizing", "Resizing")}
            {toggle("grouping", "Grouping")}
            {toggle("columnFilters", "Column filters")}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Display</DropdownMenuLabel>
            {toggle("stickyHeader", "Sticky header")}
            {toggle("stickyFooter", "Sticky footer")}
            {toggle("animations", "Animations")}
            {toggle("virtualization", "Virtualization")}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Editing</DropdownMenuLabel>
            {toggle("editing", "Editing")}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger disabled={!features.editing}>
                Mode: {editMode}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={editMode}
                  onValueChange={(mode) => setEditMode(mode as EditDisplayMode)}
                >
                  {(["row", "cell", "modal", "table"] as const).map((mode) => (
                    <DropdownMenuRadioItem key={mode} value={mode}>
                      {mode}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              setFeatures(defaults)
              setEditMode("row")
            }}
          >
            Reset
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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

- [Installation](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/installation): The data table is distributed as a shadcn registry item.
- [Quick start](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/quick-start): A minimal table is two pieces: columns (TanStack column defs, typed with DataTableColumnDef) and a call to useDataTable, whose result you hand to <DataTable />.
- [AI agent setup](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/ai): Set up the data table with a coding agent — Claude Code, Cursor, Codex, Copilot and the like.
- [Migrating from MRT](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/migrating-from-mrt): The data table follows Material React Table (MRT) closely: the same hook-then-component shape, most of the same options, and the same TanStack Table underneath.

## Popular guides

- [Column filtering](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/column-filtering): Each column can expose its own filter control in a per-column filter row.
- [Editing](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/editing): Set enableEditing: true to make rows editable, then choose how editing is presented with editDisplayMode.
- [Server-side data](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/server-side): When your data lives on a server, hand pagination, sorting, and filtering off to it.
- [Part props (slotProps)](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/slot-props): Every part of the table — the scroll surface, rows, cells, toolbars, the search box, edit fields and more — accepts extra props through the slotProps option.
- [Virtualization](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/virtualization): Virtualization renders only the cells currently in view, keeping large tables fast.
- [Row selection](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/row-selection): Set enableRowSelection: true to add a leading checkbox column.

[Browse all guides →](/docs/guides)
