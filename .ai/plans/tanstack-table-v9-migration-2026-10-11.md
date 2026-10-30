# TanStack Table v9 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `@monabbir/shadcn-react-table` from TanStack Table v8 (`8.21.3`) to v9 (`9.2.8`) on the native v9 API, keep our consumer-facing API stable, and release it as `0.5.0`.

**Architecture:** First, on v8, add our own type aliases (`DataTableColumnDef`, `DataTableRow`, …) and a column-pinning adapter, route all internal code through them, and lock behaviour with characterization tests. Then flip the engine to v9 in one task: change only the alias definitions, the adapter internals, the row-model wiring (a per-table `features` object built from `stockFeatures` + row models + fn registries), and a small compatibility layer on the instance (`getState()`, left/right pinning). The characterization tests must pass unchanged before and after the flip.

**Tech Stack:** TanStack Table v9 (`@tanstack/react-table@^9.2.8`, `@tanstack/match-sorter-utils@^9.2.6`), React 19.2, TypeScript, Vitest + Testing Library (jsdom), pnpm 11 + Turborepo, Next.js 16 docs app.

**Spec:** No separate spec doc. The decisions below were agreed in conversation on 2026-10-11 and are the spec:
1. **Native v9 API with `stockFeatures`** (every feature on, like v8). No `useLegacyTable` shim.
2. **Keep our consumer API stable:** wrap v9 behind our own types (`DataTableColumnDef<TData>` etc.), keep `left`/`right` column pinning in our options and map it to v9's `start`/`end` internally.
3. **Release** as a new version once migrated.

## Global Constraints

- Branch: `feat/tanstack-table-v9`, cut from up-to-date `main`.
- Target versions: `@tanstack/react-table` `^9.2.8`, `@tanstack/match-sorter-utils` `^9.2.6`; `@tanstack/react-virtual` stays `^3.14.2` (it is unaffected).
- Release version: `0.5.0` (breaking change while in 0.x).
- Commits: subject line only, format `<prefix>: <msg>`. Never mention Claude, AI, or any agent/tool in commits, branch names, PR text, or release notes. Commit only the files the task names.
- Prettier style: no semicolons, double quotes, 2-space, `trailingComma: es5`, `printWidth: 80`.
- Never hand-edit generated files (`apps/web/public/r/*.json`, `apps/web/lib/*.generated.ts`). Regenerate them with the scripts.
- After any code change run `graphify update .` (repo rule; AST-only, no cost).
- Per-package commands (run from repo root):
  - tests: `pnpm --filter @monabbir/shadcn-react-table test`
  - types: `pnpm --filter @monabbir/shadcn-react-table typecheck`
  - lint: `pnpm --filter @monabbir/shadcn-react-table lint`
- `pnpm build` regenerates `apps/web/lib/*.generated.ts` with CRLF-only churn on Windows and recreates an untracked root `AGENTS.md`. If `git diff` for those generated files is empty after ignoring whitespace, restore them with `git checkout --`. Never commit `AGENTS.md`.

### Paths

`DT/` = `packages/shadcn-react-table/src/components/data-table/`
`WEB/` = `apps/web/`

---

## Background: what v9 changes (verified against the 9.2.8 type definitions)

