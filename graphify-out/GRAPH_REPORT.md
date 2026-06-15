# Graph Report - cn-table  (2026-06-15)

## Corpus Check
- 159 files · ~73,466 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1179 nodes · 2015 edges · 84 communities (72 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cb39c733`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Feature Set & Roadmap|Feature Set & Roadmap]]
- [[_COMMUNITY_Core Render & Injected Columns|Core Render & Injected Columns]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Demo App & Monorepo Wiring|Demo App & Monorepo Wiring]]
- [[_COMMUNITY_shadcn Primitives & Styling|shadcn Primitives & Styling]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Cell Rendering & Highlighting|Cell Rendering & Highlighting]]
- [[_COMMUNITY_App Shell & Theming|App Shell & Theming]]
- [[_COMMUNITY_Root & Web Config|Root & Web Config]]
- [[_COMMUNITY_Toolbar Controls|Toolbar Controls]]
- [[_COMMUNITY_Workspace Packages & Build|Workspace Packages & Build]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_CSV  Excel Export|CSV / Excel Export]]
- [[_COMMUNITY_TypeScript Config Presets|TypeScript Config Presets]]
- [[_COMMUNITY_Column Pinning & Resizing Styles|Column Pinning & Resizing Styles]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
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
- [[_COMMUNITY_Community 30|Community 30]]
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
- [[_COMMUNITY_pnpm-workspace.yaml|pnpm-workspace.yaml]]
- [[_COMMUNITY_Graphify pre-tool hook|Graphify pre-tool hook]]
- [[_COMMUNITY_@workspacetypescript-config|@workspace/typescript-config]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 142 edges
2. `useDataTable()` - 36 edges
3. `useUserColumns()` - 31 edges
4. `DataTableInstance` - 28 edges
5. `Button()` - 23 edges
6. `getColumnLabel()` - 23 edges
7. `Column filtering` - 16 edges
8. `Editing` - 16 edges
9. `compilerOptions` - 15 edges
10. `Usage` - 12 edges

## Surprising Connections (you probably didn't know these)
- `surfaceClassName (bounded scroll surface)` --semantically_similar_to--> `Server-side / Manual Mode`  [INFERRED] [semantically similar]
  apps/web/app/docs/api/data-table-props/page.mdx → packages/ui/src/components/data-table/README.md
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  apps/web/app/layout.tsx → packages/ui/src/lib/utils.ts
- `Swatch()` --calls--> `cn()`  [EXTRACTED]
  apps/web/components/theme-customizer.tsx → packages/ui/src/lib/utils.ts
- `Deploy Docs to GitHub Pages Workflow` --shares_data_with--> `tablecn Project Overview`  [INFERRED]
  .github/workflows/deploy-docs.yml → README.md
- `Callout()` --calls--> `cn()`  [EXTRACTED]
  apps/web/components/docs/callout.tsx → packages/ui/src/lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **CI Verification Pipeline (lint/typecheck/build)** — workflows_ci_workflow, pull_request_template_pr_checklist, contributing_contribution_flow [EXTRACTED 1.00]
- **data-table Public API Surface** — use_data_table_page_use_data_table_options, data_table_props_page_data_table_props, column_options_page_column_options, table_instance_page_table_instance [INFERRED 0.85]
- **tablecn Tech Stack** — readme_mrt_v3_parity, readme_tanstack_table_v8, readme_tailwind_v4, readme_shadcn_registry [EXTRACTED 1.00]
- **Edit display modes (cell, row, table, modal)** — editing_page_edit_display_mode, editing_page_on_edit_cell_save, editing_page_on_save_row, editing_page_on_create_row [EXTRACTED 0.90]
- **Column management features (order, pin, resize, visibility)** — column_ordering_page_column_ordering, column_pinning_page_column_pinning, column_resizing_page_column_resizing, column_visibility_page_column_visibility [INFERRED 0.85]
- **Filtering subsystem (column filters, filter modes, global search)** — column_filtering_page_column_filtering, filter_modes_page_filter_modes, global_search_page_global_search [EXTRACTED 0.90]
- **Server-side manual delegation flags** — server_side_page_manual_pagination, server_side_page_manual_sorting, server_side_page_manual_filtering [EXTRACTED 0.85]
- **Row-number column shared by numbers and pinning** — row_numbers_page_enable_row_numbers, row_numbers_page_row_number_mode, row_pinning_page_enable_row_pinning [EXTRACTED 0.85]
- **Options-in / instance-out core flow** — quick_start_page_use_data_table, quick_start_page_data_table_component, docs_page_cn_table [EXTRACTED 0.85]

## Communities (84 total, 12 thin omitted)

### Community 0 - "Feature Set & Roadmap"
Cohesion: 0.06
Nodes (63): DataTableConfigContext, DataTableConfigContextValue, DataTableConfigProvider(), useDataTableConfigContext(), DataTable(), DataTableFilterModeMenu(), createRowActionsColumn(), createExpandColumn() (+55 more)

### Community 1 - "Core Render & Injected Columns"
Cohesion: 0.08
Nodes (56): useControllableState(), useDataTable(), currency, dateFmt, DEPARTMENT_OPTIONS, ROLE_OPTIONS, STATUS_OPTIONS, STATUS_VARIANT (+48 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (41): Badge(), badgeVariants, Button(), buttonVariants, Calendar(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent() (+33 more)

### Community 3 - "Demo App & Monorepo Wiring"
Cohesion: 0.05
Nodes (43): dependencies, cmdk, date-fns, lucide-react, @mdx-js/loader, @mdx-js/react, @monabbir/tablecn, next (+35 more)

### Community 4 - "shadcn Primitives & Styling"
Cohesion: 0.09
Nodes (29): Skeleton(), Table(), TableBody(), TableCaption(), TableCell(), TableFooter(), TableHead(), TableHeader() (+21 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (36): devDependencies, prettier, prettier-plugin-tailwindcss, turbo, typescript, @workspace/eslint-config, @workspace/typescript-config, engines (+28 more)

### Community 6 - "Cell Rendering & Highlighting"
Cohesion: 0.06
Nodes (40): Next.js 16 Agent Rules, Column options, DataTable Props, surfaceClassName (bounded scroll surface), table.cnTable Instance Extension, DataTable Component, Feature flags (all opt-in unless noted), Notes (+32 more)

### Community 7 - "App Shell & Theming"
Cohesion: 0.18
Nodes (12): Select(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator() (+4 more)

### Community 8 - "Root & Web Config"
Cohesion: 0.18
Nodes (11): table.cnTable instance state, tablecn Introduction, Material React Table (MRT V3), TanStack Table v8, Controlled sorting, enableMultiSort option, Multi-column sorting, Per-column control (+3 more)

### Community 9 - "Toolbar Controls"
Cohesion: 0.09
Nodes (22): colMetaModule, columnOptions, dataTableProps, describe(), destructureDefaults(), DT, hookSf, iconDefaults (+14 more)

### Community 10 - "Workspace Packages & Build"
Cohesion: 0.09
Nodes (22): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-only-warn, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-turbo (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (23): dependencies, class-variance-authority, clsx, cmdk, date-fns, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (+15 more)

### Community 12 - "CSV / Excel Export"
Cohesion: 0.14
Nodes (20): CommandGroup(), Slider(), getColumnLabel(), DataTableColumnHeader(), CreateField(), LocalDraftEditor(), RowDraftEditor(), getEffectiveMode() (+12 more)

### Community 13 - "TypeScript Config Presets"
Cohesion: 0.13
Nodes (16): CalendarDayButton(), Checkbox(), ContextMenuCheckboxItem(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut() (+8 more)

### Community 14 - "Column Pinning & Resizing Styles"
Cohesion: 0.11
Nodes (16): ApiTable(), SectionKey, SECTIONS, Callout(), LABELS, STYLES, Variant, Example() (+8 more)

### Community 15 - "Community 15"
Cohesion: 0.05
Nodes (38): Column ordering, enableColumnOrdering, Initial order, initialState.columnOrder, Related, Column pinning, enableColumnPinning, Initial pins (+30 more)

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (12): useIconLibrary(), SiteHeader(), Accent, ACCENTS, BASE_COLORS, ColorPreset, FONTS, ICON_LIBS (+4 more)

### Community 17 - "AGENTS.md Next.js Agent Rules"
Cohesion: 0.10
Nodes (19): cssVars, dark, light, theme, highlight, highlight-foreground, dependencies, description (+11 more)

### Community 18 - "Column Actions Menu"
Cohesion: 0.10
Nodes (19): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+11 more)

### Community 19 - "Density (3-level cycle)"
Cohesion: 0.10
Nodes (19): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+11 more)

### Community 20 - "Keyboard Cell Navigation"
Cohesion: 0.05
Nodes (41): Cell actions, Click to copy, Column actions menu, ContextMenuItem, enableClickToCopy, Related, renderCellActionMenuItems, Usage (+33 more)

### Community 21 - "Localization (i18n string table)"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, incremental, isolatedModules, lib, module (+9 more)

### Community 22 - "Pagination + Range Label"
Cohesion: 0.16
Nodes (12): Add the component, Installation, Next, Prerequisites, shadcn CLI add command, shadcn registry distribution, Verify, Density and dark mode (+4 more)

### Community 23 - "Row Selection (multi + single)"
Cohesion: 0.22
Nodes (8): Completed (Phases 1–13), Conventions, Material React Table parity — roadmap, Phase 14 — Display modes `[M–L]`, Phase 15 — `rowPinningDisplayMode` `[L]`, Phase 16 — `enableGlobalFilterRankedResults` `[M]`, Phase 17 — `layoutMode: "grid" | "grid-no-grow"` + column `grow` `[XL]`, Planned (Phases 14–17)

### Community 24 - "Top Toolbar + Alert Banner + Drop-to-Group Zone"
Cohesion: 0.19
Nodes (11): Command(), CommandDialog(), CommandEmpty(), CommandInput(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut() (+3 more)

### Community 25 - "Checkbox"
Cohesion: 0.07
Nodes (25): enableRowOrdering option, onRowOrderChange callback, Related, Row ordering, enableMultiRowSelection option, enableRowSelection option, getRowId option, Related (+17 more)

### Community 26 - "Command"
Cohesion: 0.17
Nodes (12): cssVars, DEV_DEPENDENCIES, files, item, NPM_DEPENDENCIES, OUT, read(), registry (+4 more)

### Community 27 - "getColumnSizeVars"
Cohesion: 0.24
Nodes (8): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), SheetTrigger()

### Community 29 - "ExportOptions"
Cohesion: 0.08
Nodes (24): table.cnTable.beginCreate, Cell editing, Custom editor, editDisplayMode, meta.editVariant, Editing, enableEditing, Modal editing & creating (+16 more)

### Community 30 - "Community 30"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, tailwindcss, @tailwindcss/postcss, @turbo/gen, @types/node, @types/papaparse, @types/react (+4 more)

### Community 31 - "IconComponent"
Cohesion: 0.19
Nodes (9): Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle(), Label() (+1 more)

### Community 32 - "CellEvent"
Cohesion: 0.18
Nodes (10): compilerOptions, allowJs, jsx, module, moduleResolution, noEmit, plugins, display (+2 more)

### Community 33 - "DataTableFilterOption"
Cohesion: 0.24
Nodes (9): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+1 more)

### Community 34 - "DataTableSlotProps"
Cohesion: 0.22
Nodes (8): name, private, scripts, format, lint, typecheck, type, version

### Community 35 - "Density"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, paths, exclude, extends, include, @monabbir/tablecn/*

### Community 36 - "EditDisplayMode"
Cohesion: 0.22
Nodes (8): compilerOptions, paths, plugins, exclude, extends, include, @/*, @monabbir/tablecn/*

### Community 37 - "EditingCell"
Cohesion: 0.43
Nodes (3): config, nextJsConfig, config

### Community 38 - "EditVariant"
Cohesion: 0.29
Nodes (6): license, name, private, publishConfig, access, version

### Community 39 - "RowEvent"
Cohesion: 0.33
Nodes (5): compilerOptions, jsx, display, extends, $schema

### Community 40 - "@workspace/eslint-config"
Cohesion: 0.33
Nodes (6): exports, ./components/*, ./globals.css, ./hooks/*, ./lib/*, ./postcss.config

### Community 41 - "OrgNode"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, exclude, extends, include

### Community 42 - "User"
Cohesion: 0.29
Nodes (7): App-wide defaults, Custom icons, DataTableConfigProvider, Icon resolution precedence, icons option, Related, Remix Icon (default icons)

### Community 43 - "pnpm-workspace.yaml"
Cohesion: 0.40
Nodes (4): homepage, items, name, $schema

### Community 44 - "Graphify pre-tool hook"
Cohesion: 0.22
Nodes (8): enableRowNumbers option, Numbering mode, Related, rowNumberMode option, Row numbers, enableRowPinning option, Related, Row pinning

### Community 45 - "@workspace/typescript-config"
Cohesion: 0.67
Nodes (4): Contribution Flow (PR-only), Package Consumed as Source (no rebuild), Pull Request Template & Checklist, CI Workflow (lint/typecheck/build)

### Community 46 - "Community 46"
Cohesion: 0.40
Nodes (4): Event listeners, onCellClick / onCellDoubleClick, onRowClick / onRowDoubleClick, Related

### Community 47 - "Community 47"
Cohesion: 0.33
Nodes (5): enableExport, Export, exportFileName, Related, What gets exported

### Community 50 - "Community 50"
Cohesion: 0.33
Nodes (5): Detail panel, Positioning the expander, Related, renderDetailPanel, Usage

### Community 51 - "Community 51"
Cohesion: 0.29
Nodes (6): As a menu, Positioning the column, Related, renderRowActions option, Row actions, Usage

### Community 52 - "Community 52"
Cohesion: 0.40
Nodes (4): getSubRows option, Related, Tree data, Usage

### Community 58 - "Community 58"
Cohesion: 0.18
Nodes (9): Adding shadcn/ui components, Architecture, Commands, Consumption model: source, not built artifacts, Critical: Next.js version, graphify, Path aliases (apps/web), Shared config packages (+1 more)

### Community 59 - "Community 59"
Cohesion: 0.25
Nodes (7): ColumnDef columns, DataTable component, Quick start, Turning features on, useDataTable hook, Where to go next, useReactTable wrapper

### Community 60 - "Community 60"
Cohesion: 0.25
Nodes (7): manualFiltering flag, manualPagination flag, manualSorting flag, Related, Server pagination, Server-side data, Server sorting and filtering

### Community 61 - "Community 61"
Cohesion: 0.25
Nodes (7): App-wide defaults, columnDef.meta configuration, Columns, The component, The hook, The instance: `table.cnTable`, Usage

### Community 62 - "Community 62"
Cohesion: 0.33
Nodes (6): Localization, App-wide defaults, DataTableConfigProvider, localization option, paginationRange function entry, Related

### Community 63 - "Community 63"
Cohesion: 0.29
Nodes (6): Contributing to tablecn, Making a change, Prerequisites, Pull requests, Setup, Useful commands

### Community 64 - "Community 64"
Cohesion: 0.40
Nodes (4): How it works, Next steps, tablecn, Why tablecn

### Community 65 - "Community 65"
Cohesion: 0.50
Nodes (3): Checklist, Related issues, Summary

### Community 74 - "Community 74"
Cohesion: 0.29
Nodes (7): ContextMenu(), ContextMenuContent(), ContextMenuTrigger(), ClickToCopy(), DataTableBodyCellContent(), isColumnEditable(), DataTableEditField()

### Community 75 - "Community 75"
Cohesion: 0.33
Nodes (5): normalize(), MIME, OUT, resolveFile(), server

### Community 76 - "Community 76"
Cohesion: 0.22
Nodes (8): metadata, DocsMobileNav(), DocsPrevNext(), DocsSidebar(), docsFlatNav, docsNav, DocsNavGroup, DocsNavItem

### Community 77 - "Community 77"
Cohesion: 0.20
Nodes (7): geist, geistMono, notoSerif, raleway, RootLayout(), IconLibraryProvider(), ThemeProvider()

### Community 78 - "Community 78"
Cohesion: 0.31
Nodes (8): IconLibraryContext, IconLibraryContextValue, IconLibrary, lucideIcons, DEFAULT_PREFS, readPrefs(), ThemePrefs, writePrefs()

### Community 79 - "Community 79"
Cohesion: 0.50
Nodes (3): Available refs, Related, Table refs

### Community 80 - "Community 80"
Cohesion: 0.25
Nodes (6): Popover(), PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle(), PopoverTrigger()

### Community 81 - "Community 81"
Cohesion: 0.18
Nodes (10): Alert banner & drop zone, Custom actions, Internal actions (the icon cluster), Pagination placement, Related, Replacing a whole toolbar, Search placement, Showing / hiding the toolbars (+2 more)

### Community 82 - "Community 82"
Cohesion: 0.33
Nodes (5): Column filter display mode, Create display mode, Display modes, Pagination display mode, Related

### Community 83 - "Community 83"
Cohesion: 0.29
Nodes (6): Reading and setting from the instance, Related, State management, Styling without props, tablecn UI state, TanStack table state

## Knowledge Gaps
- **551 isolated node(s):** `metadata`, `geist`, `raleway`, `notoSerif`, `geistMono` (+546 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `TypeScript Config Presets` to `Feature Set & Roadmap`, `DataTableFilterOption`, `Community 2`, `shadcn Primitives & Styling`, `App Shell & Theming`, `Community 74`, `CSV / Excel Export`, `Community 77`, `Column Pinning & Resizing Styles`, `Community 76`, `Community 80`, `Community 16`, `Top Toolbar + Alert Banner + Drop-to-Group Zone`, `getColumnSizeVars`, `IconComponent`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 2` to `DataTableFilterOption`, `Core Render & Injected Columns`, `shadcn Primitives & Styling`, `CSV / Excel Export`, `TypeScript Config Presets`, `Community 16`, `Top Toolbar + Alert Banner + Drop-to-Group Zone`, `getColumnSizeVars`, `IconComponent`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `useDataTable()` connect `Core Render & Injected Columns` to `Feature Set & Roadmap`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `metadata`, `geist`, `raleway` to the rest of the system?**
  _558 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Feature Set & Roadmap` be split into smaller, more focused modules?**
  _Cohesion score 0.06018518518518518 - nodes in this community are weakly interconnected._
- **Should `Core Render & Injected Columns` be split into smaller, more focused modules?**
  _Cohesion score 0.07514124293785311 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08482523444160273 - nodes in this community are weakly interconnected._