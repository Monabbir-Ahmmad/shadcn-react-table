"use client"

import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query"
import {
  flexRender,
  type ExpandedState,
  type SortingState,
} from "@tanstack/react-table"
import * as React from "react"
import { Bar, BarChart, XAxis } from "recharts"

import {
  DataTable,
  DataTableColumnFilter,
  DataTableDndProvider,
  DataTableGlobalFilter,
  DataTablePagination,
  DataTableProvider,
  useDataTable,
  useDataTableDropZone,
  type DataTableColumnDef,
  type RowPinningDisplayMode,
} from "@monabbir/shadcn-react-table/components/data-table"
import { Button } from "@workspace/ui/components/button"
import { ChartContainer } from "@workspace/ui/components/chart"
import { Skeleton } from "@workspace/ui/components/skeleton"

import {
  users as baseUsers,
  makeUsers,
  orgData,
  type OrgNode,
  type User,
} from "@/lib/example-data"
import { currency, userColumns } from "./columns"

function useUserColumns() {
  return React.useMemo(() => userColumns(), [])
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** A row of buttons acting as a segmented control. */
function Choice<T extends string | false>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly T[]
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {options.map((option) => (
        <Button
          key={String(option)}
          size="sm"
          variant={option === value ? "default" : "outline"}
          aria-pressed={option === value}
          onClick={() => onChange(option)}
        >
          {String(option)}
        </Button>
      ))}
    </div>
  )
}

// ----------------------------------------------------------------------------
// Basics
// ----------------------------------------------------------------------------

function MinimalExample() {
  const data = React.useMemo(() => baseUsers.slice(0, 8), [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    // Turn off most of the built-ins for a plain, read-only table.
    enableTopToolbar: false,
    enablePagination: false,
    enableSorting: false,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableKeyboardNavigation: false,
  })
  return <DataTable table={table} />
}

const HEADLESS_COLUMNS: DataTableColumnDef<User>[] = [
  {
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    id: "name",
    header: "Name",
  },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
]

