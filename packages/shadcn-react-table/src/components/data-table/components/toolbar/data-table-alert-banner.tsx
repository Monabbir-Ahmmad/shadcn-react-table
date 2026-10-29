"use client"

import type * as React from "react"

import type { RowData } from "@tanstack/react-table"

import type { DataTableInstance } from "../../core/types"
import { dt } from "../../core/internal"
import { getSlotProps, mergeProps } from "../../helpers/slot-props"

/**
 * Selection alert banner shown between the toolbar and the table when any rows
 * are selected: a muted strip with the localized count and a Clear action.
 */
export function DataTableAlertBanner<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const { localization, enableRowSelection } = dt(table)
  if (!enableRowSelection) return null

  const selectedCount = table.getSelectedRowModel().rows.length
  if (selectedCount === 0) return null

  const totalCount = table.getPrePaginatedRowModel().rows.length

  return (
    <div
      {...mergeProps(
        {
          "data-slot": "data-table-alert-banner",
          className:
            "flex items-center justify-between gap-3 rounded-md border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground",
          role: "status",
        } as React.ComponentProps<"div">,
        getSlotProps(table, "alertBanner", {})
      )}
    >
      <span>{localization.rowsSelected(selectedCount, totalCount)}</span>
      <button
        type="button"
        onClick={() => table.resetRowSelection()}
        className="font-semibold tracking-wide text-foreground underline-offset-4 hover:underline"
      >
        {localization.clearSelection}
      </button>
    </div>
  )
}
