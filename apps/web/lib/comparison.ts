export type Mark = "yes" | "no" | "partial"

/**
 * This table vs Material React Table vs shadcn's data-table guide, checked
 * against each project's docs on 2026-10-30.
 */
export const COMPARISON: {
  feature: string
  us: Mark
  mrt: Mark
  shadcn: Mark
}[] = [
  {
    feature: "Sorting, filtering, pagination",
    us: "yes",
    mrt: "yes",
    shadcn: "yes",
  },
  {
    feature: "Filter modes and variants (range, date, select…)",
    us: "yes",
    mrt: "yes",
    shadcn: "no",
  },
  { feature: "Grouping and aggregation", us: "yes", mrt: "yes", shadcn: "no" },
  {
    feature: "Inline editing (cell, row, table, modal)",
    us: "yes",
    mrt: "yes",
    shadcn: "no",
  },
  {
    feature: "Column and row pinning, ordering, resizing",
    us: "yes",
    mrt: "yes",
    shadcn: "no",
  },
  {
    feature: "Row and column virtualization",
    us: "yes",
    mrt: "yes",
    shadcn: "no",
  },
  { feature: "Drag rows between tables", us: "yes", mrt: "yes", shadcn: "no" },
  // MRT "no" = absent from its docs and guides (checked 2026-10-30).
  {
    feature: "Advanced AND/OR filter builder",
    us: "yes",
    mrt: "no",
    shadcn: "no",
  },
  {
    feature: "Uses your shadcn/ui components and style",
    us: "yes",
    mrt: "no",
    shadcn: "yes",
  },
  {
    feature: "Source copied into your project",
    us: "yes",
    mrt: "no",
    shadcn: "yes",
  },
  { feature: "Keyboard grid navigation", us: "yes", mrt: "yes", shadcn: "no" },
  { feature: "38 built-in languages", us: "yes", mrt: "yes", shadcn: "no" },
  {
    feature: "Agent skill and llms.txt",
    us: "yes",
    mrt: "no",
    shadcn: "partial",
  },
]
