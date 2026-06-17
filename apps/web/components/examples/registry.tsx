"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEqualizerLine,
  RiMoreFill,
  RiSortAsc,
  RiSortDesc,
} from "@remixicon/react"

import { Button } from "@workspace/ui/components/button"
import { ContextMenuItem } from "@workspace/ui/components/context-menu"
import {
  DataTable,
  useDataTable,
  type EditDisplayMode,
} from "@monabbir/tablecn/components/data-table"

import {
  makeUsers,
  orgData,
  users as baseUsers,
  type OrgNode,
  type User,
} from "@/lib/example-data"
import { currency, userColumns } from "./columns"

function useUserColumns() {
  return React.useMemo(() => userColumns(), [])
}

// ----------------------------------------------------------------------------
// Basics
// ----------------------------------------------------------------------------

function BasicExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

function SortingExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableMultiSort: true,
    initialState: {
      sorting: [
        { id: "department", desc: false },
        { id: "salary", desc: true },
      ],
      pagination: { pageSize: 10 },
    },
  })
  return <DataTable table={table} />
}

// ----------------------------------------------------------------------------
// Filtering & search
// ----------------------------------------------------------------------------

function ColumnFiltersExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    defaultShowColumnFilters: true,
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

function FilterModesExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    defaultShowColumnFilters: true,
    enableColumnFilterModes: true,
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

function AdvancedFilterExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableAdvancedFilter: true,
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

function GlobalSearchExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableGlobalFilter: true,
    defaultGlobalFilterMode: "fuzzy",
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

// ----------------------------------------------------------------------------
// Column management
// ----------------------------------------------------------------------------

function ColumnOrderingExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableColumnOrdering: true,
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

function ColumnPinningExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableColumnPinning: true,
    initialState: {
      columnPinning: { left: ["firstName"], right: ["salary"] },
      pagination: { pageSize: 10 },
    },
  })
  return <DataTable table={table} />
}

function ColumnResizingExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableColumnResizing: true,
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

function ColumnVisibilityExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: {
      columnVisibility: { startDate: false, progress: false },
      pagination: { pageSize: 10 },
    },
  })
  return <DataTable table={table} />
}

// ----------------------------------------------------------------------------
// Display
// ----------------------------------------------------------------------------

function DensityExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    defaultDensity: "compact",
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

function StickyExample() {
  const data = React.useMemo(() => makeUsers(40), [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableStickyFooter: true,
  })
  return <DataTable table={table} surfaceClassName="max-h-[460px]" />
}

function LoadingExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const [isLoading, setIsLoading] = React.useState(true)
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    isLoading,
    initialState: { pagination: { pageSize: 10 } },
    renderToolbarActions: () => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsLoading((v) => !v)}
      >
        {isLoading ? "Show data" : "Show loading"}
      </Button>
    ),
  })
  return <DataTable table={table} />
}

// ----------------------------------------------------------------------------
// Selection & rows
// ----------------------------------------------------------------------------

function RowSelectionExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

function SingleSelectionExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    enableMultiRowSelection: false,
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

function RowNumbersExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowNumbers: true,
    rowNumberMode: "static",
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

function RowPinningExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowNumbers: true,
    enableRowPinning: true,
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

function RowOrderingExample() {
  const [data, setData] = React.useState(() => makeUsers(12))
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowOrdering: true,
    enablePagination: false,
    onRowOrderChange: (activeId, overId) =>
      setData((prev) => {
        const from = prev.findIndex((r) => r.id === activeId)
        const to = prev.findIndex((r) => r.id === overId)
        if (from === -1 || to === -1) return prev
        const next = [...prev]
        const [moved] = next.splice(from, 1)
        if (moved) next.splice(to, 0, moved)
        return next
      }),
  })
  return <DataTable table={table} />
}

// ----------------------------------------------------------------------------
// Grouping & trees
// ----------------------------------------------------------------------------

function GroupingExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableGrouping: true,
    enableStickyFooter: true,
    initialState: {
      grouping: ["department"],
      expanded: true,
      pagination: { pageSize: 50 },
    },
  })
  return <DataTable table={table} />
}

function DetailPanelExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageSize: 10 } },
    renderDetailPanel: ({ row }) => (
      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <Field label="City">{row.original.city}</Field>
        <Field label="Country">{row.original.country}</Field>
        <Field label="Start date">
          {row.original.startDate.toLocaleDateString()}
        </Field>
        <Field label="Salary">{currency.format(row.original.salary)}</Field>
      </dl>
    ),
  })
  return <DataTable table={table} />
}

const orgColumns: ColumnDef<OrgNode>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "title", header: "Title" },
  { accessorKey: "department", header: "Department" },
  {
    accessorKey: "headcount",
    header: "Headcount",
    meta: { align: "right" },
    cell: ({ getValue }) => (
      <span className="tabular-nums">{getValue<number>()}</span>
    ),
  },
]

function TreeExample() {
  const data = React.useMemo(() => orgData, [])
  const columns = React.useMemo(() => orgColumns, [])
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getSubRows: (row) => row.subRows,
    enablePagination: false,
    initialState: { expanded: true },
  })
  return <DataTable table={table} />
}

// ----------------------------------------------------------------------------
// Editing
// ----------------------------------------------------------------------------

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
    onEditCellSave: ({ row, column, value }) =>
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? ({ ...r, [column.id]: value } as User) : r
        )
      ),
    onSaveRow: ({ row, values, exit }) => {
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, ...(values as Partial<User>) } : r
        )
      )
      exit()
    },
    onCreateRow: ({ values, exit }) => {
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
    renderToolbarActions: ({ table }) => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.cnTable.beginCreate()}
      >
        <RiAddLine />
        New
      </Button>
    ),
  })
  return <DataTable table={table} />
}

// ----------------------------------------------------------------------------
// Actions
// ----------------------------------------------------------------------------

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

function CellActionsExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableClickToCopy: true,
    initialState: { pagination: { pageSize: 10 } },
    renderCellActionMenuItems: ({ cell }) => (
      <>
        <ContextMenuItem
          onClick={() =>
            navigator.clipboard?.writeText(String(cell.getValue() ?? ""))
          }
        >
          Copy value
        </ContextMenuItem>
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

// ----------------------------------------------------------------------------
// Data
// ----------------------------------------------------------------------------

function VirtualizedExample() {
  const data = React.useMemo(() => makeUsers(1000), [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableRowVirtualization: true,
  })
  return <DataTable table={table} />
}

function wideColumns(): ColumnDef<User>[] {
  const extra = Array.from(
    { length: 24 },
    (_, i): ColumnDef<User> => ({
      id: `metric${i}`,
      header: `Metric ${i + 1}`,
      accessorFn: (row) => (row.age * (i + 3)) % 100,
      size: 110,
      meta: { align: "right" },
      cell: ({ getValue }) => (
        <span className="tabular-nums">{getValue<number>()}</span>
      ),
    })
  )
  return [...userColumns(), ...extra]
}

function ColumnVirtualizationExample() {
  const data = React.useMemo(() => makeUsers(300), [])
  const columns = React.useMemo(() => wideColumns(), [])
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableRowVirtualization: true,
    enableColumnVirtualization: true,
  })
  return <DataTable table={table} surfaceClassName="max-h-[600px]" />
}

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
    renderToolbarActions: () => (
      <span className="text-xs text-muted-foreground">
        {last ? `Last clicked: ${last}` : "Click any row"}
      </span>
    ),
  })
  return <DataTable table={table} />
}

function CustomIconsExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    defaultShowColumnFilters: true,
    icons: {
      sortAscending: RiSortAsc,
      sortDescending: RiSortDesc,
      columnActions: RiMoreFill,
      columnVisibility: RiEqualizerLine,
    },
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

function ExportExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    enableExport: true,
    exportFileName: "users",
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

