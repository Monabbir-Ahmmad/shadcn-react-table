# Graph Report - tablecn  (2026-06-15)

## Corpus Check
- 150 files · ~60,605 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1085 nodes · 1864 edges · 73 communities (62 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `40013c30`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Display Columns, Row Actions & Export|Display Columns, Row Actions & Export]]
- [[_COMMUNITY_Demo Examples & Column Defs|Demo Examples & Column Defs]]
- [[_COMMUNITY_ButtonDropdownTooltip UI|Button/Dropdown/Tooltip UI]]
- [[_COMMUNITY_Web App Dependencies|Web App Dependencies]]
- [[_COMMUNITY_Core Table Rendering & Pinning|Core Table Rendering & Pinning]]
- [[_COMMUNITY_Monorepo Build Config (Turbo)|Monorepo Build Config (Turbo)]]
- [[_COMMUNITY_Architecture & API Concepts|Architecture & API Concepts]]
- [[_COMMUNITY_Command & Dialog UI|Command & Dialog UI]]
- [[_COMMUNITY_Getting Started & Server-side Docs|Getting Started & Server-side Docs]]
- [[_COMMUNITY_API Docs Generator (ts-morph)|API Docs Generator (ts-morph)]]
- [[_COMMUNITY_ESLint Config Package|ESLint Config Package]]
- [[_COMMUNITY_UI Package Dependencies|UI Package Dependencies]]
- [[_COMMUNITY_Filter Fields & Variants|Filter Fields & Variants]]
- [[_COMMUNITY_Context Menu & Cell Editing|Context Menu & Cell Editing]]
- [[_COMMUNITY_Docs MDX Components|Docs MDX Components]]
- [[_COMMUNITY_Column Management Docs|Column Management Docs]]
- [[_COMMUNITY_Popover & Theme Customizer|Popover & Theme Customizer]]
- [[_COMMUNITY_Data-table Registry Tokens|Data-table Registry Tokens]]
- [[_COMMUNITY_shadcn components.json Config|shadcn components.json Config]]
- [[_COMMUNITY_shadcn components.json Config (2)|shadcn components.json Config (2)]]
- [[_COMMUNITY_Filtering & Search Docs|Filtering & Search Docs]]
- [[_COMMUNITY_Base TypeScript Config|Base TypeScript Config]]
- [[_COMMUNITY_Column Header & Badge|Column Header & Badge]]
- [[_COMMUNITY_Input & Toggle UI|Input & Toggle UI]]
- [[_COMMUNITY_Select & Pagination UI|Select & Pagination UI]]
- [[_COMMUNITY_Row & Virtualization Docs|Row & Virtualization Docs]]
- [[_COMMUNITY_Registry Build Script|Registry Build Script]]
- [[_COMMUNITY_Icon Library & Theme Store|Icon Library & Theme Store]]
- [[_COMMUNITY_Docs Layout & Navigation|Docs Layout & Navigation]]
- [[_COMMUNITY_Editing & Loading Docs|Editing & Loading Docs]]
- [[_COMMUNITY_UI Dev Dependencies|UI Dev Dependencies]]
- [[_COMMUNITY_Examples Browser & Header|Examples Browser & Header]]
- [[_COMMUNITY_Next.js TypeScript Config|Next.js TypeScript Config]]
- [[_COMMUNITY_TS Config Package Manifest|TS Config Package Manifest]]
- [[_COMMUNITY_UI Package tsconfig|UI Package tsconfig]]
- [[_COMMUNITY_Web App tsconfig|Web App tsconfig]]
- [[_COMMUNITY_ESLint Config Presets|ESLint Config Presets]]
- [[_COMMUNITY_UI Package Manifest|UI Package Manifest]]
- [[_COMMUNITY_React Library TS Config|React Library TS Config]]
- [[_COMMUNITY_UI Package Exports|UI Package Exports]]
- [[_COMMUNITY_Lint tsconfig|Lint tsconfig]]
- [[_COMMUNITY_Custom Icons Docs|Custom Icons Docs]]
- [[_COMMUNITY_shadcn Registry Manifest|shadcn Registry Manifest]]
- [[_COMMUNITY_Row Numbers & Pinning Docs|Row Numbers & Pinning Docs]]
- [[_COMMUNITY_Contribution & CI Governance|Contribution & CI Governance]]
- [[_COMMUNITY_Event Listeners Docs|Event Listeners Docs]]
- [[_COMMUNITY_Export Docs|Export Docs]]
- [[_COMMUNITY_Next.js MDX Config|Next.js MDX Config]]
- [[_COMMUNITY_Detail Panel Docs|Detail Panel Docs]]
- [[_COMMUNITY_Row Actions Docs|Row Actions Docs]]
- [[_COMMUNITY_Tree Data Docs|Tree Data Docs]]
- [[_COMMUNITY_tsconfig (extends)|tsconfig (extends)]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
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

## God Nodes (most connected - your core abstractions)
1. `cn()` - 136 edges
2. `useDataTable()` - 35 edges
3. `useUserColumns()` - 31 edges
4. `DataTableInstance` - 27 edges
5. `getColumnLabel()` - 21 edges
6. `Button()` - 19 edges
7. `compilerOptions` - 15 edges
8. `Column filtering` - 15 edges
9. `Editing` - 15 edges
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

## Communities (73 total, 11 thin omitted)

### Community 0 - "Display Columns, Row Actions & Export"
Cohesion: 0.06
Nodes (57): DataTableConfigContext, DataTableConfigContextValue, DataTableConfigProvider(), useDataTableConfigContext(), DataTableFilterModeMenu(), getEffectiveMode(), NumberFilterField(), TextFilterField() (+49 more)

### Community 1 - "Demo Examples & Column Defs"
Cohesion: 0.08
Nodes (54): useDataTable(), currency, dateFmt, DEPARTMENT_OPTIONS, ROLE_OPTIONS, STATUS_OPTIONS, STATUS_VARIANT, userColumns() (+46 more)

### Community 2 - "Button/Dropdown/Tooltip UI"
Cohesion: 0.09
Nodes (37): Button(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioGroup(), DropdownMenuRadioItem() (+29 more)

### Community 3 - "Web App Dependencies"
Cohesion: 0.05
Nodes (39): dependencies, cmdk, date-fns, lucide-react, @mdx-js/loader, @mdx-js/react, @monabbir/tablecn, next (+31 more)

### Community 4 - "Core Table Rendering & Pinning"
Cohesion: 0.09
Nodes (30): Table(), TableBody(), TableCaption(), TableCell(), TableFooter(), TableHead(), TableHeader(), TableRow() (+22 more)

### Community 5 - "Monorepo Build Config (Turbo)"
Cohesion: 0.05
Nodes (36): devDependencies, prettier, prettier-plugin-tailwindcss, turbo, typescript, @workspace/eslint-config, @workspace/typescript-config, engines (+28 more)

### Community 6 - "Architecture & API Concepts"
Cohesion: 0.06
Nodes (39): Next.js 16 Agent Rules, Column options, DataTable Props, surfaceClassName (bounded scroll surface), table.cnTable Instance Extension, DataTable Component, Feature flags (all opt-in unless noted), Notes (+31 more)

### Community 7 - "Command & Dialog UI"
Cohesion: 0.12
Nodes (17): Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator() (+9 more)

### Community 8 - "Getting Started & Server-side Docs"
Cohesion: 0.18
Nodes (11): table.cnTable instance state, tablecn Introduction, Material React Table (MRT V3), TanStack Table v8, Controlled sorting, enableMultiSort option, Multi-column sorting, Per-column control (+3 more)

### Community 9 - "API Docs Generator (ts-morph)"
Cohesion: 0.09
Nodes (22): colMetaModule, columnOptions, dataTableProps, describe(), destructureDefaults(), DT, hookSf, iconDefaults (+14 more)

### Community 10 - "ESLint Config Package"
Cohesion: 0.09
Nodes (22): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-only-warn, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-turbo (+14 more)

### Community 11 - "UI Package Dependencies"
Cohesion: 0.09
Nodes (23): dependencies, class-variance-authority, clsx, cmdk, date-fns, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (+15 more)

### Community 12 - "Filter Fields & Variants"
Cohesion: 0.14
Nodes (14): Checkbox(), Popover(), PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle(), PopoverTrigger(), Slider() (+6 more)

### Community 13 - "Context Menu & Cell Editing"
Cohesion: 0.18
Nodes (12): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+4 more)

### Community 14 - "Docs MDX Components"
Cohesion: 0.11
Nodes (16): ApiTable(), SectionKey, SECTIONS, Callout(), LABELS, STYLES, Variant, Example() (+8 more)

### Community 15 - "Column Management Docs"
Cohesion: 0.05
Nodes (36): Column ordering, enableColumnOrdering, Initial order, initialState.columnOrder, Related, Column pinning, enableColumnPinning, Initial pins (+28 more)

### Community 16 - "Popover & Theme Customizer"
Cohesion: 0.05
Nodes (36): geist, geistMono, notoSerif, raleway, RootLayout(), CATEGORY_ORDER, ExamplesBrowser(), IconLibraryContext (+28 more)

### Community 17 - "Data-table Registry Tokens"
Cohesion: 0.10
Nodes (19): cssVars, dark, light, theme, highlight, highlight-foreground, dependencies, description (+11 more)

### Community 18 - "shadcn components.json Config"
Cohesion: 0.10
Nodes (19): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+11 more)

