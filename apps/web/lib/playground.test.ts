import { describe, expect, it } from "vitest"

import {
  DEFAULT_PLAYGROUND,
  playgroundCode,
  playgroundOptions,
  type PlaygroundConfig,
} from "./playground"

describe("playground", () => {
  it("leaves defaults out of the options", () => {
    expect(playgroundOptions(DEFAULT_PLAYGROUND)).toEqual({})
  })

  it("maps switches to table options", () => {
    const config: PlaygroundConfig = {
      ...DEFAULT_PLAYGROUND,
      rowSelection: true,
      grouping: true,
      columnPinning: true,
      rowPinning: true,
      editing: "row",
      filters: "popover",
      density: "compact",
      virtualization: true,
    }
    expect(playgroundOptions(config)).toEqual({
      enableRowSelection: true,
      enableGrouping: true,
      enableColumnPinning: true,
      enableRowPinning: true,
      enableEditing: true,
      editDisplayMode: "row",
      columnFilterDisplayMode: "popover",
      initialState: { density: "compact" },
      enablePagination: false,
      enableRowVirtualization: true,
      slotProps: { surface: { className: "max-h-[420px]" } },
    })
  })

  it("prints the same options as code", () => {
    const code = playgroundCode({
      ...DEFAULT_PLAYGROUND,
      rowSelection: true,
      editing: "cell",
    })
    expect(code).toBe(
      [
        "const table = useDataTable({",
        "  data,",
        "  columns,",
        "  getRowId: (row) => row.id,",
        "  enableRowSelection: true,",
        "  enableEditing: true,",
        '  editDisplayMode: "cell",',
        "})",
        "",
        "return <DataTable table={table} />",
      ].join("\n")
    )
  })

  it("prints nested objects", () => {
    const code = playgroundCode({ ...DEFAULT_PLAYGROUND, density: "spacious" })
    expect(code).toContain('  initialState: { density: "spacious" },')
  })
})
