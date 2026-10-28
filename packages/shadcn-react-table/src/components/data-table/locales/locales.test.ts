import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it, vi } from "vitest"

import { defaultLocalization } from "../core/localization"
import type { DataTableLocalization } from "../core/localization"

// Vite resolves this at build time; the package does not depend on vite directly,
// so declare the one overload used here.
declare global {
  interface ImportMeta {
    glob<T>(pattern: string, options: { eager: true }): Record<string, T>
  }
}

// Same rule as scripts/locales/generate-locales.mjs: pt-BR -> PtBR.
const exportName = (id: string) =>
  "dataTableLocalization" +
  id
    .split("-")
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join("")

const modules = import.meta.glob<Record<string, DataTableLocalization>>(
  "./*.ts",
  { eager: true }
)
const locales = Object.entries(modules)
  .filter(([path]) => !path.includes(".test."))
  .map(([path, mod]) => {
    const lang = path.replace("./", "").replace(".ts", "")
    return [lang, mod[exportName(lang)]!, mod] as const
  })

// Function keys that take numbers (formatted with the locale's own digits).
const NUMERIC_KEYS = new Set([
  "rowsSelected",
  "paginationRange",
  "goToPage",
  "dragRowLabel",
])
// Distinct numbers that group (1,234,567) in every locale.
const NUMBERS = [1234567, 2345678, 3456789]

const callWith = (fn: (...args: never[]) => string, args: unknown[]) =>
  (fn as (...a: unknown[]) => string)(...args)

describe("locales", () => {
  it("ships 37 locale files", () => {
    expect(locales).toHaveLength(37)
  })

  it.each(locales)("%s exports its localization by name", (lang, l, mod) => {
    expect(l, exportName(lang)).toBeDefined()
    expect(Object.keys(mod)).toEqual([exportName(lang)])
  })

  it.each(locales)("%s carries the MRT credit header", (lang) => {
    const source = readFileSync(join(import.meta.dirname, `${lang}.ts`), "utf8")
    expect(source).toMatch(
      /^\/\/ Translations adapted from Material React Table \(MIT License,\r?\n\/\/ Copyright \(c\) 2022 Kevin Vandy\)/
    )
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
    const [a, b, c] = NUMBERS as [number, number, number]
    for (const x of NUMBERS) expect(n(x)).not.toBe(String(x))

    const selected = l.rowsSelected(a, b)
    expect(selected).toContain(n(a))
    expect(selected).toContain(n(b))

    const range = l.paginationRange(a, b, c)
    expect(range).toContain(n(a))
    expect(range).toContain(n(b))
    expect(range).toContain(n(c))

    expect(l.goToPage(a)).toContain(n(a))
    expect(l.dragRowLabel(a)).toContain(n(a))
  })

  it.each(locales)(
    "%s passes its own language to toLocaleString",
    (lang, l) => {
      const spy = vi.spyOn(Number.prototype, "toLocaleString")
      try {
        l.rowsSelected(1, 2)
        l.paginationRange(1, 2, 3)
        l.goToPage(1)
        l.dragRowLabel(1)
        expect(spy.mock.calls.length).toBeGreaterThanOrEqual(7)
        for (const call of spy.mock.calls) expect(call[0]).toBe(lang)
      } finally {
        spy.mockRestore()
      }
    }
  )

  it.each(locales)("%s passes every function argument through", (lang, l) => {
    const fnKeys = Object.entries(defaultLocalization).filter(
      ([, value]) => typeof value === "function"
    )
    expect(fnKeys.length).toBeGreaterThan(0)
    for (const [key, english] of fnKeys) {
      const fn = (l as unknown as Record<string, (...a: never[]) => string>)[
        key
      ]!
      const arity = (english as (...a: unknown[]) => string).length
      const numeric = NUMERIC_KEYS.has(key)
      const args = Array.from({ length: arity }, (_, i) =>
        numeric ? NUMBERS[i]! : `XARG${i}X`
      )
      const out = callWith(fn, args)
      expect(typeof out, key).toBe("string")
      args.forEach((arg, i) => {
        const shown = numeric ? (arg as number).toLocaleString(lang) : arg
        expect(out, `${key} argument ${i}`).toContain(shown)
      })
    }
  })
})
