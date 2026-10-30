# useDataTable options

`useDataTable(options)` accepts everything TanStack's [`TableOptions`](https://tanstack.com/table/latest) accepts (controlled `state`, `on*Change`, `manual*` flags, `getRowId`, `getSubRows`, `initialState`, …; column pinning in `state`/`initialState` keeps the `left`/`right` shape) **plus** the data-table options below. The table below is generated from the source types; defaults come from the hook implementation.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `initialState` | `Omit< NonNullable<CoreTableOptions<TData>["initialState"]>, "columnPinning" \| "pagination" > & { columnPinning?: DataTableColumnPinningState pagination?: Partial<PaginationState> }` |  | Initial values for uncontrolled table state. `pagination` may be partial (TanStack fills the rest from its defaults); column pinning uses `left` / `right`. |
| `state` | `Omit< NonNullable<CoreTableOptions<TData>["state"]>, "columnPinning" > & { columnPinning?: DataTableColumnPinningState }` |  | Controlled table state slices. Column pinning uses `left` / `right` (not TanStack v9's `start` / `end`). |
| `onColumnPinningChange` | `OnChangeFn<DataTableColumnPinningState>` |  | Called with an updater over the `left` / `right` pinning state when the user pins or unpins a column. |
| `stateSelector` | `(state: DataTableState) => unknown` |  | Re-render the component that calls `useDataTable` when the selected part of the table state changes (compared shallowly). By default it does not re-render on table state changes at all: `<DataTable>` subscribes to what it shows. Select what your own render reads, e.g. `(state) => state.rowSelection` for a "3 selected" label. |
| `localization` | `Partial<DataTableLocalization>` |  | Text for every label, message and screen-reader string. Partial: missing keys fall back to English (or to `DataTableConfigProvider`). Install a locale item for a full language. |
| `icons` | `Partial<DataTableIcons>` |  | Override any subset of the table's icons. |
| `isLoading` | `boolean` | `false` | Show the loading affordances (progress bar; skeletons when empty; a dimming overlay over existing rows). Toggle each independently below. |
| `isSaving` | `boolean` | `false` | Show the progress bar for an in-flight save/mutation. Defaults the progress bar on without replacing rows with skeletons. |
| `showProgressBars` | `boolean` |  | Show the top progress bar. Default: `isLoading \|\| isSaving`. |
| `showSkeletons` | `boolean` |  | Show skeleton rows while the body is empty. Default: `isLoading`. Passing `true` also covers rows already shown with skeletons (e.g. while refetching), instead of dimming them. |
| `showLoadingOverlay` | `boolean` |  | Dim existing rows with an overlay while loading. Default: `isLoading`. |
| `enableFacetedValues` | `boolean` | `true` | Compute faceted unique values / min-max (auto select options + range bounds). Default true; disable to skip the faceted row models. |
| `enableColumnActions` | `boolean` | `true` | Shows the column-actions menu in each header (sort, filter, pin, hide, group…). Default `true`. |
| `enableColumnFilterModes` | `boolean` | `true` | Show the filter-mode menu adornment on filter fields. Default true. |
| `enableFilterMatchHighlighting` | `boolean` | `true` | Highlight matched substrings in cells. Default true. |
| `enableGlobalFilter` | `boolean` | `true` | Show the expandable global search in the toolbar. Default true. |
| `enableGlobalFilterModes` | `boolean` | `true` | Show the global search mode menu (fuzzy/contains/…). Default true. |
| `filterFns` | `Record<string, DataTableFilterFn<TData>>` | `NO_FILTER_FNS` | Your own filter functions, by name (TanStack's filter function signature). Name one on a column's `filterFn`, as a column's `meta.filterMode`, or in `columnFilterModeOptions` / `globalFilterModeOptions` to offer it in the mode menus (labelled by `localization.filterModes[name]`, else the name). The names are read when the table is created; the functions stay current. |
| `sortFns` | `Record<string, DataTableSortFn<TData>>` |  | Your own sort functions, by name; a column uses one with `sortFn: "name"`. The names are read when the table is created; the functions stay current. |
| `aggregationFns` | `Record<string, DataTableAggregationFn<TData>>` |  | Your own aggregation functions, by name; a column uses one with `aggregationFn: "name"`. The names are read when the table is created; the functions stay current. |
| `columnFilterModeOptions` | `FilterMode[]` |  | Restrict (and order) every column's filter-mode menu to these modes — built-in ones (kept where the column's variant supports them) and custom `filterFns` names. A column's `meta.columnFilterModeOptions` wins. |
| `globalFilterModeOptions` | `GlobalFilterMode[]` | `GLOBAL_FILTER_MODES as GlobalFilterMode[]` | Restrict (and order) the global search mode menu: built-in modes and custom `filterFns` names. |
| `enableGlobalFilterRankedResults` | `boolean` | `false` | While the global search is in fuzzy mode, order rows by best match (most relevant first) until the user applies their own sort. Default false — MRT defaults this on, but the data table keeps it off so searching never silently reorders rows unless opted in. Ignored for non-fuzzy modes, when grouping or expanded, or under manual sorting/filtering. |
| `enableBatchRowSelection` | `boolean` | `true` | Shift-click a row's checkbox to select (or clear) every row since the last one clicked. Default true. |
| `displayColumnDefOptions` | `Partial< Record<DisplayColumnId, Partial<DataTableColumnDef<TData, unknown>>> >` |  | Column options for the columns the table adds itself (selection, expand, row actions, row number, row pin, drag handle), by id — e.g. `{ "cn-select": { size: 48 } }`. `meta` merges with the column's own. |
| `defaultDisplayColumn` | `Partial<DataTableColumnDef<TData, unknown>>` |  | Column options applied to every column the table adds itself, under `displayColumnDefOptions`. |
| `slotProps` | `DataTableSlots<TData>` |  | Props for the table's parts (cells, rows, toolbars, …), as an object or a function of the part's context. `className` is combined with the table's, `style` merged, event handlers both run; other props replace the table's. See `DataTableSlots`. |
| `pageSizeOptions` | `number[]` | `DEFAULT_PAGE_SIZE_OPTIONS` | Choices in the rows-per-page select. Default `[5, 10, 25, 50, 100]`. |
| `onDensityChange` | `(density: Density) => void` |  | Called whenever the density changes (toolbar toggle or programmatic). Set it with `initialState.density`, control it with `state.density`. |
| `onIsFullscreenChange` | `(isFullscreen: boolean) => void` |  | Called whenever the full-screen state is toggled. Control it with `state.isFullscreen`. |
| `onShowColumnFiltersChange` | `(showColumnFilters: boolean) => void` |  | Called whenever the filter row is shown or hidden. Set it with `initialState.showColumnFilters`, control it with `state.showColumnFilters`. |
| `onShowGlobalFilterChange` | `(showGlobalFilter: boolean) => void` |  | Called whenever the global search box opens or closes. Set it with `initialState.showGlobalFilter`, control it with `state.showGlobalFilter`. |
| `enableAdvancedFilter` | `boolean` | `false` | Enable the advanced filter panel: compound rules joined by AND/OR, applied on top of the per-column filters. A toolbar button opens the panel and shows the active-rule count. Default false. |
| `onAdvancedFilterChange` | `(filter: AdvancedFilterGroup) => void` |  | Called whenever the advanced filter changes. Set it with `initialState.advancedFilter`, control it with `state.advancedFilter`. |
| `onGlobalFilterModeChange` | `(mode: GlobalFilterMode) => void` |  | Called whenever the global search mode changes (default `"fuzzy"`). Set it with `initialState.globalFilterMode`, control it with `state.globalFilterMode`. |
| `onColumnFilterModesChange` | `(modes: Record<string, FilterMode>) => void` |  | Called when a column's filter mode changes, with every column's mode. Control it with `state.columnFilterModes`. |
| `onShowAdvancedFilterPanelChange` | `(open: boolean) => void` |  | Called when the advanced filter dialog opens or closes. Control it with `state.showAdvancedFilterPanel`. |
| `onEditingCellChange` | `(cell: EditingCell \| null) => void` |  | Called when cell editing starts or ends (`null`). Control it with `state.editingCell`. |
| `onEditingRowIdChange` | `(rowId: string \| null) => void` |  | Called when row editing starts or ends (`null`). Control it with `state.editingRowId`. |
| `onIsCreatingChange` | `(isCreating: boolean) => void` |  | Called when the new-row editor opens or closes. Control it with `state.isCreating`. |
| `onRowDraftChange` | `(draft: Record<string, unknown>) => void` |  | Called when the draft of the row being edited or created changes. Control it with `state.rowDraft`. |
| `enableColumnOrdering` | `boolean` | `false` | Drag-and-drop column reordering (adds a grip to each header). |
| `enableColumnPinning` | `boolean` | `false` | Column pinning (left/right) via the column-actions menu + sticky columns. |
| `enableColumnResizing` | `boolean` | `false` | Column resizing via an edge drag handle. |
| `enableColumnAutosize` | `boolean` |  | Double-clicking a column's resize handle auto-sizes it to fit its widest value. Defaults to `enableColumnResizing`. When off, double-click resets the column to its default size instead. |
| `enableRowOrdering` | `boolean` | `false` | Drag-and-drop row reordering (adds a drag-handle column). |
| `enableRowPinning` | `boolean` | `false` | Row pinning (top) via a pin toggle in the row-number column. |
| `enableRowNumbers` | `boolean` | `false` | Adds a leading row-number column. |
| `rowNumberMode` | `"static" \| "original"` | `"static"` | "static" tracks the current view (page-aware); "original" uses source index. |
| `enableRowDragging` | `boolean` | `false` | Adds a drag handle to each row for moving rows out of the table — to another table or a drop zone in the same `DataTableDndProvider` — without reordering inside it (combine with `enableRowOrdering` for both). Default false. |
| `onRowDragEnd` | `(props: { row: DataTableRow<TData> table: DataTableInstance<TData> over: RowDropTarget }) => void` |  | Called when a row is dropped on another table or a drop zone in the same `DataTableDndProvider`. Move the row in your data. |
| `onRowOrderChange` | `(activeRowId: string, overRowId: string) => void` |  | Called on a row drag-and-drop reorder; the consumer reorders its data. |
| `enableGrouping` | `boolean` | `false` | Row grouping (group-by menu + drop-to-group zone + aggregated group rows). |
| `enableExpanding` | `boolean` |  | Row expansion (tree sub-rows and/or detail panels). Auto-on with grouping or when `renderDetailPanel`/`getSubRows` is provided. |
| `enableStickyFooter` | `boolean` | `false` | Pin the footer (aggregation/footer cells) to the bottom of the surface. Default false. |
| `rowPinningDisplayMode` | `RowPinningDisplayMode` | `"top-and-bottom"` | Where pinned rows show and how rows get pinned (see {@link RowPinningDisplayMode}). Default `"top-and-bottom"`. |
| `enableTableHead` | `boolean` | `true` | Render the header rows. Default true; `false` shows the body only. |
| `enableTableFooter` | `boolean` | `true` | Render the footer rows when columns define a `footer`. Default true. |
| `enableExpandAll` | `boolean` | `true` | Show the expand-all toggle in the expand column's header. Default true. |
| `renderDetailPanel` | `(props: { row: DataTableRow<TData> table: DataTableInstance<TData> }) => React.ReactNode` |  | Render an expanding detail panel for each row. |
| `enableEditing` | `boolean \| ((row: DataTableRow<TData>) => boolean)` | `false` | Enable inline editing, or decide per row with a function (rows it returns false for can't be edited; creating rows is still allowed). |
| `editDisplayMode` | `EditDisplayMode` | `"cell"` | How edits are surfaced. Default "cell". |
| `createDisplayMode` | `CreateDisplayMode` | `"modal"` | How the create form is surfaced, independent of `editDisplayMode`: `"modal"` (dialog, default), `"row"` (an inline editable row at the top of the table), or `"custom"` (you render it from `isCreating` + `rowDraft`). |
| `createRowDefaults` | `Record<string, unknown>` |  | Default values for the create form, keyed by column id. |
| `enableClickToCopy` | `ClickToCopyOption<TData>` | `false` | Copy cells on click (`true`), from the cell menu (`"context-menu"`), or decide per cell with a function. Per-column override via meta. |
| `enableCellActions` | `boolean \| ((cell: DataTableCell<TData, unknown>) => boolean)` | `false` | A right-click menu on each cell with built-in Copy (when click-to-copy is on) and Edit (when the cell is editable) items, or a function deciding per cell. `renderCellActionMenuItems` customizes it. Default false. |
| `onEditingCellSave` | `(props: { row: DataTableRow<TData> column: DataTableColumn<TData, unknown> value: unknown table: DataTableInstance<TData> }) => void` |  | Called when a cell edit is committed (cell and table editing) with the new `value`. Persist it; the table does not change `data` itself. |
| `onEditingRowSave` | `(props: { row: DataTableRow<TData> values: Record<string, unknown> table: DataTableInstance<TData> exit: () => void }) => void` |  | Called when a row edit is saved (row and modal editing) with the edited `values`. Call `exit()` to leave editing, e.g. after the save succeeds. |
| `onCreatingRowSave` | `(props: { values: Record<string, unknown> table: DataTableInstance<TData> exit: () => void }) => void` |  | Called when the new-row editor is saved with the row's `values`. Call `exit()` to close it. |
| `onEditingRowCancel` | `(props: { row: DataTableRow<TData> table: DataTableInstance<TData> }) => void` |  | Called when the user cancels a row edit (Cancel, closing the dialog). |
| `onCreatingRowCancel` | `(props: { table: DataTableInstance<TData> }) => void` |  | Called when the user cancels the create form. |
| `renderEditRowDialogContent` | `( props: EditDialogContentProps<TData> & { row: DataTableRow<TData> } ) => React.ReactNode` |  | Replace the edit dialog's content. You get the built-in fields as `internalEditComponents`, plus `save()` / `cancel()`. |
| `renderCreateRowDialogContent` | `( props: EditDialogContentProps<TData> ) => React.ReactNode` |  | Replace the create dialog's content (same props, without `row`). |
| `positionCreatingRow` | `"top" \| "bottom" \| number` | `"top"` | Where the inline create row (`createDisplayMode: "row"`) appears: `"top"` (default), `"bottom"`, or a row index on the current page to insert it before (with row virtualization an index means `"top"`). |
| `renderRowActions` | `(props: { row: DataTableRow<TData> table: DataTableInstance<TData> }) => React.ReactNode` |  | Content of the row-actions column, replacing the default edit and menu buttons. |
| `renderCellActionMenuItems` | `(props: { cell: DataTableCell<TData, unknown> row: DataTableRow<TData> table: DataTableInstance<TData> /** The built-in items (Copy, Edit) the menu shows for this cell. */ internalMenuItems: React.ReactNode closeMenu: () => void }) => React.ReactNode` |  | The contents of the right-click menu on each cell (turns the menu on). Include `internalMenuItems` to keep the built-in Copy / Edit items. |
| `renderRowActionMenuItems` | `(props: { row: DataTableRow<TData> table: DataTableInstance<TData> /** The built-in items (Edit, when the row can be edited). */ internalMenuItems: React.ReactNode closeMenu: () => void }) => React.ReactNode` |  | Render a kebab menu in the row-actions column. Returns the menu items (e.g. `<DropdownMenuItem>`); injects the actions column automatically. While editing is on, the Edit action moves into this menu: include `internalMenuItems` to keep it. |
| `renderColumnActionsMenuItems` | `(props: { column: DataTableColumn<TData, unknown> table: DataTableInstance<TData> /** The built-in items (sort, filter, hide, group, pin). */ internalMenuItems: React.ReactNode closeMenu: () => void }) => React.ReactNode` |  | The contents of every column-actions menu. Return your items (e.g. `<DropdownMenuItem>`) with `internalMenuItems` where the built-in ones should go, or leave it out to replace them. |
| `renderColumnFilterModeMenuItems` | `(props: { column: DataTableColumn<TData, unknown> modes: FilterMode[] currentMode: FilterMode onSelect: (mode: FilterMode) => void table: DataTableInstance<TData> }) => React.ReactNode` |  | Replace the radio items in a column's filter-mode menu. Render your own items and call `onSelect(mode)` to switch; `modes` is the allowed set. |
| `renderGlobalFilterModeMenuItems` | `(props: { modes: GlobalFilterMode[] currentMode: GlobalFilterMode onSelect: (mode: GlobalFilterMode) => void table: DataTableInstance<TData> }) => React.ReactNode` |  | Replace the radio items in the global-search mode menu. Render your own items and call `onSelect(mode)` to switch; `modes` is the allowed set. |
| `onRowClick` | `(props: RowEvent<TData>) => void` |  | Fired when a body row is clicked / double-clicked. |
| `onRowDoubleClick` | `(props: RowEvent<TData>) => void` |  | Called when a row is double-clicked. Double-clicks on controls inside the row (edit, expand, pin…) are ignored. |
| `onCellClick` | `(props: CellEvent<TData>) => void` |  | Fired when a body cell is clicked / double-clicked. |
| `onCellDoubleClick` | `(props: CellEvent<TData>) => void` |  | Called when a cell is double-clicked. Double-clicks on controls inside the cell are ignored. |
| `enableRowVirtualization` | `boolean` | `false` | Virtualize body rows for large datasets (recommended past ~100 rows). The table surface becomes the scroll container — give it a bounded height via `className`/`style` (defaults to `max-h-[600px]`). Disables row DnD. |
| `enableColumnVirtualization` | `boolean` | `false` | Virtualize columns for very wide tables. Applies fixed column widths; works with column pinning (pinned columns stay rendered), column ordering and grouped headers. |
| `estimateRowHeight` | `number` | `52` | Estimated row height (px) for the virtualizer. Default 52. |
| `virtualOverscan` | `number` | `8` | Extra rows rendered above/below the viewport. Default 8. |
| `rowHeight` | `number` |  | Flat height (px) applied to every row. Overridden per-row by `getRowHeight`. Also seeds the virtualizer estimate. |
| `getRowHeight` | `(row: DataTableRow<TData>) => number \| "auto" \| null` |  | Per-row height. Return a px number to pin the row, `"auto"` to let it wrap and grow to fit its content (even with column resizing on), or `null` to fall back to `rowHeight` / the density default. Applies to data rows. |
| `rowVirtualizerOptions` | `RowVirtualizerOptions<TData>` |  | Partial `@tanstack/react-virtual` options merged into the row virtualizer (overrides the built-in `count`/`estimateSize`/`overscan`/`measureElement`). Accepts an object or a `({ table }) => options` function. |
| `columnVirtualizerOptions` | `ColumnVirtualizerOptions<TData>` |  | Partial `@tanstack/react-virtual` options merged into the column virtualizer. Accepts an object or a `({ table }) => options` function. |
| `rowVirtualizerInstanceRef` | `React.RefObject<DataTableRowVirtualizer \| null>` |  | Ref populated with the row `Virtualizer` instance for imperative control (e.g. `scrollToIndex`). Only set when `enableRowVirtualization`. |
| `columnVirtualizerInstanceRef` | `React.RefObject<DataTableColumnVirtualizer \| null>` |  | Ref populated with the column `Virtualizer` instance. Only set when `enableColumnVirtualization`. |
| `enableStickyHeader` | `boolean` | `true` | Pin the header rows to the top of the scrollable surface. Also gives the surface a default viewport-bound max-height (`clamp(350px, 100dvh - 200px, 9999px)`) so tall content scrolls internally; override the bound with `slotProps.surface`. Default true. |
| `enablePagination` | `boolean` | `true` | Splits rows into pages with pagination controls. Default `true`; turn it off for virtualization or infinite scroll. |
| `enableInfiniteScroll` | `boolean` | `false` | Load more rows as the user scrolls near the bottom (infinite append). When on, the pager is hidden and pagination is forced to a single growing page, so all appended rows render. Fully controlled: the table calls `onLoadMore` only when the bottom sentinel nears the viewport AND `hasNextPage` AND `!isFetchingNextPage`. Pairs directly with TanStack Query's `useInfiniteQuery` (`fetchNextPage`/`hasNextPage`/`isFetchingNextPage`). Default false. |
| `onLoadMore` | `() => void` |  | Called to request the next chunk. Should be stable (memoized) so the table doesn't re-trigger on every render. Append the result to `data`. |
| `hasNextPage` | `boolean` | `false` | Whether more rows remain to be loaded. Default false. |
| `isFetchingNextPage` | `boolean` | `false` | Whether a load is currently in flight (blocks re-triggering). Default false. |
| `infiniteScrollThreshold` | `number` | `200` | Distance in px from the bottom at which to prefetch. Default 200. |
| `positionPagination` | `"top" \| "bottom" \| "both" \| "none"` | `"bottom"` | Where the pagination controls render. Default "bottom". "none" keeps pagination active but hides the controls. |
| `paginationDisplayMode` | `PaginationDisplayMode` | `"default"` | Pagination control style: `"default"` (range label + first/prev/next/last buttons), `"pages"` (numbered page buttons), or `"custom"` (render your own via `renderBottomToolbarCustomActions`). Default "default". |
| `columnFilterDisplayMode` | `ColumnFilterDisplayMode` | `"subheader"` | Where column filter inputs live: `"subheader"` (a filter row under the header, default), `"popover"` (per-column popovers opened from the column header), or `"custom"` (you render them). |
| `positionGlobalFilter` | `"left" \| "right" \| "none"` | `"right"` | Which toolbar region the global search renders in. Default "right" (the internal-actions cluster). "left" places it next to the title/actions; "none" hides it (same as `enableGlobalFilter: false`). |
| `positionToolbarAlertBanner` | `"top" \| "bottom" \| "none"` | `"top"` | Where the row-selection alert banner renders. Default "top". |
| `positionToolbarDropZone` | `"top" \| "bottom" \| "both" \| "none"` | `"top"` | Where the group-by drop zone renders (grouping only). Default "top". |
| `positionActionsColumn` | `"first" \| "last"` | `"last"` | Position of the auto-injected row-actions column. Default "last". |
| `positionExpandColumn` | `"first" \| "last"` | `"first"` | Position of the auto-injected expand column (tree / detail panel). Default "first". |
| `selectAllMode` | `"page" \| "all"` | `"page"` | Select-all scope for the header checkbox: the current page ("page", default) or every row ("all"). |
| `enableSelectAll` | `boolean` | `true` | Show the select-all checkbox in the selection column header. Default true. |
| `enableTopToolbar` | `boolean` | `true` | Shows the toolbar above the table (title, search, filters, view options). Default `true`. |
| `enableBottomToolbar` | `boolean` | `true` | Shows the toolbar below the table (pagination, custom actions). Default `true`. |
| `enableDensityToggle` | `boolean` | `true` | Show the density toggle in the toolbar. Default true. |
| `enableFullscreenToggle` | `boolean` | `true` | Show the full-screen toggle in the toolbar. Default true. |
| `enableToolbarInternalActions` | `boolean` | `true` | Show the toolbar's internal icon-action cluster (search, filters, column visibility, export, density, full screen). Default true. Hides the whole cluster at once; use the per-item flags for finer control. |
| `enableKeyboardNavigation` | `boolean` | `true` | Cell keyboard navigation with a single Tab stop: arrow keys, Home/End, PageUp/PageDown, Enter or F2 to activate a cell, Ctrl+C to copy it. Also makes the table an ARIA grid. Default `true`. |
| `enableAnimations` | `boolean` | `true` | Animate the table: rows glide when their order changes, fade in and out when they enter or leave the data, detail panels open and close smoothly, and the sort arrow, selection checkboxes and selected count transition. Always off when the user prefers reduced motion. Retime it with the CSS variables `--dt-motion-duration`, `--dt-motion-duration-fast` and `--dt-motion-ease` on the table. |
| `title` | `React.ReactNode` |  | Heading shown at the start of the top toolbar. |
| `renderTopToolbarCustomActions` | `( props: DataTableSlotProps<TData> ) => React.ReactNode` |  | Custom content rendered in the top toolbar's left region (next to the title), e.g. bulk-action buttons. |
| `renderTopToolbar` | `(props: DataTableSlotProps<TData>) => React.ReactNode` |  | Replace the entire top toolbar with custom content. |
| `renderBottomToolbar` | `(props: DataTableSlotProps<TData>) => React.ReactNode` |  | Replace the entire bottom toolbar (pagination region) with custom content. |
| `renderToolbarInternalActions` | `( props: DataTableSlotProps<TData> ) => React.ReactNode` |  | Replace the top toolbar's internal icon-action cluster with custom content. |
| `renderBottomToolbarCustomActions` | `( props: DataTableSlotProps<TData> ) => React.ReactNode` |  | Custom content rendered in the bottom toolbar's left region (next to pagination), e.g. summary text or actions. |
| `renderCaption` | `(props: DataTableSlotProps<TData>) => React.ReactNode` |  | Render a `<caption>` for the table (e.g. an accessible summary). |
| `renderEmpty` | `(props: DataTableSlotProps<TData>) => React.ReactNode` |  | Content shown when there are no rows. Defaults to `localization.noRecordsToDisplay`. |

> **Pass-through options:** Options not listed here (e.g. `data`, `columns`, `state`, `manualPagination`, `rowCount`, `enableRowSelection`, `enableMultiSort`) are standard TanStack Table options and behave exactly as documented there.
