# Pagination

The table pages its rows by default, ten to a page, with a page-size menu and first / previous / next / last buttons below the rows.

## Page size and starting page

```tsx
useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  pageSizeOptions: [10, 25, 50],
  initialState: { pagination: { pageIndex: 0, pageSize: 25 } },
})
```

## How the controls look

- `paginationDisplayMode: "default"` — the row range ("1–10 of 48") with first / previous / next / last buttons.
- `paginationDisplayMode: "pages"` — numbered page buttons.
- `paginationDisplayMode: "custom"` — no built-in controls; render your own in `renderBottomToolbarCustomActions`, or place the exported `DataTablePagination` anywhere (see [Composition](/docs/guides/composition)).

`positionPagination` puts the controls at the `"bottom"` (default), `"top"`, `"both"` or `"none"`.

Example (`pagination-pages`):

```tsx
function PaginationPagesExample() {
  const data = React.useMemo(() => makeUsers(120), [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    paginationDisplayMode: "pages",
    positionPagination: "both",
    pageSizeOptions: [5, 10, 20],
    initialState: { pagination: { pageSize: 5 } },
  })
  return <DataTable table={table} />
}
```

## Turning it off

`enablePagination: false` shows every row. Pair it with a bounded surface and [virtualization](/docs/guides/virtualization) for long lists, or with [infinite scroll](/docs/guides/infinite-scroll).

## Server pagination

Set `manualPagination: true`, pass the total `rowCount`, and control `state.pagination` with `onPaginationChange`; the table renders the page you give it. See [Server-side data](/docs/guides/server-side).

## Behavior worth knowing

- Changing a filter or the search goes back to the first page.
- When rows go away (a delete, a refetch) and the current page no longer exists, the table moves to the last page that does — except while `isLoading`, so a refetch doesn't jump pages.
- The range text and page numbers follow the table's language (`localization.language`).

## Relevant options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `enablePagination` | `boolean` | `true` | Splits rows into pages with pagination controls. Default `true`; turn it off for virtualization or infinite scroll. |
| `pageSizeOptions` | `number[]` | `DEFAULT_PAGE_SIZE_OPTIONS` | Choices in the rows-per-page select. Default `[5, 10, 25, 50, 100]`. |
| `paginationDisplayMode` | `PaginationDisplayMode` | `"default"` | Pagination control style: `"default"` (range label + first/prev/next/last buttons), `"pages"` (numbered page buttons), or `"custom"` (render your own via `renderBottomToolbarCustomActions`). Default "default". |
| `positionPagination` | `"top" \| "bottom" \| "both" \| "none"` | `"bottom"` | Where the pagination controls render. Default "bottom". "none" keeps pagination active but hides the controls. |

## Related

- [Server-side data](/docs/guides/server-side)
- [Infinite scroll](/docs/guides/infinite-scroll)
- [Display modes](/docs/guides/display-modes)
