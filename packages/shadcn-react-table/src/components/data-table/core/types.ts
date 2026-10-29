import type {
  CellData,
  Column,
  OnChangeFn,
  PaginationState,
  ReactTable,
  RowData,
  TableFeature,
  TableFeatures,
  TableOptions,
} from "@tanstack/react-table"
import type * as React from "react"

import type { Virtualizer, VirtualizerOptions } from "@tanstack/react-virtual"

import type { FilterMode, GlobalFilterMode } from "../fns/filter-fns"
import type { DataTableColumnPinningState } from "../helpers/column-pinning"
import type { DataTableState } from "../helpers/table-state"
import type { DataTableFeatures } from "./features"
import type { DataTableIcons } from "./icons"
import type { DataTableLocalization } from "./localization"
import type { DataTableUiState } from "./ui-state"
import type {
  DataTableCell,
  DataTableColumn,
  DataTableHeader,
  DataTableHeaderGroup,
  DataTableRow,
} from "./table-types"

// Re-exported as part of the public type surface: these describe column-`meta`
// filter config, while the runtime filter fns stay internal.
export type { FilterMode, GlobalFilterMode } from "../fns/filter-fns"

export type Density = "compact" | "comfortable" | "spacious"

/** The `@tanstack/react-virtual` instance powering body-row virtualization. */
export type DataTableRowVirtualizer = Virtualizer<
  HTMLDivElement,
  HTMLTableRowElement
>
/** The `@tanstack/react-virtual` instance powering column virtualization. */
export type DataTableColumnVirtualizer = Virtualizer<
  HTMLDivElement,
  HTMLTableCellElement
>

/** A value, or a function of the table instance returning that value. */
type ValueOrFunc<TData extends RowData, TValue> =
  TValue | ((props: { table: DataTableInstance<TData> }) => TValue)

/** Partial passthrough merged into the row `useVirtualizer` call. */
export type RowVirtualizerOptions<TData extends RowData> = ValueOrFunc<
  TData,
  Partial<VirtualizerOptions<HTMLDivElement, HTMLTableRowElement>>
>
/** Partial passthrough merged into the column `useVirtualizer` call. */
export type ColumnVirtualizerOptions<TData extends RowData> = ValueOrFunc<
  TData,
  Partial<VirtualizerOptions<HTMLDivElement, HTMLTableCellElement>>
>

/**
 * DOM refs to the table's structural elements, exposed on
 * `table.dataTable.refs` for imperative access (focus, measure, scroll). Each is
 * populated after mount and may be `null` when its element isn't rendered
 * (e.g. `bottomToolbarRef` with no bottom toolbar, `tableFooterRef` with no
 * footer, `searchInputRef` before the search box is expanded).
 */
export interface DataTableRefs {
  /** The outermost `data-slot="data-table"` wrapper. Always present. */
  tablePaperRef: React.RefObject<HTMLDivElement | null>
  /** The scroll container (`data-slot="data-table-surface"`) — the single
   *  scroll container for both axes. Always present. */
  tableContainerRef: React.RefObject<HTMLDivElement | null>
  /** The top toolbar root (`data-slot="data-table-toolbar"`). `null` when the
   *  top toolbar is disabled or replaced via `renderTopToolbar`. */
  topToolbarRef: React.RefObject<HTMLDivElement | null>
  /** The bottom toolbar root (`data-slot="data-table-bottom-toolbar"`). `null`
   *  when there is no bottom toolbar, or it is replaced via
   *  `renderBottomToolbar`. */
  bottomToolbarRef: React.RefObject<HTMLDivElement | null>
  /** The `<thead>` element. Always present. */
  tableHeadRef: React.RefObject<HTMLTableSectionElement | null>
  /** The `<tfoot>` element. `null` unless a column defines a `footer`. */
  tableFooterRef: React.RefObject<HTMLTableSectionElement | null>
  /** The global-search `<input>`. `null` until the search box is expanded. */
  searchInputRef: React.RefObject<HTMLInputElement | null>
}

/** Filter UI variants (full set wired in Phase 2; Phase 1 ships "text"). */
export type FilterVariant =
  | "text"
  | "select"
  | "multi-select"
  | "checkbox"
  | "range"
  | "range-slider"
  | "date"
  | "date-range"

export interface DataTableFilterOption {
  label: string
  value: string
}

/** Operators for the advanced filter panel's compound rules. Availability per
 *  column is gated by its `meta.variant` (see `getOperatorsForVariant`). */
export type AdvancedFilterOperator =
  | "isEmpty"
  | "isNotEmpty"
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
  | "between"

/** A single advanced-filter condition: column + operator + value(s). */
export interface AdvancedFilterRule {
  /** Stable key for React + edits. */
  id: string
  columnId: string
  operator: AdvancedFilterOperator
  /** Comparison value (string / number / Date / undefined). */
  value: unknown
  /** Upper bound, only used by the `between` operator. */
  value2?: unknown
}

/** The full advanced filter: a flat list of rules joined by one logic mode. */
export interface AdvancedFilterGroup {
  logic: "and" | "or"
  rules: AdvancedFilterRule[]
}

export type EditDisplayMode = "cell" | "row" | "table" | "modal" | "custom"

/** How the create form is surfaced (decoupled from {@link EditDisplayMode}). */
export type CreateDisplayMode = "modal" | "row" | "custom"

/** How the pagination controls render. `"pages"` = numbered page buttons. */
export type PaginationDisplayMode = "default" | "pages" | "custom"

/** Where column filter inputs live: the filter subheader row or per-column
 *  popovers opened from the column header. */
export type ColumnFilterDisplayMode = "subheader" | "popover" | "custom"

/** Which cell is being edited (cell mode). */
export interface EditingCell {
  rowId: string
  columnId: string
}

/** Edit-field variants for the inline editors. */
export type EditVariant = "text" | "number" | "select"

