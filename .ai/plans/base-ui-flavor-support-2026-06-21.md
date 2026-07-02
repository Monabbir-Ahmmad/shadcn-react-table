# Base UI Flavor Support Implementation Plan

> **⚠️ SUPERSEDED (2026-07-02).** The Task 1 discovery spike disproved this plan's
> architecture: the shadcn 4.x CLI transforms `asChild` → `render` at install
> time and the Base wrappers absorb the `*Positioner` restructure internally, so
> **no `compat/` layer and no second registry variant were built** (Tasks 2–5
> obsolete). The delivered work — 3 flavor-neutral source fixes, dropping
> `radix-ui` from registry deps, and docs — is specified and evidenced in
> **`.ai/reviews/base-ui-delta-2026-06-21.md`** (the authoritative record).
> Both flavors are validated: fresh `shadcn add` into `radix-vega` and
> `base-vega` probe apps each pass `tsc --noEmit` (0 errors) and
> `next build --webpack` (exit 0) against the same shipped `data-table.json`.
> Do not execute the tasks below.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the data table install cleanly into both Radix-flavored and Base-UI-flavored shadcn projects, by isolating every Radix/Base API difference behind a small `compat/` adapter layer and shipping two registry variants generated from one source.

**Architecture:** shadcn's Base UI flavor differs from Radix in **two** confirmed ways (and possibly more): (1) **composition** — `asChild` vs a `render` prop, on every trigger; (2) **popup structure** — Base wraps popup content in a `*Positioner` (e.g. `DropdownMenuContent` must be nested in `DropdownMenuPositioner`), and may wrap labels in `Group`. We hide each difference behind a `compat/` wrapper that has a Radix implementation (`*.tsx`, canonical, lives in the repo) and a Base template (`*.base.tsx`, build-only). `build-registry.mjs` emits `data-table.json` (Radix) and `data-table-base.json` (Base) that differ **only** by which `compat/*.tsx` content ships. Consumers pick the URL matching their flavor.

**Tech Stack:** React 19, TanStack Table v8, shadcn registry (registry-item JSON), Node ESM build script, pnpm workspaces, Tailwind v4.

## Global Constraints

- Package manager: **pnpm 10.33.4** (Node ≥ 20). Run all commands from repo root.
- No test runner exists — "tests" are `typecheck`, `lint`, the registry build, targeted `grep` assertions, and (decisively) compiling the Base variant against a real `base-vega` app.
- Prettier style: **no semicolons, double quotes, 2-space, `trailingComma: es5`, `printWidth: 80`, LF**.
- Commits: subject line only, `<prefix>: <msg>`, **no `Co-Authored-By` trailer**. Never commit unless told.
- Generated artifacts (`apps/web/public/r/*.json`) are committed — regenerate via the build script, never hand-edit.
- No new direct `radix-ui` / `@base-ui-components/*` imports in the shipped module — only the `@workspace/ui/components/*` shadcn APIs (plus the `compat/` layer).
- After modifying code, run `graphify update .`.

---

## Why discovery comes first

A doc spot-check already proved two things: the difference is **not** limited to `asChild`, and the published Base docs do **not** fully enumerate the API (e.g. whether `DropdownMenuCheckboxItem` / `RadioGroup` exist, what `Select`/`Dialog` look like). Building the compat layer before knowing the complete delta risks shipping `TriggerSlot`, then discovering `Content`/`Positioner`/`Select`/`Dialog` all need work too. **Task 1 is a spike that compiles the current registry against a real Base project and produces the authoritative list of differences.** Tasks 3+ are finalized from that list.

## Inventory the compat layer must cover (from the table's actual imports)

| Primitive | Sub-components the table uses | Known Base difference |
|---|---|---|
| tooltip | Tooltip, TooltipTrigger(×14), TooltipContent | `asChild`→`render` on Trigger |
| dropdown-menu | DropdownMenu, Trigger(×6), Content, Item, CheckboxItem, RadioGroup, RadioItem, Label, Separator | Trigger `asChild`; **Content needs Positioner**; CheckboxItem/RadioItem unconfirmed |
| popover | Popover, Trigger(×4), Content | Trigger `asChild`; **Content likely needs Positioner** |
| context-menu | ContextMenu, Trigger(×1), Content, Item | Trigger `asChild`; **Content likely needs Positioner** |
| select | Select, SelectTrigger, SelectValue, SelectContent, SelectItem | **Content/positioner restructure** (confirm in spike) |
| dialog | Dialog, Content, Header, Footer, Title | Portal/positioner (confirm in spike) |
| command | Command + (used inside a Popover) | confirm in spike |
| calendar | Calendar | confirm in spike |
| slider, input, label, badge, checkbox, skeleton, table, button | leaf usage | none expected (checkbox already self-contained) |

