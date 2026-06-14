# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Next.js version

This repo uses **Next.js 16.2.6** (with React 19.2.4). Per `AGENTS.md`, this version has breaking changes vs. older Next.js — APIs, conventions, and file structure may differ from training data. Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices.

## Commands

Package manager is **pnpm 10.33.4** (Node ≥ 20). All top-level tasks are orchestrated by Turborepo and fan out via `dependsOn: ["^task"]`.

From repo root:
- `pnpm dev` — runs `next dev` for `apps/web` (persistent, uncached)
- `pnpm build` — builds all workspaces
- `pnpm lint` — ESLint across workspaces
- `pnpm typecheck` — `tsc --noEmit` across workspaces
- `pnpm format` — Prettier `--write` across workspaces

Per-package: same scripts exist inside `apps/web/package.json` and `packages/ui/package.json` and can be run directly with `pnpm --filter web <script>` or `pnpm --filter @monabbir/tablecn <script>`.

There is no test runner configured in this repo.

## Adding shadcn/ui components

Run from the **repo root** (not inside `apps/web`):

```bash
pnpm dlx shadcn@latest add <component> -c apps/web
```

Components land in `packages/ui/src/components/` (not in `apps/web`). The `apps/web/components.json` `ui` alias is wired to `@monabbir/tablecn/components`, so the shadcn CLI writes there even when targeting the web app. Import with `import { Foo } from "@monabbir/tablecn/components/foo"`.

shadcn config (both `components.json` files agree): `style: radix-sera`, `baseColor: neutral`, `iconLibrary: remixicon`, RSC + TSX enabled, CSS variables on. The single source-of-truth stylesheet is `packages/ui/src/styles/globals.css`.

## Architecture

Turborepo + pnpm workspaces. Workspaces are `apps/*` and `packages/*`.

### Consumption model: source, not built artifacts

`@monabbir/tablecn` has **no build step**. Its `exports` field points directly at `./src/*` (`.ts`/`.tsx`), and `apps/web/next.config.ts` declares `transpilePackages: ["@monabbir/tablecn"]` so Next compiles the package's source in-tree. Consequences:
- Edits in `packages/ui/src/` are picked up immediately by `next dev` — no rebuild needed.
- The package cannot be consumed outside a bundler that transpiles it (intentional — it's a private internal package).
- `apps/web/tsconfig.json` maps `@monabbir/tablecn/*` → `../../packages/ui/src/*` so TS resolves the same source paths as runtime.

### Path aliases (apps/web)
- `@/*` → app-local files (`apps/web/*`) — used for app-only components/hooks/lib
- `@monabbir/tablecn/components/*`, `@monabbir/tablecn/hooks/*`, `@monabbir/tablecn/lib/*` → shared package
- `@monabbir/tablecn/globals.css` — the shared stylesheet, imported once in `apps/web/app/layout.tsx`
- `cn` helper lives at `@monabbir/tablecn/lib/utils` (clsx + tailwind-merge)

### Shared config packages
- `@workspace/eslint-config` exports `./base`, `./next-js`, `./react-internal`. `apps/web` uses `next-js`; `packages/ui` uses `react-internal`. Root `.eslintrc.js` only sets ignore patterns.
- `@workspace/typescript-config` exports `base.json`, `nextjs.json`, `react-library.json`. Each workspace's `tsconfig.json` extends the right one.

### Styling
Tailwind CSS v4 via `@tailwindcss/postcss`. Prettier is configured with `prettier-plugin-tailwindcss`, scanning `packages/ui/src/styles/globals.css` and recognizing the `cn` and `cva` functions for class sorting. Prettier style: no semicolons, double quotes, 2-space, `trailingComma: es5`, `printWidth: 80`, LF line endings.

Theme switching is handled by `next-themes` via `apps/web/components/theme-provider.tsx`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