| Area | v8 | v9 |
|---|---|---|
| Hook | `useReactTable(options)` | `useTable(options, selector?)`, which needs `options.features` |
| Features | all built in | `features: tableFeatures({...stockFeatures, …})`. **`stockFeatures` holds only the 17 feature objects; row models and fn registries are NOT included.** |
| Row models | `getXRowModel: getXRowModel()` options | slots on `features`: `filteredRowModel: createFilteredRowModel()`, `sortedRowModel`, `groupedRowModel`, `expandedRowModel`, `paginatedRowModel`, `facetedRowModel`, `facetedUniqueValues`, `facetedMinMaxValues`. Core is automatic. |
| Row-model factory shape | `(table) => () => RowModel` | **same shape**; faceted ones are `(table, columnId) => () => …`. Each slot is called once, lazily, on first use (`table._rowModels` cache), exactly like v8. |
| Manual flags | `manualFiltering/Sorting/Pagination` skip the model | same (checked at call time in `coreRowModelsFeature.utils.js`) |
| Fns | `filterFns`/`sortingFns`/`aggregationFns` built in | must be registered as `features` slots (`filterFns`, `sortFns`, `aggregationFns`); string names (incl. `"auto"`, `"sum"`, `"mean"`) resolve only if registered |
| Filter meta type | `declare module` `FilterMeta` | `filterMeta: metaHelper<T>()` slot; `addMeta` is now **optional** in `FilterFn` |
| State read | `table.getState()` | **no `getState`.** Use `table.store.state` (full) or `table.state` (selector result) |
| Column pinning | `left`/`right`, `getStart("left")`, `getAfter("right")`, `getIsLastColumn("left")`, `getIsFirstColumn("right")`, `pin("left")` | `start`/`end` everywhere (`ColumnPinningState = { start: string[]; end: string[] }`); no aliases |
| Row pinning | `top`/`bottom` | unchanged |
| Sizing | `columnSizingInfo` state | renamed `columnResizing` (same shape: `isResizingColumn`, `deltaOffset`, …) |
| Pagination model | `getPaginationRowModel`, `getPrePaginationRowModel` | `getPaginatedRowModel`, `getPrePaginatedRowModel` |
| Sorting names | `sortingFn`, `SortingFn` | `sortFn`, `SortFn` (we don't use these) |
| Types | `Row<TData>`, `Column<TData,TValue>`, `ColumnDef<TData,TValue>`, `Table<TData>` | every type takes `TFeatures` first: `Row<TFeatures,TData>`, `ColumnDef<TFeatures,TData,TValue>`, … |
| `ColumnMeta` augmentation | `interface ColumnMeta<TData extends RowData, TValue>` | `interface ColumnMeta<TFeatures extends TableFeatures, TData extends RowData, TValue extends CellData = CellData>` (merging still works) |
| Instance methods | own arrow fns | row/cell/column/header methods live on the **prototype**, so don't destructure them. `CellContext.getValue` is still a closure, so `({ getValue })` in cell renderers is fine. Table methods are still own properties. |
| React instance identity | `useReactTable` returns a stable object | `useTable` returns `{...coreTable, options, state}`, a **new object every render**, and render contexts (`cell.getContext().table`) hold the **core** table, not that wrapper |

---

## File Structure

**New files**
- `DT/core/table-types.ts`: our aliases over TanStack's generic types (`DataTableColumnDef`, `DataTableRow`, `DataTableColumn`, `DataTableCell`, `DataTableHeader`, `DataTableCoreTable`, `DataTableRowModel`, `DataTableFilterFn`, `DataTableRowModelFactory`). It is the only place that knows TanStack's generic arity. On v9 it also re-exports `DataTableFeatures`.
- `DT/helpers/column-pinning.ts`: the pinning adapter (`getPinSide`, `pinColumn`, `getPinOffset`, `isPinnedEdgeColumn`) plus pure state mappers (`toCorePinning`, `fromCorePinning`, `mapPinningUpdater`) and `DataTableColumnPinningState`.
- `DT/helpers/column-pinning.test.ts`
- `DT/core/use-data-table.behavior.test.tsx`: characterization suite that locks engine behaviour across the flip.
- `DT/core/features.ts` (v9 task): base feature set, `DataTableFeatures` type, `createDataTableFeatures()` with runtime gates.
- `DT/helpers/table-state.ts` (v9 task): `toDataTableState()`, which presents v9 state in our stable (v8-shaped) form.

**Modified (main ones)**
- `DT/core/types.ts`: alias usage, options/instance types, `ColumnMeta` augmentation.
- `DT/core/use-data-table.ts`: engine wiring.
- `DT/index.ts`: export the new public types.
- `DT/fns/{filter-factories,ranked-row-model,advanced-filter}.ts`, `DT/hooks/{use-global-filter-mode,use-advanced-filter,use-column-filter-modes}.ts`: types plus v9 factory imports.
- `DT/utils/column-styles.ts`, `DT/components/menus/data-table-column-actions.tsx`: go through the pinning adapter.
- `DT/components/body/render-body-cell.tsx`, `DT/components/body/data-table-footer.tsx`, `DT/components/head/data-table-column-header.tsx`: pass our instance into render contexts.
- `DT/components/toolbar/data-table-alert-banner.tsx`: paginated-model rename.
- ~30 files: mechanical type-alias sweep (Task 3).
- `WEB/components/examples/{columns,registry}.tsx`, `WEB/scripts/{build-registry,build-api-docs}.mjs`, docs `.mdx` pages, READMEs, `CLAUDE.md`, `CHANGELOG.md`, `package.json`s.

---

### Task 1: Branch + public type aliases (on v8)

Adds the stable type names consumers and internals will use, while still on v8. The change is additive and doesn't change behaviour.

**Files:**
- Create: `DT/core/table-types.ts`
- Modify: `DT/index.ts`
- Modify: `WEB/components/examples/columns.tsx`, `WEB/components/examples/registry.tsx` (the `ColumnDef` imports and annotations only)

**Interfaces:**
- Produces (used by every later task):
  - `DataTableColumnDef<TData extends RowData, TValue = unknown>`
  - `DataTableRow<TData extends RowData>`
  - `DataTableColumn<TData extends RowData, TValue = unknown>`
  - `DataTableCell<TData extends RowData, TValue = unknown>`
  - `DataTableHeader<TData extends RowData, TValue = unknown>`
  - `DataTableCoreTable<TData extends RowData>`
  - `DataTableRowModel<TData extends RowData>`
  - `DataTableFilterFn<TData extends RowData>`
  - `DataTableRowModelFactory<TData extends RowData>` = `(table: DataTableCoreTable<TData>) => () => DataTableRowModel<TData>`

- [ ] **Step 1: Create the branch**

```bash
git switch main && git pull --ff-only
git switch -c feat/tanstack-table-v9
```

- [ ] **Step 2: Create `DT/core/table-types.ts` (v8 definitions)**

```ts
import type {
  Cell,
  Column,
  ColumnDef,
  FilterFn,
  Header,
  Row,
  RowData,
  RowModel,
  Table,
} from "@tanstack/react-table"

// Our names for TanStack's generic types. This file is the only place that
// knows TanStack's generic arity, so a TanStack major bump changes these
// definitions instead of every call site. Consumers type their columns with
// `DataTableColumnDef<TData>`.

export type DataTableColumnDef<
  TData extends RowData,
  TValue = unknown,
> = ColumnDef<TData, TValue>

export type DataTableRow<TData extends RowData> = Row<TData>

export type DataTableColumn<TData extends RowData, TValue = unknown> = Column<
  TData,
  TValue
>

export type DataTableCell<TData extends RowData, TValue = unknown> = Cell<
  TData,
  TValue
>

export type DataTableHeader<TData extends RowData, TValue = unknown> = Header<
  TData,
  TValue
>

/** The raw TanStack table (no `tableInstance` config attached). */
export type DataTableCoreTable<TData extends RowData> = Table<TData>

export type DataTableRowModel<TData extends RowData> = RowModel<TData>

export type DataTableFilterFn<TData extends RowData> = FilterFn<TData>

/** A row-model factory: called once per table, returns the memoized getter. */
export type DataTableRowModelFactory<TData extends RowData> = (
  table: DataTableCoreTable<TData>
) => () => DataTableRowModel<TData>
```

- [ ] **Step 3: Export the public aliases from `DT/index.ts`**

Append after the existing `export type { … } from "./core/types"` block:

```ts
export type {
  DataTableColumnDef,
  DataTableRow,
  DataTableColumn,
  DataTableCell,
  DataTableHeader,
} from "./core/table-types"
```

(`DataTableCoreTable`, `DataTableRowModel`, `DataTableFilterFn`, `DataTableRowModelFactory` stay internal.)

- [ ] **Step 4: Switch the docs examples to the alias**

In `WEB/components/examples/columns.tsx` and `WEB/components/examples/registry.tsx`:
- Replace `import type { ColumnDef } from "@tanstack/react-table"` with `DataTableColumnDef` added to the existing `@monabbir/shadcn-react-table/components/data-table` type import. If the file has no such import, add `import type { DataTableColumnDef } from "@monabbir/shadcn-react-table/components/data-table"`.
- Replace every `ColumnDef<` with `DataTableColumnDef<` (sites: `columns.tsx:56`, `registry.tsx:369, 536-537, 762-763`).

- [ ] **Step 5: Verify**

Run: `pnpm --filter @monabbir/shadcn-react-table typecheck && pnpm --filter shadcn-react-table-web typecheck && pnpm --filter @monabbir/shadcn-react-table test`
Expected: typecheck passes in both packages; 86 tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/shadcn-react-table/src/components/data-table/core/table-types.ts packages/shadcn-react-table/src/components/data-table/index.ts apps/web/components/examples/columns.tsx apps/web/components/examples/registry.tsx
git commit -m "feat: add DataTableColumnDef and related public type aliases"
```

---

### Task 2: Characterization tests (on v8)

Locks the engine behaviour the v9 flip must preserve. Every test **must pass on v8 now**. The file imports nothing from `@tanstack/*`, so it runs unchanged after the flip.

**Files:**
- Create: `DT/core/use-data-table.behavior.test.tsx`

**Interfaces:**
- Consumes: `DataTableColumnDef` (Task 1); `useDataTable`; `getColumnPinningStyle` from `DT/utils/column-styles.ts`; `UseDataTableOptions` from `DT/core/types.ts`.
- Relies on these instance members, which have the same names in v8 and v9: `getRowModel`, `getColumn`, `getRow`, `setSorting`, `setGlobalFilter`, `setColumnSizing`, `getTopRows`, `getCenterRows`, `getSelectedRowModel`, `getState` (on v9 this is our shim from Task 5), `tableInstance.*`; and on rows/columns: `getValue`, `getIsGrouped`, `pin("top")`, `toggleSelected`, `setFilterValue`, `getFacetedUniqueValues`, `getFacetedMinMaxValues`, `getSize`.

- [ ] **Step 1: Write the test file**

```tsx
import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { getColumnPinningStyle } from "../utils/column-styles"
import type { DataTableColumnDef } from "./table-types"
import type { UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

// Behaviour lock for the TanStack engine. Uses only our public hook and
// instance members that keep their names across TanStack majors, so it runs
// unchanged before and after an engine upgrade.

type Person = {
  id: string
  name: string
  dept: string
  age: number
  salary: number
  children?: Person[]
}

const people: Person[] = [
  { id: "1", name: "Joanna", dept: "eng", age: 41, salary: 100 },
  { id: "2", name: "Annabel", dept: "eng", age: 29, salary: 80 },
  { id: "3", name: "Ann", dept: "ops", age: 35, salary: 60 },
  { id: "4", name: "Bob", dept: "ops", age: 52, salary: 40 },
]

const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name", meta: { filterMode: "contains" } },
  { accessorKey: "dept", header: "Dept" },
  { accessorKey: "age", header: "Age" },
  { accessorKey: "salary", header: "Salary", aggregationFn: "sum" },
]

type Options = Partial<UseDataTableOptions<Person>>

function setup(options: Options = {}) {
  return renderHook(() =>
    useDataTable<Person>({
      columns,
      data: people,
      getRowId: (row) => row.id,
      ...options,
    })
  )
}

const ids = (rows: { id: string }[]) => rows.map((row) => row.id)

describe("useDataTable engine behaviour", () => {
  it("renders every row in data order by default", () => {
    const { result } = setup()
    expect(ids(result.current.getRowModel().rows)).toEqual(["1", "2", "3", "4"])
  })

  it("sorts client-side", () => {
    const { result } = setup()
    act(() => result.current.setSorting([{ id: "age", desc: false }]))
    expect(ids(result.current.getRowModel().rows)).toEqual(["2", "3", "1", "4"])
  })

  it("filters a column by its mode and re-filters when the mode changes", () => {
    const { result } = setup()
    act(() => result.current.getColumn("name")!.setFilterValue("ann"))
    expect(ids(result.current.getRowModel().rows)).toEqual(["1", "2", "3"])

    // Switching mode clears the value, then the new mode applies.
    act(() =>
      result.current.tableInstance.setColumnFilterMode("name", "startsWith")
    )
    expect(ids(result.current.getRowModel().rows)).toEqual(["1", "2", "3", "4"])
    act(() => result.current.getColumn("name")!.setFilterValue("ann"))
    expect(ids(result.current.getRowModel().rows)).toEqual(["2", "3"])
  })

  it("global fuzzy search keeps data order when ranking is off", () => {
    const { result } = setup()
    act(() => result.current.setGlobalFilter("ann"))
    expect(ids(result.current.getRowModel().rows)).toEqual(["1", "2", "3"])
  })

  it("global fuzzy search orders by match rank when ranking is on", () => {
    const { result } = setup({ enableGlobalFilterRankedResults: true })
    act(() => result.current.setGlobalFilter("ann"))
    // equal > starts-with > contains
    expect(ids(result.current.getRowModel().rows)).toEqual(["3", "2", "1"])
  })

  it("re-filters when the global filter mode changes", () => {
    const { result } = setup()
    act(() => result.current.setGlobalFilter("ann"))
    act(() => result.current.tableInstance.setGlobalFilterMode("startsWith"))
    expect(ids(result.current.getRowModel().rows)).toEqual(["2", "3"])
  })

  it("applies the advanced filter group", () => {
    const { result } = setup({ enableAdvancedFilter: true })
    act(() =>
      result.current.tableInstance.setAdvancedFilter({
        logic: "and",
        rules: [
          { id: "r1", columnId: "age", operator: "greaterThan", value: 40 },
        ],
      })
    )
    expect(ids(result.current.getRowModel().rows)).toEqual(["1", "4"])
  })

  it("paginates client-side, and shows every row when pagination is off", () => {
    const initialState = { pagination: { pageIndex: 0, pageSize: 2 } }
    expect(
      ids(setup({ initialState }).result.current.getRowModel().rows)
    ).toEqual(["1", "2"])
    expect(
      ids(
        setup({ initialState, enablePagination: false }).result.current.getRowModel()
          .rows
      )
    ).toEqual(["1", "2", "3", "4"])
  })

  it("computes faceted values, and skips them when faceting is off or manual", () => {
    const on = setup().result.current
    expect(Object.fromEntries(on.getColumn("dept")!.getFacetedUniqueValues())).toEqual({
      eng: 2,
      ops: 2,
    })
    expect(on.getColumn("age")!.getFacetedMinMaxValues()).toEqual([29, 52])

    const off = setup({ enableFacetedValues: false }).result.current
    expect(off.getColumn("dept")!.getFacetedUniqueValues().size).toBe(0)
    expect(off.getColumn("age")!.getFacetedMinMaxValues()).toBeUndefined()

    const manual = setup({ manualFiltering: true }).result.current
    expect(manual.getColumn("dept")!.getFacetedUniqueValues().size).toBe(0)
  })

  it("groups and aggregates only when grouping is enabled", () => {
    const initialState = { grouping: ["dept"] }
    const grouped = setup({ enableGrouping: true, initialState }).result.current
    const rows = grouped.getRowModel().rows
    expect(rows).toHaveLength(2)
    expect(rows.every((row) => row.getIsGrouped())).toBe(true)
    const eng = rows.find((row) => row.getValue("dept") === "eng")!
    expect(eng.getValue("salary")).toBe(180)

    const flat = setup({ initialState }).result.current
    expect(ids(flat.getRowModel().rows)).toEqual(["1", "2", "3", "4"])
  })

  it("expands tree data from getSubRows", () => {
    const tree: Person[] = [
      {
        id: "t1",
        name: "Root",
        dept: "eng",
        age: 50,
        salary: 1,
        children: [{ id: "t2", name: "Leaf", dept: "eng", age: 20, salary: 1 }],
      },
      { id: "t3", name: "Solo", dept: "ops", age: 30, salary: 1 },
    ]
    const base = { data: tree, getSubRows: (row: Person) => row.children }
    expect(
      ids(setup(base).result.current.getRowModel().rows)
    ).toEqual(["t1", "t3"])
    expect(
      ids(
        setup({ ...base, initialState: { expanded: true } }).result.current.getRowModel()
          .rows
      )
    ).toEqual(["t1", "t2", "t3"])
  })

  it("pins rows to the top", () => {
    const { result } = setup({ enableRowPinning: true })
    act(() => result.current.getRow("3").pin("top"))
    expect(ids(result.current.getTopRows())).toEqual(["3"])
    expect(ids(result.current.getCenterRows())).toEqual(["1", "2", "4"])
  })

  it("pins columns left/right from initialState and reports left/right state", () => {
    const { result } = setup({
      enableColumnPinning: true,
      initialState: { columnPinning: { left: ["name"], right: ["salary"] } },
    })
    const table = result.current
    expect(getColumnPinningStyle(table.getColumn("name")!)).toMatchObject({
      position: "sticky",
      left: 0,
    })
    expect(getColumnPinningStyle(table.getColumn("salary")!)).toMatchObject({
      position: "sticky",
      right: 0,
    })
    expect(table.getColumn("age")!.getIsPinned()).toBeFalsy()
    expect(table.getState().columnPinning).toEqual({
      left: ["name"],
      right: ["salary"],
    })
  })

  it("pins columns from controlled left/right state", () => {
    const table = setup({
      enableColumnPinning: true,
      state: { columnPinning: { left: ["age"], right: [] } },
    }).result.current
    expect(getColumnPinningStyle(table.getColumn("age")!)).toMatchObject({
      position: "sticky",
      left: 0,
    })
  })

  it("sizes columns and exposes resize info under columnSizingInfo", () => {
    const { result } = setup({ enableColumnResizing: true })
    act(() => result.current.setColumnSizing({ age: 400 }))
    expect(result.current.getColumn("age")!.getSize()).toBe(400)
    expect(result.current.getState().columnSizingInfo.isResizingColumn).toBe(
      false
    )
  })

  it("selects rows", () => {
    const { result } = setup({ enableRowSelection: true })
    act(() => result.current.getRow("2").toggleSelected(true))
    expect(ids(result.current.getSelectedRowModel().rows)).toEqual(["2"])
  })
})
```

- [ ] **Step 2: Run it on v8**

Run: `pnpm --filter @monabbir/shadcn-react-table test -- use-data-table.behavior`
Expected: all 16 tests PASS. If one fails on v8, the expectation is wrong, not the engine: fix the expected value to match current v8 behaviour (that is what we are locking), note it in the commit, and move on. Do not change library code in this task.

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @monabbir/shadcn-react-table typecheck`
Expected: PASS. If `aggregationFn: "sum"` widens to `string`, write it as `aggregationFn: "sum" as const`.

- [ ] **Step 4: Commit**

```bash
git add packages/shadcn-react-table/src/components/data-table/core/use-data-table.behavior.test.tsx
git commit -m "test: lock data-table engine behaviour before tanstack upgrade"
```

---

### Task 3: Route internal types through the aliases (on v8)

A mechanical refactor with no behaviour change. Afterwards, only `table-types.ts`, the row-model creators, `RowData`, `flexRender`, `TableOptions` and the `ColumnMeta` augmentation still import from `@tanstack/react-table`.

**Files:** every file under `DT/` that imports `Row`, `Column`, `Cell`, `Header`, `Table`, `RowModel`, `FilterFn`, or `ColumnDef` from `@tanstack/react-table`. List them with:

```bash
grep -rlE 'import (type )?\{[^}]*\b(Row|Column|Cell|Header|Table|RowModel|FilterFn|ColumnDef)\b[^}]*\} from "@tanstack/react-table"' packages/shadcn-react-table/src/components/data-table
```

(Multi-line imports: also run `grep -rl '@tanstack/react-table' packages/shadcn-react-table/src/components/data-table` and inspect each hit.)

**Interfaces:**
- Consumes: the aliases from Task 1.
- Produces: no TanStack generic type references outside `DT/core/table-types.ts`, except inside the `declare module "@tanstack/react-table"` block in `types.ts`.

- [ ] **Step 1: Apply the rewrite rules in each listed file**

| Replace | With |
|---|---|
| `Row<X>` | `DataTableRow<X>` |
| `Column<X, Y>` / `Column<X>` | `DataTableColumn<X, Y>` / `DataTableColumn<X>` |
| `Cell<X, Y>` | `DataTableCell<X, Y>` |
| `Header<X, Y>` | `DataTableHeader<X, Y>` |
| `Table<X>` (the TanStack type, **not** the shadcn `<Table>` component) | `DataTableCoreTable<X>` |
| `RowModel<X>` | `DataTableRowModel<X>` |
| `FilterFn<X>` | `DataTableFilterFn<X>` |
| `ColumnDef<X, Y>` | `DataTableColumnDef<X, Y>` |
| `(table: Table<X>) => () => RowModel<X>` | `DataTableRowModelFactory<X>` |

Then drop those names from the file's `@tanstack/react-table` import and add `import type { … } from "<relative path>/core/table-types"` (in `core/` files use `./table-types`). Keep `RowData` imported from `@tanstack/react-table`. Leave runtime imports (`getSortedRowModel`, `getFilteredRowModel`, `flexRender`, row models in `use-data-table.ts`) alone.

**Exceptions:**
- In `DT/core/types.ts`, inside `declare module "@tanstack/react-table" { interface ColumnMeta<TData extends RowData, TValue> { … } }`, keep `Column<TData, TValue>` exactly as it is. Augmentations must reference the module's own names. The `TableOptions` import also stays.
- In `DT/core/types.ts` change `DataTableInstance` to `DataTableCoreTable<TData> & { tableInstance: DataTableConfig<TData> }`.
- `UseDataTableOptions` keeps `extends Omit<TableOptions<TData>, "getCoreRowModel">` for now (Task 5 replaces it).

- [ ] **Step 2: Confirm nothing was missed**

```bash
grep -rnE '\b(Row|Column|Cell|Header|RowModel|FilterFn|ColumnDef)<' packages/shadcn-react-table/src/components/data-table --include=*.ts --include=*.tsx | grep -v 'DataTable\(Row\|Column\|Cell\|Header\|RowModel\|FilterFn\|ColumnDef\)<' | grep -v 'core/table-types.ts'
```

Expected: the only hits are the `Column<TData, TValue>` references inside the `ColumnMeta` augmentation in `core/types.ts`. Also check `Table<` by eye. Hits for the shadcn `<Table>`/`TableRow` components are expected; TanStack `Table<TData>` should be gone.

- [ ] **Step 3: Verify**

Run: `pnpm --filter @monabbir/shadcn-react-table typecheck && pnpm --filter @monabbir/shadcn-react-table lint && pnpm --filter @monabbir/shadcn-react-table test`
Expected: all PASS (102 tests: 86 existing + 16 from Task 2).

- [ ] **Step 4: Commit**

```bash
git add -A packages/shadcn-react-table/src
git commit -m "refactor: route data-table internals through own tanstack type aliases"
```

---

### Task 4: Column-pinning adapter + state mappers (on v8)

All internal pinning goes through one module, so the v9 `start`/`end` change happens in a single place. The pure state mappers needed by Task 5 are built and tested here.

**Files:**
- Create: `DT/helpers/column-pinning.ts`
- Create: `DT/helpers/column-pinning.test.ts`
- Modify: `DT/utils/column-styles.ts:10-42`
- Modify: `DT/components/menus/data-table-column-actions.tsx:56, 158-171`
- Modify: `DT/index.ts` (export the state type)

**Interfaces:**
- Produces:
  - `type PinSide = "left" | "right"`
  - `interface DataTableColumnPinningState { left?: string[]; right?: string[] }` (public)
  - `interface CoreColumnPinningState { start: string[]; end: string[] }`
  - `getPinSide(column: DataTableColumn<TData, TValue>): PinSide | false`
  - `pinColumn(column: DataTableColumn<TData, TValue>, side: PinSide | false): void`
  - `getPinOffset(column: DataTableColumn<TData, TValue>, side: PinSide): number`
  - `isPinnedEdgeColumn(column: DataTableColumn<TData, TValue>, side: PinSide): boolean` (last left / first right)
  - `toCorePinning(state: DataTableColumnPinningState): CoreColumnPinningState`
  - `fromCorePinning(state: Partial<CoreColumnPinningState>): Required<DataTableColumnPinningState>`
  - `mapPinningUpdater(onChange: OnChangeFn<DataTableColumnPinningState>): OnChangeFn<CoreColumnPinningState>`

- [ ] **Step 1: Write the failing test for the pure mappers**

`DT/helpers/column-pinning.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest"

import {
  fromCorePinning,
  mapPinningUpdater,
  toCorePinning,
} from "./column-pinning"

describe("column pinning state mappers", () => {
  it("maps left/right to start/end, defaulting missing sides to []", () => {
    expect(toCorePinning({ left: ["a"] })).toEqual({ start: ["a"], end: [] })
    expect(toCorePinning({ left: ["a"], right: ["b"] })).toEqual({
      start: ["a"],
      end: ["b"],
    })
  })

  it("maps start/end back to left/right", () => {
    expect(fromCorePinning({ start: ["a"], end: ["b"] })).toEqual({
      left: ["a"],
      right: ["b"],
    })
    expect(fromCorePinning({})).toEqual({ left: [], right: [] })
  })

  it("translates a value updater", () => {
    const onChange = vi.fn()
    mapPinningUpdater(onChange)({ start: ["x"], end: [] })
    const updater = onChange.mock.calls[0]![0]
    expect(updater({ left: [], right: [] })).toEqual({ left: ["x"], right: [] })
  })

  it("translates a functional updater through the consumer's prev state", () => {
    const onChange = vi.fn()
    mapPinningUpdater(onChange)((prev) => ({
      start: [...prev.start, "y"],
      end: prev.end,
    }))
    const updater = onChange.mock.calls[0]![0]
    expect(updater({ left: ["x"], right: ["z"] })).toEqual({
      left: ["x", "y"],
      right: ["z"],
    })
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @monabbir/shadcn-react-table test -- column-pinning`
Expected: FAIL, `Failed to resolve import "./column-pinning"`.

- [ ] **Step 3: Implement `DT/helpers/column-pinning.ts` (v8 internals)**

```ts
import type { OnChangeFn, RowData } from "@tanstack/react-table"

import type { DataTableColumn } from "../core/table-types"

// Column pinning speaks physical left/right in our API. TanStack v9 speaks
// logical start/end; this module is the only place that translates, so the
// rest of the table never sees TanStack's pinning vocabulary.

export type PinSide = "left" | "right"

/** Column pinning state as consumers pass it (`initialState`, `state`). */
export interface DataTableColumnPinningState {
  left?: string[]
  right?: string[]
}

/** TanStack v9's column pinning state shape. */
export interface CoreColumnPinningState {
  start: string[]
  end: string[]
}

export function getPinSide<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>
): PinSide | false {
  return column.getIsPinned()
}