---

## File Structure

**New (the compat layer — each is a Radix `.tsx` + a Base `.base.tsx` with identical signatures):**
- `…/data-table/compat/trigger-slot.tsx` / `.base.tsx` — renders a child *as* a trigger (`asChild` vs `render`). Covers all 25 trigger sites.
- `…/data-table/compat/menu-content.tsx` / `.base.tsx` — wraps `DropdownMenuContent` (Radix: passthrough; Base: `DropdownMenuPositioner` + content). *(Created only if the spike confirms the Positioner difference — it already looks confirmed for dropdown-menu.)*
- Additional `compat/*` wrappers as the spike dictates (e.g. `popover-content`, `context-menu-content`, `select-content`, `dialog-content`). **Exact set finalized after Task 1.**

**Modified:**
- The call-site files for each difference (the 17 `asChild` files for triggers; the ~10 popup-content files for Positioner).
- `apps/web/scripts/build-registry.mjs` — emit two variants; exclude `*.base.tsx` from normal output; swap each `compat/X.tsx` content for `compat/X.base.tsx` in the Base variant; drop `radix-ui` from npm deps; list both items in `registry.json`.
- `apps/web/app/docs/installation/page.mdx` — document the two install URLs.

**The 17 trigger files** (25 sites: Tooltip 14, DropdownMenu 6, Popover 4, ContextMenu 1):
```
components/body/click-to-copy.tsx              components/toolbar/controls/advanced-filter-toggle.tsx
components/editing/data-table-edit-cell.tsx    components/toolbar/controls/density-toggle.tsx
components/head/data-table-column-header.tsx   components/toolbar/controls/filter-toggle.tsx
components/head/filter-variants/date.tsx       components/toolbar/controls/fullscreen-toggle.tsx
components/head/filter-variants/date-range.tsx components/toolbar/data-table-global-filter.tsx
components/head/filter-variants/multi-select.tsx components/toolbar/data-table-pagination.tsx
components/menus/data-table-column-actions.tsx components/toolbar/data-table-view-options.tsx
components/menus/data-table-export-menu.tsx    injected-columns/data-table-row-actions.tsx
components/menus/data-table-filter-mode-menu.tsx
```

**The popup-content files** (Positioner candidates — confirm exact set in spike):
```
dropdown-menu: data-table-view-options.tsx, data-table-global-filter.tsx, data-table-row-actions.tsx,
               data-table-column-actions.tsx, data-table-export-menu.tsx, data-table-filter-mode-menu.tsx
popover:       command usage, calendar usage, head/filter-variants/{date,date-range,multi-select}.tsx
context-menu:  components/editing/data-table-edit-cell.tsx
select:        components/toolbar/data-table-pagination.tsx, components/editing/data-table-edit-field.tsx
dialog:        components/editing/data-table-edit-modal.tsx
```

---

### Task 1: Discovery spike — compile the current registry against a real Base UI app

**Goal:** Produce the authoritative, complete list of Radix→Base differences the table hits. No repo code changes; output is a written delta that finalizes Tasks 3–5.

- [ ] **Step 1: Build & serve the current registry**

```bash
pnpm --filter shadcn-react-table-web registry:build
npx serve apps/web/public/r -l 4000   # serves /data-table.json
```

- [ ] **Step 2: Scaffold a throwaway Base UI shadcn app**

```bash
cd "$(mktemp -d)"
pnpm create next-app base-probe --ts --tailwind --eslint --app --src-dir --use-pnpm --no-import-alias
cd base-probe
pnpm dlx shadcn@latest init    # choose the Base UI (base-vega) primitives when prompted
```
Expected: `components.json` style is the Base UI variant.

- [ ] **Step 3: Install the table (Radix-authored) into the Base app**

```bash
pnpm dlx shadcn@latest add http://localhost:4000/data-table.json
```
This pulls the table source (with `asChild` + `DropdownMenuContent` etc.) plus Base-flavored primitives.

- [ ] **Step 4: Render a kitchen-sink table and capture every type error**

