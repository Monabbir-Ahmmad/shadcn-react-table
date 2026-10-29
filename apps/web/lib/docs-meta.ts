import { DOCS_SUMMARIES } from "./docs-summaries.generated"
import { docsNav, normalizeDocsPath, type DocsNavGroup } from "./docs-nav"

/** A page's one-line summary (its first sentence), or "" when unknown. */
export function summaryFor(href: string): string {
  return DOCS_SUMMARIES[normalizeDocsPath(href)] ?? ""
}

/** The nav group a page belongs to. */
export function groupFor(href: string): DocsNavGroup | undefined {
  const path = normalizeDocsPath(href)
  return docsNav.find((g) => g.items.some((i) => i.href === path))
}