export function pinColumn<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>,
  side: PinSide | false
): void {
  column.pin(side)
}

/** Sticky offset from the pinned edge, so stacked pinned columns line up. */
export function getPinOffset<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>,
  side: PinSide
): number {
  return side === "left" ? column.getStart("left") : column.getAfter("right")
}

/** The boundary column of a pinned group: last on the left, first on the right. */
export function isPinnedEdgeColumn<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>,
  side: PinSide
): boolean {
  return side === "left"
    ? column.getIsLastColumn("left")
    : column.getIsFirstColumn("right")
}

export function toCorePinning(
  state: DataTableColumnPinningState
): CoreColumnPinningState {
  return { start: state.left ?? [], end: state.right ?? [] }
}

export function fromCorePinning(
  state: Partial<CoreColumnPinningState>
): Required<DataTableColumnPinningState> {
  return { left: state.start ?? [], right: state.end ?? [] }
}

/** Adapts a consumer's left/right change handler to TanStack's start/end one.
 *  Always hands the consumer a functional updater (TanStack's convention). */
export function mapPinningUpdater(
  onChange: OnChangeFn<DataTableColumnPinningState>
): OnChangeFn<CoreColumnPinningState> {
  return (updater) =>
    onChange((prev) =>
      fromCorePinning(
        typeof updater === "function" ? updater(toCorePinning(prev)) : updater
      )
    )
}
```

- [ ] **Step 4: Run the mapper tests to verify they pass**

Run: `pnpm --filter @monabbir/shadcn-react-table test -- column-pinning`
Expected: 4 PASS.

- [ ] **Step 5: Route `column-styles.ts` through the adapter**

Replace `getColumnPinningStyle` and `getColumnPinningClass` (`DT/utils/column-styles.ts:10-42`) with:

```ts
export function getColumnPinningStyle<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>
): CSSProperties {
  const side = getPinSide(column)
  if (!side) return {}
  return { position: "sticky", zIndex: 2, [side]: getPinOffset(column, side) }
}

