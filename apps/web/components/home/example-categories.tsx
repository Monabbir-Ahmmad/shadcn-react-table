"use client"

import Link from "next/link"

import { EXAMPLES } from "@/components/examples/registry"
import { exampleCategories } from "@/lib/example-categories"

import { Reveal } from "./reveal"

/** Example counts per category, linking to the guides. */
export function ExampleCategories() {
  const categories = exampleCategories(EXAMPLES)
  return (
    <Reveal className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="text-center font-heading text-3xl font-semibold tracking-tight">
        {EXAMPLES.length} examples to start from
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
        Every guide embeds live examples with their source — copy one, or ask
        your agent to.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.category}
            href="/docs/guides"
            className="group flex flex-col gap-3 rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <div className="flex items-baseline justify-between">
              <span className="font-medium">{c.category}</span>
              <span className="font-mono text-xs text-primary">{c.count}</span>
            </div>
            <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
              {c.titles.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </Reveal>
  )
}
