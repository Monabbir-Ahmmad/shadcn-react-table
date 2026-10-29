// Builds the machine-readable docs from the MDX pages: `llms.txt` (an index
// following llmstxt.org), `llms-full.txt` (every page in one file), and a
// Markdown copy of each page next to its URL (`/docs/guides/sorting.md`).
// MDX components become plain Markdown: <Example> turns into the example's
// source, <ApiTable> into a table from the generated API reference,
// <Callout> into a quote, <Steps> into a numbered list, <PmTabs> into a
// command block and <Cards> into a link list. Run from anywhere:
//   node apps/web/scripts/build-llms.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"
import prettier from "prettier"
import {
  cardsToMarkdown,
  pmTabsToMarkdown,
  stepsToMarkdown,
} from "./llms-transforms.mjs"

const WEB = join(dirname(fileURLToPath(import.meta.url)), "..")
const PUBLIC = join(WEB, "public")
const SITE = "https://monabbir-ahmmad.github.io/shadcn-react-table"

/** Evaluates the `export const NAME = …` objects of a generated module. */
function loadGenerated(file) {
  const source = readFileSync(join(WEB, file), "utf8")
  const out = {}
  for (const match of source.matchAll(
    /export const (\w+)(?::[^=]+)? = ([\s\S]*?)\n(?=export |$)/g
  )) {
    out[match[1]] = new Function(`return (${match[2]})`)()
  }
  return out
}

const api = loadGenerated("lib/api-reference.generated.ts")
const { EXAMPLE_SOURCE } = loadGenerated("lib/example-source.generated.ts")

/** The sidebar's groups and pages, in order. */
function readNav() {
  const source = readFileSync(join(WEB, "lib/docs-nav.ts"), "utf8")
  const groups = []
  for (const block of source.split(/\n {2}\{\n {4}title: /).slice(1)) {
    const title = /^"([^"]+)"/.exec(block)[1]
    const items = [
      ...block.matchAll(/title:\s*"([^"]+)",\s*href:\s*"([^"]+)"/g),
    ].map((m) => ({ title: m[1], href: m[2] }))
    groups.push({ title, items })
  }
  return groups
}

