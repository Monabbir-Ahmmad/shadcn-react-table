# Cell actions

Cells can have a right-click menu. Turn on the built-in one with `enableCellActions: true` — it offers **Copy** (when click-to-copy is on) and **Edit** (when the cell is editable) — or decide per cell with `enableCellActions: (cell) => boolean`.

Example (`cell-actions`):

```tsx
function CellActionsExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    // Copy from the right-click menu; it also gets the built-in Edit item.
    enableClickToCopy: "context-menu",
    enableCellActions: true,
    enableEditing: true,
    initialState: { pagination: { pageSize: 10 } },
    renderCellActionMenuItems: ({ cell, internalMenuItems }) => (
      <>
        {internalMenuItems}
        <ContextMenuItem
          onClick={() =>
            navigator.clipboard?.writeText(JSON.stringify(cell.row.original))
          }
        >
          Copy row as JSON
        </ContextMenuItem>
      </>
    ),
  })
  return <DataTable table={table} />
}
```

## Your own items

`renderCellActionMenuItems` sets the menu's contents (and turns the menu on). It receives `{ cell, row, table, internalMenuItems, closeMenu }`: place `internalMenuItems` where the built-in items should go, or leave it out to replace them, and call `closeMenu()` from anything that isn't a menu item.

```tsx
import { ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu"

const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableCellActions: true,
  enableEditing: true,
  renderCellActionMenuItems: ({ cell, internalMenuItems }) => (
    <>
      {internalMenuItems}
      <ContextMenuSeparator />
      <ContextMenuItem onSelect={() => search(String(cell.getValue()))}>
        Search for this
      </ContextMenuItem>
    </>
  ),
})

return <DataTable table={table} />
```

## Click to copy

Enable click-to-copy on every cell with `enableClickToCopy: true`, or scope it to a single column through its `meta`. Set it to `"context-menu"` to copy from the cell menu instead of on click, or pass `(cell) => boolean | "context-menu"` to decide per cell.

```tsx
const columns = [
  {
    accessorKey: "email",
    header: "Email",
    meta: { enableClickToCopy: true },
  },
]
```

## Column actions menu

`renderColumnActionsMenuItems` sets the contents of every column header's actions menu. It receives `{ column, table, internalMenuItems, closeMenu }`: put `internalMenuItems` where the built-in sort / filter / hide / group / pin items should go, or leave it out to replace them.

```tsx
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  renderColumnActionsMenuItems: ({ column, internalMenuItems }) => (
    <>
      {internalMenuItems}
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => exportColumn(column.id)}>
        Export column
      </DropdownMenuItem>
    </>
  ),
})
```

Example (`column-actions-menu`):

```tsx
function ColumnActionsMenuExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageSize: 10 } },
    renderColumnActionsMenuItems: ({ column, table, internalMenuItems }) => (
      <>
        {internalMenuItems}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            table.setColumnVisibility(
              Object.fromEntries(
                table
                  .getAllLeafColumns()
                  .map((c) => [c.id, c.id === column.id || !c.getCanHide()])
              )
            )
          }
        >
          Show only this column
        </DropdownMenuItem>
      </>
    ),
  })
  return <DataTable table={table} />
}
```

## Related

<Cards>
  <Card href="/docs/guides/row-actions" title="Row actions" />
</Cards>
