# Guides

One page per feature, each with live examples you can copy.

## Getting started

- [Updating](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/updating): shadcn add copies this block's source into your project — after that, the code is yours, and upstream releases don't reach it automatically.
- [Migrating from MRT](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/migrating-from-mrt): The data table follows Material React Table (MRT) closely: the same hook-then-component shape, most of the same options, and the same TanStack Table underneath.

## Filtering & search

- [Column filtering](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/column-filtering): Each column can expose its own filter control in a per-column filter row.
- [Filter modes](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/filter-modes): Filter modes let users change how a column's filter is applied — for example matching with Contains, Starts with, Equals, Between, Greater than, or Empty.
- [Global search](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/global-search): An expandable global search box appears in the toolbar by default (enableGlobalFilter: true).
- [Advanced filter](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/advanced-filter): Set enableAdvancedFilter: true to add a toolbar button that opens a dialog where users build compound filter rules — multiple conditions joined by All (AND) or Any (OR) logic.

## Columns

- [Column visibility](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/column-visibility): A "Columns" toggle in the toolbar lets users show or hide columns.
- [Column ordering](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/column-ordering): Set enableColumnOrdering: true to add a drag grip to each header.
- [Column pinning](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/column-pinning): Set enableColumnPinning: true to let users pin columns left or right from the column-actions menu.
- [Column resizing](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/column-resizing): Set enableColumnResizing: true to add a drag handle on each column's edge.

## Rows

- [Row selection](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/row-selection): Set enableRowSelection: true to add a leading checkbox column.
- [Row ordering](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/row-ordering): Set enableRowOrdering: true to add a drag-handle column for drag-and-drop row reordering.
- [Row dragging](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/row-dragging): Rows can be dragged out of a table — onto another table, or onto a drop zone of your own — with the pointer, touch or the keyboard.
- [Row pinning](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/row-pinning): Set enableRowPinning: true to add a pin toggle inside the row-number column.
- [Row numbers](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/row-numbers): Set enableRowNumbers: true to add a leading row-number column to the table.

## Sorting, grouping & expanding

- [Sorting](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/sorting): Sorting is on by default.
- [Grouping & aggregation](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/grouping): Set enableGrouping: true to let users group rows by a column.
- [Detail panel](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/detail-panel): Provide renderDetailPanel to render an expandable panel beneath each row.
- [Tree data](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/tree): For hierarchical data, provide TanStack Table's getSubRows to tell the table where each row's children live.

## Editing & actions

- [Editing](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/editing): Set enableEditing: true to make rows editable, then choose how editing is presented with editDisplayMode.
- [Row actions](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/row-actions): Provide renderRowActions to add a trailing actions column.
- [Cell actions](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/cell-actions): Cells can have a right-click menu.
- [Event listeners](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/event-listeners): The data table exposes click handlers for rows and cells so you can react to user interaction.

## Display & customization

- [Density](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/density): Density controls the vertical padding of table rows.
- [Animations](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/animations): The table animates rows, detail panels and a few controls so changes are easy to follow.
- [Sticky header & footer](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/sticky): The header row (enableStickyHeader, default true) sticks to the top of the scroll surface.
- [Toolbar customization](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/toolbar): The table renders a top toolbar (title slot + your actions on the left, an icon-action cluster on the right) and a bottom toolbar (pagination).
- [Part props (slotProps)](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/slot-props): Every part of the table — the scroll surface, rows, cells, toolbars, the search box, edit fields and more — accepts extra props through the slotProps option.
- [Display columns](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/display-columns): Some features add columns of their own: row selection, the expand toggle, row actions, row numbers, row pinning and the row drag handle.
- [Composition](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/composition): <DataTable /> lays out the whole table for you.
- [Display modes](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/display-modes): Several features expose a *DisplayMode option that changes _how_ the UI is presented without changing the underlying behavior.
- [Table refs](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/refs): The table instance exposes DOM refs to its structural elements on table.dataTable.refs.
- [Theming](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/theming): The data table is style-agnostic.
- [Custom icons](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/custom-icons): Every glyph is a named slot.
- [Localization](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/localization): The table ships in 38 languages.
- [Right-to-left](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/rtl): The table supports right-to-left languages such as Arabic, Hebrew and Persian.

## Data & performance

- [Loading state](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/loading): Pass isLoading: true to render skeleton rows and a progress bar in place of the data.
- [Server-side data](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/server-side): When your data lives on a server, hand pagination, sorting, and filtering off to it.
- [Production-ready tables](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/production-ready): A table over a real API: data fetched with React Query, paging, sorting and search done on the server, the table's state kept in one hook, and edits saved through a mutation.
- [Pagination](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/pagination): The table pages its rows by default, ten to a page, with a page-size menu and first / previous / next / last buttons below the rows.
- [Infinite scroll](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/infinite-scroll): Infinite scroll loads more rows as the user scrolls toward the bottom, instead of paging through the data.
- [Virtualization](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/virtualization): Virtualization renders only the cells currently in view, keeping large tables fast.
- [Row height](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/row-height): By default rows size to their content (and the virtualizer measures them).
- [Export](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/export): The table ships no built-in export — the same stance as Material React Table — so the block carries no CSV or spreadsheet dependencies.
- [State management](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/state): The data table keeps all of its state in TanStack Table's store: the standard table state (sorting, filters, selection…) and its own UI state (density, editing, filter modes…).
- [Best practices](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/best-practices): A few habits keep tables fast, typed and easy to change.
- [Accessibility & keyboard](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/accessibility): The table is built to be used without a mouse and with a screen reader.