Copy the Advanced example into a page, then:
```bash
pnpm tsc --noEmit 2>&1 | tee /tmp/base-delta.txt
```
Expected: a list of errors. Each names a concrete difference — e.g. `Property 'asChild' does not exist` (triggers), `'DropdownMenuContent' must be inside 'DropdownMenuPositioner'` or `'DropdownMenuPositioner' is not exported`, missing `SelectValue`, `DialogPortal` changes, absent `DropdownMenuCheckboxItem`, etc.

- [ ] **Step 5: Smoke-test at runtime for non-type gaps**

`pnpm dev`, open the page, exercise: sort, column-actions menu, view-options checkbox items, global-search mode radios, a date filter popover, a multi-select popover, row-actions menu, pagination select, inline edit cell (context menu) + modal, selection checkbox indeterminate. Note anything that renders wrong but didn't error in `tsc`.

- [ ] **Step 6: Write the delta doc**

Create `.ai/reviews/base-ui-delta-2026-06-21.md` listing, per primitive: the exact API difference, the affected table files, and the compat wrapper that will absorb it (name + Radix form + Base form). This table is the spec for Tasks 3–5. **Do not proceed until every error in `/tmp/base-delta.txt` maps to a planned wrapper.**

---

### Task 2: Create the `TriggerSlot` adapter (known difference #1)

**Files:**
- Create: `…/data-table/compat/trigger-slot.tsx`
- Create: `…/data-table/compat/trigger-slot.base.tsx`

**Interfaces:**
- Produces: `TriggerSlot({ trigger, children, ...props })` — `trigger: React.ComponentType<any>`, `children: React.ReactElement`; renders the child as the trigger. Identical signature in both files.

- [ ] **Step 1: Radix adapter** (`trigger-slot.tsx`)

```tsx
"use client"

import * as React from "react"

interface TriggerSlotProps {
  trigger: React.ComponentType<any>
  children: React.ReactElement
}

/** Renders `children` as the given trigger primitive (Radix `asChild`). The
 *  Base build swaps in trigger-slot.base.tsx (which uses `render`). */
function TriggerSlot({
  trigger: Trigger,
  children,
  ...props
}: TriggerSlotProps & Record<string, unknown>) {
  return (
    <Trigger {...props} asChild>
      {children}
    </Trigger>
  )
}

export { TriggerSlot }
```

- [ ] **Step 2: Base template** (`trigger-slot.base.tsx`) — identical signature, `render`:

```tsx
"use client"

import * as React from "react"

interface TriggerSlotProps {
  trigger: React.ComponentType<any>
  children: React.ReactElement
}

/** Base UI variant of TriggerSlot: composes via `render` instead of `asChild`.
 *  Shipped (as trigger-slot.tsx) only to Base consumers by the registry build. */
function TriggerSlot({
  trigger: Trigger,
  children,
  ...props
}: TriggerSlotProps & Record<string, unknown>) {
  return <Trigger {...props} render={children} />
}

export { TriggerSlot }
```

- [ ] **Step 3: Typecheck + lint**

Run: `pnpm --filter @monabbir/shadcn-react-table typecheck` → PASS (both compile; `trigger` is `ComponentType<any>`).
Run: `pnpm --filter @monabbir/shadcn-react-table lint` → 0 errors.

- [ ] **Step 4: Commit**

```bash
git add packages/shadcn-react-table/src/components/data-table/compat/trigger-slot.tsx packages/shadcn-react-table/src/components/data-table/compat/trigger-slot.base.tsx
git commit -m "feat: add TriggerSlot composition adapter (radix/base)"
```

---

### Task 3: Create the popup-content adapter(s) (known difference #2 — finalize set from Task 1)

> The dropdown-menu Positioner difference is already confirmed. Create one wrapper per popup family the spike flags (dropdown-menu, popover, context-menu, and — if the spike confirms — select/dialog). All follow the same shape. Example shown for dropdown-menu; replicate for each confirmed family using the Base form recorded in the delta doc.

**Files (per confirmed family, e.g. dropdown-menu):**
- Create: `…/data-table/compat/menu-content.tsx`
- Create: `…/data-table/compat/menu-content.base.tsx`

**Interfaces:**
- Produces: `MenuContent({ children, ...props })` — passes `props` to the content; Radix renders `<DropdownMenuContent>`, Base nests it in `<DropdownMenuPositioner>`. Same signature both files.

- [ ] **Step 1: Radix passthrough** (`menu-content.tsx`)

```tsx
"use client"

import * as React from "react"
import { DropdownMenuContent } from "@workspace/ui/components/dropdown-menu"

function MenuContent({
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return <DropdownMenuContent {...props}>{children}</DropdownMenuContent>
}

export { MenuContent }
```

