# Accessibility & keyboard

The table is built to be used without a mouse and with a screen reader. Its parts are checked with [axe](https://github.com/dequelabs/axe-core) in a real browser in CI.

## The grid

With `enableKeyboardNavigation` (on by default) the table is an ARIA grid: one Tab stop for the whole body, `aria-rowcount` / `aria-colcount` for the full data (also when rows or columns are virtualized), and `aria-rowindex` / `aria-colindex` on every row and cell. Turn it off and the table is a plain `<table>`.

| Keys | What they do |
| --- | --- |
| Arrow keys | Move between cells (left and right are mirrored in right-to-left tables) |
| Home / End | First / last cell in the row |
| Ctrl + Home / Ctrl + End | First / last cell in the table |
| Page Up / Page Down | Up / down a screenful of rows |
| Enter or F2 | Activate the cell: open its editor, toggle its checkbox, follow its link |
| Ctrl + C (Cmd + C) | Copy the focused cell's text |
| Escape | Cancel an edit; leave full screen |

Rows and columns that aren't rendered (virtualization) are scrolled into view as you reach them. Focus comes back to the same cell after an edit is saved or cancelled, and to the nearest cell when its row is deleted.

## Headers and controls

- Sort buttons report `aria-sort`; menus, filters and toggles are real buttons with names from `localization`.
- **Resize a column** from the keyboard: Tab to its handle (a separator that announces the width), then the arrow keys (10px, or 50px with Shift), Home / End for the limits, Enter to fit.
- **Reorder** columns and rows from the keyboard: focus the drag handle, Space to pick it up, the arrow keys to move, Space to drop, Escape to cancel. Each step is announced in the table's language, naming columns by their label and rows by their position.
- The columns the table adds itself (selection, actions, expand, row pin, drag) have names for screen readers even when they show no header text.

## State changes

- Selecting rows updates a polite status banner; loading is announced the same way.
- Full screen is a modal dialog: focus stays inside, the page doesn't scroll behind it, and Escape leaves it with focus still in the table.
- Single selection uses radio buttons, multiple selection checkboxes (with a mixed state for "some selected").

## Motion and language

- The progress bar and the column-drag slide respect "reduce motion".
- 38 languages, right-to-left included (see [Localization](/docs/guides/localization) and [Right-to-left](/docs/guides/rtl)); numbers and dates follow the language.

## What you can do

- Give each table a name with `slotProps: { table: { "aria-label": "People" } }` (a `title` shows above the table but doesn't name the grid).
- Keep custom `cell` renderers keyboard-friendly: Enter activates the first focusable control in a cell.
- Check your own colors: contrast comes from your theme, so it isn't part of the table's checks.

## Related

<Cards>
  <Card href="/docs/guides/row-selection" title="Row selection" />
  <Card href="/docs/guides/column-resizing" title="Column resizing" />
  <Card href="/docs/guides/column-ordering" title="Column ordering" />
</Cards>