export function getColumnPinningClass<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>
): string {
  const side = getPinSide(column)
  if (!side || !isPinnedEdgeColumn(column, side)) return ""
  return side === "left"
    ? "after:pointer-events-none after:absolute after:inset-y-0 after:-right-px after:w-2 after:translate-x-full after:bg-gradient-to-r after:from-border/60 after:to-transparent"
    : "before:pointer-events-none before:absolute before:inset-y-0 before:-left-px before:w-2 before:-translate-x-full before:bg-gradient-to-l before:from-border/60 before:to-transparent"
}
```

Add `import { getPinOffset, getPinSide, isPinnedEdgeColumn } from "../helpers/column-pinning"`. Keep the existing JSDoc comments above each function.

- [ ] **Step 6: Route the column-actions menu through the adapter**

In `DT/components/menus/data-table-column-actions.tsx`:
- line 56: `const pinned = column.getIsPinned()` becomes `const pinned = getPinSide(column)`
- line 159: `onClick={() => column.pin("left")}` becomes `onClick={() => pinColumn(column, "left")}`
- line 166: `onClick={() => column.pin("right")}` becomes `onClick={() => pinColumn(column, "right")}`
- line 173: `onClick={() => column.pin(false)}` becomes `onClick={() => pinColumn(column, false)}`
- add `import { getPinSide, pinColumn } from "../../helpers/column-pinning"`

`data-pinned={column.getIsPinned() || undefined}` in `data-table-body.tsx:132` and `dnd/head-cell.tsx:97`: change both to `data-pinned={getPinSide(column) || undefined}` (use `cell.column` in the body), so the DOM attribute keeps saying `left`/`right` after the flip.

- [ ] **Step 7: Export the public state type**

In `DT/index.ts` add: `export type { DataTableColumnPinningState } from "./helpers/column-pinning"`.

- [ ] **Step 8: Verify**

Run: `pnpm --filter @monabbir/shadcn-react-table typecheck && pnpm --filter @monabbir/shadcn-react-table lint && pnpm --filter @monabbir/shadcn-react-table test`
Expected: all PASS (106 tests). The Task 2 pinning tests prove the style output is unchanged.

- [ ] **Step 9: Commit**

```bash
git add packages/shadcn-react-table/src/components/data-table/helpers/column-pinning.ts packages/shadcn-react-table/src/components/data-table/helpers/column-pinning.test.ts packages/shadcn-react-table/src/components/data-table/utils/column-styles.ts packages/shadcn-react-table/src/components/data-table/components/menus/data-table-column-actions.tsx packages/shadcn-react-table/src/components/data-table/components/body/data-table-body.tsx packages/shadcn-react-table/src/components/data-table/components/body/dnd/head-cell.tsx packages/shadcn-react-table/src/components/data-table/index.ts
git commit -m "refactor: centralize column pinning behind a left/right adapter"
```

---

### Task 5: Flip the engine to TanStack Table v9

The one task where TanStack changes. The adapters from Tasks 1, 3 and 4 limit it to: dependencies, the alias definitions, the features module, the hook, the fn files, the state shim, render-context injection, and one rename. Gate: all Task 2 + Task 4 tests pass **unchanged** (only the two existing tests that import `getCoreRowModel` get edited).

**Files:**
- Modify: `packages/shadcn-react-table/package.json`, `WEB/package.json`, `pnpm-lock.yaml` (via pnpm)
- Create: `DT/core/features.ts`, `DT/helpers/table-state.ts`
- Modify: `DT/core/table-types.ts`, `DT/core/types.ts`, `DT/core/use-data-table.ts`
- Modify: `DT/fns/filter-factories.ts`, `DT/fns/ranked-row-model.ts`, `DT/fns/advanced-filter.ts`
- Modify: `DT/hooks/use-global-filter-mode.ts`
- Modify: `DT/helpers/column-pinning.ts` (adapter internals only)
- Modify: `DT/components/body/render-body-cell.tsx`, `DT/components/body/data-table-footer.tsx`, `DT/components/head/data-table-column-header.tsx` (render context)
- Modify: `DT/components/toolbar/data-table-alert-banner.tsx:24`
- Modify: `DT/core/use-data-table.infinite-scroll.test.tsx`, `DT/core/use-data-table.row-height.test.tsx` (drop `getCoreRowModel`)

**Interfaces:**
- Consumes: all aliases (Task 1), the adapter + mappers (Task 4), `rankedSortedRowModel` (`useGlobalFilterMode`), `advancedFilteredRowModel` (`useAdvancedFilter`).
- Produces:
  - `DataTableFeatures` (type, re-exported from `table-types.ts` and the public barrel)
  - `createDataTableFeatures(params: { gates: () => RowModelGates; filteredRowModel: DataTableFeatures["filteredRowModel"]; sortedRowModel: DataTableFeatures["sortedRowModel"] }): DataTableFeatures` (the hooks' `DataTableRowModelFactory<TData>` values are passed in; cast at the call site if TS rejects the generic `TData`)
  - `interface RowModelGates { pagination: boolean; grouping: boolean; expanding: boolean; faceting: boolean }`
  - `DataTableState`: v9 state shown in our stable shape (`columnPinning` as left/right, `columnSizingInfo` alias of `columnResizing`)
  - `toDataTableState(state: TableState<DataTableFeatures>): DataTableState`
  - `DataTableInstance<TData>` gains `getState(): DataTableState` and keeps `tableInstance`
  - The instance returned by `useDataTable` keeps **one identity for the hook's lifetime** (same as v8)

- [ ] **Step 1: Bump dependencies**

```bash
pnpm --filter @monabbir/shadcn-react-table add @tanstack/react-table@^9.2.8 @tanstack/match-sorter-utils@^9.2.6
pnpm --filter shadcn-react-table-web add @tanstack/react-table@^9.2.8
```

Expected: both `package.json` ranges updated; `pnpm-lock.yaml` resolves `@tanstack/react-table@9.2.8`, which pulls in `@tanstack/table-core@9.2.8` and `@tanstack/react-store`.

- [ ] **Step 2: Create `DT/core/features.ts`**

```ts
import type { RankingInfo } from "@tanstack/match-sorter-utils"
import {
  aggregationFns,
  createExpandedRowModel,
  createFacetedMinMaxValues,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createGroupedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  metaHelper,
  sortFns,
  stockFeatures,
  tableFeatures,
} from "@tanstack/react-table"

