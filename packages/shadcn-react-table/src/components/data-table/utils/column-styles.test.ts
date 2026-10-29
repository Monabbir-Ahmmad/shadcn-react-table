import { describe, expect, it } from "vitest"

import { getColumnWidthStyle } from "./column-styles"

describe("getColumnWidthStyle", () => {
  it("uses the id verbatim when it is a valid custom-property name", () => {
    expect(getColumnWidthStyle("first_name")).toEqual({
      width: "calc(var(--col-first_name-size) * 1px)",
    })
  })

  it("escapes spaces, dots and other punctuation", () => {
    expect(getColumnWidthStyle("first name.v2")).toEqual({
      width: "calc(var(--col-first_name_v2-size) * 1px)",
    })
  })

  it("keeps non-ASCII letters, which CSS names allow", () => {
    expect(getColumnWidthStyle("fødsel")).toEqual({
      width: "calc(var(--col-fødsel-size) * 1px)",
    })
    expect(getColumnWidthStyle("fødsel")).not.toEqual(
      getColumnWidthStyle("fådsel")
    )
  })
})