function HeadlessExample() {
  const data = React.useMemo(() => baseUsers, [])
  const table = useDataTable({
    data: data,
    columns: HEADLESS_COLUMNS,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  })
  return (
    <DataTableProvider table={table}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium">My own table markup</h3>
          <DataTableGlobalFilter table={table} />
        </div>
        {/* Plain markup driven by the same instance. */}
        <table.Subscribe selector={(state) => state}>
          {() => (
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((group) => (
                  <tr key={group.id} className="border-b text-start">
                    {group.headers.map((header) => (
                      <th
                        key={header.id}
                        className="py-2 text-start font-medium"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </table.Subscribe>
        <DataTablePagination table={table} />
      </div>
    </DataTableProvider>
  )
}

// ----------------------------------------------------------------------------
// Data
// ----------------------------------------------------------------------------

function ExportPdfExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        size="sm"
        variant="outline"
        onClick={async () => {
          // Loaded on demand, so the PDF library stays out of the page bundle.
          const { jsPDF } = await import("jspdf")
          const { autoTable } = await import("jspdf-autotable")
          const rows = table.getPrePaginatedRowModel().rows
          const doc = new jsPDF()
          autoTable(doc, {
            head: [["Name", "Email", "Role", "Department", "Salary"]],
            body: rows.map(({ original: u }) => [
              `${u.firstName} ${u.lastName}`,
              u.email,
              u.role,
              u.department,
              currency.format(u.salary),
            ]),
          })
          doc.save("people.pdf")
        }}
      >
        Export PDF
      </Button>
    ),
  })
  return <DataTable table={table} />
}

/** A flat list with parent ids, as many APIs return trees. */
const FLAT_ORG = [
  { id: "1", parentId: null, name: "Dana Reed", title: "VP Engineering" },
  { id: "2", parentId: "1", name: "Sam Lee", title: "Eng Manager" },
  { id: "3", parentId: "2", name: "Priya Rao", title: "Senior Engineer" },
  { id: "4", parentId: "2", name: "Tom Ford", title: "Engineer" },
  { id: "5", parentId: "1", name: "Ana Diaz", title: "Design Lead" },
  { id: "6", parentId: "5", name: "Kai Wu", title: "Designer" },
  { id: "7", parentId: null, name: "Lee Park", title: "VP Sales" },
  { id: "8", parentId: "7", name: "Mia Chen", title: "Account Executive" },
]

type FlatNode = (typeof FLAT_ORG)[number] & { subRows?: FlatNode[] }

function TreeFromFlatExample() {
  // Build `subRows` from `parentId` once.
  const data = React.useMemo(() => {
    const byId = new Map<string, FlatNode>(
      FLAT_ORG.map((node) => [node.id, { ...node }])
    )
    const roots: FlatNode[] = []
    for (const node of byId.values()) {
      const parent = node.parentId ? byId.get(node.parentId) : undefined
      if (parent) (parent.subRows ??= []).push(node)
      else roots.push(node)
    }
    return roots
  }, [])
  const table = useDataTable<FlatNode>({
    data,
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "title", header: "Title" },
    ],
    getRowId: (row) => row.id,
    getSubRows: (row) => row.subRows,
    enablePagination: false,
    initialState: { expanded: true },
  })
  return <DataTable table={table} />
}

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

// ----------------------------------------------------------------------------
// Editing
// ----------------------------------------------------------------------------

/** Replaces the node with `id` anywhere in the tree. */
function updateNode(
  nodes: OrgNode[],
  id: string,
  values: Partial<OrgNode>
): OrgNode[] {
  return nodes.map((node) =>
    node.id === id
      ? { ...node, ...values }
      : node.subRows
        ? { ...node, subRows: updateNode(node.subRows, id, values) }
        : node
  )
}

function EditingTreeExample() {
  const [data, setData] = React.useState(orgData)
  const table = useDataTable<OrgNode>({
    data,
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "title", header: "Title" },
      {
        accessorKey: "headcount",
        header: "Headcount",
        meta: { editVariant: "number", align: "right" },
      },
    ],
    getRowId: (row) => row.id,
    getSubRows: (row) => row.subRows,
    enablePagination: false,
    enableEditing: true,
    editDisplayMode: "row",
    initialState: { expanded: true },
    onEditingRowSave: ({ row, values, exit }) => {
      setData((prev) => updateNode(prev, row.id, values as Partial<OrgNode>))
      exit()
    },
  })
  return <DataTable table={table} />
}

// ----------------------------------------------------------------------------
// Grouping / expanding
// ----------------------------------------------------------------------------

const GROUPED_MODES = [false, "reorder", "remove"] as const

function GroupedColumnModeExample() {
  const [mode, setMode] = React.useState<false | "reorder" | "remove">(
    "reorder"
  )
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableGrouping: true,
    // TanStack's own option: move grouped columns first, hide them, or leave them.
    groupedColumnMode: mode,
    initialState: {
      grouping: ["department"],
      expanded: true,
      pagination: { pageIndex: 0, pageSize: 20 },
    },
  })
  return (
    <div className="flex flex-col gap-3">
      <Choice
        label="groupedColumnMode"
        value={mode}
        options={GROUPED_MODES}
        onChange={setMode}
      />
      <DataTable table={table} />
    </div>
  )
}

function CustomizedGroupingExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = React.useMemo<DataTableColumnDef<User>[]>(
    () =>
      userColumns().map((column) =>
        "accessorKey" in column && column.accessorKey === "department"
          ? {
              ...column,
              meta: {
                ...column.meta,
                // A custom group header: name, count and total salary.
                renderGroupedCell: ({ row }) => (
                  <span className="flex items-center gap-2">
                    <span className="font-medium">
                      {String(row.getValue("department"))}
                    </span>
                    <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground">
                      {row.subRows.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {currency.format(
                        row.subRows.reduce(
                          (sum, r) => sum + (r.original as User).salary,
                          0
                        )
                      )}
                    </span>
                  </span>
                ),
              },
            }
          : column
      ),
    []
  )
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableGrouping: true,
    initialState: {
      grouping: ["department"],
      density: "compact",
      pagination: { pageIndex: 0, pageSize: 20 },
    },
  })
  return <DataTable table={table} />
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

