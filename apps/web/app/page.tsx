import type { Metadata } from "next"

import { SiteHeader } from "@/components/site-header"
import { AnatomyStage } from "@/components/home/anatomy/anatomy-stage"
import { AnatomyStatic } from "@/components/home/anatomy/anatomy-static"
import { LiveTableSection } from "@/components/home/live/live-table-section"
import { FeatureGrid } from "@/components/home/feature-grid"
import { TechStrip } from "@/components/home/tech-strip"
import { StatsBand } from "@/components/home/stats-band"
import { FeaturePlayground } from "@/components/home/feature-playground"
import { ExampleCategories } from "@/components/home/example-categories"
import { ClosingBanner } from "@/components/home/closing-banner"
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
      <main className="flex-1">
        <AnatomyStage />
        <AnatomyStatic />
        <LiveTableSection />
        <TechStrip />
        <StatsBand />
        <FeaturePlayground />
        <FeatureGrid />
        <ExampleCategories />
        <InstallSection />
        <ClosingBanner />
      </main>
      <SiteFooter />
    </div>
  )
}
