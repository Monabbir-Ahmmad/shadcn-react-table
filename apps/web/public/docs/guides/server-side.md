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

## With React Query

Keep the table's pagination, sorting and search in React state, put them in the query key, and pass the result back as `data` and `rowCount`. `placeholderData: keepPreviousData` keeps the current page on screen while the next one loads; `showProgressBars` follows `isFetching`.

Example (`react-query`):

```tsx
function ReactQueryExample() {
  const [client] = React.useState(() => new QueryClient())
  return (
    <QueryClientProvider client={client}>
      <PeopleFromServer />
    </QueryClientProvider>
  )
}
```

## Columns from the data

When the columns depend on the response, build them with `useMemo` from the data's fields, so they change only when the data does.

Example (`dynamic-columns`):

```tsx
function DynamicColumnsExample() {
  // Columns come from the fetched data's fields.
  const [records, setRecords] = React.useState<Record<string, string>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  React.useEffect(() => {
    let live = true
    void delay(500).then(() => {
      if (!live) return
      setRecords(
        baseUsers.slice(0, 10).map((u) => ({
          id: u.id,
          city: u.city,
          country: u.country,
          status: u.status,
        }))
      )
      setIsLoading(false)
    })
    return () => {
      live = false
    }
  }, [])
  const columns = React.useMemo<DataTableColumnDef<Record<string, string>>[]>(
    () =>
      Object.keys(records[0] ?? {}).map((key) => ({
        accessorKey: key,
        header: key[0]!.toUpperCase() + key.slice(1),
      })),
    [records]
  )
  const table = useDataTable({
    data: records,
    columns,
    getRowId: (row) => row.id!,
    isLoading,
    enablePagination: false,
  })
  return <DataTable table={table} />
}
```

## Related

- [Loading state](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/loading): Pass isLoading: true to render skeleton rows and a progress bar in place of the data.
- [useDataTable options](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/use-data-table): useDataTable(options) accepts everything TanStack's TableOptions accepts (controlled state, on*Change, manual* flags, getRowId, getSubRows, initialState, …; column pinning in state/initialState keeps the left/right shape) plus the data-table options below.
