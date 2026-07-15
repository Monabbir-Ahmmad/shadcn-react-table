# Changelog

The version applies to the registry block: `/r/data-table.json` carries it
in `meta.version`. After installing, record the version you received —
see the [updating guide](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/updating).

## 0.2.0

- **Breaking:** removed the built-in export feature — `enableExport`,
  `exportFileName`, `exportToCsv` / `exportToExcel`, `DataTableExportMenu`,
  the `export` / `exportCsv` / `exportExcel` localization strings, and the
  `export` / `fileCsv` / `fileExcel` icons — along with the `papaparse` and
  `xlsx` dependencies. MRT ships no OOTB export either; the export guide now
  documents a bring-your-own recipe built on the table state model.

## 0.1.0

- CSV and Excel export engines (`papaparse`, `xlsx`) now load on demand
  instead of shipping in the initial bundle.
- CSV export neutralizes formula injection: string cells starting with
  `=`, `+`, `-`, `@`, tab, or CR are prefixed with `'`.
- `exportToCsv` / `exportToExcel` are now async (`Promise<void>`).
- Fixed `useControllableState` so functional updates queued in the same
  React batch chain correctly instead of overwriting each other.
- The registry item now carries its version in `meta.version`.
