// Builds the shadcn registry item(s) for shadcn-react-table, served at /r/*.json
// so users can run `npx shadcn@latest add <url>`. Reads the
// @monabbir/shadcn-react-table source, rewrites its package imports to the
// shadcn-standard `@/components/ui/*` and
// `@/lib/*` aliases (the CLI then maps `@/` to the consumer's own aliases),
// and writes the registry-item JSON. Run from the repo root:
//   node apps/web/scripts/build-registry.mjs
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs"
import { join, dirname, relative } from "node:path"
import { fileURLToPath } from "node:url"

// Anchor to the repo root from this file (apps/web/scripts/), so the script
// works regardless of the cwd `pnpm --filter` runs it in.
const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../..")
// Single source of truth for the block's version (stamped into meta.version
// so consumers can tell which release their copy came from).
const PKG = JSON.parse(
  readFileSync(join(REPO, "packages/shadcn-react-table/package.json"), "utf8")
)
// The data-table module lives in the @monabbir/shadcn-react-table package; the
// shadcn primitives it imports live in @workspace/ui. Only the data-table source
// is shipped (primitives come from the consumer's own shadcn setup), so we read
// from packages/shadcn-react-table/src.
const UI_SRC = join(REPO, "packages/shadcn-react-table/src")
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
  // NOT radix-ui: the module has no direct radix import. The primitive blocks
  // in registryDependencies bring the right headless library for the
  // consumer's flavor (radix-ui or @base-ui/react) on their own.
  "lucide-react",
]

// Type-only packages for deps that don't ship their own declarations. Without
// these the consumer's `tsc --noEmit` fails. shadcn installs these into the
// consumer's devDependencies.
const DEV_DEPENDENCIES = []

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
    // Normalize CRLF from Windows checkouts (git autocrlf) so the embedded
    // file contents — and therefore the artifact — are machine-independent.
    .replaceAll("\r\n", "\n")
    .replaceAll("@workspace/ui/components/", "@/components/ui/")
    .replaceAll("@workspace/ui/lib/", "@/lib/")
}

function read(relPath) {
  return rewrite(readFileSync(join(UI_SRC, relPath), "utf8"))
}

// Ship only the data-table module. Primitives + lib/utils come from the
// consumer's own shadcn setup (via registryDependencies and the standard
// `@/lib/utils`), so the table inherits their style and nothing is overwritten.
//
// The module has a small public root (data-table, use-data-table, types,
// config-context, icons, localization + the index barrel) and an
// internal/ subtree of building blocks, so we walk recursively and preserve
// each file's subpath in the registry `path`/`target`. The table's internal
// imports are relative, so the consumer's install must reproduce the same
// nested layout to resolve them.
const DT_DIR = join(UI_SRC, "components/data-table")
function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(abs))
    else if (
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
      // In-repo test files are not part of the shipped block.
      !entry.name.includes(".test.")
    )
      out.push(abs)
  }
  return out
}

const files = []
for (const abs of walk(DT_DIR).sort()) {
  // Forward-slash subpath (e.g. "filtering/filter-fns.ts") for portability.
  const sub = relative(DT_DIR, abs).split("\\").join("/")
  files.push({
    path: `ui/data-table/${sub}`,
    type: "registry:ui",
    target: `components/ui/data-table/${sub}`,
    content: read(`components/data-table/${sub}`),
  })
}

const item = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "data-table",
  type: "registry:block",
  title: "Data Table",
  description:
    "An MRT-complete data table for shadcn/ui (TanStack Table v8): sorting, filtering, search, grouping, editing, pinning, virtualization, export and more.",
  meta: { version: PKG.version },
  dependencies: NPM_DEPENDENCIES,
  devDependencies: DEV_DEPENDENCIES,
  registryDependencies: REGISTRY_DEPENDENCIES,
  files,
  cssVars,
}

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "shadcn-react-table",
  homepage: "https://github.com/Monabbir-Ahmmad/shadcn-react-table",
  items: [
    {
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
      meta: { version: PKG.version },
    },
  ],
}

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, "data-table.json"), JSON.stringify(item, null, 2))
writeFileSync(join(OUT, "registry.json"), JSON.stringify(registry, null, 2))

console.log(
  `registry built → apps/web/public/r/data-table.json (${files.length} files, ` +
    `${item.dependencies.length} npm deps, ${item.devDependencies.length} dev deps, ` +
    `${item.registryDependencies.length} registry deps, v${PKG.version})`
)
