import { describe, expect, it } from "vitest"

import { stateToCode, type CodeState } from "./state-to-code"

const EMPTY: CodeState = {
  grouping: [],
  sorting: [],
  columnPinning: { left: [], right: [] },
  columnFilters: [],
  columnVisibility: {},
  density: "comfortable",
  locale: "en",
  big: false,
}

describe("stateToCode", () => {
  it("prints the base options", () => {
    expect(stateToCode(EMPTY)).toBe(
      [
        "const table = useDataTable({",
        "  data,",
        "  columns,",
        "  getRowId: (row) => row.id,",
        "  enableRowSelection: true,",
        "  enableGrouping: true,",
        "  enableColumnPinning: true,",
        "})",
      ].join("\n")
    )
  })

  it("prints the current view as initialState", () => {
    const code = stateToCode({
      ...EMPTY,
      grouping: ["department"],
      sorting: [{ id: "salary", desc: true }],
      columnPinning: { left: ["email"], right: [] },
      columnFilters: [{ id: "status", value: ["active"] }],
      columnVisibility: { age: false },
      density: "compact",
    })
    expect(code).toContain("  initialState: {")
    expect(code).toContain('    grouping: ["department"],')
    expect(code).toContain('    sorting: [{ id: "salary", desc: true }],')
    expect(code).toContain('    columnPinning: { left: ["email"], right: [] },')
    expect(code).toContain(
      '    columnFilters: [{ id: "status", value: ["active"] }],'
    )
    expect(code).toContain("    columnVisibility: { age: false },")
    expect(code).toContain('    density: "compact",')
  })

  it("prints dates, undefined and non-identifier keys", () => {
    const code = stateToCode({
      ...EMPTY,
      columnFilters: [
        {
          id: "startDate",
          value: [new Date("2024-01-02T00:00:00.000Z"), undefined],
        },
        { id: "bad", value: [new Date("nope")] },
      ],
      columnVisibility: { "first-name": false, age: false },
    })
    expect(code).toContain(
      '    columnFilters: [{ id: "startDate", value: [new Date("2024-01-02T00:00:00.000Z"), undefined] }, { id: "bad", value: [new Date(NaN)] }],'
    )
    expect(code).toContain(
      '    columnVisibility: { "first-name": false, age: false },'
    )
  })

  it("adds the Arabic locale and the large-data options", () => {
    const code = stateToCode({ ...EMPTY, locale: "ar", big: true })
    expect(
      code.startsWith(
        'import { dataTableLocalizationAr } from "@/components/ui/data-table/locales/ar"\n\n'
      )
    ).toBe(true)
    expect(code).toContain("  localization: dataTableLocalizationAr,")
    expect(code).toContain("  enablePagination: false,")
    expect(code).toContain("  enableRowVirtualization: true,")
  })
})