// Per-column configuration carried on `columnDef.meta`. Augments the TanStack
// `ColumnMeta` interface so it is strongly typed everywhere `meta` is read.
declare module "@tanstack/react-table" {
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  > {
    /** Filter UI variant rendered in the filter row. Defaults to "text". */
    filterVariant?: FilterVariant
    /** Options for `select` / `multi-select` filter variants. If omitted for a
     *  select-style variant, options are derived from faceted unique values. */
    filterSelectOptions?: DataTableFilterOption[]
    /** Default filter mode for this column (overrides the per-variant default). */
    filterMode?: FilterMode
    /** Per-column override for the filter-mode menu (defaults to the table). */
    enableColumnFilterModes?: boolean
    /** Custom filter UI for this column (escape hatch). Replaces the variant. */
    renderColumnFilter?: (props: {
      column: Column<TFeatures, TData, TValue>
      table: DataTableInstance<TData>
    }) => React.ReactNode
    /** Restrict (and order) the filter-mode menu for this column to this subset
     *  of modes. Include the column's default mode. */
    columnFilterModeOptions?: FilterMode[]
    /** Allow editing this column (defaults to true when table editing is on). */
    enableEditing?: boolean
    /** Inline editor variant. Defaults to "text". */
    editVariant?: EditVariant
    /** Options for the "select" edit variant. */
    editSelectOptions?: DataTableFilterOption[]
    /** Custom inline editor for this column (escape hatch). Replaces the built-in
     *  editor while the cell/row is editing; read the draft from
     *  `table.getState().rowDraft` and write it with `table.setRowDraftValue`
     *  (row editing), or save with `onEditingCellSave` (cell editing). */
    renderEditCell?: (props: CellRenderProps<TData, TValue>) => React.ReactNode
    /** Custom render for this column's group header cell (when grouped). */
    renderGroupedCell?: (
      props: CellRenderProps<TData, TValue>
    ) => React.ReactNode
    /** Custom render for this column's aggregated cell (when grouped). Overrides
     *  the TanStack `columnDef.aggregatedCell`. */
    renderAggregatedCell?: (
      props: CellRenderProps<TData, TValue>
    ) => React.ReactNode
    /** Custom render for this column's placeholder cells in grouped rows (cells
     *  with no value because another column owns the group). Default: empty. */
    renderPlaceholderCell?: (
      props: CellRenderProps<TData, TValue>
    ) => React.ReactNode
    /** Validate an edited value; return an error message or undefined if valid. */
    validate?: (value: unknown) => string | undefined
    /** Show a click-to-copy affordance on this column's cells. */
    enableClickToCopy?: boolean
    /** Horizontal alignment applied to the header label and body cells. */
    align?: "left" | "center" | "right"
    /** `false` opts this column out of match highlighting (the table option of
     *  the same name turns it on or off for every column). */
    enableFilterMatchHighlighting?: boolean
    /** `false` hides the column-actions menu for this column. */
    enableColumnActions?: boolean
    /** Human-readable label for menus when the header is not a plain string. */
    label?: string
    /** Props for this column's cells, applied after the table's `slotProps`
     *  for the same part. */
    slotProps?: Pick<
      DataTableSlots<TData>,
      "headCell" | "filterCell" | "bodyCell" | "footerCell" | "editField"
    >
  }

  // Registers our feature key (TanStack's plugin mechanism). Optional, and
  // inert for tables that don't include it.
  interface Plugins {
    dataTableInstanceFeature: TableFeature
    dataTableUiFeature: TableFeature
  }

  // The table's UI state slices (density, editing, filter modes…) are table
  // state like sorting: typed in `initialState`, `state` and the store.
  interface TableState_FeatureMap {
    dataTableUiFeature: DataTableUiState
  }

  // Our instance members on TanStack's `Table` type, only for tables whose
  // feature set includes `dataTableInstanceFeature` (i.e. `DataTableFeatures`).
  // So render contexts (`cell: ({ table }) => …`), `row.table` and
  // `column.table` type them; other TanStack tables are unaffected.
  interface Table_FeatureMap<
    // Unused, but merging requires TanStack's exact type parameters.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TFeatures extends TableFeatures,
    TData extends RowData,
  > {
    dataTableInstanceFeature: {
      /** Table state in our stable shape (left/right column pinning). */
      getState: () => DataTableState
      /** The table's resolved options (localization, icons, flags, render
       *  props) and DOM refs. */
      dataTable: DataTableOptionsResolved<TData>
    } & DataTableMethods<TData>
  }
}

/** Props for one part of the table (`data-*` attributes included), or a
 *  function of its context. */
export type SlotProp<Ctx, Props> =
  SlotPropsOf<Props> | ((context: Ctx) => SlotPropsOf<Props>)

type SlotPropsOf<Props> = Partial<Props> & {
  [dataAttribute: `data-${string}`]: string | number | boolean | undefined
}

type WithTable<TData extends RowData, Ctx = object> = Ctx & {
  table: DataTableInstance<TData>
}

