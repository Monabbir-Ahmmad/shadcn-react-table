"use client"

// Public API — the data table, its hook, config plumbing, documented helpers,
// and the types describing them. Building blocks live under ./internal and are
// intentionally not re-exported here.

export { DataTable } from "./data-table"
export { useDataTable } from "./use-data-table"

export {
  DataTableConfigProvider,
  useDataTableConfigContext,
} from "./config-context"
export type { DataTableConfigContextValue } from "./config-context"

export { defaultIcons } from "./icons"
export type { DataTableIcons, IconComponent } from "./icons"

export { defaultLocalization } from "./localization"
export type { DataTableLocalization } from "./localization"

export { exportToCsv, exportToExcel } from "./export-utils"
export type { ExportScope, ExportOptions } from "./export-utils"

export type {
  Density,
  FilterVariant,
  FilterMode,
  GlobalFilterMode,
  DataTableFilterOption,
  DataTableConfig,
  DataTableInstance,
  DataTableSlotProps,
  UseDataTableOptions,
  EditDisplayMode,
  EditVariant,
  EditingCell,
  RowEvent,
  CellEvent,
  DataTableRefs,
  DataTableRowVirtualizer,
  DataTableColumnVirtualizer,
  RowVirtualizerOptions,
  ColumnVirtualizerOptions,
} from "./types"
