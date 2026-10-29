# Editing

Set `enableEditing: true` to make rows editable, then choose how editing is presented with `editDisplayMode`. Per-column behavior is configured through column `meta`.

## Cell editing

`editDisplayMode: "cell"` is the default. Click a cell to edit it inline and commit the new value with `onEditingCellSave`.

Example (`editing-cell`):

```tsx
// <EditingExample mode="cell" />
function EditingExample({ mode }: { mode: EditDisplayMode }) {
  const [data, setData] = React.useState(() => makeUsers(12))
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableEditing: true,
    editDisplayMode: mode,
    enablePagination: false,
    createRowDefaults: {
      firstName: "",
      lastName: "",
      email: "",
      role: "Viewer",
      department: "Engineering",
      status: "pending",
      age: 30,
      salary: 50000,
    },
    onEditingCellSave: ({ row, column, value }) =>
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? ({ ...r, [column.id]: value } as User) : r
        )
      ),
    onEditingRowSave: ({ row, values, exit }) => {
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, ...(values as Partial<User>) } : r
        )
      )
      exit()
    },
    onCreatingRowSave: ({ values, exit }) => {
      setData((prev) => [
        {
          ...makeUsers(1)[0]!,
          id: `U-${2000 + prev.length}`,
          ...(values as Partial<User>),
        },
        ...prev,
      ])
      exit()
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Button variant="outline" size="sm" onClick={() => table.beginCreate()}>
        <RiAddLine />
        New
      </Button>
    ),
  })
  return <DataTable table={table} />
}
```

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableEditing: true,
  editDisplayMode: "cell",
  onEditingCellSave: ({ row, column, value }) => {
    setData((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, [column.id]: value } : r))
    )
  },
})

return <DataTable table={table} />
```

## Row editing

`editDisplayMode: "row"` edits a whole row at once with save/cancel controls. Persist the row with `onEditingRowSave`, then call `exit()` to leave edit mode.

Example (`editing-row`):

```tsx
// <EditingExample mode="row" />
function EditingExample({ mode }: { mode: EditDisplayMode }) {
  const [data, setData] = React.useState(() => makeUsers(12))
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableEditing: true,
    editDisplayMode: mode,
    enablePagination: false,
    createRowDefaults: {
      firstName: "",
      lastName: "",
      email: "",
      role: "Viewer",
      department: "Engineering",
      status: "pending",
      age: 30,
      salary: 50000,
    },
    onEditingCellSave: ({ row, column, value }) =>
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? ({ ...r, [column.id]: value } as User) : r
        )
      ),
    onEditingRowSave: ({ row, values, exit }) => {
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, ...(values as Partial<User>) } : r
        )
      )
      exit()
    },
    onCreatingRowSave: ({ values, exit }) => {
      setData((prev) => [
        {
          ...makeUsers(1)[0]!,
          id: `U-${2000 + prev.length}`,
          ...(values as Partial<User>),
        },
        ...prev,
      ])
      exit()
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Button variant="outline" size="sm" onClick={() => table.beginCreate()}>
        <RiAddLine />
        New
      </Button>
    ),
  })
  return <DataTable table={table} />
}
```

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableEditing: true,
  editDisplayMode: "row",
  onEditingRowSave: ({ row, values, exit }) => {
    setData((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, ...values } : r))
    )
    exit()
  },
})

return <DataTable table={table} />
```

## Table editing

`editDisplayMode: "table"` keeps every editable cell in edit mode at all times, like a spreadsheet.

Example (`editing-table`):