// Every built-in feature (MRT parity) plus every row model and the full fn
// registries, so string fns like "sum" / "mean" / "includesString" and the
// "auto" defaults resolve as they did on TanStack v8. `filterMeta` types what
// the fuzzy global filter stores via `addMeta` (match-sorter's RankingInfo).
const baseFeatures = tableFeatures({
  ...stockFeatures,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  groupedRowModel: createGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  facetedMinMaxValues: createFacetedMinMaxValues(),
  filterFns,
  sortFns,
  aggregationFns,
  filterMeta: metaHelper<RankingInfo>(),
})

export type DataTableFeatures = typeof baseFeatures

/** Which row-model stages run. Read on every row-model call, so they track
 *  the latest options without recreating the (cached-once) factories. */
export interface RowModelGates {
  pagination: boolean
  grouping: boolean
  expanding: boolean
  faceting: boolean
}

const EMPTY_FACETS = new Map<unknown, number>()

/**
 * The per-table feature set. TanStack builds each row model once, on first
 * use, from whatever is on `features` at that moment, so stages that our
 * options can switch off are wrapped in gates that read the current config
 * instead of being omitted. Filtering and sorting take our own factories (the
 * advanced-filter and fuzzy-rank wrappers).
 */
export function createDataTableFeatures({
  gates,
  filteredRowModel,
  sortedRowModel,
}: {
  gates: () => RowModelGates
  filteredRowModel: DataTableFeatures["filteredRowModel"]
  sortedRowModel: DataTableFeatures["sortedRowModel"]
}): DataTableFeatures {
  return {
    ...baseFeatures,
    filteredRowModel,
    sortedRowModel,
    groupedRowModel: (table) => {
      const model = baseFeatures.groupedRowModel(table)
      return () =>
        gates().grouping ? model() : table.getPreGroupedRowModel()
    },
    expandedRowModel: (table) => {
      const model = baseFeatures.expandedRowModel(table)
      return () =>
        gates().expanding ? model() : table.getPreExpandedRowModel()
    },
    paginatedRowModel: (table) => {
      const model = baseFeatures.paginatedRowModel(table)
      return () =>
        gates().pagination ? model() : table.getPrePaginatedRowModel()
    },
    facetedRowModel: (table, columnId) => {
      const model = baseFeatures.facetedRowModel(table, columnId)
      return () =>
        gates().faceting ? model() : table.getPreFilteredRowModel()
    },
    facetedUniqueValues: (table, columnId) => {
      const values = baseFeatures.facetedUniqueValues(table, columnId)
      return () => (gates().faceting ? values() : EMPTY_FACETS)
    },
    facetedMinMaxValues: (table, columnId) => {
      const values = baseFeatures.facetedMinMaxValues(table, columnId)
      return () => (gates().faceting ? values() : undefined)
    },
  }
}
```

If TS rejects a wrapper slot because of v9's `in out` generic variance, annotate that slot's value with `as DataTableFeatures["<slot>"]`. Don't loosen `DataTableFeatures` itself.

- [ ] **Step 3: Switch `DT/core/table-types.ts` to v9 definitions**

Replace the file body with the same aliases, now passing `DataTableFeatures`:

```ts
import type {
  Cell,
  CellData,
  Column,
  ColumnDef,
  FilterFn,
  Header,
  Row,
  RowData,
  RowModel,
  Table,
} from "@tanstack/react-table"

