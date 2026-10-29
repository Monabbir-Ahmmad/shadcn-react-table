import Link from "next/link"
import { RiArrowRightLine } from "@remixicon/react"

import { Button } from "@workspace/ui/components/button"

import { ProofLine } from "@/components/home/anatomy/proof-line"
import { CopyInstall } from "@/components/home/copy-install"
import { SectionLabel } from "@/components/home/section-label"
import type { AnatomyLayer } from "@/lib/anatomy-content"

/*
 * The anatomy's text pieces, shared by the pinned stage (client) and the
 * static fallback (server). Presentational only: no hooks.
 */

/** The hero copy: headline, pitch, install and the proof line. */
export function AnatomyHeroCopy({
  headingId = "hero-title",
  className,
}: {
  headingId?: string
  className?: string
}) {
  return (
    <div className={className}>
      <h1
        id={headingId}
        className="font-heading text-4xl leading-[1.04] font-semibold tracking-tight text-balance md:text-[2rem] lg:text-5xl xl:text-[3.5rem]"
      >
        Every data-table feature, in your shadcn style
      </h1>
      <p className="mt-5 max-w-md text-base text-pretty text-muted-foreground lg:text-lg">
        Sorting, filtering, editing, grouping and virtualization, installed as
        source you own. One hook in, one component out.
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Button asChild size="lg">
          <Link href="/docs/installation">
            Get started
            <RiArrowRightLine data-icon="inline-end" />
          </Link>
        </Button>
        <CopyInstall />
      </div>
      <p className="mt-7 font-mono text-xs text-muted-foreground">
        <ProofLine />
      </p>
    </div>
  )
}

/** One part's feature list: label, title, slot and a ruled list of features
 *  with their options and a guide link. */
export function AnatomyPart({
  layer,
  index,
  className,
}: {
  layer: AnatomyLayer
  index: number
  className?: string
}) {
  return (
    <div className={className}>
      <SectionLabel index={String(index + 1).padStart(2, "0")}>
        Table anatomy
      </SectionLabel>
      <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight lg:text-4xl">
        {layer.title}
      </h2>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        {layer.slot}
      </p>
      <ul className="mt-6 border-b">
        {layer.features.map((feature) => (
          <li
            key={feature.name}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-t py-3"
          >
            <span className="text-sm font-medium">{feature.name}</span>
            <Link
              href={feature.href}
              className="row-span-2 font-mono text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Guide →
            </Link>
            <span className="font-mono text-[11px] break-words text-muted-foreground">
              {feature.options.join(" · ")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const OUTRO_CODE = [
  "const table = useDataTable({ data, columns })",
  "return <DataTable table={table} />",
]

/** The closing note once the stack lies flat: the parts are one component. */
export function AnatomyOutro() {
  return (
    <div>
      <SectionLabel index="06">Assembled</SectionLabel>
      <p className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
        Five parts, one hook in, one component out.
      </p>
      <pre className="mt-6 overflow-x-auto border-y py-4 font-mono text-xs leading-relaxed text-muted-foreground">
        <code>
          {OUTRO_CODE.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
