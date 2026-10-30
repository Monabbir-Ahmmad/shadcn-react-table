// Auto-generates the data-table API reference from the @monabbir/shadcn-react-table source
// of truth (types.ts / localization.ts / icons.tsx / use-data-table.ts), so the
// docs tables never drift from the real API. Emits a typed module the docs
// pages import. Run from the repo root (anchored via import.meta.url):
//   node apps/web/scripts/build-api-docs.mjs
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"
import prettier from "prettier"
import { Project, SyntaxKind } from "ts-morph"

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../..")
const DT = join(REPO, "packages/shadcn-react-table/src/components/data-table")
const OUT = join(REPO, "apps/web/lib/api-reference.generated.ts")

const project = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { allowJs: false, jsx: 4 },
})

const typesSf = project.addSourceFileAtPath(join(DT, "core/types.ts"))
const localeSf = project.addSourceFileAtPath(join(DT, "core/localization.ts"))
const iconsSf = project.addSourceFileAtPath(join(DT, "core/icons.tsx"))
const hookSf = project.addSourceFileAtPath(join(DT, "core/use-data-table.ts"))
const tableSf = project.addSourceFileAtPath(join(DT, "core/data-table.tsx"))

const oneLine = (s) => (s ?? "").replace(/\s+/g, " ").trim()

/** JSDoc summary for an interface property. */
function describe(prop) {
  const docs = prop.getJsDocs()
  if (!docs.length) return ""
  return oneLine(docs.map((d) => d.getDescription()).join(" "))
}

/** Pull `name = defaultText` pairs out of the `const { … } = options` destructure. */
function destructureDefaults(fn) {
  const decl = fn
    .getDescendantsOfKind(SyntaxKind.VariableDeclaration)
    .find((v) => v.getInitializer()?.getText() === "options")
  const map = {}
  if (!decl) return map
  const pattern = decl.getNameNode().asKind(SyntaxKind.ObjectBindingPattern)
  if (!pattern) return map
  for (const el of pattern.getElements()) {
    const key = el.getPropertyNameNode()?.getText() ?? el.getName()
    const init = el.getInitializer()
    if (init) map[key] = oneLine(init.getText())
  }
  return map
}

