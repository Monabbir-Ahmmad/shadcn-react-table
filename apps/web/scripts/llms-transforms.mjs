// MDX → Markdown for the docs components that don't exist in plain Markdown.
// Used by build-llms.mjs: stepsToMarkdown on the whole page (step bodies hold
// code fences), the other two on the text outside code fences.

const indent = (text) =>
  text
    .trim()
    .split("\n")
    .map((line) => (line ? `   ${line}` : ""))
    .join("\n")

/** <Steps><Step title="T">body</Step></Steps> → a numbered list. */
export function stepsToMarkdown(mdx) {
  return mdx.replace(/<Steps>\s*([\s\S]*?)\s*<\/Steps>/g, (_, inner) => {
    const steps = [
      ...inner.matchAll(/<Step title="([^"]*)">\s*([\s\S]*?)\s*<\/Step>/g),
    ]
    return steps
      .map(([, title, body], i) =>
        body.trim()
          ? `${i + 1}. **${title}**\n\n${indent(body)}`
          : `${i + 1}. **${title}**`
      )
      .join("\n\n")
  })
}

const RUNNERS = ["npx", "yarn dlx", "bunx --bun"]

/** <PmTabs command="X" /> → one bash block. */
export function pmTabsToMarkdown(mdx) {
  return mdx.replace(/<PmTabs command="([^"]*)"\s*\/>/g, (_, command) =>
    [
      "```bash",
      `pnpm dlx ${command}`,
      `# or: ${RUNNERS.map((r) => `${r} ${command}`).join(" · ")}`,
      "```",
    ].join("\n")
  )
}

/**
 * <Cards><Card href title /></Cards> → a link list. `summaryFor` gets the raw
 * href; `baseUrl` is prefixed to each href (to make site-relative links
 * absolute).
 */
export function cardsToMarkdown(mdx, summaryFor = () => "", baseUrl = "") {
  return mdx.replace(/<Cards>\s*([\s\S]*?)\s*<\/Cards>/g, (_, inner) =>
    [...inner.matchAll(/<Card\b([\s\S]*?)\/>/g)]
      .map(([, attrs]) => {
        const href = /href="([^"]*)"/.exec(attrs)?.[1]
        const title = /title="([^"]*)"/.exec(attrs)?.[1]
        if (href === undefined || title === undefined) return ""
        const text = summaryFor(href)
        return `- [${title.replace(/&quot;/g, '"')}](${baseUrl}${href})${text ? `: ${text}` : ""}`
      })
      .filter(Boolean)
      .join("\n")
  )
}
