import {
  RiAlertLine,
  RiInformationLine,
  RiLightbulbLine,
} from "@remixicon/react"

import { cn } from "@workspace/ui/lib/utils"

type Variant = "note" | "tip" | "warning"

const STYLES: Record<Variant, string> = {
  note: "border-primary/25 bg-primary/5 [--callout:var(--primary)]",
  tip: "border-emerald-500/30 bg-emerald-500/10 [--callout:var(--color-emerald-600)]",
  warning:
    "border-amber-500/30 bg-amber-500/10 [--callout:var(--color-amber-600)]",
}

const ICONS = {
  note: RiInformationLine,
  tip: RiLightbulbLine,
  warning: RiAlertLine,
}
const LABELS: Record<Variant, string> = {
  note: "Note",
  tip: "Tip",
  warning: "Warning",
}

/** A small admonition block for docs (note / tip / warning). */
export function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: Variant
  title?: string
  children: React.ReactNode
}) {
  const Icon = ICONS[variant]
  return (
    <div
      className={cn(
        "my-6 flex gap-3 rounded-lg border px-4 py-3 text-sm",
        STYLES[variant]
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-(--callout)" aria-hidden />
      <div className="min-w-0">
        <p className="mb-1 font-medium">{title ?? LABELS[variant]}</p>
        <div className="text-muted-foreground [&_a]:underline [&_code]:rounded [&_code]:bg-background/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs">
          {children}
        </div>
      </div>
    </div>
  )
}
