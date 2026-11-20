---
"@monabbir/shadcn-react-table": patch
---

**Fixed:** Infinite scroll now calls `onLoadMore` when the rows arrive after the first render, as with `useInfiniteQuery`, and when they come back after a search, a filter or a new query showed no row.
