# Custom icons

Every glyph is a named slot. Override any subset with the `icons` option, which accepts a partial. Defaults come from [Lucide](https://lucide.dev) (shadcn's default icon library), but you can swap in any icon library.

Example (`custom-icons`):

```tsx
function CustomIconsExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    icons: {
      sortAscending: RiSortAsc,
      sortDescending: RiSortDesc,
      columnActions: RiMoreFill,
      columnVisibility: RiEqualizerLine,
    },
    initialState: { showColumnFilters: true, pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}
```

Each value is a component that accepts a `className`, so any icon library works — here swapping in Remix Icon:

```tsx
import { DataTable, useDataTable } from "@/components/ui/data-table"
import { RiArrowDownLine, RiArrowUpLine, RiSearchLine } from "@remixicon/react"

const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  icons: {
    sortAscending: RiArrowUpLine,
    sortDescending: RiArrowDownLine,
    search: RiSearchLine,
  },
})

return <DataTable table={table} />
```

## App-wide defaults

For icon (and localization) defaults shared across many tables, wrap a subtree in `DataTableConfigProvider`.

```tsx
import { DataTableConfigProvider } from "@/components/ui/data-table"
import { RiSearchLine } from "@remixicon/react"

<DataTableConfigProvider icons={{ search: RiSearchLine }}>
  {children}
</DataTableConfigProvider>
```

> **Precedence:** Values resolve in this order: built-in defaults → `DataTableConfigProvider` →
>   per-call options. Per-call `icons` always win.

## Related

- [Icon slot reference](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/icons): Every glyph the table renders is a named slot.
- [Localization](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/localization): The table ships in 38 languages.
- [useDataTable options](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/use-data-table): useDataTable(options) accepts everything TanStack's TableOptions accepts (controlled state, on*Change, manual* flags, getRowId, getSubRows, initialState, …; column pinning in state/initialState keeps the left/right shape) plus the data-table options below.
