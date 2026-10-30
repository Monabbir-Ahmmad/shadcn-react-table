"use client"

import * as React from "react"

import type { RowData } from "@tanstack/react-table"

import type { DataTableInstance } from "../../core/types"
import { dt } from "../../core/internal"
import { readMotionTokens, useAnimationsActive } from "../../core/motion"
import { getSlotProps, mergeProps } from "../../helpers/slot-props"
import { usePresence } from "../../hooks/use-presence"

/**
 * Selection alert banner shown between the toolbar and the table when any rows
 * are selected: a muted strip with the localized count and a Clear action.
 * It slides in, and fades out with the last count it showed before it goes
 * (see `usePresence`).
 */
export function DataTableAlertBanner<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const { localization, enableRowSelection, enableAnimations } = dt(table)
  const selectedCount = enableRowSelection
    ? table.getSelectedRowModel().rows.length
    : 0
  const totalCount =
    selectedCount > 0 ? table.getPrePaginatedRowModel().rows.length : 0
  const text =
    selectedCount > 0
      ? localization.rowsSelected(selectedCount, totalCount)
      : null
  const { present, ref } = usePresence<HTMLDivElement>(
    text !== null,
    useAnimationsActive(enableAnimations)
  )
  // The count it last showed, kept while it fades out.
  const [lastText, setLastText] = React.useState(text)
  if (text !== null && text !== lastText) setLastText(text)
  const shown = present ? (text ?? lastText) : null
  const countRef = React.useRef<HTMLSpanElement>(null)
  useCountCrossfade(countRef, shown)

  if (shown === null) return null

  return (
    <div
      {...mergeProps(
        {
          ref,
          "data-slot": "data-table-alert-banner",
          className:
            "flex items-center justify-between gap-3 rounded-md border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground",
          role: "status",
        } as React.ComponentProps<"div">,
        getSlotProps(table, "alertBanner", {})
      )}
    >
      {/* The box the old count's copy fades out in (see useCountCrossfade). */}
      <span className="relative">
        <span ref={countRef} data-slot="data-table-selected-count">
          {shown}
        </span>
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
 * Crossfades the count when its text changes: the new text fades in while a
 * short-lived copy of the old one, laid over it in the same box, fades out
 * and is removed. Not when the banner first appears (from 0), and never
 * unless the table animates: the root's `[data-animations]` already folds in
 * `enableAnimations` and reduced motion, so reading it here needs no extra
 * prop or media-query subscription.
 */
function useCountCrossfade(
  ref: React.RefObject<HTMLSpanElement | null>,
  text: string | null
) {
  const prev = React.useRef(text)
  const copy = React.useRef<HTMLElement | null>(null)
  React.useLayoutEffect(() => {
    const before = prev.current
    prev.current = text
    const el = ref.current
    const box = el?.parentElement
    if (!el || !box || before === null || before === text) return
    const root = el.closest("[data-animations]")
    if (!root || typeof el.animate !== "function") return
    const { durationFast, ease } = readMotionTokens(root)
    copy.current?.remove()
    const old = document.createElement("span")
    old.textContent = before
    old.setAttribute("aria-hidden", "true")
    old.setAttribute("data-slot", "data-table-selected-count-previous")
    Object.assign(old.style, {
      position: "absolute",
      top: "0",
      insetInlineStart: "0",
      whiteSpace: "nowrap",
      pointerEvents: "none",
    })
    box.append(old)
    copy.current = old
    const remove = () => {
      old.remove()
      if (copy.current === old) copy.current = null
    }
    const timing = { duration: durationFast, easing: ease }
    el.animate([{ opacity: 0 }, { opacity: 1 }], timing)
    old
      .animate([{ opacity: 1 }, { opacity: 0 }], {
        ...timing,
        fill: "forwards",
      })
      .finished.then(remove, remove)
  }, [ref, text])
}