const SPANISH = {
  rowsPerPage: "Filas por página",
  search: "Buscar",
  searchPlaceholder: "Buscar…",
  showColumnFilters: "Mostrar filtros",
  hideColumnFilters: "Ocultar filtros",
  columnVisibility: "Visibilidad de columnas",
  toggleDensity: "Cambiar densidad",
  enterFullscreen: "Pantalla completa",
  exitFullscreen: "Salir de pantalla completa",
  noRecordsToDisplay: "No hay registros para mostrar",
  paginationRange: (start: number, end: number, total: number) =>
    `${start}–${end} de ${total}`,
}

function LocalizationExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    localization: SPANISH,
    defaultShowColumnFilters: true,
    initialState: { pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

const PAGE_SIZE = 10

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

function AdvancedExample() {
  const [data, setData] = React.useState(() => baseUsers)
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    enableMultiSort: true,
    enableColumnOrdering: true,
    enableColumnPinning: true,
    enableColumnResizing: true,
    enableRowNumbers: true,
    enableRowPinning: true,
    enableGrouping: true,
    enableStickyFooter: true,
    enableExport: true,
    exportFileName: "users",
    enableEditing: true,
    editDisplayMode: "row",
    defaultShowColumnFilters: true,
    initialState: { pagination: { pageSize: 10 } },
    onSaveRow: ({ row, values, exit }) => {
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, ...(values as Partial<User>) } : r
        )
      )
      exit()
    },
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

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export interface ExampleDef {
  slug: string
  title: string
  description: string
  category: string
  Component: React.ComponentType
}

