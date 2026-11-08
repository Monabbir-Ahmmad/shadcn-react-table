---
"@monabbir/shadcn-react-table": minor
---

**New:** `DataTableFacetFilter`, a toolbar filter button — single or multi choice, dashed while empty, naming the pick in a badge — that reads and writes the table's `columnFilters` by id, so a filter needs no visible column (a derived bucket, "raised by me"). Options default to the column's `meta.filterSelectOptions`; per-option `counts` and a controlled `value` / `onValueChange` mode are optional. `DataTableResetFilters` clears every column filter and renders nothing while none is set. Two new localization strings, `facetFilterAny` and `resetFilters`, in every bundled locale.