- [ ] **Step 2: Base wrapper** (`menu-content.base.tsx`) — exact Base form per the delta doc; expected:

```tsx
"use client"

import * as React from "react"
import {
  DropdownMenuContent,
  DropdownMenuPositioner,
} from "@workspace/ui/components/dropdown-menu"

function MenuContent({ children, ...props }: Record<string, unknown>) {
  return (
    <DropdownMenuPositioner>
      <DropdownMenuContent {...props}>
        {children as React.ReactNode}
      </DropdownMenuContent>
    </DropdownMenuPositioner>
  )
}

export { MenuContent }
```
> If the spike shows `DropdownMenuPositioner` isn't a named export in our Radix repo (it isn't — we're Radix), the `.base.tsx` won't typecheck against our primitives. Guard it the same way as triggers: import nothing flavor-specific and reference the positioner via the **consumer's** module is impossible at build-time, so for content wrappers the Base template must be authored as a **string-safe template that is excluded from our tsconfig typecheck**. Decision recorded in Task 1's delta doc; if exclusion is needed, add `compat/*.base.tsx` to `packages/shadcn-react-table/tsconfig.json` `exclude` and lint-ignore, since these are Base-only build inputs.

- [ ] **Step 3: Typecheck + lint** (with `.base.tsx` excluded if required) → PASS / 0 errors.

- [ ] **Step 4: Commit**

```bash
git add packages/shadcn-react-table/src/components/data-table/compat
git commit -m "feat: add popup-content compat adapters for base ui positioner"
```

---

### Task 4: Refactor call sites onto the compat layer

> Mechanical. Triggers → `TriggerSlot` (all 17 files); popup contents → the matching `*Content` wrapper (the ~10 files in the inventory). Do it in reviewable batches (e.g. toolbar, then menus+header, then filter-variants+editing), each batch ending green.

- [ ] **Step 1: Replace triggers** — every `<XxxTrigger asChild>…</XxxTrigger>` → `<TriggerSlot trigger={XxxTrigger}>…</TriggerSlot>` (keep the wrapped child + surrounding wrappers; add the `TriggerSlot` import at the correct relative depth; keep the existing trigger import).

- [ ] **Step 2: Replace popup contents** — every confirmed `<DropdownMenuContent …>…</DropdownMenuContent>` → `<MenuContent …>…</MenuContent>` (and the analogous wrapper for popover/context-menu/select/dialog per the delta doc).

- [ ] **Step 3: Verify the module is flavor-neutral**

Run: `grep -rn "asChild" packages/shadcn-react-table/src` → only `compat/trigger-slot.tsx`.
Run: `grep -rn "DropdownMenuContent\|PopoverContent\|ContextMenuContent" packages/shadcn-react-table/src | grep -v compat/` → no matches (all routed through compat). Repeat for any other wrapped content per the delta doc.

- [ ] **Step 4: Typecheck + lint + browser smoke-check (Radix repo)**

`typecheck` PASS, `lint` 0 errors, and with `pnpm --filter shadcn-react-table-web dev` confirm menus/popovers/tooltips/selects/dialog/context-menu still open and behave (Radix repo still uses passthrough + `asChild`).

- [ ] **Step 5: Commit** (one per batch)

```bash
git add packages/shadcn-react-table/src/components/data-table
git commit -m "refactor: route triggers and popup content through compat layer"
```

---

### Task 5: Emit two registry variants

**Files:** Modify `apps/web/scripts/build-registry.mjs`

- [ ] **Step 1: Exclude `*.base.tsx` from the walk**

```js
else if (
  (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
  !entry.name.endsWith(".base.ts") &&
  !entry.name.endsWith(".base.tsx")
)
  out.push(abs)
```

- [ ] **Step 2: Flavored item builder** — for `flavor === "base"`, substitute each `compat/X.tsx` content with `compat/X.base.tsx`; drop `radix-ui` from deps:

