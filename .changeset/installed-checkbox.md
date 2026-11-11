---
"@monabbir/shadcn-react-table": minor
---

**Changed:** Row selection now uses your installed shadcn `Checkbox`, so it looks and animates exactly like the other checkboxes in your app (the table's own drawn-in tick is gone). Single-row selection (`enableMultiRowSelection: false`) shows checkboxes too instead of radio buttons: checking a row unchecks the one before it. If you query the row controls by role, use `checkbox` instead of `radio`.
