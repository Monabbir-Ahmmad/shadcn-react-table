# Graph Report - .  (2026-06-14)

## Corpus Check
- Corpus is ~30,777 words - fits in a single context window. You may not need a graph.

## Summary
- 207 nodes · 212 edges · 46 communities (17 shown, 29 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.83)
- Token cost: 257,249 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Feature Set & Roadmap|Feature Set & Roadmap]]
- [[_COMMUNITY_Core Render & Injected Columns|Core Render & Injected Columns]]
- [[_COMMUNITY_Filter Row & Variants|Filter Row & Variants]]
- [[_COMMUNITY_Demo App & Monorepo Wiring|Demo App & Monorepo Wiring]]
- [[_COMMUNITY_shadcn Primitives & Styling|shadcn Primitives & Styling]]
- [[_COMMUNITY_Header, Actions & Editing|Header, Actions & Editing]]
- [[_COMMUNITY_Cell Rendering & Highlighting|Cell Rendering & Highlighting]]
- [[_COMMUNITY_App Shell & Theming|App Shell & Theming]]
- [[_COMMUNITY_Root & Web Config|Root & Web Config]]
- [[_COMMUNITY_Toolbar Controls|Toolbar Controls]]
- [[_COMMUNITY_Workspace Packages & Build|Workspace Packages & Build]]
- [[_COMMUNITY_Glassmorphic Menu Primitives|Glassmorphic Menu Primitives]]
- [[_COMMUNITY_CSV  Excel Export|CSV / Excel Export]]
- [[_COMMUNITY_TypeScript Config Presets|TypeScript Config Presets]]
- [[_COMMUNITY_Column Pinning & Resizing Styles|Column Pinning & Resizing Styles]]
- [[_COMMUNITY_Input Primitives|Input Primitives]]
- [[_COMMUNITY_CommandDialog|CommandDialog]]
- [[_COMMUNITY_AGENTS.md Next.js Agent Rules|AGENTS.md Next.js Agent Rules]]
- [[_COMMUNITY_Column Actions Menu|Column Actions Menu]]
- [[_COMMUNITY_Density (3-level cycle)|Density (3-level cycle)]]
- [[_COMMUNITY_Keyboard Cell Navigation|Keyboard Cell Navigation]]
- [[_COMMUNITY_Localization (i18n string table)|Localization (i18n string table)]]
- [[_COMMUNITY_Pagination + Range Label|Pagination + Range Label]]
- [[_COMMUNITY_Row Selection (multi + single)|Row Selection (multi + single)]]
- [[_COMMUNITY_Top Toolbar + Alert Banner + Drop-to-Group Zone|Top Toolbar + Alert Banner + Drop-to-Group Zone]]
- [[_COMMUNITY_Checkbox|Checkbox]]
- [[_COMMUNITY_Command|Command]]
- [[_COMMUNITY_getColumnSizeVars|getColumnSizeVars]]
- [[_COMMUNITY_getColumnWidthStyle|getColumnWidthStyle]]
- [[_COMMUNITY_ExportOptions|ExportOptions]]
- [[_COMMUNITY_ExportScope|ExportScope]]
- [[_COMMUNITY_IconComponent|IconComponent]]
- [[_COMMUNITY_CellEvent|CellEvent]]
- [[_COMMUNITY_DataTableFilterOption|DataTableFilterOption]]
- [[_COMMUNITY_DataTableSlotProps|DataTableSlotProps]]
- [[_COMMUNITY_Density|Density]]
- [[_COMMUNITY_EditDisplayMode|EditDisplayMode]]
- [[_COMMUNITY_EditingCell|EditingCell]]
- [[_COMMUNITY_EditVariant|EditVariant]]
- [[_COMMUNITY_RowEvent|RowEvent]]
- [[_COMMUNITY_@workspaceeslint-config|@workspace/eslint-config]]
- [[_COMMUNITY_OrgNode|OrgNode]]
- [[_COMMUNITY_User|User]]
- [[_COMMUNITY_Graphify pre-tool hook|Graphify pre-tool hook]]
- [[_COMMUNITY_@workspacetypescript-config|@workspace/typescript-config]]