import type { DataTableFeatures } from "./features"

// Our names for TanStack's generic types. This file is the only place that
// knows TanStack's generic arity (v9 adds the feature-set parameter), so
// consumers type columns with `DataTableColumnDef<TData>` and never see it.

export type { DataTableFeatures } from "./features"

export type DataTableColumnDef<
  TData extends RowData,
  TValue extends CellData = CellData,
> = ColumnDef<DataTableFeatures, TData, TValue>

export type DataTableRow<TData extends RowData> = Row<DataTableFeatures, TData>

export type DataTableColumn<
  TData extends RowData,
  TValue extends CellData = CellData,
> = Column<DataTableFeatures, TData, TValue>

export type DataTableCell<
  TData extends RowData,
  TValue extends CellData = CellData,
> = Cell<DataTableFeatures, TData, TValue>

export type DataTableHeader<
  TData extends RowData,
  TValue extends CellData = CellData,
> = Header<DataTableFeatures, TData, TValue>

/** The raw TanStack table (no `tableInstance` config attached). */
export type DataTableCoreTable<TData extends RowData> = Table<
  DataTableFeatures,
  TData
>

export type DataTableRowModel<TData extends RowData> = RowModel<
  DataTableFeatures,
  TData
>

export type DataTableFilterFn<TData extends RowData> = FilterFn<
  DataTableFeatures,
  TData
>

/** A row-model factory: called once per table, returns the memoized getter. */
export type DataTableRowModelFactory<TData extends RowData> = (
  table: DataTableCoreTable<TData>
) => () => DataTableRowModel<TData>
```

(`CellData` is `unknown`, so `TValue` keeps an `unknown` default.) Add `DataTableFeatures` to the `DT/index.ts` type export from `./core/table-types`.

- [ ] **Step 4: Create `DT/helpers/table-state.ts`**

```ts
import type { TableState } from "@tanstack/react-table"

import type { DataTableFeatures } from "../core/features"
import {
  fromCorePinning,
  type DataTableColumnPinningState,
} from "./column-pinning"

type CoreState = TableState<DataTableFeatures>

/** Table state in our stable shape: v8-style left/right column pinning and
 *  the v8 `columnSizingInfo` name for TanStack v9's `columnResizing`. Every
 *  other slice is passed through by reference (memo deps stay stable). */
export type DataTableState = Omit<CoreState, "columnPinning"> & {
  columnPinning: Required<DataTableColumnPinningState>
  columnSizingInfo: CoreState["columnResizing"]
}

export function toDataTableState(state: CoreState): DataTableState {
  return {
    ...state,
    columnPinning: fromCorePinning(state.columnPinning),
    columnSizingInfo: state.columnResizing,
  }
}
```

Export `DataTableState` from `DT/index.ts`.

- [ ] **Step 5: Update `DT/core/types.ts`**

1. `ColumnMeta` augmentation, new generic header (keep the body; inside it `Column<TData, TValue>` becomes `Column<TFeatures, TData, TValue>`):

```ts
declare module "@tanstack/react-table" {
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  > {
    // …existing members unchanged except:
    renderColumnFilter?: (props: {
      column: Column<TFeatures, TData, TValue>
      table: DataTableInstance<TData>
    }) => React.ReactNode
  }
}
```

The type parameter names and constraints must match v9's declaration exactly (`TFeatures extends TableFeatures`, `TData extends RowData`, `TValue extends CellData = CellData`), or declaration merging fails with "All declarations of 'ColumnMeta' must have identical type parameters". Import `CellData`, `Column`, `TableFeatures` as types from `@tanstack/react-table`. `CellRenderProps<TData, TValue>` is used inside the meta and keeps its own signature (it already uses our aliases).

2. Instance type:

```ts
import type { ReactTable } from "@tanstack/react-table"
import type { DataTableState } from "../helpers/table-state"

/** The TanStack v9 React table enriched with our `tableInstance` config and a
 *  `getState()` that returns state in our stable (left/right) shape. */
export type DataTableInstance<TData extends RowData = unknown> = ReactTable<
  DataTableFeatures,
  TData
> & {
  tableInstance: DataTableConfig<TData>
  getState: () => DataTableState
}
```

If `ReactTable` is not exported from `@tanstack/react-table`'s index, use `ReturnType<typeof useTable<DataTableFeatures, TData>>` (import `useTable` with `import type`).

3. Options type:

```ts
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
  initialState?: Omit<
    NonNullable<CoreTableOptions<TData>["initialState"]>,
    "columnPinning"
  > & { columnPinning?: DataTableColumnPinningState }
  state?: Omit<NonNullable<CoreTableOptions<TData>["state"]>, "columnPinning"> & {
    columnPinning?: DataTableColumnPinningState
  }
  onColumnPinningChange?: OnChangeFn<DataTableColumnPinningState>
  // …the existing body from `localization?` onward, unchanged…
}
```

Remove the old `getCoreRowModel?: TableOptions<TData>["getCoreRowModel"]` member.

- [ ] **Step 6: Move the fn files to v9**

`DT/fns/filter-factories.ts`: the import becomes `import type { RowData } from "@tanstack/react-table"` plus `import type { DataTableFilterFn } from "../core/table-types"` (Task 3 already switched the type names). In `createGlobalFilterFn`, `addMeta` is optional in v9: change `addMeta(itemRank)` to `addMeta?.(itemRank)`.

`DT/fns/ranked-row-model.ts`: `import { getSortedRowModel } from "@tanstack/react-table"` becomes `import { createSortedRowModel } from "@tanstack/react-table"`; `const base = getSortedRowModel<TData>()` becomes `const base = createSortedRowModel<DataTableFeatures, TData>()` (import `DataTableFeatures` from `../core/table-types`).

`DT/fns/advanced-filter.ts`: `getFilteredRowModel` becomes `createFilteredRowModel`; `const base = getFilteredRowModel<TData>()` becomes `const base = createFilteredRowModel<DataTableFeatures, TData>()`.

`DT/hooks/use-global-filter-mode.ts:89`: the predicate receives the **core** table, which has no `getState` in v9: `const s = t.getState()` becomes `const s = t.store.state`.

- [ ] **Step 7: Rewire `DT/core/use-data-table.ts`**

1. Imports: replace the `@tanstack/react-table` block (lines 3-14) with
   `import { useTable, type RowData } from "@tanstack/react-table"`; add
   `import { createDataTableFeatures, type RowModelGates } from "./features"`,
   `import { mapPinningUpdater, toCorePinning } from "../helpers/column-pinning"`,
   `import { toDataTableState } from "../helpers/table-state"`.

2. After the `useAdvancedFilter(...)` call (around line 261), add the gates ref and the per-table features (same render-phase latest-ref pattern as `use-advanced-filter.ts`):

```ts
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
  const [features] = React.useState(() =>
    createDataTableFeatures({
      // eslint-disable-next-line react-hooks/refs
      gates: () => gatesRef.current,
      filteredRowModel: advancedFilteredRowModel,
      sortedRowModel: rankedSortedRowModel,
    })
  )
```

(`useAdvancedFilter` already feeds an empty group when the feature is off, so its model is a pass-through. It is always the filtered model now.)

3. Map consumer pinning (left/right) to TanStack (start/end). Memoize on the consumer's slice so the controlled-state object handed to TanStack keeps a stable reference (TanStack republishes controlled state on shallow change; a fresh object every render would loop):

```ts
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
      stateProp && {
        ...stateProp,
        ...(corePinning && { columnPinning: corePinning }),
      },
    [stateProp, corePinning]
  )
  const pinningChange = React.useMemo(
    () => onColumnPinningChange && mapPinningUpdater(onColumnPinningChange),
    [onColumnPinningChange]
  )
