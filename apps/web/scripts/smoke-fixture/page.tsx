"use client"

// Smoke-test page copied into a freshly scaffolded shadcn app by
// scripts/smoke-install.mjs. It imports only from the registry's install
// path and switches on the main features so `tsc` and `next build` compile
// and pre-render every major code path and primitive the block uses.
// Excluded from this workspace's typecheck/lint: its imports only resolve
// inside the generated app.
import * as React from "react"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  DataTable,
  useDataTable,
  type DataTableColumnDef,
} from "@/components/ui/data-table"

type Person = {
  id: string
  name: string
  dept: "eng" | "ops" | "sales"
  age: number
  salary: number
  hired: string
}

const DEPTS = ["eng", "ops", "sales"] as const

function makePeople(count: number): Person[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: `Person ${i + 1}`,
    dept: DEPTS[i % DEPTS.length]!,
    age: 20 + (i % 45),
    salary: 40_000 + (i % 12) * 5_000,
    hired: `2020-01-${String((i % 28) + 1).padStart(2, "0")}`,
  }))
}

const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name", meta: { editVariant: "text" } },
  {
    accessorKey: "dept",
    header: "Department",
    meta: {
      variant: "select",
      options: DEPTS.map((d) => ({ label: d, value: d })),
      editVariant: "select",
      editSelectOptions: DEPTS.map((d) => ({ label: d, value: d })),
    },
  },
  {
    accessorKey: "age",
    header: "Age",
    meta: { variant: "range-slider", align: "right", editVariant: "number" },
    aggregationFn: "mean",
  },
  {
    accessorKey: "salary",
    header: "Salary",
    meta: { variant: "range", align: "right" },
    aggregationFn: "sum",
    footer: "Total",
  },
  { accessorKey: "hired", header: "Hired", meta: { variant: "date" } },
]

export default function Page() {
  const data = React.useMemo(() => makePeople(50), [])
  const table = useDataTable<Person>({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    enableRowNumbers: true,
    enableRowPinning: true,
    enableColumnFilterModes: true,
    enableFacetedValues: true,
    enableAdvancedFilter: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableColumnOrdering: true,
    enableColumnResizing: true,
    enableClickToCopy: true,
    enableEditing: true,
    editDisplayMode: "modal",
    enableRowVirtualization: true,
    renderDetailPanel: ({ row }) => <div>{row.original.name}</div>,
    renderRowActionMenuItems: ({ row }) => (
      <DropdownMenuItem onSelect={() => console.log(row.id)}>
        Log id
      </DropdownMenuItem>
    ),
    initialState: { pagination: { pageSize: 25 } },
  })
  return (
    <main className="p-6">
      <DataTable table={table} />
    </main>
  )
}
