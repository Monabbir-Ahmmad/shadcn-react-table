import { cn } from "@workspace/ui/lib/utils"

import { ProofSection } from "@/components/home/proof/proof-section"
import { COMPARISON, type Mark } from "@/lib/comparison"

const GLYPH: Record<Mark, { glyph: string; label: string; className: string }> =
  {
    yes: { glyph: "●", label: "Yes", className: "text-primary" },
    partial: { glyph: "◐", label: "Partly", className: "text-foreground" },
    no: { glyph: "—", label: "No", className: "text-muted-foreground" },
  }

const LEGEND: { mark: Mark; text: string }[] = [
  { mark: "yes", text: "Built in" },
  { mark: "partial", text: "Site-wide, not in the guide" },
  { mark: "no", text: "Not covered" },
]

const COLUMNS = [
  { key: "us", label: "This table", short: "This" },
  { key: "mrt", label: "Material React Table", short: "MRT" },
  { key: "shadcn", label: "shadcn guide", short: "shadcn" },
] as const

function MarkCell({ mark, ours }: { mark: Mark; ours?: boolean }) {
  const { glyph, label, className } = GLYPH[mark]
  return (
    <td className={cn("px-1 py-3 text-center sm:px-2", ours && "bg-primary/5")}>
      <span role="img" aria-label={label} className={className}>
        {glyph}
      </span>
    </td>
  )
}

/** Feature by feature against Material React Table and shadcn's guide. */
export function Compared() {
  return (
    <ProofSection
      id="compared"
      index="07"
      label="Compared"
      title="Material React Table's features, shadcn's way."
      lead="The feature set people reach for Material React Table for, built from your own shadcn/ui components."
    >
      <table className="w-full border-collapse bg-background text-sm">
        <caption className="sr-only">
          Features of this table, Material React Table and shadcn&apos;s
          data-table guide
        </caption>
        <thead>
          <tr className="border-b font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            <th scope="col" className="py-3 pe-4 text-start font-normal">
              Feature
            </th>
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "w-14 px-1 py-3 text-center align-bottom font-normal sm:w-28 sm:px-2",
                  column.key === "us" && "bg-primary/5 text-foreground"
                )}
              >
                <span aria-hidden className="sm:hidden">
                  {column.short}
                </span>
                <span className="max-sm:sr-only">{column.label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON.map((row) => (
            <tr key={row.feature} className="border-b">
              <th
                scope="row"
                className="py-3 pe-4 text-start font-normal text-pretty"
              >
                {row.feature}
              </th>
              <MarkCell mark={row.us} ours />
              <MarkCell mark={row.mrt} />
              <MarkCell mark={row.shadcn} />
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-muted-foreground">
        {LEGEND.map(({ mark, text }) => (
          <li key={mark} className="flex items-baseline gap-2">
            <span aria-hidden className={GLYPH[mark].className}>
              {GLYPH[mark].glyph}
            </span>
            {text}
          </li>
        ))}
        <li>Checked against each project&apos;s docs, Oct 2026</li>
      </ul>
    </ProofSection>
  )
}
