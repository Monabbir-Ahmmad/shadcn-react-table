import { DOCS_SUMMARIES } from "./docs-summaries.generated"
import {
  docsFlatNav,
  docsNav,
  normalizeDocsPath,
  type DocsNavGroup,
} from "./docs-nav"
import { GITHUB_URL, SITE_URL } from "./site"

/** A page's one-line summary (its first sentence), or "" when unknown. */
export function summaryFor(href: string): string {
  return DOCS_SUMMARIES[normalizeDocsPath(href)] ?? ""
}

/** The nav group a page belongs to. */
export function groupFor(href: string): DocsNavGroup | undefined {
  const path = normalizeDocsPath(href)
  return docsNav.find((g) => g.items.some((i) => i.href === path))
}

/** The Markdown copy of a docs page (built by `scripts/build-llms.mjs`). */
export function pageMarkdownUrl(pathname: string, basePath = ""): string {
  return `${basePath}${normalizeDocsPath(pathname)}.md`
}

/**
 * Docs pages whose source is not `app/(site)<path>/page.mdx` (React index pages),
 * as their path in the repo.
 */
const PAGE_SOURCE: Record<string, string> = {
  "/docs/guides": "apps/web/app/(site)/docs/guides/page.tsx",
}

/** Index pages outside the sidebar nav, by path, for the breadcrumb. */
const INDEX_TITLES: Record<string, string> = {
  "/docs/guides": "Guides",
}

/** Absolute links for a page's actions. */
export function pageLinks(pathname: string) {
  const path = normalizeDocsPath(pathname)
  const markdown = `${SITE_URL}${path}.md`
  const prompt = encodeURIComponent(
    `Read ${markdown} and help me use it in my project.`
  )
  const source = PAGE_SOURCE[path] ?? `apps/web/app/(site)${path}/page.mdx`
  return {
    markdown,
    github: `${GITHUB_URL}/blob/main/${source}`,
    chatgpt: `https://chatgpt.com/?hints=search&q=${prompt}`,
    claude: `https://claude.ai/new?q=${prompt}`,
  }
}

/** Docs › group › page. */
export function breadcrumbFor(
  pathname: string
): { title: string; href?: string }[] {
  const path = normalizeDocsPath(pathname)
  if (path === "/docs") return [{ title: "Docs" }]
  const index = INDEX_TITLES[path]
  if (index) return [{ title: "Docs", href: "/docs" }, { title: index }]
  const item = docsFlatNav.find((i) => i.href === path)
  const group = groupFor(path)
  return [
    { title: "Docs", href: "/docs" },
    ...(group ? [{ title: group.title }] : []),
    ...(item ? [{ title: item.title }] : []),
  ]
}
