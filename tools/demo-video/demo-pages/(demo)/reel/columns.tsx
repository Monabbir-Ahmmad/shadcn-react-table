"use client"

// Temporary columns for the marketing-video pages (local only).

import * as React from "react"
import type { DataTableColumnDef } from "@monabbir/shadcn-react-table/components/data-table"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

import type { Person } from "./people"

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})
const month = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

const HUES = [145, 250, 25, 300, 200, 60, 330, 175, 280, 95]

function Avatar({ name, id }: { name: string; id: string }) {
  const hue = HUES[Number(id.replace(/\D/g, "")) % HUES.length]
  return (
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
      style={{
        backgroundColor: `oklch(0.9 0.06 ${hue})`,
        color: `oklch(0.35 0.1 ${hue})`,
      }}
    >
      {name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)}
    </span>
  )
}

function Status({ status }: { status?: Person["status"] }) {
  if (!status) return null
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] leading-none",
        status === "active" ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "active" ? "bg-primary" : "bg-muted-foreground/50"
        )}
      />
      {status}
    </span>
  )
}

function Rating({ value }: { value?: number }) {
  if (value === undefined) return null
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full bg-primary"
          style={{ width: `${value}%` }}
        />
      </span>
      <span className="font-mono text-xs text-muted-foreground tabular-nums">
        {Math.round(value)}
      </span>
    </span>
  )
}

export const columns: DataTableColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row, renderedCellValue }) =>
      row.getIsGrouped() ? null : (
        <span className="flex min-w-0 items-center gap-3">
          <Avatar name={row.original.name} id={row.original.id} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{renderedCellValue}</span>
            <span className="truncate text-xs text-muted-foreground">
              {row.original.email}
            </span>
          </span>
        </span>
      ),
    meta: { enableEditing: false },
  },
  {
    accessorKey: "team",
    header: "Team",
    cell: ({ renderedCellValue }) => (
      <Badge variant="outline">{renderedCellValue}</Badge>
    ),
    meta: {
      enableEditing: false,
      filterVariant: "select",
      filterSelectOptions: [
        "Research",
        "Platform",
        "Design",
        "Growth",
        "Sales",
      ].map((t) => ({ label: t, value: t })),
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <Status status={getValue<Person["status"]>()} />,
    meta: {
      enableEditing: false,
      filterVariant: "select",
      filterSelectOptions: ["active", "invited", "paused"].map((s) => ({
        label: s,
        value: s,
      })),
    },
  },
  {
    accessorKey: "joined",
    header: "Joined",
    enableGrouping: false,
    cell: ({ getValue }) => {
      const v = getValue<unknown>()
      return typeof v === "string" ? (
        <span className="text-muted-foreground tabular-nums">
          {month.format(new Date(v))}
        </span>
      ) : null
    },
    meta: { enableEditing: false },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    aggregationFn: "mean",
    cell: ({ getValue }) => <Rating value={getValue<number>()} />,
    meta: {
      enableEditing: false,
      renderAggregatedCell: ({ cell }) => (
        <Rating value={cell.getValue<number>()} />
      ),
    },
  },
  {
    accessorKey: "salary",
    header: "Salary",
    aggregationFn: "sum",
    cell: ({ getValue }) => (
      <span className="font-mono tabular-nums">
        {money.format(getValue<number>())}
      </span>
    ),
    meta: {
      align: "right",
      editVariant: "number",
      filterVariant: "range",
      renderAggregatedCell: ({ cell }) => (
        <span className="font-mono font-semibold tabular-nums">
          {money.format(cell.getValue<number>())}
        </span>
      ),
    },
  },
]
