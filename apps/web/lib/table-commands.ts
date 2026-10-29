import { BIG_ROW_COUNT } from "./big-data"

/** A column the command bar can talk about. */
export type CommandColumn = {
  id: string
  label: string
  values?: string[]
  multi?: boolean
}

export type Command =
  | { kind: "group"; column: string }
  | { kind: "ungroup" }
  | { kind: "sort"; column: string; desc: boolean }
  | { kind: "pin"; column: string; side: "left" | "right" }
  | { kind: "unpin" }
  | { kind: "filter"; column: string; value: string }
  | { kind: "clearFilters" }
  | { kind: "visibility"; column: string; visible: boolean }
  | { kind: "density"; density: "compact" | "comfortable" | "spacious" }
  | { kind: "selectAll" }
  | { kind: "clearSelection" }
  | { kind: "locale"; locale: "en" | "ar" }
  | { kind: "bigData" }
  | { kind: "reset" }

export type ParseResult =
  { ok: true; command: Command } | { ok: false; suggestions: string[] }

/** The large dataset's size as the page writes it ("100,000 rows"). */
export const BIG_ROWS_LABEL = `${BIG_ROW_COUNT.toLocaleString("en-US")} rows`

export const EXAMPLE_COMMANDS = [
  "group by department",
  "sort by salary highest first",
  "pin email left",
  "only active",
  "compact",
  "arabic",
  BIG_ROWS_LABEL,
  "reset",
]

