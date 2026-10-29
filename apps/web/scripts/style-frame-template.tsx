"use client"

import * as React from "react"

import { Badge } from "@/style-kits/__STYLE__/badge"
import { remixIcons } from "@/components/examples/icon-sets"
import { makeUsers, type User } from "@/lib/example-data"

import {
  DataTable,
  DataTableConfigProvider,
  useDataTable,
  type DataTableColumnDef,
} from "./data-table"

const DATA = makeUsers(40)

const COLUMNS: DataTableColumnDef<User>[] = [
  { accessorKey: "firstName", header: "First name" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ getValue }) => (
      <Badge variant="secondary">{getValue<string>()}</Badge>
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
    initialState: { pagination: { pageIndex: 0, pageSize: 6 } },
  })
  return (
    <DataTableConfigProvider icons={icons === "remix" ? remixIcons : undefined}>
      <DataTable table={table} />
    </DataTableConfigProvider>
  )
}
