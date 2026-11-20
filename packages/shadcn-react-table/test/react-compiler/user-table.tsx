// Compiled by React Compiler in the unit tests (see vitest.config.ts), as a
// consumer's component would be in an app that builds with it.
import { DataTable } from "../../src/components/data-table/core/data-table"
import type { DataTableColumnDef } from "../../src/components/data-table/core/table-types"
import { useDataTable } from "../../src/components/data-table/core/use-data-table"

export type User = { id: string; name: string }

const columns: DataTableColumnDef<User>[] = [
  { accessorKey: "name", header: "Name" },
]

export function UserTable({ users }: { users: User[] }) {
  const table = useDataTable<User>({
    data: users,
    columns,
    getRowId: (row) => row.id,
  })
  return <DataTable table={table} />
}
