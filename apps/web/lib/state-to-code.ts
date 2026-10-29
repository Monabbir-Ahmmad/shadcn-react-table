export type CodeState = {
  grouping: string[]
  sorting: { id: string; desc: boolean }[]
  columnPinning: { left: string[]; right: string[] }
  columnFilters: { id: string; value: unknown }[]
  columnVisibility: Record<string, boolean>
  density: "compact" | "comfortable" | "spacious"
  locale: "en" | "ar"
  big: boolean
}

const LOCALE_IMPORT =
  'import { dataTableLocalizationAr } from "@/components/ui/data-table/locales/ar"'

/** An object key, quoted when it is not a plain identifier. */
const printKey = (key: string) =>
  /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)

/** A value as source code ({ a: 1 }, ["x"], "s"). */
function print(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value)
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? "new Date(NaN)"
      : `new Date(${JSON.stringify(value.toISOString())})`
  }
  if (Array.isArray(value)) return `[${value.map(print).join(", ")}]`
  if (value && typeof value === "object") {
    const entries = Object.entries(value)
    return entries.length
      ? `{ ${entries.map(([k, v]) => `${printKey(k)}: ${print(v)}`).join(", ")} }`
      : "{}"
  }
  return String(value)
}

/** The useDataTable call that reproduces the live table's current view. */
export function stateToCode(state: CodeState): string {
  const initial: [string, unknown][] = []
  if (state.grouping.length) initial.push(["grouping", state.grouping])
  if (state.sorting.length) initial.push(["sorting", state.sorting])
  if (state.columnPinning.left.length || state.columnPinning.right.length)
    initial.push(["columnPinning", state.columnPinning])
  if (state.columnFilters.length)
    initial.push(["columnFilters", state.columnFilters])
  const hidden = Object.fromEntries(
    Object.entries(state.columnVisibility).filter(([, v]) => v === false)
  )
  if (Object.keys(hidden).length) initial.push(["columnVisibility", hidden])
  if (state.density !== "comfortable") initial.push(["density", state.density])

  const lines = [
    "const table = useDataTable({",
    "  data,",
    "  columns,",
    "  getRowId: (row) => row.id,",
    "  enableRowSelection: true,",
    "  enableGrouping: true,",
    "  enableColumnPinning: true,",
  ]
  if (state.big)
    lines.push("  enablePagination: false,", "  enableRowVirtualization: true,")
  if (state.locale === "ar")
    lines.push("  localization: dataTableLocalizationAr,")
  if (initial.length) {
    lines.push("  initialState: {")
    for (const [key, value] of initial)
      lines.push(`    ${key}: ${print(value)},`)
    lines.push("  },")
  }
  lines.push("})")
  const code = lines.join("\n")
  return state.locale === "ar" ? `${LOCALE_IMPORT}\n\n${code}` : code
}
