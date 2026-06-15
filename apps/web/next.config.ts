import createMDX from "@next/mdx"
import type { NextConfig } from "next"

// Static export for GitHub Pages is opt-in via GITHUB_PAGES=true (set by the
// deploy workflow), so local `next dev` / `next build` stay unaffected and serve
// from the root. The project page lives under /tablecn, so base/asset paths are
// prefixed in that mode only.
const isPages = process.env.GITHUB_PAGES === "true"
const basePath = isPages ? "/tablecn" : undefined

const nextConfig: NextConfig = {
  transpilePackages: ["@monabbir/tablecn"],
  // Let `page.mdx` files act as routes alongside ts/tsx.
  pageExtensions: ["ts", "tsx", "mdx"],
  // Exposed to the client so the docs search can load the Pagefind runtime from
  // the correct (base-path-prefixed) static URL.
  env: { NEXT_PUBLIC_BASE_PATH: basePath ?? "" },
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

const withMDX = createMDX({ options: { remarkPlugins: ["remark-gfm"] } })

export default withMDX(nextConfig)
