# Table instance

`useDataTable` returns the standard TanStack table instance with three additions: the table's UI state in `table.getState()` (density, editing, filter modes…), methods to change it on `table` itself, and the resolved options and DOM refs on **`table.dataTable`**.

```tsx
table.beginCreate() // open the create-row form
table.setDensity("compact")
const density = table.getState().density
const isLoading = table.dataTable.isLoading
table.dataTable.refs.searchInputRef.current?.focus()
```

## Methods

| Method | Type | Default | Description |
| --- | --- | --- | --- |
| `setDensity` | `React.Dispatch<React.SetStateAction<Density>>` |  | Updates `density`. |
| `setIsFullscreen` | `React.Dispatch<React.SetStateAction<boolean>>` |  | Updates `isFullscreen`. |
| `setShowColumnFilters` | `React.Dispatch<React.SetStateAction<boolean>>` |  | Updates `showColumnFilters`. |
| `setShowGlobalFilter` | `React.Dispatch<React.SetStateAction<boolean>>` |  | Open or close the global search box. |
| `setColumnFilterMode` | `(columnId: string, mode: FilterMode) => void` |  | Switch a column's filter mode (resets the value when it becomes invalid). |
| `setGlobalFilterMode` | `(mode: GlobalFilterMode) => void` |  | Updates `globalFilterMode`. |
| `setAdvancedFilter` | `React.Dispatch<React.SetStateAction<AdvancedFilterGroup>>` |  | Updates `advancedFilter`. |
| `setShowAdvancedFilterPanel` | `React.Dispatch<React.SetStateAction<boolean>>` |  | Updates `showAdvancedFilterPanel`. |
| `autoSizeColumn` | `(columnId: string) => void` |  | Resize a single column to fit its widest visible value (header + data). |
| `autoSizeAllColumns` | `() => void` |  | Auto-size every resizable visible column. |
| `setEditingCell` | `React.Dispatch<React.SetStateAction<EditingCell \| null>>` |  | Updates `editingCell`. |
| `setRowDraftValue` | `(columnId: string, value: unknown) => void` |  | Updates `rowDraftValue`. |
| `beginRowEdit` | `(row: DataTableRow<TData>) => void` |  | Enter row/modal editing for a row, seeding the draft from its values. |
| `beginCreate` | `() => void` |  | Open the create form, seeding the draft from `createRowDefaults`. |
| `cancelEdit` | `() => void` |  | Exit any editing/creating state, discarding the draft. |

## `table.dataTable`

