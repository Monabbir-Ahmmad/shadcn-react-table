# Reliability & Distribution Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the top-voted outcomes of the 4-member improvement debate: a Vitest harness over the pure layer, characterization tests for the filter engine, a fix for the `useControllableState` batching bug, a lazy-loaded export engine with a CSV formula-injection fix, registry versioning with an update path, and CI that verifies the exact registry artifact consumers receive.

**Architecture:** All test infrastructure lands inside `packages/shadcn-react-table` (source-only package, so Vitest runs the TS directly — no build step). The export engine switches from static to dynamic imports in one leaf file. Registry versioning flows from the package's `package.json` into `build-registry.mjs` output. CI regenerates committed artifacts and typechecks the rewritten registry output in a fixture layout that reproduces the consumer's `@/` aliases.

**Tech Stack:** Vitest 3 + jsdom + @testing-library/react (renderHook), pnpm 10.33.4 workspaces, Turborepo, GitHub Actions.

## Global Constraints

- Package manager: **pnpm 10.33.4**, Node >= 20. Run workspace-scoped installs as `pnpm --filter <pkg> add -D <deps>` **from the repo root**.
- Prettier style (enforced repo-wide): **no semicolons, double quotes, 2-space indent, trailingComma: es5, printWidth 80, LF**. All code below follows it — keep it that way.
- `packages/shadcn-react-table` and `packages/ui` have **no build step**; their `exports` point at `./src/*`. Never add a build/bundling step.
- Generated artifacts (`apps/web/public/r/*.json`, `apps/web/lib/*.generated.ts`) are **committed** — never hand-edit; regenerate via the `apps/web` scripts and commit the result.
- **Commits:** per CLAUDE.md, do NOT run the commit steps unless the user has explicitly asked for commits in the session. When authorized: subject line only, format `<prefix>: <msg>`, no body, no `Co-Authored-By` trailer.
- Docs pages are MDX at `apps/web/app/docs/guides/<slug>/page.mdx`, starting with `export const metadata = { title: "..." }`.
- After code changes, run `graphify update .` once at the end of the session to keep the knowledge graph current.

## Explicitly out of scope (follow-up plans)

Decided by vote but deferred to their own plans, in this order:
1. **Row pinning parity** (`rowPinningDisplayMode`, decouple pin toggle from `enableRowNumbers` in `injected-columns/row-number-column.tsx`).
2. **MRT migration guide** docs page.
3. **Options-surface consolidation** in `core/use-data-table.ts` / `core/types.ts` — including the render-phase `table.tableInstance = config` mutation fix (`use-data-table.ts:635`), which requires the config restructure and must land only after this plan's test coverage exists.
4. State persistence: triple-vetoed as API; ship later as a docs recipe only.

---

### Task 1: Vitest harness + `test` task wiring

**Files:**
- Modify: `packages/shadcn-react-table/package.json`
- Create: `packages/shadcn-react-table/vitest.config.ts`
- Modify: `turbo.json`
- Modify: `package.json` (repo root)
- Test: `packages/shadcn-react-table/src/components/data-table/fns/filter-modes.test.ts` (smoke only; Task 2 expands it)

**Interfaces:**
- Consumes: nothing.
- Produces: `pnpm test` (root, via Turborepo) and `pnpm --filter @monabbir/shadcn-react-table test` run Vitest over `src/**/*.test.{ts,tsx}` with a jsdom environment. Tasks 2–4 add test files under this contract.

- [ ] **Step 1: Install test dependencies**

Run from repo root:

```bash
pnpm --filter @monabbir/shadcn-react-table add -D vitest jsdom @testing-library/react @testing-library/dom
```

Expected: `packages/shadcn-react-table/package.json` devDependencies gain `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/dom`; lockfile updates.

- [ ] **Step 2: Create the Vitest config**

Create `packages/shadcn-react-table/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
})
```

- [ ] **Step 3: Add the `test` script to the package**

In `packages/shadcn-react-table/package.json`, add to `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 4: Write a smoke test**

Create `packages/shadcn-react-table/src/components/data-table/fns/filter-modes.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { MODE_FNS } from "./filter-modes"

describe("MODE_FNS smoke", () => {
  it("contains is case-insensitive", () => {
    expect(MODE_FNS.contains("Hello World", "world")).toBe(true)
  })
})
```

- [ ] **Step 5: Run the test and verify it passes**

Run: `pnpm --filter @monabbir/shadcn-react-table test`
Expected: `1 passed` (1 test file).

- [ ] **Step 6: Wire Turborepo and the root script**

In `turbo.json`, add to `"tasks"`:

```json
"test": {
  "dependsOn": []
}
```

In root `package.json`, add to `"scripts"`:

```json
"test": "turbo test"
```

- [ ] **Step 7: Verify the root pipeline**

Run: `pnpm test`
Expected: Turbo runs `@monabbir/shadcn-react-table#test`, 1 passed; other workspaces are skipped (no `test` script).

- [ ] **Step 8: Verify nothing else broke**

