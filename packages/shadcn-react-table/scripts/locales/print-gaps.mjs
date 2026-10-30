// Validates MAPPING against `defaultLocalization` and the vendored MRT strings,
// then writes every gap key (with its English value) to gaps/_keys.txt.
//
// Run from the package root:  npx tsx scripts/locales/print-gaps.mjs
// Exits 1 when a key of `defaultLocalization` is missing from MAPPING (or the
// reverse), when a mapping names an MRT key that does not exist, or when an
// MRT string carries a placeholder the target key cannot fill.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

import { defaultLocalization } from "../../src/components/data-table/core/localization.ts"
import MAPPING, { LOCALE_TO_MRT } from "./mapping.mjs"

const here = dirname(fileURLToPath(import.meta.url))
const mrtDir = join(here, "mrt-3.2.1")

const loadMrt = (lang) =>
  JSON.parse(readFileSync(join(mrtDir, `${lang}.json`), "utf8"))
const mrtEn = loadMrt("en")
const mrtToLocale = Object.fromEntries(
  Object.entries(LOCALE_TO_MRT).map(([id, mrt]) => [mrt, id])
)
// Our locale ids (MRT's `np` is our `ne`); English is the source, not a locale.
const langs = readdirSync(mrtDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.slice(0, -5))
  .map((name) => mrtToLocale[name] ?? name)
  .filter((id) => id !== "en")
  .sort()
const mrtByLang = Object.fromEntries(
  langs.map((id) => [id, loadMrt(LOCALE_TO_MRT[id] ?? id)])
)
mrtByLang.en = mrtEn

const errors = []
const gaps = []
const fail = (message) => errors.push(message)

const oneLine = (value) =>
  typeof value === "function"
    ? value
        .toString()
        .replace(/\\u([0-9a-f]{4})/gi, (_, hex) =>
          String.fromCharCode(parseInt(hex, 16))
        )
        .replace(/,(?=\S)/g, ", ")
        .replace(/\s*=>\s*/, " => ")
        .replace(/\s+/g, " ")
        .trim()
    : String(value)

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

// Expands a mapping to the string a given language would get, with MRT
// placeholders renamed to our parameter names.
function expand(mapping, lang) {
  const mrt = mrtByLang[lang]
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

const mrtRefs = (mapping) =>
  mapping.mrt
    ? [mapping.mrt]
    : mapping.template
        .match(/\{(\w+)\}/g)
        .map((token) => token.slice(1, -1))
        .filter((word) => word in mrtEn)

const missingInLang = new Map()
const identical = []

function check(path, mapping, value) {
  const kinds = ["mrt", "template", "gap", "fromLocaleId"].filter(
    (k) => k in mapping
  )
  if (kinds.length !== 1) return fail(`${path}: mapping must be one shape`)

  if (mapping.gap) {
    gaps.push([path, oneLine(value)])
    return
  }
  if (mapping.fromLocaleId) return

  for (const ref of mrtRefs(mapping)) {
    if (!(ref in mrtEn)) fail(`${path}: "${ref}" is not a key of mrt en.json`)
  }
  if (mapping.mrt && !(mapping.mrt in mrtEn)) return

  // Parameters the target can fill: the function's, or none for a string.
  const allowed = typeof value === "function" ? paramNames(value) : []
  if (mapping.template) {
    for (const word of placeholders(mapping.template)) {
      if (!(word in mrtEn) && !allowed.includes(word)) {
        fail(`${path}: template token {${word}} is neither MRT key nor param`)
      }
    }
  }
  for (const lang of langs) {
    const text = expand(mapping, lang)
    if (text === undefined) {
      const list = missingInLang.get(lang) ?? []
      list.push(path)
      missingInLang.set(lang, list)
      continue
    }
    // Same text as MRT's English: probably untranslated (or identical by design).
    if (text === expand(mapping, "en")) identical.push(`${lang} ${path}`)
    for (const name of placeholders(text)) {
      if (!allowed.includes(name)) {
        fail(
          `${path} [${lang}]: placeholder {${name}} is not a parameter` +
            ` (${allowed.join(", ") || "string-valued key"})`
        )
      }
    }
  }
}

// Every key of defaultLocalization must be mapped, and nothing else.
for (const key of Object.keys(defaultLocalization)) {
  if (!(key in MAPPING)) fail(`${key}: missing from MAPPING`)
}
for (const key of Object.keys(MAPPING)) {
  if (!(key in defaultLocalization)) fail(`${key}: in MAPPING but not a key`)
}

for (const [key, value] of Object.entries(defaultLocalization)) {
  const mapping = MAPPING[key]
  if (!mapping) continue
  if (mapping.object) {
    const subs = mapping.object
    for (const sub of Object.keys(value)) {
      if (!(sub in subs)) fail(`${key}.${sub}: missing from MAPPING`)
    }
    for (const sub of Object.keys(subs)) {
      if (!(sub in value)) fail(`${key}.${sub}: in MAPPING but not a key`)
    }
    for (const [sub, subMapping] of Object.entries(subs)) {
      if (sub in value) check(`${key}.${sub}`, subMapping, value[sub])
    }
  } else {
    check(key, mapping, value)
  }
}

if (errors.length > 0) {
  console.error(`print-gaps: ${errors.length} problem(s)`)
  for (const message of errors) console.error(`  ${message}`)
  process.exit(1)
}

const outDir = join(here, "gaps")
mkdirSync(outDir, { recursive: true })
writeFileSync(
  join(outDir, "_keys.txt"),
  gaps.map(([key, english]) => `${key}\t${english}`).join("\n") + "\n"
)

const dotted = gaps.filter(([key]) => key.includes(".")).length
console.log(
  `gap keys: ${gaps.length} (${gaps.length - dotted} top-level, ${dotted} nested)`
)
for (const [key] of gaps) console.log(`  ${key}`)
if (missingInLang.size > 0) {
  const total = [...missingInLang.values()].reduce((n, l) => n + l.length, 0)
  console.log(
    `note: ${total} mapped (key, language) pairs are absent from MRT and` +
      ` will fall back to English: ` +
      [...missingInLang].map(([l, k]) => `${l}[${k.join(",")}]`).join(" ")
  )
}
if (identical.length > 0) {
  console.log(`identical to MRT English (${identical.length}):`)
  for (const hit of identical) console.log(`  ${hit}`)
}
console.log(`wrote ${join("scripts", "locales", "gaps", "_keys.txt")}`)
