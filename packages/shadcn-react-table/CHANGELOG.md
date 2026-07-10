# Changelog

The version applies to the registry block: `/r/data-table.json` carries it
in `meta.version`. After installing, record the version you received —
see the [updating guide](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/updating).

## 0.1.0

- CSV and Excel export engines (`papaparse`, `xlsx`) now load on demand
  instead of shipping in the initial bundle.
- CSV export neutralizes formula injection: string cells starting with
  `=`, `+`, `-`, `@`, tab, or CR are prefixed with `'`.
- `exportToCsv` / `exportToExcel` are now async (`Promise<void>`).
- Fixed `useControllableState` so functional updates queued in the same
  React batch chain correctly instead of overwriting each other.
- The registry item now carries its version in `meta.version`.
