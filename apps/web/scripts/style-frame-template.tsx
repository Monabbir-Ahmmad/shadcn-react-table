"use client"

import * as React from "react"

import { Badge } from "@/style-kits/__STYLE__/badge"
import { Button } from "@/style-kits/__STYLE__/button"
import { remixIcons } from "@/components/examples/icon-sets"
import { makeUsers, type User } from "@/lib/example-data"

import {
  DataTable,
  DataTableConfigProvider,
  useDataTable,
  type DataTableColumnDef,
} from "./data-table"

const DATA = makeUsers(40)

// Mixed badge variants show how each style draws filled, tinted and outlined.
const ROLE_VARIANT = {
  Owner: "default",
  Admin: "secondary",
  Editor: "outline",
  Viewer: "secondary",
} as const

const COLUMNS: DataTableColumnDef<User>[] = [
  { accessorKey: "firstName", header: "First name" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ getValue }) => (
      <Badge variant={ROLE_VARIANT[getValue<User["role"]>()]}>
        {getValue<string>()}
      </Badge>
    ),
    meta: { filterVariant: "select" },
  },
  {
    accessorKey: "department",
    header: "Department",
    meta: { filterVariant: "multi-select" },
  },
  {
    accessorKey: "salary",
    header: "Salary",
    cell: ({ getValue }) => `$${getValue<number>().toLocaleString("en-US")}`,
  },
]

/** The table in the __STYLE__ style, for the home page style deck. */
export default function FrameTable({ icons }: { icons: "lucide" | "remix" }) {
  const table = useDataTable({
    data: DATA,
    columns: COLUMNS,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 5 },
      showGlobalFilter: true,
      rowSelection: { [DATA[1]!.id]: true },
    },
    renderTopToolbarCustomActions: () => (
      <div className="flex items-center gap-2">
        <Button size="sm">Add user</Button>
        <Button size="sm" variant="outline">
          Export
        </Button>
      </div>
    ),
  })
  return (
    <DataTableConfigProvider icons={icons === "remix" ? remixIcons : undefined}>
      <DataTable table={table} />
    </DataTableConfigProvider>
  )
}
