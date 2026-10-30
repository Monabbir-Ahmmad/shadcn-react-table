/** One feature of a table part, with the options that turn it on. */
export type Feature = { name: string; options: string[]; href: string }

/** One part of the table in the home page features section. */
export type FeaturePart = {
  id: "toolbar" | "header" | "rows" | "cells" | "footer"
  title: string
  /** The slotProps key for this part. */
  slot: string
  features: Feature[]
}

export const FEATURES: FeaturePart[] = [
  {
    id: "toolbar",
    title: "Toolbar",
    slot: "slotProps.topToolbar",
    features: [
      {
        name: "Global search with fuzzy ranking",
        options: ["enableGlobalFilter", "globalFilterFn"],
        href: "/docs/guides/global-search",
      },
      {
        name: "Faceted filters",
        options: ["enableFacetedValues"],
        href: "/docs/guides/column-filtering",
      },
      {
        name: "Export to CSV, Excel and PDF",
        options: ["renderTopToolbarCustomActions"],
        href: "/docs/guides/export",
      },
      {
        name: "Density and full screen",
        options: ["enableDensityToggle", "enableFullscreenToggle"],
        href: "/docs/guides/density",
      },
    ],
  },
  {
    id: "header",
    title: "Header",
    slot: "slotProps.headCell",
    features: [
      {
        name: "Sorting, multi-sort",
        options: ["enableSorting", "enableMultiSort"],
        href: "/docs/guides/sorting",
      },
      {
        name: "Filter modes per column",
        options: ["enableColumnFilterModes", "columnFilterDisplayMode"],
        href: "/docs/guides/filter-modes",
      },
      {
        name: "Reorder, resize, pin",
        options: [
          "enableColumnOrdering",
          "enableColumnResizing",
          "enableColumnPinning",
        ],
        href: "/docs/guides/column-pinning",
      },
      {
        name: "Column menu",
        options: ["renderColumnActionsMenuItems"],
        href: "/docs/guides/column-visibility",
      },
    ],
  },
  {
    id: "rows",
    title: "Rows",
    slot: "slotProps.bodyRow",
    features: [
      {
        name: "Selection, shift-click ranges",
        options: ["enableRowSelection", "enableBatchRowSelection"],
        href: "/docs/guides/row-selection",
      },
      {
        name: "Pinned rows that stay in view",
        options: ["enableRowPinning", "rowPinningDisplayMode"],
        href: "/docs/guides/row-pinning",
      },
      {
        name: "Drag rows between tables",
        options: ["enableRowDragging", "onRowDragEnd"],
        href: "/docs/guides/row-dragging",
      },
      {
        name: "Detail panels and tree data",
        options: ["renderDetailPanel", "getSubRows"],
        href: "/docs/guides/detail-panel",
      },
    ],
  },
  {
    id: "cells",
    title: "Cells",
    slot: "slotProps.bodyCell",
    features: [
      {
        name: "Edit a cell, a row, the table or in a dialog",
        options: ["enableEditing", "editDisplayMode"],
        href: "/docs/guides/editing",
      },
      {
        name: "Cell actions menu",
        options: ["enableCellActions"],
        href: "/docs/guides/cell-actions",
      },
      {
        name: "Grouping with several aggregations",
        options: ["enableGrouping", "aggregationFn"],
        href: "/docs/guides/grouping",
      },
    ],
  },
  {
    id: "footer",
    title: "Footer and body",
    slot: "slotProps.bottomToolbar",
    features: [
      {
        name: "Pagination, client or server",
        options: ["enablePagination", "manualPagination"],
        href: "/docs/guides/pagination",
      },
      {
        name: "Virtualized rows and columns",
        options: ["enableRowVirtualization", "enableColumnVirtualization"],
        href: "/docs/guides/virtualization",
      },
      {
        name: "Keyboard grid, screen-reader labels",
        options: ["enableKeyboardNavigation"],
        href: "/docs/guides/accessibility",
      },
    ],
  },
]
