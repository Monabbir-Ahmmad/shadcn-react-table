"use client"

import {
  RiAddLine,
  RiDeleteBinLine,
  RiEqualizerLine,
  RiSearch2Line,
  RiMoreFill,
  RiSortAsc,
  RiSortDesc,
} from "@remixicon/react"
import * as React from "react"

import type { SortingState } from "@tanstack/react-table"

import {
  DataTable,
  DataTableConfigProvider,
  DataTableDensityToggle,
  DataTableGlobalFilter,
  DataTableProvider,
  DataTableViewOptions,
  useDataTable,
  type DataTableColumnDef,
  type DataTableInstance,
  type Density,
  type EditDisplayMode,
} from "@monabbir/shadcn-react-table/components/data-table"
import { dataTableLocalizationAr } from "@monabbir/shadcn-react-table/components/data-table/locales/ar"
import { Button } from "@workspace/ui/components/button"
import { ContextMenuItem } from "@workspace/ui/components/context-menu"
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@workspace/ui/components/dropdown-menu"

import {
  users as baseUsers,
  makeUsers,
  orgData,
  type OrgNode,
  type User,
} from "@/lib/example-data"
import { currency, userColumns } from "./columns"
import { MORE_EXAMPLES } from "./more"

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
    initialState: { showColumnFilters: true, pagination: { pageSize: 10 } },
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
    enableColumnFilterModes: true,
    initialState: { showColumnFilters: true, pagination: { pageSize: 10 } },
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
    initialState: { globalFilterMode: "fuzzy", pagination: { pageSize: 10 } },
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
    initialState: { density: "compact", pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

function StickyExample() {
  const data = React.useMemo(() => makeUsers(40), [])
  const columns = useUserColumns()
  const table = useDataTable({
    slotProps: { surface: { className: "max-h-[460px]" } },
    data,
    columns,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableStickyFooter: true,
  })
  return <DataTable table={table} />
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
    renderTopToolbarCustomActions: () => (
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

function SelectionBannerOverlayExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    positionToolbarAlertBanner: "head-overlay",
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

function VirtualizedRowOrderingExample() {
  const [data, setData] = React.useState(() => makeUsers(1000))
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowOrdering: true,
    enableRowVirtualization: true,
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

const orgColumns: DataTableColumnDef<OrgNode>[] = [
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

function wideColumns(): DataTableColumnDef<User>[] {
  const extra = Array.from(
    { length: 24 },
    (_, i): DataTableColumnDef<User> => ({
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
    slotProps: { surface: { className: "max-h-[600px]" } },
    data,
    columns,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableRowVirtualization: true,
    enableColumnVirtualization: true,
  })
  return <DataTable table={table} />
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
    renderTopToolbarCustomActions: () => (
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

function exportUsersToCsv(table: DataTableInstance<User>) {
  const selected = table.getSelectedRowModel().rows
  const rows = selected.length > 0 ? selected : table.getFilteredRowModel().rows
  const columns = table
    .getVisibleLeafColumns()
    .filter((column) => column.accessorFn != null)
  const escape = (value: unknown) => {
    const text = value == null ? "" : String(value)
    // Guard CSV injection: spreadsheets treat leading =+-@ as formulas.
    const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
    return /[",\n]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded
  }
  const csv = [
    columns.map((column) => column.id),
    ...rows.map((row) => columns.map((column) => row.getValue(column.id))),
  ]
    .map((row) => row.map(escape).join(","))
    .join("\n")
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "users.csv"
  link.click()
  URL.revokeObjectURL(url)
}

function ExportExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportUsersToCsv(table)}
      >
        Export CSV
      </Button>
    ),
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
    initialState: { showColumnFilters: true, pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

function RtlExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    localization: dataTableLocalizationAr,
    enableColumnPinning: true,
    enableColumnResizing: true,
    initialState: {
      pagination: { pageSize: 10 },
      columnPinning: { left: ["firstName"] },
    },
  })
  // The table follows the direction it renders in; set `dir="rtl"` on it or
  // any ancestor (usually <html>).
  return (
    <div dir="rtl">
      <DataTable table={table} />
    </div>
  )
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

const INFINITE_CHUNK = 20
const INFINITE_TOTAL = 200

function InfiniteScrollExample() {
  const all = React.useMemo(() => makeUsers(INFINITE_TOTAL), [])
  const [rows, setRows] = React.useState(() => all.slice(0, INFINITE_CHUNK))
  const [isFetchingNextPage, setIsFetchingNextPage] = React.useState(false)
  const hasNextPage = rows.length < all.length

  // Stable loader (memoized on `all`) so the table doesn't re-trigger every
  // render. The hook already gates on hasNextPage / isFetchingNextPage.
  const loadMore = React.useCallback(() => {
    setIsFetchingNextPage(true)
    // Simulate a server round-trip, then append the next chunk.
    setTimeout(() => {
      setRows((prev) =>
        all.slice(0, Math.min(prev.length + INFINITE_CHUNK, all.length))
      )
      setIsFetchingNextPage(false)
    }, 600)
  }, [all])

  const columns = useUserColumns()
  const table = useDataTable({
    slotProps: { surface: { className: "max-h-[460px]" } },
    data: rows,
    columns,
    getRowId: (row) => row.id,
    enableInfiniteScroll: true,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: loadMore,
    renderTopToolbarCustomActions: () => (
      <span className="text-xs text-muted-foreground tabular-nums">
        Loaded {rows.length} of {all.length}
      </span>
    ),
  })
  return <DataTable table={table} />
}

function AutoRowHeightExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = React.useMemo<DataTableColumnDef<User>[]>(() => {
    const bio: DataTableColumnDef<User> = {
      id: "bio",
      header: "Bio",
      size: 300,
      accessorFn: (row) =>
        `${row.firstName} ${row.lastName} is a ${row.role} in ${row.department}, ` +
        `based in ${row.city}, ${row.country}. Reach them at ${row.email}.`,
      cell: ({ getValue }) => <span>{getValue<string>()}</span>,
    }
    return [...userColumns().slice(0, 3), bio]
  }, [])
  // getRowHeight: "auto" wraps and grows each row — even with resizing on.
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableColumnResizing: true,
    getRowHeight: () => "auto",
    initialState: { pagination: { pageSize: 8 } },
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
    enableEditing: true,
    editDisplayMode: "row",
    initialState: { showColumnFilters: true, pagination: { pageSize: 10 } },
    onEditingRowSave: ({ row, values, exit }) => {
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

// ----------------------------------------------------------------------------
// 1.0 features
// ----------------------------------------------------------------------------

function SlotPropsExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageSize: 10 } },
    slotProps: {
      // Dim inactive people and mark pending ones with a left border.
      bodyRow: ({ row }) => ({
        className:
          row.original.status === "inactive"
            ? "text-muted-foreground"
            : row.original.status === "pending"
              ? "border-l-2 border-l-amber-500"
              : undefined,
      }),
      headCell: { className: "text-[11px] uppercase tracking-wide" },
      surface: { className: "max-h-[480px]" },
    },
  })
  return <DataTable table={table} />
}

const NAME_COLUMNS: DataTableColumnDef<User>[] = [
  {
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    id: "name",
    header: "Name",
    meta: {
      filterMode: "wordStartsWith",
      columnFilterModeOptions: ["wordStartsWith", "contains", "equals"],
    },
  },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "city", header: "City" },
]

function CustomFilterFnsExample() {
  const data = React.useMemo(() => baseUsers, [])
  const table = useDataTable({
    data,
    columns: NAME_COLUMNS,
    getRowId: (row) => row.id,
    initialState: {
      showColumnFilters: true,
      pagination: { pageSize: 10 },
    },
    // Matches when any word of the cell starts with the typed text.
    filterFns: {
      wordStartsWith: (row, columnId, value) =>
        String(row.getValue(columnId))
          .toLowerCase()
          .split(/\s+/)
          .some((word) => word.startsWith(String(value).toLowerCase())),
    },
    localization: { filterModes: { wordStartsWith: "Any word starts with" } },
  })
  return <DataTable table={table} />
}

const ROLE_ORDER: User["role"][] = ["Owner", "Admin", "Editor", "Viewer"]

function CustomSortFnsExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = React.useMemo<DataTableColumnDef<User>[]>(
    () =>
      userColumns().map((column) =>
        "accessorKey" in column && column.accessorKey === "role"
          ? { ...column, sortFn: "byRole" }
          : column
      ),
    []
  )
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    // Sort roles by rank, not alphabetically.
    sortFns: {
      byRole: (rowA, rowB, columnId) =>
        ROLE_ORDER.indexOf(rowA.getValue(columnId)) -
        ROLE_ORDER.indexOf(rowB.getValue(columnId)),
    },
    initialState: {
      sorting: [{ id: "role", desc: false }],
      pagination: { pageSize: 10 },
    },
  })
  return <DataTable table={table} />
}

function CustomAggregationExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = React.useMemo<DataTableColumnDef<User>[]>(
    () => [
      { accessorKey: "department", header: "Department" },
      { accessorKey: "firstName", header: "First name" },
      {
        accessorKey: "salary",
        header: "Salary",
        aggregationFn: "spread",
        cell: ({ getValue }) => currency.format(getValue() as number),
        aggregatedCell: ({ getValue }) => (
          <span className="text-muted-foreground">
            spread {currency.format(getValue() as number)}
          </span>
        ),
        meta: { align: "right" },
      },
    ],
    []
  )
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableGrouping: true,
    // The gap between the highest and lowest salary in each group.
    aggregationFns: {
      spread: {
        aggregate: ({ rows, getValue }) => {
          const values = rows.map((row) => Number(getValue(row)))
          return Math.max(...values) - Math.min(...values)
        },
      },
    },
    initialState: { grouping: ["department"], pagination: { pageSize: 20 } },
  })
  return <DataTable table={table} />
}

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

function DisplayColumnsExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowNumbers: true,
    enableRowSelection: true,
    initialState: { pagination: { pageSize: 10 } },
    displayColumnDefOptions: {
      "cn-row-number": {
        header: "#",
        size: 56,
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {row.index + 1}
          </span>
        ),
      },
      "cn-select": { size: 40 },
    },
  })
  return <DataTable table={table} />
}

function CompositionExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableTopToolbar: false,
    initialState: { pagination: { pageSize: 10 } },
  })
  return (
    <DataTableProvider table={table}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
          <span className="mr-auto text-sm font-medium">Team directory</span>
          <DataTableGlobalFilter table={table} />
          <DataTableViewOptions table={table} />
          <DataTableDensityToggle table={table} />
        </div>
        <DataTable table={table} />
      </div>
    </DataTableProvider>
  )
}

type Shift = {
  id: string
  person: string
  city: string
  start: Date
  opens: string
}

const SHIFTS: Shift[] = baseUsers.slice(0, 24).map((user, i) => ({
  id: user.id,
  person: `${user.firstName} ${user.lastName}`,
  city: user.city,
  start: new Date(2025, 0, 6 + (i % 5), 6 + ((i * 3) % 12), (i * 15) % 60),
  opens: `${String(6 + ((i * 2) % 12)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
}))

const SHIFT_COLUMNS: DataTableColumnDef<Shift>[] = [
  { accessorKey: "person", header: "Person" },
  {
    accessorKey: "city",
    header: "City",
    meta: { filterVariant: "autocomplete" },
  },
  {
    accessorKey: "start",
    header: "Starts",
    cell: ({ getValue }) =>
      (getValue() as Date).toLocaleString("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    meta: { filterVariant: "datetime", filterMode: "after" },
  },
  {
    accessorKey: "opens",
    header: "Desk opens",
    meta: { filterVariant: "time-range" },
  },
]

function DateTimeFiltersExample() {
  const table = useDataTable({
    data: SHIFTS,
    columns: SHIFT_COLUMNS,
    getRowId: (row) => row.id,
    initialState: { showColumnFilters: true, pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}

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

function ControlledStateExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "salary", desc: true },
  ])
  const [density, setDensity] = React.useState<Density>("compact")
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageSize: 10 } },
    state: { sorting, density },
    onSortingChange: setSorting,
    onDensityChange: setDensity,
  })
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSorting([{ id: "age", desc: false }])}
        >
          Sort by age
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setDensity((d) => (d === "compact" ? "spacious" : "compact"))
          }
        >
          Toggle density
        </Button>
        <code className="text-xs text-muted-foreground">
          {JSON.stringify({ sorting, density })}
        </code>
      </div>
      <DataTable table={table} />
    </div>
  )
}

const ACTIVITY = baseUsers.slice(0, 6).map((user, i) => ({
  id: user.id,
  who: `${user.firstName} ${user.lastName}`,
  what: ["opened a ticket", "closed a deal", "joined", "left a comment"][
    i % 4
  ] as string,
  when: `${(i + 1) * 7} min ago`,
}))

function BodyOnlyExample() {
  const table = useDataTable({
    data: ACTIVITY,
    columns: [
      { accessorKey: "who", header: "Who" },
      { accessorKey: "what", header: "What" },
      {
        accessorKey: "when",
        header: "When",
        meta: { align: "right" },
      },
    ],
    getRowId: (row) => row.id,
    enableTableHead: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableKeyboardNavigation: false,
    initialState: { density: "compact" },
  })
  return <DataTable table={table} />
}

function EmptyStateExample() {
  const columns = useUserColumns()
  const table = useDataTable({
    data: [] as User[],
    columns,
    getRowId: (row) => row.id,
    renderEmpty: () => (
      <div className="flex flex-col items-center gap-2 py-6">
        <span className="font-medium">No people yet</span>
        <span className="text-muted-foreground">
          Invite your team to see them here.
        </span>
        <Button size="sm" variant="outline">
          <RiAddLine />
          Invite
        </Button>
      </div>
    ),
  })
  return <DataTable table={table} />
}

function FixedRowHeightExample() {
  const data = React.useMemo(() => makeUsers(200), [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableRowVirtualization: true,
    rowHeight: 36,
    slotProps: { surface: { className: "max-h-[420px]" } },
  })
  return <DataTable table={table} />
}

function ColumnAutosizeExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableColumnResizing: true,
    enableColumnAutosize: true,
    initialState: { pagination: { pageSize: 10 } },
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        size="sm"
        variant="outline"
        onClick={() => table.autoSizeAllColumns()}
      >
        Fit all columns
      </Button>
    ),
  })
  return <DataTable table={table} />
}

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

function SelectionActionsExample() {
  const [data, setData] = React.useState(() => baseUsers.slice(0, 20))
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    initialState: { pagination: { pageSize: 10 } },
    renderTopToolbarCustomActions: ({ table }) => (
      <table.Subscribe selector={(state) => state.rowSelection}>
        {(selection) => {
          const count = Object.keys(selection).length
          return (
            <Button
              size="sm"
              variant="destructive"
              disabled={count === 0}
              onClick={() => {
                setData((prev) => prev.filter((user) => !selection[user.id]))
                table.resetRowSelection()
              }}
            >
              <RiDeleteBinLine />
              Delete {count > 0 ? count : ""}
            </Button>
          )
        }}
      </table.Subscribe>
    ),
  })
  return <DataTable table={table} />
}

function ConfigProviderExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageSize: 5 } },
  })
  return <DataTable table={table} />
}

function ConfigProviderShell() {
  // App-wide strings and icons for every table below the provider.
  return (
    <DataTableConfigProvider
      localization={{ search: "Find", noRecordsToDisplay: "Nothing here" }}
      icons={{ search: RiSearch2Line }}
    >
      <ConfigProviderExample />
    </DataTableConfigProvider>
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
    slug: "selection-banner-overlay",
    title: "Selection banner over the header",
    description: "The selection banner lies over the header row.",
    category: "Selection & rows",
    Component: SelectionBannerOverlayExample,
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
    slug: "row-ordering-virtualized",
    title: "Row ordering (virtualized)",
    description:
      "Drag rows to reorder in a virtualized table (1,000 rows); it scrolls as you drag.",
    category: "Selection & rows",
    Component: VirtualizedRowOrderingExample,
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
    description: "Bring-your-own CSV export from a toolbar action.",
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
    slug: "rtl",
    title: "Right-to-left",
    description: "Arabic, laid out right to left with a pinned column.",
    category: "Data",
    Component: RtlExample,
  },
  {
    slug: "server-side",
    title: "Server-side (manual)",
    description: "Manual pagination against a simulated server.",
    category: "Data",
    Component: ServerSideExample,
  },
  {
    slug: "infinite-scroll",
    title: "Infinite scroll",
    description:
      "Append the next chunk as you scroll near the bottom (auto-hides the pager).",
    category: "Data",
    Component: InfiniteScrollExample,
  },
  {
    slug: "auto-row-height",
    title: "Auto row height",
    description:
      "getRowHeight: 'auto' wraps and grows rows to fit content, even with resizing.",
    category: "Data",
    Component: AutoRowHeightExample,
  },
  {
    slug: "advanced",
    title: "Advanced (kitchen sink)",
    description: "Most features enabled at once.",
    category: "Data",
    Component: AdvancedExample,
  },
  {
    slug: "slot-props",
    title: "Part props (slotProps)",
    description: "Style rows and header cells from slotProps, by row.",
    category: "Display",
    Component: SlotPropsExample,
  },
  {
    slug: "custom-filter-fns",
    title: "Custom filter function",
    description: "A named filter function offered in the column's mode menu.",
    category: "Filtering",
    Component: CustomFilterFnsExample,
  },
  {
    slug: "custom-sort-fns",
    title: "Custom sort function",
    description: "Sort roles by rank with a named sort function.",
    category: "Data",
    Component: CustomSortFnsExample,
  },
  {
    slug: "custom-aggregation",
    title: "Custom aggregation",
    description: "A named aggregation (salary spread) in grouped rows.",
    category: "Data",
    Component: CustomAggregationExample,
  },
  {
    slug: "editing-per-row",
    title: "Editing some rows only",
    description: "enableEditing as a function: inactive people are locked.",
    category: "Editing",
    Component: EditingPerRowExample,
  },
  {
    slug: "column-actions-menu",
    title: "Column menu items",
    description: "Your own column-menu item next to the built-in ones.",
    category: "Columns",
    Component: ColumnActionsMenuExample,
  },
  {
    slug: "row-actions-menu",
    title: "Row menu with built-in Edit",
    description: "The row menu's built-in Edit item plus Delete.",
    category: "Editing",
    Component: RowActionsMenuExample,
  },
  {
    slug: "display-columns",
    title: "Display columns",
    description: "Customize the row-number and selection columns.",
    category: "Columns",
    Component: DisplayColumnsExample,
  },
  {
    slug: "composition",
    title: "Composition",
    description: "Your own toolbar built from the table's parts.",
    category: "Display",
    Component: CompositionExample,
  },
  {
    slug: "datetime-filters",
    title: "Date-time, time & autocomplete filters",
    description: "datetime, time-range and autocomplete filter variants.",
    category: "Filtering",
    Component: DateTimeFiltersExample,
  },
  {
    slug: "edit-dialog",
    title: "Custom edit dialog",
    description: "renderEditRowDialogContent: a two-column form.",
    category: "Editing",
    Component: EditDialogExample,
  },
  {
    slug: "create-row",
    title: "Inline create row",
    description: "An inline create row at the bottom of the table.",
    category: "Editing",
    Component: CreateRowExample,
  },
  {
    slug: "controlled-state",
    title: "Controlled state",
    description: "Sorting and density controlled from outside the table.",
    category: "Data",
    Component: ControlledStateExample,
  },
  {
    slug: "body-only",
    title: "Body only",
    description: "No header or toolbars: a compact list.",
    category: "Display",
    Component: BodyOnlyExample,
  },
  {
    slug: "empty-state",
    title: "Empty state",
    description: "A custom message and action when there are no rows.",
    category: "Display",
    Component: EmptyStateExample,
  },
  {
    slug: "fixed-row-height",
    title: "Fixed row height",
    description: "200 virtualized rows at a fixed 36px.",
    category: "Data",
    Component: FixedRowHeightExample,
  },
  {
    slug: "column-autosize",
    title: "Column auto-size",
    description: "Fit every column to its content from a toolbar button.",
    category: "Columns",
    Component: ColumnAutosizeExample,
  },
  {
    slug: "pagination-pages",
    title: "Numbered pages",
    description: "Numbered page buttons above and below the table.",
    category: "Display",
    Component: PaginationPagesExample,
  },
  {
    slug: "selection-actions",
    title: "Bulk actions",
    description: "Delete the selected rows from a toolbar button.",
    category: "Selection & rows",
    Component: SelectionActionsExample,
  },
  {
    slug: "config-provider",
    title: "App-wide config",
    description:
      "DataTableConfigProvider sets strings and icons for every table.",
    category: "Data",
    Component: ConfigProviderShell,
  },
  ...MORE_EXAMPLES,
]
