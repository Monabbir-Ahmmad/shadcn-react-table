---
"@monabbir/shadcn-react-table": patch
---

**Changed:** The table no longer forces its own look over your shadcn styles. Column headers take your `TableHead` typography instead of small uppercase muted text; the search box, filter inputs, edit fields and badges keep your input and badge styling; the selection checkbox matches the stock shadcn checkbox size, corners and border; and a selected row uses shadcn's `muted` row color (a shade deeper on hover) instead of a strong primary tint. The selected row's accent bar now sits on the outer edge in right-to-left tables too.
