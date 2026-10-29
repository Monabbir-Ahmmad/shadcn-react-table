# Server-side data

When your data lives on a server, hand pagination, sorting, and filtering off to it. All TanStack `manual*` flags pass through.

Example (`server-side`):

```tsx
function ServerSideExample() {
  const all = React.useMemo(() => makeUsers(95), [])
  const [pageIndex, setPageIndex] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)

  // Simulate a paged server response with a short delay.
  const [page, setPage] = React.useState(() => all.slice(0, PAGE_SIZE))
  React.useEffect(() => {
    // Simulated server fetch: flag loading, then resolve the page after a delay.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    const id = setTimeout(() => {
      setPage(all.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE))
      setIsLoading(false)
    }, 400)
    return () => clearTimeout(id)
  }, [all, pageIndex])

  const columns = useUserColumns()
  const table = useDataTable({
    data: page,
    columns,
    getRowId: (row) => row.id,
    isLoading,
    manualPagination: true,
    rowCount: all.length,
    state: { pagination: { pageIndex, pageSize: PAGE_SIZE } },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize: PAGE_SIZE })
          : updater
      setPageIndex(next.pageIndex)
    },
  })
  return <DataTable table={table} />
}
```

## Server pagination

Set `manualPagination: true`, supply the total `rowCount`, control `state.pagination`, and handle `onPaginationChange`. Use `isLoading` to show a loading state while fetching.

```tsx
import { useState } from "react"
import { DataTable, useDataTable } from "@/components/ui/data-table"

const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
const { data, rowCount, isFetching } = useUsers(pagination)

const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  manualPagination: true,
  rowCount,
  state: { pagination },
  onPaginationChange: setPagination,
  isLoading: isFetching,
})

return <DataTable table={table} />
```

## Server sorting and filtering

The same pattern applies to other operations:

- Sorting: `manualSorting: true` + `state.sorting` + `onSortingChange`.
- Filtering: `manualFiltering: true` + `state.columnFilters` / `globalFilter`.

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  manualSorting: true,
  state: { sorting },
  onSortingChange: setSorting,
  manualFiltering: true,
})
```

> **Facets are not auto-computed:** In manual filtering, faceted option lists and min/max values are not computed
>   from the data — the server supplies the rows, so you must provide facet
>   options yourself if you use them.

## Related

- [Loading state](/docs/guides/loading)
- [useDataTable options](/docs/api/use-data-table)
