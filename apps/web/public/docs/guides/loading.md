# Loading state

Pass `isLoading: true` to render skeleton rows and a progress bar in place of the data. Flip it back to `false` to reveal the real rows. This is especially useful with server-side data, where you toggle it around each fetch.

Example (`loading`):

```tsx
function LoadingExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const [isLoading, setIsLoading] = React.useState(true)
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    isLoading,
    initialState: { pagination: { pageSize: 10 } },
    renderTopToolbarCustomActions: () => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsLoading((v) => !v)}
      >
        {isLoading ? "Show data" : "Show loading"}
      </Button>
    ),
  })
  return <DataTable table={table} />
}
```

## Usage

Drive `isLoading` from your own state and toggle it however you like — here with `useState` and a button in `renderTopToolbarCustomActions`:

```tsx
const [isLoading, setIsLoading] = useState(false)

const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  isLoading,
  renderTopToolbarCustomActions: () => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsLoading((prev) => !prev)}
    >
      {isLoading ? "Show data" : "Show loading"}
    </Button>
  ),
})

return <DataTable table={table} />
```

Example (`empty-state`):

```tsx
function EmptyStateExample() {
  const columns = useUserColumns()
  const table = useDataTable({
    data: [] as User[],
    columns,
    getRowId: (row) => row.id,
    renderEmpty: () => (
      <div className="flex flex-col items-center gap-2 py-6">
        <span className="font-medium">No people yet</span>
        <span className="text-muted-foreground">
          Invite your team to see them here.
        </span>
        <Button size="sm" variant="outline">
          <RiAddLine />
          Invite
        </Button>
      </div>
    ),
  })
  return <DataTable table={table} />
}
```

## Reading the state

You can read the current value back from the table instance:

```tsx
if (table.dataTable.isLoading) {
  // skeletons + progress bar are showing
}
```

> **Pairs well with server-side data:** Set `isLoading` to `true` before a request and back to `false` when it
>   resolves so users always see the skeletons while new pages or filtered results
>   load.

## Saving state

For an in-flight mutation (rather than an initial load), set `isSaving: true`. It shows the progress bar without replacing rows with skeletons, so the current data stays visible while the save runs.

```tsx
useDataTable({ data, columns, getRowId: (row) => row.id, isSaving })
```

## Choosing which affordances show

`isLoading` turns on three affordances together; override any of them independently:

- `showProgressBars` — the top progress bar (default `isLoading || isSaving`).
- `showSkeletons` — skeleton rows while the body is empty (default `isLoading`). The skeletons are drawn in each column, at the column's width and pinning, with bars of varying length. Pass `showSkeletons: true` to cover rows already shown too — handy while refetching — instead of dimming them. Style the bars with `slotProps.skeleton`.
- `showLoadingOverlay` — a dimming overlay over existing rows (default `isLoading`).

```tsx
useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  isLoading,
  showSkeletons: false, // keep rows visible, just dim + show the progress bar
})
```

## Relevant options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `isLoading` | `boolean` | `false` | Show the loading affordances (progress bar; skeletons when empty; a dimming overlay over existing rows). Toggle each independently below. |
| `isSaving` | `boolean` | `false` | Show the progress bar for an in-flight save/mutation. Defaults the progress bar on without replacing rows with skeletons. |
| `showProgressBars` | `boolean` |  | Show the top progress bar. Default: `isLoading \|\| isSaving`. |
| `showSkeletons` | `boolean` |  | Show skeleton rows while the body is empty. Default: `isLoading`. Passing `true` also covers rows already shown with skeletons (e.g. while refetching), instead of dimming them. |
| `showLoadingOverlay` | `boolean` |  | Dim existing rows with an overlay while loading. Default: `isLoading`. |

## Related

- [Server-side data](/docs/guides/server-side)
