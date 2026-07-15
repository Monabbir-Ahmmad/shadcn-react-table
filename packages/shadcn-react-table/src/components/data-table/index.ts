"use client"

// Public API — the data table, its hook, config plumbing, documented helpers,
// and the types describing them. The engine and shared definitions live under
// ./core; the supporting building blocks live under ./components, ./hooks,
// ./fns, and ./utils and are intentionally not all re-exported here.

export { DataTable } from "./core/data-table"
export { useDataTable } from "./core/use-data-table"

export {
  DataTableConfigProvider,
  useDataTableConfigContext,
} from "./core/config-context"
export type { DataTableConfigContextValue } from "./core/config-context"

export { defaultIcons } from "./core/icons"
export type { DataTableIcons, IconComponent } from "./core/icons"

export { defaultLocalization } from "./core/localization"
export type { DataTableLocalization } from "./core/localization"

export type {
  Density,
  FilterVariant,
  FilterMode,
  GlobalFilterMode,
  DataTableFilterOption,
  AdvancedFilterOperator,
  AdvancedFilterRule,
  AdvancedFilterGroup,
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
} from "./core/types"
