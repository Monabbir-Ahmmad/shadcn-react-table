import { describe, expect, it, vi, type Mock } from "vitest"

import {
  applyCommand,
  parseCommand,
  type CommandColumn,
  type CommandTarget,
} from "./table-commands"

const COLUMNS: CommandColumn[] = [
  { id: "firstName", label: "First name" },
  { id: "email", label: "Email" },
  { id: "role", label: "Role", values: ["Owner", "Admin", "Editor", "Viewer"] },
  {
    id: "department",
    label: "Department",
    values: ["Engineering", "Sales"],
    multi: true,
  },
  {
    id: "status",
    label: "Status",
    values: ["active", "inactive", "pending"],
    multi: true,
  },
  { id: "salary", label: "Salary" },
]
const ok = (text: string) => parseCommand(text, COLUMNS)

describe("parseCommand", () => {
  it.each([
    ["group by department", { kind: "group", column: "department" }],
    ["Group by dept", { kind: "group", column: "department" }],
    ["ungroup", { kind: "ungroup" }],
    ["sort by salary", { kind: "sort", column: "salary", desc: false }],
    ["sort salary desc", { kind: "sort", column: "salary", desc: true }],
    [
      "sort by salary highest first",
      { kind: "sort", column: "salary", desc: true },
    ],
    ["pin email left", { kind: "pin", column: "email", side: "left" }],
    ["pin email to the right", { kind: "pin", column: "email", side: "right" }],
    ["pin email", { kind: "pin", column: "email", side: "left" }],
    ["unpin", { kind: "unpin" }],
    ["only active", { kind: "filter", column: "status", value: "active" }],
    ["only admins", { kind: "filter", column: "role", value: "Admin" }],
    [
      "show only sales",
      { kind: "filter", column: "department", value: "Sales" },
    ],
    ["clear filters", { kind: "clearFilters" }],
    ["hide email", { kind: "visibility", column: "email", visible: false }],
    ["show email", { kind: "visibility", column: "email", visible: true }],
    ["compact", { kind: "density", density: "compact" }],
    ["spacious rows", { kind: "density", density: "spacious" }],
    ["select all", { kind: "selectAll" }],
    ["clear selection", { kind: "clearSelection" }],
    ["arabic", { kind: "locale", locale: "ar" }],
    ["right to left", { kind: "locale", locale: "ar" }],
    ["english", { kind: "locale", locale: "en" }],
    ["a million rows", { kind: "bigData" }],
    ["load 1,000,000 rows", { kind: "bigData" }],
    ["reset", { kind: "reset" }],
  ])("%s", (text, command) => {
    expect(ok(text)).toEqual({ ok: true, command })
  })

  it("suggests commands for unknown text", () => {
    const result = ok("make it pretty")
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.suggestions.length).toBeGreaterThan(0)
  })

  it("rejects unknown columns", () => {
    expect(ok("group by banana").ok).toBe(false)
  })
})

type MockTarget = { [K in keyof CommandTarget]: Mock<CommandTarget[K]> }

function target(): MockTarget {
  return {
    setGrouping: vi.fn(),
    setSorting: vi.fn(),
    setColumnPinning: vi.fn(),
    setColumnFilters: vi.fn(),
    setColumnVisibility: vi.fn(),
    setDensity: vi.fn(),
    toggleAllRowsSelected: vi.fn(),
    reset: vi.fn(),
  }
}

describe("applyCommand", () => {
  it("groups, sorts and pins", () => {
    const t = target()
    applyCommand({ kind: "group", column: "department" }, t, COLUMNS)
    applyCommand({ kind: "sort", column: "salary", desc: true }, t, COLUMNS)
    applyCommand({ kind: "pin", column: "email", side: "right" }, t, COLUMNS)
    expect(t.setGrouping).toHaveBeenCalledWith(["department"])
    expect(t.setSorting).toHaveBeenCalledWith([{ id: "salary", desc: true }])
    expect(t.setColumnPinning).toHaveBeenCalledWith({
      left: [],
      right: ["email"],
    })
  })

  it("filters multi-select columns with an array and others with a string", () => {
    const t = target()
    applyCommand(
      { kind: "filter", column: "status", value: "active" },
      t,
      COLUMNS
    )
    applyCommand({ kind: "filter", column: "role", value: "Admin" }, t, COLUMNS)
    const [first, second] = t.setColumnFilters.mock.calls.map((c) => c[0])
    expect(first!([{ id: "role", value: "Owner" }])).toEqual([
      { id: "role", value: "Owner" },
      { id: "status", value: ["active"] },
    ])
    expect(second!([{ id: "role", value: "Owner" }])).toEqual([
      { id: "role", value: "Admin" },
    ])
  })

  it("toggles visibility, density, selection and reset", () => {
    const t = target()
    applyCommand(
      { kind: "visibility", column: "email", visible: false },
      t,
      COLUMNS
    )
    expect(t.setColumnVisibility.mock.calls[0]![0]({ role: false })).toEqual({
      role: false,
      email: false,
    })
    applyCommand({ kind: "density", density: "compact" }, t, COLUMNS)
    expect(t.setDensity).toHaveBeenCalledWith("compact")
    applyCommand({ kind: "selectAll" }, t, COLUMNS)
    applyCommand({ kind: "clearSelection" }, t, COLUMNS)
    expect(t.toggleAllRowsSelected.mock.calls).toEqual([[true], [false]])
    applyCommand({ kind: "reset" }, t, COLUMNS)
    expect(t.reset).toHaveBeenCalled()
  })
})