Run: `pnpm typecheck && pnpm lint`
Expected: both pass. If ESLint complains about test files, do NOT disable rules broadly — the `react-internal` config should already accept `.test.ts`; report any failure instead of suppressing it.

- [ ] **Step 9: Commit (only if the user authorized commits)**

```bash
git add packages/shadcn-react-table/package.json packages/shadcn-react-table/vitest.config.ts packages/shadcn-react-table/src/components/data-table/fns/filter-modes.test.ts turbo.json package.json pnpm-lock.yaml
git commit -m "test: add vitest harness for the data-table package"
```

---

### Task 2: Characterization tests for the filter engine

**Files:**
- Modify (replace smoke content): `packages/shadcn-react-table/src/components/data-table/fns/filter-modes.test.ts`

**Interfaces:**
- Consumes: `MODE_FNS`, `isInactive`, `VALUELESS_MODES`, `SUBSTRING_MODES` from `./filter-modes` (existing exports — do not change the source file in this task).
- Produces: a pinned behavioral contract for `fns/filter-modes.ts`, including its known quirks. **These are characterization tests: they document what the code DOES today, quirks included. Do not "fix" the source to make a nicer assertion pass.**

The quirks being pinned (each gets a `KNOWN QUIRK` comment in the test):
1. `fuzzy` mode is an alias of `contains` (per-column fuzzy is not rank-based).
2. `num()` uses `parseFloat`, so `"12abc"` coerces to `12` and matches numeric modes.
3. Date modes floor only the FILTER value with `startOfDay`, not the cell: `after 2024-01-05` matches a cell at `2024-01-05 10:00`.

- [ ] **Step 1: Replace the smoke test with the full characterization suite**

Replace the entire content of `packages/shadcn-react-table/src/components/data-table/fns/filter-modes.test.ts` with:

