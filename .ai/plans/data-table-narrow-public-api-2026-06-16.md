# Data-table: narrow the public API surface (library feel)

**Date:** 2026-06-16
**Status:** Design — awaiting review
**Scope:** `packages/ui/src/components/data-table/` and its docs/build dependents in `apps/web/`

## Problem

`@monabbir/tablecn`'s data-table module is consumed two ways: as in-tree source by
`apps/web`, and as a shadcn **registry block** the CLI copies into a consumer's project.
Its barrel ([index.ts](../../packages/ui/src/components/data-table/index.ts)) currently
re-exports **~60 symbols** — the core plus a large "building blocks for advanced
composition" surface (every column header, filter field, toolbar control, column factory,
ID constant, etc.). That broad, flat surface is what stops the module from reading like a
tight library: there is no clear "this is the API" vs "this is plumbing" line.

## Goal

Make the module read like a focused library by **narrowing the advertised public API to
essentials** and moving the rest behind an `internal/` boundary. **No build step, no npm
publish, no change to the registry distribution model** — this is a structural/API-surface
change only.

### Non-goals

- Adding a build/`dist`/`.d.ts` pipeline or publishing to npm.
- Changing the package-wide `exports` map (it also serves the shadcn **primitives** like
  `@monabbir/tablecn/components/button`; locking it would break the app).
- Renaming public symbols or adopting an `MRT_`-style prefix (cn-table's names already
  share a `DataTable` prefix, so a prefix can't distinguish public from internal — the
  folder boundary is the right tool).
- Removing capability: every building block stays in the source under `internal/`,
  reachable by file path. It is simply no longer *advertised*.

## Reference: how MRT does it (and why we diverge)

MRT exports **everything** (74 `export * from` lines, no `exports` gate) and signals
internal-ness only by the `MRT_` name prefix. It can afford this because it is a **compiled
package with `sideEffects: false`** — tree-shaking drops unused exports from consumer
bundles, so breadth is free. cn-table ships **source via the registry** with no
tree-shaking pass and copies every file into the consumer's project regardless of the
barrel, so breadth is *not* free. A curated barrel + physical `internal/` folder is the
source-shipped equivalent — and a stronger structural signal than MRT's prefix convention.

## Target structure

Public modules live at the `data-table/` root; the layered implementation (the MRT-style
`components/ hooks/ fns/ utils/` layering built previously) moves under `internal/`:

```
data-table/
  index.ts            ← barrel: essentials ONLY
  data-table.tsx      ← DataTable                       (public)
  use-data-table.ts   ← useDataTable                    (public)
  types.ts            ← public config/instance/option types
  config-context.tsx  ← DataTableConfigProvider, useDataTableConfigContext (public)
  icons.tsx           ← defaultIcons + icon types       (public)
  localization.ts     ← defaultLocalization + type      (public)
  export-utils.ts     ← exportToCsv / exportToExcel + types (public, documented)
  README.md
  internal/
    components/   head/ body/ toolbar/ editing/ menus/  ← building-block UI
    hooks/        use-grid-navigation, display-columns/ ← column factories
    fns/          filter-fns
    utils/        column-styles
```

`data-table.tsx` and `use-data-table.ts` are pulled up from `components/`/`hooks/` to the
root (they are entry points, not internals); `locales/localization.ts` moves to the root
`localization.ts`. Everything they depend on drops into `internal/`. The public root is
exactly the 8 modules consumers need; `internal/` holds the rest.

## Public API (the narrowed barrel)

`index.ts` re-exports only:

