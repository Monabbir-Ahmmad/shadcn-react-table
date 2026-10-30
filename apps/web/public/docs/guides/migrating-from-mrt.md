# Migrating from Material React Table

The data table follows Material React Table (MRT) closely: the same hook-then-component shape, most of the same options, and the same TanStack Table underneath. Moving a table over is mostly renaming. This page lists what changes.

## The basics

```tsx
// Material React Table
const table = useMaterialReactTable({ columns, data })
return <MaterialReactTable table={table} />

// This data table
const table = useDataTable({ columns, data, getRowId: (row) => row.id })
return <DataTable table={table} />
```

- Type columns with `DataTableColumnDef<TData>` instead of `MRT_ColumnDef<TData>`.
- Pass `getRowId` — row selection, editing and pinning key rows by id.
- The table runs on **TanStack Table v9**, MRT on v8. The column options you share with TanStack (`accessorKey`, `cell`, `header`, `footer`, `sortFn`, `filterFn`, `enableSorting`, …) keep TanStack's names; v9 renames a few v8 ones, such as `sortingFn` → `sortFn`.

## Column options

MRT puts its own column options on the column definition. Here they live under `meta`.

| MRT column option | Here |
| --- | --- |
| `Cell` / `Header` / `Footer` | `cell` / `header` / `footer` (TanStack's) |
| `filterVariant` | `meta.filterVariant` |
| `filterSelectOptions` | `meta.filterSelectOptions` |
| `filterFn` (a mode name) | `meta.filterMode` |
| `columnFilterModeOptions` | `meta.columnFilterModeOptions` |
| `enableColumnFilterModes` | `meta.enableColumnFilterModes` |
| `Filter` | `meta.renderColumnFilter` |
| `editVariant` / `editSelectOptions` | `meta.editVariant` / `meta.editSelectOptions` |
| `enableEditing` | `meta.enableEditing` |
| `Edit` | `meta.renderEditCell` |
| `muiEditTextFieldProps` validation | `meta.validate` (return a message to block the save) |
| `GroupedCell` / `AggregatedCell` / `PlaceholderCell` | `meta.renderGroupedCell` / `meta.renderAggregatedCell` / `meta.renderPlaceholderCell` |
| `enableClickToCopy` | `meta.enableClickToCopy` |
| `enableColumnActions` | `meta.enableColumnActions` |
| `visibleInShowHideMenu` | `meta.visibleInShowHideMenu` |
| `grow` | `meta.grow` (in `layoutMode: "grid"`, a weight: every data column grows by 1 unless set; see [Column resizing](/docs/guides/column-resizing#layout-mode-and-grow)) |
| `muiTableHeadCellProps` / `muiTableBodyCellProps` / `muiTableFooterCellProps` | `meta.slotProps.headCell` / `.bodyCell` / `.footerCell` |

## Component props (`mui*Props`)

MRT's `mui*Props` become one `slotProps` option. Each part takes props or a function of its context, and merges them with the table's own. See [Part props](/docs/guides/slot-props).

| MRT | `slotProps` part |
| --- | --- |
| `muiTablePaperProps` | `root` |
| `muiTableContainerProps` | `surface` |
| `muiTableProps` | `table` |
| `muiTableHeadProps` / `muiTableHeadRowProps` / `muiTableHeadCellProps` | `head` / `headRow` / `headCell` |
| `muiFilterTextFieldProps` (cell) | `filterCell` |
| `muiTableBodyProps` / `muiTableBodyRowProps` / `muiTableBodyCellProps` | `body` / `bodyRow` / `bodyCell` |
| `muiDetailPanelProps` | `detailPanel` |
| `muiTableFooterProps` / `muiTableFooterRowProps` / `muiTableFooterCellProps` | `footer` / `footerRow` / `footerCell` |
| `muiTopToolbarProps` / `muiBottomToolbarProps` | `topToolbar` / `bottomToolbar` |
| `muiPaginationProps` | `pagination` |
| `muiToolbarAlertBannerProps` | `alertBanner` |
| `muiSearchTextFieldProps` | `searchInput` |
| `muiEditTextFieldProps` | `editField` |
| `muiEditRowDialogProps` / `muiCreateRowModalProps` | `editDialog` (`isCreating` tells them apart) |
| `muiSelectCheckboxProps` | `selectCheckbox` |

## State

| MRT state | Here |
| --- | --- |
| `isFullScreen` | `isFullscreen` |
| `columnFilterFns` | `columnFilterModes` |
| `globalFilterFn` | `globalFilterMode` |
| `editingRow` | `editingRowId` (the draft is in `rowDraft`) |
| `editingCell` | `editingCell` (`{ rowId, columnId }`) |
| `creatingRow` | `isCreating` (the draft is in `rowDraft`) |
| `isLoading` / `isSaving` / `showProgressBars` / `showSkeletons` / `showLoadingOverlay` | options of the same names, not state |
| `density`, `showColumnFilters`, and TanStack's own state | unchanged |

Set and control state the same way: `initialState`, `state`, and the matching `on…Change` callback (`onIsFullScreenChange` → `onIsFullscreenChange`, `onColumnFilterFnsChange` → `onColumnFilterModesChange`, `onGlobalFilterFnChange` → `onGlobalFilterModeChange`). See [State management](/docs/guides/state).

## Table options

Most options keep their MRT names: `enableRowSelection`, `enableMultiRowSelection`, `enableBatchRowSelection`, `enableSelectAll`, `selectAllMode`, `enableEditing`, `editDisplayMode`, `createDisplayMode`, `positionCreatingRow`, `enableGrouping`, `enableColumnPinning`, `enableRowPinning`, `enableColumnOrdering`, `enableColumnResizing`, `enableRowOrdering`, `enableRowNumbers`, `enableRowVirtualization`, `enableColumnVirtualization`, `rowVirtualizerOptions`, `columnVirtualizerOptions`, `enableStickyHeader`, `enableStickyFooter`, `enableTableHead`, `enableTableFooter`, `enableExpandAll`, `enableColumnFilterModes`, `enableGlobalFilterModes`, `enableGlobalFilterRankedResults`, `enableFacetedValues`, `enableFilterMatchHighlighting`, `enableClickToCopy`, `enableCellActions`, `enableDensityToggle`, `enableFullScreenToggle` → `enableFullscreenToggle`, `enableTopToolbar`, `enableBottomToolbar`, `enableToolbarInternalActions`, `columnFilterDisplayMode`, `paginationDisplayMode`, `positionPagination`, `positionGlobalFilter`, `positionActionsColumn`, `positionExpandColumn`, `positionToolbarAlertBanner`, `positionToolbarDropZone`, `displayColumnDefOptions`, `defaultDisplayColumn`, `filterFns`, `aggregationFns`, `columnFilterModeOptions`, `globalFilterModeOptions`, `localization`, `icons`.

Renamed or reshaped:

| MRT | Here |
| --- | --- |
| `sortingFns` | `sortFns` (TanStack v9's name) |
| `rowNumberDisplayMode` | `rowNumberMode` |
| `renderEmptyRowsFallback` | `renderEmpty` |
| `muiPaginationProps.rowsPerPageOptions` | `pageSizeOptions` |
| `state.isLoading` and friends | the `isLoading`, `isSaving`, `showProgressBars`, `showSkeletons`, `showLoadingOverlay` options |
| `onEditingRowSave({ values, table })`, then `table.setEditingRow(null)` | `onEditingRowSave({ row, values, table, exit })`, then `exit()` |
| `onCreatingRowSave({ values, table })`, then `table.setCreatingRow(null)` | `onCreatingRowSave({ values, table, exit })`, then `exit()` |
| cell edits saved from `muiEditTextFieldProps.onBlur` | `onEditingCellSave({ row, column, value, table })` |
| `displayColumnDefOptions["mrt-row-select"]` (and the other `mrt-row-*` ids) | `displayColumnDefOptions["cn-select"]` — ids: `cn-select`, `cn-expand`, `cn-row-actions`, `cn-row-number`, `cn-row-pin`, `cn-row-drag` |

Callbacks and render options with the same name and arguments: `onEditingRowCancel`, `onCreatingRowCancel`, `renderTopToolbarCustomActions`, `renderBottomToolbarCustomActions`, `renderToolbarInternalActions`, `renderTopToolbar`, `renderBottomToolbar`, `renderRowActions`, `renderDetailPanel`, `renderCaption`, `renderEditRowDialogContent`, `renderCreateRowDialogContent`, `renderColumnFilterModeMenuItems`, `renderGlobalFilterModeMenuItems`, and the menu callbacks `renderColumnActionsMenuItems`, `renderRowActionMenuItems`, `renderCellActionMenuItems` (each receives `internalMenuItems` and `closeMenu`).

## The table instance

| MRT | Here |
| --- | --- |
| `table.setEditingRow(row)` | `table.beginRowEdit(row)` |
| `table.setEditingRow(null)` / `table.setCreatingRow(null)` | `table.cancelEdit()` |
| `table.setCreatingRow(true)` | `table.beginCreate()` |
| `table.setEditingCell(cell)` | `table.setEditingCell({ rowId, columnId })` |
| `table.setIsFullScreen(…)` | `table.setIsFullscreen(…)` |
| `table.setColumnFilterFns(…)` | `table.setColumnFilterMode(columnId, mode)` |
| `table.setGlobalFilterFn(…)` | `table.setGlobalFilterMode(mode)` |
| `table.refs.tableContainerRef` (and the other refs) | `table.dataTable.refs.tableContainerRef` |
| `table.options.enableEditing` (and MRT's other options) | `table.dataTable.enableEditing` |
| `table.getState()` | unchanged, including the UI state above |

The instance is stable and the component that calls `useDataTable` does not re-render on state changes. Read state where you render it with `table.Subscribe`, or pass `stateSelector`. See [State management](/docs/guides/state).

## Defaults that differ

| Option | MRT | Here | Why |
| --- | --- | --- | --- |
| `editDisplayMode` | `"modal"` | `"cell"` | Inline editing is the quickest edit for most tables |
| `positionActionsColumn` | `"first"` | `"last"` | Actions read best after the data they act on |
| `enableStickyHeader` | `false` | `true` | Headers stay useful on long tables |
| `enableFacetedValues` | `false` | `true` | Select filters fill their options from the data |
| `enableGlobalFilterRankedResults` | `true` | `false` | Searching never reorders rows unless you opt in |
| Text filter mode | `"fuzzy"` | `"contains"` | Predictable matches; fuzzy is one menu click away |
| Cell editing starts on | double-click | single click | One click to edit, matching the click-to-edit affordance |

Set the MRT value explicitly to keep the old behavior.

## Not here (yet)

- `rowPinningDisplayMode` values `"sticky"` and `"select-sticky"` (rows that stick in place); use `"top-and-bottom"` or `"select-top"`.
- `enableColumnDragging` as a separate switch.
- MRT's `enableRowDragging` works through `DataTableDndProvider` and `onRowDragEnd` here; see [Row dragging](/docs/guides/row-dragging).
- MUI theming: the table uses your shadcn/ui components and theme instead.

## Related

- [Updating](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/updating): shadcn add copies this block's source into your project — after that, the code is yours, and upstream releases don't reach it automatically.
- [Part props (slotProps)](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/slot-props): Every part of the table — the scroll surface, rows, cells, toolbars, the search box, edit fields and more — accepts extra props through the slotProps option.
- [State management](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/state): The data table keeps all of its state in TanStack Table's store: the standard table state (sorting, filters, selection…) and its own UI state (density, editing, filter modes…).