```ts
import { describe, expect, it } from "vitest"

import {
  MODE_FNS,
  SUBSTRING_MODES,
  VALUELESS_MODES,
  isInactive,
} from "./filter-modes"

describe("text modes", () => {
  it.each([
    ["contains", "Hello World", "world", true],
    ["contains", "Hello World", "xyz", false],
    ["equals", "ABC", "abc", true],
    ["equals", "ABC", "ab", false],
    ["notEquals", "ABC", "abc", false],
    ["notEquals", "ABC", "xyz", true],
    ["startsWith", "Hello", "he", true],
    ["startsWith", "Hello", "lo", false],
    ["endsWith", "Hello", "LO", true],
    ["endsWith", "Hello", "he", false],
  ] as const)("%s(%j, %j) -> %j", (mode, cell, val, expected) => {
    expect(MODE_FNS[mode](cell, val)).toBe(expected)
  })

  it("coerces non-string cells to strings", () => {
    expect(MODE_FNS.contains(12345, "234")).toBe(true)
    expect(MODE_FNS.equals(null, "")).toBe(true)
  })

  // KNOWN QUIRK: per-column fuzzy is a plain substring match, not ranked.
  it("fuzzy behaves exactly like contains", () => {
    expect(MODE_FNS.fuzzy("Hello World", "world")).toBe(true)
    expect(MODE_FNS.fuzzy("Hello World", "wrld")).toBe(false)
  })
})

describe("empty / notEmpty", () => {
  it.each([
    [null, true],
    [undefined, true],
    ["", true],
    [[], true],
    [0, false],
    ["a", false],
    [[""], false],
  ])("empty(%j) -> %j", (cell, expected) => {
    expect(MODE_FNS.empty(cell, undefined)).toBe(expected)
    expect(MODE_FNS.notEmpty(cell, undefined)).toBe(!expected)
  })
})

describe("numeric modes", () => {
  it.each([
    ["greaterThan", 5, 3, true],
    ["greaterThan", 3, 3, false],
    ["greaterThanOrEqualTo", 3, 3, true],
    ["lessThan", 2, 3, true],
    ["lessThanOrEqualTo", 3, 3, true],
  ] as const)("%s(%j, %j) -> %j", (mode, cell, val, expected) => {
    expect(MODE_FNS[mode](cell, val)).toBe(expected)
  })

  it("coerces numeric strings", () => {
    expect(MODE_FNS.greaterThan("10", "9")).toBe(true)
  })

  // KNOWN QUIRK: parseFloat-based coercion accepts trailing garbage.
  it("parseFloat coercion: '12abc' behaves as 12", () => {
    expect(MODE_FNS.greaterThan("12abc", 10)).toBe(true)
  })

  it("non-numeric cells never match ordering modes", () => {
    expect(MODE_FNS.greaterThan("abc", 1)).toBe(false)
    expect(MODE_FNS.lessThan("abc", 1)).toBe(false)
  })

  describe("between / betweenInclusive", () => {
    it("between is exclusive of both bounds", () => {
      expect(MODE_FNS.between(5, [1, 10])).toBe(true)
      expect(MODE_FNS.between(1, [1, 10])).toBe(false)
      expect(MODE_FNS.between(10, [1, 10])).toBe(false)
    })

    it("betweenInclusive includes the bounds", () => {
      expect(MODE_FNS.betweenInclusive(1, [1, 10])).toBe(true)
      expect(MODE_FNS.betweenInclusive(10, [1, 10])).toBe(true)
      expect(MODE_FNS.betweenInclusive(11, [1, 10])).toBe(false)
    })

    it("a blank bound is an open end", () => {
      expect(MODE_FNS.between(100, ["", 200])).toBe(true)
      expect(MODE_FNS.between(100, [50, ""])).toBe(true)
    })

    it("both bounds blank matches nothing", () => {
      expect(MODE_FNS.between(100, ["", ""])).toBe(false)
    })

    it("NaN cell matches nothing", () => {
      expect(MODE_FNS.between("abc", [1, 10])).toBe(false)
    })
  })
})

describe("date modes", () => {
  // Local-time Date constructors avoid string-parsing timezone variance.
  const jan5Morning = new Date(2024, 0, 5, 10, 0)
  const jan5Midnight = new Date(2024, 0, 5, 0, 0)
  const jan4 = new Date(2024, 0, 4, 12, 0)
  const jan6 = new Date(2024, 0, 6, 12, 0)

  it("before: cell strictly earlier than start-of-day of the filter", () => {
    expect(MODE_FNS.before(jan4, jan5Morning)).toBe(true)
    expect(MODE_FNS.before(jan5Midnight, jan5Morning)).toBe(false)
  })

  // KNOWN QUIRK: only the filter side is floored to start-of-day, so a cell
  // WITH a time-of-day on the same date still counts as "after" that date.
  it("after: same-day cell with a later clock time matches", () => {
    expect(MODE_FNS.after(jan5Morning, jan5Midnight)).toBe(true)
    expect(MODE_FNS.after(jan6, jan5Morning)).toBe(true)
    expect(MODE_FNS.after(jan4, jan5Morning)).toBe(false)
  })

  it("unparseable dates never match", () => {
    expect(MODE_FNS.after("not-a-date", jan5Morning)).toBe(false)
    expect(MODE_FNS.before(jan4, "not-a-date")).toBe(false)
  })

  describe("betweenDates", () => {
    it("inclusive of same-day boundaries via start-of-day flooring", () => {
      expect(MODE_FNS.betweenDates(jan5Morning, [jan5Midnight, jan6])).toBe(
        true
      )
      expect(MODE_FNS.betweenDates(jan4, [jan5Midnight, jan6])).toBe(false)
    })

    it("open-ended ranges work with one bound", () => {
      expect(MODE_FNS.betweenDates(jan6, [jan5Midnight, null])).toBe(true)
      expect(MODE_FNS.betweenDates(jan4, [null, jan5Midnight])).toBe(true)
    })

    it("no bounds matches nothing", () => {
      expect(MODE_FNS.betweenDates(jan5Morning, [null, null])).toBe(false)
      expect(MODE_FNS.betweenDates(jan5Morning, "not-an-array")).toBe(false)
    })
  })
})

describe("fixed modes", () => {
  it("equalsString is case-sensitive exact match", () => {
    expect(MODE_FNS.equalsString("ABC", "ABC")).toBe(true)
    expect(MODE_FNS.equalsString("ABC", "abc")).toBe(false)
  })

  it("arrIncludesSome matches membership; empty selection matches all", () => {
    expect(MODE_FNS.arrIncludesSome("a", ["a", "b"])).toBe(true)
    expect(MODE_FNS.arrIncludesSome("c", ["a", "b"])).toBe(false)
    expect(MODE_FNS.arrIncludesSome("anything", [])).toBe(true)
  })

  it("equalsBool compares truthiness", () => {
    expect(MODE_FNS.equalsBool(true, true)).toBe(true)
    expect(MODE_FNS.equalsBool(0, false)).toBe(true)
    expect(MODE_FNS.equalsBool("x", true)).toBe(true)
  })
})

describe("mode sets and isInactive", () => {
  it("valueless modes are exactly empty/notEmpty", () => {
    expect([...VALUELESS_MODES].sort()).toEqual(["empty", "notEmpty"])
  })

  it("substring modes drive highlighting", () => {
    expect(SUBSTRING_MODES.has("contains")).toBe(true)
    expect(SUBSTRING_MODES.has("between")).toBe(false)
  })

  it.each([
    [null, true],
    ["", true],
    [["", null], true],
    ["0", false],
    [0, false],
    [["", "5"], false],
  ])("isInactive(%j) -> %j", (value, expected) => {
    expect(isInactive(value)).toBe(expected)
  })
})
```

- [ ] **Step 2: Run the suite**

Run: `pnpm --filter @monabbir/shadcn-react-table test`
Expected: all tests pass. **If any assertion fails, the characterization is wrong, not the code** — run the failing input mentally against `fns/filter-modes.ts`, correct the expected value in the TEST, and add a `KNOWN QUIRK` comment if the actual behavior is surprising. Do not edit `filter-modes.ts`.

- [ ] **Step 3: Commit (only if the user authorized commits)**

