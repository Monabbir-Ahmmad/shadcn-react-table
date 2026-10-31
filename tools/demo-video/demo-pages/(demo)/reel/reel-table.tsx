"use client"

// Temporary table for the marketing-video page (local only).

import * as React from "react"
import {
  DataTable,
  useDataTable,
  type DataTableColumnDef,
} from "@monabbir/shadcn-react-table/components/data-table"

import { dataTableLocalizationAr } from "@monabbir/shadcn-react-table/components/data-table/locales/ar"

import { columns } from "./columns"
import { makePeople, type Person } from "./people"

const AR_HEADERS: Record<string, string> = {
  name: "الاسم",
  team: "الفريق",
  status: "الحالة",
  joined: "تاريخ الانضمام",
  rating: "التقييم",
  salary: "الراتب",
}
const arColumns = columns.map(
  (c) =>
    ({
      ...c,
      header:
        AR_HEADERS[(c as { accessorKey?: string }).accessorKey ?? ""] ??
        c.header,
    }) as DataTableColumnDef<Person>
)

export function ReelTable({
  big = false,
  rtl = false,
}: {
  big?: boolean
  rtl?: boolean
}) {
  const [data, setData] = React.useState<Person[]>(() =>
    makePeople(big ? 100_000 : 40)
  )

  const table = useDataTable<Person>({
    data,
    columns: rtl ? arColumns : columns,
    localization: rtl ? dataTableLocalizationAr : undefined,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    enableGrouping: true,
    enableEditing: !big,
    editDisplayMode: "cell",
    onEditingCellSave: ({ row, column, value }) =>
      setData((rows) =>
        rows.map((r) =>
          r.id === row.id ? { ...r, [column.id]: Number(value) } : r
        )
      ),
    enableColumnOrdering: true,
    enableColumnPinning: true,
    enableColumnResizing: !big,
    enableStickyHeader: true,
    enablePagination: big ? false : true,
    enableRowVirtualization: big,
    pageSizeOptions: [8, 16, 40],
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
    slotProps: big
      ? // Inline: Tailwind skips these git-ignored demo files.
        { surface: { style: { height: 680, maxHeight: "none" } } }
      : undefined,
  })

  return rtl ? (
    <div dir="rtl">
      <DataTable table={table} />
    </div>
  ) : (
    <DataTable table={table} />
  )
}