/** Props for each part of the table (`slotProps`). */
export interface DataTableSlots<TData extends RowData> {
  /** The outer wrapper (`<DataTable>`'s own props also land here). */
  root?: SlotProp<WithTable<TData>, React.ComponentProps<"div">>
  /** The scroll container around the table. Bound its height here. */
  surface?: SlotProp<WithTable<TData>, React.ComponentProps<"div">>
  /** The `<table>` element. */
  table?: SlotProp<WithTable<TData>, React.ComponentProps<"table">>
  /** `<thead>`. */
  head?: SlotProp<WithTable<TData>, React.ComponentProps<"thead">>
  /** Each header row. */
  headRow?: SlotProp<
    WithTable<TData, { headerGroup: DataTableHeaderGroup<TData> }>,
    React.ComponentProps<"tr">
  >
  /** Each header cell. */
  headCell?: SlotProp<
    WithTable<
      TData,
      {
        header: DataTableHeader<TData, unknown>
        column: DataTableColumn<TData, unknown>
      }
    >,
    React.ComponentProps<"th">
  >
  /** Each cell of the column filter row. */
  filterCell?: SlotProp<
    WithTable<
      TData,
      {
        header: DataTableHeader<TData, unknown>
        column: DataTableColumn<TData, unknown>
      }
    >,
    React.ComponentProps<"th">
  >
  /** `<tbody>`. */
  body?: SlotProp<WithTable<TData>, React.ComponentProps<"tbody">>
  /** Each body row. */
  bodyRow?: SlotProp<
    WithTable<TData, { row: DataTableRow<TData>; rowIndex: number }>,
    React.ComponentProps<"tr">
  >
  /** Each body cell. */
  bodyCell?: SlotProp<
    WithTable<
      TData,
      {
        cell: DataTableCell<TData, unknown>
        row: DataTableRow<TData>
        column: DataTableColumn<TData, unknown>
      }
    >,
    React.ComponentProps<"td">
  >
  /** The cell holding an expanded row's detail panel. */
  detailPanel?: SlotProp<
    WithTable<TData, { row: DataTableRow<TData> }>,
    React.ComponentProps<"td">
  >
  /** `<tfoot>`. */
  footer?: SlotProp<WithTable<TData>, React.ComponentProps<"tfoot">>
  /** Each footer row. */
  footerRow?: SlotProp<
    WithTable<TData, { footerGroup: DataTableHeaderGroup<TData> }>,
    React.ComponentProps<"tr">
  >
  /** Each footer cell. */
  footerCell?: SlotProp<
    WithTable<
      TData,
      {
        header: DataTableHeader<TData, unknown>
        column: DataTableColumn<TData, unknown>
      }
    >,
    React.ComponentProps<"td">
  >
  /** The toolbar above the table. */
  topToolbar?: SlotProp<WithTable<TData>, React.ComponentProps<"div">>
  /** The toolbar below the table. */
  bottomToolbar?: SlotProp<WithTable<TData>, React.ComponentProps<"div">>
  /** The pagination controls. */
  pagination?: SlotProp<WithTable<TData>, React.ComponentProps<"div">>
  /** The selection banner. */
  alertBanner?: SlotProp<WithTable<TData>, React.ComponentProps<"div">>
  /** The global search input. */
  searchInput?: SlotProp<WithTable<TData>, React.ComponentProps<"input">>
  /** Each inline / dialog edit field (the input, or the select's trigger). */
  editField?: SlotProp<
    WithTable<
      TData,
      { column: DataTableColumn<TData, unknown>; row?: DataTableRow<TData> }
    >,
    React.ComponentProps<"input">
  >
  /** The edit / create dialog's content. */
  editDialog?: SlotProp<
    WithTable<TData, { row?: DataTableRow<TData>; isCreating: boolean }>,
    React.ComponentProps<"div">
  >
  /** Each row selection checkbox (and the select-all one, without `row`). */
  selectCheckbox?: SlotProp<
    WithTable<TData, { row?: DataTableRow<TData> }>,
    React.ComponentProps<"button">
  >
}

export interface DataTableSlotProps<TData extends RowData> {
  table: DataTableInstance<TData>
}

export interface RowEvent<TData extends RowData> {
  row: DataTableRow<TData>
  table: DataTableInstance<TData>
  event: React.MouseEvent<HTMLTableRowElement>
}

export interface CellEvent<TData extends RowData> {
  cell: DataTableCell<TData, unknown>
  row: DataTableRow<TData>
  table: DataTableInstance<TData>
  event: React.MouseEvent<HTMLTableCellElement>
}

/** Props passed to per-column cell render hooks on `columnDef.meta`. */
export interface CellRenderProps<TData extends RowData, TValue = unknown> {
  cell: DataTableCell<TData, TValue>
  row: DataTableRow<TData>
  column: DataTableColumn<TData, TValue>
  table: DataTableInstance<TData>
}

/** UI state slices: read them with `table.getState()`. */
type DataTableUiStateKey =
  | "density"
  | "isFullscreen"
  | "direction"
  | "showColumnFilters"
  | "columnFilterModes"
  | "globalFilterMode"
  | "advancedFilter"
  | "showAdvancedFilterPanel"
  | "editingCell"
  | "editingRowId"
  | "isCreating"
  | "rowDraft"

/** Methods the table adds to the TanStack instance (`table.setDensity`…). */
export type DataTableMethodKey =
  | "setDensity"
  | "setIsFullscreen"
  | "setShowColumnFilters"
  | "setColumnFilterMode"
  | "setGlobalFilterMode"
  | "setAdvancedFilter"
  | "setShowAdvancedFilterPanel"
  | "setEditingCell"
  | "setRowDraftValue"
  | "beginRowEdit"
  | "beginCreate"
  | "cancelEdit"
  | "autoSizeColumn"
  | "autoSizeAllColumns"

/** Members for the table's own parts only. */
type DataTableInternalKey = "setDirection" | "columnsWithCustomCell"

/** The table's resolved options and refs: `table.dataTable`. */
export type DataTableOptionsResolved<TData extends RowData> = Omit<
  DataTableConfig<TData>,
  DataTableUiStateKey | DataTableMethodKey | DataTableInternalKey
>

/** The methods the table adds to the TanStack instance. */
export type DataTableMethods<TData extends RowData> = Pick<
  DataTableConfig<TData>,
  DataTableMethodKey
>

/**
 * The full configuration the table's parts read (through `dt(table)`): the
 * resolved options, live UI state, methods and internals. Consumers see the
 * public parts as `table.dataTable` (options), `table.getState()` (state) and
 * the methods on `table`.
 */