```bash
git add packages/shadcn-react-table/src/components/data-table/fns/filter-modes.test.ts
git commit -m "test: pin filter-mode engine behavior with characterization tests"
```

---

### Task 3: Fix `useControllableState` functional-update batching (TDD)

**Files:**
- Test (create): `packages/shadcn-react-table/src/components/data-table/hooks/use-controllable-state.test.ts`
- Modify: `packages/shadcn-react-table/src/components/data-table/hooks/use-controllable-state.ts`

**Interfaces:**
- Consumes: the Vitest + @testing-library/react harness from Task 1.
- Produces: `useControllableState<T>(controlled: T | undefined, defaultValue: T, onChange?: (value: T) => void): [T, React.Dispatch<React.SetStateAction<T>>]` — signature UNCHANGED; only functional-updater resolution changes. Every state slice in `core/use-data-table.ts` consumes this hook, so no call sites change.

**The bug:** `setValue` resolves `next(value)` against the render-captured `value` (line 23 of the current file). Two `setValue(prev => prev + 1)` calls in one React batch both read the same stale `value`, so the second silently overwrites the first — diverging from `useState` semantics.

- [ ] **Step 1: Write the failing test**

Create `packages/shadcn-react-table/src/components/data-table/hooks/use-controllable-state.test.ts`:

```ts
import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useControllableState } from "./use-controllable-state"

describe("useControllableState", () => {
  it("chains functional updates queued in the same tick (uncontrolled)", () => {
    const { result } = renderHook(() =>
      useControllableState<number>(undefined, 0)
    )

    act(() => {
      const [, setValue] = result.current
      setValue((prev) => prev + 1)
      setValue((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(2)
  })

  it("chains functional updates in controlled mode via onChange", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useControllableState<number>(5, 0, onChange)
    )

    act(() => {
      const [, setValue] = result.current
      setValue((prev) => prev + 1)
      setValue((prev) => prev + 1)
    })

    expect(onChange).toHaveBeenNthCalledWith(1, 6)
    expect(onChange).toHaveBeenNthCalledWith(2, 7)
  })

  it("stays controlled: internal state never takes over", () => {
    const { result, rerender } = renderHook(
      ({ controlled }) => useControllableState<number>(controlled, 0),
      { initialProps: { controlled: 5 } }
    )

    act(() => {
      result.current[1](99)
    })
    expect(result.current[0]).toBe(5)

    rerender({ controlled: 7 })
    expect(result.current[0]).toBe(7)
  })

  it("resolves against an externally-updated controlled value", () => {
    const onChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ controlled }) => useControllableState<number>(controlled, 0, onChange),
      { initialProps: { controlled: 5 } }
    )

    rerender({ controlled: 10 })
    act(() => {
      result.current[1]((prev) => prev + 1)
    })

    expect(onChange).toHaveBeenCalledWith(11)
  })

  it("fires onChange for plain updates in uncontrolled mode", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useControllableState<string>(undefined, "a", onChange)
    )

    act(() => {
      result.current[1]("b")
    })

    expect(result.current[0]).toBe("b")
    expect(onChange).toHaveBeenCalledWith("b")
  })
})
```

- [ ] **Step 2: Run and verify the right tests fail**

Run: `pnpm --filter @monabbir/shadcn-react-table test`
Expected: the two "chains functional updates" tests FAIL (`expected 2, received 1` / `NthCalledWith(2, 7)` receives `6`); the other three PASS. If a different test fails, stop and re-check the current source before touching it.

- [ ] **Step 3: Implement the fix**

Replace the entire content of `packages/shadcn-react-table/src/components/data-table/hooks/use-controllable-state.ts` with:

```ts
"use client"

import * as React from "react"

/**
 * State that is uncontrolled by default but becomes controlled when a value is
 * supplied. Either way `onChange` fires, so consumers can observe a change
 * without taking over ownership. Returns the same tuple shape as `useState` so
 * existing `Dispatch<SetStateAction<T>>` consumers keep working.
 */
export function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : uncontrolled

  // Functional updaters must chain within a single React batch (useState
  // semantics), so resolve them against the latest dispatched value rather
  // than the render-captured one. The effect re-syncs after the controlling
  // parent applies (or rejects) the change.
  const latest = React.useRef(value)
  React.useEffect(() => {
    latest.current = value
  })

  const setValue = React.useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (next) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(latest.current)
          : next
      latest.current = resolved
      if (!isControlled) setUncontrolled(resolved)
      onChange?.(resolved)
    },
    [isControlled, onChange]
  )

  return [value, setValue]
}
```

- [ ] **Step 4: Run the full suite and verify everything passes**

Run: `pnpm --filter @monabbir/shadcn-react-table test`
Expected: ALL tests pass, including Task 2's suite.

- [ ] **Step 5: Typecheck and smoke the app**

Run: `pnpm typecheck`
Expected: passes.

Then run `pnpm dev`, open `http://localhost:3000/docs/guides/state`, and confirm a controlled-state example still sorts/filters normally. Stop the dev server afterwards.

- [ ] **Step 6: Commit (only if the user authorized commits)**

