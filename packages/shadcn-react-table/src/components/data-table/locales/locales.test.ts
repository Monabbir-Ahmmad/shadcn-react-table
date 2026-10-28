import { describe, expect, it } from "vitest"

import { defaultLocalization } from "../core/localization"
import type { DataTableLocalization } from "../core/localization"

// Vite resolves this at build time; the package does not depend on vite directly,
// so declare the one overload used here.
declare global {
  interface ImportMeta {
    glob<T>(pattern: string, options: { eager: true }): Record<string, T>
  }
}

const modules = import.meta.glob<Record<string, DataTableLocalization>>(
  "./*.ts",
  { eager: true }
)
const locales = Object.entries(modules)
  .filter(([path]) => !path.includes(".test."))
  .map(([path, mod]) => {
    const lang = path.replace("./", "").replace(".ts", "")
    const value = Object.values(mod)[0]!
    return [lang, value] as const
  })

describe("locales", () => {
  it("ships 37 locale files", () => {
    expect(locales).toHaveLength(37)
  })

  it.each(locales)("%s is complete and well-formed", (lang, l) => {
    expect(l.language).toBe(lang)
    for (const [key, english] of Object.entries(defaultLocalization)) {
      const value = (l as unknown as Record<string, unknown>)[key]
      expect(value, key).toBeDefined()
      if (typeof english === "string") {
        expect(typeof value, key).toBe("string")
        expect((value as string).length, key).toBeGreaterThan(0)
      } else if (typeof english === "function") {
        expect(typeof value, key).toBe("function")
      } else {
        for (const sub of Object.keys(english)) {
          expect(
            (value as Record<string, string>)[sub],
            `${key}.${sub}`
          ).toBeTruthy()
        }
      }
    }
  })

  it.each(locales)("%s formats numbers in its own language", (lang, l) => {
    const n = (x: number) => x.toLocaleString(lang)
    expect(l.rowsSelected(1000, 2000)).toContain(n(1000))
    expect(l.rowsSelected(1000, 2000)).toContain(n(2000))
    expect(l.paginationRange(1001, 2000, 12345)).toContain(n(12345))
    expect(l.goToPage(1000)).toContain(n(1000))
    expect(l.dragRowLabel(1000)).toContain(n(1000))
  })

  it.each(locales)("%s passes its function arguments through", (_lang, l) => {
    expect(l.sortByColumnAsc("XCOLX")).toContain("XCOLX")
    expect(l.filterPlaceholder("XCOLX")).toContain("XCOLX")
    expect(l.dragOver("XAX", "XBX")).toContain("XAX")
    expect(l.dragOver("XAX", "XBX")).toContain("XBX")
  })
})
