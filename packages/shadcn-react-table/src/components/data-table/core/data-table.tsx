"use client"

import { DndContext } from "@dnd-kit/core"
import { type RowData } from "@tanstack/react-table"
import * as React from "react"

import { Table, TableCaption } from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { getSlotProps, mergeProps } from "../helpers/slot-props"

import { DataTableBody } from "../components/body/data-table-body"
import { DataTableRowMotion } from "../components/body/row-motion"
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
import { EDITING_STATE, region } from "../components/region"
import {
  GridSyncContext,
  useGridNavigation,
} from "../hooks/use-grid-navigation"
import { useDragAnnouncements } from "../hooks/use-drag-announcements"
import { useInfiniteScroll } from "../hooks/use-infinite-scroll"
import { useTableDnd } from "../hooks/use-table-dnd"
import {
  DndKeyContext,
  TableDropTarget,
  useDndScope,
  useIsDropTarget,
} from "./dnd-scope"
import { useTableVirtualizers } from "../hooks/use-table-virtualizers"
import { useTableState } from "../hooks/use-table-state"
import { useFullscreenModal } from "../hooks/use-fullscreen-modal"
import { useRowPinningDisplay } from "../hooks/use-row-pinning-display"
import { getDataRowCount, getHeaderRowCount } from "../helpers/grid-rows"
import { getColumnSizeVars } from "../utils/column-styles"
import { type DataTableInstance } from "./types"
import { dt } from "./internal"
import { DataTableProvider } from "./table-context"
import { DENSITY_PADDING_VARS } from "./constants"
import { MOTION_ROOT_CLASS, useAnimationsActive } from "./motion"

/**
 * Body wrapper that freezes during an active column resize. With
 * `columnResizeMode: "onChange"` the table re-renders on every mousemove;
 * skipping the body's re-render keeps drags smooth, since column widths come
 * from the CSS size vars on `<table>` and update without React. Outside of a
 * resize the comparator returns false, so normal re-rendering is unchanged.
 */
// The parts around the body re-render on their own state, not on every change
// to the table (see components/region.tsx). The edit modal shows the edit
// draft, so it is not one of them.
const ToolbarRegion = region(DataTableToolbar)
const AlertBannerRegion = region(DataTableAlertBanner)
const PaginationRegion = region(DataTablePagination)
const BottomToolbarRegion = region(DataTableBottomToolbar)
const DropToGroupZoneRegion = region(DataTableDropToGroupZone)
const HeaderRegion = region(DataTableHeader, EDITING_STATE)
const FooterRegion = region(DataTableFooter)

// State that rows (and the editors) subscribe to themselves: the table
// around them does not re-render for it.
const ROW_STATE = new Set([
  "rowSelection",
  "rowDraft",
  "editingCell",
  "editingRowId",
])

const MemoizedDataTableBody = React.memo(
  DataTableBody,
  (_prev, next) =>
    next.table.getState().columnSizingInfo.isResizingColumn !== false
) as typeof DataTableBody

interface DataTableProps<
  TData extends RowData,