```bash
git add packages/shadcn-react-table/src/components/data-table/hooks/use-controllable-state.ts packages/shadcn-react-table/src/components/data-table/hooks/use-controllable-state.test.ts
git commit -m "fix: chain functional updates in useControllableState"
```

---

### Task 4: Lazy-load export engine + CSV formula-injection fix + "removing export" docs

**Files:**
- Modify: `packages/shadcn-react-table/src/components/data-table/utils/export-utils.ts`
- Modify: `packages/shadcn-react-table/src/components/data-table/components/menus/data-table-export-menu.tsx:51-58`
- Test (create): `packages/shadcn-react-table/src/components/data-table/utils/export-utils.test.ts`
- Modify: `apps/web/app/docs/guides/export/page.mdx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `exportToCsv` / `exportToExcel` become **async** (`Promise<void>`); new export `escapeCsvCell(value: string | number | boolean | null): string | number | boolean | null`. The only in-repo caller is `data-table-export-menu.tsx` (verified via the dependency graph); the barrel `index.ts` re-exports are unaffected because only return types changed.

**Why:** `xlsx` (~140KB gz) and `papaparse` are statically imported today, so every consumer bundles them even with `enableExport: false`. And CSV cells beginning with `=`, `+`, `-`, `@`, tab, or CR execute as formulas when opened in Excel — a formula-injection risk for exported user data. (The Excel path needs no escaping: SheetJS `aoa_to_sheet` writes strings as string-typed cells, never formulas.)

- [ ] **Step 1: Write the failing tests**

Create `packages/shadcn-react-table/src/components/data-table/utils/export-utils.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { escapeCsvCell } from "./export-utils"

describe("escapeCsvCell", () => {
  it.each([
    ["=SUM(A1:A2)", "'=SUM(A1:A2)"],
    ["+1234", "'+1234"],
    ["-cmd", "'-cmd"],
    ["@import", "'@import"],
    ["\tleading-tab", "'\tleading-tab"],
    ["\rleading-cr", "'\rleading-cr"],
  ])("neutralizes formula trigger %j", (input, expected) => {
    expect(escapeCsvCell(input)).toBe(expected)
  })

  it.each(["plain text", "a=b", "safe -dash- inside", ""])(
    "leaves safe string %j untouched",
    (input) => {
      expect(escapeCsvCell(input)).toBe(input)
    }
  )

  it("never touches non-string values", () => {
    expect(escapeCsvCell(-5)).toBe(-5)
    expect(escapeCsvCell(0)).toBe(0)
    expect(escapeCsvCell(true)).toBe(true)
    expect(escapeCsvCell(null)).toBe(null)
  })
})
```

- [ ] **Step 2: Run and verify failure**

Run: `pnpm --filter @monabbir/shadcn-react-table test`
Expected: FAIL — `escapeCsvCell` is not exported from `./export-utils`.

- [ ] **Step 3: Implement in `export-utils.ts`**

Three changes to `packages/shadcn-react-table/src/components/data-table/utils/export-utils.ts`:

3a. Delete the two static engine imports at the top of the file:

```ts
import Papa from "papaparse"
import * as XLSX from "xlsx"
```

(keep the `@tanstack/react-table` type import and all local imports).

3b. Add the escape helper after the `normalize` function:

```ts
// Spreadsheet apps execute cells starting with these as formulas when a CSV
// is opened, so exported user data could inject commands (CSV injection).
// A leading apostrophe forces text. Only strings are at risk — typed numbers
// (e.g. -5) survive as numbers.
const FORMULA_TRIGGERS = /^[=+\-@\t\r]/

export function escapeCsvCell(
  value: string | number | boolean | null
): string | number | boolean | null {
  if (typeof value === "string" && FORMULA_TRIGGERS.test(value)) {
    return `'${value}`
  }
  return value
}
```

3c. Replace `exportToCsv` and `exportToExcel` with async versions that load their engine on demand:

```ts
/** Export to CSV via PapaParse + a Blob download. */
export async function exportToCsv<TData extends RowData>(
  table: DataTableInstance<TData>,
  options: ExportOptions = {}
): Promise<void> {
  // Loaded on demand so consumers who never export don't bundle papaparse.
  const { default: Papa } = await import("papaparse")
  const scope = effectiveScope(table, options.scope)
  const aoa = toAOA(table, scope).map((row) => row.map(escapeCsvCell))
  const csv = Papa.unparse(aoa)
  // Prepend a UTF-8 BOM so Excel detects the encoding.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
  triggerDownload(blob, `${options.fileName ?? "export"}.csv`)
}

