"use client"

import * as React from "react"

import type { RowData } from "@tanstack/react-table"

import { cn } from "@workspace/ui/lib/utils"

import type { DataTableCoreTable } from "../../core/table-types"
import type { DataTableInstance } from "../../core/types"
import { dt } from "../../core/internal"
import {
  isEditingOrCreating,
  MOTION_TIMING_CLASS,
  readMotionTokens,
  useAnimationsActive,
} from "../../core/motion"
import { getSlotProps, mergeProps } from "../../helpers/slot-props"
import { usePresence } from "../../hooks/use-presence"
import { SelectAllCheckbox } from "../../injected-columns/selection-column"

/**
 * The banner's count text while it shows (and, while it fades out, the last
 * one it showed), with the presence ref for its root and the ref of the
 * count's span (crossfaded when the text changes).
 */
function useSelectionBanner<TData extends RowData>(
  table: DataTableInstance<TData>,
  overlay: boolean
) {
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
  // Still while a cell or row is edited or created (read here, not
  // subscribed: it only matters when the selection changes).
  const editing = isEditingOrCreating(table.getState())
  const { present, ref } = usePresence<HTMLDivElement>(
    text !== null,
    useAnimationsActive(enableAnimations) && !editing,
    { overlay }
  )
  // The count it last showed, kept while it fades out.
  const [lastText, setLastText] = React.useState(text)
  if (text !== null && text !== lastText) setLastText(text)
  const shown = present ? (text ?? lastText) : null
  const countRef = React.useRef<HTMLSpanElement>(null)
  useCountCrossfade(countRef, shown)
  return { shown, ref, countRef }
}

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
  const { localization } = dt(table)
  const { shown, ref, countRef } = useSelectionBanner(table, false)

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

/** The header's last header-group row: the leaf column headers (not the
 *  filter row under them). */
function leafHeaderRow(head: HTMLElement) {
  const rows = head.querySelectorAll<HTMLElement>(
    ":scope > tr:not([data-filter-row])"
  )
  return rows[rows.length - 1] ?? null
}

/**
 * Where the leaf header row sits below `anchor`, and how tall it is, while
 * `active`: measured after each render and whenever the header resizes
 * (density, wrapped titles, grouped header rows).
 */
function useHeaderRowBox(
  headRef: React.RefObject<HTMLTableSectionElement | null>,
  anchorRef: React.RefObject<HTMLDivElement | null>,
  active: boolean
) {
  const [box, setBox] = React.useState<{ top: number; height: number }>()
  const measure = React.useCallback(() => {
    const head = headRef.current
    const anchor = anchorRef.current
    const row = head && leafHeaderRow(head)
    if (!row || !anchor) return
    const rowRect = row.getBoundingClientRect()
    const top = rowRect.top - anchor.getBoundingClientRect().top
    const height = rowRect.height
    setBox((prev) =>
      prev &&
      Math.abs(prev.top - top) < 0.5 &&
      Math.abs(prev.height - height) < 0.5
        ? prev
        : { top, height }
    )
  }, [headRef, anchorRef])
  React.useLayoutEffect(() => {
    if (active) measure()
  })
  React.useLayoutEffect(() => {
    const head = headRef.current
    if (!active || !head || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(head)
    return () => observer.disconnect()
  }, [active, headRef, measure])
  return box
}

/**
 * Whether focus is in the leaf header row (reached with Tab or the grid's
 * arrow keys): the banner over it then steps aside, so a focused header
 * control is never hidden behind it.
 */
function useHeaderRowFocus(
  headRef: React.RefObject<HTMLTableSectionElement | null>,
  active: boolean
) {
  const [focused, setFocused] = React.useState(false)
  React.useEffect(() => {
    const head = headRef.current
    if (!active || !head) return
    const inRow = (node: EventTarget | null) => {
      const row = leafHeaderRow(head)
      return !!row && node instanceof Node && row.contains(node)
    }
    const onFocusIn = (event: FocusEvent) => setFocused(inRow(event.target))
    const onFocusOut = (event: FocusEvent) =>
      setFocused(inRow(event.relatedTarget))
    setFocused(inRow(document.activeElement))
    head.addEventListener("focusin", onFocusIn)
    head.addEventListener("focusout", onFocusOut)
    return () => {
      head.removeEventListener("focusin", onFocusIn)
      head.removeEventListener("focusout", onFocusOut)
      setFocused(false)
    }
  }, [active, headRef])
  return focused
}

/**
 * The selection banner over the header row
 * (`positionToolbarAlertBanner: "head-overlay"`, as in Material React Table):
 * the select-all checkbox, the localized count and a Clear action lie over
 * the leaf header row while rows are selected, so the table never moves.
 *
 * Rendered first in the scroll surface, in a zero-height anchor that is
 * sticky to the surface's start edge (and to its top with a sticky header):
 * the banner spans the visible width on horizontal scroll and stays over the
 * sticky header on vertical scroll. It is layered above the header (z-30 over
 * the header's z-20) and placed at the leaf header row's measured offset and
 * height. It comes and goes with the same presence motion as the toolbar
 * banner; with nothing selected it is not rendered at all, so the header
 * takes every click. When a header control gets focus (Tab or the grid's
 * arrow keys), the banner fades aside until focus leaves the header row.
 */
export function DataTableHeadOverlayBanner<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const {
    localization,
    enableStickyHeader,
    enableSelectAll,
    selectAllMode,
    refs,
  } = dt(table)
  const { shown, ref, countRef } = useSelectionBanner(table, true)
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const box = useHeaderRowBox(refs.tableHeadRef, anchorRef, shown !== null)
  const headFocused = useHeaderRowFocus(refs.tableHeadRef, shown !== null)

  if (shown === null) return null

  const withSelectAll =
    enableSelectAll && table.options.enableMultiRowSelection !== false

  return (
    <div
      ref={anchorRef}
      data-slot="data-table-alert-banner-anchor"
      className={cn("sticky start-0 z-30 h-0", enableStickyHeader && "top-0")}
    >
      <div
        {...mergeProps(
          {
            ref,
            "data-slot": "data-table-alert-banner",
            "data-position": "head-overlay",
            "data-head-focused": headFocused || undefined,
            className: cn(
              "absolute inset-x-0 flex items-center gap-3 border-b bg-muted pe-3 text-xs font-medium text-muted-foreground transition-opacity",
              MOTION_TIMING_CLASS,
              !withSelectAll && "ps-3",
              headFocused && "pointer-events-none opacity-0"
            ),
            style: box
              ? { top: box.top, height: box.height }
              : { visibility: "hidden" },
            role: "status",
          } as React.ComponentProps<"div">,
          getSlotProps(table, "alertBanner", {})
        )}
      >
        {withSelectAll && (
          // As wide as the selection column, so the checkbox sits over the
          // header's own one when that column comes first.
          <span className="flex w-11 shrink-0 items-center justify-center">
            <SelectAllCheckbox
              table={table as unknown as DataTableCoreTable<TData>}
              label={localization.selectAll}
              selectAllMode={selectAllMode}
            />
          </span>
        )}
        {/* The box the old count's copy fades out in (see useCountCrossfade). */}
        <span className="relative min-w-0 truncate">
          <span ref={countRef} data-slot="data-table-selected-count">
            {shown}
          </span>
        </span>
        <button
          type="button"
          onClick={() => table.resetRowSelection()}
          className="ms-auto shrink-0 font-semibold tracking-wide text-foreground underline-offset-4 hover:underline"
        >
          {localization.clearSelection}
        </button>
      </div>
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