export interface DataTableConfig<TData extends RowData> {
  localization: DataTableLocalization
  icons: DataTableIcons
  /** Current density (table state). */
  density: Density
  setDensity: React.Dispatch<React.SetStateAction<Density>>
  /** Whether the table is full screen (table state). */
  isFullscreen: boolean
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>
  /** Text direction the table renders in, read from the page (`dir="rtl"`
   *  on the table or an ancestor). Drives column resizing, arrow keys and
   *  column virtualization. */
  direction: "ltr" | "rtl"
  /** Set by `DataTable` when it measures its direction. */
  setDirection: React.Dispatch<React.SetStateAction<"ltr" | "rtl">>
  /** Whether the filter row shows (table state). */
  showColumnFilters: boolean
  setShowColumnFilters: React.Dispatch<React.SetStateAction<boolean>>
  /** Active filter mode per column id. */
  columnFilterModes: Record<string, FilterMode>
  /** Switch a column's filter mode (resets the value when it becomes invalid). */
  setColumnFilterMode: (columnId: string, mode: FilterMode) => void
  /** Current global search mode (table state). */
  globalFilterMode: GlobalFilterMode
  setGlobalFilterMode: (mode: GlobalFilterMode) => void
  enableGlobalFilter: boolean
  enableGlobalFilterModes: boolean
  /** Compound AND/OR filter panel (independent of, and additive to, the
   *  per-column filters and global search). */
  enableAdvancedFilter: boolean
  /** Current advanced filter (table state). */
  advancedFilter: AdvancedFilterGroup
  setAdvancedFilter: React.Dispatch<React.SetStateAction<AdvancedFilterGroup>>
  /** Whether the advanced filter dialog is open. */
  showAdvancedFilterPanel: boolean
  setShowAdvancedFilterPanel: React.Dispatch<React.SetStateAction<boolean>>
  isLoading: boolean
  isSaving: boolean
  showProgressBars: boolean
  showSkeletons: boolean
  showLoadingOverlay: boolean
  enableFacetedValues: boolean
  enableColumnActions: boolean
  /** Whether per-column filters are on. */
  enableColumnFilters: boolean
  enableColumnFilterModes: boolean
  enableFilterMatchHighlighting: boolean
  /** Column ids that supply a custom cell renderer (skipped by auto-highlight). */
  columnsWithCustomCell: ReadonlySet<string>
  enableColumnOrdering: boolean
  enableColumnPinning: boolean
  enableColumnResizing: boolean
  enableColumnAutosize: boolean
  /** Resize a single column to fit its widest visible value (header + data). */
  autoSizeColumn: (columnId: string) => void
  /** Auto-size every resizable visible column. */
  autoSizeAllColumns: () => void
  enableRowOrdering: boolean
  enableRowPinning: boolean
  enableRowNumbers: boolean
  rowNumberMode: "static" | "original"
  /** Called on a row drag-and-drop reorder; the consumer reorders its data. */
  onRowOrderChange?: (activeRowId: string, overRowId: string) => void
  enableGrouping: boolean
  enableExpanding: boolean
  enableStickyFooter: boolean
  renderDetailPanel?: (props: {
    row: DataTableRow<TData>
    table: DataTableInstance<TData>
  }) => React.ReactNode

  // Editing / actions
  enableEditing: boolean
  editDisplayMode: EditDisplayMode
  createDisplayMode: CreateDisplayMode
  /** The cell being edited in cell mode (`{ rowId, columnId }`), or `null`. */
  editingCell: EditingCell | null
  setEditingCell: React.Dispatch<React.SetStateAction<EditingCell | null>>
  /** Id of the row being edited in row or modal mode, or `null`. */
  editingRowId: string | null
  /** Whether a new row is being created. */
  isCreating: boolean
  /** Draft values for the row/modal editor + create form, keyed by column id. */
  rowDraft: Record<string, unknown>
  setRowDraftValue: (columnId: string, value: unknown) => void
  /** Enter row/modal editing for a row, seeding the draft from its values. */
  beginRowEdit: (row: DataTableRow<TData>) => void
  /** Open the create form, seeding the draft from `createRowDefaults`. */
  beginCreate: () => void
  /** Exit any editing/creating state, discarding the draft. */
  cancelEdit: () => void
  enableClickToCopy: boolean
  onEditingCellSave?: (props: {
    row: DataTableRow<TData>
    column: DataTableColumn<TData, unknown>
    value: unknown
    table: DataTableInstance<TData>
  }) => void
  onEditingRowSave?: (props: {
    row: DataTableRow<TData>
    values: Record<string, unknown>
    table: DataTableInstance<TData>
    exit: () => void
  }) => void
  onCreatingRowSave?: (props: {
    values: Record<string, unknown>
    table: DataTableInstance<TData>
    exit: () => void
  }) => void
  renderRowActions?: (props: {
    row: DataTableRow<TData>
    table: DataTableInstance<TData>
  }) => React.ReactNode
  renderCellActionMenuItems?: (props: {
    cell: DataTableCell<TData, unknown>
    row: DataTableRow<TData>
    table: DataTableInstance<TData>
  }) => React.ReactNode
  renderRowActionMenuItems?: (props: {
    row: DataTableRow<TData>
    table: DataTableInstance<TData>
  }) => React.ReactNode
  renderColumnActionsMenuItems?: (props: {
    column: DataTableColumn<TData, unknown>
    table: DataTableInstance<TData>
  }) => React.ReactNode
  renderColumnFilterModeMenuItems?: (props: {
    column: DataTableColumn<TData, unknown>
    modes: FilterMode[]
    currentMode: FilterMode
    onSelect: (mode: FilterMode) => void
    table: DataTableInstance<TData>
  }) => React.ReactNode
  renderGlobalFilterModeMenuItems?: (props: {
    modes: GlobalFilterMode[]
    currentMode: GlobalFilterMode
    onSelect: (mode: GlobalFilterMode) => void
    table: DataTableInstance<TData>
  }) => React.ReactNode

  // Event listeners
  onRowClick?: (props: RowEvent<TData>) => void
  onRowDoubleClick?: (props: RowEvent<TData>) => void
  onCellClick?: (props: CellEvent<TData>) => void
  onCellDoubleClick?: (props: CellEvent<TData>) => void