/** Export to an .xlsx worksheet via SheetJS. */
export async function exportToExcel<TData extends RowData>(
  table: DataTableInstance<TData>,
  options: ExportOptions = {}
): Promise<void> {
  // Loaded on demand so consumers who never export don't bundle xlsx.
  const XLSX = await import("xlsx")
  const scope = effectiveScope(table, options.scope)
  const aoa = toAOA(table, scope)
  const worksheet = XLSX.utils.aoa_to_sheet(aoa)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
  XLSX.writeFile(workbook, `${options.fileName ?? "export"}.xlsx`)
}
```

- [ ] **Step 4: Update the menu's click handlers**

In `packages/shadcn-react-table/src/components/data-table/components/menus/data-table-export-menu.tsx`, the two `DropdownMenuItem`s become:

```tsx
<DropdownMenuItem onClick={() => void exportToCsv(table, { fileName })}>
  <icons.fileCsv />
  {localization.exportCsv}
</DropdownMenuItem>
<DropdownMenuItem onClick={() => void exportToExcel(table, { fileName })}>
  <icons.fileExcel />
  {localization.exportExcel}
</DropdownMenuItem>
```

- [ ] **Step 5: Run tests + typecheck**

Run: `pnpm --filter @monabbir/shadcn-react-table test && pnpm typecheck`
Expected: all tests pass; typecheck passes across workspaces. A typecheck failure here means an in-repo caller of the export functions was missed — find it with `graphify query "callers of exportToCsv"` and apply the `void` pattern from Step 4.

- [ ] **Step 6: Verify lazy loading end-to-end**

Run `pnpm dev`, open `http://localhost:3000/docs/guides/export`, open the browser Network tab, then click the export menu → CSV. Expected: a papaparse chunk loads only on that first click, and the CSV downloads with correct content. Repeat for Excel (xlsx chunk). In the downloaded CSV, a cell that starts with `=` (add one to the example data locally if none exists — revert afterwards) appears with a leading `'`. Stop the dev server.

- [ ] **Step 7: Document the "removing export" recipe**

In `apps/web/app/docs/guides/export/page.mdx`, add this section between "## What gets exported" and "## Related":

```mdx
## Bundle cost

The CSV and Excel engines (`papaparse`, `xlsx`) are loaded on demand the
first time a user exports — they are never in your initial bundle, even
with `enableExport: true`.

## Removing export entirely

If you never use export, you can delete it from your copy of the block:

1. Delete `components/ui/data-table/utils/export-utils.ts` and
   `components/ui/data-table/components/menus/data-table-export-menu.tsx`.
2. Remove the `DataTableExportMenu` import and usage from
   `components/ui/data-table/components/toolbar/data-table-toolbar.tsx`.
3. Remove the export re-exports from `components/ui/data-table/index.ts`
   (search for `export-utils`).
4. Uninstall the dependencies: `npm rm xlsx papaparse @types/papaparse`.
```

Before writing step 3's wording, check `packages/shadcn-react-table/src/components/data-table/index.ts` — if it does not re-export from `export-utils`, drop that list item and renumber.

- [ ] **Step 8: Rebuild generated docs artifacts**

Run: `pnpm --filter shadcn-react-table-web registry:build && pnpm --filter shadcn-react-table-web api:build`
Expected: both succeed; `apps/web/public/r/data-table.json` content changes (it embeds the modified source).

- [ ] **Step 9: Commit (only if the user authorized commits)**

```bash
git add packages/shadcn-react-table/src/components/data-table/utils/export-utils.ts packages/shadcn-react-table/src/components/data-table/utils/export-utils.test.ts packages/shadcn-react-table/src/components/data-table/components/menus/data-table-export-menu.tsx apps/web/app/docs/guides/export/page.mdx apps/web/public/r apps/web/lib/api-reference.generated.ts
git commit -m "feat: lazy-load export engines and neutralize CSV formula injection"
```

---

### Task 5: Registry versioning + changelog + update-path docs

**Files:**
- Modify: `packages/shadcn-react-table/package.json` (version bump)
- Create: `packages/shadcn-react-table/CHANGELOG.md`
- Modify: `apps/web/scripts/build-registry.mjs`
- Create: `apps/web/app/docs/guides/updating/page.mdx`

**Interfaces:**
- Consumes: Task 4's changes (this version's changelog entries describe them).
- Produces: `apps/web/public/r/data-table.json` gains `meta: { version: "<pkg version>" }` (the registry-item schema has no top-level `version`; `meta` is the schema-sanctioned extension point). The version's single source of truth is `packages/shadcn-react-table/package.json`.

- [ ] **Step 1: Bump the package version**

In `packages/shadcn-react-table/package.json`, change `"version": "0.0.0"` to `"version": "0.1.0"`.

- [ ] **Step 2: Create the changelog**

Create `packages/shadcn-react-table/CHANGELOG.md`:

```markdown
# Changelog

The version applies to the registry block: `/r/data-table.json` carries it
in `meta.version`. After installing, record the version you received —
see the [updating guide](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/updating).

## 0.1.0

- CSV and Excel export engines (`papaparse`, `xlsx`) now load on demand
  instead of shipping in the initial bundle.
- CSV export neutralizes formula injection: string cells starting with
  `=`, `+`, `-`, `@`, tab, or CR are prefixed with `'`.
- `exportToCsv` / `exportToExcel` are now async (`Promise<void>`).
- Fixed `useControllableState` so functional updates queued in the same
  React batch chain correctly instead of overwriting each other.
