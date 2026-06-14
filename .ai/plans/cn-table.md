# tablecn — Complete Plan

A shadcn/ui data table that matches **Material React Table (MRT V3)** in both **UI design/layout** and **the complete feature set**, built on TanStack Table v8, distributed as a shadcn registry, on Tailwind v4.

---

## 1. Objective & non-negotiables

- **Same UI layout as MRT.** Region-for-region: top toolbar (custom actions + alert banner left, icon cluster right), the header row with sortable labels + sort indicators + per-column actions menu, the filter row beneath headers, the table body with density/hover/selection states, and the bottom toolbar with pagination. Someone who knows MRT should feel at home immediately.
- **All features.** Full parity with MRT's surface, not just the default-on set — see the complete inventory in §4. Phasing is only delivery sequencing; the end state is 100% coverage.
- **shadcn-native.** Rebuilt with shadcn primitives, lucide-react, and Tailwind tokens. No MUI, Emotion, `sx`, or theme object — overrides are `className` / render props.
- **Stack.** TanStack Table v8 (stable; v9 is beta), shadcn/ui, Tailwind v4.
- **Distribution.** shadcn registry, installed via `npx shadcn add <url>`, portable across project layouts via target placeholders.

---

## 2. Local project bootstrap (start fresh)

Starting clean in a new local project — earlier exploratory files are discarded and the core is built from scratch in Phase 1. This sets up a registry-development workspace from an empty folder.

