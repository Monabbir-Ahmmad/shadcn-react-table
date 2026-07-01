# Base UI Delta — Discovery Spike Results

**Date executed:** 2026-07-02 (plan: `.ai/plans/base-ui-flavor-support-2026-06-21.md`, Task 1)

## Probe setup (reproducible)

- Registry served: `npx -y serve apps/web/public/r -l 4000` → `http://localhost:4000/data-table.json` (HTTP 200)
- Probe app: `pnpm create next-app base-probe` (Next 16, TS, Tailwind), then
  `pnpm dlx shadcn@latest init -y -f -b base -p vega`
  → `components.json` `"style": "base-vega"`, dependency **`@base-ui/react@^1.6.0`** (note: the package is `@base-ui/react`, not `@base-ui-components/react`), `iconLibrary: lucide`.
- Install: `pnpm dlx shadcn@latest add http://localhost:4000/data-table.json --overwrite -y`
- Verified the primitives are genuinely Base UI: `dropdown-menu.tsx` imports `Menu as MenuPrimitive from "@base-ui/react/menu"`; zero `asChild` anywhere in `src/components/ui/*.tsx`; `BaseUIComponentProps` exposes `render`, not `asChild` (no index signature — unknown props DO type-error, verified with a probe file).

## Headline findings — the plan's two "known differences" are already absorbed

**1. The shadcn CLI transforms composition at install time.**
When the target project's `components.json` is Base-flavored, `shadcn add` rewrites our Radix-authored source during install:

```tsx
// our repo source (Radix idiom)
<TooltipTrigger asChild>
  <button type="button" onClick={copy} … >{children}</button>
</TooltipTrigger>

// what lands in the Base probe (CLI-transformed)
<TooltipTrigger render={<button type="button" onClick={copy} … />}>{children}</TooltipTrigger>
```

Verified in the installed output for tooltip (`click-to-copy.tsx`) and dropdown-menu (`data-table-row-actions.tsx`); `grep -rc asChild` over the installed module = **0 occurrences** across all 25 trigger sites. A hand-written `asChild` in a fresh file *does* error (TS2322), proving the pass-through is a transform, not lenient typing.

**2. The Base shadcn wrappers absorb the Positioner restructure internally.**
Base's `TooltipContent`/`DropdownMenuContent`/`PopoverContent`/`SelectContent`/… keep the same public component names and nest `Portal → Positioner → Popup` inside the wrapper. Consumer code (our table) never touches a `*Positioner`.

**Consequences for the plan:**
- **No `compat/` layer is needed** (Tasks 2–4 as designed are obsolete).
- **No second registry variant is needed** (Task 5 obsolete) — one `data-table.json` serves both flavors; the CLI flavors it client-side.
- The `.base.tsx` / tsconfig-exclusion question is **moot**.

## The real delta: 3 API differences (4 tsc errors)

`pnpm tsc --noEmit` in the probe → exactly 4 errors, all fixable **flavor-neutrally in our source**:

### D1. `TooltipProvider` delay prop
- `core/data-table.tsx:110` — `<TooltipProvider delayDuration={300}>`
- Radix: `delayDuration` · Base wrapper: `delay` (`TS2322: Property 'delayDuration' does not exist`)
- The CLI does not transform prop names.
- **Fix:** pass both via a single spread constant typed loosely, e.g.
  `{...({ delayDuration: 300, delay: 300 } as React.ComponentProps<typeof TooltipProvider>)}` — both providers are context-only components, each ignores the foreign key. Alternative: drop the prop (accept flavor-default delays). Decision at implementation.

### D2. Slider `onValueChange` payload type
- `components/head/filter-variants/range-slider.tsx:30` (×2, TS7053)
- Radix: `(value: number[]) => void` · Base: `(value: number | readonly number[], …) => void` (single-thumb union)
- **Fix (flavor-neutral):** normalize — `const pair = Array.isArray(next) ? next : [next, next]` before indexing.

### D3. Select `onValueChange` nullability
- `components/menus/data-table-filter-panel.tsx:216` (TS2345)
- Radix: `(value: string) => void` · Base: value can be `string | null` (Base Select supports null value)
- **Fix (flavor-neutral):** guard — `(v) => { if (v != null) changeColumn(rule, v) }`.
  (`changeColumn(rule: AdvancedFilterRule, columnId: string)` at `data-table-filter-panel.tsx:132` requires a string.)

## Per-primitive verdicts (full inventory from the plan)

| Primitive | Verdict |
|---|---|
| tooltip | Trigger: CLI-transformed. Content: wrapper-absorbed. **Provider: D1 (real delta).** |
| dropdown-menu | Trigger CLI-transformed; Content/Item/CheckboxItem/RadioGroup/RadioItem/Label/Separator all exist in the Base wrapper with compatible APIs (module compiles clean). |
| popover | Trigger CLI-transformed; Content wrapper-absorbed. No delta. |
| context-menu | Same as popover. No delta. |
| select | Trigger/Value/Content/Item compatible; **`onValueChange` nullability: D3.** |
| dialog | Content/Header/Footer/Title compile clean. No delta. |
| command | Compiles clean (cmdk-based in both flavors). No delta. |
| calendar | Compiles clean. No delta. |
| slider | **`onValueChange` payload: D2.** |
| input, label, badge, checkbox, skeleton, table, button, textarea, input-group | No delta (leaf usage; SelectionCheckbox is a self-contained raw button, no primitive dependency). |

## tsc appendix (deduped) → mapping

| Error | Maps to |
|---|---|
| `range-slider.tsx(30,13)` TS7053 `Property '0' does not exist on 'number \| readonly number[]'` | D2 |
| `range-slider.tsx(30,32)` TS7053 (same, index 1) | D2 |
| `data-table-filter-panel.tsx(216,64)` TS2345 `string \| null → string` | D3 |
| `data-table.tsx(110,22)` TS2322 `delayDuration does not exist on TooltipProviderProps` | D1 |

Every error maps to a fix — exit criterion met.

## Not verified here (deferred to Task 6 re-validation)

- **Runtime smoke** (browser interaction: menus opening, select behavior, date popovers) — this session is non-interactive. `pnpm build` of the probe currently fails on the same 4 type errors (expected pre-fix). Task 6 must: apply the fixes, rebuild the registry, reinstall into a fresh Base probe, get `tsc --noEmit` **PASS** and `pnpm build` **PASS**, and SSR-render a kitchen-sink page as the runtime proxy.
- CLI-transform coverage is trusted from observed output (tooltip + dropdown-menu sites). Task 6's clean tsc over all 82 files re-verifies it for every site.

## Revised remaining work (replaces plan Tasks 2–5)

1. Apply D1–D3 as flavor-neutral edits in `packages/shadcn-react-table/src` (repo stays Radix-flavored and must still typecheck + behave identically).
2. Rebuild registry (single variant, unchanged pipeline).
3. Re-validate against a fresh Base probe (former Task 6, now the acceptance gate).
4. Document in installation docs: same URL for both flavors; requires shadcn CLI ≥ the version that flavor-transforms (`-b base` era, shadcn 4.x).
