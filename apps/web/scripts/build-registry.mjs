// Builds the shadcn registry item(s) for shadcn-react-table, served at /r/*.json
// so users can run `npx shadcn@latest add <url>`. Reads the
// @monabbir/shadcn-react-table source, rewrites its package imports to the
// shadcn-standard `@/components/ui/*` and
// `@/lib/*` aliases (the CLI then maps `@/` to the consumer's own aliases),
// and writes the registry-item JSON. Run from the repo root:
//   node apps/web/scripts/build-registry.mjs
import {
  readFileSync,
  readdirSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  rmSync,
} from "node:fs"
import { join, dirname, relative } from "node:path"
import process from "node:process"
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

// npm packages and shadcn primitives the shipped source imports are derived
// from an import scan (see `scanImports` below), so a new import can't ship
// without its dependency. Versions come from this package's own
// package.json — the ranges the tests run against. The shadcn primitives
// bring their own deps (radix-ui or @base-ui/react, cmdk, react-day-picker,
// cva, …) when the consumer's CLI installs them, so those are not listed.
const PROVIDED_BY_CONSUMER = new Set(["react", "react-dom"])

// Type-only packages for deps that don't ship their own declarations. Without
// these the consumer's `tsc --noEmit` fails. shadcn installs these into the
// consumer's devDependencies.
const DEV_DEPENDENCIES = []

// The shadcn primitives the table imports become registryDependencies (bare
// names), so the consumer's `shadcn add` installs them from the shadcn
// registry in THEIR configured style/baseColor — and skips any they already
// have. The table only uses standard primitive APIs, so it adapts to any style.

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
  return (
    content
      // Normalize CRLF from Windows checkouts (git autocrlf) so the embedded
      // file contents — and therefore the artifact — are machine-independent.
      .replaceAll("\r\n", "\n")
      .replaceAll("@workspace/ui/components/", "@/components/ui/")
      .replaceAll("@workspace/ui/lib/", "@/lib/")
  )
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
    // Locales ship as their own registry items (one per language), never as
    // part of the main item.
    if (entry.isDirectory()) {
      if (entry.name !== "locales") out.push(...walk(abs))
    } else if (
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

/**
 * The npm packages and shadcn primitives the shipped files import. Fails the
 * build for a package the block's package.json doesn't declare, since the
 * registry could not give it a version.
 */
function scanImports(contents) {
  const packages = new Set()
  const primitives = new Set()
  for (const content of contents) {
    for (const [, spec] of content.matchAll(
      /(?:^|\n)\s*(?:import|export)\s[^"']*?from\s+["']([^"']+)["']/g
    )) {
      if (spec.startsWith(".")) continue
      const primitive = /^@\/components\/ui\/([\w-]+)$/.exec(spec)
      if (primitive) {
        primitives.add(primitive[1])
        continue
      }
      if (spec.startsWith("@/")) continue
      const parts = spec.split("/")
      const name = spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
      if (!PROVIDED_BY_CONSUMER.has(name)) packages.add(name)
    }
  }
  const missing = [...packages].filter((name) => !PKG.dependencies?.[name])
  if (missing.length > 0) {
    console.error(
      `registry: imported but not in packages/shadcn-react-table/package.json dependencies: ${missing.join(", ")}`
    )
    process.exit(1)
  }
  return {
    dependencies: [...packages]
      .sort()
      .map((name) => `${name}@${PKG.dependencies[name]}`),
    registryDependencies: [...primitives].sort(),
  }
}

const {
  dependencies: NPM_DEPENDENCIES,
  registryDependencies: REGISTRY_DEPENDENCIES,
} = scanImports(files.map((file) => file.content))

const item = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "data-table",
  type: "registry:block",
  title: "Data Table",
  description:
    "An MRT-complete data table for shadcn/ui (TanStack Table v9): sorting, filtering, search, grouping, editing, pinning, virtualization, export and more.",
  meta: { version: PKG.version },
  dependencies: NPM_DEPENDENCIES,
  devDependencies: DEV_DEPENDENCIES,
  registryDependencies: REGISTRY_DEPENDENCIES,
  files,
  cssVars,
}

// One registry item per locale file (locales/<id>.ts). Each is a single file
// with no npm/registry dependencies: it only type-imports from the data-table
// item, which the consumer adds first.
const LOCALES_DIR = join(DT_DIR, "locales")
const localeIds = existsSync(LOCALES_DIR)
  ? readdirSync(LOCALES_DIR)
      .filter((f) => f.endsWith(".ts") && !f.includes(".test."))
      .map((f) => f.slice(0, -".ts".length))
      .sort()
  : []

const LANGUAGE_NAMES = {
  ar: "Arabic",
  az: "Azerbaijani",
  bg: "Bulgarian",
  cs: "Czech",
  da: "Danish",
  de: "German",
  el: "Greek",
  es: "Spanish",
  et: "Estonian",
  fa: "Persian",
  fi: "Finnish",
  fr: "French",
  he: "Hebrew",
  hr: "Croatian",
  hu: "Hungarian",
  hy: "Armenian",
  id: "Indonesian",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  ne: "Nepali",
  nl: "Dutch",
  no: "Norwegian",
  pl: "Polish",
  pt: "Portuguese",
  "pt-BR": "Portuguese (Brazil)",
  ro: "Romanian",
  ru: "Russian",
  sk: "Slovak",
  "sr-Cyrl-RS": "Serbian (Cyrillic)",
  "sr-Latn-RS": "Serbian (Latin)",
  sv: "Swedish",
  tr: "Turkish",
  uk: "Ukrainian",
  vi: "Vietnamese",
  "zh-Hans": "Chinese (Simplified)",
  "zh-Hant": "Chinese (Traditional)",
}

const localeItems = localeIds.map((lang) => ({
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: `data-table-locale-${lang}`,
  type: "registry:ui",
  title: `Data Table locale: ${LANGUAGE_NAMES[lang] ?? lang} (${lang})`,
  description: `The data table's interface text in ${LANGUAGE_NAMES[lang] ?? lang}. Add the data-table item first.`,
  meta: { version: PKG.version },
  files: [
    {
      path: `ui/data-table/locales/${lang}.ts`,
      type: "registry:ui",
      target: `components/ui/data-table/locales/${lang}.ts`,
      content: read(`components/data-table/locales/${lang}.ts`),
    },
  ],
}))

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
    ...localeItems.map(({ name, type, title, description, meta }) => ({
      name,
      type,
      title,
      description,
      meta,
    })),
  ],
}

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, "data-table.json"), JSON.stringify(item, null, 2))
for (const locale of localeItems) {
  writeFileSync(
    join(OUT, `${locale.name}.json`),
    JSON.stringify(locale, null, 2)
  )
}
// Drop locale items whose source file no longer exists.
const liveNames = new Set(localeItems.map((l) => `${l.name}.json`))
for (const f of readdirSync(OUT)) {
  if (f.startsWith("data-table-locale-") && !liveNames.has(f))
    rmSync(join(OUT, f))
}
writeFileSync(join(OUT, "registry.json"), JSON.stringify(registry, null, 2))

console.log(
  `registry built → apps/web/public/r/data-table.json (${files.length} files, ` +
    `${item.dependencies.length} npm deps, ${item.devDependencies.length} dev deps, ` +
    `${item.registryDependencies.length} registry deps, v${PKG.version}) + ` +
    `${localeItems.length} locale items`
)
