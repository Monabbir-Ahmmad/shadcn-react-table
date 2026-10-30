import type { Metadata } from "next"

import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/home/hero/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { LiveTableSection } from "@/components/home/live/live-table-section"
import { StyleDeck } from "@/components/home/deck/style-deck"
import { Compared } from "@/components/home/proof/compared"
import { ExamplesIndex } from "@/components/home/proof/examples-index"
import { ForAgents } from "@/components/home/proof/for-agents"
import { InstallSection } from "@/components/home/install-section"
import { SiteFooter } from "@/components/home/site-footer"

export const metadata: Metadata = {
  title: "Shadcn React Table — a data table with Material React Table parity",
  description:
    "A shadcn/ui data table with Material React Table (MRT V3) parity, built on TanStack Table v9 and installed as source you own via the shadcn registry.",
}

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px)] [background-size:calc(100%/6)_100%] [background-position:center] md:[background-size:calc(100%/12)_100%] dark:[background-image:linear-gradient(to_right,color-mix(in_oklch,var(--border),transparent_40%)_1px,transparent_1px)]">
        <HeroSection />
        <FeaturesSection />
        <LiveTableSection />
        <StyleDeck />
        <Compared />
        <ExamplesIndex />
        <ForAgents />
        <InstallSection />
      </main>
      <SiteFooter />
    </div>
  )
}
