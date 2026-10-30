import Link from "next/link"
import { RiArrowRightLine } from "@remixicon/react"

import { Button } from "@workspace/ui/components/button"

import { ProofLine } from "@/components/home/hero/proof-line"
import { CopyInstall } from "@/components/home/copy-install"

/** The hero copy: headline, pitch, install and the proof line. */
export function HeroCopy() {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground">
        v1.0 · TanStack Table v9
      </p>
      <h1
        id="hero-title"
        className="mt-6 max-w-3xl font-heading text-4xl leading-[1.04] font-semibold tracking-tight text-balance sm:text-5xl xl:text-6xl"
      >
        Every data-table feature, in your shadcn style.
      </h1>
      <p className="mt-5 max-w-xl text-base text-pretty text-muted-foreground lg:text-lg">
        Sorting, filtering, editing, grouping and virtualization, installed as
        source you own. One hook in, one component out.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/docs/installation">
            Get started
            <RiArrowRightLine data-icon="inline-end" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/docs/guides">Browse guides</Link>
        </Button>
        <CopyInstall />
      </div>
      <p className="mt-6 font-mono text-xs text-muted-foreground">
        <ProofLine />
      </p>
    </div>
  )
}