```js
const COMPAT_BASE = new Map([
  ["compat/trigger-slot.tsx", "compat/trigger-slot.base.tsx"],
  ["compat/menu-content.tsx", "compat/menu-content.base.tsx"],
  // …one entry per compat wrapper created in Tasks 2–3
])

function buildItem(flavor) {
  const files = []
  for (const abs of walk(DT_DIR).sort()) {
    const sub = relative(DT_DIR, abs).split("\\").join("/")
    let content = read(`components/data-table/${sub}`)
    if (flavor === "base" && COMPAT_BASE.has(sub)) {
      content = read(`components/data-table/${COMPAT_BASE.get(sub)}`)
    }
    files.push({
      path: `ui/data-table/${sub}`,
      type: "registry:ui",
      target: `components/ui/data-table/${sub}`,
      content,
    })
  }
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: flavor === "base" ? "data-table-base" : "data-table",
    type: "registry:block",
    title: flavor === "base" ? "Data Table (Base UI)" : "Data Table",
    description:
      "An MRT-complete data table for shadcn/ui (TanStack Table v8): sorting, filtering, search, grouping, editing, pinning, virtualization, export and more.",
    dependencies: NPM_DEPENDENCIES.filter((d) => d !== "radix-ui"),
    devDependencies: DEV_DEPENDENCIES,
    registryDependencies: REGISTRY_DEPENDENCIES,
    files,
    cssVars,
  }
}
```

- [ ] **Step 3: Write both items + two-item registry.json**

```js
const radix = buildItem("radix")
const base = buildItem("base")
const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "shadcn-react-table",
  homepage: "https://github.com/Monabbir-Ahmmad/shadcn-react-table",
  items: [radix, base].map((it) => ({
    name: it.name, type: it.type, title: it.title, description: it.description,
  })),
}
mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, "data-table.json"), JSON.stringify(radix, null, 2))
writeFileSync(join(OUT, "data-table-base.json"), JSON.stringify(base, null, 2))
writeFileSync(join(OUT, "registry.json"), JSON.stringify(registry, null, 2))
```

- [ ] **Step 4: Build + assert**

Run: `pnpm --filter shadcn-react-table-web registry:build`
- `grep -c "asChild" apps/web/public/r/data-table.json` → ≥1
- `grep -c "asChild" apps/web/public/r/data-table-base.json` → 0
- `grep -c "Positioner" apps/web/public/r/data-table-base.json` → ≥1 (and 0 in `data-table.json`)
- `grep -c "\.base\.tsx" apps/web/public/r/*.json` → 0 (templates never shipped)

- [ ] **Step 5: Commit**

```bash
git add apps/web/scripts/build-registry.mjs apps/web/public/r/data-table.json apps/web/public/r/data-table-base.json apps/web/public/r/registry.json
git commit -m "feat: publish a Base UI registry variant of the data table"
```

---

### Task 6: Re-validate the Base variant + document

- [ ] **Step 1: Re-run the spike against `data-table-base.json`**

Repeat Task 1 Steps 1–5 but `shadcn add http://localhost:4000/data-table-base.json` into a fresh base-probe app. Expected now: `tsc --noEmit` PASS and all smoke-tests green. Any remaining gap → new/extended compat wrapper, then re-run Task 5.

- [ ] **Step 2: Document both URLs** in `apps/web/app/docs/installation/page.mdx`:

```mdx
<Callout variant="note" title="Radix UI or Base UI?">
Use the URL matching your project's `components.json` style:
- **Radix UI** (default) — `…/r/data-table.json`
- **Base UI** — `…/r/data-table-base.json`
</Callout>
```

- [ ] **Step 3: Rebuild search + update graph + commit**

```bash
pnpm --filter shadcn-react-table-web search:build
graphify update .
git add apps/web/app/docs/installation/page.mdx apps/web
git commit -m "docs: document radix and base ui install URLs"
```

---

## Self-Review Notes

- **Scope corrected:** the earlier draft treated `asChild` as the whole job. A doc spot-check confirmed a second difference (popup **Content → Positioner**) affecting ~10 files, with more possibly hidden. Task 1 (discovery spike) now front-loads enumeration so Tasks 3–5 are built against the real delta, not assumptions.
- **Architecture generalizes:** every difference is absorbed by a `compat/X.tsx` (Radix) + `X.base.tsx` (Base) pair; the build swaps them. `TriggerSlot` and `MenuContent` are the first two of N wrappers — N is fixed by Task 1.
- **Honest unknowns:** the exact Base API for `select`, `dialog`, `command`, `calendar`, and the existence of `DropdownMenuCheckboxItem`/`RadioGroup`/`RadioItem` are unconfirmed; Task 1 resolves them before any compat code beyond triggers is written. Some `*.base.tsx` templates may need tsconfig exclusion (they reference Base-only exports our Radix repo lacks) — decided in Task 1.
- **Already done (not re-planned):** the direct `radix-ui` Checkbox dependency was removed earlier via a self-contained `SelectionCheckbox`, so the Base Checkbox `indeterminate`/`boolean` pitfall doesn't apply.