### Community 19 - "shadcn components.json Config (2)"
Cohesion: 0.10
Nodes (19): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+11 more)

### Community 20 - "Filtering & Search Docs"
Cohesion: 0.06
Nodes (35): Cell actions, Click to copy, ContextMenuItem, enableClickToCopy, Related, renderCellActionMenuItems, Usage, Choosing a filter control (+27 more)

### Community 21 - "Base TypeScript Config"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, incremental, isolatedModules, lib, module (+9 more)

### Community 22 - "Column Header & Badge"
Cohesion: 0.16
Nodes (12): Add the component, Installation, Next, Prerequisites, shadcn CLI add command, shadcn registry distribution, Verify, Density and dark mode (+4 more)

### Community 23 - "Input & Toggle UI"
Cohesion: 0.21
Nodes (10): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+2 more)

### Community 24 - "Select & Pagination UI"
Cohesion: 0.20
Nodes (11): Select(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator() (+3 more)

### Community 25 - "Row & Virtualization Docs"
Cohesion: 0.07
Nodes (23): enableRowOrdering option, onRowOrderChange callback, Related, Row ordering, enableMultiRowSelection option, enableRowSelection option, getRowId option, Related (+15 more)

### Community 26 - "Registry Build Script"
Cohesion: 0.17
Nodes (12): cssVars, DEV_DEPENDENCIES, files, item, NPM_DEPENDENCIES, OUT, read(), registry (+4 more)

### Community 27 - "Icon Library & Theme Store"
Cohesion: 0.21
Nodes (11): ContextMenu(), ClickToCopy(), getColumnLabel(), DataTableBodyCellContent(), isColumnEditable(), LocalDraftEditor(), RowDraftEditor(), CheckboxFilterField() (+3 more)

### Community 28 - "Docs Layout & Navigation"
Cohesion: 0.33
Nodes (5): Badge(), badgeVariants, Toggle(), toggleVariants, DataTableDropToGroupZone()

### Community 29 - "Editing & Loading Docs"
Cohesion: 0.09
Nodes (21): table.cnTable.beginCreate, Cell editing, editDisplayMode, meta.editVariant, Editing, enableEditing, Modal editing & creating, onCreateRow (+13 more)

### Community 30 - "UI Dev Dependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, tailwindcss, @tailwindcss/postcss, @turbo/gen, @types/node, @types/papaparse, @types/react (+4 more)

### Community 31 - "Examples Browser & Header"
Cohesion: 0.67
Nodes (3): buttonVariants, Calendar(), CalendarDayButton()

### Community 32 - "Next.js TypeScript Config"
Cohesion: 0.18
Nodes (10): compilerOptions, allowJs, jsx, module, moduleResolution, noEmit, plugins, display (+2 more)

### Community 34 - "TS Config Package Manifest"
Cohesion: 0.22
Nodes (8): name, private, scripts, format, lint, typecheck, type, version

### Community 35 - "UI Package tsconfig"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, paths, exclude, extends, include, @monabbir/tablecn/*

### Community 36 - "Web App tsconfig"
Cohesion: 0.22
Nodes (8): compilerOptions, paths, plugins, exclude, extends, include, @/*, @monabbir/tablecn/*

### Community 37 - "ESLint Config Presets"
Cohesion: 0.43
Nodes (3): config, nextJsConfig, config

### Community 38 - "UI Package Manifest"
Cohesion: 0.29
Nodes (6): license, name, private, publishConfig, access, version

### Community 39 - "React Library TS Config"
Cohesion: 0.33
Nodes (5): compilerOptions, jsx, display, extends, $schema

### Community 40 - "UI Package Exports"
Cohesion: 0.33
Nodes (6): exports, ./components/*, ./globals.css, ./hooks/*, ./lib/*, ./postcss.config

### Community 41 - "Lint tsconfig"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, exclude, extends, include

### Community 42 - "Custom Icons Docs"
Cohesion: 0.29
Nodes (7): App-wide defaults, Custom icons, DataTableConfigProvider, Icon resolution precedence, icons option, Related, Remix Icon (default icons)

### Community 43 - "shadcn Registry Manifest"
Cohesion: 0.40
Nodes (4): homepage, items, name, $schema

### Community 44 - "Row Numbers & Pinning Docs"
Cohesion: 0.22
Nodes (8): enableRowNumbers option, Numbering mode, Related, rowNumberMode option, Row numbers, enableRowPinning option, Related, Row pinning

### Community 45 - "Contribution & CI Governance"
Cohesion: 0.67
Nodes (4): Contribution Flow (PR-only), Package Consumed as Source (no rebuild), Pull Request Template & Checklist, CI Workflow (lint/typecheck/build)

### Community 46 - "Event Listeners Docs"
Cohesion: 0.40
Nodes (4): Event listeners, onCellClick / onCellDoubleClick, onRowClick / onRowDoubleClick, Related

### Community 47 - "Export Docs"
Cohesion: 0.33
Nodes (5): enableExport, Export, exportFileName, Related, What gets exported

### Community 50 - "Detail Panel Docs"
Cohesion: 0.40
Nodes (4): Detail panel, Related, renderDetailPanel, Usage

### Community 51 - "Row Actions Docs"
Cohesion: 0.40
Nodes (4): Related, renderRowActions option, Row actions, Usage

### Community 52 - "Tree Data Docs"
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

## Knowledge Gaps
- **492 isolated node(s):** `metadata`, `geist`, `raleway`, `notoSerif`, `geistMono` (+487 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Context Menu & Cell Editing` to `Display Columns, Row Actions & Export`, `Button/Dropdown/Tooltip UI`, `Core Table Rendering & Pinning`, `Command & Dialog UI`, `Filter Fields & Variants`, `Docs MDX Components`, `Popover & Theme Customizer`, `Input & Toggle UI`, `Select & Pagination UI`, `Icon Library & Theme Store`, `Docs Layout & Navigation`, `Examples Browser & Header`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `Button()` connect `Button/Dropdown/Tooltip UI` to `Display Columns, Row Actions & Export`, `Demo Examples & Column Defs`, `Command & Dialog UI`, `Filter Fields & Variants`, `Context Menu & Cell Editing`, `Popover & Theme Customizer`, `Input & Toggle UI`, `Examples Browser & Header`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `useDataTable()` connect `Demo Examples & Column Defs` to `Display Columns, Row Actions & Export`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `metadata`, `geist`, `raleway` to the rest of the system?**
  _499 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Display Columns, Row Actions & Export` be split into smaller, more focused modules?**
  _Cohesion score 0.06460206460206461 - nodes in this community are weakly interconnected._
- **Should `Demo Examples & Column Defs` be split into smaller, more focused modules?**
  _Cohesion score 0.07924984875983061 - nodes in this community are weakly interconnected._
- **Should `Button/Dropdown/Tooltip UI` be split into smaller, more focused modules?**
  _Cohesion score 0.09316394434361766 - nodes in this community are weakly interconnected._