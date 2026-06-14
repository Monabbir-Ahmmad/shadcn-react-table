// Builds the shadcn registry item(s) for tablecn, served at /r/*.json so users
// can run `npx shadcn@latest add <url>`. Reads the @monabbir/tablecn source,
// rewrites its package imports to the shadcn-standard `@/components/ui/*` and
// `@/lib/*` aliases (the CLI then maps `@/` to the consumer's own aliases),
// and writes the registry-item JSON. Run from the repo root:
//   node apps/web/scripts/build-registry.mjs
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

// Anchor to the repo root from this file (apps/web/scripts/), so the script
// works regardless of the cwd `pnpm --filter` runs it in.
const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../..")
const UI_SRC = join(REPO, "packages/ui/src")
const OUT = join(REPO, "apps/web/public/r")

// npm packages the data-table source imports directly. The shadcn primitives
// (below) bring their own deps (radix, cmdk, react-day-picker, cva, …) when the
// consumer's CLI installs them, so those are intentionally NOT listed here.
const NPM_DEPENDENCIES = [
  "@tanstack/react-table",
  "@tanstack/match-sorter-utils",
  "@tanstack/react-virtual",
  "@dnd-kit/core",
  "@dnd-kit/sortable",
  "@dnd-kit/utilities",
  "date-fns",
  "papaparse",
  "xlsx",
  "radix-ui",
  "@remixicon/react",
]

// shadcn primitives the table imports. Declared as registryDependencies (bare
// names) so the consumer's `shadcn add` installs them from the shadcn registry
// in THEIR configured style/baseColor — and skips any they already have. The
// table only uses standard primitive APIs, so it adapts to any style.
const REGISTRY_DEPENDENCIES = [
  "badge",
  "button",
  "calendar",
  "checkbox",
  "command",
  "context-menu",
  "dialog",
  "dropdown-menu",
  "input",
  "label",
  "popover",
  "select",
  "skeleton",
  "slider",
  "table",
  "tooltip",
]

// New design tokens this component introduces (shipped via cssVars so the CLI
// injects them into the consumer's globals.css; fall back to --accent).
const cssVars = {
  theme: {
    "color-highlight": "var(--highlight, var(--accent))",
    "color-highlight-foreground":
      "var(--highlight-foreground, var(--accent-foreground))",
  },
  light: {
    highlight: "oklch(0.905 0.158 96.5)",
    "highlight-foreground": "oklch(0.35 0.07 72)",
  },
  dark: {
    highlight: "oklch(0.85 0.16 96.5)",
    "highlight-foreground": "oklch(0.26 0.05 72)",
  },
}

/** Rewrite internal package imports to the portable shadcn `@/` aliases. */
function rewrite(content) {
  return content
    .replaceAll("@monabbir/tablecn/components/", "@/components/ui/")
    .replaceAll("@monabbir/tablecn/lib/", "@/lib/")
}

function read(relPath) {
  return rewrite(readFileSync(join(UI_SRC, relPath), "utf8"))
}

// Ship only the data-table module. Primitives + lib/utils come from the
// consumer's own shadcn setup (via registryDependencies and the standard
// `@/lib/utils`), so the table inherits their style and nothing is overwritten.
const files = []
for (const f of readdirSync(join(UI_SRC, "components/data-table")).filter(
  (f) => f.endsWith(".ts") || f.endsWith(".tsx")
)) {
  files.push({
    path: `ui/data-table/${f}`,
    type: "registry:ui",
    target: `components/ui/data-table/${f}`,
    content: read(`components/data-table/${f}`),
  })
}

const item = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "data-table",
  type: "registry:block",
  title: "tablecn Data Table",
  description:
    "An MRT-complete data table for shadcn/ui (TanStack Table v8): sorting, filtering, search, grouping, editing, pinning, virtualization, export and more.",
  dependencies: NPM_DEPENDENCIES,
  registryDependencies: REGISTRY_DEPENDENCIES,
  files,
  cssVars,
}

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "tablecn",
  homepage: "https://github.com/Monabbir-Ahmmad/tablecn",
  items: [
    {
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
    },
  ],
}

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, "data-table.json"), JSON.stringify(item, null, 2))
writeFileSync(join(OUT, "registry.json"), JSON.stringify(registry, null, 2))

console.log(
  `registry built → apps/web/public/r/data-table.json (${files.length} files, ` +
    `${item.dependencies.length} npm deps, ${item.registryDependencies.length} registry deps)`
)
