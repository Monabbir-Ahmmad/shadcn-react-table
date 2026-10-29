/** A numbered section label: "01 — Toolbar". */
export function SectionLabel({
  index,
  children,
}: {
  index: string
  children: React.ReactNode
}) {
  return (
    <p className="flex items-center gap-3 font-mono text-xs tracking-wide text-muted-foreground uppercase">
      <span className="text-primary">{index}</span>
      <span aria-hidden className="h-px w-8 bg-border" />
      {children}
    </p>
  )
}
