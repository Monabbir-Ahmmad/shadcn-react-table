"use client"

import { DndContext } from "@dnd-kit/core"
import { type RowData } from "@tanstack/react-table"
import * as React from "react"

import { Table, TableCaption } from "@workspace/ui/components/table"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

import { DataTableBody } from "../components/body/data-table-body"
import {
  DataTableFooter,
  hasFooter,
} from "../components/body/data-table-footer"
import { DataTableEditModal } from "../components/editing/data-table-edit-modal"
import { DataTableHeader } from "../components/head/data-table-header"
import { DataTableAlertBanner } from "../components/toolbar/data-table-alert-banner"
import { DataTableBottomToolbar } from "../components/toolbar/data-table-bottom-toolbar"
import { DataTableDropToGroupZone } from "../components/toolbar/data-table-grouping"
import { DataTablePagination } from "../components/toolbar/data-table-pagination"
import { DataTableToolbar } from "../components/toolbar/data-table-toolbar"
import { useGridNavigation } from "../hooks/use-grid-navigation"
import { useDragAnnouncements } from "../hooks/use-drag-announcements"
import { useInfiniteScroll } from "../hooks/use-infinite-scroll"
import { useTableDnd } from "../hooks/use-table-dnd"
import { useTableVirtualizers } from "../hooks/use-table-virtualizers"
import { useFullscreenModal } from "../hooks/use-fullscreen-modal"
import { getDataRowCount, getHeaderRowCount } from "../helpers/grid-rows"
import { getColumnSizeVars } from "../utils/column-styles"
import { type DataTableInstance } from "./types"

/**
 * Body wrapper that freezes during an active column resize. With
 * `columnResizeMode: "onChange"` the table re-renders on every mousemove;
 * skipping the body's re-render keeps drags smooth, since column widths come
 * from the CSS size vars on `<table>` and update without React. Outside of a
 * resize the comparator returns false, so normal re-rendering is unchanged.
 */
const MemoizedDataTableBody = React.memo(
  DataTableBody,
  (_prev, next) =>
    next.table.getState().columnSizingInfo.isResizingColumn !== false
) as typeof DataTableBody

interface DataTableProps<
  TData extends RowData,
> extends React.ComponentProps<"div"> {
  table: DataTableInstance<TData>
  /** Page-size options for the bottom pagination control. */
  pageSizeOptions?: number[]
  /** Extra classes for the scrollable table surface (e.g. a max-height that
   *  overrides the default sticky-header/virtualization bound). */
  surfaceClassName?: string
}

/**
 * Points a callback or object ref at `el`. Returns the callback's return value
 * (a React 19 ref cleanup) when `ref` is a function.
 */
function assignRef<T>(ref: React.Ref<T> | undefined, el: T | null) {
  if (typeof ref === "function") return ref(el)
  if (ref) ref.current = el
}

/**
 * Renders a data table from an instance produced by {@link useDataTable}.
 * Vertical stack: top toolbar → alert banner → drop-to-group zone → bordered
 * surface (sticky header, optional filter row, body, optional sticky footer) →
 * pagination. Wires DnD column/row ordering, pinning, resizing, grouping,
 * expansion, and detail panels.
 */
