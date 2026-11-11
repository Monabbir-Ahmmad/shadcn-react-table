---
"@monabbir/shadcn-react-table": patch
---

**Fixed:** A custom `cell` on the grouped column now gets `renderedCellValue` in its group rows too, so a cell like `<Badge>{renderedCellValue}</Badge>` shows the group's value there instead of an empty badge.
