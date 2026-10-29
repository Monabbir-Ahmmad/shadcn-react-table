import { readFileSync } from "node:fs"
import { join } from "node:path"
import createMDX from "@next/mdx"
import type { NextConfig } from "next"

// Read, not imported: the config may load as CommonJS or as native ESM
// depending on the Node version. Next runs from apps/web.
const tablePackage = JSON.parse(
  readFileSync(
    join(process.cwd(), "../../packages/shadcn-react-table/package.json"),
    "utf8"
  )
) as { version: string }

// Static export for GitHub Pages is opt-in via GITHUB_PAGES=true (set by the
// deploy workflow), so local `next dev` / `next build` stay unaffected and serve
// from the root. The project page lives under /shadcn-react-table, so base/asset
// paths are prefixed in that mode only.
const isPages = process.env.GITHUB_PAGES === "true"
const basePath = isPages ? "/shadcn-react-table" : undefined

const nextConfig: NextConfig = {
  transpilePackages: ["@monabbir/shadcn-react-table", "@workspace/ui"],
  // Let `page.mdx` files act as routes alongside ts/tsx.
  pageExtensions: ["ts", "tsx", "mdx"],
  // Exposed to the client so the docs search can load the Pagefind runtime from
  // the correct (base-path-prefixed) static URL.
  // The block's version, for the header, without shipping its package.json.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath ?? "",
    NEXT_PUBLIC_TABLE_VERSION: tablePackage.version,
  },
  ...(isPages
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
}

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: ["rehype-slug"],
  },
})

export default withMDX(nextConfig)
