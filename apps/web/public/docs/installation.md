# Installation

The data table is distributed as a **shadcn registry** item. The CLI installs the table source into your project, pulls the shadcn primitives it depends on (in *your* configured style), and installs the npm packages it needs.

## Prerequisites

- A project already set up with **shadcn/ui** (a `components.json` with your style, base color, and `@/components/ui` aliases). If you don't have one, run `pnpm dlx shadcn@latest init` first.
- **Tailwind CSS v4** and React 19 / Next.js (or any bundler that compiles your `components/`).

> **Any shadcn style works — Radix UI or Base UI:** It only uses standard primitive APIs, so it adapts to any shadcn style (Sera, Vega, Nova, Luma, …), base color, **and component library flavor**. The same URL works in Radix-flavored and Base-UI-flavored projects: a current shadcn CLI (4.x — the one with `init -b radix|base`) adapts the source to your flavor at install time and pulls the primitives in *your* style. Nothing is overwritten unless you opt in.

## Add the component

Run the shadcn CLI against the registry URL:

```bash
pnpm dlx shadcn@latest add https://monabbir-ahmmad.github.io/shadcn-react-table/r/data-table.json
```

This single command:

1. **Installs npm dependencies** — `@tanstack/react-table@^9`, `@tanstack/react-virtual`, `@tanstack/match-sorter-utils@^9`, `@dnd-kit/*`, `date-fns`, `lucide-react`. The headless component library (Radix UI or Base UI) comes with the primitives below, matching your flavor.
2. **Pulls the shadcn primitives** it uses (`badge`, `button`, `calendar`, `checkbox`, `command`, `context-menu`, `dialog`, `dropdown-menu`, `input`, `label`, `popover`, `select`, `skeleton`, `slider`, `table`, `tooltip`) in your style — and skips any you already have.
3. **Writes the table** to `components/ui/data-table/`.
4. **Injects design tokens** (`--highlight`, `--highlight-foreground`) into your `globals.css`.

## Use a namespace (optional)

To install by name instead of URL, add the registry to your `components.json`:

```json
{
  "registries": {
    "@shadcn-react-table": "https://monabbir-ahmmad.github.io/shadcn-react-table/r/{name}.json"
  }
}
```

Then:

```bash
pnpm dlx shadcn@latest add @shadcn-react-table/data-table
# a language, e.g. German
pnpm dlx shadcn@latest add @shadcn-react-table/data-table-locale-de
```

## Verify

Import the public API from your `@/components/ui/data-table` alias:

```tsx
import { DataTable, useDataTable } from "@/components/ui/data-table"
```

> **react-day-picker v9+:** If your shadcn `calendar.tsx` predates react-day-picker v9, its `classNames` may use the old `table` key (renamed to `month_grid`). Re-run `shadcn add calendar` or rename the key — this only affects the date filter variant. The calendar itself comes from your own shadcn setup via `registryDependencies` — the table isn't tied to react-day-picker, and any calendar with a compatible props surface drops in.

## Next

Head to the [Quick start](/docs/quick-start) to render your first table.