/** Map an object-literal `const X = { … }` to { key: initializerText }. */
function objectLiteralDefaults(sf, varName) {
  const decl = sf.getVariableDeclarationOrThrow(varName)
  const obj = decl.getInitializerIfKindOrThrow(
    SyntaxKind.ObjectLiteralExpression
  )
  const map = {}
  for (const p of obj.getProperties()) {
    const assign = p.asKind(SyntaxKind.PropertyAssignment)
    if (!assign) continue
    map[assign.getName().replace(/['"]/g, "")] = assign.getInitializer()
  }
  return map
}

/** Build API rows from an interface's own properties. */
function membersOf(iface, { defaults = {}, omit = [] } = {}) {
  return iface
    .getProperties()
    .filter((p) => !omit.includes(p.getName()))
    .map((p) => {
      const name = p.getName()
      return {
        name,
        type: oneLine(p.getTypeNode()?.getText() ?? p.getType().getText()),
        required: !p.hasQuestionToken(),
        default: defaults[name] ?? null,
        description: describe(p),
      }
    })
}

// --- useDataTable options (our own additions; TanStack TableOptions pass through)
const optionDefaults = destructureDefaults(
  hookSf.getFunctionOrThrow("useDataTable")
)
const useDataTableOptions = membersOf(
  typesSf.getInterfaceOrThrow("UseDataTableOptions"),
  { defaults: optionDefaults, omit: [] }
)

// --- Column options (the ColumnMeta augmentation)
const colMetaModule = typesSf
  .getModules()
  .find((m) => m.getName().includes("@tanstack/react-table"))
const columnOptions = membersOf(colMetaModule.getInterfaceOrThrow("ColumnMeta"))

// --- `table.dataTable` (resolved options) and the methods on `table`, both
// from `DataTableConfig`: its key unions in types.ts say which members are
// methods, UI state (read with `getState()`) or internal. Most members are the
// resolved form of a same-named option, so an undocumented member borrows
// that option's description; `setX` setters describe themselves.
const keyUnion = (name) =>
  typesSf
    .getTypeAliasOrThrow(name)
    .getTypeNodeOrThrow()
    .getText()
    .match(/"(\w+)"/g)
    .map((s) => s.slice(1, -1))
const methodKeys = new Set(keyUnion("DataTableMethodKey"))
const hiddenKeys = new Set([
  ...keyUnion("DataTableUiStateKey"),
  ...keyUnion("DataTableInternalKey"),
])
const optionDescriptions = Object.fromEntries(
  useDataTableOptions.map((o) => [o.name, o.description])
)
const configMembers = membersOf(
  typesSf.getInterfaceOrThrow("DataTableConfig")
).map((member) => {
  if (member.description) return member
  const setter = /^set([A-Z]\w*)$/.exec(member.name)
  const description = setter
    ? `Updates \`${setter[1][0].toLowerCase()}${setter[1].slice(1)}\`.`
    : (optionDescriptions[member.name] ?? "")
  return { ...member, description }
})
const dataTableOptions = configMembers.filter(
  (m) => !methodKeys.has(m.name) && !hiddenKeys.has(m.name)
)
const tableMethods = configMembers.filter((m) => methodKeys.has(m.name))

// --- <DataTable /> component props
const dataTableProps = membersOf(
  tableSf.getInterfaceOrThrow("DataTableProps"),
  { defaults: {} }
)

// --- Localization keys (+ default English values)
const localeDefaults = objectLiteralDefaults(localeSf, "defaultLocalization")
const localizationKeys = localeSf
  .getInterfaceOrThrow("DataTableLocalization")
  .getProperties()
  .map((p) => {
    const init = localeDefaults[p.getName()]
    const typeText = oneLine(p.getTypeNode()?.getText() ?? "")
    const isFn = typeText.includes("=>")
    return {
      name: p.getName(),
      type: typeText,
      required: !p.hasQuestionToken(),
      default: init
        ? isFn
          ? oneLine(init.getText())
          : init.getText().replace(/^["'`]|["'`]$/g, "")
        : null,
      description: describe(p),
    }
  })

// --- Icon slots (+ default Remix component)
const iconDefaults = objectLiteralDefaults(iconsSf, "defaultIcons")
const iconSlots = iconsSf
  .getInterfaceOrThrow("DataTableIcons")
  .getProperties()
  .map((p) => ({
    name: p.getName(),
    type: "IconComponent",
    required: true,
    default: iconDefaults[p.getName()]?.getText() ?? null,
    description: describe(p),
  }))

// --- Instance refs (table.dataTable.refs = DataTableRefs)
const tableRefs = membersOf(typesSf.getInterfaceOrThrow("DataTableRefs"))

// --- slotProps parts (DataTableSlots): the element each one reaches and the
// context a function form receives.
const slotParts = typesSf
  .getInterfaceOrThrow("DataTableSlots")
  .getProperties()
  .map((p) => {
    const text = oneLine(p.getTypeNode().getText())
    const element = text.match(/ComponentProps<"(\w+)">/)?.[1]
    const ctx = text.match(/WithTable<\s*TData,\s*\{(.*)\}\s*>/)?.[1]
    const keys = ctx
      ? [...ctx.matchAll(/(\w+)(\?)?:/g)].map((m) => m[1] + (m[2] ?? ""))
      : []
    return {
      name: p.getName(),
      type: `<${element}> props · { ${[...keys, "table"].join(", ")} }`,
      required: false,
      default: null,
      description: describe(p),
    }
  })

// --- Structural `data-slot` attributes (scanned from the component source so
// the list can't drift). Descriptions are curated here since the source can't
// supply them.
const SLOT_DESCRIPTIONS = {
  "data-table": "Outermost wrapper element.",
  "data-table-surface": "The scroll container for the table (both axes).",
  "data-table-motion-layer":
    "Invisible overlay inside the surface where row enter and leave animations play (only when animations are on).",
  "data-table-leave-copy":
    "Copy of a removed row that fades out inside `data-table-motion-layer` (only when animations are on).",
  "data-table-sort-indicator":
    "The sort arrow in a column header; it turns around for descending order.",
  "data-table-selected-count":
    'The "N selected" text in the selection alert banner.',
  "data-table-selected-count-previous":
    "Short-lived copy of the previous selected count that fades out over the new one (only when animations are on).",
  "data-table-progress":
    "Indeterminate progress bar shown while loading or saving.",
  "data-table-progress-bar": "The moving bar inside `data-table-progress`.",
  "data-table-infinite-sentinel":
    "Invisible marker after the last row; infinite scroll loads more when it nears the viewport.",
  "data-table-infinite-loader":
    "Loading-more indicator shown while infinite scroll fetches the next rows.",
  "data-table-toolbar": "Top toolbar root.",
  "data-table-toolbar-actions":
    "Internal actions cluster (search, filters, density, full screen, …).",
  "data-table-alert-banner": "Selection alert banner.",
  "data-table-bottom-toolbar":
    "Bottom toolbar (custom actions and/or pagination).",
  "data-table-pagination": "Pagination controls.",
  "data-table-create-row": 'Inline create row (createDisplayMode: "row").',
  "data-table-drag-preview":
    "Floating preview of a row dragged inside a DataTableDndProvider.",
}
const slotValues = new Set()
// data-slot markers live in .tsx files spread across the feature subfolders, so
// walk the tree rather than just the top level.
function walkTsx(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkTsx(abs))
    else if (entry.name.endsWith(".tsx")) out.push(abs)
  }
  return out
}
for (const file of walkTsx(DT)) {
  const text = readFileSync(file, "utf8")
  for (const m of text.matchAll(/data-slot="(data-table[^"]*)"/g)) {
    slotValues.add(m[1])
  }
}
const slots = [...slotValues].sort().map((name) => ({
  name,
  type: "",
  required: true,
  default: null,
  description: SLOT_DESCRIPTIONS[name] ?? "",
}))

const banner =
  "// AUTO-GENERATED by apps/web/scripts/build-api-docs.mjs — do not edit by hand.\n" +
  "// Regenerate with `pnpm --filter shadcn-react-table-web api:build`.\n\n"

const body =
  `export interface ApiMember {\n` +
  `  name: string\n` +
  `  type: string\n` +
  `  required: boolean\n` +
  `  default: string | null\n` +
  `  description: string\n` +
  `}\n\n` +
  [
    ["useDataTableOptions", useDataTableOptions],
    ["columnOptions", columnOptions],
    ["dataTableOptions", dataTableOptions],
    ["tableMethods", tableMethods],
    ["dataTableProps", dataTableProps],
    ["localizationKeys", localizationKeys],
    ["iconSlots", iconSlots],
    ["tableRefs", tableRefs],
    ["slots", slots],
    ["slotParts", slotParts],
  ]
    .map(
      ([name, rows]) =>
        `export const ${name}: ApiMember[] = ${JSON.stringify(rows, null, 2)}\n`
    )
    .join("\n")

// Every documented member needs a description, so a new option cannot ship
// without one. Localization keys are exempt: their table shows each key's
// English text, which says what it is.
const undocumented = [
  ["useDataTable option", useDataTableOptions],
  ["column option", columnOptions],
  ["dataTable member", dataTableOptions],
  ["table method", tableMethods],
  ["DataTable prop", dataTableProps],
  ["icon slot", iconSlots],
  ["ref", tableRefs],
  ["data-slot", slots],
  ["slotProps part", slotParts],
].flatMap(([kind, rows]) =>
  rows.filter((row) => !row.description).map((row) => `${kind} ${row.name}`)
)
if (undocumented.length > 0) {
  console.error(
    `api reference: ${undocumented.length} without a description ` +
      `(add a JSDoc comment, or a SLOT_DESCRIPTIONS entry):\n  ` +
      undocumented.join("\n  ")
  )
  process.exit(1)
}

mkdirSync(dirname(OUT), { recursive: true })
// Normalize CRLF that JSON.stringify escaped into the string literals when
// the source was checked out with Windows line endings (git autocrlf), so
// the artifact is identical on every machine.
const raw = (banner + body).replaceAll("\\r\\n", "\\n")
// Run the repo's Prettier over the output so `pnpm format` is a no-op on the
// artifact — otherwise CI's freshness check trips on formatting alone.
const prettierConfig = await prettier.resolveConfig(OUT)
const formatted = await prettier.format(raw, {
  ...prettierConfig,
  filepath: OUT,
})
writeFileSync(OUT, formatted)

console.log(
  `api reference built → apps/web/lib/api-reference.generated.ts ` +
    `(options ${useDataTableOptions.length}, column ${columnOptions.length}, ` +
    `dataTable ${dataTableOptions.length}, methods ${tableMethods.length}, ` +
    `props ${dataTableProps.length}, ` +
    `localization ${localizationKeys.length}, icons ${iconSlots.length}, ` +
    `refs ${tableRefs.length}, slots ${slots.length})`
)
