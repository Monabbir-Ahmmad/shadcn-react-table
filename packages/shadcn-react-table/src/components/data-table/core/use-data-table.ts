"use client"

import {
  setStateSlice,
  useTable,
  type RowData,
  type TableState,
  type Updater,
} from "@tanstack/react-table"
import * as React from "react"

import { VALUELESS_MODES, type FilterMode } from "../fns/filter-fns"
import { columnKey } from "../helpers/column-key"
import { flattenLeafColumns } from "../helpers/flatten-leaf-columns"
import { mapPinningUpdater, toCorePinning } from "../helpers/column-pinning"
import { getColumnLabel } from "../helpers/column-label"
import {
  getColumnDefMinWidth,
  getColumnDefPreferredWidth,
  getHeaderControlsWidth,
  isDataColumnDef,
  type HeaderControlsOptions,
} from "../helpers/header-controls"
import { measureColumnWidth } from "../helpers/measure-column-width"
import { toDataTableState } from "../helpers/table-state"
import { useAdvancedFilter } from "../hooks/use-advanced-filter"
import { useColumnFilterModes } from "../hooks/use-column-filter-modes"
import { createEditingActions } from "../hooks/use-editing-state"
import { useGlobalFilterMode } from "../hooks/use-global-filter-mode"
import { usePageIndexClamp } from "../hooks/use-page-index-clamp"
import { useTableStateListener } from "../hooks/use-table-state"
import { usePageResetOnFilterChange } from "../hooks/use-page-reset-on-filter-change"
import { useResolvedColumns } from "../hooks/use-resolved-columns"
import { useDataTableConfigContext } from "./config-context"
import {
  createDataTableFeatures,
  type DataTableFeatures,
  type RowModelGates,
} from "./features"
import { defaultIcons } from "./icons"
import { defaultLocalization } from "./localization"
import {
  changeHandlerKey,
  EMPTY_ADVANCED_FILTER,
  getUiState,
  makeUiStateHandler,
  withLiveUiState,
  UI_STATE_KEYS,
  type DataTableUiState,
  type DataTableUiStateKey,
} from "./ui-state"
import type {
  DataTableConfig,
  DataTableInstance,
  UseDataTableOptions,
} from "./types"

type CoreTableState = Partial<TableState<DataTableFeatures>>
type CoreStoreState = TableState<DataTableFeatures>

/** The default `useTable` selector: the calling component re-renders on no
 *  table state change. */
const selectNothing = () => null

/**
 * Core hook. Wraps `useTable` with MRT-flavoured defaults (row models,
 * auto-injected selection column, localization) and attaches our presentation
 * state + feature flags to the instance as `table.tableInstance`. Returns the
 * enriched instance to hand to `<DataTable table={table} />`.
 *
 * Controlled data state (sorting/filtering/pagination/selection/visibility),
 * `manual*` server-side flags, and `getRowId` all pass straight through to
 * TanStack via the spread options. The presentation state is split into focused
 * hooks (`use-editing-state`, `use-column-filter-modes`, `use-global-filter-mode`,
 * `use-resolved-columns`, `use-page-reset-on-filter-change`); this hook wires
 * them together and assembles the `tableInstance` config.
 */
