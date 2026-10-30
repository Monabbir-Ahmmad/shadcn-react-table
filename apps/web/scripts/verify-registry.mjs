// Verifies the built registry artifact from the consumer's perspective:
// extracts /r/data-table.json into a fixture laid out exactly as `shadcn add`
// would install it, then typechecks it with the consumer-standard `@/` aliases
// mapped onto this repo's shadcn primitives. Catches import-rewrite bugs and
// rewritten code that no longer compiles. Run after registry:build:
//   node apps/web/scripts/verify-registry.mjs
import { execSync } from "node:child_process"
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { dirname, join } from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../..")
const ITEM = JSON.parse(
  readFileSync(join(REPO, "apps/web/public/r/data-table.json"), "utf8")
)
const R_DIR = join(REPO, "apps/web/public/r")
const EXPECTED_LOCALES = 37
const LOCALE_ITEMS = readdirSync(R_DIR)
  .filter((f) => f.startsWith("data-table-locale-") && f.endsWith(".json"))
  .sort()
  .map((f) => JSON.parse(readFileSync(join(R_DIR, f), "utf8")))

if (LOCALE_ITEMS.length !== EXPECTED_LOCALES) {
  console.error(
    `registry verify FAILED: expected ${EXPECTED_LOCALES} locale items, found ${LOCALE_ITEMS.length}`
  )
  process.exit(1)
}
// The shape the shadcn CLI reads (registry-item.json): every item has a name,
// type and version, every file a path, type, target and content, and every
// npm dependency a version range.
const VERSION = JSON.parse(
  readFileSync(join(REPO, "packages/shadcn-react-table/package.json"), "utf8")
).version
const problems = []
for (const item of [ITEM, ...LOCALE_ITEMS]) {
  if (!item.name || !item.type || !item.$schema) {
    problems.push(`${item.name ?? "?"}: missing name, type or $schema`)
  }
  if (item.meta?.version !== VERSION) {
    problems.push(`${item.name}: meta.version is not ${VERSION}`)
  }
  for (const file of item.files ?? []) {
    if (!file.path || !file.type || !file.target || !file.content) {
      problems.push(`${item.name}: incomplete file ${file.path ?? "?"}`)
    }
  }
  for (const dep of item.dependencies ?? []) {
    if (!/^(@[^/@]+\/)?[^/@]+@\S+$/.test(dep)) {
      problems.push(`${item.name}: dependency without a version: ${dep}`)
    }
  }
}
const targets = ITEM.files.map((f) => f.target)
if (new Set(targets).size !== targets.length) {
  problems.push("data-table: duplicate file targets")
}
if (problems.length > 0) {
  console.error(`registry verify FAILED:\n  ${problems.join("\n  ")}`)
  process.exit(1)
}

const leaked = ITEM.files.filter((f) => f.path.includes("/locales/"))
if (leaked.length > 0) {
  console.error(
    `registry verify FAILED: data-table.json must not contain locale files, found: ${leaked.map((f) => f.path).join(", ")}`
  )
  process.exit(1)
}

// The fixture lives inside the table package so the block's npm dependencies
// (@tanstack/*, @dnd-kit/*, date-fns, …) resolve from its node_modules.
const PKG_DIR = join(REPO, "packages/shadcn-react-table")
const FIXTURE = join(PKG_DIR, ".registry-fixture")

rmSync(FIXTURE, { recursive: true, force: true })
for (const file of [...ITEM.files, ...LOCALE_ITEMS.flatMap((i) => i.files)]) {
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
  `registry fixture typecheck passed (${ITEM.files.length} files + ${LOCALE_ITEMS.length} locale items)`
)
