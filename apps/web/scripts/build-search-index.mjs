// Builds the Pagefind search index from the static export. Pagefind crawls the
// generated HTML in apps/web/out (produced by `next build` with output:export)
// and writes a static index + runtime under out/pagefind, which the docs search
// dialog loads at runtime. Only runs when the export exists, so plain
// (non-Pages) builds are a no-op. Run from anywhere (anchored via import.meta).
//   node apps/web/scripts/build-search-index.mjs
import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "out")

if (!existsSync(OUT)) {
  console.log(
    "[search] no static export at apps/web/out — skipping Pagefind index " +
      "(build with GITHUB_PAGES=true to generate it)"
  )
  process.exit(0)
}

// Import lazily so non-export builds never load the indexer.
const pagefind = await import("pagefind")

const { index, errors } = await pagefind.createIndex()
if (errors?.length) {
  console.error("[search] Pagefind init errors:", errors)
  process.exit(1)
}

const { errors: addErrors, page_count } = await index.addDirectory({
  path: OUT,
})
if (addErrors?.length) {
  console.error("[search] Pagefind index errors:", addErrors)
  process.exit(1)
}

await index.writeFiles({ outputPath: join(OUT, "pagefind") })
await pagefind.close()

console.log(
  `[search] Pagefind index built → apps/web/out/pagefind (${page_count} pages)`
)