- The registry item now carries its version in `meta.version`.
```

Adjust the guide URL if the docs site's public base URL differs — copy the host used in `apps/web/scripts/build-registry.mjs`'s `homepage` field or the repo README.

- [ ] **Step 3: Thread the version through the registry build**

In `apps/web/scripts/build-registry.mjs`:

3a. After the `REPO` constant (line 14), add:

```js
const PKG = JSON.parse(
  readFileSync(join(REPO, "packages/shadcn-react-table/package.json"), "utf8")
)
```

3b. In the `item` object literal, add a `meta` field after `description`:

```js
meta: { version: PKG.version },
```

3c. In the `registry` object's single `items` entry, add the same field after `description`:

```js
meta: { version: PKG.version },
```

3d. Extend the final `console.log` to include the version, e.g. append `` `, v${PKG.version}` `` inside the summary string.

- [ ] **Step 4: Regenerate and verify**

Run: `pnpm --filter shadcn-react-table-web registry:build`
Expected: console shows the file count and `v0.1.0`; `apps/web/public/r/data-table.json` now contains `"meta": { "version": "0.1.0" }` (verify with a grep for `"version": "0.1.0"` in that file).

- [ ] **Step 5: Write the updating guide**

Create `apps/web/app/docs/guides/updating/page.mdx`:

```mdx
export const metadata = { title: "Updating" }

# Updating your copy

`shadcn add` copies this block's source into your project — after that,
the code is yours, and upstream releases don't reach it automatically.
This page is the manual update path.

## Know what you have