```tsx
// <EditingExample mode="table" />
function EditingExample({ mode }: { mode: EditDisplayMode }) {
  const [data, setData] = React.useState(() => makeUsers(12))
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableEditing: true,
    editDisplayMode: mode,
    enablePagination: false,
    createRowDefaults: {
      firstName: "",
      lastName: "",
      email: "",
      role: "Viewer",
      department: "Engineering",
      status: "pending",
      age: 30,
      salary: 50000,
    },
    onEditingCellSave: ({ row, column, value }) =>
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? ({ ...r, [column.id]: value } as User) : r
        )
      ),
    onEditingRowSave: ({ row, values, exit }) => {
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, ...(values as Partial<User>) } : r
        )
      )
      exit()
    },
    onCreatingRowSave: ({ values, exit }) => {
      setData((prev) => [
        {
          ...makeUsers(1)[0]!,
          id: `U-${2000 + prev.length}`,
          ...(values as Partial<User>),
        },
        ...prev,
      ])
      exit()
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Button variant="outline" size="sm" onClick={() => table.beginCreate()}>
        <RiAddLine />
        New
      </Button>
    ),
  })
  return <DataTable table={table} />
}
```

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableEditing: true,
  editDisplayMode: "table",
  onEditingCellSave: ({ row, column, value }) => {
    setData((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, [column.id]: value } : r))
    )
  },
})
```

## Modal editing & creating

`editDisplayMode: "modal"` edits (and creates) rows in a dialog. Use `onEditingRowSave` for edits and `onCreatingRowSave` for new rows; both receive `exit()` to close the dialog. Seed the create form with `createRowDefaults`, and open it from the toolbar via `table.beginCreate()`.

Example (`editing-modal`):

```tsx
// <EditingExample mode="modal" />
function EditingExample({ mode }: { mode: EditDisplayMode }) {
  const [data, setData] = React.useState(() => makeUsers(12))
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableEditing: true,
    editDisplayMode: mode,
    enablePagination: false,
    createRowDefaults: {
      firstName: "",
      lastName: "",
      email: "",
      role: "Viewer",
      department: "Engineering",
      status: "pending",
      age: 30,
      salary: 50000,
    },
    onEditingCellSave: ({ row, column, value }) =>
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? ({ ...r, [column.id]: value } as User) : r
        )
      ),
    onEditingRowSave: ({ row, values, exit }) => {
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, ...(values as Partial<User>) } : r
        )
      )
      exit()
    },
    onCreatingRowSave: ({ values, exit }) => {
      setData((prev) => [
        {
          ...makeUsers(1)[0]!,
          id: `U-${2000 + prev.length}`,
          ...(values as Partial<User>),
        },
        ...prev,
      ])
      exit()
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Button variant="outline" size="sm" onClick={() => table.beginCreate()}>
        <RiAddLine />
        New
      </Button>
    ),
  })
  return <DataTable table={table} />
}
```

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableEditing: true,
  editDisplayMode: "modal",
  createRowDefaults: { name: "", role: "member" },
  onEditingRowSave: ({ row, values, exit }) => {
    setData((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, ...values } : r))
    )
    exit()
  },
  onCreatingRowSave: ({ values, exit }) => {
    setData((prev) => [...prev, { id: crypto.randomUUID(), ...values }])
    exit()
  },
  renderTopToolbarCustomActions: ({ table }) => (
    <Button size="sm" onClick={() => table.beginCreate()}>
      New row
    </Button>
  ),
})
```

### Cancelling

`onEditingRowCancel({ row, table })` and `onCreatingRowCancel({ table })` run when the user cancels — the Cancel button, closing the dialog, or the row's cancel button. They don't run after a save calls `exit()`.

### Custom dialog content

`renderEditRowDialogContent` and `renderCreateRowDialogContent` replace what's inside the dialog. They receive the built-in fields as `internalEditComponents`, plus `save()`, `cancel()` and `hasErrors`. Include a `DialogTitle` so the dialog keeps its accessible name.

```tsx
import { DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

useDataTable({
  data,
  columns,
  enableEditing: true,
  editDisplayMode: "modal",
  renderEditRowDialogContent: ({
    row,
    internalEditComponents,
    save,
    cancel,
    hasErrors,
  }) => (
    <>
      <DialogHeader>
        <DialogTitle>Edit {row.original.name}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">{internalEditComponents}</div>
      <DialogFooter>
        <Button variant="outline" onClick={cancel}>
          Discard
        </Button>
        <Button onClick={save} disabled={hasErrors}>
          Save changes
        </Button>
      </DialogFooter>
    </>
  ),
})
```

Example (`edit-dialog`):

```tsx
function EditDialogExample() {
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
    // Two columns of fields and our own buttons.
    renderEditRowDialogContent: ({
      row,
      internalEditComponents,
      save,
      cancel,
      hasErrors,
    }) => (
      <>
        <DialogHeader>
          <DialogTitle>
            Edit {row.original.firstName} {row.original.lastName}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">{internalEditComponents}</div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={cancel}>
            Discard
          </Button>
          <Button size="sm" onClick={save} disabled={hasErrors}>
            Save changes
          </Button>
        </DialogFooter>
      </>
    ),
  })
  return <DataTable table={table} />
}
```

### Inline create row position

With `createDisplayMode: "row"`, the create row sits above the data. Set `positionCreatingRow: "bottom"` to put it below, or a row index (`positionCreatingRow: 3`) to insert it before that row on the current page.

Example (`create-row`):

```tsx
function CreateRowExample() {
  const [data, setData] = React.useState(() => baseUsers.slice(0, 8))
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableEditing: true,
    createDisplayMode: "row",
    positionCreatingRow: "bottom",
    createRowDefaults: { role: "Viewer", status: "pending" },
    onCreatingRowSave: ({ values, exit }) => {
      setData((prev) => [
        ...prev,
        { ...baseUsers[0]!, ...values, id: `U-new-${prev.length}` } as User,
      ])
      exit()
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Button size="sm" onClick={() => table.beginCreate()}>
        <RiAddLine />
        Add person
      </Button>
    ),
  })
  return <DataTable table={table} />
}
```

## Per-column editing config

Configure editors on each column's `meta`:

- `editVariant: "text" | "number" | "select"` — the input type.
- `editSelectOptions` — options for the `"select"` variant, or `({ row, column, table }) => options` to vary them by row (`row` is undefined when creating).
- `validate: (value) => string | undefined` — return a message to block the save.
- `enableEditing: false` — lock a single column, or `(row) => boolean` to lock it on some rows.