```

4. Replace the `useReactTable` call (lines 352-413) with the code below. Every option the old call set keeps its value; the `get*RowModel` options and their `tableOptions.get*RowModel` passthroughs are dropped (v9 has no such options).

```ts
  // The React Compiler bails on TanStack Table's mutable instance; expected.
  // eslint-disable-next-line react-hooks/incompatible-library
  const reactTable = useTable<DataTableFeatures, TData>({
    ...coreOptions,
    features,
    initialState: initialState && {
      ...initialState,
      columnPinning:
        initialState.columnPinning &&
        toCorePinning(initialState.columnPinning),
    },
    state,
    onColumnPinningChange: pinningChange,
    columns: sizedColumns,
    autoResetPageIndex: tableOptions.autoResetPageIndex ?? false,
    defaultColumn: {
      filterFn: dynamicFilterFn,
      ...tableOptions.defaultColumn,
    },
    enableGlobalFilter,
    globalFilterFn: tableOptions.globalFilterFn ?? dynamicGlobalFilterFn,
    enableColumnPinning,
    enableColumnResizing,
    columnResizeMode: tableOptions.columnResizeMode ?? "onChange",
    enableRowPinning,
    keepPinnedRows: tableOptions.keepPinnedRows ?? true,
    enableGrouping,
    enableExpanding,
    getRowCanExpand:
      tableOptions.getRowCanExpand ??
      (renderDetailPanel ? () => true : undefined),
  })

  // v9's useTable returns a fresh wrapper every render; keep one instance for
  // the hook's lifetime (v8 semantics: consumers and our memos rely on a stable
  // `table`) and refresh its fields from the latest wrapper.
  const tableRef = React.useRef<DataTableInstance<TData> | null>(null)
  // eslint-disable-next-line react-hooks/refs
  const table = Object.assign(
    tableRef.current ?? ({} as DataTableInstance<TData>),
    reactTable,
    { getState: () => toDataTableState(reactTable.store.state) }
  )
  // eslint-disable-next-line react-hooks/refs
  tableRef.current = table
```

`initialState.columnPinning &&` can leave `columnPinning: undefined`. That is allowed (the slice is optional) and TanStack falls back to its default `{ start: [], end: [] }`.

Keep `table.tableInstance = config` and `return table` at the end unchanged. Import `DataTableFeatures` as a type from `./features`.

- [ ] **Step 8: Hand our instance to render contexts**

In v9, `cell.getContext().table` / `header.getContext().table` is the **core** table, so column renderers that read `table.tableInstance` break: `injected-columns/data-table-row-actions.tsx:66` already does, and so do consumers' `cell: ({ table }) => …`. Every `flexRender` call site must pass our instance:

- `DT/components/body/render-body-cell.tsx` (3 sites: lines ~51, ~64-67, ~115): `flexRender(def, cell.getContext())` becomes `flexRender(def, { ...cell.getContext(), table })`
- `DT/components/body/data-table-footer.tsx` (~line 3 import, footer call site): `header.getContext()` becomes `{ ...header.getContext(), table }`
- `DT/components/head/data-table-column-header.tsx:91`: `flexRender(column.columnDef.header, header.getContext())` becomes `flexRender(column.columnDef.header, { ...header.getContext(), table })`

In each file, `table` is the `DataTableInstance` prop already in scope. Then grep for any other place that reads the table off a row/cell/column/header and fix it the same way:

```bash
grep -rnE '\b(row|cell|column|header|ctx|context)\.table\b|getContext\(\)\.table' packages/shadcn-react-table/src/components/data-table --include=*.tsx --include=*.ts
```

Expected: no remaining reads of `row.table`, `cell.table`, `column.table`, `header.table`, or `getContext().table`.

- [ ] **Step 9: Point the pinning adapter at v9 (`DT/helpers/column-pinning.ts`)**

Only the four adapter functions change. The public types and mappers stay the same.

```ts
export function getPinSide<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>
): PinSide | false {
  const pinned = column.getIsPinned()
  return pinned === "start" ? "left" : pinned === "end" ? "right" : false
}

export function pinColumn<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>,
  side: PinSide | false
): void {
  column.pin(side === "left" ? "start" : side === "right" ? "end" : false)
}

export function getPinOffset<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>,
  side: PinSide
): number {
  return side === "left" ? column.getStart("start") : column.getAfter("end")
}

export function isPinnedEdgeColumn<TData extends RowData, TValue>(
  column: DataTableColumn<TData, TValue>,
  side: PinSide
): boolean {
  return side === "left"
    ? column.getIsLastColumn("start")
    : column.getIsFirstColumn("end")
}
```

(The adapter keeps `left`/`right` physical. RTL is out of scope.)

- [ ] **Step 10: Rename the pre-pagination model**

`DT/components/toolbar/data-table-alert-banner.tsx:24`: `table.getPrePaginationRowModel()` becomes `table.getPrePaginatedRowModel()`. Then:

```bash
grep -rnE 'getPaginationRowModel|getPrePaginationRowModel|columnSizingInfo|\.getState\(\)' packages/shadcn-react-table/src/components/data-table --include=*.ts --include=*.tsx
```

Expected: `getState()` hits only on **our** instance (component props typed `DataTableInstance`), never on a core table inside a row-model factory or predicate. `columnSizingInfo` hits only via `getState()` (served by the shim). No `getPaginationRowModel` / `getPrePaginationRowModel`.

- [ ] **Step 11: Drop `getCoreRowModel` from the two existing hook tests**

In `DT/core/use-data-table.infinite-scroll.test.tsx` and `DT/core/use-data-table.row-height.test.tsx`: delete `import { getCoreRowModel } from "@tanstack/react-table"` and the `getCoreRowModel: getCoreRowModel(),` option line. No other change.

- [ ] **Step 12: Verify the flip**

Run: `pnpm --filter @monabbir/shadcn-react-table typecheck`
Expected: PASS. Typical residual errors and their fixes:
- a component still annotating a TanStack generic directly: use the alias (Task 3 rules)
- `ColumnMeta` merge error: re-check that the type-parameter header matches Step 5 exactly
- variance on a features slot: cast that slot value as noted in Step 2

Run: `pnpm --filter @monabbir/shadcn-react-table test`
Expected: **all tests PASS, including every Task 2 and Task 4 test unchanged.** A failing behaviour test is a migration bug: fix the engine wiring, never the test. (Exception: if a v9 built-in deliberately changed an aggregation result, e.g. `mean` depth semantics, stop and report to the user rather than editing the expectation.)

Run: `pnpm --filter @monabbir/shadcn-react-table lint`
Expected: PASS. If `react-hooks/incompatible-library` no longer fires on `useTable`, delete that now-unused disable comment.

Run: `pnpm --filter shadcn-react-table-web typecheck`
Expected: PASS (the examples already use `DataTableColumnDef`).

- [ ] **Step 13: Commit**

```bash
git add packages/shadcn-react-table apps/web/package.json pnpm-lock.yaml
git commit -m "feat: upgrade data table engine to tanstack table v9"
```

---

### Task 6: Registry, docs app, and documentation

Ships v9 to consumers: registry deps, API docs, examples, and the written docs.

**Files:**
- Modify: `WEB/scripts/build-registry.mjs:27-40, 148`
- Modify: `WEB/scripts/build-api-docs.mjs:85-98`
- Modify: docs pages from the grep below, `DT/README.md`, root `README.md`, `CLAUDE.md` (the "TanStack Table v8" mention)
- Regenerate: `WEB/public/r/{data-table,registry}.json`, `WEB/lib/api-reference.generated.ts`, `WEB/lib/example-source.generated.ts`

- [ ] **Step 1: Pin the registry's npm dependencies to the major**

In `WEB/scripts/build-registry.mjs` `NPM_DEPENDENCIES`: `"@tanstack/react-table"` becomes `"@tanstack/react-table@^9.2.8"` and `"@tanstack/match-sorter-utils"` becomes `"@tanstack/match-sorter-utils@^9.2.6"`. Leave the other entries bare. The shadcn CLI accepts `name@range`, and this stops a future TanStack major from silently breaking new installs. Line 148: change the description's "(TanStack Table v8)" to "(TanStack Table v9)".

- [ ] **Step 2: Update the API-docs generator**

`WEB/scripts/build-api-docs.mjs:89-92`: the `UseDataTableOptions` entry's `omit: ["getCoreRowModel"]` becomes `omit: []` (that member no longer exists). Line 85 comment: "TanStack TableOptions pass through" (unchanged meaning). Lines 95-98 still find `ColumnMeta` inside `declare module "@tanstack/react-table"`; no change needed.

Run: `pnpm --filter shadcn-react-table-web api:build && git diff --stat apps/web/lib/api-reference.generated.ts`
Expected: the generator succeeds. In the diff, the `getCoreRowModel` row disappears and the new `initialState`/`state`/`onColumnPinningChange` descriptions appear; ColumnMeta rows are unchanged.

- [ ] **Step 3: Update written docs**

List the pages to touch:

```bash
grep -rnlE '@tanstack/react-table|TanStack Table v8|ColumnDef<|useReactTable|getCoreRowModel|getState\(\)|columnPinning|getPaginationRowModel|sortingFn' apps/web/app apps/web/components/home README.md packages/shadcn-react-table/src/components/data-table/README.md CLAUDE.md
```

For each hit:
- `import type { ColumnDef } from "@tanstack/react-table"` becomes `import type { DataTableColumnDef } from "@/components/data-table"` (docs snippets use the consumer's `@/` alias, as the installation page does), and `ColumnDef<` becomes `DataTableColumnDef<`
- "TanStack Table v8" becomes "TanStack Table v9"
- remove `getCoreRowModel: getCoreRowModel()` from snippets
- **column pinning stays `left`/`right`** in `initialState`/`state` snippets (our API). Where a snippet calls instance pinning APIs (`column.pin("left")`, `getIsPinned() === "left"`), change it to `start`/`end` and add one sentence: "Instance pinning methods use TanStack v9's `start`/`end`; table options and `getState()` keep `left`/`right`."
- `table.getState()` snippets stay valid (our shim). Mention `table.store.state` only where showing raw TanStack access.
- `installation` page dependency list: the TanStack versions become `@tanstack/react-table@^9`, `@tanstack/match-sorter-utils@^9`

`DT/README.md:83-84`: "React Compiler is disabled around `useReactTable`/`useVirtualizer` (a known TanStack v8 interaction)" becomes "…around `useTable`/`useVirtualizer` (TanStack's mutable instance)". `CLAUDE.md`: no "v8" claim should remain.

- [ ] **Step 4: Add an upgrade section to the updating guide**

In `WEB/app/docs/guides/updating/page.mdx` add a section "Upgrading to 0.5.0 (TanStack Table v9)":

```mdx
## Upgrading to 0.5.0 (TanStack Table v9)

