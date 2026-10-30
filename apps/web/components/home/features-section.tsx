import Link from "next/link"

import { SectionLabel } from "@/components/home/section-label"
import { FEATURES, type FeaturePart } from "@/lib/features-content"

/**
 * The table's five parts side by side, each with its slotProps key and its
 * features: the options that turn them on and a link to the guide.
 */
export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="-mt-px scroll-mt-14 border-t"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid gap-x-12 gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
          <div>
            <SectionLabel index="01">Features</SectionLabel>
            <h2
              id="features-title"
              className="mt-4 font-heading text-4xl font-semibold tracking-tight text-balance md:text-5xl"
            >
              Five parts, one component.
            </h2>
          </div>
          <p className="text-base text-pretty text-muted-foreground lg:pb-1.5">
            Each part of the table turns on with a few options and takes its own
            styles through a slotProps key.
          </p>
        </div>
        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 md:mt-12 lg:grid-cols-5">
          {FEATURES.map((part) => (
            <FeatureColumn key={part.id} part={part} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureColumn({ part }: { part: FeaturePart }) {
  return (
    <div className="min-w-0 border-t border-foreground/70 pt-4">
      <h3 className="font-heading text-xl font-semibold tracking-tight">
        {part.title}
      </h3>
      <p className="mt-1 font-mono text-[11px] break-words text-muted-foreground">
        {part.slot}
      </p>
      <ul className="mt-5">
        {part.features.map((feature) => (
          <li key={feature.name} className="border-t py-3">
            <p className="text-sm font-medium text-pretty">{feature.name}</p>
            <ul className="mt-1 font-mono text-[11px] leading-relaxed break-words text-muted-foreground">
              {feature.options.map((option) => (
                <li key={option}>{option}</li>
              ))}
            </ul>
            <Link
              href={feature.href}
              aria-label={`Guide: ${feature.name}`}
              className="mt-1.5 inline-block font-mono text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Guide →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
