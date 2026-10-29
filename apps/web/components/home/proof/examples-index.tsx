import Link from "next/link"

import { ProofSection } from "@/components/home/proof/proof-section"
import { EXAMPLE_META } from "@/lib/example-meta.generated"

type Group = { category: string; count: number; titles: string[] }

/** Examples by category, in the order they first appear. */
function groupByCategory() {
  const groups = new Map<string, Group>()
  for (const { category, title } of EXAMPLE_META) {
    let group = groups.get(category)
    if (!group) {
      group = { category, count: 0, titles: [] }
      groups.set(category, group)
    }
    group.count++
    if (group.titles.length < 3) group.titles.push(title)
  }
  return [...groups.values()]
}

const GROUPS = groupByCategory()

/** Every example category, its count and a few titles, linking to the guides. */
export function ExamplesIndex() {
  return (
    <ProofSection
      id="examples"
      index="08"
      label="Examples"
      title={`${EXAMPLE_META.length} examples to copy.`}
      lead="Every guide runs its examples live next to their source. Copy one, or point your agent at it."
    >
      <div className="columns-2 gap-10 md:columns-3">
        {GROUPS.map((group) => (
          <div
            key={group.category}
            className="mb-8 break-inside-avoid border-t pt-3"
          >
            <h3 className="flex items-baseline justify-between gap-3 font-mono text-xs tracking-wide uppercase">
              {group.category}
              <span className="text-muted-foreground">{group.count}</span>
            </h3>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {group.titles.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Link
        href="/docs/guides"
        className="inline-block font-mono text-xs underline-offset-4 transition-colors hover:text-primary hover:underline"
      >
        Browse all guides →
      </Link>
    </ProofSection>
  )
}
