# Event listeners

The data table exposes click handlers for rows and cells so you can react to user interaction.

Example (`event-listeners`):

```tsx
function EventListenersExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const [last, setLast] = React.useState<string | null>(null)
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageSize: 10 } },
    onRowClick: ({ row }) => setLast(row.original.email),
    renderTopToolbarCustomActions: () => (
      <span className="text-xs text-muted-foreground">
        {last ? `Last clicked: ${last}` : "Click any row"}
      </span>
    ),
  })
  return <DataTable table={table} />
}
```

Row handlers (`onRowClick`, `onRowDoubleClick`) receive `{ row, table, event }`. Cell handlers (`onCellClick`, `onCellDoubleClick`) receive `{ cell, row, table, event }`.

```tsx
import { useState } from "react"
import { DataTable, useDataTable } from "@/components/ui/data-table"

const [lastClickedId, setLastClickedId] = useState<string | null>(null)

const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  onRowClick: ({ row }) => {
    setLastClickedId(row.id)
  },
})

return <DataTable table={table} />
```

> **Access the full context:** Because each handler receives the `table` instance and the original `event`,
>   you can read selection state, call other table APIs, or stop propagation
>   directly inside your handler.

## Related

- [useDataTable options](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/use-data-table): useDataTable(options) accepts everything TanStack's TableOptions accepts (controlled state, on*Change, manual* flags, getRowId, getSubRows, initialState, …; column pinning in state/initialState keeps the left/right shape) plus the data-table options below.
