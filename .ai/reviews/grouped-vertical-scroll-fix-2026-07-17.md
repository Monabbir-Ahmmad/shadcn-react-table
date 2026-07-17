# Report: vertical scroll inside the table does not engage (grouping / tree / detail panel)

**Date:** 2026-07-17
**Status:** Fixed, verified in-browser
**Branch:** `fix/sticky-header-default-max-height`

## Symptom

On the docs examples for **Grouping & aggregation**, **Tree data**, and **Detail
panel**, the table cannot be scrolled vertically *inside* the table surface.
Tall content (long groups, expanded trees, open detail panels) stretches the
table — and the whole page — to full content height instead of scrolling under
the header.

## Investigation

Reproduced against `next dev` with Playwright (wheel events + programmatic
`scrollTop` + screenshots):

1. **No event-level bug.** With the surface manually bounded to 300px, wheel
   and programmatic scrolling worked correctly on every affected page
   (grouping, tree, detail-panel), matching the unaffected control (sorting).
   Nothing in dnd-kit, the virtualizers, or grid navigation blocks scrolling.
2. **The surface is never scrollable.** The scroll container
   (`data-slot="data-table-surface"`, `core/data-table.tsx`) has
   `overflow-auto` but no height bound unless:
   - `enableRowVirtualization` is on (`max-h-150`), or
   - the consumer passes a `max-h-*` via `surfaceClassName` (as the sticky
     and virtualization examples do).

   The grouping/tree/detail-panel examples pass neither, so
   `scrollHeight === clientHeight` (2139px on the grouping page) and there is
   nothing to scroll. Checked history: a default bound never existed — not a
   regression.
3. **Knock-on effect:** `enableStickyHeader` defaults to `true` and the
   grouping example sets `enableStickyFooter`, but sticky positioning is
   meaningless without a bounded scroll surface — both were dead features in
   the default configuration.

## Root cause

The scrollable surface has no default max-height, so internal vertical
scrolling (and the sticky header/footer that depend on it) only ever engaged
when the consumer opted in manually.

## MRT parity check

Material React Table (the parity target):

- defaults `enableStickyHeader` / `enableStickyFooter` to **`false`**;
- when `enableStickyHeader` is enabled, its table container gets a **default
  `100vh` maxHeight** so the table scrolls internally under the pinned header
  (confirmed against the MRT sticky-header guide).

So MRT's model is "sticky header ⇒ default bound". This repo already deviates
deliberately by defaulting sticky to `true`; it was missing the bound half of
the behavior.

## Fix (library default, chosen over docs-only patch)

`packages/shadcn-react-table/src/components/data-table/core/data-table.tsx`:
when `enableStickyHeader` is true (the default), the surface now gets

```
max-h-[clamp(350px, calc(100vh - 200px), 9999px)]
```

- `clamp` mirrors MRT's approach; the `-200px` leaves room for the toolbar and
  pagination, the `350px` floor keeps short viewports usable.
- Precedence via tailwind-merge (later `max-h-*` wins):
  sticky bound → virtualization `max-h-150` → consumer `surfaceClassName`.
- Opt-outs: `enableStickyHeader: false` removes the bound entirely;
  `surfaceClassName` (e.g. `max-h-none` or any `max-h-*`) overrides it.

Supporting changes:

- `core/types.ts` — documented the new `enableStickyHeader` behavior.
- `core/data-table.tsx` — updated the `surfaceClassName` prop doc.
- `apps/web/app/docs/guides/sticky/page.mdx` — the guide no longer claims a
  manual max-height is required; documents the default bound and opt-outs.
- Regenerated committed artifacts (`apps/web/public/r/*.json`,
  `apps/web/lib/api-reference.generated.ts`).

## Verification

Playwright against `next dev`, viewport 1280×900:

| Page | Bound (computed) | Result |
| --- | --- | --- |
| Grouping | 700px | Internal scroll works; header row stays pinned while rows scroll (screenshot-verified) |
| Detail panel | 700px | After expanding rows past the bound, internal scroll engages; header pinned |
| Tree | 700px | Demo dataset is 417px fully expanded — fits the bound, correctly nothing to scroll |
| Sticky guide | 460px | `surfaceClassName="max-h-[460px]"` still overrides the default |
| Virtualization guide | 600px | `max-h-150` still wins over the sticky bound |

`pnpm lint` and `pnpm typecheck` pass; the CI freshness check
(`git diff --exit-code -- apps/web/public/r apps/web/lib/api-reference.generated.ts`
after rebuild) passes.

## Open decision

`enableStickyHeader`/`enableStickyFooter` remain defaulted to `true` (this
repo's long-standing deviation from MRT's `false`). Flipping them to match MRT
would un-stick headers for existing consumers and re-break these examples
unless they opt in — deferred pending a maintainer call.
