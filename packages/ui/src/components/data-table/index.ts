"use client"

// Core public API
export { DataTable } from "./components/data-table"
export { useDataTable } from "./hooks/use-data-table"

// Building blocks (for custom layouts / advanced composition)
export { DataTableColumnHeader } from "./components/head/data-table-column-header"
export { DataTableColumnActions, getColumnLabel } from "./components/menus/data-table-column-actions"
export { DataTableColumnFilter } from "./components/head/data-table-column-filter"
export {
  DataTableFilterModeMenu,
  getEffectiveMode,
} from "./components/menus/data-table-filter-mode-menu"
export {
  TextFilterField,
  NumberFilterField,
  RangeSliderFilterField,
  SelectFilterField,
  MultiSelectFilterField,
  CheckboxFilterField,
  DateFilterField,
  DateRangeFilterField,
} from "./components/head/data-table-filter-variants"
export type { FilterFieldProps } from "./components/head/data-table-filter-variants"
export { Highlight } from "./components/body/highlight"
export { DataTableGlobalFilter } from "./components/toolbar/data-table-global-filter"
export {
  createDynamicFilterFn,
  createGlobalFilterFn,
  defaultModeForVariant,
  modeOptionsForVariant,
  VALUELESS_MODES,
  SUBSTRING_MODES,
} from "./fns/filter-fns"
export type { FilterMode, GlobalFilterMode } from "./fns/filter-fns"
export { DataTablePagination } from "./components/toolbar/data-table-pagination"
export { DataTableViewOptions } from "./components/toolbar/data-table-view-options"
export {
  DataTableToolbar,
  DataTableAlertBanner,
} from "./components/toolbar/data-table-toolbar"
export {
  DataTableDensityToggle,
  DataTableFilterToggle,
  DataTableFullscreenToggle,
} from "./components/toolbar/data-table-toolbar-controls"
export { SelectionCheckbox } from "./components/body/selection-checkbox"
export {
  createSelectionColumn,
  SELECTION_COLUMN_ID,
} from "./hooks/display-columns/selection-column"
export {
  createRowNumberColumn,
  createRowDragHandleColumn,
  createExpandColumn,
  RowDragContext,
  ROW_NUMBER_COLUMN_ID,
  ROW_DRAG_COLUMN_ID,
  EXPAND_COLUMN_ID,
} from "./hooks/display-columns/display-columns"
export {
  DataTableDropToGroupZone,
  GROUP_DROPZONE_ID,
} from "./components/toolbar/data-table-grouping"
export {
  createRowActionsColumn,
  ROW_ACTIONS_COLUMN_ID,
} from "./hooks/display-columns/data-table-row-actions"
export { DataTableEditField } from "./components/editing/data-table-edit-field"
export {
  DataTableBodyCellContent,
  isColumnEditable,
} from "./components/editing/data-table-edit-cell"
export { DataTableEditModal } from "./components/editing/data-table-edit-modal"
export { DataTableCreateRow } from "./components/editing/data-table-create-row"
export { ClickToCopy } from "./components/body/click-to-copy"
export { DataTableExportMenu } from "./components/menus/data-table-export-menu"
export {
  exportToCsv,
  exportToExcel,
  toAOA,
  getExportableColumns,
} from "./utils/export-utils"
export type { ExportScope, ExportOptions } from "./utils/export-utils"
export {
  DataTableHeadCell,
  DataTableBodyRow,
  ColumnResizeHandle,
} from "./components/body/data-table-dnd"
export {
  getColumnPinningStyle,
  getColumnPinningClass,
  getColumnSizeVars,
  getColumnWidthStyle,
} from "./utils/column-styles"

// Localization & icons
export { defaultLocalization } from "./locales/localization"
export type { DataTableLocalization } from "./locales/localization"
export { defaultIcons } from "./icons"
export type { DataTableIcons, IconComponent } from "./icons"
export {
  DataTableConfigProvider,
  useDataTableConfigContext,
} from "./config-context"
export type { DataTableConfigContextValue } from "./config-context"

// Types
export {
  DENSITY_ORDER,
  DENSITY_CELL_PADDING,
} from "./types"
export type {
  Density,
  FilterVariant,
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
