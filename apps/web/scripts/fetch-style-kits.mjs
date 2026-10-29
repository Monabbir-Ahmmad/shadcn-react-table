// Pulls each shadcn style's versions of the primitives the data table uses,
// by running the real shadcn CLI in a throwaway project per style, and writes
// them to apps/web/style-kits/<style>/. Needs network. Run by hand:
//   pnpm --filter shadcn-react-table-web style-kits:fetch
import { execFileSync } from "node:child_process"
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import process from "node:process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const WEB = join(dirname(fileURLToPath(import.meta.url)), "..")
const TABLE = join(
  WEB,
  "../../packages/shadcn-react-table/src/components/data-table"
)
const KITS = join(WEB, "style-kits")
const SHADCN = "shadcn@4.11.0"
const STYLES = [
  ["vega", "Vega"],
  ["nova", "Nova"],
  ["maia", "Maia"],
  ["lyra", "Lyra"],
  ["mira", "Mira"],
  ["sera", "Sera"],
]

/** Primitive names the table imports from @workspace/ui/components/*. */
function tablePrimitives() {
  const names = new Set()
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name)
      if (entry.isDirectory()) walk(p)
      else if (/\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name)) {
        for (const m of readFileSync(p, "utf8").matchAll(
          /@workspace\/ui\/components\/([a-z-]+)/g
        ))
          names.add(m[1])
      }
    }
  }
  walk(TABLE)
  return [...names].sort()
}

function rewrite(source) {
  return (
    source
      .replaceAll("\r\n", "\n")
      .replaceAll("@/lib/utils", "@workspace/ui/lib/utils")
      // the CLI leaves the registry's `from "cn"` placeholder untransformed
      .replaceAll('from "cn"', 'from "@workspace/ui/lib/utils"')
      .replace(/@\/components\/ui\/([a-z-]+)/g, "./$1")
  )
}

const primitives = tablePrimitives()
console.log(`primitives: ${primitives.join(", ")}`)
mkdirSync(KITS, { recursive: true })

for (const [name] of STYLES) {
  const tmp = mkdtempSync(join(tmpdir(), `kit-${name}-`))
  writeFileSync(
    join(tmp, "package.json"),
    JSON.stringify({ name: `kit-${name}`, private: true })
  )
  writeFileSync(join(tmp, "app.css"), '@import "tailwindcss";\n')
  writeFileSync(
    join(tmp, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: { baseUrl: ".", paths: { "@/*": ["./*"] } },
    })
  )
  writeFileSync(
    join(tmp, "components.json"),
    JSON.stringify({
      $schema: "https://ui.shadcn.com/schema.json",
      style: `radix-${name}`,
      rsc: true,
      tsx: true,
      tailwind: {
        config: "",
        css: "app.css",
        baseColor: "neutral",
        cssVariables: true,
      },
      iconLibrary: "remixicon",
      aliases: {
        components: "@/components",
        ui: "@/components/ui",
        utils: "@/lib/utils",
        lib: "@/lib",
        hooks: "@/hooks",
      },
    })
  )
  execFileSync(
    "pnpm",
    ["dlx", SHADCN, "add", ...primitives, "--yes", "--overwrite", "--cwd", tmp],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
    }
  )
  const out = join(KITS, name)
  rmSync(out, { recursive: true, force: true })
  mkdirSync(out, { recursive: true })
  const uiDir = join(tmp, "components/ui")
  for (const file of readdirSync(uiDir)) {
    writeFileSync(
      join(out, file),
      rewrite(readFileSync(join(uiDir, file), "utf8"))
    )
  }
  rmSync(tmp, { recursive: true, force: true })
  console.log(`${name}: ${readdirSync(out).length} files`)
}

writeFileSync(
  join(KITS, "styles.json"),
  JSON.stringify(
    STYLES.map(([name, label]) => ({ name, label })),
    null,
    2
  ) + "\n"
)
