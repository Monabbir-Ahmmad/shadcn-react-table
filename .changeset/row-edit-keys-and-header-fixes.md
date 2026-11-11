---
"@monabbir/shadcn-react-table": patch
---

**Fixed:** In row edit mode, Enter now saves the row and Escape cancels it (both did nothing), and the row's Save button is disabled while a field fails validation, as in the edit dialog. Enter also saves the edit dialog. The keyboard focus outline on a body cell is now drawn inside the cell, so the cells around it no longer cover it. A sortable column's header is now named by its label for screen readers, with the sort action as its description, instead of "Sort by … ascending" or "Clear sort". The line between a sticky header or footer and the body now stays in place while the rows scroll under it.