export function DataTable<TData extends RowData>({
  table,
  pageSizeOptions,
  surfaceClassName,
  className,
  ref: refProp,
  onKeyDown: onKeyDownProp,
  ...props
}: DataTableProps<TData>) {
  const {
    density,
    isFullscreen,
    setIsFullscreen,
    isLoading,
    isSaving,
    showProgressBars,
    showLoadingOverlay,
    enableColumnResizing,
    enableGrouping,
    enableRowVirtualization,
    enableStickyHeader,
    enablePagination,
    enableInfiniteScroll,
    onLoadMore,
    hasNextPage,
    isFetchingNextPage,
    infiniteScrollThreshold,
    positionPagination,
    positionToolbarAlertBanner,
    positionToolbarDropZone,
    enableTopToolbar,
    enableKeyboardNavigation,
    direction,
    setDirection,
    enableColumnVirtualization,
    localization,
    renderCaption,
    renderTopToolbar,
    refs,
  } = table.tableInstance

  // The paper div feeds `refs.tablePaperRef` and, when given, the consumer's
  // own ref; a plain `ref={refs.tablePaperRef}` would be overwritten by the
  // `{...props}` spread.
  const paperElRef = React.useRef<HTMLDivElement | null>(null)
  const paperRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      assignRef(refs.tablePaperRef, el)
      paperElRef.current = el
      const consumerCleanup = assignRef(refProp, el)
      // Returning a cleanup makes React 19 call it on detach instead of
      // calling this ref with `null`, so a consumer callback ref that returned
      // its own cleanup is honored and never sees `null`.
      return () => {
        assignRef(refs.tablePaperRef, null)
        paperElRef.current = null
        if (typeof consumerCleanup === "function") consumerCleanup()
        else assignRef(refProp, null)
      }
    },
    [refs.tablePaperRef, refProp]
  )

  const gridRef = React.useRef<HTMLDivElement>(null)

  // Read the direction the table actually renders in (`dir` on it or any
  // ancestor), for the behaviour CSS cannot mirror: resizing, arrow keys and
  // column virtualization.
  React.useLayoutEffect(() => {
    const el = gridRef.current
    if (!el) return
    const measured = getComputedStyle(el).direction === "rtl" ? "rtl" : "ltr"
    if (measured !== direction) setDirection(measured)
  })
  const { sensors, collisionDetection, handleDragEnd } = useTableDnd(table)
  const accessibility = useDragAnnouncements(table)
  const {
    rowVirtualizer,
    columnVirtualizer,
    virtualItems,
    virtualColumns,
    withColumnSpacers,
    withHeaderSpacers,
  } = useTableVirtualizers(table, gridRef)

  // Keyboard navigation works on display indexes (top, center, bottom rows;
  // visible leaf columns), which it maps back to the virtualizers' indexes to
  // scroll a cell that is not rendered into view.
  const { onKeyDown, onFocus, onBlur } = useGridNavigation<HTMLDivElement>({
    enabled: enableKeyboardNavigation,
    rtl: direction === "rtl",
    ref: gridRef,
    rowCount: () =>
      table.getTopRows().length +
      table.getCenterRows().length +
      table.getBottomRows().length,
    colCount: () => table.getVisibleLeafColumns().length,
    scrollToCell: ({ row, col }) => {
      if (enableRowVirtualization) {
        const center = table.getCenterRows()[row - table.getTopRows().length]
        const index = center
          ? virtualItems.findIndex(
              (item) => !item.detail && item.row.id === center.id
            )
          : -1
        if (index >= 0) rowVirtualizer.scrollToIndex(index)
      }
      if (enableColumnVirtualization) columnVirtualizer.scrollToIndex(col)
    },
  })

  // Infinite scroll: observe a bottom sentinel against the scroll surface and
  // ask the consumer to append the next chunk when it nears the viewport.
  const sentinelRef = React.useRef<HTMLDivElement>(null)
  useInfiniteScroll({
    enabled: enableInfiniteScroll,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
    threshold: infiniteScrollThreshold,
    scrollRef: gridRef,
    sentinelRef,
  })

  const hasRows =
    table.getTopRows().length +
      table.getCenterRows().length +
      table.getBottomRows().length >
    0
  const showFooter = hasFooter(table)

  // Grid semantics (keyboard navigation makes the table a grid): the full row
  // and column counts, since virtualization and pinning render a subset.
  const isGrid = enableKeyboardNavigation
  const ariaRowCount =
    getHeaderRowCount(table) +
    getDataRowCount(table) +
    (showFooter ? table.getFooterGroups().length : 0)
  const isBusy = isLoading || isSaving

  const fullscreen = useFullscreenModal(paperElRef, isFullscreen, () =>
    setIsFullscreen(false)
  )

  const columnSizing = table.getState().columnSizing
  const columnSizingInfo = table.getState().columnSizingInfo
  const columnSizeVars = React.useMemo(
    () => (enableColumnResizing ? getColumnSizeVars(table) : {}),
    // columnSizing/Info are intentional triggers: recompute vars on resize.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enableColumnResizing, table, columnSizing, columnSizingInfo]
  )

  return (
    // Radix names the open delay `delayDuration`; Base UI's provider names it
    // `delay`. Both are context-only components that ignore foreign props, so
    // passing both (via an assertion, since each flavor types only its own)
    // keeps this file flavor-neutral for the registry's install-time transform.
    <TooltipProvider
      {...({
        delayDuration: 300,
        delay: 300,
      } as Partial<React.ComponentProps<typeof TooltipProvider>>)}
    >
      <div
        ref={paperRef}
        data-slot="data-table"
        className={cn(
          "flex w-full flex-col gap-2",
          isFullscreen &&
            "fixed inset-0 z-50 gap-2 overflow-auto bg-background p-4",
          className
        )}
        data-density={density}
        // Full screen covers the page, so it is a modal dialog meanwhile.
        role={isFullscreen ? "dialog" : undefined}
        aria-modal={isFullscreen || undefined}
        {...props}
        onKeyDown={(event) => {
          onKeyDownProp?.(event)
          fullscreen.onKeyDown(event)
        }}
      >
        <div role="status" aria-live="polite" className="sr-only">
          {isLoading ? localization.loading : ""}
        </div>
        {renderTopToolbar
          ? renderTopToolbar({ table })
          : enableTopToolbar && (
              <DataTableToolbar
                table={table}
                // Forwarding the exposed ref objects as props (not reading
                // .current during render).
                toolbarRef={refs.topToolbarRef}
                searchInputRef={refs.searchInputRef}
              />
            )}
        {positionToolbarAlertBanner === "top" && (
          <DataTableAlertBanner table={table} />
        )}

        {enablePagination &&
          (positionPagination === "top" || positionPagination === "both") && (
            <DataTablePagination
              table={table}
              pageSizeOptions={pageSizeOptions}
            />
          )}

        <DndContext
          sensors={sensors}
          accessibility={accessibility}
          collisionDetection={collisionDetection}
          onDragEnd={handleDragEnd}
        >
          {enableGrouping &&
            (positionToolbarDropZone === "top" ||
              positionToolbarDropZone === "both") && (
              <DataTableDropToGroupZone table={table} />
            )}

          <div
            // Callback refs run after render; assigning .current there is
            // legal React.
            // eslint-disable-next-line react-hooks/immutability
            ref={(node) => {
              gridRef.current = node
              // The exposed container ref is a RefObject, mutable by contract.
              // eslint-disable-next-line react-hooks/immutability
              refs.tableContainerRef.current = node
            }}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            // Focusable (not a Tab stop) so keyboard navigation can park focus
            // here when the focused cell scrolls out of a virtual window.
            tabIndex={enableKeyboardNavigation ? -1 : undefined}
            data-slot="data-table-surface"
            className={cn(
              // This surface is the single scroll container for both axes, so
              // the sticky header/footer engage and the horizontal scrollbar
              // stays pinned to the visible bottom. Neutralize the shadcn
              // <Table> wrapper's own overflow so it doesn't become a second
              // (unbounded) scroll container that breaks sticky positioning.
              "relative overflow-auto rounded-md border bg-card text-card-foreground *:data-[slot=table-container]:overflow-visible",
              "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
              // MRT-parity default bound: with a sticky header the surface
              // caps near the viewport height, so tall content (long groups,
              // trees, detail panels) scrolls internally under the pinned
              // header instead of stretching the page. `surfaceClassName`
              // (via tailwind-merge) or `enableStickyHeader: false` opts out.
              enableStickyHeader &&
                "max-h-[clamp(350px,calc(100dvh-200px),9999px)]",
              enableRowVirtualization && "max-h-150",
              surfaceClassName
            )}
          >
            {showProgressBars && (
              <div
                data-slot="data-table-progress"
                className="absolute inset-x-0 top-0 z-30 h-0.5 overflow-hidden bg-primary/20"
                role="presentation"
              >
                {/* @keyframes can't go in an inline style attribute, so the rule
                    lives in this co-located <style> — keeping the table
                    self-contained (no globals.css / registry CSS needed). The
                    animation itself is applied inline; reduced motion stops it. */}
                <style>
                  {
                    "@keyframes data-table-progress{from{transform:translateX(-100%)}to{transform:translateX(400%)}}@media (prefers-reduced-motion:reduce){[data-slot=data-table-progress-bar]{animation:none!important}}"
                  }
                </style>
                <div
                  data-slot="data-table-progress-bar"
                  className="h-full w-1/3 bg-primary"
                  style={{
                    animation: "data-table-progress 1.1s ease-in-out infinite",
                  }}
                />
              </div>
            )}

            <Table
              role={isGrid ? "grid" : undefined}
              aria-rowcount={isGrid ? ariaRowCount : undefined}
              aria-colcount={
                isGrid ? table.getVisibleLeafColumns().length : undefined
              }
              aria-busy={isBusy || undefined}
              style={{
                ...columnSizeVars,
                // Fixed layout makes per-column widths authoritative (auto
                // layout would stretch/redistribute them and ignore a resize).
                // `max(100%, totalSize)` keeps the table at least as wide as the
                // surface: when the columns are narrower than the surface, fixed
                // layout distributes the slack proportionally so they fill it
                // (no trailing empty space); when they outgrow the surface, the
                // table exceeds 100% and scrolls horizontally.
                ...(enableColumnResizing
                  ? { width: `max(100%, ${table.getTotalSize()}px)` }
                  : null),
              }}
              className={cn(enableColumnResizing && "table-fixed")}
            >
              {renderCaption && (
                <TableCaption>{renderCaption({ table })}</TableCaption>
              )}
              <DataTableHeader
                table={table}
                withHeaderSpacers={withHeaderSpacers}
              />
              <MemoizedDataTableBody
                table={table}
                rowVirtualizer={rowVirtualizer}
                virtualItems={virtualItems}
                virtualColumns={virtualColumns}
                withColumnSpacers={withColumnSpacers}
              />
              {showFooter && (
                <DataTableFooter
                  table={table}
                  withHeaderSpacers={withHeaderSpacers}
                />
              )}
            </Table>

            {enableInfiniteScroll && hasRows && (
              <>
                {/* Bottom sentinel: when it scrolls near the viewport (within
                    `infiniteScrollThreshold`px) the table asks for the next
                    chunk. Sits after the rendered window, so it works with or
                    without row virtualization. `sticky start-0` keeps it within
                    the horizontal viewport so a wide (horizontally scrolled)
                    table still triggers — the IntersectionObserver checks both
                    axes, and a start-anchored sentinel would otherwise scroll
                    out of the root rect. */}
                <div
                  ref={sentinelRef}
                  data-slot="data-table-infinite-sentinel"
                  aria-hidden
                  className="sticky start-0 h-px w-full"
                />
                {isFetchingNextPage && (
                  <div
                    data-slot="data-table-infinite-loader"
                    role="status"
                    className="sticky start-0 flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground"
                  >
                    <span
                      aria-hidden
                      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    />
                    {localization.loadingMore}
                  </div>
                )}
              </>
            )}

            {showLoadingOverlay && hasRows && (
              <div className="absolute inset-0 z-10 bg-card/40" aria-hidden />
            )}
          </div>

          {enableGrouping &&
            (positionToolbarDropZone === "bottom" ||
              positionToolbarDropZone === "both") && (
              <DataTableDropToGroupZone table={table} />
            )}
        </DndContext>

        {positionToolbarAlertBanner === "bottom" && (
          <DataTableAlertBanner table={table} />
        )}

        <DataTableBottomToolbar
          table={table}
          pageSizeOptions={pageSizeOptions}
        />

        <DataTableEditModal table={table} />
      </div>
    </TooltipProvider>
  )
}
