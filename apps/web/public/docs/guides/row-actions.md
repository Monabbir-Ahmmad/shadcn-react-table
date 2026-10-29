# Row actions

Provide `renderRowActions` to add a trailing actions column. It receives `{ row, table }` and returns whatever controls you need — for example a delete button.

Example (`row-actions`):

```tsx
function RowActionsExample() {
  const [data, setData] = React.useState(() => baseUsers)
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageSize: 10 } },
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
  })
  return <DataTable table={table} />
}
```

## Usage

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  renderRowActions: ({ row }) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={() =>
        setData((prev) => prev.filter((r) => r.id !== row.original.id))
      }
    >
      <RiDeleteBinLine />
      <span className="sr-only">Delete</span>
    </Button>
  ),
})

return <DataTable table={table} />
```

> **Combine with editing:** Row actions sit alongside editing controls — wire up an edit button here to
>   start row editing programmatically.

## As a menu

For a compact kebab menu instead of inline buttons, use `renderRowActionMenuItems`. It returns the menu items (e.g. `DropdownMenuItem`s) rendered inside an auto-injected dropdown in the actions column. Both slots can be combined — inline controls plus a menu.

While editing is on (`"row"` or `"modal"` display), the Edit action moves into this menu: it arrives as `internalMenuItems`. The callback also gets `closeMenu()`.

```tsx
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableEditing: true,
  editDisplayMode: "modal",
  renderRowActionMenuItems: ({ row, internalMenuItems }) => (
    <>
      {internalMenuItems}
      <DropdownMenuItem variant="destructive" onClick={() => remove(row.id)}>
        Delete
      </DropdownMenuItem>
    </>
  ),
})
```

Example (`row-actions-menu`):

```tsx
function RowActionsMenuExample() {
  const [data, setData] = React.useState(() => baseUsers.slice(0, 12))
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableEditing: true,
    editDisplayMode: "modal",
    onEditingRowSave: ({ row, values, exit }) => {
      setData((prev) =>
        prev.map((user) => (user.id === row.id ? { ...user, ...values } : user))
      )
      exit()
    },
    // The built-in Edit item, then our own.
    renderRowActionMenuItems: ({ row, internalMenuItems }) => (
      <>
        {internalMenuItems}
        <DropdownMenuItem
          variant="destructive"
          onClick={() =>
            setData((prev) => prev.filter((user) => user.id !== row.id))
          }
        >
          <RiDeleteBinLine />
          Delete
        </DropdownMenuItem>
      </>
    ),
  })
  return <DataTable table={table} />
}
```

## Positioning the column

The actions column trails the data columns by default. Set `positionActionsColumn: "first"` to move it to the leading edge.

```tsx
useDataTable({
  renderRowActions: ({ row }) => <RowMenu row={row} />,
  positionActionsColumn: "first", // "first" | "last"
})
```

## Related

- [Cell actions](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/cell-actions): Cells can have a right-click menu.
- [Editing](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/editing): Set enableEditing: true to make rows editable, then choose how editing is presented with editDisplayMode.
