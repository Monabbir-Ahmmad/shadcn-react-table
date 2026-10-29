import { describe, expect, it } from "vitest"

import { docsFlatNav, docsNav } from "./docs-nav"
import {
  breadcrumbFor,
  groupFor,
  pageLinks,
  pageMarkdownUrl,
  summaryFor,
} from "./docs-meta"

describe("docs nav metadata", () => {
  it("gives every group an icon", () => {
    for (const group of docsNav) expect(group.icon).toBeTypeOf("function")
  })

  it("has a summary for every page", () => {
    for (const item of docsFlatNav) {
      expect(summaryFor(item.href), item.href).not.toBe("")
    }
  })

  it("finds a page's group", () => {
    expect(groupFor("/docs/guides/sorting")?.title).toBe(
      "Sorting, grouping & expanding"
    )
    expect(groupFor("/docs/guides/sorting/")?.title).toBe(
      "Sorting, grouping & expanding"
    )
    expect(groupFor("/nowhere")).toBeUndefined()
  })

  it("marks the 1.0 pages as new", () => {
    const badged = docsFlatNav
      .filter((i) => i.badge === "New")
      .map((i) => i.href)
    expect(badged).toContain("/docs/guides/slot-props")
    expect(badged).toContain("/docs/ai")
  })
})

describe("page links", () => {
  it("builds the Markdown URL with the base path", () => {
    expect(
      pageMarkdownUrl("/docs/guides/sorting/", "/shadcn-react-table")
    ).toBe("/shadcn-react-table/docs/guides/sorting.md")
    expect(pageMarkdownUrl("/docs")).toBe("/docs.md")
  })

  it("builds absolute links for the page actions", () => {
    const links = pageLinks("/docs/guides/sorting/")
    expect(links.markdown).toBe(
      "https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/sorting.md"
    )
    expect(links.github).toBe(
      "https://github.com/Monabbir-Ahmmad/shadcn-react-table/blob/main/apps/web/app/docs/guides/sorting/page.mdx"
    )
    expect(links.chatgpt).toContain(encodeURIComponent(links.markdown))
    expect(links.claude).toContain(encodeURIComponent(links.markdown))
  })

  it("builds a breadcrumb from the nav group", () => {
    expect(breadcrumbFor("/docs/guides/sorting")).toEqual([
      { title: "Docs", href: "/docs" },
      { title: "Sorting, grouping & expanding" },
      { title: "Sorting" },
    ])
    expect(breadcrumbFor("/docs")).toEqual([{ title: "Docs" }])
  })
})