> extends React.ComponentProps<"div"> {
  /** The instance returned by `useDataTable`. */
  table: DataTableInstance<TData>
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
    enableAnimations,
    enableTableHead,
    enableTableFooter,
    direction,
    setDirection,
    enableColumnVirtualization,
    localization,
    renderCaption,
    renderTopToolbar,
  } = dt(table)
  const { refs } = table.dataTable
  const animate = useAnimationsActive(enableAnimations)

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
  const tableElRef = React.useRef<HTMLTableElement>(null)
  // One callback for the table's lifetime: a new one each render would make
  // React detach and re-attach the surface on every commit, leaving
  // `refs.tableContainerRef` empty while child effects run.
  const setSurfaceRef = React.useCallback(
    // A callback ref runs after render: writing refs there is legal React.
    // eslint-disable-next-line react-hooks/immutability
    (node: HTMLDivElement | null) => {
      gridRef.current = node
      // The exposed container ref is a RefObject, mutable by contract; read
      // through the stable table, so this callback never changes.
      // eslint-disable-next-line react-hooks/immutability
      table.dataTable.refs.tableContainerRef.current = node
    },
    [table]
  )
  // The table re-renders itself on state changes; the component holding the
  // table does not (see `useDataTable`'s `stateSelector`).
  useTableState(table, (state) =>
    Object.fromEntries(
      Object.entries(state).filter(([key]) => !ROW_STATE.has(key))
    )
  )

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
  // Inside a DataTableDndProvider the table joins the provider's drag
  // context (rows can then move between tables) instead of having its own.
  const dndScope = useDndScope()
  const dndKey = React.useId()
  const isDropTarget = useIsDropTarget(dndScope ? dndKey : null)
  const dndEntry = {
    table: table as unknown as DataTableInstance<never>,
    collisionDetection,
    handleDragEnd,
    announcements: accessibility.announcements,
    screenReaderInstructions: accessibility.screenReaderInstructions,
  }
  const dndEntryRef = React.useRef(dndEntry)
  React.useLayoutEffect(() => {
    dndEntryRef.current = dndEntry
  })
  React.useEffect(() => {
    if (!dndScope) return
    // The provider reads the latest handlers through this proxy.
    const latest = dndEntryRef
    return dndScope.register(dndKey, {
      get table() {
        return latest.current.table
      },
      collisionDetection: (args) => latest.current.collisionDetection(args),
      handleDragEnd: (event) => latest.current.handleDragEnd(event),
      get announcements() {
        return latest.current.announcements
      },
      get screenReaderInstructions() {
        return latest.current.screenReaderInstructions
      },
    })
  }, [dndScope, dndKey])
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
  const { onKeyDown, onFocus, onBlur, scheduleSync } =
    useGridNavigation<HTMLDivElement>({
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
  const showFooter = enableTableFooter && hasFooter(table)

  // Grid semantics (keyboard navigation makes the table a grid): the full row
  // and column counts, since virtualization and pinning render a subset.
  const isGrid = enableKeyboardNavigation
  const ariaRowCount =
    getHeaderRowCount(table) +
    getDataRowCount(table) +
    (showFooter ? table.getFooterGroups().length : 0)
  const isBusy = isLoading || isSaving

  useRowPinningDisplay({
    table,
    surfaceRef: gridRef,
    stickyHeader: enableStickyHeader,
    stickyFooter: dt(table).enableStickyFooter,
  })

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

  const dndContent = (
    <>
      {enableGrouping &&
        (positionToolbarDropZone === "top" ||
          positionToolbarDropZone === "both") && (
          <DropToGroupZoneRegion table={table} config={dt(table)} />
        )}

      <div
        {...mergeProps(
          // The callback ref runs after render, not during it.
          // eslint-disable-next-line react-hooks/refs
          {
            ref: setSurfaceRef,
            onKeyDown,
            onFocus,
            onBlur,
            // Focusable (not a Tab stop) so keyboard navigation can park
            // focus here when the focused cell scrolls out of a virtual
            // window.
            tabIndex: enableKeyboardNavigation ? -1 : undefined,
            "data-slot": "data-table-surface",
            className: cn(
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
              // header instead of stretching the page. A `slotProps.surface`
              // class (via tailwind-merge) or `enableStickyHeader: false` opts
              // out.
              enableStickyHeader &&
                "max-h-[clamp(350px,calc(100dvh-200px),9999px)]",
              enableRowVirtualization && "max-h-150"
            ),
          } as React.ComponentProps<"div">,
          getSlotProps(table, "surface", {})
        )}
      >
        {animate && (
          <div
            data-slot="data-table-motion-layer"
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 h-0 w-full overflow-visible"
          />
        )}
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

        {/* Before the table: it reads the rows before React updates them. */}
        <DataTableRowMotion
          table={table}
          tableRef={tableElRef}
          active={animate}
        />
        <Table
          {...mergeProps(
            // The ref is forwarded to the element, not read during render.
            // eslint-disable-next-line react-hooks/refs
            {
              ref: tableElRef,
              role: isGrid ? "grid" : undefined,
              "aria-rowcount": isGrid ? ariaRowCount : undefined,
              "aria-colcount": isGrid
                ? table.getVisibleLeafColumns().length
                : undefined,
              "aria-busy": isBusy || undefined,
              style: {
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
              },
              className: cn(enableColumnResizing && "table-fixed"),
            } as React.ComponentProps<"table">,
            getSlotProps(table, "table", {})
          )}
        >
          {renderCaption && (
            <TableCaption>{renderCaption({ table })}</TableCaption>
          )}
          {enableTableHead && (
            <HeaderRegion
              table={table}
              config={dt(table)}
              withHeaderSpacers={withHeaderSpacers}
            />
          )}
          <GridSyncContext.Provider value={scheduleSync}>
            <MemoizedDataTableBody
              table={table}
              rowVirtualizer={rowVirtualizer}
              virtualItems={virtualItems}
              virtualColumns={virtualColumns}
              withColumnSpacers={withColumnSpacers}
            />
          </GridSyncContext.Provider>
          {showFooter && (
            <FooterRegion
              table={table}
              config={dt(table)}
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
          <DropToGroupZoneRegion table={table} config={dt(table)} />
        )}
    </>
  )

  return (
    <DataTableProvider table={table}>
      <div
        {...mergeProps(
          // The ref is forwarded to the element, not read during render.
          // eslint-disable-next-line react-hooks/refs
          {
            ref: paperRef,
            "data-slot": "data-table",
            className: cn(
              // The timing of this table's own controls (nearest root wins).
              "relative flex w-full flex-col gap-2",
              MOTION_ROOT_CLASS,
              DENSITY_PADDING_VARS,
              isFullscreen &&
                "fixed inset-0 z-50 gap-2 overflow-auto bg-background p-4"
            ),
            "data-density": density,
            "data-animations": animate ? "" : undefined,
            // A row from another table is over this one (see
            // DataTableDndProvider); style it with `data-[drop-target]:…`.
            "data-drop-target": isDropTarget || undefined,
            // Full screen covers the page, so it is a modal dialog meanwhile.
            role: isFullscreen ? "dialog" : undefined,
            "aria-modal": isFullscreen || undefined,
            onKeyDown: fullscreen.onKeyDown,
          } as React.ComponentProps<"div">,
          getSlotProps(table, "root", {}),
          { ...props, className, onKeyDown: onKeyDownProp }
        )}
      >
        <div role="status" aria-live="polite" className="sr-only">
          {isLoading ? localization.loading : ""}
        </div>
        {renderTopToolbar
          ? renderTopToolbar({ table })
          : enableTopToolbar && (
              <ToolbarRegion
                table={table}
                config={dt(table)}
                // Forwarding the exposed ref objects as props (not reading
                // .current during render).
                toolbarRef={refs.topToolbarRef}
                searchInputRef={refs.searchInputRef}
              />
            )}
        {positionToolbarAlertBanner === "top" && (
          <AlertBannerRegion table={table} config={dt(table)} />
        )}

        {enablePagination &&
          (positionPagination === "top" || positionPagination === "both") && (
            <PaginationRegion table={table} config={dt(table)} />
          )}

        <DndKeyContext.Provider value={dndScope ? dndKey : null}>
          {dndScope ? (
            <>
              <TableDropTarget tableKey={dndKey} />
              {dndContent}
            </>
          ) : (
            <DndContext
              sensors={sensors}
              accessibility={accessibility}
              collisionDetection={collisionDetection}
              onDragEnd={handleDragEnd}
            >
              {dndContent}
            </DndContext>
          )}
        </DndKeyContext.Provider>

        {positionToolbarAlertBanner === "bottom" && (
          <AlertBannerRegion table={table} config={dt(table)} />
        )}

        <BottomToolbarRegion table={table} config={dt(table)} />

        <DataTableEditModal table={table} />
      </div>
    </DataTableProvider>
  )
}
