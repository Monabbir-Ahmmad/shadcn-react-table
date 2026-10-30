import { HeroCopy } from "@/components/home/hero/hero-copy"
import { FeatureTour } from "@/components/home/hero/feature-tour"

/**
 * The hero: the pitch, then the real table playing its features one by one.
 */
export function HeroSection() {
  return (
    <section
      data-hero=""
      aria-labelledby="hero-title"
      className="overflow-x-clip border-b"
    >
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-16 sm:px-6 md:pt-24 md:pb-24 lg:px-8">
        <HeroCopy />
        <div className="isolate mt-12 md:mt-16">
          <FeatureTour />
        </div>
      </div>
    </section>
  )
}