```tsx
const columns = [
  {
    accessorKey: "role",
    header: "Role",
    meta: {
      editVariant: "select",
      editSelectOptions: ["admin", "member", "viewer"],
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: {
      editVariant: "text",
      validate: (value) =>
        /.+@.+\..+/.test(value) ? undefined : "Enter a valid email",
    },
  },
  {
    accessorKey: "id",
    header: "ID",
    meta: { enableEditing: false },
  },
]
```

## Editing some rows only

Pass a function as `enableEditing` to decide row by row. Rows it returns `false` for show no click-to-edit cells and no edit button; creating new rows still works. The same works per column with `meta.enableEditing`.

```tsx
const table = useDataTable({
  data,
  columns: [
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "salary",
      header: "Salary",
      // Only managers' salaries are editable.
      meta: { enableEditing: (row) => row.original.role === "manager" },
    },
  ],
  enableEditing: (row) => !row.original.archived,
})
```

To check a row yourself, call `table.dataTable.getCanEditRow(row)`.

Example (`editing-per-row`):

```tsx
function EditingPerRowExample() {
  const [data, setData] = React.useState(() => baseUsers.slice(0, 12))
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableEditing: (row) => row.original.status !== "inactive",
    editDisplayMode: "cell",
    onEditingCellSave: ({ row, column, value }) =>
      setData((prev) =>
        prev.map((user) =>
          user.id === row.id ? { ...user, [column.id]: value } : user
        )
      ),
    slotProps: {
      bodyRow: ({ row }) => ({
        className:
          row.original.status === "inactive"
            ? "text-muted-foreground"
            : undefined,
      }),
    },
  })
  return <DataTable table={table} />
}
```

## Custom editor

When `editVariant` isn't enough, supply your own editor with `meta.renderEditCell`. It replaces the built-in field while the cell/row is editing; drive the value through the table instance (`setRowDraftValue` for row/modal editing, or `onEditingCellSave` for cell editing):

```tsx
{
  accessorKey: "status",
  header: "Status",
  meta: {
    renderEditCell: ({ cell, table }) => (
      <MyStatusPicker
        value={cell.getValue() as string}
        onChange={(value) =>
          table.setRowDraftValue(cell.column.id, value)
        }
      />
    ),
  },
}
```

## Relevant options

`useDataTable` options that drive editing and creating:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `enableEditing` | `boolean \| ((row: DataTableRow<TData>) => boolean)` | `false` | Enable inline editing, or decide per row with a function (rows it returns false for can't be edited; creating rows is still allowed). |
| `editDisplayMode` | `EditDisplayMode` | `"cell"` | How edits are surfaced. Default "cell". |
| `createDisplayMode` | `CreateDisplayMode` | `"modal"` | How the create form is surfaced, independent of `editDisplayMode`: `"modal"` (dialog, default), `"row"` (an inline editable row at the top of the table), or `"custom"` (you render it from `isCreating` + `rowDraft`). |
| `createRowDefaults` | `Record<string, unknown>` |  | Default values for the create form, keyed by column id. |
| `onEditingCellSave` | `(props: { row: DataTableRow<TData> column: DataTableColumn<TData, unknown> value: unknown table: DataTableInstance<TData> }) => void` |  | Called when a cell edit is committed (cell and table editing) with the new `value`. Persist it; the table does not change `data` itself. |
| `onEditingRowSave` | `(props: { row: DataTableRow<TData> values: Record<string, unknown> table: DataTableInstance<TData> exit: () => void }) => void` |  | Called when a row edit is saved (row and modal editing) with the edited `values`. Call `exit()` to leave editing, e.g. after the save succeeds. |
| `onCreatingRowSave` | `(props: { values: Record<string, unknown> table: DataTableInstance<TData> exit: () => void }) => void` |  | Called when the new-row editor is saved with the row's `values`. Call `exit()` to close it. |

Per-column, via `columnDef.meta`:

| meta key | Type | Default | Description |
| --- | --- | --- | --- |
| `enableEditing` | `boolean \| ((row: DataTableRow<TData>) => boolean)` |  | Allow editing this column (defaults to true when table editing is on), or decide per row with a function. |
| `editVariant` | `EditVariant` |  | Inline editor variant. Defaults to "text". |
| `editSelectOptions` | `\| DataTableFilterOption[] \| ((props: { row?: DataTableRow<TData> column: DataTableColumn<TData, unknown> table: DataTableInstance<TData> }) => DataTableFilterOption[])` |  | Options for the "select" edit variant, or a function returning them for the row being edited (`row` is undefined in the create form). |
| `renderEditCell` | `(props: CellRenderProps<TData, TValue>) => React.ReactNode` |  | Custom inline editor for this column (escape hatch). Replaces the built-in editor while the cell/row is editing; read the draft from `table.getState().rowDraft` and write it with `table.setRowDraftValue` (row editing), or save with `onEditingCellSave` (cell editing). |
| `validate` | `(value: unknown) => string \| undefined` |  | Validate an edited value; return an error message or undefined if valid. |

## Related

<Cards>
  <Card href="/docs/guides/display-modes" title="Display modes" />
  <Card href="/docs/api/column-options" title="Column options" />
  <Card href="/docs/api/table-instance" title="Table instance" />
  <Card href="/docs/guides/row-actions" title="Row actions" />
</Cards>
