# Row dragging

Rows can be dragged out of a table — onto another table, or onto a drop zone of your own — with the pointer, touch or the keyboard. (To reorder rows inside one table, see [Row ordering](/docs/guides/row-ordering).)

## Between tables

Wrap the tables in `DataTableDndProvider`, turn on `enableRowDragging` on the table rows leave from, and move the row in `onRowDragEnd`:

```tsx
import { DataTable, DataTableDndProvider, useDataTable } from "@/components/ui/data-table"

function Lists() {
  const [todo, setTodo] = React.useState(initialTodo)
  const [done, setDone] = React.useState(initialDone)

  const todoTable = useDataTable({
    data: todo,
    columns,
    getRowId: (row) => row.id,
    enableRowDragging: true,
    onRowDragEnd: ({ row, over }) => {
      if (over.type === "table" && over.table === doneTable) {
        setTodo((rows) => rows.filter((r) => r.id !== row.id))
        setDone((rows) => [...rows, row.original])
      }
    },
  })
  const doneTable = useDataTable({ data: done, columns, getRowId: (row) => row.id })

  return (
    <DataTableDndProvider>
      <DataTable table={todoTable} className="data-[drop-target]:ring-2 data-[drop-target]:ring-primary" />
      <DataTable table={doneTable} className="data-[drop-target]:ring-2 data-[drop-target]:ring-primary" />
    </DataTableDndProvider>
  )
}
```

`over` says where the row landed: `{ type: "table", table, rowId? }` (the table, and the row it was dropped on, if any) or `{ type: "zone", id }`. While a row from another table is over a table, the table's root has a `data-drop-target` attribute, so you can highlight it with `data-[drop-target]:…` classes. A floating preview follows the pointer.

Each table inside the provider keeps its own column and row reordering and drag-to-group, and the tables may share row and column ids.

## Drop zones

Make any element a drop target with `useDataTableDropZone(id)` inside the provider:

```tsx
import { useDataTableDropZone } from "@/components/ui/data-table"

function Trash() {
  const { setNodeRef, isOver } = useDataTableDropZone("trash")
  return (
    <div ref={setNodeRef} className={isOver ? "bg-destructive/10" : undefined}>
      Drop here to delete
    </div>
  )
}
```

A row dropped there calls `onRowDragEnd` with `over: { type: "zone", id: "trash" }`.

Example (`row-dragging`):

```tsx
function RowDraggingExample() {
  const [todo, setTodo] = React.useState<Task[]>([
    { id: "t1", title: "Write the release notes" },
    { id: "t2", title: "Review the migration guide" },
    { id: "t3", title: "Record the demo" },
  ])
  const [done, setDone] = React.useState<Task[]>([
    { id: "t4", title: "Ship slotProps" },
  ])
  const move =
    (from: "todo" | "done") => (task: Task, to: "other" | "trash") => {
      const [setFrom, setTo] =
        from === "todo" ? [setTodo, setDone] : [setDone, setTodo]
      setFrom((rows) => rows.filter((r) => r.id !== task.id))
      if (to === "other") setTo((rows) => [...rows, task])
    }
  return (
    <DataTableDndProvider>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <TaskList title="To do" tasks={todo} onDragEnd={move("todo")} />
          <TaskList title="Done" tasks={done} onDragEnd={move("done")} />
        </div>
        <Trash />
      </div>
    </DataTableDndProvider>
  )
}
```

## Reordering too

`enableRowDragging` only adds the drag handle; combine it with `enableRowOrdering` (and `onRowOrderChange`) to reorder inside the table as well.

## Relevant options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `enableRowDragging` | `boolean` | `false` | Adds a drag handle to each row for moving rows out of the table — to another table or a drop zone in the same `DataTableDndProvider` — without reordering inside it (combine with `enableRowOrdering` for both). Default false. |
| `onRowDragEnd` | `(props: { row: DataTableRow<TData> table: DataTableInstance<TData> over: RowDropTarget }) => void` |  | Called when a row is dropped on another table or a drop zone in the same `DataTableDndProvider`. Move the row in your data. |
| `enableRowOrdering` | `boolean` | `false` | Drag-and-drop row reordering (adds a drag-handle column). |
| `onRowOrderChange` | `(activeRowId: string, overRowId: string) => void` |  | Called on a row drag-and-drop reorder; the consumer reorders its data. |

## Related

- [Row ordering](/docs/guides/row-ordering)
- [Composition](/docs/guides/composition)