function ChartDetailPanelExample() {
  const data = React.useMemo(() => baseUsers.slice(0, 10), [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enablePagination: false,
    renderDetailPanel: ({ row }) => {
      // Deterministic monthly hours per person.
      const seed = Number(row.original.id.replace(/\D/g, ""))
      const hours = MONTHS.map((month, i) => ({
        month,
        hours: 120 + ((seed * (i + 3)) % 60),
      }))
      return (
        <ChartContainer
          config={{ hours: { label: "Hours", color: "var(--chart-1)" } }}
          className="h-40 w-full max-w-xl"
        >
          <BarChart data={hours}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <Bar dataKey="hours" fill="var(--color-hours)" radius={4} />
          </BarChart>
        </ChartContainer>
      )
    },
  })
  return <DataTable table={table} />
}

/** Details "fetched" when the panel opens. */
function LazyDetails({ user }: { user: User }) {
  const [notes, setNotes] = React.useState<string | null>(null)
  React.useEffect(() => {
    let live = true
    void delay(600).then(() => {
      if (live) {
        setNotes(
          `${user.firstName} joined ${user.department} in ${user.startDate.getFullYear()} and works from ${user.city}.`
        )
      }
    })
    return () => {
      live = false
    }
  }, [user])
  return notes ? (
    <p className="text-sm">{notes}</p>
  ) : (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-4 w-56" />
    </div>
  )
}

function LazyDetailPanelExample() {
  const data = React.useMemo(() => baseUsers.slice(0, 10), [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enablePagination: false,
    // The panel mounts on expand, so it loads only then.
    renderDetailPanel: ({ row }) => <LazyDetails user={row.original} />,
  })
  return <DataTable table={table} />
}

type Folder = {
  id: string
  name: string
  hasChildren: boolean
  subRows?: Folder[]
}

const ROOT_FOLDERS: Folder[] = ["Design", "Engineering", "Sales"].map(
  (name) => ({ id: name.toLowerCase(), name, hasChildren: true })
)

/** Adds loaded children to the folder with `id`. */
function withChildren(nodes: Folder[], id: string, children: Folder[]) {
  return nodes.map((node): Folder =>
    node.id === id
      ? { ...node, subRows: children }
      : node.subRows
        ? { ...node, subRows: withChildren(node.subRows, id, children) }
        : node
  )
}

function LazySubRowsExample() {
  const [data, setData] = React.useState(ROOT_FOLDERS)
  const [expanded, setExpanded] = React.useState<ExpandedState>({})
  const loading = React.useRef(new Set<string>())

  const table = useDataTable<Folder>({
    data,
    columns: [{ accessorKey: "name", header: "Folder" }],
    getRowId: (row) => row.id,
    getSubRows: (row) => row.subRows,
    // Rows can expand before their children are loaded.
    getRowCanExpand: (row) => row.original.hasChildren,
    enablePagination: false,
    state: { expanded },
    onExpandedChange: (updater) => {
      const next = typeof updater === "function" ? updater(expanded) : updater
      setExpanded(next)
      // Load the children of each newly expanded row that has none yet.
      for (const id of Object.keys(next === true ? {} : next)) {
        const row = table.getRow(id)
        if (row.original.subRows || loading.current.has(id)) continue
        loading.current.add(id)
        void delay(500).then(() => {
          setData((prev) =>
            withChildren(
              prev,
              id,
              [1, 2, 3].map((n) => ({
                id: `${id}-${n}`,
                name: `${row.original.name} ${n}`,
                hasChildren: id.split("-").length < 2,
              }))
            )
          )
        })
      }
    },
  })
  return <DataTable table={table} />
}

function MultiAggregationExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = React.useMemo<DataTableColumnDef<User>[]>(
    () => [
      { accessorKey: "department", header: "Department" },
      { accessorKey: "firstName", header: "First name" },
      {
        accessorKey: "salary",
        header: "Salary",
        aggregationFn: ["sum", "mean", "max"],
        cell: ({ getValue }) => currency.format(getValue() as number),
        meta: { align: "right" },
      },
      { accessorKey: "age", header: "Age", aggregationFn: ["min", "max"] },
    ],
    []
  )
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableGrouping: true,
    initialState: {
      grouping: ["department"],
      pagination: { pageIndex: 0, pageSize: 20 },
    },
  })
  return <DataTable table={table} />
}

