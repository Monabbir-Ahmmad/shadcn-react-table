// Generates src/components/data-table/locales/<id>.ts for every language that
// has a vendored MRT file (scripts/locales/mrt-3.2.1) and a gap file
// (scripts/locales/gaps).
//
// Run from the package root:  pnpm locales:generate
//   (= tsx scripts/locales/generate-locales.mjs [--out <dir>])
//
// Values come from `MAPPING` (./mapping.mjs): MRT strings, templates built from
// MRT strings, or hand-written gap translations. Keys are emitted in the order
// of `defaultLocalization`; every value that came from a gap (or that MRT lacks
// for a language) carries a trailing `// needs review` comment.
//
// The generator never overwrites a key: when a locale file already exists, only
// keys it does not have yet are added (appended at the end of their object;
// marked `// needs review` when gap-sourced or missing from MRT). Existing
// values, including hand edits, are kept, but the file is re-formatted by
// Prettier.
//
// Every language is resolved and rendered before any file is written; exits 1
// without writing anything on: a gap key missing from a language's gap file, an
// unresolved `{token}`, a placeholder that is not one of the key's parameters,
// or a mapping of an unknown kind.
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs"
import { writeFile } from "node:fs/promises"
import { basename, dirname, join, resolve } from "node:path"
import process from "node:process"
import { fileURLToPath, pathToFileURL } from "node:url"

import { format, resolveConfig } from "prettier"

import { defaultLocalization } from "../../src/components/data-table/core/localization.ts"
import MAPPING, { LOCALE_TO_MRT } from "./mapping.mjs"

const here = dirname(fileURLToPath(import.meta.url))
const mrtDir = join(here, "mrt-3.2.1")
const gapsDir = join(here, "gaps")

const outFlag = process.argv.indexOf("--out")
const outDir = resolve(
  outFlag > -1 && process.argv[outFlag + 1]
    ? process.argv[outFlag + 1]
    : join(here, "..", "..", "src", "components", "data-table", "locales")
)

const HEADER = `// Translations adapted from Material React Table (MIT License,
// Copyright (c) 2022 Kevin Vandy). Lines marked "needs review" were added
// here and have not yet been checked by a native speaker.
`
const NEEDS_REVIEW = " // needs review"

// Function-valued keys whose parameters are numbers: they are formatted with
// the locale's own digits and grouping.
const NUMERIC_KEYS = new Set([
  "rowsSelected",
  "paginationRange",
  "goToPage",
  "dragRowLabel",
])

const errors = []
const fail = (message) => errors.push(message)

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"))
const mrtEn = readJson(join(mrtDir, "en.json"))
const mrtToLocale = Object.fromEntries(
  Object.entries(LOCALE_TO_MRT).map(([id, mrt]) => [mrt, id])
)
const langs = readdirSync(mrtDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.slice(0, -5))
  .map((name) => mrtToLocale[name] ?? name)
  .filter((id) => id !== "en")
  .sort()

const exportName = (id) =>
  "dataTableLocalization" +
  id
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("")

const paramNames = (fn) => {
  const match = /^\s*(?:async\s*)?\(?([^)=]*?)\)?\s*=>/.exec(fn.toString())
  if (!match) throw new Error(`cannot read parameters of ${fn.toString()}`)
  return match[1]
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
}

const placeholders = (text) =>
  [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1])

// The text a mapping gives a language, with MRT placeholders renamed to our
// parameter names; undefined when MRT lacks a string the mapping needs.
function expand(mapping, mrt) {
  const rename = mapping.params ?? {}
  const renamed = (value) =>
    value.replace(/\{(\w+)\}/g, (_, name) => `{${rename[name] ?? name}}`)
  if (mapping.mrt) return mrt[mapping.mrt] && renamed(mrt[mapping.mrt])
  let missing = false
  const out = mapping.template.replace(/\{(\w+)\}/g, (token, word) => {
    if (!(word in mrtEn)) return token
    if (mrt[word] === undefined) {
      missing = true
      return token
    }
    return renamed(mrt[word])
  })
  return missing ? undefined : out
}

