import type { Metadata } from "next"

import { Card, Cards } from "@/components/docs/cards"
import { docsNav } from "@/lib/docs-nav"

export const metadata: Metadata = { title: "Guides" }

/** Every guide, grouped like the sidebar. */
export default function GuidesIndex() {
  const groups = docsNav.filter((g) =>
    g.items.some((i) => i.href.startsWith("/docs/guides/"))
  )
  return (
    <>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
        Guides
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        One page per feature, each with live examples you can copy.
      </p>
      {groups.map((group) => (
        <section key={group.title} className="mt-10">
          <h2
            id={group.title.toLowerCase().replace(/\W+/g, "-")}
            className="flex items-center gap-2 text-xl font-semibold"
          >
            <group.icon className="size-5 text-primary" aria-hidden />
            {group.title}
          </h2>
          <Cards>
            {group.items
              .filter((i) => i.href.startsWith("/docs/guides/"))
              .map((item) => (
                <Card key={item.href} href={item.href} title={item.title} />
              ))}
          </Cards>
        </section>
      ))}
    </>
  )
}