// ----------------------------------------------------------------------------
// Filtering
// ----------------------------------------------------------------------------

const FACETED_COLUMNS: DataTableColumnDef<User>[] = [
  { accessorKey: "firstName", header: "First name" },
  // No `filterSelectOptions`: the options and their counts come from the data.
  { accessorKey: "role", header: "Role", meta: { filterVariant: "select" } },
  {
    accessorKey: "country",
    header: "Country",
    meta: { filterVariant: "multi-select" },
  },
  // The slider's bounds come from the data too.
  {
    accessorKey: "age",
    header: "Age",
    meta: { filterVariant: "range-slider" },
  },
]

function FacetedValuesExample() {
  const data = React.useMemo(() => baseUsers, [])
  const table = useDataTable({
    data,
    columns: FACETED_COLUMNS,
    getRowId: (row) => row.id,
    initialState: {
      showColumnFilters: true,
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  })
  return <DataTable table={table} />
}

function PopoverFiltersExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    // Each header gets a filter button that opens its field, Excel-style.
    columnFilterDisplayMode: "popover",
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  })
  return <DataTable table={table} />
}

function CustomFilterSidebarExample() {
  const data = React.useMemo(() => baseUsers, [])
  const table = useDataTable({
    data,
    columns: FACETED_COLUMNS,
    getRowId: (row) => row.id,
    // Filter fields render where you put them.
    columnFilterDisplayMode: "custom",
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  })
  return (
    <DataTableProvider table={table}>
      <div className="flex flex-col gap-4 md:flex-row">
        <aside className="flex w-full shrink-0 flex-col gap-3 md:w-56">
          <h3 className="text-sm font-medium">Filters</h3>
          <table.Subscribe selector={(state) => state.columnFilters}>
            {() =>
              table
                .getFlatHeaders()
                .filter((header) => header.column.getCanFilter())
                .map((header) => (
                  <label
                    key={header.id}
                    className="flex flex-col gap-1 text-xs"
                  >
                    <span className="text-muted-foreground">
                      {String(header.column.columnDef.header)}
                    </span>
                    <DataTableColumnFilter header={header} table={table} />
                  </label>
                ))
            }
          </table.Subscribe>
        </aside>
        <div className="min-w-0 flex-1">
          <DataTable table={table} />
        </div>
      </div>
    </DataTableProvider>
  )
}

// ----------------------------------------------------------------------------
// Rows
// ----------------------------------------------------------------------------

const PINNING_MODES: readonly RowPinningDisplayMode[] = [
  "top-and-bottom",
  "static",
  "select-top",
  "select-bottom",
]

function RowPinningModesExample() {
  const [mode, setMode] =
    React.useState<RowPinningDisplayMode>("top-and-bottom")
  const data = React.useMemo(() => makeUsers(60), [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableRowPinning: true,
    enableRowSelection: true,
    rowPinningDisplayMode: mode,
    initialState: { rowPinning: { top: ["U-1004"], bottom: ["U-1050"] } },
    slotProps: { surface: { className: "max-h-[420px]" } },
  })
  return (
    <div className="flex flex-col gap-3">
      <Choice
        label="rowPinningDisplayMode"
        value={mode}
        options={PINNING_MODES}
        onChange={setMode}
      />
      <DataTable table={table} />
    </div>
  )
}

type Task = { id: string; title: string }

const TASK_COLUMNS: DataTableColumnDef<Task>[] = [
  { accessorKey: "title", header: "Task" },
]

function Trash() {
  const { setNodeRef, isOver } = useDataTableDropZone("trash")
  return (
    <div
      ref={setNodeRef}
      className={
        "flex h-16 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground " +
        (isOver ? "border-destructive bg-destructive/10 text-destructive" : "")
      }
    >
      Drop here to delete
    </div>
  )
}

