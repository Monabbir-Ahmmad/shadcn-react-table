import Link from "next/link"

const STACK = [
  "TanStack Table v9",
  "shadcn/ui",
  "React 19",
  "Tailwind CSS v4",
  "Radix UI & Base UI",
]

/** A slim strip naming what the table is built on, plus the MRT parity line. */
export function BuiltOn() {
  return (
    <section aria-label="Built on" className="-mt-px border-t">
      <div className="mx-auto grid max-w-6xl items-baseline gap-x-8 gap-y-3 px-4 py-8 sm:grid-cols-[auto_minmax(0,1fr)] sm:px-6 lg:px-8">
        <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
          Built on
        </p>
        <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-2 font-heading text-base font-semibold tracking-tight">
          {STACK.map((name) => (
            <li key={name} className="whitespace-nowrap">
              {name}
            </li>
          ))}
        </ul>
        <p className="text-sm text-pretty text-muted-foreground sm:col-start-2">
          Feature parity with Material React Table —{" "}
          <Link
            href="/docs/guides/migrating-from-mrt"
            className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            see the migration guide
          </Link>
        </p>
      </div>
    </section>
  )
}