## God Nodes (most connected - your core abstractions)
1. `useDataTable` - 16 edges
2. `DataTable` - 12 edges
3. `8-Phase Roadmap` - 9 edges
4. `cn-table data-table README` - 9 edges
5. `FilterField` - 9 edges
6. `DataTableConfig` - 8 edges
7. `EXAMPLES registry` - 8 edges
8. `useDataTable hook` - 7 edges
9. `mrt-shadcn Complete Plan` - 6 edges
10. `Button` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Turborepo task pipeline` --references--> `web app workspace`  [INFERRED]
  turbo.json → apps/web/package.json
- `Root tsconfig` --references--> `Shared base ESLint config`  [INFERRED]
  tsconfig.json → packages/eslint-config/base.js
- `Web tsconfig (path aliases)` --conceptually_related_to--> `Root tsconfig`  [INFERRED]
  apps/web/tsconfig.json → tsconfig.json
- `Root ESLint config` --conceptually_related_to--> `Web ESLint config (nextJsConfig)`  [INFERRED]
  .eslintrc.js → apps/web/eslint.config.js
- `Badge` --semantically_similar_to--> `Button`  [INFERRED] [semantically similar]
  packages/ui/src/components/badge.tsx → packages/ui/src/components/button.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Registry distribution stack** — cn_table_shadcn_registry, cn_table_tailwind_v4, cn_table_token_theming, cn_table_registry_granularity [INFERRED 0.85]
- **Core DataTable runtime (hook + component + TanStack)** — datatable_readme_usedatatable, datatable_readme_datatable_component, cn_table_tanstack_table_v8, datatable_readme_cntable_namespace [EXTRACTED 1.00]
- **Examples demo render flow: Page -> ExamplesBrowser -> registry renders DataTable** — app_page_page, examples_browser_examplesbrowser, registry_examples, ui_components_datatable [INFERRED 0.85]
- **User data pipeline: makeUsers produces User rows consumed by userColumns and useDataTable examples** — example_data_makeusers, example_data_user, columns_usercolumns, registry_examples [INFERRED 0.85]
- **ESLint config inheritance chain: web config -> nextJsConfig -> base config** — eslint_config_web, next_nextjsconfig, base_config [INFERRED 0.95]
- **Glassmorphic translucent menu surfaces** — components_dropdown_menu_dropdownmenucontent, components_dropdown_menu_dropdownmenusubcontent, components_context_menu_contextmenucontent, components_context_menu_contextmenusubcontent [INFERRED 0.85]
- **cva variant-driven components** — components_badge_badgevariants, components_button_buttonvariants, components_input_group_inputgroupbutton [INFERRED 0.75]
- **tsconfig extends chain from base** — typescript_config_base, typescript_config_react_library, ui_tsconfig [INFERRED 0.95]
- **Filter-row variant fields (edit a column filter value)** — data_table_data_table_filter_variants_textfilterfield, data_table_data_table_filter_variants_numberfilterfield, data_table_data_table_filter_variants_selectfilterfield, data_table_data_table_filter_variants_multiselectfilterfield, data_table_data_table_filter_variants_checkboxfilterfield, data_table_data_table_filter_variants_rangesliderfilterfield, data_table_data_table_filter_variants_datefilterfield, data_table_data_table_filter_variants_daterangefilterfield [INFERRED 0.85]
- **Inline cell/row/modal editing pipeline** — data_table_data_table_edit_cell_datatablebodycellcontent, data_table_data_table_edit_field_datatableeditfield, data_table_data_table_edit_modal_datatableeditmodal [INFERRED 0.85]
- **Column header + per-column actions menu** — data_table_data_table_column_header_datatablecolumnheader, data_table_data_table_column_actions_datatablecolumnactions, data_table_data_table_column_filter_datatablecolumnfilter [INFERRED 0.85]
- **Auto-injected display column factories** — data_table_selection_column_createselectioncolumn, data_table_display_columns_createrownumbercolumn, data_table_data_table_row_actions_createrowactionscolumn [INFERRED 0.85]
- **Core trio: useDataTable + DataTable + types contracts** — data_table_use_data_table_usedatatable, data_table_data_table_datatable, data_table_types_datatableconfig [INFERRED 0.85]
- **Dynamic filter engine** — data_table_filter_fns_createdynamicfilterfn, data_table_filter_fns_createglobalfilterfn, data_table_filter_fns_mode_fns [INFERRED 0.85]

## Communities (46 total, 29 thin omitted)

### Community 0 - "Feature Set & Roadmap"
Cohesion: 0.07
Nodes (34): Click-to-Copy, Column Filtering (row, modes, variants), Column & Row Ordering (DnD), Column Pinning / Freezing, Column Resizing, @dnd-kit (DnD ordering), Editing Modes (cell/row/table/modal/custom), CSV / Excel Export (+26 more)

### Community 1 - "Core Render & Injected Columns"
Cohesion: 0.11
Nodes (26): DataTable, DataTableBodyRow, FilterFieldProps, DataTableDropToGroupZone, DataTablePagination, createRowActionsColumn, DataTableAlertBanner, createExpandColumn (+18 more)

### Community 2 - "Filter Row & Variants"
Cohesion: 0.12
Nodes (22): DataTableColumnFilter, FilterField, DataTableFilterModeMenu, getEffectiveMode, CheckboxFilterField, ClearableInput, DateFilterField, DateRangeFilterField (+14 more)

### Community 3 - "Demo App & Monorepo Wiring"
Cohesion: 0.18
Nodes (15): shadcn components.json config, orgData (tree fixture), OrgNode data shape, User data shape, userColumns, makeUsers, Next.js config (transpilePackages), cn-table root workspace (+7 more)

### Community 4 - "shadcn Primitives & Styling"
Cohesion: 0.18
Nodes (13): Badge, badgeVariants, Button, buttonVariants, Calendar, CalendarDayButton, DialogContent, InputGroupButton (+5 more)

### Community 5 - "Header, Actions & Editing"
Cohesion: 0.27
Nodes (11): ClickToCopy, DataTableColumnActions, getColumnLabel, DataTableColumnHeader, SortIndicator, DataTableBodyCellContent, isColumnEditable, LocalDraftEditor (+3 more)

### Community 6 - "Cell Rendering & Highlighting"
Cohesion: 0.25
Nodes (8): renderBodyCell, renderCellContent, resolveHighlightQuery, SUBSTRING_MODES, Highlight, SelectionCheckbox, createSelectionColumn, cn

### Community 7 - "App Shell & Theming"
Cohesion: 0.29
Nodes (7): RootLayout, Page, ExamplesBrowser, ExampleDef type, ThemeHotkey (press d), ThemeProvider, ThemeToggle

### Community 8 - "Root & Web Config"
Cohesion: 0.33
Nodes (6): Shared base ESLint config, Web ESLint config (nextJsConfig), Root ESLint config, nextJsConfig (eslint), Root tsconfig, Web tsconfig (path aliases)

### Community 9 - "Toolbar Controls"
Cohesion: 0.33
Nodes (6): DataTableDensityToggle, DataTableFilterToggle, DataTableFullscreenToggle, DataTableToolbar, DataTableViewOptions, DENSITY_ORDER

### Community 10 - "Workspace Packages & Build"
Cohesion: 0.33
Nodes (6): @workspace/eslint-config, react-internal config, @workspace/typescript-config, ui eslint.config.js, @workspace/ui package, ui postcss.config.mjs

### Community 11 - "Glassmorphic Menu Primitives"
Cohesion: 0.50
Nodes (5): ContextMenuContent, ContextMenuSubContent, DropdownMenuContent, DropdownMenuSubContent, glassmorphic translucent menu pattern

### Community 12 - "CSV / Excel Export"
Cohesion: 0.50
Nodes (5): DataTableExportMenu, exportToCsv, exportToExcel, getExportableColumns, toAOA

### Community 13 - "TypeScript Config Presets"
Cohesion: 0.40
Nodes (5): typescript-config base.json, typescript-config nextjs.json, typescript-config react-library.json, ui tsconfig.json, ui tsconfig.lint.json

### Community 14 - "Column Pinning & Resizing Styles"
Cohesion: 0.50
Nodes (4): getColumnPinningClass, getColumnPinningStyle, ColumnResizeHandle, DataTableHeadCell

### Community 15 - "Input Primitives"
Cohesion: 0.67
Nodes (3): CommandInput, InputGroup, Input

## Knowledge Gaps
- **89 isolated node(s):** `RootLayout`, `Page`, `User`, `OrgNode`, `ClickToCopy` (+84 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useDataTable` connect `Core Render & Injected Columns` to `Filter Row & Variants`, `Cell Rendering & Highlighting`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `TextFilterField` connect `Filter Row & Variants` to `Header, Actions & Editing`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `DataTable` connect `Core Render & Injected Columns` to `Toolbar Controls`, `Cell Rendering & Highlighting`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `DataTable` (e.g. with `DataTableDropToGroupZone` and `DataTableConfig`) actually correct?**
  _`DataTable` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `RootLayout`, `Page`, `User` to the rest of the system?**
  _92 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Feature Set & Roadmap` be split into smaller, more focused modules?**
  _Cohesion score 0.0748663101604278 - nodes in this community are weakly interconnected._
- **Should `Core Render & Injected Columns` be split into smaller, more focused modules?**
  _Cohesion score 0.11384615384615385 - nodes in this community are weakly interconnected._