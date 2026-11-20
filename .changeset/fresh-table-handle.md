---
"@monabbir/shadcn-react-table": minor
---

**Changed:** `useDataTable` returns a new `table` object on every render, over the same table underneath, so a component compiled by React Compiler now shows new data and options instead of keeping the old rows on screen. An effect or memo that lists `table` as a dependency now runs on every render: depend on the values it reads instead. Don't spread `table`, since its fields are read through the prototype. A row drop's `table` and `over.table` are still the `table` your latest render got.
