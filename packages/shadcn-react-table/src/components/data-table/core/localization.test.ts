import { describe, expect, it } from "vitest"

import { defaultLocalization as en } from "./localization"

describe("defaultLocalization", () => {
  it("declares its language", () => {
    expect(en.language).toBe("en")
  })

  it("formats numbers for its language", () => {
    expect(en.rowsSelected(1000, 2000)).toBe("1,000 of 2,000 rows selected")
    expect(en.paginationRange(1001, 2000, 12345)).toBe("1,001–2,000 of 12,345")
    expect(en.goToPage(1000)).toBe("Go to page 1,000")
    expect(en.dragRowLabel(1000)).toBe("Row 1,000")
  })

  it("has true/false and drag announcement text", () => {
    expect(en.true).toBe("True")
    expect(en.false).toBe("False")
    expect(en.dragStart("Name")).toBe("Picked up Name.")
    expect(en.dragOver("Name", "Age")).toBe("Name is over Age.")
    expect(en.dragEnd("Name", "Age")).toBe("Name was dropped on Age.")
    expect(en.dragCancel("Name")).toBe(
      "Dragging was cancelled. Name was dropped."
    )
    expect(en.dragInstructions.length).toBeGreaterThan(0)
  })
})
