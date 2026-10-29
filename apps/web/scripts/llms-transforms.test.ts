import { describe, expect, it } from "vitest"

import {
  cardsToMarkdown,
  pmTabsToMarkdown,
  stepsToMarkdown,
} from "./llms-transforms.mjs"

describe("llms transforms", () => {
  it("turns steps into a numbered list", () => {
    const mdx = `<Steps>\n<Step title="Add it">\n\nRun the command.\n\n</Step>\n<Step title="Use it">\n\nRender it.\n\n</Step>\n</Steps>`
    expect(stepsToMarkdown(mdx)).toBe(
      "1. **Add it**\n\n   Run the command.\n\n2. **Use it**\n\n   Render it."
    )
  })

  it("indents fenced code inside a step", () => {
    const mdx = `<Steps>\n\n<Step title="Add it">\n\nRun:\n\n\`\`\`bash\nnpm i\n\n\`\`\`\n\n</Step>\n\n</Steps>`
    expect(stepsToMarkdown(mdx)).toBe(
      "1. **Add it**\n\n   Run:\n\n   ```bash\n   npm i\n\n   ```"
    )
  })

  it("turns package-manager tabs into a command", () => {
    expect(pmTabsToMarkdown('<PmTabs command="shadcn@latest add x" />')).toBe(
      "```bash\npnpm dlx shadcn@latest add x\n# or: npx shadcn@latest add x · yarn dlx shadcn@latest add x · bunx --bun shadcn@latest add x\n```"
    )
  })

  it("turns cards into a link list", () => {
    const mdx = `<Cards>\n  <Card href="/docs/a" title="A" />\n  <Card href="/docs/b" title="B" />\n</Cards>`
    expect(
      cardsToMarkdown(mdx, (h) => (h === "/docs/a" ? "About A." : ""))
    ).toBe("- [A](/docs/a): About A.\n- [B](/docs/b)")
  })

  it("prefixes card links with a base url and tolerates multi-line cards", () => {
    const mdx = `<Cards>\n  <Card\n    href="/docs/a"\n    title="Sticky header & footer (x)"\n  />\n</Cards>`
    expect(cardsToMarkdown(mdx, () => "", "https://x.dev")).toBe(
      "- [Sticky header & footer (x)](https://x.dev/docs/a)"
    )
  })
})
