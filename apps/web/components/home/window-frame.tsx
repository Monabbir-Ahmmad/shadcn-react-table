import { cn } from "@workspace/ui/lib/utils"

/** An "app window" around the live demo, with a glow in the accent color. */
export function WindowFrame({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-10 -top-10 -bottom-6 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_top,var(--primary),transparent_70%)] opacity-25 blur-2xl"
      />
      <div className="overflow-hidden rounded-xl border bg-card shadow-xl shadow-primary/10">
        <div className="flex items-center gap-1.5 border-b bg-muted/50 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
          <span className="ms-3 font-mono text-[11px] text-muted-foreground">
            components/ui/data-table
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
