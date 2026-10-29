import type { UseDataTableOptions } from "@monabbir/shadcn-react-table/components/data-table"

import type { User } from "@/lib/example-data"

/** The home page playground's switches. */
export interface PlaygroundConfig {
  rowSelection: boolean
  grouping: boolean
  columnPinning: boolean
  rowPinning: boolean
  editing: "off" | "cell" | "row" | "modal"
  filters: "subheader" | "popover"
  density: "compact" | "comfortable" | "spacious"
  virtualization: boolean
}

export const DEFAULT_PLAYGROUND: PlaygroundConfig = {
  rowSelection: false,
  grouping: false,
  columnPinning: false,
  rowPinning: false,
  editing: "off",
  filters: "subheader",
  density: "comfortable",
  virtualization: false,
}

/** The `useDataTable` options the switches add (defaults left out). */
export function playgroundOptions(
  config: PlaygroundConfig
): Partial<UseDataTableOptions<User>> {
  const options: Partial<UseDataTableOptions<User>> = {}
  if (config.rowSelection) options.enableRowSelection = true
  if (config.grouping) options.enableGrouping = true
  if (config.columnPinning) options.enableColumnPinning = true
  if (config.rowPinning) options.enableRowPinning = true
  if (config.editing !== "off") {
    options.enableEditing = true
    options.editDisplayMode = config.editing
  }
  if (config.filters !== "subheader") {
    options.columnFilterDisplayMode = config.filters
  }
  if (config.density !== "comfortable") {
    options.initialState = { density: config.density }
  }
  if (config.virtualization) {
    options.enablePagination = false
    options.enableRowVirtualization = true
    options.slotProps = { surface: { className: "max-h-[420px]" } }
  }
  return options
}

/** A value as it would be written in source. */
function print(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value)
  if (value && typeof value === "object") {
    const entries = Object.entries(value).map(([k, v]) => `${k}: ${print(v)}`)
    return `{ ${entries.join(", ")} }`
  }
  return String(value)
}

/** The save handlers the editing mode needs, as source lines. */
function saveHandlerLines(editing: PlaygroundConfig["editing"]): string[] {
  if (editing === "cell") {
    return [
      "  onEditingCellSave: ({ row, column, value }) => save(row.id, { [column.id]: value }),",
    ]
  }
  if (editing === "row" || editing === "modal") {
    return [
      "  onEditingRowSave: ({ row, values, exit }) => {",
      "    save(row.id, values)",
      "    exit()",
      "  },",
    ]
  }
  return []
}

/** The code for the current switches. */
export function playgroundCode(config: PlaygroundConfig): string {
  const lines = Object.entries(playgroundOptions(config)).map(
    ([key, value]) => `  ${key}: ${print(value)},`
  )
  return [
    "const table = useDataTable({",
    "  data,",
    "  columns,",
    "  getRowId: (row) => row.id,",
    ...lines,
    ...saveHandlerLines(config.editing),
    "})",
    "",
    "return <DataTable table={table} />",
  ].join("\n")
}