// Renders `text` as the source of a string literal, or, for a function key,
// as an arrow function returning a template literal.
function render(path, text, english, lang) {
  if (typeof english !== "function") {
    const stray = placeholders(text)
    if (stray.length > 0) {
      fail(`${lang} ${path}: unresolved {${stray[0]}} in a string-valued key`)
    }
    return JSON.stringify(text)
  }
  const params = paramNames(english)
  const key = path.split(".")[0]
  const body = text
    .split(/(\{\w+\})/)
    .map((part) => {
      const token = /^\{(\w+)\}$/.exec(part)
      if (!token) {
        return part.replace(/[\\`]|\$\{/g, (m) => `\\${m}`)
      }
      if (!params.includes(token[1])) {
        fail(
          `${lang} ${path}: placeholder {${token[1]}} is not a parameter` +
            ` (${params.join(", ")})`
        )
        return part
      }
      return NUMERIC_KEYS.has(key)
        ? `\${${token[1]}.toLocaleString(${JSON.stringify(lang)})}`
        : `\${${token[1]}}`
    })
    .join("")
  return `(${params.join(", ")}) => \`${body}\``
}

// Resolves one (non-object) key to { source, review }.
function resolveLeaf(path, mapping, english, lang, mrt, gaps, fallbacks) {
  if (mapping.fromLocaleId) {
    return { source: JSON.stringify(lang), review: false }
  }
  if (!mapping.gap && !mapping.mrt && !mapping.template) {
    fail(`${lang} ${path}: unknown mapping kind`)
    return { source: '""', review: true }
  }
  if (mapping.gap) {
    const value = path
      .split(".")
      .reduce((node, part) => (node == null ? node : node[part]), gaps)
    if (typeof value !== "string" || value === "") {
      fail(`${lang} ${path}: missing from gaps/${lang}.json`)
      return { source: '""', review: true }
    }
    return { source: render(path, value, english, lang), review: true }
  }
  let text = expand(mapping, mrt)
  let review = false
  if (text === undefined) {
    // MRT has no string for this language: use MRT's English, flagged.
    text = expand(mapping, mrtEn)
    review = true
    fallbacks.push(`${lang} ${path}`)
    if (text === undefined) {
      fail(`${lang} ${path}: no string in MRT ${lang} or MRT en`)
      return { source: '""', review: true }
    }
  }
  return { source: render(path, text, english, lang), review }
}

// Every key of `defaultLocalization`, in order, as
// [key, { source, review } | { object: [[sub, {source, review}], ...] }].
function resolveAll(lang) {
  const mrt = readJson(join(mrtDir, `${LOCALE_TO_MRT[lang] ?? lang}.json`))
  const gapFile = join(gapsDir, `${lang}.json`)
  if (!existsSync(gapFile)) {
    fail(`${lang}: gaps/${lang}.json does not exist`)
    return { entries: [], fallbacks: [] }
  }
  const gaps = readJson(gapFile)
  const fallbacks = []
  const entries = []
  for (const [key, english] of Object.entries(defaultLocalization)) {
    const mapping = MAPPING[key]
    if (!mapping) {
      fail(`${lang} ${key}: missing from MAPPING`)
      continue
    }
    if (mapping.object) {
      const subs = Object.keys(english).map((sub) => {
        const subMapping = mapping.object[sub]
        if (!subMapping) {
          fail(`${lang} ${key}.${sub}: missing from MAPPING`)
          return [sub, { source: '""', review: true }]
        }
        return [
          sub,
          resolveLeaf(
            `${key}.${sub}`,
            subMapping,
            english[sub],
            lang,
            mrt,
            gaps,
            fallbacks
          ),
        ]
      })
      entries.push([key, { object: subs }])
    } else {
      entries.push([
        key,
        resolveLeaf(key, mapping, english, lang, mrt, gaps, fallbacks),
      ])
    }
  }
  return { entries, fallbacks }
}

const line = (key, { source, review }, indent) =>
  `${indent}${key}: ${source},${review ? NEEDS_REVIEW : ""}`

const lines = (key, entry, indent = "  ") =>
  entry.object
    ? [
        `${indent}${key}: {`,
        ...entry.object.map(([sub, leaf]) => line(sub, leaf, indent + "  ")),
        `${indent}},`,
      ]
    : [line(key, entry, indent)]

let prettierConfig
async function pretty(text, filepath) {
  prettierConfig ??= {
    ...((await resolveConfig(filepath)) ?? {}),
    // Class sorting is irrelevant here and needs the docs stylesheet.
    plugins: [],
  }
  return format(text, { ...prettierConfig, parser: "typescript" })
}

const countReviews = (text) => text.split("// needs review").length - 1

async function generateNew(lang, entries, file) {
  const body = entries.flatMap(([key, entry]) => lines(key, entry))
  const text =
    `${HEADER}\nimport type { DataTableLocalization } from "../core/localization"\n\n` +
    `export const ${exportName(lang)}: DataTableLocalization = {\n` +
    `${body.join("\n")}\n}\n`
  const formatted = await pretty(text, file)
  const expected = body.filter((l) => l.endsWith(NEEDS_REVIEW)).length
  if (countReviews(formatted) !== expected) {
    fail(`${lang}: formatting changed the number of "needs review" markers`)
  }
  return { file, text: formatted, added: 0 }
}

// Adds the keys an existing file lacks. Existing values are kept; the file is
// re-formatted by Prettier and new keys go at the end of their object.
async function appendMissing(lang, entries, file) {
  const existing = (
    await import(`${pathToFileURL(file).href}?t=${Date.now()}`)
  )[exportName(lang)]
  if (!existing) {
    fail(`${lang}: ${file} does not export ${exportName(lang)}`)
    return { file, text: null, added: 0 }
  }
  let text = readFileSync(file, "utf8").replace(/\r\n/g, "\n")
  if (!text.includes("\n}")) {
    fail(`${lang}: cannot find the closing brace of ${file}`)
    return { file, text: null, added: 0 }
  }
  const top = []
  const nested = []
  let added = 0
  for (const [key, entry] of entries) {
    if (!(key in existing)) {
      top.push(...lines(key, entry))
      added += entry.object ? entry.object.length : 1
    } else if (entry.object) {
      for (const [sub, leaf] of entry.object) {
        if (!(sub in existing[key])) {
          nested.push([key, line(sub, leaf, "    ")])
          added += 1
        }
      }
    }
  }
  if (added === 0) return { file, text: null, added: 0 }
  for (const [key, newLine] of nested) {
    const open = new RegExp(`^ {2}${key}: \\{\\s*$`, "m").exec(text)
    if (!open) {
      fail(`${lang}: cannot find "${key}: {" in ${file} to add a key`)
      continue
    }
    const at = open.index + open[0].length
    text = `${text.slice(0, at)}\n${newLine}${text.slice(at)}`
  }
  const end = text.lastIndexOf("\n}")
  text = `${text.slice(0, end)}\n${top.join("\n")}${text.slice(end)}`
  return { file, text: await pretty(text, file), added }
}

// Phase 1: resolve and render every language; nothing is written yet.
const results = []
const allFallbacks = []
for (const lang of langs) {
  const { entries, fallbacks } = resolveAll(lang)
  allFallbacks.push(...fallbacks)
  const file = join(outDir, `${lang}.ts`)
  results.push(
    existsSync(file)
      ? await appendMissing(lang, entries, file)
      : await generateNew(lang, entries, file)
  )
}

if (errors.length > 0) {
  console.error(
    `generate-locales: ${errors.length} problem(s); nothing written`
  )
  for (const message of errors) console.error(`  ${message}`)
  process.exit(1)
}

// Phase 2: write.
mkdirSync(outDir, { recursive: true })
for (const { file, text } of results) {
  if (text !== null) await writeFile(file, text)
}

const created = results.filter((r) => r.text !== null && r.added === 0).length
const updated = results.filter((r) => r.added > 0)
console.log(
  `locales: ${langs.length} languages; ${created} written, ` +
    `${updated.length} extended, ${langs.length - created - updated.length} unchanged`
)
for (const { file, added } of updated) {
  console.log(`  ${basename(file)}: appended ${added} missing key(s)`)
}
if (allFallbacks.length > 0) {
  console.log(
    `note: ${allFallbacks.length} value(s) absent from MRT use MRT's English, ` +
      `marked "needs review": ${allFallbacks.join(", ")}`
  )
}
