import * as React from "react"

import { SectionLabel } from "@/components/home/section-label"

/**
 * A command or URL that wraps only at spaces and after slashes, never at the
 * hyphens inside a name.
 */
export function Wrappable({ text }: { text: string }) {
  return text.split(/(\s+)/).map((word, i) =>
    /^\s*$/.test(word) ? (
      word
    ) : (
      <React.Fragment key={i}>
        {/* "https://", "github.io/", "SKILL.md": each piece keeps its slashes. */}
        {word.match(/[^/]*\/+|[^/]+$/g)?.map((piece, j) => (
          <React.Fragment key={j}>
            {j > 0 && <wbr />}
            <span className="whitespace-nowrap">{piece}</span>
          </React.Fragment>
        ))}
      </React.Fragment>
    )
  )
}

/**
 * The layout every short home section shares: label, heading and one line on
 * the left (4 of 12 columns), the content on the right (8 of 12). It stacks
 * below the lg breakpoint.
 */
export function ProofSection({
  id,
  index,
  label,
  title,
  lead,
  children,
}: {
  id: string
  index: string
  label: string
  title: React.ReactNode
  lead: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="-mt-px scroll-mt-14 border-t"
    >
      <div className="mx-auto grid max-w-6xl gap-x-12 gap-y-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:px-8">
        <div>
          <SectionLabel index={index}>{label}</SectionLabel>
          <h2
            id={`${id}-title`}
            className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance lg:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-4 max-w-md text-base text-pretty text-muted-foreground">
            {lead}
          </p>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}
