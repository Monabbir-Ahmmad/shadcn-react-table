---
"@monabbir/shadcn-react-table": patch
---

**Fixed:** Keyboard focus no longer drops to the page when the control you used goes away or turns off: clearing a column filter keeps focus in the filter, "Clear selection" moves it to the select-all checkbox, "Hide column" moves it to the next column's menu button, and paging onto the first or last page moves it to the nearest page button that still works.