export function useDataTable<TData extends RowData>(
  options: UseDataTableOptions<TData>
): DataTableInstance<TData> {
  const {
    localization: localizationProp,
    icons: iconsProp,
    isLoading = false,
    isSaving = false,
    showProgressBars: showProgressBarsProp,
    showSkeletons: showSkeletonsProp,
    showLoadingOverlay: showLoadingOverlayProp,
    enableFacetedValues = true,
    enableColumnActions = true,
    enableStickyHeader = true,
    enablePagination: enablePaginationProp = true,
    enableInfiniteScroll = false,
    onLoadMore,
    hasNextPage = false,
    isFetchingNextPage = false,
    infiniteScrollThreshold = 200,
    positionPagination = "bottom",
    paginationDisplayMode = "default",
    columnFilterDisplayMode = "subheader",
    positionGlobalFilter = "right",
    positionToolbarAlertBanner = "top",
    positionToolbarDropZone = "top",
    positionActionsColumn = "last",
    positionExpandColumn = "first",
    selectAllMode = "page",
    enableSelectAll = true,
    enableTopToolbar = true,
    enableBottomToolbar = true,
    enableDensityToggle = true,
    enableFullscreenToggle = true,
    enableKeyboardNavigation = true,
    enableColumnFilterModes = true,
    enableFilterMatchHighlighting = true,
    enableGlobalFilter = true,
    enableGlobalFilterModes = true,
    enableGlobalFilterRankedResults = false,
    onDensityChange,
    onIsFullscreenChange,
    onShowColumnFiltersChange,
    enableAdvancedFilter = false,
    onAdvancedFilterChange,
    onGlobalFilterModeChange,
    onColumnFilterModesChange,
    onShowAdvancedFilterPanelChange,
    onEditingCellChange,
    onEditingRowIdChange,
    onIsCreatingChange,
    onRowDraftChange,
    enableColumnOrdering = false,
    enableColumnPinning = false,
    enableColumnResizing = false,
    enableColumnAutosize: enableColumnAutosizeProp,
    enableRowOrdering = false,
    enableRowPinning = false,
    enableRowNumbers = false,
    rowNumberMode = "static",
    onRowOrderChange,
    enableGrouping = false,
    enableExpanding: enableExpandingProp,
    enableStickyFooter = false,
    renderDetailPanel,
    enableEditing = false,
    editDisplayMode = "cell",
    createDisplayMode = "modal",
    createRowDefaults,
    enableClickToCopy = false,
    onEditingCellSave,
    onEditingRowSave,
    onCreatingRowSave,
    renderRowActions,
    renderCellActionMenuItems,
    renderRowActionMenuItems,
    renderColumnActionsMenuItems,
    renderColumnFilterModeMenuItems,
    renderGlobalFilterModeMenuItems,
    renderCaption,
    onRowClick,
    onRowDoubleClick,
    onCellClick,
    onCellDoubleClick,
    enableRowVirtualization = false,
    enableColumnVirtualization = false,
    estimateRowHeight = 52,
    virtualOverscan = 8,
    rowHeight,
    getRowHeight,
    rowVirtualizerOptions,
    columnVirtualizerOptions,
    rowVirtualizerInstanceRef,
    columnVirtualizerInstanceRef,
    enableToolbarInternalActions = true,
    title,
    renderTopToolbarCustomActions,
    renderTopToolbar,
    renderBottomToolbar,
    renderToolbarInternalActions,
    renderBottomToolbarCustomActions,
    renderEmpty,
    stateSelector,
    columns,
    ...tableOptions
  } = options

  // Infinite scroll implies a single growing page: hide the pager and drop the
  // pagination row model so every appended row renders.
  const enablePagination = enableInfiniteScroll ? false : enablePaginationProp

  // App-wide defaults from a surrounding DataTableConfigProvider (if any) sit
  // between the built-in defaults and per-call options.
  const configCtx = useDataTableConfigContext()
  const localization = React.useMemo(
    () => ({
      ...defaultLocalization,
      ...configCtx.localization,
      ...localizationProp,
    }),
    [configCtx.localization, localizationProp]
  )
  const icons = React.useMemo(
    () => ({ ...defaultIcons, ...configCtx.icons, ...iconsProp }),
    [configCtx.icons, iconsProp]
  )

  // Expansion turns on for tree data (getSubRows), detail panels, or grouping.
  const enableExpanding =
    enableExpandingProp ??
    (!!renderDetailPanel || !!tableOptions.getSubRows || enableGrouping)
  // An expand column is needed for tree sub-rows or detail panels (grouped
  // rows carry their own chevron in the grouping cell).
  const needsExpandColumn = !!renderDetailPanel || !!tableOptions.getSubRows

  // Loading affordances: each can be forced on/off, else derived from the
  // loading/saving flags (progress bar for either; skeletons + overlay only
  // for the initial data load).
  const showProgressBars = showProgressBarsProp ?? (isLoading || isSaving)
  const showSkeletons = showSkeletonsProp ?? isLoading
  const showLoadingOverlay = showLoadingOverlayProp ?? isLoading

  // The hook's stable instance (assigned after `useTable` below).
  const tableRef = React.useRef<DataTableInstance<TData> | null>(null)

  // UI state (density, full screen, editing, filter modes…) is table state in
  // the store (see core/ui-state.ts). These are its defaults, under any
  // `initialState`.
  const [uiDefaults] = React.useState<DataTableUiState>(() => ({
    density: "comfortable",
    isFullscreen: false,
    showColumnFilters: false,
    columnFilterModes: {},
    globalFilterMode: "fuzzy",
    advancedFilter: EMPTY_ADVANCED_FILTER,
    showAdvancedFilterPanel: false,
    editingCell: null,
    editingRowId: null,
    isCreating: false,
    rowDraft: {},
    direction: "ltr",
  }))
  // The live UI state, for row-model getters and actions that run outside
  // this render.
  const getUi = React.useCallback(
    () => (tableRef.current ? getUiState(tableRef.current) : uiDefaults),
    [uiDefaults]
  )

  // Setters and editing transitions go through each slice's change handler,
  // like TanStack's own setters. Created once: they read the table lazily.
  const createRowDefaultsRef = React.useRef(createRowDefaults)
  // eslint-disable-next-line react-hooks/refs
  createRowDefaultsRef.current = createRowDefaults
  // eslint-disable-next-line react-hooks/refs
  const [uiActions] = React.useState(() => {
    const setter =
      <K extends DataTableUiStateKey>(key: K) =>
      (updater: Updater<DataTableUiState[K]>) => {
        const table = tableRef.current
        if (table) setStateSlice(table as never, key as never, updater as never)
      }
    return {
      setDensity: setter("density"),
      setIsFullscreen: setter("isFullscreen"),
      setDirection: setter("direction"),
      setShowColumnFilters: setter("showColumnFilters"),
      setColumnFilterModes: setter("columnFilterModes"),
      setGlobalFilterMode: setter("globalFilterMode"),
      setAdvancedFilter: setter("advancedFilter"),
      setShowAdvancedFilterPanel: setter("showAdvancedFilterPanel"),
      ...createEditingActions<TData>(
        () => tableRef.current,
        () => createRowDefaultsRef.current
      ),
    }
  })

  const { dynamicFilterFn } = useColumnFilterModes<TData>(
    columns,
    () => getUi().columnFilterModes
  )

  // `enableFilters: false` forces manual filtering into TanStack below; the
  // ranked-sort and faceting gates must see the same switch.
  const isManualFiltering =
    !!tableOptions.manualFiltering || tableOptions.enableFilters === false

  const { dynamicGlobalFilterFn, rankedSortedRowModel } =
    useGlobalFilterMode<TData>({
      getMode: () => getUi().globalFilterMode,
      enableGlobalFilterRankedResults,
      manualSorting: !!tableOptions.manualSorting,
      manualFiltering: isManualFiltering,
      enableGrouping,
    })

  const advancedFilteredRowModel = useAdvancedFilter<TData>({
    enableAdvancedFilter,
    getGroup: () => getUi().advancedFilter,
    getGlobalFilterMode: () => getUi().globalFilterMode,
  })

  // Row-model stages our options can switch off. Read through a ref inside the
  // (cached-once) factories so toggling an option takes effect immediately.
  const gatesRef = React.useRef<RowModelGates>(null!)
  // eslint-disable-next-line react-hooks/refs
  gatesRef.current = {
    pagination: enablePagination,
    grouping: enableGrouping,
    expanding: enableExpanding,
    faceting: enableFacetedValues && !isManualFiltering,
  }
  // The getters run inside TanStack's row-model computation and render
  // contexts, not during this render.
  // eslint-disable-next-line react-hooks/refs
  const [features] = React.useState(() =>
    createDataTableFeatures({
      gates: () => gatesRef.current,
      getTableInstance: () => tableRef.current?.tableInstance,
      // Typed for this hook's `TData`; the slots take TanStack's own
      // custom-row-model type, which any `TData` fits (see `features.ts`).
      filteredRowModel: advancedFilteredRowModel,
      sortedRowModel: rankedSortedRowModel,
      uiDefaults: () => uiDefaults,
    })
  )

  // Consumer pinning speaks left/right; TanStack speaks start/end. Memoize on
  // the consumer's slice so the controlled state handed to TanStack keeps a
  // stable reference (TanStack republishes controlled state on shallow change;
  // a fresh object every render would loop).
  //
  // The React Compiler skips this hook: the memoized values below flow into the
  // mutable TanStack instance. Expected (TanStack v8's `useReactTable` was a
  // known-incompatible library and bailed the same way); the memos are for
  // TanStack, not the compiler.
  /* eslint-disable react-hooks/preserve-manual-memoization */
  const {
    initialState,
    state: stateProp,
    onColumnPinningChange,
    ...coreOptions
  } = tableOptions
  const controlledPinning = stateProp?.columnPinning
  const corePinning = React.useMemo(
    () => (controlledPinning ? toCorePinning(controlledPinning) : undefined),
    [controlledPinning]
  )
  const state = React.useMemo(
    () =>
      stateProp &&
      // Only set `columnPinning` when the consumer controls it (an own key
      // holding `undefined` would pin TanStack to its initial pinning).
      ({
        ...stateProp,
        ...(corePinning && { columnPinning: corePinning }),
      } as CoreTableState),
    [stateProp, corePinning]
  )

  // One change handler per UI slice: stores the value unless the slice is
  // controlled, and reports it to the consumer's callback either way.
  const uiCallbacks: {
    [K in DataTableUiStateKey]?: (value: DataTableUiState[K]) => void
  } = {
    density: onDensityChange,
    isFullscreen: onIsFullscreenChange,
    showColumnFilters: onShowColumnFiltersChange,
    advancedFilter: onAdvancedFilterChange,
    globalFilterMode: onGlobalFilterModeChange,
    columnFilterModes: onColumnFilterModesChange,
    showAdvancedFilterPanel: onShowAdvancedFilterPanelChange,
    editingCell: onEditingCellChange,
    editingRowId: onEditingRowIdChange,
    isCreating: onIsCreatingChange,
    rowDraft: onRowDraftChange,
  }
  const uiHandlers = Object.fromEntries(
    // The handlers read the table when they run, not during this render.
    // eslint-disable-next-line react-hooks/refs
    UI_STATE_KEYS.map((key) => [
      changeHandlerKey(key),
      makeUiStateHandler(
        () => tableRef.current,
        key,
        (state as Record<string, unknown> | undefined)?.[key] !== undefined,
        uiCallbacks[key] as never
      ),
    ])
  )
  const pinningChange = React.useMemo(
    () => onColumnPinningChange && mapPinningUpdater(onColumnPinningChange),
    [onColumnPinningChange]
  )

  const enableRowSelection =
    tableOptions.enableRowSelection != null
      ? !!tableOptions.enableRowSelection
      : false

  // Columns with a consumer-provided cell renderer are left untouched by
  // auto-highlighting (the consumer owns their markup).
  const columnsWithCustomCell = React.useMemo(() => {
    const set = new Set<string>()
    for (const def of flattenLeafColumns(columns)) {
      const key = columnKey(def as { id?: string; accessorKey?: unknown })
      if (key && "cell" in def && def.cell != null) set.add(key)
    }
    return set
  }, [columns])

  const resolvedColumns = useResolvedColumns<TData>({
    columns,
    enableRowOrdering,
    enableRowSelection,
    selectAllMode,
    enableSelectAll,
    needsExpandColumn,
    positionExpandColumn,
    enableRowNumbers,
    rowNumberMode,
    enableRowPinning,
    renderRowActions,
    renderRowActionMenuItems,
    positionActionsColumn,
    enableEditing,
    editDisplayMode,
    localization,
    icons,
  })

  // Which header affordances render — shared by the column sizing below, the
  // autosize measurement, and the header components, so they can't diverge.
  const headerControlsOptions = React.useMemo<HeaderControlsOptions>(
    () => ({
      enableColumnActions,
      enableColumnOrdering,
      enableGrouping,
      enableColumnPinning,
      enableColumnVirtualization,
      columnFilterDisplayMode,
    }),
    [
      enableColumnActions,
      enableColumnOrdering,
      enableGrouping,
      enableColumnPinning,
      enableColumnVirtualization,
      columnFilterDisplayMode,
    ]
  )

  // Size each data column so its header controls are never clipped. Under
  // `table-layout: fixed` a `<th>` is pinned to `getSize()` and clips overflow,
  // and CSS `min-width` is ignored — so the drag grip / actions / filter button
  // (all shrink-0) would be hidden behind a long label or a small size.
  //  • minSize — a hard floor (controls + a sliver of label) that raises
  //    `getSize()` and stops the resize drag; the label truncates past it.
  //  • size — the at-rest default, widened to fit the full header so nothing is
  //    truncated until the user drags narrower; only when no size was pinned.
  // Done here as a pure transform (not a post-build mutation) so React Compiler
  // keeps it and the SSR and client size vars match — a mutation in a memo/effect
  // is dead-code-eliminated on the client and desyncs hydration.
  const baseColumnSize = tableOptions.defaultColumn?.size ?? 150
  const sizedColumns = React.useMemo(
    () =>
      resolvedColumns.map((def) => {
        if (!isDataColumnDef(def)) return def
        const minSize = Math.max(
          def.minSize ?? 0,
          getColumnDefMinWidth(def, headerControlsOptions)
        )
        const size =
          def.size != null
            ? def.size
            : Math.max(
                baseColumnSize,
                getColumnDefPreferredWidth(def, headerControlsOptions)
              )
        return { ...def, minSize, size }
      }),
    [resolvedColumns, headerControlsOptions, baseColumnSize]
  )
  /* eslint-enable react-hooks/preserve-manual-memoization */

  // Subscribes the calling component to nothing by default (DataTable
  // subscribes to what it shows), or to what `stateSelector` picks.
  const selectState = stateSelector
    ? (state: CoreStoreState) => stateSelector(toDataTableState(state))
    : selectNothing
  const reactTable = useTable<DataTableFeatures, TData, unknown>(
    {
      ...coreOptions,
      features,
      // Only set `columnPinning` when given: TanStack spreads `initialState`
      // over its defaults, so an own `undefined` key would erase the default.
      initialState:
        initialState &&
        ({
          ...initialState,
          ...(initialState.columnPinning && {
            columnPinning: toCorePinning(initialState.columnPinning),
          }),
        } as CoreTableState),
      state,
      // Only when the consumer handles pinning: TanStack merges these options
      // over its feature defaults, so an own `undefined` key would replace the
      // default internal state updater and make pinning a no-op.
      ...(pinningChange && { onColumnPinningChange: pinningChange }),
      ...uiHandlers,
      columns: sizedColumns,
      // Default page-reset off: TanStack's auto-reset runs a state update during
      // render (warns in React 19 dev). We reset on filter changes via an effect
      // below instead. Consumers can re-enable by passing the option explicitly.
      autoResetPageIndex: tableOptions.autoResetPageIndex ?? false,
      // `enableFilters: false` is the master switch; TanStack v9 still applies
      // filters handed in through state, so hand the (no-op) filtering to us.
      // Spread conditionally: an own `undefined` key would override a consumer
      // `manualFiltering`.
      ...(tableOptions.enableFilters === false && { manualFiltering: true }),
      defaultColumn: {
        filterFn: dynamicFilterFn,
        ...tableOptions.defaultColumn,
      },
      enableGlobalFilter,
      globalFilterFn: tableOptions.globalFilterFn ?? dynamicGlobalFilterFn,
      enableColumnPinning,
      enableColumnResizing,
      columnResizeMode: tableOptions.columnResizeMode ?? "onChange",
      // Dragging a right-to-left column's edge to the left widens it.
      columnResizeDirection:
        // eslint-disable-next-line react-hooks/refs
        tableOptions.columnResizeDirection ?? getUi().direction,
      enableRowPinning,
      keepPinnedRows: tableOptions.keepPinnedRows ?? true,
      enableGrouping,
      enableExpanding,
      // Detail panels expand arbitrary rows; tree data uses getSubRows' own logic.
      getRowCanExpand:
        tableOptions.getRowCanExpand ??
        (renderDetailPanel ? () => true : undefined),
    },
    selectState
  )

  // v9's useTable returns a fresh wrapper every render; keep one instance for
  // the hook's lifetime (v8 semantics: consumers and our memos rely on a stable
  // `table`) and refresh its fields from the latest wrapper.
  const table = Object.assign(
    // eslint-disable-next-line react-hooks/refs
    tableRef.current ?? ({} as DataTableInstance<TData>),
    reactTable,
    { getState: () => toDataTableState(reactTable.store.state) }
  )
  // eslint-disable-next-line react-hooks/refs
  tableRef.current = table

  const ui = getUiState(table)
  const enableColumnFilters = tableOptions.enableColumnFilters !== false

  // The measured direction reaches column resizing through the options, which
  // the calling component no longer refreshes on state changes.
  const ownResizeDirection = tableOptions.columnResizeDirection
  useTableStateListener(table, () => {
    if (ownResizeDirection) return
    const { direction } = getUiState(table)
    if (table.options.columnResizeDirection !== direction) {
      table.setOptions((prev) => ({
        ...prev,
        columnResizeDirection: direction,
      }))
    }
  })

  usePageResetOnFilterChange(table, {
    enablePagination,
    manualPagination: tableOptions.manualPagination,
    autoResetPageIndex: tableOptions.autoResetPageIndex,
  })

  usePageIndexClamp(table, {
    enablePagination,
    manualPagination: tableOptions.manualPagination,
    isLoading,
    showSkeletons,
  })

  // The callbacks below end up on the instance config, which gets live UI
  // getters attached (see `withLiveUiState`); the compiler cannot keep them
  // memoized across that, and skips this hook as noted above.
  /* eslint-disable react-hooks/preserve-manual-memoization */
  // Switching a column's mode resets its value so a stale value (e.g. a
  // numeric range left over from "between") can't break the new mode. Valueless
  // modes (empty/notEmpty) get a truthy sentinel so they stay active. Lives here
  // (not in useColumnFilterModes) because it needs the table instance.
  const setColumnFilterMode = React.useCallback(
    (columnId: string, mode: FilterMode) => {
      uiActions.setColumnFilterModes((prev) => ({ ...prev, [columnId]: mode }))
      const column = table.getColumn(columnId)
      if (!column) return
      if (VALUELESS_MODES.has(mode)) {
        column.setFilterValue(mode)
      } else if (column.getFilterValue() !== undefined) {
        // Only clear when a value exists: TanStack always builds a new
        // `columnFilters` array, which would fire a consumer refetch for nothing.
        column.setFilterValue(undefined)
      }
    },
    [table, uiActions]
  )

  // Structural DOM refs, exposed on `table.tableInstance.refs` and attached to the
  // corresponding elements in DataTable / toolbar / global-filter.
  const tablePaperRef = React.useRef<HTMLDivElement>(null)
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  const topToolbarRef = React.useRef<HTMLDivElement>(null)
  const bottomToolbarRef = React.useRef<HTMLDivElement>(null)
  const tableHeadRef = React.useRef<HTMLTableSectionElement>(null)
  const tableFooterRef = React.useRef<HTMLTableSectionElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Double-clicking a resize handle (or calling this imperatively) fits a column
  // to its widest value. Defaults on when resizing is enabled.
  const enableColumnAutosize = enableColumnAutosizeProp ?? enableColumnResizing

  const autoSizeColumn = React.useCallback(
    (columnId: string) => {
      const column = table.getColumn(columnId)
      if (!column || !column.getCanResize()) return

      // Font + horizontal padding come from a real rendered cell so measurement
      // matches the actual type scale and density; fall back to sane defaults.
      const containerEl = tableContainerRef.current
      const sampleCell =
        containerEl?.querySelector<HTMLElement>("tbody td") ??
        containerEl?.querySelector<HTMLElement>("thead th") ??
        null
      let font = "14px sans-serif"
      let padding = 24
      if (sampleCell) {
        const cs = getComputedStyle(sampleCell)
        if (cs.font) font = cs.font
        padding = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
      }

      // Measure the full dataset (not just virtualized-visible rows) from raw
      // values. Headers render uppercase, so match that for measurement.
      const values = table.getRowModel().rows.map((row) => {
        const value = row.getValue(columnId)
        return value == null ? "" : String(value)
      })
      const headerText = getColumnLabel(column).toUpperCase()

      // Reserve room beside the label for the header affordances that actually
      // render (sort indicator, drag grip, column-actions trigger, popover
      // filter button). Shared with the per-column minSize floor below so
      // measurement and the floor can never disagree — see helpers/header-controls.
      const extraWidth = getHeaderControlsWidth(column, headerControlsOptions)

      const width = measureColumnWidth(values, headerText, {
        font,
        padding,
        extraWidth,
      })

      // Respect any per-column size bounds from the column def.
      const { minSize, maxSize } = column.columnDef
      let clamped = width
      if (typeof minSize === "number") clamped = Math.max(clamped, minSize)
      if (typeof maxSize === "number") clamped = Math.min(clamped, maxSize)

      table.setColumnSizing((prev) => ({ ...prev, [columnId]: clamped }))
    },
    [table, headerControlsOptions]
  )

  const autoSizeAllColumns = React.useCallback(() => {
    for (const column of table.getVisibleLeafColumns()) {
      if (column.getCanResize()) autoSizeColumn(column.id)
    }
  }, [table, autoSizeColumn])

  /* eslint-enable react-hooks/preserve-manual-memoization */

  const config: DataTableConfig<TData> = {
    localization,
    icons,
    refs: {
      tablePaperRef,
      tableContainerRef,
      topToolbarRef,
      bottomToolbarRef,
      tableHeadRef,
      tableFooterRef,
      searchInputRef,
    },
    density: ui.density,
    setDensity: uiActions.setDensity,
    isFullscreen: ui.isFullscreen,
    setIsFullscreen: uiActions.setIsFullscreen,
    direction: ui.direction,
    setDirection: uiActions.setDirection,
    showColumnFilters: ui.showColumnFilters,
    setShowColumnFilters: uiActions.setShowColumnFilters,
    columnFilterModes: ui.columnFilterModes,
    setColumnFilterMode,
    globalFilterMode: ui.globalFilterMode,
    setGlobalFilterMode: uiActions.setGlobalFilterMode,
    enableGlobalFilter,
    enableGlobalFilterModes,
    enableAdvancedFilter,
    advancedFilter: ui.advancedFilter,
    setAdvancedFilter: uiActions.setAdvancedFilter,
    showAdvancedFilterPanel: ui.showAdvancedFilterPanel,
    setShowAdvancedFilterPanel: uiActions.setShowAdvancedFilterPanel,
    isLoading,
    isSaving,
    showProgressBars,
    showSkeletons,
    showLoadingOverlay,
    enableFacetedValues,
    enableColumnActions,
    enableColumnFilters,
    enableColumnFilterModes,
    // With filtering switched off, filter values in state match nothing.
    enableFilterMatchHighlighting:
      enableFilterMatchHighlighting && tableOptions.enableFilters !== false,
    columnsWithCustomCell,
    enableColumnOrdering,
    enableColumnPinning,
    enableColumnResizing,
    enableColumnAutosize,
    autoSizeColumn,
    autoSizeAllColumns,
    enableRowOrdering,
    enableRowPinning,
    enableRowNumbers,
    rowNumberMode,
    onRowOrderChange,
    enableGrouping,
    enableExpanding,
    enableStickyFooter,
    renderDetailPanel,
    enableEditing,
    editDisplayMode,
    createDisplayMode,
    editingCell: ui.editingCell,
    setEditingCell: uiActions.setEditingCell,
    editingRowId: ui.editingRowId,
    isCreating: ui.isCreating,
    rowDraft: ui.rowDraft,
    setRowDraftValue: uiActions.setRowDraftValue,
    beginRowEdit: uiActions.beginRowEdit,
    beginCreate: uiActions.beginCreate,
    cancelEdit: uiActions.cancelEdit,
    enableClickToCopy,
    onEditingCellSave,
    onEditingRowSave,
    onCreatingRowSave,
    renderRowActions,
    renderCellActionMenuItems,
    onRowClick,
    onRowDoubleClick,
    onCellClick,
    onCellDoubleClick,
    enableRowVirtualization,
    enableColumnVirtualization,
    estimateRowHeight,
    virtualOverscan,
    rowHeight,
    getRowHeight,
    rowVirtualizerOptions,
    columnVirtualizerOptions,
    rowVirtualizerInstanceRef,
    columnVirtualizerInstanceRef,
    enableStickyHeader,
    enablePagination,
    enableInfiniteScroll,
    onLoadMore,
    hasNextPage,
    isFetchingNextPage,
    infiniteScrollThreshold,
    positionPagination,
    paginationDisplayMode,
    columnFilterDisplayMode,
    positionGlobalFilter,
    positionToolbarAlertBanner,
    positionToolbarDropZone,
    enableRowSelection,
    enableTopToolbar,
    enableBottomToolbar,
    enableDensityToggle,
    enableFullscreenToggle,
    enableToolbarInternalActions,
    enableKeyboardNavigation,
    title,
    renderTopToolbarCustomActions,
    renderTopToolbar,
    renderBottomToolbar,
    renderToolbarInternalActions,
    renderBottomToolbarCustomActions,
    renderRowActionMenuItems,
    renderColumnActionsMenuItems,
    renderColumnFilterModeMenuItems,
    renderGlobalFilterModeMenuItems,
    renderCaption,
    renderEmpty,
  }

  // UI state members read the store when accessed, so they are current even
  // where the component calling this hook has not re-rendered. (The config
  // holds the DOM ref objects, which are only handed on, not read.)
  // eslint-disable-next-line react-hooks/refs
  withLiveUiState(config, reactTable.store)

  // The instance is TanStack's mutable object; attaching our config is the
  // contract (`table.tableInstance`).
  // eslint-disable-next-line react-hooks/immutability
  table.tableInstance = config

  return table
}