  /** DOM refs to the table's structural elements (populated after mount). */
  refs: DataTableRefs
  enableRowVirtualization: boolean
  enableColumnVirtualization: boolean
  estimateRowHeight: number
  virtualOverscan: number
  /** Flat height (px) applied to every row. */
  rowHeight?: number
  /** Per-row height: a px number, `"auto"` (wrap + grow), or `null` for default. */
  getRowHeight?: (row: DataTableRow<TData>) => number | "auto" | null
  rowVirtualizerOptions?: RowVirtualizerOptions<TData>
  columnVirtualizerOptions?: ColumnVirtualizerOptions<TData>
  rowVirtualizerInstanceRef?: React.RefObject<DataTableRowVirtualizer | null>
  columnVirtualizerInstanceRef?: React.RefObject<DataTableColumnVirtualizer | null>
  enableStickyHeader: boolean
  enablePagination: boolean
  /** Load more rows as the user scrolls near the bottom (auto-hides the pager). */
  enableInfiniteScroll: boolean
  /** Called when the sentinel nears the viewport and more rows can be loaded. */
  onLoadMore?: () => void
  /** Consumer flag: more rows exist to load. */
  hasNextPage: boolean
  /** Consumer flag: a load is currently in flight. */
  isFetchingNextPage: boolean
  /** Distance (px) from the bottom at which to prefetch. */
  infiniteScrollThreshold: number
  positionPagination: "top" | "bottom" | "both" | "none"
  paginationDisplayMode: PaginationDisplayMode
  /** Choices in the rows-per-page select. */
  pageSizeOptions: number[]
  /** Props for the table's parts; see the `slotProps` option. */
  slotProps: DataTableSlots<TData> | undefined
  columnFilterDisplayMode: ColumnFilterDisplayMode
  positionGlobalFilter: "left" | "right" | "none"
  positionToolbarAlertBanner: "top" | "bottom" | "none"
  positionToolbarDropZone: "top" | "bottom" | "both" | "none"
  /** Whether rows can be selected. */
  enableRowSelection: boolean
  enableTopToolbar: boolean
  enableBottomToolbar: boolean
  enableDensityToggle: boolean
  enableFullscreenToggle: boolean
  enableToolbarInternalActions: boolean
  enableKeyboardNavigation: boolean
  title?: React.ReactNode
  renderTopToolbarCustomActions?: (
    props: DataTableSlotProps<TData>
  ) => React.ReactNode
  renderTopToolbar?: (props: DataTableSlotProps<TData>) => React.ReactNode
  renderBottomToolbar?: (props: DataTableSlotProps<TData>) => React.ReactNode
  renderToolbarInternalActions?: (
    props: DataTableSlotProps<TData>
  ) => React.ReactNode
  renderBottomToolbarCustomActions?: (
    props: DataTableSlotProps<TData>
  ) => React.ReactNode
  renderCaption?: (props: DataTableSlotProps<TData>) => React.ReactNode
  renderEmpty?: (props: DataTableSlotProps<TData>) => React.ReactNode
}

/** The TanStack v9 React table enriched with our `tableInstance` config and a
 *  `getState()` that returns state in our stable (left/right) shape. */
export type DataTableInstance<TData extends RowData = RowData> = ReactTable<
  DataTableFeatures,
  TData
> & {
  /** The table's resolved options (localization, icons, flags, render props)
   *  and DOM refs. */
  dataTable: DataTableOptionsResolved<TData>
  getState: () => DataTableState
} & DataTableMethods<TData>

type CoreTableOptions<TData extends RowData> = TableOptions<
  DataTableFeatures,
  TData
>

/**
 * Options for {@link useDataTable}. Extends TanStack's `TableOptions` (so
 * controlled state, `manual*` flags, `getRowId`, etc. pass through) minus the
 * feature set and row models, which the hook owns. Column pinning keeps our
 * left/right shape in `initialState` / `state` / `onColumnPinningChange`.
 */
export interface UseDataTableOptions<TData extends RowData> extends Omit<
  CoreTableOptions<TData>,
  "features" | "initialState" | "state" | "onColumnPinningChange"