**Prerequisites:** Node 18.17+ (the v4 template's baseline), pnpm (the template is configured for it; npm/yarn may misbehave), Git.

**Option A — official registry template (recommended).** Pre-wired Next.js + Tailwind v4 + `registry.json` + `shadcn build` script + a route handler that serves items, so we can start adding items immediately:

```bash
git clone https://github.com/shadcn-ui/registry-template.git mrt-shadcn
cd mrt-shadcn && pnpm install && pnpm dev   # serves http://localhost:3000
```

(A `registry-template-v3` exists for Tailwind v3 host audiences; we target v4.)

**Option B — scaffold from scratch.**

```bash
npx shadcn@latest init -t next   # CLI v4 templates: next, vite, react-router, astro, tanstack-start
```

Then add `registry.json` at the root and a `registry/` source dir. Note CLI v4 **removed** the old `--style`, `--base-color`, `--css-variables`, and `--src-dir` flags (they now error); choose the base color and CSS-variable theming during interactive init or via `--preset <code>`, or `-d` for defaults (neutral + CSS variables on).

**Install the deps and primitives the core relies on:**

```bash
pnpm add @tanstack/react-table @tanstack/match-sorter-utils
npx shadcn@latest add table button input checkbox select badge toggle tooltip dropdown-menu skeleton popover command slider calendar context-menu
```

(Later phases add `@tanstack/react-virtual`, `@dnd-kit/*`, `papaparse`/`xlsx`, `form`, `label`.)

**Source layout:**

```
registry.json
registry/new-york/
  data-table/        # core item files
  data-table-demo/   # demo block
app/(demo)/          # a route rendering the demo for live dev
public/r/            # build output (generated)
```

**Dev / test loop:**

1. `npx shadcn@latest build` (or the template's `registry:build` script) → writes `public/r/*.json`.
2. `pnpm dev` serves them at `http://localhost:3000/r/<item>.json`.
3. In a **separate** consumer app, test the real install: `npx shadcn@latest add http://localhost:3000/r/data-table.json` (local file paths also work for offline testing).
4. Inspect before writing with `add --dry-run` / `--view`; check for drift later with `add --diff`.
5. Render the demo route inside the registry app itself for fast visual iteration while building.

---

## 3. Design language — full MRT UI layout parity

The heart of this project: every MRT region and interaction mapped to a concrete shadcn implementation.

### 3.0 Overall layout
Vertical stack: **top toolbar → (alert banner) → (drop-to-group zone) → table (sticky header, optional filter row, body, optional sticky footer) → bottom toolbar.** The table sits in a `rounded-md border` surface; toolbars sit outside it. Full-screen mode fixes the whole stack to the viewport.

### 3.1 Header & sorting
Header cell = flex row: **label (sort trigger) · sort indicator · column-actions button**, left-aligned (MRT order). Click label cycles asc → desc → none (via `getToggleSortingHandler`, so shift-click multi-sorts). Indicator: `ArrowUp`/`ArrowDown` when sorted, faint `ChevronsUpDown` on hover when not; multi-sort shows the sort order in a tiny `Badge`. Number columns default desc-first.

### 3.2 Column actions menu (MRT signature)
`MoreVertical` ghost button after the label, revealed on hover/focus, opening a `DropdownMenu`: Sort Asc/Desc, Clear Sort, Hide Column, Show All Columns, Filter by…, Clear Filter — with Group by and Pin Left/Right/Unpin appended once those phases land. Disable globally or per column (e.g. an ID column).

### 3.3 Column filtering (row, modes, all variants)
Toggleable **filter row** under the headers (toolbar funnel toggles it), one field per filterable column. **Filter-mode menu**: a `Filter` adornment opens a `DropdownMenu` of modes (contains, equals, startsWith, endsWith, empty, notEmpty; numeric adds between, >, <, etc.), swapping the column `filterFn`. **All variants** via `meta.filterVariant`: text → `Input`; autocomplete/select → `Select`; multi-select (faceted) → `Popover` + `Command` checklist with counts from `getFacetedUniqueValues`; checkbox; range → dual `Input`; range-slider → `Slider`; date / date-range → `Popover` + `Calendar`. Each field has a clear affordance. Popover-filter and custom-filter-UI escape hatches supported.

### 3.4 Filter match highlighting
On by default (toggleable): matched substrings wrapped in `<mark className="bg-highlight text-highlight-foreground rounded-[2px] px-0.5">`. `--highlight`/`--highlight-foreground` are shipped via the item's `cssVars` (amber-ish OKLCH default) following the `:root`/`.dark` + `@theme inline` convention — but mapped with a **fallback to an always-present token**, `@theme inline { --color-highlight: var(--highlight, var(--accent)); }`, so that if a regenerated theme overwrites globals.css and drops our token, the highlight degrades to the themed accent rather than disappearing. Per-column opt-out.

### 3.5 Global search
Toolbar `Search` button expands into an `Input` (leading icon, clear). Fuzzy + ranked via `@tanstack/match-sorter-utils` (`globalFilterFn: "fuzzy"`), ranking auto-disabled when a column sort is active. Optional global-filter-mode menu.

### 3.6 Top toolbar (+ alert banner, drop-to-group zone)
Left: title slot, `renderToolbarActions`, and the **alert banner** (selection count + Clear; grouping messages). Right: icon cluster in MRT order — search, filters funnel, column visibility, density, full screen — each `variant="outline" size="icon" className="size-8"` with a `Tooltip`. When grouping is enabled, a **"Drop to group by" zone** with draggable column chips renders below the toolbar.

### 3.7 Density
Single icon button that **cycles** comfortable → compact → spacious (tooltip names the level). Padding map: compact `py-1`, comfortable `py-2.5`, spacious `py-4`.

### 3.8 Pagination (bottom toolbar)
Left: rows-per-page `Select`. Right: MRT-style range label **"1–10 of 100"** + first/prev/next/last icon buttons. Supports manual/server pagination.

### 3.9 Row selection
Auto-injected checkbox column (select-all with indeterminate); single-select (radio) variant supported. Selected count surfaces in the alert banner. Body: `hover:bg-muted/50`, selected `data-[state=selected]:bg-muted`.

### 3.10 Grouping, aggregation, expansion
Grouping via the drop zone or column-actions menu; grouped rows render an expand/collapse `ChevronRight`/`ChevronDown` with indentation and a row count. Aggregations (sum, mean, count, min, max, median, extent, unique) render in the group/footer row. **Detail panel** (expanding) and **tree sub-rows** use the same chevron + indentation language; sticky footer optional.

### 3.11 Ordering, pinning, resizing, DnD, row numbers
Column ordering and row ordering via drag (`@dnd-kit`) with a drag handle (`GripVertical`). Column pinning (sticky left/right with shadow edge) and row pinning, toggled from the actions menu. Column resizing via an edge drag handle on hover. Row numbers (static or original index) as an optional display column.

### 3.12 Editing, cell/row actions, click-to-copy
Editing modes — cell, row, table, modal, custom — with inline `Input`/`Select` fields and validation styling. Row actions as a trailing button/menu column; cell actions via a context menu (`ContextMenu`); click-to-copy on cells with a transient "Copied" affordance.

### 3.13 Async loading, virtualization, sticky surfaces
Loading state: overlay + `Skeleton` rows + a top progress bar. Row (and column) virtualization via `@tanstack/react-virtual` for large datasets. Sticky header (default) and optional sticky footer.

### 3.14 Localization, theming, motion, a11y
Localization object for all strings (labels, aria, pagination). Theming via shadcn tokens + `.dark`. Respect `prefers-reduced-motion`. Keyboard **cell navigation** enabled by default (MRT V3 parity), `aria-sort` on headers, visible focus rings, labelled icon buttons.

### 3.15 Theming & token discipline (so it never looks out of place)
The package must blend into whatever theme the host project runs — default base color, a custom base color (neutral/stone/zinc/mauve/olive/mist/taupe), or a fully custom theme (e.g. tweakcn-generated). Rules:
- **Tokens only, no hardcoded colors.** Every surface uses semantic tokens — `bg-background`/`text-foreground`, `bg-card`, `bg-popover`, `bg-muted`/`text-muted-foreground` (banners, hover, group rows), `bg-accent` (header-button/active states), `border-border`, `bg-input`, `ring-ring` (focus), `text-destructive` (validation), and `--radius` for rounding. No `bg-amber-*`, no `bg-zinc-*`, anywhere.
- **New tokens follow the shadcn convention.** Anything we introduce (currently just `--highlight`/`--highlight-foreground`, plus pinned-column edge shadow if needed) is defined under `:root` and `.dark`, mapped with `@theme inline`, and delivered through the registry item's `cssVars` (theme/light/dark) so the CLI injects it into the project's globals.css and themes can override it. Names are generic but documented, so a collision can be renamed (the consumer owns the code).
- **Consumer override path.** Component `className` props compose as `cn(base, className)` (base first) so a consumer can override our styles per instance; tailwind-merge resolves the conflict in their favor.
- **Prerequisite.** Targets the default `cssVariables: true` setup. If a project opted into `cssVariables: false` (hardcoded utilities), document that they should re-enable variables or expect to restyle — it's an install-time project choice, not something we can detect.

### Mapping summary

| MRT element | shadcn implementation |
| --- | --- |
| Sort (cycle + shift multi) | label button + Arrow icons + multi-sort `Badge` |
| Column actions menu | `MoreVertical` → `DropdownMenu` |
| Filter row + modes | `Input`/variant fields + `Filter` adornment menu |
| Faceted / range / date filters | `Popover`+`Command` / dual `Input`+`Slider` / `Calendar` |
| Match highlight | `<mark>` + themeable `--highlight` token |
| Global search | `Search` btn → `Input`, match-sorter fuzzy |
| Toolbar icons | `Button` + `Tooltip` |
| Alert banner / drop-to-group | `bg-muted` strip / chip drop zone |
| Density | one cycling `Button` |
| Pagination | `Select` + "1–10 of 100" + nav |
| Grouping / detail / tree | chevron + indent + aggregation row |
| Ordering / pinning / resizing | `@dnd-kit` handle / sticky + shadow / edge drag |
| Editing | inline `Input`/`Select` + validation |
| Cell/row actions | `ContextMenu` / trailing menu column |
| Loading | overlay + `Skeleton` + progress |
| Virtualization | `@tanstack/react-virtual` |

---

## 4. Complete feature inventory

Every MRT capability, its target registry item, and phase. All are committed; none are "maybe."

| Feature | Item | Phase |
| --- | --- | --- |
| Sorting (single, multi, custom fns, desc-first) | core | 1 |
| Column actions menu | core | 1 |
| Column visibility / hiding | core | 1 |
| Density (3-level cycle) | core | 1 |
| Full-screen toggle | core | 1 |
| Sticky header | core | 1 |
| Row selection (multi + single) + alert banner | core | 1 |
| Pagination (client) + range label | core | 1 |
| Keyboard cell navigation | core | 1 |
| Column filtering — text | core | 1 |
| Filter modes / switching | filters | 2 |
| Filter variants (select, multi-select/faceted, checkbox, range, range-slider, date, date-range) | filters | 2 |
| Faceted unique values + counts | filters | 2 |
| Filter match highlighting | filters | 2 |
| Popover filters / custom filter UI | filters | 2 |
| Global search — fuzzy + ranked | search | 3 |
| Global filter modes | search | 3 |
| Column ordering (DnD) | columns | 4 |
| Row ordering (DnD) | columns | 4 |
| Column pinning / freezing | columns | 4 |
| Row pinning | columns | 4 |
| Column resizing | columns | 4 |
| Row numbers | columns | 4 |
| Grouping + drop-to-group zone | grouping | 5 |
| Aggregation (sum/mean/count/min/max/median/extent/unique) | grouping | 5 |
| Detail panel (expanding) | grouping | 5 |
| Expanding sub-rows (tree) | grouping | 5 |
| Column grouping (grouped header columns) | grouping | 5 |
| Sticky footer | grouping | 5 |
| Editing (cell / row / table / modal / custom) | editing | 6 |
| Creating new rows | editing | 6 |
| Cell actions (context menu) | editing | 6 |
| Row actions (buttons / menu) | editing | 6 |
| Click-to-copy | editing | 6 |
| Async loading UI (overlay / skeleton / progress) | core+ | 1/7 |
| Row & column virtualization | virtualized | 7 |
| Server-side / manual sorting, filtering, pagination, grouping | core + docs | 1→8 |
| CSV / Excel export | export | 8 |
| Localization (i18n) | core | 1 (string table), refined per phase |
| Theming (tokens + dark) | all | every |

---

## 5. Registry module breakdown

| Registry item | Contents | Key deps |
| --- | --- | --- |
| `data-table` (core) | hook, `<DataTable>`, toolbar, header + actions menu, pagination, selection column, alert banner, density, sticky header, localization, types | `@tanstack/react-table`; shadcn: table, button, input, checkbox, select, badge, toggle, tooltip, dropdown-menu, skeleton |
| `data-table-filters` | filter row, mode menu, all variants, faceted, highlight | + popover, command, slider, calendar; `@tanstack/match-sorter-utils` |
| `data-table-search` | expandable fuzzy global search + modes | `@tanstack/match-sorter-utils` |
| `data-table-columns` | pinning, resizing, column/row ordering, row numbers | `@dnd-kit/core`, `@dnd-kit/sortable` |
| `data-table-grouping` | grouping, aggregation, detail panel, tree, grouped headers, sticky footer | core |
| `data-table-editing` | edit modes, create row, cell/row actions, click-to-copy | + form, label, context-menu |
| `data-table-virtualized` | row + column virtualization | `@tanstack/react-virtual` |
| `data-table-export` | CSV / Excel export | `papaparse` / `xlsx` |
| `data-table-demo` | advanced example wiring everything | the above |

---

## 6. Phased roadmap

1. **Core layout parity** — build the core from scratch: `useDataTable` hook + `<DataTable>`; sortable header (sort trigger + indicator + multi-sort badge + column-actions menu), density cycle, sticky header, hover/selected tints, alert banner, pagination range label, tooltips, localization scaffold, async/skeleton loading, keyboard cell nav, auto-injected selection column. → `data-table`.
2. **Filtering depth** — modes, all variants, faceted, highlighting, custom/popover filter UI. → `data-table-filters`.
3. **Global search parity** — expandable fuzzy ranked search + modes. → `data-table-search`.
4. **Column & row management** — ordering, pinning, resizing, row numbers. → `data-table-columns`.
5. **Grouping & expansion** — grouping/drop-zone, aggregation, detail panel, tree, grouped headers, sticky footer. → `data-table-grouping`.
6. **Editing / CRUD** — all edit modes, create row, cell/row actions, click-to-copy. → `data-table-editing`.
7. **Virtualization** — row/column virtualization. → `data-table-virtualized`.
8. **Export & server-side** — CSV/Excel; documented manual mode across all data features. → `data-table-export` + docs.

---

## 7. Distribution / registry conventions

- **Targets**: `@components/` (and `@hooks/`, `@lib/`) placeholders — never hardcoded `components/...`.
- **Dependencies**: npm pinned to a major (`@tanstack/react-table@^8`); shadcn primitives by bare name in `registryDependencies`; cross-item deps by name (same registry) or URL.
- **Internal imports**: relative between sibling module files; `@/components/ui/*` and `@/lib/utils` for primitives (CLI rewrites the prefix).
- **Theming**: style with semantic tokens only (no hardcoded colors) so the package inherits the host's base color and any custom theme. New tokens (`--highlight`, etc.) ship via each item's `cssVars` (theme/light/dark) following the `:root`/`.dark` + `@theme inline` convention. Targets `cssVariables: true` (the default). Component classes compose `cn(base, className)` for consumer overrides.
- **Aliases note**: monorepo/`src` users point `aliases.components`/`aliases.ui` at their package before installing.
- **Namespace**: publish under `@your-namespace` → installs as `@your-namespace/data-table`.
- **Build & local testing**: items are built with `shadcn build` to `public/r/*.json` and served by the template's route handler; test installs against `http://localhost:3000/r/<item>.json` (or a local file) before publishing, using `--dry-run`/`--view` to inspect payloads.
- **Source organization**: CLI v4 allows splitting the catalog across multiple `registry.json` files composed at build time — once items multiply (filters, search, columns, …), give each its own catalog file rather than one growing root file.

---

## 8. Quality & testing

- `tsc` clean against a fresh shadcn + Tailwind v4 project after each `add`.
- A11y: keyboard sort/menu/filter/cell-nav paths, `aria-sort`, focus-visible, reduced motion.
- Dark mode verified on every surface (menus, filter row, highlight, banners, pinned shadows).
- **Theme coverage**: verified against multiple base colors (neutral/stone/zinc/…) and at least one fully custom theme, in light and dark, confirming no hardcoded colors leak through.
- Unit tests (Vitest + Testing Library) for hook state and sort/filter logic.
- Per-element **visual parity checklist** against the live MRT demos.
- Demo route / Storybook per feature.

---

## 9. Decisions (resolved)

- **Fuzzy search**: adopt `@tanstack/match-sorter-utils` (MRT's own choice) for ranked global search.
- **DnD**: `@dnd-kit` for column/row ordering.
- **Date filters**: shadcn `Calendar` (react-day-picker) + date-fns.
- **Tooltips**: shadcn `Tooltip` wrapped in a local `TooltipProvider` inside the toolbar, so consumers needn't add a global provider.
- **Granularity**: many small registry items (chosen) for granular installs/updates over one mega-item.
- **Layout modes**: ship the semantic table layout first; grid layout mode is a later enhancement, not a blocker.
- **Theming**: token-only styling targeting `cssVariables: true`; introduce as few new tokens as possible (`--highlight` to start) and ship them via `cssVars` so custom themes apply automatically.

---

## 10. Risks, edge cases & mitigations

**Assumption (per project decision):** consumers use shadcn themes and keep the standard token *names*, changing only their *values*. This removes token-rename collisions, but the design must be robust to arbitrary token values and must not depend on any custom token surviving a theme regeneration.

### Theming & visual integration
- **Arbitrary `--radius` (0 → pill).** Derive all rounding from the radius scale (`rounded-sm/md/lg`) — never fixed px — so corners track the theme; use `rounded-sm` on small controls so a large radius doesn't balloon inputs/badges.
- **Low-contrast themes** (muted ≈ background, faint border). Never signal state with a single background swap. Stack cues: selected row = `bg-muted` **plus** a left `border-l-2 border-primary` or `ring`; rely on `border-border` for structure; keep checkbox state as the primary selection signal.
- **Near-white/near-black primary** breaks a translucent highlight or accent badge. Use `*-foreground` pairs for text-on-surface, and prefer solid token surfaces over opacity for anything that must stay legible.
- **Custom token dropped on theme regen** (user pastes a generated globals.css). Highlight falls back to `var(--accent)` (above); avoid introducing any other new token, and re-injection is a documented `add` step.
- **Dark mode + pinned-column shadow.** Build the freeze shadow from `--border` (e.g. a token-based gradient), not black/white, so it reads in both modes.
- **`cssVariables: false` projects** have no semantic utilities. Documented prerequisite; the table targets the default `cssVariables: true`.

### Table state & data correctness
- **Unstable `data`/`columns` refs** cause infinite re-renders and lost state (a classic MRT footgun). Document the requirement; recommend `useMemo`/stable refs; surface a dev warning if a new array identity arrives every render.
- **Row identity.** Without `getRowId`, selection/expansion key off the row index and break across sort/filter/pagination. Expose `getRowId`, default to index, and warn when selection/expansion is enabled without it.
- **Page index out of range** after filtering shrinks the set. Clamp `pageIndex`; configure `autoResetPageIndex` deliberately so the view doesn't jump unexpectedly on edits.
- **Filter mode vs filter value mismatch** (switching `between` ↔ `contains`). Reset/coerce the filter value when the mode changes so a stale value doesn't throw.

### Server-side / async
- **Request spam from per-keystroke filtering.** Debounce filter and global-search inputs (~300ms) before firing `onChange` in manual mode.
- **Manual mode counts.** Require `rowCount`/`pageCount` from the consumer; faceted options must be supplied (client-side faceting is unavailable server-side).
- **Fuzzy + manual.** Disable client fuzzy ranking when `manualFiltering` is set; it's the server's job then.

### Accessibility, i18n, RTL
- **Grid semantics & keyboard cell nav.** Implement roving `tabindex`, `aria-sort` on headers, `aria-selected` on rows, and announce sort/filter/page changes via an `aria-live` region.
- **Icon-only controls.** Every one gets an `aria-label` (Tooltip is not an accessible name); focus-visible rings use `ring-ring`.
- **Color-only state fails for colorblind users.** Pair every color state with a non-color cue (icon, checkbox, border).
- **RTL.** Use logical spacing (`ms-/me-`, `ps-/pe-`) and `rtl:` flips for directional icons (sort arrows, chevrons, pagination, pinning).
- **Localization.** Ship a complete string table (labels, aria, pagination range, plurals) with function-valued entries for interpolation; default English.

### Performance
- **No virtualization on big sets** blows up the DOM. Recommend the virtualization item past ~100 rows; document the threshold.
- **Resize/scroll re-render storms.** Use TanStack column-sizing CSS variables (widths via CSS vars, not per-cell state) and resize on commit, not on every move.
- **Highlight regex over every cell each render.** Run only when a query is active, escape the query, memoize per cell, and cap work on very long strings.

### Distribution / registry / build
- **Tailwind v3 consumer.** We target v4; document the requirement (or ship a v3 variant), since `@theme inline` cssVars injection and a few utilities differ.
- **Stale/customized primitives.** A consumer's older `dropdown-menu`/`select` may lack a prop we use. Depend only on stable primitive APIs and document minimum shadcn component expectations.
- **CLI/feature currency.** Target-placeholder targets and the registry itself need a recent CLI and are still flagged experimental; pin our items by GitHub tag/SHA and keep a changelog.
- **No auto-updates for vendored code.** Modular items + semver + changelog so consumers can re-pull individual pieces.
- **React Compiler / React 19.** TanStack v8 notes possible incompatibility with the React Compiler; document testing with it disabled.

### Runtime / SSR
- **`"use client"` + RSC.** All interactive files are client components; document fetching data on the server and passing it down.
- **Hydration & browser APIs.** No `window`/`navigator` during render; full-screen via state, measurements/virtualization in `useEffect`; guard `navigator.clipboard` (secure-context only) for click-to-copy with a fallback.

### Feature interaction edge cases
- **DnD × virtualization × pinning.** Define precedence and test combinations; dnd-kit with keyboard sensors for a11y; recompute pinned sticky offsets on resize/visibility/order change.
- **Selection scope.** Distinguish "select all on page" vs "select all N filtered" with an explicit affordance, persisted via `getRowId`.
- **Editing flow.** Clear edit-state model with Enter/Esc/Tab handling, validation surfaced with `text-destructive`, cancel/revert, and an `onSave` hook that works in controlled data setups.
- **Grouping × pagination × aggregation** correctness, and **detail panels × virtualization** (dynamic row-height measurement).