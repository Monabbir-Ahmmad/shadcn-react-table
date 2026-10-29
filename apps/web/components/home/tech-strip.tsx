const TECH = [
  "TanStack Table v9",
  "shadcn/ui",
  "Radix UI & Base UI",
  "Tailwind CSS v4",
  "dnd-kit",
]

/** What the table is built on, in one quiet line. */
export function TechStrip() {
  return (
    <div className="border-b bg-muted/30">
      <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-5 text-xs font-medium text-muted-foreground">
        <li className="text-foreground">Built on</li>
        {TECH.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  )
}
