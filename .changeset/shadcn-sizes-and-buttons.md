---
"@monabbir/shadcn-react-table": patch
---

**Changed:** Every control in the table is now your installed shadcn component at one of its own sizes and variants, with no look of the table's own on top. Toolbar buttons use `size="icon"` (the same height as the search box), header and row buttons `size="icon-xs"`, and pagination `size="icon-sm"`; an active toggle, filter or pinned row shows as the `secondary` variant instead of a custom color. Filter fields, edit fields and the advanced filter's fields keep your input and select height. The expand, expand-all, group-row, row-pin and filter-mode buttons are now shadcn `Button`s (the expand buttons were 16px tap targets). Header rows, the empty-state row and the create row no longer turn off or replace your `TableRow` hover and colors.
