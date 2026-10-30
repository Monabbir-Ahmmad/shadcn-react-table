# Localization

The table ships in 38 languages. English is built in, and each of the other 37 is an optional registry item you install only when you need it. Every user-facing string can also be overridden one by one with the `localization` option.

Example (`localization`):

```tsx
function LocalizationExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    localization: SPANISH,
    initialState: { showColumnFilters: true, pagination: { pageSize: 10 } },
  })
  return <DataTable table={table} />
}
```

## Install a language

Add the language after the table. Each one is its own registry item, named `data-table-locale-<code>`:

```bash
pnpm dlx shadcn@latest add https://monabbir-ahmmad.github.io/shadcn-react-table/r/data-table-locale-de.json
```

It writes one file, `components/ui/data-table/locales/de.ts`, and adds no npm packages. Install as many languages as you like.

## Use it on one table

```tsx
import { DataTable, useDataTable } from "@/components/ui/data-table"
import { dataTableLocalizationDe } from "@/components/ui/data-table/locales/de"

const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  localization: dataTableLocalizationDe,
})

return <DataTable table={table} />
```

## Use it app-wide

To set the language for many tables at once, wrap a subtree in `DataTableConfigProvider`. A `localization` option on a single table still overrides the provider.

```tsx
import { DataTableConfigProvider } from "@/components/ui/data-table"
import { dataTableLocalizationDe } from "@/components/ui/data-table/locales/de"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DataTableConfigProvider localization={dataTableLocalizationDe}>
      {children}
    </DataTableConfigProvider>
  )
}
```

Example (`config-provider`):

```tsx
function ConfigProviderShell() {
  // App-wide strings and icons for every table below the provider.
  return (
    <DataTableConfigProvider
      localization={{ search: "Find", noRecordsToDisplay: "Nothing here" }}
      icons={{ search: RiSearch2Line }}
    >
      <ConfigProviderExample />
    </DataTableConfigProvider>
  )
}
```

## Change single strings

A language is a plain object, so spread it and replace only the keys you want. Define the object outside the component: a new object on every render rebuilds the columns.

```tsx
const localization = {
  ...dataTableLocalizationDe,
  rowsPerPage: "Einträge pro Seite",
}

function PeopleTable() {
  const table = useDataTable({ data, columns, localization })
  return <DataTable table={table} />
}
```

> **Partial overrides:** Without a language file you only need the keys you want to change — everything
>   else falls back to the built-in English. Function-valued entries, such as
>   `paginationRange: (start, end, total) => ...`, build a label from the current
>   values.

## Numbers and dates

Dates follow the localization's `language`: date filters and the date picker show dates, month names and weekday names in that language, always in the Gregorian calendar. Every language file sets `language` for you. If you write your own localization, set `language` to a BCP 47 tag such as `"es"`.

Numbers do not follow `language`. Each language file formats its own numbers inside its function keys (for example `1,000` in English and `1.000` in German). A custom localization that only sets `language` keeps English number formatting, so call `toLocaleString` with your tag in the function keys yourself:

```tsx
rowsSelected: (selected, total) =>
  `${selected.toLocaleString("es")} de ${total.toLocaleString("es")} filas seleccionadas`,
```

Numbers and dates come from the runtime's `Intl` data, so the server and the browser can differ slightly for some languages.

## Available languages

| Language              | Code         | Export                          |
| --------------------- | ------------ | ------------------------------- |
| English (built in)    | `en`         | `defaultLocalization`           |
| Arabic                | `ar`         | `dataTableLocalizationAr`       |
| Azerbaijani           | `az`         | `dataTableLocalizationAz`       |
| Bulgarian             | `bg`         | `dataTableLocalizationBg`       |
| Czech                 | `cs`         | `dataTableLocalizationCs`       |
| Danish                | `da`         | `dataTableLocalizationDa`       |
| German                | `de`         | `dataTableLocalizationDe`       |
| Greek                 | `el`         | `dataTableLocalizationEl`       |
| Spanish               | `es`         | `dataTableLocalizationEs`       |
| Estonian              | `et`         | `dataTableLocalizationEt`       |
| Persian               | `fa`         | `dataTableLocalizationFa`       |
| Finnish               | `fi`         | `dataTableLocalizationFi`       |
| French                | `fr`         | `dataTableLocalizationFr`       |
| Hebrew                | `he`         | `dataTableLocalizationHe`       |
| Croatian              | `hr`         | `dataTableLocalizationHr`       |
| Hungarian             | `hu`         | `dataTableLocalizationHu`       |
| Armenian              | `hy`         | `dataTableLocalizationHy`       |
| Indonesian            | `id`         | `dataTableLocalizationId`       |
| Italian               | `it`         | `dataTableLocalizationIt`       |
| Japanese              | `ja`         | `dataTableLocalizationJa`       |
| Korean                | `ko`         | `dataTableLocalizationKo`       |
| Nepali                | `ne`         | `dataTableLocalizationNe`       |
| Dutch                 | `nl`         | `dataTableLocalizationNl`       |
| Norwegian             | `no`         | `dataTableLocalizationNo`       |
| Polish                | `pl`         | `dataTableLocalizationPl`       |
| Portuguese            | `pt`         | `dataTableLocalizationPt`       |
| Portuguese (Brazil)   | `pt-BR`      | `dataTableLocalizationPtBR`     |
| Romanian              | `ro`         | `dataTableLocalizationRo`       |
| Russian               | `ru`         | `dataTableLocalizationRu`       |
| Slovak                | `sk`         | `dataTableLocalizationSk`       |
| Serbian (Cyrillic)    | `sr-Cyrl-RS` | `dataTableLocalizationSrCyrlRS` |
| Serbian (Latin)       | `sr-Latn-RS` | `dataTableLocalizationSrLatnRS` |
| Swedish               | `sv`         | `dataTableLocalizationSv`       |
| Turkish               | `tr`         | `dataTableLocalizationTr`       |
| Ukrainian             | `uk`         | `dataTableLocalizationUk`       |
| Vietnamese            | `vi`         | `dataTableLocalizationVi`       |
| Chinese (Simplified)  | `zh-Hans`    | `dataTableLocalizationZhHans`   |
| Chinese (Traditional) | `zh-Hant`    | `dataTableLocalizationZhHant`   |

## Translation quality

The translations are adapted from [Material React Table](https://www.material-react-table.com) (MIT License, Copyright (c) 2022 Kevin Vandy). Strings that Material React Table does not have were added here, and those lines are marked `// needs review` in the file: a native speaker has not checked them yet.

To fix one, edit the file in your project (it is your copy) and delete the comment. To fix it for everyone, send a pull request against the matching file under `packages/shadcn-react-table/src/components/data-table/locales/`.

## Related

- [Localization key reference](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/localization): Every user-facing string flows through a localization table.
- [Custom icons](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/custom-icons): Every glyph is a named slot.
- [useDataTable options](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/use-data-table): useDataTable(options) accepts everything TanStack's TableOptions accepts (controlled state, on*Change, manual* flags, getRowId, getSubRows, initialState, …; column pinning in state/initialState keeps the left/right shape) plus the data-table options below.
