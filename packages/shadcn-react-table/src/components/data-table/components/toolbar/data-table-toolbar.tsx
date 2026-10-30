"use client"

import type { RowData } from "@tanstack/react-table"
import * as React from "react"

import type { DataTableInstance } from "../../core/types"
import { DataTableFilterPanel } from "../menus/data-table-filter-panel"
import {
  DataTableAdvancedFilterToggle,
  DataTableDensityToggle,
  DataTableFilterToggle,
  DataTableFullscreenToggle,
} from "./controls"
import { DataTableGlobalFilter } from "./data-table-global-filter"
import { DataTableViewOptions } from "./data-table-view-options"
import { dt } from "../../core/internal"
import { useAnimationsActive } from "../../core/motion"
import { getSlotProps, mergeProps } from "../../helpers/slot-props"
import { useLayoutGlide } from "../../hooks/use-layout-glide"

/**
 * Glides the toolbar's two item groups. Renders nothing; it sits before the
 * toolbar so its insertion effect reads the items before React updates them
 * (see `useLayoutGlide`).
 */
function ToolbarGlide({
  start,
  actions,
  active,
  signal,
}: {
  start: React.RefObject<HTMLDivElement | null>
  actions: React.RefObject<HTMLDivElement | null>
  active: boolean
  signal: unknown[]
}) {
  useLayoutGlide(start, active, signal)
  useLayoutGlide(actions, active, signal)
  return null
}

/**
 * Top toolbar. Left region: title slot + consumer toolbar actions. Right
 * region: the MRT-ordered icon cluster (global search → filters funnel →
 * column visibility → density → full screen).
 */
export function DataTableToolbar<TData extends RowData>({
  table,
  toolbarRef,
  searchInputRef,
}: {
  table: DataTableInstance<TData>
  /** Optional ref forwarded to the toolbar root. Defaults to the instance's
   *  `topToolbarRef` when rendered by `DataTable`. */
  toolbarRef?: React.Ref<HTMLDivElement>
  /** Optional ref forwarded to the global-search input. Defaults to the
   *  instance's `searchInputRef` when rendered by `DataTable`. */
  searchInputRef?: React.RefObject<HTMLInputElement | null>
}) {
  const {
    title,
    renderTopToolbarCustomActions,
    renderToolbarInternalActions,
    enableToolbarInternalActions,
    enableGlobalFilter,
    positionGlobalFilter,
    enableColumnFilters,
    columnFilterDisplayMode,
    enableAdvancedFilter,
    enableColumnActions,
    enableDensityToggle,
    enableFullscreenToggle,
    showGlobalFilter: searchOpen,
    enableAnimations,
  } = dt(table)
  const startRef = React.useRef<HTMLDivElement>(null)
  const actionsRef = React.useRef<HTMLDivElement>(null)
  const active = useAnimationsActive(enableAnimations)

  const anyFilterable = table
    .getAllColumns()
    .some((column) => column.getCanFilter())

  const showGlobalFilter = enableGlobalFilter && positionGlobalFilter !== "none"
  const showFilterToggle =
    enableColumnFilters &&
    anyFilterable &&
    columnFilterDisplayMode === "subheader"

  return (
    <>
      <ToolbarGlide
        start={startRef}
        actions={actionsRef}
        active={active}
        // What adds, removes or resizes an item: the buttons slide when the
        // search box opens or closes, or when an item comes or goes.
        signal={[
          showGlobalFilter,
          positionGlobalFilter,
          searchOpen,
          title != null,
          showFilterToggle,
          enableAdvancedFilter,
          enableColumnActions,
          enableDensityToggle,
          enableFullscreenToggle,
          enableToolbarInternalActions,
          renderToolbarInternalActions != null,
        ]}
      />
      <div
        {...mergeProps(
          {
            ref: toolbarRef,
            "data-slot": "data-table-toolbar",
            className: "flex items-start justify-between gap-3 py-1",
          } as React.ComponentProps<"div">,
          getSlotProps(table, "topToolbar", {})
        )}
      >
        <div
          ref={startRef}
          className="relative flex min-h-9 flex-1 flex-wrap items-center gap-2"
        >
          {showGlobalFilter && positionGlobalFilter === "left" && (
            <DataTableGlobalFilter
              table={table}
              searchInputRef={searchInputRef}
            />
          )}
          {title != null && (
            <div className="text-sm font-semibold tracking-wide">{title}</div>
          )}
          {renderTopToolbarCustomActions?.({ table })}
        </div>

        {enableToolbarInternalActions && (
          <div
            ref={actionsRef}
            data-slot="data-table-toolbar-actions"
            className="relative flex shrink-0 items-center gap-1.5"
          >
            {renderToolbarInternalActions ? (
              renderToolbarInternalActions({ table })
            ) : (
              <>
                {showGlobalFilter && positionGlobalFilter === "right" && (
                  <DataTableGlobalFilter
                    table={table}
                    searchInputRef={searchInputRef}
                  />
                )}
                {showFilterToggle && <DataTableFilterToggle table={table} />}
                {enableAdvancedFilter && (
                  <DataTableAdvancedFilterToggle table={table} />
                )}
                {enableColumnActions && <DataTableViewOptions table={table} />}
                {enableDensityToggle && (
                  <DataTableDensityToggle table={table} />
                )}
                {enableFullscreenToggle && (
                  <DataTableFullscreenToggle table={table} />
                )}
              </>
            )}
          </div>
        )}
      </div>
      {enableAdvancedFilter && <DataTableFilterPanel table={table} />}
    </>
  )
}
