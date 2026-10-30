"use client"

import * as React from "react"

import type { RowData } from "@tanstack/react-table"

import type { DataTableInstance } from "../../core/types"
import { dt } from "../../core/internal"
import { readMotionTokens } from "../../core/motion"
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
  const selectedCount = enableRowSelection
    ? table.getSelectedRowModel().rows.length
    : 0
  const countRef = React.useRef<HTMLSpanElement>(null)
  useCountAnimation(countRef, selectedCount)

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
      <span
        key={selectedCount}
        ref={countRef}
        data-slot="data-table-selected-count"
      >
        {localization.rowsSelected(selectedCount, totalCount)}
      </span>
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

/**
 * Fades the (re-keyed) count in when the number changes. Not when the banner
 * first appears (from 0), and never unless the table animates: the root's
 * `[data-animations]` already folds in `enableAnimations` and reduced motion,
 * so reading it here needs no extra prop or media-query subscription.
 */
function useCountAnimation(
  ref: React.RefObject<HTMLSpanElement | null>,
  count: number
) {
  const prev = React.useRef(count)
  React.useLayoutEffect(() => {
    const before = prev.current
    prev.current = count
    const el = ref.current
    if (!el || before === 0 || before === count) return
    const root = el.closest("[data-animations]")
    if (!root || typeof el.animate !== "function") return
    const { durationFast, ease } = readMotionTokens(root)
    el.animate(
      [
        { opacity: 0, transform: "translateY(4px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: durationFast, easing: ease }
    )
  }, [ref, count])
}
