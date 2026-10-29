# Infinite scroll

Infinite scroll loads more rows as the user scrolls toward the bottom, instead of paging through the data. Set `enableInfiniteScroll: true` and drive it with three controlled props: `onLoadMore`, `hasNextPage`, and `isFetchingNextPage`.

Example (`infinite-scroll`):

```tsx
function InfiniteScrollExample() {
  const all = React.useMemo(() => makeUsers(INFINITE_TOTAL), [])
  const [rows, setRows] = React.useState(() => all.slice(0, INFINITE_CHUNK))
  const [isFetchingNextPage, setIsFetchingNextPage] = React.useState(false)
  const hasNextPage = rows.length < all.length

  // Stable loader (memoized on `all`) so the table doesn't re-trigger every
  // render. The hook already gates on hasNextPage / isFetchingNextPage.
  const loadMore = React.useCallback(() => {
    setIsFetchingNextPage(true)
    // Simulate a server round-trip, then append the next chunk.
    setTimeout(() => {
      setRows((prev) =>
        all.slice(0, Math.min(prev.length + INFINITE_CHUNK, all.length))
      )
      setIsFetchingNextPage(false)
    }, 600)
  }, [all])

  const columns = useUserColumns()
  const table = useDataTable({
    slotProps: { surface: { className: "max-h-[460px]" } },
    data: rows,
    columns,
    getRowId: (row) => row.id,
    enableInfiniteScroll: true,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: loadMore,
    renderTopToolbarCustomActions: () => (
      <span className="text-xs text-muted-foreground tabular-nums">
        Loaded {rows.length} of {all.length}
      </span>
    ),
  })
  return <DataTable table={table} />
}
```

When infinite scroll is on, the pager is hidden and pagination is forced to a single growing page, so every appended row renders. The table watches a sentinel near the bottom of the scroll surface and calls `onLoadMore` only when the sentinel nears the viewport **and** `hasNextPage` is true **and** a fetch is not already in flight.

## Controlled fetch state

You own the data and the loading flags; the table only decides *when* to ask for more. Append the next chunk to `data` in your `onLoadMore` handler.

```tsx
import { DataTable, useDataTable } from "@/components/ui/data-table"

function Table() {
  const [rows, setRows] = React.useState(() => firstPage)
  const [isFetchingNextPage, setIsFetchingNextPage] = React.useState(false)
  const hasNextPage = rows.length < total

  // Memoize so the table doesn't re-trigger on every render.
  const loadMore = React.useCallback(() => {
    setIsFetchingNextPage(true)
    fetchNextPage(rows.length).then((next) => {
      setRows((prev) => [...prev, ...next])
      setIsFetchingNextPage(false)
    })
  }, [rows.length])

  const table = useDataTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    enableInfiniteScroll: true,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: loadMore,
  })

  return <DataTable table={table} />
}
```

> **Pairs with TanStack Query:** The contract maps one-to-one onto TanStack Query's `useInfiniteQuery`: pass
>   `fetchNextPage` as `onLoadMore`, and forward `hasNextPage` /
>   `isFetchingNextPage` straight through.

## Prefetch distance

`infiniteScrollThreshold` (default `200`) is the distance in pixels from the bottom at which the next chunk is requested, so data arrives before the user hits the end.

```tsx
const table = useDataTable({
  data: rows,
  columns,
  enableInfiniteScroll: true,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore: loadMore,
  infiniteScrollThreshold: 400,
})
```

## Works with or without virtualization

The sentinel sits after the rendered window, so infinite scroll works whether or not row virtualization is on. For very large loaded datasets, pair it with `enableRowVirtualization` so only the visible rows render.

```tsx
const table = useDataTable({
  data: rows,
  columns,
  enableInfiniteScroll: true,
  enableRowVirtualization: true,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore: loadMore,
})
```

> **Reset on sort / filter changes:** In server mode, resetting the query (on a new sort or filter) is your job:
>   replace `data` with the first page again. The sentinel re-observes the new
>   rows automatically.

## Relevant options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `enableInfiniteScroll` | `boolean` | `false` | Load more rows as the user scrolls near the bottom (infinite append). When on, the pager is hidden and pagination is forced to a single growing page, so all appended rows render. Fully controlled: the table calls `onLoadMore` only when the bottom sentinel nears the viewport AND `hasNextPage` AND `!isFetchingNextPage`. Pairs directly with TanStack Query's `useInfiniteQuery` (`fetchNextPage`/`hasNextPage`/`isFetchingNextPage`). Default false. |
| `onLoadMore` | `() => void` |  | Called to request the next chunk. Should be stable (memoized) so the table doesn't re-trigger on every render. Append the result to `data`. |
| `hasNextPage` | `boolean` | `false` | Whether more rows remain to be loaded. Default false. |
| `isFetchingNextPage` | `boolean` | `false` | Whether a load is currently in flight (blocks re-triggering). Default false. |
| `infiniteScrollThreshold` | `number` | `200` | Distance in px from the bottom at which to prefetch. Default 200. |

## Related

<Cards>
  <Card href="/docs/guides/server-side" title="Server-side data" />
  <Card href="/docs/guides/virtualization" title="Virtualization" />
  <Card href="/docs/api/use-data-table" title="useDataTable options" />
</Cards>