> {
  /** Initial values for uncontrolled table state. `pagination` may be partial
   *  (TanStack fills the rest from its defaults); column pinning uses `left` /
   *  `right`. */
  initialState?: Omit<
    NonNullable<CoreTableOptions<TData>["initialState"]>,
    "columnPinning" | "pagination"
  > & {
    columnPinning?: DataTableColumnPinningState
    pagination?: Partial<PaginationState>
  }
  /** Controlled table state slices. Column pinning uses `left` / `right` (not
   *  TanStack v9's `start` / `end`). */
  state?: Omit<
    NonNullable<CoreTableOptions<TData>["state"]>,
    "columnPinning"
  > & {
    columnPinning?: DataTableColumnPinningState
  }
  /** Called with an updater over the `left` / `right` pinning state when the
   *  user pins or unpins a column. */
  onColumnPinningChange?: OnChangeFn<DataTableColumnPinningState>
  /** Re-render the component that calls `useDataTable` when the selected part
   *  of the table state changes (compared shallowly). By default it does not
   *  re-render on table state changes at all: `<DataTable>` subscribes to
   *  what it shows. Select what your own render reads, e.g.
   *  `(state) => state.rowSelection` for a "3 selected" label. */
  stateSelector?: (state: DataTableState) => unknown
  /** Text for every label, message and screen-reader string. Partial: missing
   *  keys fall back to English (or to `DataTableConfigProvider`). Install a
   *  locale item for a full language. */
  localization?: Partial<DataTableLocalization>
  /** Override any subset of the table's icons. */
  icons?: Partial<DataTableIcons>
  /** Show the loading affordances (progress bar; skeletons when empty; a dimming
   *  overlay over existing rows). Toggle each independently below. */
  isLoading?: boolean
  /** Show the progress bar for an in-flight save/mutation. Defaults the progress
   *  bar on without replacing rows with skeletons. */
  isSaving?: boolean
  /** Show the top progress bar. Default: `isLoading || isSaving`. */
  showProgressBars?: boolean
  /** Replace the body with skeleton rows while empty. Default: `isLoading`. */
  showSkeletons?: boolean
  /** Dim existing rows with an overlay while loading. Default: `isLoading`. */
  showLoadingOverlay?: boolean
  /** Compute faceted unique values / min-max (auto select options + range
   *  bounds). Default true; disable to skip the faceted row models. */
  enableFacetedValues?: boolean
  /** Shows the column-actions menu in each header (sort, filter, pin, hide,
   *  group…). Default `true`. */
  enableColumnActions?: boolean
  /** Show the filter-mode menu adornment on filter fields. Default true. */
  enableColumnFilterModes?: boolean
  /** Highlight matched substrings in cells. Default true. */
  enableFilterMatchHighlighting?: boolean
  /** Show the expandable global search in the toolbar. Default true. */
  enableGlobalFilter?: boolean
  /** Show the global search mode menu (fuzzy/contains/…). Default true. */
  enableGlobalFilterModes?: boolean
  /** While the global search is in fuzzy mode, order rows by best match (most
   *  relevant first) until the user applies their own sort. Default false —
   *  MRT defaults this on, but the data table keeps it off so searching never silently
   *  reorders rows unless opted in. Ignored for non-fuzzy modes, when grouping
   *  or expanded, or under manual sorting/filtering. */
  enableGlobalFilterRankedResults?: boolean
  /** Props for the table's parts (cells, rows, toolbars, …), as an object or
   *  a function of the part's context. `className` is combined with the
   *  table's, `style` merged, event handlers both run; other props replace
   *  the table's. See `DataTableSlots`. */
  slotProps?: DataTableSlots<TData>
  /** Choices in the rows-per-page select. Default `[5, 10, 25, 50, 100]`. */
  pageSizeOptions?: number[]
  /** Called whenever the density changes (toolbar toggle or programmatic).
   *  Set it with `initialState.density`, control it with `state.density`. */
  onDensityChange?: (density: Density) => void
  /** Called whenever the full-screen state is toggled. Control it with
   *  `state.isFullscreen`. */
  onIsFullscreenChange?: (isFullscreen: boolean) => void
  /** Called whenever the filter row is shown or hidden. Set it with
   *  `initialState.showColumnFilters`, control it with `state.showColumnFilters`. */
  onShowColumnFiltersChange?: (showColumnFilters: boolean) => void
  /** Enable the advanced filter panel: compound rules joined by AND/OR, applied
   *  on top of the per-column filters. A toolbar button opens the panel and
   *  shows the active-rule count. Default false. */
  enableAdvancedFilter?: boolean
  /** Called whenever the advanced filter changes. Set it with
   *  `initialState.advancedFilter`, control it with `state.advancedFilter`. */
  onAdvancedFilterChange?: (filter: AdvancedFilterGroup) => void
  /** Called whenever the global search mode changes (default `"fuzzy"`). Set
   *  it with `initialState.globalFilterMode`, control it with
   *  `state.globalFilterMode`. */
  onGlobalFilterModeChange?: (mode: GlobalFilterMode) => void
  /** Called when a column's filter mode changes, with every column's mode.
   *  Control it with `state.columnFilterModes`. */
  onColumnFilterModesChange?: (modes: Record<string, FilterMode>) => void
  /** Called when the advanced filter dialog opens or closes. Control it with
   *  `state.showAdvancedFilterPanel`. */
  onShowAdvancedFilterPanelChange?: (open: boolean) => void
  /** Called when cell editing starts or ends (`null`). Control it with
   *  `state.editingCell`. */
  onEditingCellChange?: (cell: EditingCell | null) => void
  /** Called when row editing starts or ends (`null`). Control it with
   *  `state.editingRowId`. */
  onEditingRowIdChange?: (rowId: string | null) => void
  /** Called when the new-row editor opens or closes. Control it with
   *  `state.isCreating`. */
  onIsCreatingChange?: (isCreating: boolean) => void
  /** Called when the draft of the row being edited or created changes. Control
   *  it with `state.rowDraft`. */
  onRowDraftChange?: (draft: Record<string, unknown>) => void
  /** Drag-and-drop column reordering (adds a grip to each header). */
  enableColumnOrdering?: boolean
  /** Column pinning (left/right) via the column-actions menu + sticky columns. */
  enableColumnPinning?: boolean
  /** Column resizing via an edge drag handle. */
  enableColumnResizing?: boolean
  /**
   * Double-clicking a column's resize handle auto-sizes it to fit its widest
   * value. Defaults to `enableColumnResizing`. When off, double-click resets
   * the column to its default size instead.
   */
  enableColumnAutosize?: boolean
  /** Drag-and-drop row reordering (adds a drag-handle column). */
  enableRowOrdering?: boolean
  /** Row pinning (top) via a pin toggle in the row-number column. */
  enableRowPinning?: boolean
  /** Adds a leading row-number column. */
  enableRowNumbers?: boolean
  /** "static" tracks the current view (page-aware); "original" uses source index. */
  rowNumberMode?: "static" | "original"
  /** Called on a row drag-and-drop reorder; the consumer reorders its data. */
  onRowOrderChange?: (activeRowId: string, overRowId: string) => void
  /** Row grouping (group-by menu + drop-to-group zone + aggregated group rows). */
  enableGrouping?: boolean
  /** Row expansion (tree sub-rows and/or detail panels). Auto-on with grouping
   *  or when `renderDetailPanel`/`getSubRows` is provided. */
  enableExpanding?: boolean
  /** Pin the footer (aggregation/footer cells) to the bottom of the surface.
   *  Default false. */
  enableStickyFooter?: boolean
  /** Render an expanding detail panel for each row. */
  renderDetailPanel?: (props: {
    row: DataTableRow<TData>
    table: DataTableInstance<TData>
  }) => React.ReactNode

  // Editing / actions
  /** Enable inline editing. */
  enableEditing?: boolean
  /** How edits are surfaced. Default "cell". */
  editDisplayMode?: EditDisplayMode
  /** How the create form is surfaced, independent of `editDisplayMode`:
   *  `"modal"` (dialog, default), `"row"` (an inline editable row at the top of
   *  the table), or `"custom"` (you render it from `isCreating` + `rowDraft`). */
  createDisplayMode?: CreateDisplayMode
  /** Default values for the create form, keyed by column id. */
  createRowDefaults?: Record<string, unknown>
  /** Show a click-to-copy affordance on all cells (per-column override via meta). */
  enableClickToCopy?: boolean
  /** Called when a cell edit is committed (cell and table editing) with the
   *  new `value`. Persist it; the table does not change `data` itself. */
  onEditingCellSave?: (props: {
    row: DataTableRow<TData>
    column: DataTableColumn<TData, unknown>
    value: unknown
    table: DataTableInstance<TData>
  }) => void
  /** Called when a row edit is saved (row and modal editing) with the edited
   *  `values`. Call `exit()` to leave editing, e.g. after the save succeeds. */
  onEditingRowSave?: (props: {
    row: DataTableRow<TData>
    values: Record<string, unknown>
    table: DataTableInstance<TData>
    exit: () => void
  }) => void
  /** Called when the new-row editor is saved with the row's `values`. Call
   *  `exit()` to close it. */
  onCreatingRowSave?: (props: {
    values: Record<string, unknown>
    table: DataTableInstance<TData>
    exit: () => void
  }) => void
  /** Content of the row-actions column, replacing the default edit and menu
   *  buttons. */
  renderRowActions?: (props: {
    row: DataTableRow<TData>
    table: DataTableInstance<TData>
  }) => React.ReactNode
  /** Items for a right-click menu on each cell. */
  renderCellActionMenuItems?: (props: {
    cell: DataTableCell<TData, unknown>
    row: DataTableRow<TData>
    table: DataTableInstance<TData>
  }) => React.ReactNode
  /** Render a kebab menu in the row-actions column. Returns the menu items
   *  (e.g. `<DropdownMenuItem>`); injects the actions column automatically. */
  renderRowActionMenuItems?: (props: {
    row: DataTableRow<TData>
    table: DataTableInstance<TData>
  }) => React.ReactNode
  /** Append custom items to the bottom of every column-actions menu. Returns the
   *  items (e.g. `<DropdownMenuItem>`); a separator is added before them. */
  renderColumnActionsMenuItems?: (props: {
    column: DataTableColumn<TData, unknown>
    table: DataTableInstance<TData>
  }) => React.ReactNode
  /** Replace the radio items in a column's filter-mode menu. Render your own
   *  items and call `onSelect(mode)` to switch; `modes` is the allowed set. */
  renderColumnFilterModeMenuItems?: (props: {
    column: DataTableColumn<TData, unknown>
    modes: FilterMode[]
    currentMode: FilterMode
    onSelect: (mode: FilterMode) => void
    table: DataTableInstance<TData>
  }) => React.ReactNode
  /** Replace the radio items in the global-search mode menu. Render your own
   *  items and call `onSelect(mode)` to switch; `modes` is the allowed set. */
  renderGlobalFilterModeMenuItems?: (props: {
    modes: GlobalFilterMode[]
    currentMode: GlobalFilterMode
    onSelect: (mode: GlobalFilterMode) => void
    table: DataTableInstance<TData>
  }) => React.ReactNode

  /** Fired when a body row is clicked / double-clicked. */
  onRowClick?: (props: RowEvent<TData>) => void
  /** Called when a row is double-clicked. Double-clicks on controls inside
   *  the row (edit, expand, pin…) are ignored. */
  onRowDoubleClick?: (props: RowEvent<TData>) => void
  /** Fired when a body cell is clicked / double-clicked. */
  onCellClick?: (props: CellEvent<TData>) => void
  /** Called when a cell is double-clicked. Double-clicks on controls inside
   *  the cell are ignored. */
  onCellDoubleClick?: (props: CellEvent<TData>) => void

  /** Virtualize body rows for large datasets (recommended past ~100 rows).
   *  The table surface becomes the scroll container — give it a bounded height
   *  via `className`/`style` (defaults to `max-h-[600px]`). Disables row DnD. */
  enableRowVirtualization?: boolean
  /** Virtualize columns for very wide tables. Applies fixed column widths;
   *  works with column pinning (pinned columns stay rendered), column
   *  ordering and grouped headers. */
  enableColumnVirtualization?: boolean
  /** Estimated row height (px) for the virtualizer. Default 52. */
  estimateRowHeight?: number
  /** Extra rows rendered above/below the viewport. Default 8. */
  virtualOverscan?: number
  /** Flat height (px) applied to every row. Overridden per-row by
   *  `getRowHeight`. Also seeds the virtualizer estimate. */
  rowHeight?: number
  /** Per-row height. Return a px number to pin the row, `"auto"` to let it wrap
   *  and grow to fit its content (even with column resizing on), or `null` to
   *  fall back to `rowHeight` / the density default. Applies to data rows. */
  getRowHeight?: (row: DataTableRow<TData>) => number | "auto" | null
  /** Partial `@tanstack/react-virtual` options merged into the row virtualizer
   *  (overrides the built-in `count`/`estimateSize`/`overscan`/`measureElement`).
   *  Accepts an object or a `({ table }) => options` function. */
  rowVirtualizerOptions?: RowVirtualizerOptions<TData>
  /** Partial `@tanstack/react-virtual` options merged into the column
   *  virtualizer. Accepts an object or a `({ table }) => options` function. */
  columnVirtualizerOptions?: ColumnVirtualizerOptions<TData>
  /** Ref populated with the row `Virtualizer` instance for imperative control
   *  (e.g. `scrollToIndex`). Only set when `enableRowVirtualization`. */
  rowVirtualizerInstanceRef?: React.RefObject<DataTableRowVirtualizer | null>
  /** Ref populated with the column `Virtualizer` instance. Only set when
   *  `enableColumnVirtualization`. */
  columnVirtualizerInstanceRef?: React.RefObject<DataTableColumnVirtualizer | null>
  /** Pin the header rows to the top of the scrollable surface. Also gives the
   *  surface a default viewport-bound max-height (`clamp(350px, 100dvh -
   *  200px, 9999px)`) so tall content scrolls internally; override the bound
   *  with `slotProps.surface`. Default true. */
  enableStickyHeader?: boolean
  /** Splits rows into pages with pagination controls. Default `true`; turn it
   *  off for virtualization or infinite scroll. */
  enablePagination?: boolean
  /** Load more rows as the user scrolls near the bottom (infinite append). When
   *  on, the pager is hidden and pagination is forced to a single growing page,
   *  so all appended rows render. Fully controlled: the table calls `onLoadMore`
   *  only when the bottom sentinel nears the viewport AND `hasNextPage` AND
   *  `!isFetchingNextPage`. Pairs directly with TanStack Query's
   *  `useInfiniteQuery` (`fetchNextPage`/`hasNextPage`/`isFetchingNextPage`).
   *  Default false. */
  enableInfiniteScroll?: boolean
  /** Called to request the next chunk. Should be stable (memoized) so the table
   *  doesn't re-trigger on every render. Append the result to `data`. */
  onLoadMore?: () => void
  /** Whether more rows remain to be loaded. Default false. */
  hasNextPage?: boolean
  /** Whether a load is currently in flight (blocks re-triggering). Default false. */
  isFetchingNextPage?: boolean
  /** Distance in px from the bottom at which to prefetch. Default 200. */
  infiniteScrollThreshold?: number
  /** Where the pagination controls render. Default "bottom". "none" keeps
   *  pagination active but hides the controls. */
  positionPagination?: "top" | "bottom" | "both" | "none"
  /** Pagination control style: `"default"` (range label + first/prev/next/last
   *  buttons), `"pages"` (numbered page buttons), or `"custom"` (render your own
   *  via `renderBottomToolbarCustomActions`). Default "default". */
  paginationDisplayMode?: PaginationDisplayMode
  /** Where column filter inputs live: `"subheader"` (a filter row under the
   *  header, default), `"popover"` (per-column popovers opened from the column
   *  header), or `"custom"` (you render them). */
  columnFilterDisplayMode?: ColumnFilterDisplayMode
  /** Which toolbar region the global search renders in. Default "right" (the
   *  internal-actions cluster). "left" places it next to the title/actions;
   *  "none" hides it (same as `enableGlobalFilter: false`). */
  positionGlobalFilter?: "left" | "right" | "none"
  /** Where the row-selection alert banner renders. Default "top". */
  positionToolbarAlertBanner?: "top" | "bottom" | "none"
  /** Where the group-by drop zone renders (grouping only). Default "top". */
  positionToolbarDropZone?: "top" | "bottom" | "both" | "none"
  /** Position of the auto-injected row-actions column. Default "last". */
  positionActionsColumn?: "first" | "last"
  /** Position of the auto-injected expand column (tree / detail panel).
   *  Default "first". */
  positionExpandColumn?: "first" | "last"
  /** Select-all scope for the header checkbox: the current page ("page",
   *  default) or every row ("all"). */
  selectAllMode?: "page" | "all"
  /** Show the select-all checkbox in the selection column header. Default true. */
  enableSelectAll?: boolean
  /** Shows the toolbar above the table (title, search, filters, view
   *  options). Default `true`. */
  enableTopToolbar?: boolean
  /** Shows the toolbar below the table (pagination, custom actions). Default
   *  `true`. */
  enableBottomToolbar?: boolean
  /** Show the density toggle in the toolbar. Default true. */
  enableDensityToggle?: boolean
  /** Show the full-screen toggle in the toolbar. Default true. */
  enableFullscreenToggle?: boolean
  /** Show the toolbar's internal icon-action cluster (search, filters, column
   *  visibility, export, density, full screen). Default true. Hides the whole
   *  cluster at once; use the per-item flags for finer control. */
  enableToolbarInternalActions?: boolean
  /** Cell keyboard navigation with a single Tab stop: arrow keys, Home/End,
   *  PageUp/PageDown, Enter or F2 to activate a cell, Ctrl+C to copy it. Also
   *  makes the table an ARIA grid. Default `true`. */
  enableKeyboardNavigation?: boolean
  /** Heading shown at the start of the top toolbar. */
  title?: React.ReactNode
  /** Custom content rendered in the top toolbar's left region (next to the
   *  title), e.g. bulk-action buttons. */
  renderTopToolbarCustomActions?: (
    props: DataTableSlotProps<TData>
  ) => React.ReactNode
  /** Replace the entire top toolbar with custom content. */
  renderTopToolbar?: (props: DataTableSlotProps<TData>) => React.ReactNode
  /** Replace the entire bottom toolbar (pagination region) with custom content. */
  renderBottomToolbar?: (props: DataTableSlotProps<TData>) => React.ReactNode
  /** Replace the top toolbar's internal icon-action cluster with custom content. */
  renderToolbarInternalActions?: (
    props: DataTableSlotProps<TData>
  ) => React.ReactNode
  /** Custom content rendered in the bottom toolbar's left region (next to
   *  pagination), e.g. summary text or actions. */
  renderBottomToolbarCustomActions?: (
    props: DataTableSlotProps<TData>
  ) => React.ReactNode
  /** Render a `<caption>` for the table (e.g. an accessible summary). */
  renderCaption?: (props: DataTableSlotProps<TData>) => React.ReactNode
  /** Content shown when there are no rows. Defaults to
   *  `localization.noRecordsToDisplay`. */
  renderEmpty?: (props: DataTableSlotProps<TData>) => React.ReactNode
}
