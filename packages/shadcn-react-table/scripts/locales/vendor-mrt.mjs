// Vendors the Material React Table locale strings into ./mrt-3.2.1.
//
// Usage: node scripts/locales/vendor-mrt.mjs <path-to-extracted-package>
//   (extract with: npm pack material-react-table@3.2.1 && tar -xzf <tgz>)
//
// Writes mrt-3.2.1/<lang>.json (sorted keys) and copies the package LICENSE.
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const source = process.argv[2]

if (!source) {
  console.error(
    "usage: node vendor-mrt.mjs <path-to-extracted-material-react-table>"
  )
  process.exit(1)
}

const root = resolve(source)
const require = createRequire(join(root, "package.json"))
const outDir = join(here, "mrt-3.2.1")
mkdirSync(outDir, { recursive: true })

const langs = readdirSync(join(root, "locales"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

for (const lang of langs) {
  const mod = require(join(root, "locales", lang, "index.js"))
  const strings = Object.values(mod)[0]
  const sorted = Object.fromEntries(
    Object.keys(strings)
      .sort()
      .map((key) => [key, strings[key]])
  )
  writeFileSync(
    join(outDir, `${lang}.json`),
    JSON.stringify(sorted, null, 2) + "\n"
  )
}

copyFileSync(join(root, "LICENSE"), join(outDir, "LICENSE"))
console.log(`vendored ${langs.length} locales into ${outDir}`)
