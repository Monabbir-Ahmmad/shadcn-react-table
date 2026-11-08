---
"@monabbir/shadcn-react-table": patch
---

**Fixed:** a group row's cells in columns with nothing to aggregate stay empty (or show the column's `renderAggregatedCell`), instead of repeating the values of the group's first row.
