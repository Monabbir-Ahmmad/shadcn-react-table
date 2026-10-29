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

export const EXAMPLE_COMMANDS = [
  "group by department",
  "sort by salary highest first",
  "pin email left",
  "only active",
  "compact",
  "arabic",
  "a million rows",
  "reset",
]

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
const squash = (s: string) => norm(s).replace(/ /g, "")
const singular = (s: string) => s.replace(/(ies)$/, "y").replace(/s$/, "")

/** True when `abbr` reads as a shortening of `word` ("dept" of "department"). */
function abbreviates(abbr: string, word: string) {
  if (abbr[0] !== word[0]) return false
  let i = 0
  for (const ch of word) if (ch === abbr[i]) i++
  return i === abbr.length
}

/** A column by id or label; a prefix or abbreviation of 3+ letters matches too. */
function findColumn(
  text: string,
  columns: CommandColumn[]
): CommandColumn | undefined {
  const t = squash(text)
  if (!t) return undefined
  return (
    columns.find((c) => squash(c.id) === t || squash(c.label) === t) ??
    (t.length >= 3
      ? (columns.find(
          (c) => squash(c.label).startsWith(t) || squash(c.id).startsWith(t)
        ) ??
        columns.find(
          (c) => abbreviates(t, squash(c.label)) || abbreviates(t, squash(c.id))
        ))
      : undefined)
  )
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