| Member | Type | Default | Description |
| --- | --- | --- | --- |
| `localization` | `DataTableLocalization` |  | Text for every label, message and screen-reader string. Partial: missing keys fall back to English (or to `DataTableConfigProvider`). Install a locale item for a full language. |
| `icons` | `DataTableIcons` |  | Override any subset of the table's icons. |
| `filterFns` | `Record<string, DataTableFilterFn<TData>>` |  | The consumer's own filter functions, by name. |
| `columnFilterModeOptions` | `FilterMode[] \| undefined` |  | Table-wide filter-mode menu modes, if restricted. |
| `globalFilterModeOptions` | `GlobalFilterMode[]` |  | The global search mode menu's modes. |
| `enableGlobalFilter` | `boolean` |  | Show the expandable global search in the toolbar. Default true. |
| `enableGlobalFilterModes` | `boolean` |  | Show the global search mode menu (fuzzy/contains/…). Default true. |
| `enableAdvancedFilter` | `boolean` |  | Compound AND/OR filter panel (independent of, and additive to, the per-column filters and global search). |
| `isLoading` | `boolean` |  | Show the loading affordances (progress bar; skeletons when empty; a dimming overlay over existing rows). Toggle each independently below. |
| `isSaving` | `boolean` |  | Show the progress bar for an in-flight save/mutation. Defaults the progress bar on without replacing rows with skeletons. |
| `showProgressBars` | `boolean` |  | Show the top progress bar. Default: `isLoading \|\| isSaving`. |
| `showSkeletons` | `boolean` |  | Show skeleton rows while the body is empty. Default: `isLoading`. Passing `true` also covers rows already shown with skeletons (e.g. while refetching), instead of dimming them. |
| `showSkeletonsOverRows` | `boolean` |  | Whether skeletons also cover rows already shown (`showSkeletons: true` was passed explicitly). |
| `showLoadingOverlay` | `boolean` |  | Dim existing rows with an overlay while loading. Default: `isLoading`. |
| `enableFacetedValues` | `boolean` |  | Compute faceted unique values / min-max (auto select options + range bounds). Default true; disable to skip the faceted row models. |
| `enableColumnActions` | `boolean` |  | Shows the column-actions menu in each header (sort, filter, pin, hide, group…). Default `true`. |
| `enableColumnFilters` | `boolean` |  | Whether per-column filters are on. |
| `enableColumnFilterModes` | `boolean` |  | Show the filter-mode menu adornment on filter fields. Default true. |
| `enableFilterMatchHighlighting` | `boolean` |  | Highlight matched substrings in cells. Default true. |
| `enableColumnOrdering` | `boolean` |  | Drag-and-drop column reordering (adds a grip to each header). |
| `enableColumnPinning` | `boolean` |  | Column pinning (left/right) via the column-actions menu + sticky columns. |
| `enableColumnResizing` | `boolean` |  | Column resizing via an edge drag handle. |
| `enableColumnAutosize` | `boolean` |  | Double-clicking a column's resize handle auto-sizes it to fit its widest value. Defaults to `enableColumnResizing`. When off, double-click resets the column to its default size instead. |
| `enableRowOrdering` | `boolean` |  | Drag-and-drop row reordering (adds a drag-handle column). |
| `enableRowPinning` | `boolean` |  | Row pinning (top) via a pin toggle in the row-number column. |
| `enableRowNumbers` | `boolean` |  | Adds a leading row-number column. |
| `rowNumberMode` | `"static" \| "original"` |  | "static" tracks the current view (page-aware); "original" uses source index. |
| `onRowOrderChange` | `(activeRowId: string, overRowId: string) => void` |  | Called on a row drag-and-drop reorder; the consumer reorders its data. |
| `enableGrouping` | `boolean` |  | Row grouping (group-by menu + drop-to-group zone + aggregated group rows). |
| `enableExpanding` | `boolean` |  | Row expansion (tree sub-rows and/or detail panels). Auto-on with grouping or when `renderDetailPanel`/`getSubRows` is provided. |
| `enableStickyFooter` | `boolean` |  | Pin the footer (aggregation/footer cells) to the bottom of the surface. Default false. |
| `enableTableHead` | `boolean` |  | Whether the header rows render. |
| `enableTableFooter` | `boolean` |  | Whether the footer rows render (when columns define footers). |
| `enableExpandAll` | `boolean` |  | Whether the expand column's header toggles every row. |
| `renderDetailPanel` | `(props: { row: DataTableRow<TData> table: DataTableInstance<TData> }) => React.ReactNode` |  | Render an expanding detail panel for each row. |
| `enableEditing` | `boolean` |  | Whether editing is on (a per-row `enableEditing` function counts). |
| `displayColumnDefOptions` | `\| Partial< Record<DisplayColumnId, Partial<DataTableColumnDef<TData, unknown>>> > \| undefined` |  | Overrides for the columns the table adds itself, by id. A new object re-renders the rows, so memoize it when you pass functions. |
| `defaultDisplayColumn` | `Partial<DataTableColumnDef<TData, unknown>> \| undefined` |  | Overrides for every column the table adds itself. |
| `getCanEditRow` | `(row: DataTableRow<TData>) => boolean` |  | Whether a row can be edited: the `enableEditing` function's answer, or `enableEditing` itself. |
| `editDisplayMode` | `EditDisplayMode` |  | How edits are surfaced. Default "cell". |
| `createDisplayMode` | `CreateDisplayMode` |  | How the create form is surfaced, independent of `editDisplayMode`: `"modal"` (dialog, default), `"row"` (an inline editable row at the top of the table), or `"custom"` (you render it from `isCreating` + `rowDraft`). |
| `cancelEditing` | `() => void` |  | Cancel as the user does: calls `onEditingRowCancel` / `onCreatingRowCancel`, then `cancelEdit`. |
| `onEditingRowCancel` | `(props: { row: DataTableRow<TData> table: DataTableInstance<TData> }) => void` |  | Called when the user cancels a row edit (Cancel, closing the dialog). |
| `onCreatingRowCancel` | `(props: { table: DataTableInstance<TData> }) => void` |  | Called when the user cancels the create form. |
| `renderEditRowDialogContent` | `( props: EditDialogContentProps<TData> & { row: DataTableRow<TData> } ) => React.ReactNode` |  | Replace the edit dialog's content. You get the built-in fields as `internalEditComponents`, plus `save()` / `cancel()`. |
| `renderCreateRowDialogContent` | `( props: EditDialogContentProps<TData> ) => React.ReactNode` |  | Replace the create dialog's content (same props, without `row`). |
| `positionCreatingRow` | `"top" \| "bottom" \| number` |  | Where the inline create row (`createDisplayMode: "row"`) appears: `"top"` (default), `"bottom"`, or a row index on the current page to insert it before (with row virtualization an index means `"top"`). |
| `enableClickToCopy` | `ClickToCopyOption<TData>` |  | Copy cells on click (`true`), from the cell menu (`"context-menu"`), or decide per cell with a function. Per-column override via meta. |
| `enableCellActions` | `boolean \| ((cell: DataTableCell<TData, unknown>) => boolean)` |  | A right-click menu on each cell with built-in Copy (when click-to-copy is on) and Edit (when the cell is editable) items, or a function deciding per cell. `renderCellActionMenuItems` customizes it. Default false. |
| `onEditingCellSave` | `(props: { row: DataTableRow<TData> column: DataTableColumn<TData, unknown> value: unknown table: DataTableInstance<TData> }) => void` |  | Called when a cell edit is committed (cell and table editing) with the new `value`. Persist it; the table does not change `data` itself. |
| `onEditingRowSave` | `(props: { row: DataTableRow<TData> values: Record<string, unknown> table: DataTableInstance<TData> exit: () => void }) => void` |  | Called when a row edit is saved (row and modal editing) with the edited `values`. Call `exit()` to leave editing, e.g. after the save succeeds. |
| `onCreatingRowSave` | `(props: { values: Record<string, unknown> table: DataTableInstance<TData> exit: () => void }) => void` |  | Called when the new-row editor is saved with the row's `values`. Call `exit()` to close it. |
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
| `refs` | `DataTableRefs` |  | DOM refs to the table's structural elements (populated after mount). |
| `enableRowVirtualization` | `boolean` |  | Virtualize body rows for large datasets (recommended past ~100 rows). The table surface becomes the scroll container — give it a bounded height via `className`/`style` (defaults to `max-h-[600px]`). Disables row DnD. |
| `enableColumnVirtualization` | `boolean` |  | Virtualize columns for very wide tables. Applies fixed column widths; works with column pinning (pinned columns stay rendered), column ordering and grouped headers. |
| `estimateRowHeight` | `number` |  | Estimated row height (px) for the virtualizer. Default 52. |
| `virtualOverscan` | `number` |  | Extra rows rendered above/below the viewport. Default 8. |
| `rowHeight` | `number` |  | Flat height (px) applied to every row. |
| `getRowHeight` | `(row: DataTableRow<TData>) => number \| "auto" \| null` |  | Per-row height: a px number, `"auto"` (wrap + grow), or `null` for default. |
| `rowVirtualizerOptions` | `RowVirtualizerOptions<TData>` |  | Partial `@tanstack/react-virtual` options merged into the row virtualizer (overrides the built-in `count`/`estimateSize`/`overscan`/`measureElement`). Accepts an object or a `({ table }) => options` function. |
| `columnVirtualizerOptions` | `ColumnVirtualizerOptions<TData>` |  | Partial `@tanstack/react-virtual` options merged into the column virtualizer. Accepts an object or a `({ table }) => options` function. |
| `rowVirtualizerInstanceRef` | `React.RefObject<DataTableRowVirtualizer \| null>` |  | Ref populated with the row `Virtualizer` instance for imperative control (e.g. `scrollToIndex`). Only set when `enableRowVirtualization`. |
| `columnVirtualizerInstanceRef` | `React.RefObject<DataTableColumnVirtualizer \| null>` |  | Ref populated with the column `Virtualizer` instance. Only set when `enableColumnVirtualization`. |
| `enableStickyHeader` | `boolean` |  | Pin the header rows to the top of the scrollable surface. Also gives the surface a default viewport-bound max-height (`clamp(350px, 100dvh - 200px, 9999px)`) so tall content scrolls internally; override the bound with `slotProps.surface`. Default true. |
| `enablePagination` | `boolean` |  | Splits rows into pages with pagination controls. Default `true`; turn it off for virtualization or infinite scroll. |
| `enableInfiniteScroll` | `boolean` |  | Load more rows as the user scrolls near the bottom (auto-hides the pager). |
| `onLoadMore` | `() => void` |  | Called when the sentinel nears the viewport and more rows can be loaded. |
| `hasNextPage` | `boolean` |  | Consumer flag: more rows exist to load. |
| `isFetchingNextPage` | `boolean` |  | Consumer flag: a load is currently in flight. |
| `infiniteScrollThreshold` | `number` |  | Distance (px) from the bottom at which to prefetch. |
| `positionPagination` | `"top" \| "bottom" \| "both" \| "none"` |  | Where the pagination controls render. Default "bottom". "none" keeps pagination active but hides the controls. |
| `paginationDisplayMode` | `PaginationDisplayMode` |  | Pagination control style: `"default"` (range label + first/prev/next/last buttons), `"pages"` (numbered page buttons), or `"custom"` (render your own via `renderBottomToolbarCustomActions`). Default "default". |
| `pageSizeOptions` | `number[]` |  | Choices in the rows-per-page select. |
| `slotProps` | `DataTableSlots<TData> \| undefined` |  | Props for the table's parts; see the `slotProps` option. |
| `columnFilterDisplayMode` | `ColumnFilterDisplayMode` |  | Where column filter inputs live: `"subheader"` (a filter row under the header, default), `"popover"` (per-column popovers opened from the column header), or `"custom"` (you render them). |
| `positionGlobalFilter` | `"left" \| "right" \| "none"` |  | Which toolbar region the global search renders in. Default "right" (the internal-actions cluster). "left" places it next to the title/actions; "none" hides it (same as `enableGlobalFilter: false`). |
| `positionToolbarAlertBanner` | `"top" \| "bottom" \| "none"` |  | Where the row-selection alert banner renders. Default "top". |
| `positionToolbarDropZone` | `"top" \| "bottom" \| "both" \| "none"` |  | Where the group-by drop zone renders (grouping only). Default "top". |
| `enableRowSelection` | `boolean` |  | Whether rows can be selected. |
| `enableBatchRowSelection` | `boolean` |  | Shift-click a row's checkbox to select or clear the range since the last click. |
| `enableTopToolbar` | `boolean` |  | Shows the toolbar above the table (title, search, filters, view options). Default `true`. |
| `enableBottomToolbar` | `boolean` |  | Shows the toolbar below the table (pagination, custom actions). Default `true`. |
| `enableDensityToggle` | `boolean` |  | Show the density toggle in the toolbar. Default true. |
| `enableFullscreenToggle` | `boolean` |  | Show the full-screen toggle in the toolbar. Default true. |
| `enableToolbarInternalActions` | `boolean` |  | Show the toolbar's internal icon-action cluster (search, filters, column visibility, export, density, full screen). Default true. Hides the whole cluster at once; use the per-item flags for finer control. |
| `enableKeyboardNavigation` | `boolean` |  | Cell keyboard navigation with a single Tab stop: arrow keys, Home/End, PageUp/PageDown, Enter or F2 to activate a cell, Ctrl+C to copy it. Also makes the table an ARIA grid. Default `true`. |
| `title` | `React.ReactNode` |  | Heading shown at the start of the top toolbar. |
| `renderTopToolbarCustomActions` | `( props: DataTableSlotProps<TData> ) => React.ReactNode` |  | Custom content rendered in the top toolbar's left region (next to the title), e.g. bulk-action buttons. |
| `renderTopToolbar` | `(props: DataTableSlotProps<TData>) => React.ReactNode` |  | Replace the entire top toolbar with custom content. |
| `renderBottomToolbar` | `(props: DataTableSlotProps<TData>) => React.ReactNode` |  | Replace the entire bottom toolbar (pagination region) with custom content. |
| `renderToolbarInternalActions` | `( props: DataTableSlotProps<TData> ) => React.ReactNode` |  | Replace the top toolbar's internal icon-action cluster with custom content. |
| `renderBottomToolbarCustomActions` | `( props: DataTableSlotProps<TData> ) => React.ReactNode` |  | Custom content rendered in the bottom toolbar's left region (next to pagination), e.g. summary text or actions. |
| `renderCaption` | `(props: DataTableSlotProps<TData>) => React.ReactNode` |  | Render a `<caption>` for the table (e.g. an accessible summary). |
| `renderEmpty` | `(props: DataTableSlotProps<TData>) => React.ReactNode` |  | Content shown when there are no rows. Defaults to `localization.noRecordsToDisplay`. |

> **Everything else is TanStack:** All standard instance methods — `getState`, `getRowModel`, `getColumn`,
>   `setPageIndex`, `getFilteredRowModel`, `resetSorting`, … — are available
>   directly on `table` as usual.