0.5.0 moves the engine to TanStack Table v9. Re-add the block, then:

1. **Type columns with `DataTableColumnDef`.** TanStack v9's `ColumnDef` needs a
   feature-set type parameter; ours supplies it.

   ```ts
   import type { DataTableColumnDef } from "@/components/data-table"
   const columns: DataTableColumnDef<Person>[] = [...]
   ```

2. **Drop row-model options.** `getCoreRowModel`, `getSortedRowModel`, … are no
   longer accepted; the table wires every row model itself.
3. **Custom aggregation functions** use TanStack v9's
   `constructAggregationFn({ aggregate })` shape. Built-in names (`"sum"`,
   `"mean"`, …) are unchanged.
4. **Instance APIs follow TanStack v9:** `column.pin("start" | "end")`,
   `column.getIsPinned()` returns `"start" | "end"`, `getPrePaginatedRowModel()`.
   Table options and `table.getState()` keep the `left`/`right` pinning shape and
   the `columnSizingInfo` name.
5. **Don't destructure row/column/cell methods** (`const { getValue } = row`); call
   them on the object. Cell-renderer `({ getValue })` still works.
```

- [ ] **Step 5: Regenerate everything and verify the registry**

```bash
pnpm --filter shadcn-react-table-web build
pnpm --filter shadcn-react-table-web registry:verify
```

Expected: build succeeds; `registry fixture typecheck passed`. Check that `apps/web/public/r/data-table.json` lists `"@tanstack/react-table@^9.2.8"`. Restore CRLF-only churn in `apps/web/lib/*.generated.ts` if the content didn't change (see Global Constraints).

- [ ] **Step 6: Manual check in the browser**

Run `pnpm --filter shadcn-react-table-web preview` (serves the static export on `http://localhost:3000`; if that port is busy, run `pnpm --filter shadcn-react-table-web start -- -p 3001` after a build instead). Check these docs examples, in light and dark mode:
- sorting (single + multi), column filters (text modes, select/multi-select options with counts, range-slider bounds), global search (mode switch, ranked results)
- column pinning via the column menu (left, right, unpin), with sticky offsets and edge shadows while scrolling sideways
- column resize drag + double-click autosize; column reorder drag
- grouping (drop zone + menu) with `sum`/`mean` aggregates; tree data expand/collapse; detail panel
- row selection, row pinning (row-number column), row drag reorder
- editing (cell, row, modal, create row), row actions menu (this proves render-context injection)
- pagination (default + pages mode), infinite scroll, row + column virtualization
- server-side example (manual pagination)

Expected: same behaviour as `main`. Note anything different in the PR description.

- [ ] **Step 7: Commit**

```bash
git add apps/web/scripts apps/web/public/r apps/web/lib/api-reference.generated.ts apps/web/app apps/web/components/home README.md packages/shadcn-react-table/src/components/data-table/README.md CLAUDE.md
git commit -m "docs: update registry and docs for tanstack table v9"
```

(Add `apps/web/lib/example-source.generated.ts` only if its content changed.)

---

### Task 7: Release 0.5.0

**Files:**
- Modify: `packages/shadcn-react-table/package.json` (`version`)
- Modify: `packages/shadcn-react-table/CHANGELOG.md`
- Regenerate: `WEB/public/r/{data-table,registry}.json`

- [ ] **Step 1: Bump the version**

`packages/shadcn-react-table/package.json`: `"version": "0.4.2"` becomes `"version": "0.5.0"`. (If `main` has released past 0.4.2 by now, bump the minor from the current version instead and use that number below.)

- [ ] **Step 2: Add the changelog entry**

Insert above the latest `## 0.4.x` section of `packages/shadcn-react-table/CHANGELOG.md`:

```markdown
## 0.5.0

- **Breaking — TanStack Table v9:** the engine now runs on
  `@tanstack/react-table` v9 (native `useTable` with every built-in feature,
  row model, and sort/filter/aggregation function registered, so behaviour
  matches 0.4.x). Re-add the block to pick up the new dependencies. See the
  [upgrade guide](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/updating).
- **New `DataTableColumnDef<TData>` type** (plus `DataTableRow`,
  `DataTableColumn`, `DataTableCell`, `DataTableHeader`, `DataTableState`,
  `DataTableColumnPinningState`, `DataTableFeatures`). Type your columns with
  `DataTableColumnDef` instead of TanStack's `ColumnDef`, which now needs a
  feature-set parameter.
- **Unchanged API:** column pinning in `initialState` / `state` /
  `onColumnPinningChange` and in `table.getState()` keeps `left` / `right`, and
  `getState().columnSizingInfo` keeps its name. The table instance keeps a
  stable identity across renders, and render contexts (`cell: ({ table })`)
  still receive the enriched instance.
- **Removed options:** `getCoreRowModel` and the other `get*RowModel` options;
  the table wires every row model itself.
- **Instance APIs follow TanStack v9:** `column.pin("start" | "end")`,
  `column.getIsPinned()` returns `"start" | "end"`, and
  `getPrePaginationRowModel()` is now `getPrePaginatedRowModel()`. Custom
  aggregation functions use `constructAggregationFn({ aggregate })`.
```

- [ ] **Step 3: Rebuild the registry and verify**

```bash
pnpm --filter shadcn-react-table-web registry:build
pnpm --filter shadcn-react-table-web registry:verify
pnpm lint && pnpm typecheck && pnpm test
```

Expected: the registry is built with `v0.5.0`; verify passes; repo-wide lint/typecheck/test pass.

- [ ] **Step 4: Commit**

```bash
git add packages/shadcn-react-table/package.json packages/shadcn-react-table/CHANGELOG.md apps/web/public/r/data-table.json apps/web/public/r/registry.json
git commit -m "chore: release 0.5.0"
```

After the PR merges to `main`, `.github/workflows/release.yml` publishes `v0.5.0` with this changelog section as the release notes. Nothing else needs to run.

---

## Risks to watch during execution

- **Render-context table** (Task 5 Step 8): anything still reading `getContext().table.tableInstance` breaks at runtime only. Typecheck won't catch it. The row-actions menu in the manual check covers the known site.
- **Controlled-state loops** (Task 5 Step 7.3): any controlled slice we transform must keep a stable reference across renders. Pinning is memoized; don't add transforms for other slices without the same treatment.
- **Aggregation depth:** v9 aggregates direct children by default (`maxAggregationDepth: 0`), which matches v8 for single-level grouping (covered by Task 2). Multi-level grouped `mean` can differ from v8. Check the grouping example manually; if it differs, report it rather than patching it silently.
- **Bundle size:** `stockFeatures` + full registries ships every feature, as v8 did. Trimming to only the features we use is a separate follow-up, not part of this plan.