function TaskList({
  title,
  tasks,
  onDragEnd,
}: {
  title: string
  tasks: Task[]
  onDragEnd: (task: Task, to: "other" | "trash") => void
}) {
  const table = useDataTable({
    data: tasks,
    columns: TASK_COLUMNS,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableTopToolbar: false,
    enableRowDragging: true,
    title,
    onRowDragEnd: ({ row, over }) =>
      onDragEnd(row.original, over.type === "zone" ? "trash" : "other"),
    slotProps: {
      root: {
        className:
          "rounded-md data-[drop-target]:ring-2 data-[drop-target]:ring-primary",
      },
    },
  })
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <DataTable table={table} />
    </div>
  )
}

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

// ----------------------------------------------------------------------------
// Remote data
// ----------------------------------------------------------------------------

const SERVER_PEOPLE = makeUsers(240)

/** A stand-in for an API: filters, sorts and pages on the "server". */
async function fetchPeople(params: {
  pageIndex: number
  pageSize: number
  sorting: SortingState
  search: string
}) {
  await delay(350)
  const query = params.search.toLowerCase()
  let rows = SERVER_PEOPLE.filter(
    (u) =>
      !query ||
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(query)
  )
  const sort = params.sorting[0]
  if (sort) {
    const key = sort.id as keyof User
    rows = [...rows].sort((a, b) => {
      const result = String(a[key]).localeCompare(String(b[key]), undefined, {
        numeric: true,
      })
      return sort.desc ? -result : result
    })
  }
  const start = params.pageIndex * params.pageSize
  return {
    rows: rows.slice(start, start + params.pageSize),
    total: rows.length,
  }
}

function PeopleFromServer() {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const query = useQuery({
    queryKey: ["people", pagination, sorting, globalFilter],
    queryFn: () =>
      fetchPeople({ ...pagination, sorting, search: globalFilter }),
    // Keep the current page on screen while the next one loads.
    placeholderData: keepPreviousData,
  })
  const columns = useUserColumns()
  const table = useDataTable({
    data: query.data?.rows ?? [],
    columns,
    getRowId: (row) => row.id,
    rowCount: query.data?.total ?? 0,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: { pagination, sorting, globalFilter },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    isLoading: query.isPending,
    showProgressBars: query.isFetching,
  })
  return <DataTable table={table} />
}

function ReactQueryExample() {
  const [client] = React.useState(() => new QueryClient())
  return (
    <QueryClientProvider client={client}>
      <PeopleFromServer />
    </QueryClientProvider>
  )
}

// ----------------------------------------------------------------------------
// Display
// ----------------------------------------------------------------------------

function SkeletonsExample() {
  const all = React.useMemo(() => baseUsers, [])
  const [data, setData] = React.useState<User[]>(all)
  const [isLoading, setIsLoading] = React.useState(false)
  const [refetching, setRefetching] = React.useState(false)
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    isLoading: isLoading || refetching,
    // While refetching, cover the rows already shown.
    showSkeletons: refetching || undefined,
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
    renderTopToolbarCustomActions: () => (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setData([])
            setIsLoading(true)
            void delay(1500).then(() => {
              setData(all)
              setIsLoading(false)
            })
          }}
        >
          First load
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setRefetching(true)
            void delay(1500).then(() => setRefetching(false))
          }}
        >
          Refetch
        </Button>
      </div>
    ),
  })
  return <DataTable table={table} />
}

function ColumnDragExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    // Drag a header's grip: the whole column follows and the others make room.
    enableColumnOrdering: true,
    enableColumnPinning: true,
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
  })
  return <DataTable table={table} />
}

function AnimationsExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const [animated, setAnimated] = React.useState(true)
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    enableAnimations: animated,
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
    renderDetailPanel: ({ row }) => (
      <p className="p-4 text-sm text-muted-foreground">
        {row.original.firstName} {row.original.lastName} is {row.original.role}{" "}
        in {row.original.department}, based in {row.original.city}.
      </p>
    ),
    renderTopToolbarCustomActions: () => (
      <Button
        size="sm"
        variant={animated ? "default" : "outline"}
        aria-pressed={animated}
        onClick={() => setAnimated((on) => !on)}
      >
        Animations {animated ? "on" : "off"}
      </Button>
    ),
  })
  return <DataTable table={table} />
}