export const EXAMPLES: ExampleDef[] = [
  {
    slug: "basic",
    title: "Basic",
    description: "Sorting + client pagination — the default feature set.",
    category: "Basics",
    Component: BasicExample,
  },
  {
    slug: "sorting",
    title: "Sorting",
    description: "Multi-column sorting (shift-click) with an order badge.",
    category: "Basics",
    Component: SortingExample,
  },
  {
    slug: "column-filters",
    title: "Column filters",
    description:
      "Per-column filter row with text, select, multi-select, range, and date variants.",
    category: "Filtering",
    Component: ColumnFiltersExample,
  },
  {
    slug: "filter-modes",
    title: "Filter modes",
    description:
      "Switch a column's match mode (contains, starts with, between, …).",
    category: "Filtering",
    Component: FilterModesExample,
  },
  {
    slug: "global-search",
    title: "Global search",
    description: "Expandable fuzzy search across all columns, with mode menu.",
    category: "Filtering",
    Component: GlobalSearchExample,
  },
  {
    slug: "advanced-filter",
    title: "Advanced filter",
    description: "Build compound AND/OR filter rules in a dialog.",
    category: "Filtering",
    Component: AdvancedFilterExample,
  },
  {
    slug: "column-ordering",
    title: "Column ordering",
    description: "Drag column headers to reorder.",
    category: "Columns",
    Component: ColumnOrderingExample,
  },
  {
    slug: "column-pinning",
    title: "Column pinning",
    description: "Pin columns left/right; they stay sticky while scrolling.",
    category: "Columns",
    Component: ColumnPinningExample,
  },
  {
    slug: "column-resizing",
    title: "Column resizing",
    description: "Drag the header edge to resize a column.",
    category: "Columns",
    Component: ColumnResizingExample,
  },
  {
    slug: "column-visibility",
    title: "Column visibility",
    description: "Toggle columns from the toolbar or the column-actions menu.",
    category: "Columns",
    Component: ColumnVisibilityExample,
  },
  {
    slug: "density",
    title: "Density",
    description: "Cycle comfortable → compact → spacious.",
    category: "Display",
    Component: DensityExample,
  },
  {
    slug: "sticky",
    title: "Sticky header & footer",
    description: "Header and aggregation footer stay visible while scrolling.",
    category: "Display",
    Component: StickyExample,
  },
  {
    slug: "loading",
    title: "Loading state",
    description: "Skeleton rows + progress bar; toggle to compare.",
    category: "Display",
    Component: LoadingExample,
  },
  {
    slug: "row-selection",
    title: "Row selection",
    description: "Multi-row selection with an alert banner.",
    category: "Selection & rows",
    Component: RowSelectionExample,
  },
  {
    slug: "single-selection",
    title: "Single selection",
    description: "Single-row selection (no select-all).",
    category: "Selection & rows",
    Component: SingleSelectionExample,
  },
  {
    slug: "row-numbers",
    title: "Row numbers",
    description: "A leading row-number column.",
    category: "Selection & rows",
    Component: RowNumbersExample,
  },
  {
    slug: "row-pinning",
    title: "Row pinning",
    description: "Pin rows to the top via the row-number column.",
    category: "Selection & rows",
    Component: RowPinningExample,
  },
  {
    slug: "row-ordering",
    title: "Row ordering",
    description: "Drag rows to reorder (controlled data).",
    category: "Selection & rows",
    Component: RowOrderingExample,
  },
  {
    slug: "grouping",
    title: "Grouping & aggregation",
    description: "Group by a column; aggregate with a sticky footer total.",
    category: "Grouping & trees",
    Component: GroupingExample,
  },
  {
    slug: "detail-panel",
    title: "Detail panel",
    description: "Expand a row to reveal a custom detail panel.",
    category: "Grouping & trees",
    Component: DetailPanelExample,
  },
  {
    slug: "tree",
    title: "Tree (sub-rows)",
    description: "Expandable hierarchical data via getSubRows.",
    category: "Grouping & trees",
    Component: TreeExample,
  },
  {
    slug: "editing-cell",
    title: "Editing — cell",
    description: "Click a cell to edit it inline.",
    category: "Editing",
    Component: () => <EditingExample mode="cell" />,
  },
  {
    slug: "editing-row",
    title: "Editing — row",
    description: "Edit a whole row inline with save/cancel.",
    category: "Editing",
    Component: () => <EditingExample mode="row" />,
  },
  {
    slug: "editing-table",
    title: "Editing — table",
    description: "Every editable cell is always editable.",
    category: "Editing",
    Component: () => <EditingExample mode="table" />,
  },
  {
    slug: "editing-modal",
    title: "Editing — modal",
    description: "Edit or create a row in a dialog.",
    category: "Editing",
    Component: () => <EditingExample mode="modal" />,
  },
  {
    slug: "row-actions",
    title: "Row actions",
    description: "A trailing actions column (e.g. delete).",
    category: "Actions",
    Component: RowActionsExample,
  },
  {
    slug: "cell-actions",
    title: "Cell actions & copy",
    description: "Right-click a cell for actions; click-to-copy enabled.",
    category: "Actions",
    Component: CellActionsExample,
  },
  {
    slug: "virtualized",
    title: "Virtualized (1,000 rows)",
    description: "Row virtualization for large datasets.",
    category: "Data",
    Component: VirtualizedExample,
  },
  {
    slug: "column-virtualization",
    title: "Column virtualization",
    description:
      "Horizontal virtualization for very wide tables (34 columns × 300 rows).",
    category: "Data",
    Component: ColumnVirtualizationExample,
  },
  {
    slug: "event-listeners",
    title: "Event listeners",
    description: "onRowClick / onCellClick (and double-click) handlers.",
    category: "Data",
    Component: EventListenersExample,
  },
  {
    slug: "custom-icons",
    title: "Custom icons",
    description: "Override any of the table's icons via the icons prop.",
    category: "Data",
    Component: CustomIconsExample,
  },
  {
    slug: "export",
    title: "Export",
    description: "Export selected or filtered rows to CSV / Excel.",
    category: "Data",
    Component: ExportExample,
  },
  {
    slug: "localization",
    title: "Localization",
    description: "Override the string table (Spanish).",
    category: "Data",
    Component: LocalizationExample,
  },
  {
    slug: "server-side",
    title: "Server-side (manual)",
    description: "Manual pagination against a simulated server.",
    category: "Data",
    Component: ServerSideExample,
  },
  {
    slug: "advanced",
    title: "Advanced (kitchen sink)",
    description: "Most features enabled at once.",
    category: "Data",
    Component: AdvancedExample,
  },
]