```ts
export { DataTable } from "./data-table"
export { useDataTable } from "./use-data-table"
export { DataTableConfigProvider, useDataTableConfigContext } from "./config-context"
export { defaultIcons } from "./icons"
export { defaultLocalization } from "./localization"
export { exportToCsv, exportToExcel } from "./export-utils"
export type {
  Density, FilterVariant, DataTableFilterOption, DataTableConfig,
  DataTableInstance, DataTableSlotProps, UseDataTableOptions,
  EditDisplayMode, EditVariant, EditingCell, RowEvent, CellEvent,
  DataTableRefs, DataTableRowVirtualizer, DataTableColumnVirtualizer,
  RowVirtualizerOptions, ColumnVirtualizerOptions,
} from "./types"
export type { DataTableIcons, IconComponent } from "./icons"
export type { DataTableLocalization } from "./localization"
export type { ExportScope, ExportOptions } from "./export-utils"
export type { FilterMode, GlobalFilterMode } from "./types"
```

### Public vs internal rule

- **Public:** the table entry (`DataTable`/`useDataTable`), config plumbing the consumer
  must touch (`DataTableConfigProvider`, `defaultIcons`, `defaultLocalization`), documented
  helpers (`exportToCsv`/`exportToExcel`), and **all types that describe public
  configuration or instance shape**.
- **Type-only nuance:** `FilterMode`/`GlobalFilterMode` describe public column-`meta`
  config but are defined in `internal/fns/filter-fns`. Re-export them through the barrel
  (sourced from `types.ts`, which re-exports the type from the internal module) so the
  public type surface stays complete without exposing the runtime fns.
- **Internal (removed from barrel, kept in source under `internal/`):** all building-block
  components (`DataTableColumnHeader`, filter fields, toolbar controls, `Highlight`, edit
  cell/modal, create-row, dnd cells, export menu), all column factories + `*_COLUMN_ID`
  constants, filter-fn creators (`createDynamicFilterFn`, `createGlobalFilterFn`, …),
  mode option helpers, `getColumnLabel`, `isColumnEditable`, column-style helpers, and the
  `DENSITY_ORDER`/`DENSITY_CELL_PADDING` value constants.

## Ripple effects (all in scope)

1. **Import rewiring:** moving ~25 files under `internal/` and lifting 2 files to root
   changes their relative import specifiers. Driven by a deterministic basename→path map
   (same method used in the two prior reorgs), then verified by typecheck.
2. **API-docs generator** ([build-api-docs.mjs](../../apps/web/scripts/build-api-docs.mjs)):
   update the four hardcoded source paths — `use-data-table.ts`, `data-table.tsx`,
   `icons.tsx`, `localization.ts` (now all at root). The recursive `data-slot` scan is
   unaffected. Regenerates `api-reference.generated.ts`.
3. **Registry generator** ([build-registry.mjs](../../apps/web/scripts/build-registry.mjs)):
   no logic change — it already walks recursively and preserves subpaths, so it ships the
   `internal/` tree automatically. The consumer's installed copy gets the same
   public/`internal/` split. Regenerates `data-table.json`.
4. **Docs content:** update the README feature table and the three guide pages that
   advertise now-internal building blocks in prose/samples
   (`docs/guides/cell-actions`, `docs/guides/column-filtering`, `docs/guides/display-modes`)
   so docs match the narrowed API. Recompose any sample that imported a building block to
   use the supported option-driven API instead. `example-source.generated.ts` regenerates.
5. **App imports:** none break — the app only consumes `DataTable`, `useDataTable`,
   `EditDisplayMode`, `DataTableConfigProvider`, `DataTableIcons`, all retained.

## Risks

- **A docs sample genuinely needs a building block** with no option-driven equivalent. If
  found, either (a) keep that specific symbol public (documented escape hatch), or (b)
  rewrite the sample. Decide per-case during implementation; default to rewriting.
- **Registry consumers who deep-imported a building block** by its old path will see it
  move under `internal/`. Acceptable: that was never an advertised path, and the registry
  copies a fresh tree on `add`.

## Verification

- `pnpm --filter @monabbir/tablecn typecheck` and `pnpm --filter tablecn-web typecheck` — clean.
- `pnpm --filter @monabbir/tablecn lint` — only the two known React-Compiler warnings.
- Regenerate registry + api docs; confirm file/slot counts unchanged (34 files, 9 slots).
- `graphify update .`
- Grep the barrel to confirm the export count dropped to the essentials set.
