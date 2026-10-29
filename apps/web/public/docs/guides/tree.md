# Tree data

For hierarchical data, provide TanStack Table's `getSubRows` to tell the table where each row's children live. Expansion turns on automatically.

Example (`tree`):

```tsx
function TreeExample() {
  const data = React.useMemo(() => orgData, [])
  const columns = React.useMemo(() => orgColumns, [])
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getSubRows: (row) => row.subRows,
    enablePagination: false,
    initialState: { expanded: true },
  })
  return <DataTable table={table} />
}
```

## Usage

Return the children array from each row. Set `initialState.expanded: true` to start fully expanded, and usually disable pagination so the tree isn't split across pages.

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  getSubRows: (row) => row.subRows,
  enablePagination: false,
  initialState: {
    expanded: true,
  },
})

return <DataTable table={table} />
```

> **Indentation:** Use `row.depth` inside a cell renderer to indent child rows so the hierarchy
>   reads clearly.

## From a flat list

APIs often return trees as a flat list with parent ids. Build `subRows` once with `useMemo` and pass `getSubRows` as usual.

Example (`tree-from-flat`):

```tsx
function TreeFromFlatExample() {
  // Build `subRows` from `parentId` once.
  const data = React.useMemo(() => {
    const byId = new Map<string, FlatNode>(
      FLAT_ORG.map((node) => [node.id, { ...node }])
    )
    const roots: FlatNode[] = []
    for (const node of byId.values()) {
      const parent = node.parentId ? byId.get(node.parentId) : undefined
      if (parent) (parent.subRows ??= []).push(node)
      else roots.push(node)
    }
    return roots
  }, [])
  const table = useDataTable<FlatNode>({
    data,
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "title", header: "Title" },
    ],
    getRowId: (row) => row.id,
    getSubRows: (row) => row.subRows,
    enablePagination: false,
    initialState: { expanded: true },
  })
  return <DataTable table={table} />
}
```

## Loading children on expand

Let rows expand before their children exist with TanStack's `getRowCanExpand`, and load the children when the row expands (control `expanded` and watch it in `onExpandedChange`).

Example (`lazy-sub-rows`):

```tsx
function LazySubRowsExample() {
  const [data, setData] = React.useState(ROOT_FOLDERS)
  const [expanded, setExpanded] = React.useState<ExpandedState>({})
  const loading = React.useRef(new Set<string>())

  const table = useDataTable<Folder>({
    data,
    columns: [{ accessorKey: "name", header: "Folder" }],
    getRowId: (row) => row.id,
    getSubRows: (row) => row.subRows,
    // Rows can expand before their children are loaded.
    getRowCanExpand: (row) => row.original.hasChildren,
    enablePagination: false,
    state: { expanded },
    onExpandedChange: (updater) => {
      const next = typeof updater === "function" ? updater(expanded) : updater
      setExpanded(next)
      // Load the children of each newly expanded row that has none yet.
      for (const id of Object.keys(next === true ? {} : next)) {
        const row = table.getRow(id)
        if (row.original.subRows || loading.current.has(id)) continue
        loading.current.add(id)
        void delay(500).then(() => {
          setData((prev) =>
            withChildren(
              prev,
              id,
              [1, 2, 3].map((n) => ({
                id: `${id}-${n}`,
                name: `${row.original.name} ${n}`,
                hasChildren: id.split("-").length < 2,
              }))
            )
          )
        })
      }
    },
  })
  return <DataTable table={table} />
}
```

## Editing tree rows

Editing works at any depth: `onEditingRowSave` gets the row, and you update the matching node in your nested data.

Example (`editing-tree`):

```tsx
function EditingTreeExample() {
  const [data, setData] = React.useState(orgData)
  const table = useDataTable<OrgNode>({
    data,
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "title", header: "Title" },
      {
        accessorKey: "headcount",
        header: "Headcount",
        meta: { editVariant: "number", align: "right" },
      },
    ],
    getRowId: (row) => row.id,
    getSubRows: (row) => row.subRows,
    enablePagination: false,
    enableEditing: true,
    editDisplayMode: "row",
    initialState: { expanded: true },
    onEditingRowSave: ({ row, values, exit }) => {
      setData((prev) => updateNode(prev, row.id, values as Partial<OrgNode>))
      exit()
    },
  })
  return <DataTable table={table} />
}
```

## Expand-all toggle

The expand column's header toggles every row. Hide it with `enableExpandAll: false`.

## Related

<Cards>
  <Card href="/docs/guides/detail-panel" title="Detail panel" />
  <Card href="/docs/guides/grouping" title="Grouping & aggregation" />
</Cards>