Every release stamps its version into the registry item. When you
install, note the `meta.version` of
[`/r/data-table.json`](/r/data-table.json) somewhere in your project
(a comment, your PR description). The
[changelog](https://github.com/Monabbir-Ahmmad/shadcn-react-table/blob/main/packages/shadcn-react-table/CHANGELOG.md)
lists what changed in each version.

## Update recipe

1. Start from a clean branch.
2. Re-run the install command with `--overwrite`:

   ```bash
   npx shadcn@latest add --overwrite <registry-url>/r/data-table.json
   ```

3. Review the diff. Everything under `components/ui/data-table/` is
   replaced with the new upstream source — `git diff` shows upstream
   changes mixed with the loss of any local edits you made.
4. Re-apply your local edits on top, or cherry-pick hunks with
   `git checkout -p` against the pre-update commit.
5. Check the changelog for entries marked as breaking and adjust your
   usage.

<Callout variant="tip" title="Keep local edits separate">
  The less you edit the copied files directly — prefer wrapping the
  table or using the many `render*` slots — the closer step 3's diff is
  to a pure upstream update.
</Callout>

## Related

- [Installation](/docs/installation)
```

Before finalizing, open one existing guide (e.g. `apps/web/app/docs/guides/export/page.mdx`) and confirm `<Callout>` is available to MDX pages without imports (it is used there with no import statement); if it requires an import in this repo, copy that pattern.

- [ ] **Step 6: Verify docs build (includes the search index over the new page)**

Run: `pnpm --filter shadcn-react-table-web build`
Expected: builds cleanly; the new `/docs/guides/updating` route appears in the output. If the docs sidebar/navigation is driven by a config file (check `apps/web/components/` or `apps/web/lib/` for a nav/sidebar source listing guide slugs), add an "Updating" entry pointing at `/docs/guides/updating`.

- [ ] **Step 7: Commit (only if the user authorized commits)**

```bash
git add packages/shadcn-react-table/package.json packages/shadcn-react-table/CHANGELOG.md apps/web/scripts/build-registry.mjs apps/web/public/r apps/web/app/docs/guides/updating
git commit -m "feat: version the registry block and document the update path"
```

---

### Task 6: Registry-artifact verification + GitHub Actions CI

**Files:**
- Create: `apps/web/scripts/verify-registry.mjs`
- Modify: `apps/web/package.json` (add `registry:verify` script)
- Modify: `.gitignore` (fixture dir)
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `apps/web/public/r/data-table.json` as built by Task 5's script (reads its `files[].target` and `files[].content`).
- Produces: `pnpm --filter shadcn-react-table-web registry:verify` — extracts the registry item into a consumer-shaped fixture and typechecks it; CI runs lint, typecheck, tests, registry staleness check, and the fixture typecheck on every push/PR.

**Why:** the registry JSON is the actual shipped product, produced by an import-rewriting transform nobody reviews. This verifies (a) the committed JSON matches the source (staleness) and (b) the rewritten code still compiles in a consumer-shaped layout (`@/components/ui/*` aliases).

- [ ] **Step 1: Write the verification script**

Create `apps/web/scripts/verify-registry.mjs`:

```js
// Verifies the built registry artifact from the consumer's perspective:
// extracts /r/data-table.json into a fixture laid out exactly as `shadcn add`
// would install it, then typechecks it with the consumer-standard `@/` aliases
// mapped onto this repo's shadcn primitives. Catches import-rewrite bugs and
// rewritten code that no longer compiles. Run after registry:build:
//   node apps/web/scripts/verify-registry.mjs
import { execSync } from "node:child_process"
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../..")
const ITEM = JSON.parse(
  readFileSync(join(REPO, "apps/web/public/r/data-table.json"), "utf8")
)
// The fixture lives inside the table package so the block's npm dependencies
// (@tanstack/*, @dnd-kit/*, xlsx, …) resolve from its node_modules.
const PKG_DIR = join(REPO, "packages/shadcn-react-table")
const FIXTURE = join(PKG_DIR, ".registry-fixture")

rmSync(FIXTURE, { recursive: true, force: true })
for (const file of ITEM.files) {
  const target = join(FIXTURE, file.target)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, file.content)
}

// Consumer-shaped tsconfig: `@/components/ui/*` and `@/lib/*` resolve to the
// in-repo shadcn primitives, standing in for the consumer's own setup.
writeFileSync(
  join(FIXTURE, "tsconfig.json"),
  JSON.stringify(
    {
      compilerOptions: {
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        jsx: "preserve",
        module: "ESNext",
        moduleResolution: "Bundler",
        target: "ES2022",
        lib: ["dom", "dom.iterable", "esnext"],
        paths: {
          "@/components/ui/data-table/*": ["./components/ui/data-table/*"],
          "@/components/ui/*": ["../../ui/src/components/*"],
          "@/lib/*": ["../../ui/src/lib/*"],
        },
      },
      include: ["components"],
    },
    null,
    2
  )
)

try {
  execSync("pnpm exec tsc -p .registry-fixture", {
    cwd: PKG_DIR,
    stdio: "inherit",
  })
} catch {
  console.error("registry fixture typecheck FAILED")
  process.exit(1)
}

rmSync(FIXTURE, { recursive: true, force: true })
console.log(
  `registry fixture typecheck passed (${ITEM.files.length} files, v${ITEM.meta?.version})`
)
```

- [ ] **Step 2: Add the script entry and gitignore**

In `apps/web/package.json` `"scripts"`, add:

```json
"registry:verify": "node scripts/verify-registry.mjs"
```

In the root `.gitignore`, add a line:

```
.registry-fixture/
```

- [ ] **Step 3: Run it and make it pass**

Run: `pnpm --filter shadcn-react-table-web registry:build && pnpm --filter shadcn-react-table-web registry:verify`
Expected: `registry fixture typecheck passed (82 files, v0.1.0)` (file count may differ slightly; that is fine).

Likely first-run issues and their fixes — diagnose, don't suppress:
- *Cannot find module `@/components/ui/<name>`*: a primitive the table imports is missing from `packages/ui/src/components/` — that means `REGISTRY_DEPENDENCIES` in `build-registry.mjs` and reality have drifted; report it rather than papering over.
- *Cannot find module `lucide-react` (or similar)*: the dependency is missing from `packages/shadcn-react-table/package.json` — which is exactly the drift this script exists to catch; add it to the package (and to `NPM_DEPENDENCIES` in `build-registry.mjs` if consumers need it), then rebuild.
- *JSX-related errors*: confirm `@types/react` resolves; if tsc needs it explicitly, add `"types": ["react", "react-dom"]` to the fixture tsconfig's `compilerOptions` in the script.

- [ ] **Step 4: Create the CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Registry is fresh (generated artifacts match source)
        run: |
          pnpm --filter shadcn-react-table-web registry:build
          pnpm --filter shadcn-react-table-web api:build
          git diff --exit-code -- apps/web/public/r apps/web/lib/api-reference.generated.ts

      - name: Registry output compiles for consumers
        run: pnpm --filter shadcn-react-table-web registry:verify
```

(`pnpm/action-setup@v4` reads the pnpm version from the root `packageManager` field — do not pin a version in the workflow.)

- [ ] **Step 5: Verify each CI step locally**

Run, from the repo root, each command the workflow runs:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter shadcn-react-table-web registry:build
pnpm --filter shadcn-react-table-web api:build
git diff --exit-code -- apps/web/public/r apps/web/lib/api-reference.generated.ts
pnpm --filter shadcn-react-table-web registry:verify
```

Expected: every command exits 0. If the `git diff` step fails, the committed artifacts were stale — commit the regenerated files (that is the check working).

- [ ] **Step 6: Commit (only if the user authorized commits)**

```bash
git add apps/web/scripts/verify-registry.mjs apps/web/package.json .gitignore .github/workflows/ci.yml apps/web/public/r apps/web/lib/api-reference.generated.ts
git commit -m "ci: verify registry artifacts and run tests on every push"
```

---

## Final verification (after all tasks)

- [ ] `pnpm lint && pnpm typecheck && pnpm test` — all green.
- [ ] `pnpm --filter shadcn-react-table-web build` — full docs build succeeds.
- [ ] `pnpm --filter shadcn-react-table-web registry:verify` — fixture typecheck green.
- [ ] Manual: export CSV/Excel from `/docs/guides/export` (lazy chunks + working downloads).
- [ ] `graphify update .` — refresh the knowledge graph.
