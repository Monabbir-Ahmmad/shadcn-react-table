"use client"

// Public API — the data table, its hook, config plumbing, documented helpers,
// and the types describing them. The engine and shared definitions live under
// ./core; the supporting building blocks live under ./components, ./hooks,
// ./fns, and ./utils and are intentionally not all re-exported here.

export { DataTable } from "./core/data-table"
export { useDataTable } from "./core/use-data-table"
export {
  createDataTableColumnHelper,
  type DataTableColumnHelper,
} from "./helpers/column-helper"
export { DataTableProvider, useDataTableInstance } from "./core/table-context"
export {
  DataTableDndProvider,
  useDataTableDropZone,
  type RowDropTarget,
} from "./core/dnd-scope"

// The table's parts, for your own layouts (each takes `table`; render them
// inside a `DataTableProvider`).
export { DataTableToolbar } from "./components/toolbar/data-table-toolbar"
export { DataTableBottomToolbar } from "./components/toolbar/data-table-bottom-toolbar"
export { DataTableGlobalFilter } from "./components/toolbar/data-table-global-filter"
export { DataTablePagination } from "./components/toolbar/data-table-pagination"
export { DataTableAlertBanner } from "./components/toolbar/data-table-alert-banner"
export { DataTableViewOptions } from "./components/toolbar/data-table-view-options"
export { DataTableDropToGroupZone } from "./components/toolbar/data-table-grouping"
export { DataTableDensityToggle } from "./components/toolbar/controls/density-toggle"
export { DataTableFullscreenToggle } from "./components/toolbar/controls/fullscreen-toggle"
export { DataTableFilterToggle } from "./components/toolbar/controls/filter-toggle"
export { DataTableAdvancedFilterToggle } from "./components/toolbar/controls/advanced-filter-toggle"
export { DataTableFilterPanel } from "./components/menus/data-table-filter-panel"
export { DataTableColumnActions } from "./components/menus/data-table-column-actions"
export { DataTableFilterModeMenu } from "./components/menus/data-table-filter-mode-menu"
export { DataTableColumnFilter } from "./components/head/data-table-column-filter"
export { DataTableEditModal } from "./components/editing/data-table-edit-modal"

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
  DataTableInstance,
  DataTableMethods,
  DataTableOptionsResolved,
  DataTableSlotProps,
  DataTableSlots,
  SlotProp,
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
  ClickToCopyOption,
  DisplayColumnId,
  EditDialogContentProps,
  RowPinningDisplayMode,
} from "./core/types"

export type {
  DataTableColumnDef,
  DataTableRow,
  DataTableColumn,
  DataTableCell,
  DataTableHeader,
  DataTableFeatures,
  DataTableFilterFn,
  DataTableSortFn,
  DataTableAggregationFn,
} from "./core/table-types"

export type { DataTableColumnPinningState } from "./helpers/column-pinning"
export type { DataTableState } from "./helpers/table-state"