export const MORE_EXAMPLES = [
  {
    slug: "minimal",
    title: "Minimal",
    description: "A plain, read-only table with the built-ins turned off.",
    category: "Basics",
    Component: MinimalExample,
  },
  {
    slug: "headless",
    title: "Headless",
    description:
      "Your own table markup, driven by the instance, with our search and pagination.",
    category: "Basics",
    Component: HeadlessExample,
  },
  {
    slug: "export-pdf",
    title: "PDF export",
    description: "Export every filtered row to a PDF from a toolbar button.",
    category: "Data",
    Component: ExportPdfExample,
  },
  {
    slug: "tree-from-flat",
    title: "Tree from a flat list",
    description: "Build sub-rows from parent ids.",
    category: "Data",
    Component: TreeFromFlatExample,
  },
  {
    slug: "dynamic-columns",
    title: "Dynamic columns",
    description: "Columns generated from the fetched data's fields.",
    category: "Data",
    Component: DynamicColumnsExample,
  },
  {
    slug: "editing-tree",
    title: "Editing tree data",
    description: "Edit rows at any depth of a tree.",
    category: "Editing",
    Component: EditingTreeExample,
  },
  {
    slug: "grouped-column-mode",
    title: "Grouped column mode",
    description:
      "Move grouped columns first, hide them, or leave them in place.",
    category: "Data",
    Component: GroupedColumnModeExample,
  },
  {
    slug: "customized-grouping",
    title: "Customized grouping",
    description: "A custom group header with the count and a total.",
    category: "Data",
    Component: CustomizedGroupingExample,
  },
  {
    slug: "chart-detail-panel",
    title: "Chart in a detail panel",
    description: "A bar chart for each row's details.",
    category: "Data",
    Component: ChartDetailPanelExample,
  },
  {
    slug: "lazy-detail-panel",
    title: "Lazy detail panel",
    description: "Details load when the row is expanded.",
    category: "Data",
    Component: LazyDetailPanelExample,
  },
  {
    slug: "lazy-sub-rows",
    title: "Lazy sub-rows",
    description: "Children load when a folder is expanded.",
    category: "Data",
    Component: LazySubRowsExample,
  },
  {
    slug: "multi-aggregation",
    title: "Several aggregations",
    description: "Sum, mean and max of a column in each group.",
    category: "Data",
    Component: MultiAggregationExample,
  },
  {
    slug: "faceted-values",
    title: "Faceted values",
    description: "Filter options, counts and slider bounds from the data.",
    category: "Filtering",
    Component: FacetedValuesExample,
  },
  {
    slug: "popover-filters",
    title: "Popover filters",
    description: "Excel-style filter buttons in the headers.",
    category: "Filtering",
    Component: PopoverFiltersExample,
  },
  {
    slug: "custom-filter-sidebar",
    title: "Filter sidebar",
    description: "The column filters in a sidebar of your own.",
    category: "Filtering",
    Component: CustomFilterSidebarExample,
  },
  {
    slug: "row-pinning-modes",
    title: "Row pinning modes",
    description: "Sticky, static and selection-driven pinned rows.",
    category: "Selection & rows",
    Component: RowPinningModesExample,
  },
  {
    slug: "row-dragging",
    title: "Dragging rows between tables",
    description: "Move tasks between two lists, or drop them in the trash.",
    category: "Selection & rows",
    Component: RowDraggingExample,
  },
  {
    slug: "react-query",
    title: "React Query",
    description: "Server-side paging, sorting and search with React Query.",
    category: "Data",
    Component: ReactQueryExample,
  },
  {
    slug: "skeletons",
    title: "Loading skeletons",
    description: "Skeletons for the first load and over rows while refetching.",
    category: "Display",
    Component: SkeletonsExample,
  },
  {
    slug: "column-drag",
    title: "Column drag",
    description: "The whole column moves while you drag it.",
    category: "Columns",
    Component: ColumnDragExample,
  },
  {
    slug: "animations",
    title: "Animations",
    description:
      "Rows glide, fade and open smoothly as you sort, filter and expand.",
    category: "Display",
    Component: AnimationsExample,
  },
]