const cell = (text) =>
  String(text ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ")

function apiTable(attrs) {
  const of = /of="(\w+)"/.exec(attrs)?.[1]
  const label = /propLabel="([^"]+)"/.exec(attrs)?.[1] ?? "Name"
  const only = /only=\{\[([^\]]*)\]\}/
    .exec(attrs)?.[1]
    .match(/"([^"]+)"/g)
    ?.map((s) => s.slice(1, -1))
  let rows = api[of] ?? []
  if (only) {
    rows = only.map((name) => rows.find((r) => r.name === name)).filter(Boolean)
  }
  if (rows.length === 0) return ""
  const lines = [
    `| ${label} | Type | Default | Description |`,
    "| --- | --- | --- | --- |",
    ...rows.map(
      (r) =>
        `| \`${cell(r.name)}\` | ${r.type ? `\`${cell(r.type)}\`` : ""} | ${
          r.default ? `\`${cell(r.default)}\`` : ""
        } | ${cell(r.description)} |`
    ),
  ]
  return lines.join("\n")
}

/** MDX → Markdown, leaving fenced code alone. */
function toMarkdown(mdx, summaryFor) {
  // Steps run on the whole page first: their bodies hold code fences.
  const parts = stepsToMarkdown(
    mdx.replace(/^export const metadata[^\n]*\n+/, "")
  ).split(/(```[\s\S]*?```)/)
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part
      // Card links are site-relative in MDX; make them absolute.
      return cardsToMarkdown(pmTabsToMarkdown(part), summaryFor, SITE)
        .replace(/<Example slug="([^"]+)"\s*\/>/g, (_, slug) =>
          EXAMPLE_SOURCE[slug]
            ? `Example (\`${slug}\`):\n\n\`\`\`tsx\n${EXAMPLE_SOURCE[slug]}\n\`\`\``
            : ""
        )
        .replace(/<ApiTable([\s\S]*?)\/>/g, (_, attrs) => apiTable(attrs))
        .replace(
          /<Callout[^>]*?title="([^"]*)"[^>]*>\s*([\s\S]*?)\s*<\/Callout>/g,
          (_, title, body) =>
            `> **${title}:** ${body.trim().split("\n").join("\n> ")}`
        )
        .replace(
          /<Callout[^>]*>\s*([\s\S]*?)\s*<\/Callout>/g,
          (_, body) => `> ${body.trim().split("\n").join("\n> ")}`
        )
    })
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/** The page's first paragraph, as one line, for the index. */
function summary(markdown) {
  const paragraph = markdown
    .split(/\n\n/)
    .find((p) => p && !/^(#|>|```|\||-|\d+\.|Example)/.test(p.trim()))
  if (!paragraph) return ""
  const line = paragraph.replace(/\s+/g, " ").trim()
  const sentence = /^.*?[.!?](\s|$)/.exec(line)?.[0].trim() ?? line
  return sentence
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
}

const groups = readNav()
const pages = []
for (const group of groups) {
  for (const item of group.items) {
    const mdx = readFileSync(join(WEB, "app", item.href, "page.mdx"), "utf8")
    pages.push({ ...item, group: group.title, mdx, mdPath: `${item.href}.md` })
  }
}

// One-line summaries per page (the first sentence), for the docs cards,
// breadcrumbs and prev/next links. Computed from a first render (cards
// without summaries), then used to render the cards with summaries.
const summaries = Object.fromEntries(
  pages.map((p) => [p.href, summary(toMarkdown(p.mdx))])
)
for (const page of pages) {
  page.markdown = toMarkdown(page.mdx, (href) => summaries[href] ?? "")
  mkdirSync(dirname(join(PUBLIC, page.mdPath)), { recursive: true })
  writeFileSync(
    join(PUBLIC, page.mdPath),
    `${page.markdown}
`
  )
}
const summariesFile = join(WEB, "lib/docs-summaries.generated.ts")
const summariesSource =
  "// AUTO-GENERATED by apps/web/scripts/build-llms.mjs — do not edit by hand.\n" +
  "// Regenerate with `pnpm --filter shadcn-react-table-web llms:build`.\n\n" +
  `export const DOCS_SUMMARIES: Record<string, string> = ${JSON.stringify(summaries, null, 2)}\n`
writeFileSync(
  summariesFile,
  await prettier.format(summariesSource, {
    ...(await prettier.resolveConfig(summariesFile)),
    filepath: summariesFile,
  })
)

const intro = `# shadcn-react-table

> A shadcn/ui data table with Material React Table parity — sorting, filtering, grouping, editing, virtualization, pinning, keyboard navigation and more — built on TanStack Table v9. It is a shadcn registry block: the source is copied into your project and uses your own shadcn components and theme.

Install into a project set up with shadcn/ui and Tailwind CSS v4:

\`\`\`bash
npx shadcn@latest add ${SITE}/r/data-table.json
\`\`\`

Then \`import { DataTable, useDataTable } from "@/components/ui/data-table"\`: build the table with \`const table = useDataTable({ data, columns, getRowId })\` and render \`<DataTable table={table} />\`.`

// The guides index (`app/docs/guides/page.tsx`) is a React page, not MDX, so
// its Markdown copy is built from the nav: every group that has guide pages,
// with the same card links and summaries as the page.
const guidesIndex = [
  "# Guides",
  "One page per feature, each with live examples you can copy.",
  ...groups
    .map((group) => ({
      title: group.title,
      items: group.items.filter((i) => i.href.startsWith("/docs/guides/")),
    }))
    .filter((group) => group.items.length > 0)
    .map((group) =>
      [
        `## ${group.title}`,
        "",
        ...group.items.map((item) => {
          const text = summaries[item.href]
          return `- [${item.title}](${SITE}${item.href})${text ? `: ${text}` : ""}`
        }),
      ].join("\n")
    ),
].join("\n\n")
writeFileSync(join(PUBLIC, "docs/guides.md"), `${guidesIndex}\n`)

const index = [
  intro,
  [
    "## Docs",
    "",
    `- [Guides](${SITE}/docs/guides.md): every guide, grouped by feature area`,
  ].join("\n"),
  ...groups.map((group) =>
    [
      `## ${group.title}`,
      "",
      ...pages
        .filter((p) => p.group === group.title)
        .map((p) => {
          const text = summary(p.markdown)
          return `- [${p.title}](${SITE}${p.mdPath})${text ? `: ${text}` : ""}`
        }),
    ].join("\n")
  ),
  [
    "## Optional",
    "",
    `- [Full documentation](${SITE}/llms-full.txt): every page above in one file`,
    `- [Agent skill](${SITE}/SKILL.md): how to install and use the table, for coding agents (\`npx skills add Monabbir-Ahmmad/shadcn-react-table\`)`,
    `- [Registry item](${SITE}/r/data-table.json): the files the shadcn CLI installs`,
  ].join("\n"),
].join("\n\n")

// The agent skill: its source is `skills/shadcn-react-table/SKILL.md` at the
// repo root (where `npx skills add` finds it); the site serves a copy at
// `/SKILL.md` and `/skills/shadcn-react-table/SKILL.md`. Every docs page it
// links to must exist.
const SKILL = readFileSync(
  join(WEB, "../../skills/shadcn-react-table/SKILL.md"),
  "utf8"
).replaceAll("\r\n", "\n")
const missing = [
  ...SKILL.matchAll(/\/shadcn-react-table(\/docs\/[\w/-]+\.md)/g),
]
  .map((m) => m[1])
  .filter(
    (path) =>
      path !== "/docs/guides.md" && !pages.some((p) => p.mdPath === path)
  )
if (missing.length > 0) {
  console.error(`SKILL.md links to missing docs pages: ${missing.join(", ")}`)
  process.exit(1)
}
writeFileSync(join(PUBLIC, "SKILL.md"), SKILL)
mkdirSync(join(PUBLIC, "skills/shadcn-react-table"), { recursive: true })
writeFileSync(join(PUBLIC, "skills/shadcn-react-table/SKILL.md"), SKILL)

writeFileSync(join(PUBLIC, "llms.txt"), `${index}\n`)
writeFileSync(
  join(PUBLIC, "llms-full.txt"),
  `${intro}\n\n${pages
    .map((p) => `<!-- ${SITE}${p.href}/ -->\n\n${p.markdown}`)
    .join("\n\n---\n\n")}\n`
)

console.log(
  `llms built → apps/web/public/llms.txt, llms-full.txt + ${pages.length + 1} page .md files`
)
