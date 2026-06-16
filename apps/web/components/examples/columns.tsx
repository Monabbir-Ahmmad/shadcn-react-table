"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@workspace/ui/components/badge"

import type { User } from "@/lib/example-data"

export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

export const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
})

const STATUS_VARIANT: Record<
  User["status"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  active: "default",
  pending: "outline",
  inactive: "destructive",
}

const ROLE_OPTIONS = [
  { label: "Owner", value: "Owner" },
  { label: "Admin", value: "Admin" },
  { label: "Editor", value: "Editor" },
  { label: "Viewer", value: "Viewer" },
]

const DEPARTMENT_OPTIONS = [
  { label: "Engineering", value: "Engineering" },
  { label: "Sales", value: "Sales" },
  { label: "Marketing", value: "Marketing" },
  { label: "Support", value: "Support" },
  { label: "Design", value: "Design" },
]

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Inactive", value: "inactive" },
]

/**
 * A rich, reusable column set for the User examples. Individual examples slice
 * or tweak this; cells, filter variants, edit variants, and aggregation are all
 * wired so any feature flag can be demonstrated against it.
 */
export function userColumns(): ColumnDef<User>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      enableSorting: false,
      enableColumnFilter: false,
      size: 90,
      meta: { disableColumnActions: true, enableEditing: false, enableClickToCopy: true },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: "firstName",
      header: "First name",
      meta: { editVariant: "text" },
    },
    {
      accessorKey: "lastName",
      header: "Last name",
      meta: { editVariant: "text" },
    },
    {
      accessorKey: "email",
      header: "Email",
      meta: { editVariant: "text", enableClickToCopy: true },
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      meta: {
        variant: "select",
        options: ROLE_OPTIONS,
        editVariant: "select",
        editSelectOptions: ROLE_OPTIONS,
      },
    },
    {
      accessorKey: "department",
      header: "Department",
      meta: {
        variant: "multi-select",
        options: DEPARTMENT_OPTIONS,
        editVariant: "select",
        editSelectOptions: DEPARTMENT_OPTIONS,
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      meta: {
        variant: "multi-select",
        options: STATUS_OPTIONS,
        editVariant: "select",
        editSelectOptions: STATUS_OPTIONS,
      },
      cell: ({ getValue }) => {
        const status = getValue<User["status"]>()
        return (
          <Badge variant={STATUS_VARIANT[status]} className="capitalize">
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "age",
      header: "Age",
      sortDescFirst: true,
      aggregationFn: "mean",
      meta: {
        align: "right",
        variant: "range-slider",
        editVariant: "number",
        validate: (v) =>
          typeof v === "number" && (v < 0 || v > 120) ? "0–120" : undefined,
      },
      cell: ({ getValue }) => (
        <span className="tabular-nums">{getValue<number>()}</span>
      ),
      aggregatedCell: ({ getValue }) => (
        <span className="tabular-nums text-muted-foreground">
          ~{Math.round(getValue<number>())}
        </span>
      ),
    },
    {
      accessorKey: "salary",
      header: "Salary",
      sortDescFirst: true,
      aggregationFn: "sum",
      meta: {
        align: "right",
        variant: "range-slider",
        editVariant: "number",
      },
      cell: ({ getValue }) => (
        <span className="font-medium tabular-nums">
          {currency.format(getValue<number>())}
        </span>
      ),
      aggregatedCell: ({ getValue }) => (
        <span className="font-semibold tabular-nums">
          {currency.format(getValue<number>())}
        </span>
      ),
      footer: ({ table }) => (
        <span className="font-semibold tabular-nums">
          {currency.format(
            table
              .getFilteredRowModel()
              .rows.reduce((sum, row) => sum + row.original.salary, 0)
          )}
        </span>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Start date",
      meta: { variant: "date", enableEditing: false },
      cell: ({ getValue }) => (
        <span className="tabular-nums text-muted-foreground">
          {dateFmt.format(getValue<Date>())}
        </span>
      ),
    },
    {
      accessorKey: "progress",
      header: "Progress",
      meta: { align: "right", variant: "range-slider", enableEditing: false },
      cell: ({ getValue }) => {
        const value = getValue<number>()
        return (
          <div className="flex items-center justify-end gap-2">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
              {value}%
            </span>
          </div>
        )
      },
    },
  ]
}
