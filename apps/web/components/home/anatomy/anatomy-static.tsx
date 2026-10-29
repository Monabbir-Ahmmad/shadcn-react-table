import { AnatomyLayers } from "@/components/home/anatomy/anatomy-layers"
import {
  AnatomyHeroCopy,
  AnatomyPart,
} from "@/components/home/anatomy/anatomy-parts"
import { ANATOMY } from "@/lib/anatomy-content"

/**
 * The hero and table anatomy for phones and reduced motion: the same copy,
 * the separated stack at rest, then every part's features in order.
 */
export function AnatomyStatic() {
  return (
    <section
      aria-labelledby="hero-title-static"
      className="overflow-x-clip border-b md:hidden md:motion-reduce:block"
    >
      <div className="mx-auto max-w-3xl px-4 pt-14 pb-16 sm:px-6">
        <AnatomyHeroCopy headingId="hero-title-static" />
        <AnatomyLayers className="mx-auto mt-16 mb-4 w-[58%] max-w-[560px] -translate-x-[20%] sm:mb-20 sm:w-[72%] sm:-translate-x-[10%]" />
        <div className="mt-14 space-y-14">
          {ANATOMY.map((layer, i) => (
            <AnatomyPart key={layer.id} layer={layer} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
