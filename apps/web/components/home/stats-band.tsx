"use client"

import { EXAMPLES } from "@/components/examples/registry"

import { Reveal } from "./reveal"

const STATS = [
  { value: String(EXAMPLES.length), label: "live examples" },
  { value: "38", label: "languages" },
  { value: "600+", label: "tests, unit and in a real browser" },
  { value: "1 + 1", label: "one hook, one component" },
]

/** Four big numbers. */
export function StatsBand() {
  return (
    <Reveal className="border-b">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-border md:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-1 bg-background px-6 py-10 text-center"
          >
            <dt className="order-2 text-sm text-muted-foreground">{s.label}</dt>
            <dd className="order-1 font-heading text-4xl font-semibold tracking-tight text-primary md:text-5xl">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </Reveal>
  )
}
