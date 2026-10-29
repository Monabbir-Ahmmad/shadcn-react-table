import Link from "next/link"
import { RiArrowRightLine } from "@remixicon/react"

import { Button } from "@workspace/ui/components/button"

import { CopyInstall } from "./copy-install"
import { Reveal } from "./reveal"

/** The last call to action before the footer. */
export function ClosingBanner() {
  return (
    <Reveal className="px-4 py-20">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border bg-card px-6 py-14 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--primary),transparent_60%)] opacity-15"
        />
        <h2 className="relative font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Ship a full data table today
        </h2>
        <p className="relative mx-auto mt-3 max-w-lg text-muted-foreground">
          One command adds the source to your project, in your shadcn style.
        </p>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/docs/installation">
              Install it
              <RiArrowRightLine data-icon="inline-end" />
            </Link>
          </Button>
          <CopyInstall />
        </div>
      </div>
    </Reveal>
  )
}
