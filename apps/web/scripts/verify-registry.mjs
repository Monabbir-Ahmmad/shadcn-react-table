// Verifies the built registry artifact from the consumer's perspective:
// extracts /r/data-table.json into a fixture laid out exactly as `shadcn add`
// would install it, then typechecks it with the consumer-standard `@/` aliases
// mapped onto this repo's shadcn primitives. Catches import-rewrite bugs and
// rewritten code that no longer compiles. Run after registry:build:
//   node apps/web/scripts/verify-registry.mjs
import { execSync } from "node:child_process"
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../..")
const ITEM = JSON.parse(
  readFileSync(join(REPO, "apps/web/public/r/data-table.json"), "utf8")
)
// The fixture lives inside the table package so the block's npm dependencies
// (@tanstack/*, @dnd-kit/*, date-fns, …) resolve from its node_modules.
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
console.log(`registry fixture typecheck passed (${ITEM.files.length} files)`)