/** "100,000 rows", "load 100000", "100k rows": the large dataset by its size. */
function isBigRowCount(text: string) {
  const m = text
    .toLowerCase()
    .replace(/[\s,._]/g, "")
    .match(/^(?:load|show)?(\d+)(k?)(?:rows?)?$/)
  return !!m && Number(m[1]) * (m[2] ? 1000 : 1) === BIG_ROW_COUNT
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
const squash = (s: string) => norm(s).replace(/ /g, "")
const singular = (s: string) => s.replace(/(ies)$/, "y").replace(/s$/, "")

/** The words a column goes by: its label's words and its id's camelCase words. */
function wordsOf(column: CommandColumn): string[] {
  const idWords = column.id
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .map((w) => w.toLowerCase())
  return [...new Set([...norm(column.label).split(" "), ...idWords])].filter(
    Boolean
  )
}

/** True when `abbr` reads as a shortening of `word` ("dept" of "department"). */
function abbreviates(abbr: string, word: string) {
  if (abbr[0] !== word[0]) return false
  let i = 0
  for (const ch of word) if (ch === abbr[i]) i++
  return i === abbr.length
}

/**
 * A column by id or label. Matched in tiers, and the first tier with exactly
 * one hit wins: the whole id or label, a whole word of it ("date"), the start
 * of a word ("sal"), then an abbreviation of a single word ("dept", 4+ letters).
 * A tier with several hits is ambiguous, so nothing is picked.
 */
function findColumn(
  text: string,
  columns: CommandColumn[]
): CommandColumn | undefined {
  const t = squash(text)
  if (!t) return undefined
  const tiers: ((c: CommandColumn) => boolean)[] = [
    (c) => squash(c.id) === t || squash(c.label) === t,
    (c) => wordsOf(c).includes(t),
    (c) =>
      t.length >= 3 &&
      (squash(c.label).startsWith(t) ||
        squash(c.id).startsWith(t) ||
        wordsOf(c).some((w) => w.startsWith(t))),
    (c) => t.length >= 4 && wordsOf(c).some((w) => abbreviates(t, w)),
  ]
  for (const tier of tiers) {
    const hits = columns.filter(tier)
    if (hits.length) return hits.length === 1 ? hits[0] : undefined
  }
  return undefined
}

/** A column value ("active", "admins", "sales"). */
function findValue(text: string, columns: CommandColumn[]) {
  const t = singular(squash(text))
  for (const column of columns) {
    const value = column.values?.find((v) => singular(squash(v)) === t)
    if (value) return { column: column.id, value }
  }
  return undefined
}

export function parseCommand(
  text: string,
  columns: CommandColumn[]
): ParseResult {
  const t = norm(text)
  const fail = (): ParseResult => ({ ok: false, suggestions: EXAMPLE_COMMANDS })
  const done = (command: Command): ParseResult => ({ ok: true, command })
  let m: RegExpMatchArray | null

  if (/^(reset|start over|undo all)$/.test(t)) return done({ kind: "reset" })
  if (/^(ungroup|no grouping|clear grouping)$/.test(t))
    return done({ kind: "ungroup" })
  if (/^(unpin|unpin all|clear pins)$/.test(t)) return done({ kind: "unpin" })
  if (/^(clear filters?|no filters?|show all)$/.test(t))
    return done({ kind: "clearFilters" })
  if (/^select all( rows)?$/.test(t)) return done({ kind: "selectAll" })
  if (/^(clear|deselect|unselect)( all| selection)?$/.test(t) && t !== "clear")
    return done({ kind: "clearSelection" })
  if (/^(arabic|rtl|right to left)$/.test(t))
    return done({ kind: "locale", locale: "ar" })
  if (/^(english|ltr|left to right)$/.test(t))
    return done({ kind: "locale", locale: "en" })
  if (
    /\b(million|1 000 000|1000000|lots of|huge)\b/.test(t) &&
    /rows?|data|million/.test(t)
  )
    return done({ kind: "bigData" })
  if (isBigRowCount(text)) return done({ kind: "bigData" })
  if ((m = t.match(/^(compact|comfortable|spacious)( rows| density)?$/))) {
    return done({
      kind: "density",
      density: m[1] as "compact" | "comfortable" | "spacious",
    })
  }
  if ((m = t.match(/^group(?: rows)?(?: by)? (.+)$/))) {
    const column = findColumn(m[1]!, columns)
    return column ? done({ kind: "group", column: column.id }) : fail()
  }
  if (
    (m = t.match(
      /^sort(?: rows)?(?: by)? (.+?)(?: (asc|ascending|desc|descending|highest first|lowest first|high to low|low to high))?$/
    ))
  ) {
    const column = findColumn(m[1]!, columns)
    const desc = /desc|highest|high to low/.test(m[2] ?? "")
    return column ? done({ kind: "sort", column: column.id, desc }) : fail()
  }
  if ((m = t.match(/^pin (.+?)(?: (?:to the |to )?(left|right))?$/))) {
    const column = findColumn(m[1]!, columns)
    return column
      ? done({
          kind: "pin",
          column: column.id,
          side: (m[2] as "left" | "right" | undefined) ?? "left",
        })
      : fail()
  }
  if ((m = t.match(/^(hide|show) (.+)$/)) && !/^show only /.test(t)) {
    const column = findColumn(m[2]!, columns)
    return column
      ? done({
          kind: "visibility",
          column: column.id,
          visible: m[1] === "show",
        })
      : fail()
  }
  if (
    (m = t.match(/^(?:show )?only (.+)$/)) ||
    (m = t.match(/^filter (?:by |to )?(.+)$/))
  ) {
    const found = findValue(m[1]!, columns)
    return found ? done({ kind: "filter", ...found }) : fail()
  }
  return fail()
}

/** The table methods a command needs (the real table instance satisfies it). */
export interface CommandTarget {
  setGrouping(v: string[]): void
  setSorting(v: { id: string; desc: boolean }[]): void
  setColumnPinning(v: { left: string[]; right: string[] }): void
  setColumnFilters(
    updater: (
      prev: { id: string; value: unknown }[]
    ) => { id: string; value: unknown }[]
  ): void
  setColumnVisibility(
    updater: (prev: Record<string, boolean>) => Record<string, boolean>
  ): void
  setDensity(v: "compact" | "comfortable" | "spacious"): void
  toggleAllRowsSelected(v: boolean): void
  reset(): void
}

/** Runs a command on the table. `locale` and `bigData` are handled by the page. */
export function applyCommand(
  command: Command,
  target: CommandTarget,
  columns: CommandColumn[]
): void {
  switch (command.kind) {
    case "group":
      return target.setGrouping([command.column])
    case "ungroup":
      return target.setGrouping([])
    case "sort":
      return target.setSorting([{ id: command.column, desc: command.desc }])
    case "pin":
      return target.setColumnPinning(
        command.side === "left"
          ? { left: [command.column], right: [] }
          : { left: [], right: [command.column] }
      )
    case "unpin":
      return target.setColumnPinning({ left: [], right: [] })
    case "filter": {
      const multi = columns.find((c) => c.id === command.column)?.multi
      const value = multi ? [command.value] : command.value
      return target.setColumnFilters((prev) => [
        ...prev.filter((f) => f.id !== command.column),
        { id: command.column, value },
      ])
    }
    case "clearFilters":
      return target.setColumnFilters(() => [])
    case "visibility":
      return target.setColumnVisibility((prev) => ({
        ...prev,
        [command.column]: command.visible,
      }))
    case "density":
      return target.setDensity(command.density)
    case "selectAll":
      return target.toggleAllRowsSelected(true)
    case "clearSelection":
      return target.toggleAllRowsSelected(false)
    case "reset":
      return target.reset()
    case "locale":
    case "bigData":
      return
  }
}

const DENSITY_LABEL = {
  compact: "Compact",
  comfortable: "Comfortable",
  spacious: "Spacious",
} as const

/** The one-line confirmation the command bar shows after a command ran. */
export function describeCommand(
  command: Command,
  columns: CommandColumn[]
): string {
  const label = (id: string) =>
    columns.find((column) => column.id === id)?.label ?? id
  switch (command.kind) {
    case "group":
      return `Grouped by ${label(command.column)}`
    case "ungroup":
      return "Grouping cleared"
    case "sort":
      return `Sorted by ${label(command.column)}, ${
        command.desc ? "highest first" : "lowest first"
      }`
    case "pin":
      return `Pinned ${label(command.column)} to the ${command.side}`
    case "unpin":
      return "All columns unpinned"
    case "filter":
      return `Showing only ${command.value} (${label(command.column)})`
    case "clearFilters":
      return "Filters cleared"
    case "visibility":
      return `${command.visible ? "Showing" : "Hid"} ${label(command.column)}`
    case "density":
      return `${DENSITY_LABEL[command.density]} rows`
    case "selectAll":
      return "Selected every row"
    case "clearSelection":
      return "Selection cleared"
    case "locale":
      return command.locale === "ar"
        ? "Arabic, right to left"
        : "English, left to right"
    case "bigData":
      return `Loaded ${BIG_ROWS_LABEL}`
    case "reset":
      return "Back to the starting view"
  }
}
