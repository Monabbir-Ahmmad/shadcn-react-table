# Export

The table ships no built-in export — the same stance as Material React
Table — so the block carries no CSV or spreadsheet dependencies. Everything
an exporter needs is already on the table instance: pick the rows, map them
through the visible columns, and hand the result to whichever writer you
prefer.

Example (`export`):

```tsx
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
```

## Reading the data

Pick a row scope from the table's row models, then build an array-of-arrays
(header + rows) from the visible data columns:

```tsx
import type { DataTableInstance } from "@/components/ui/data-table"

function toRows<TData>(table: DataTableInstance<TData>) {
  // Selected rows when any are selected, else the filtered set (all pages).
  const selected = table.getSelectedRowModel().rows
  const rows = selected.length > 0 ? selected : table.getFilteredRowModel().rows
  // Data columns only — injected columns (selection, actions, …) have no accessor.
  const columns = table
    .getVisibleLeafColumns()
    .filter((column) => column.accessorFn != null)
  return [
    columns.map((column) => column.id),
    ...rows.map((row) => columns.map((column) => row.getValue(column.id))),
  ]
}
```

Other scopes: `table.getRowModel().rows` (current page) and
`table.getPreFilteredRowModel().rows` (everything, ignoring filters).

## Writing a CSV

No library needed for CSV. Two details matter: quote cells containing
delimiters, and neutralize formula injection (spreadsheets execute cells
starting with `=`, `+`, `-`, `@`, tab, or CR when a CSV is opened):

```tsx
function toCsv(rows: unknown[][]) {
  const escape = (value: unknown) => {
    const text = value == null ? "" : String(value)
    const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
    return /[",\n]/.test(guarded)
      ? `"${guarded.replace(/"/g, '""')}"`
      : guarded
  }
  return rows.map((row) => row.map(escape).join(",")).join("\n")
}

function downloadCsv(csv: string, fileName: string) {
  // The BOM makes Excel detect UTF-8.
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${fileName}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
```

Wire it to the toolbar with `renderTopToolbarCustomActions`:

```tsx
const table = useDataTable({
  data,
  columns,
  enableRowSelection: true,
  renderTopToolbarCustomActions: ({ table }) => (
    <Button onClick={() => downloadCsv(toCsv(toRows(table)), "users")}>
      Export CSV
    </Button>
  ),
})
```

## Excel and richer formats

For `.xlsx`, feed the same array-of-arrays to
[SheetJS](https://docs.sheetjs.com/docs/getting-started/installation/nodejs)
(`XLSX.utils.aoa_to_sheet` → `XLSX.writeFile`) — note SheetJS is installed
from their CDN tarball, not npm. For heavier CSV needs (custom delimiters,
streaming), [PapaParse](https://www.papaparse.com/)'s `unparse` accepts the
same shape.

Example (`export-pdf`):

```tsx
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
```

## Related

- [Row selection](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/row-selection): Set enableRowSelection: true to add a leading checkbox column.
- [Toolbar customization](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/toolbar): The table renders a top toolbar (title slot + your actions on the left, an icon-action cluster on the right) and a bottom toolbar (pagination).
