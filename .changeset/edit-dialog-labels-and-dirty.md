---
"@monabbir/shadcn-react-table": patch
---

**Fixed:** In the edit dialog, each label is now tied to its field (clicking a label focuses the field), and a click outside the dialog no longer throws away changes you've made — Cancel and Escape still close it. With nothing changed, an outside click closes it as before.
