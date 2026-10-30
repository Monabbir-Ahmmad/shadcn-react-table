"use client"

import type { RowData } from "@tanstack/react-table"
import * as React from "react"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import type { DataTableInstance } from "./types"

const DataTableContext = React.createContext<DataTableInstance<never> | null>(
  null
)

/**
 * Makes `table` available to `useDataTableInstance()` below it, and supplies
 * the tooltip provider the table's parts need. `<DataTable>` renders one; wrap
 * your own layout in it when you compose the exported parts yourself.
 */
export function DataTableProvider<TData extends RowData>({
  table,
  children,
}: {
  table: DataTableInstance<TData>
  children: React.ReactNode
}) {
  return (
    <DataTableContext.Provider
      value={table as unknown as DataTableInstance<never>}
    >
      {/* Radix names the open delay `delayDuration`; Base UI's provider names
          it `delay`. Both ignore foreign props, so passing both (via an
          assertion, since each flavor types only its own) keeps this file
          flavor-neutral for the registry's install-time transform. */}
      <TooltipProvider
        {...({
          delayDuration: 300,
          delay: 300,
        } as Partial<React.ComponentProps<typeof TooltipProvider>>)}
      >
        {children}
      </TooltipProvider>
    </DataTableContext.Provider>
  )
}

/**
 * The table instance from the nearest `<DataTable>` (or `DataTableProvider`),
 * for components rendered inside it — cells, toolbar slots, menus — without
 * passing `table` down. The instance is stable; read state with
 * `table.getState()` and subscribe with `table.Subscribe` to re-render.
 */
export function useDataTableInstance<
  TData extends RowData,
>(): DataTableInstance<TData> {
  const table = React.useContext(DataTableContext)
  if (!table) {
    throw new Error(
      "useDataTableInstance must be used inside <DataTable> or <DataTableProvider>."
    )
  }
  return table as unknown as DataTableInstance<TData>
}
