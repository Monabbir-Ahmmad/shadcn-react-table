import { AutoDemo } from "@/components/home/hero/auto-demo"
import { HeroCopy } from "@/components/home/hero/hero-copy"

/**
 * The hero: the pitch on the left, a small table on the right that sorts,
 * filters, selects and edits on its own. Stacks on phones, copy first.
 */
export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="overflow-x-clip border-b">
      <div className="mx-auto grid max-w-6xl items-center gap-x-12 gap-y-14 px-4 py-16 sm:px-6 md:py-24 lg:min-h-[min(calc(100svh-var(--site-header-h)),56rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:px-8">
        <HeroCopy />
        <AutoDemo className="w-full max-w-xl lg:justify-self-end" />
      </div>
    </section>
  )
}
