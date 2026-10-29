import {
  RiCodeSSlashLine,
  RiEditBoxLine,
  RiFilter3Line,
  RiLayoutColumnLine,
  RiPaletteLine,
  RiRocket2Line,
  RiSortDesc,
  RiSpeedUpLine,
  RiTableLine,
  type RemixiconComponentType,
} from "@remixicon/react"

export interface DocsNavItem {
  title: string
  href: string
  /** Shown as a badge in the sidebar (pages added in 1.0). */
  badge?: "New"
}

export interface DocsNavGroup {
  title: string
  /** Icon for the group in the sidebar, cards and breadcrumbs. */
  icon: RemixiconComponentType
  items: DocsNavItem[]
}

/**
 * Single source of truth for the docs sidebar + ordering. Each `href` maps to
 * an `app/(site)/docs/.../page.mdx` route.
 */
export const docsNav: DocsNavGroup[] = [
  {
    title: "Getting started",
    icon: RiRocket2Line,
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "AI agent setup", href: "/docs/ai", badge: "New" },
      { title: "Quick start", href: "/docs/quick-start" },
      { title: "Usage", href: "/docs/usage" },
      { title: "Updating", href: "/docs/guides/updating" },
      {
        title: "Migrating from MRT",
        href: "/docs/guides/migrating-from-mrt",
        badge: "New",
      },
    ],
  },
  {
    title: "Filtering & search",
    icon: RiFilter3Line,
    items: [
      { title: "Column filtering", href: "/docs/guides/column-filtering" },
      { title: "Filter modes", href: "/docs/guides/filter-modes" },
      { title: "Global search", href: "/docs/guides/global-search" },
      { title: "Advanced filter", href: "/docs/guides/advanced-filter" },
    ],
  },
  {
    title: "Columns",
    icon: RiLayoutColumnLine,
    items: [
      { title: "Column visibility", href: "/docs/guides/column-visibility" },
      { title: "Column ordering", href: "/docs/guides/column-ordering" },
      { title: "Column pinning", href: "/docs/guides/column-pinning" },
      { title: "Column resizing", href: "/docs/guides/column-resizing" },
    ],
  },
  {
    title: "Rows",
    icon: RiTableLine,
    items: [
      { title: "Row selection", href: "/docs/guides/row-selection" },
      { title: "Row ordering", href: "/docs/guides/row-ordering" },
      {
        title: "Row dragging",
        href: "/docs/guides/row-dragging",
        badge: "New",
      },
      { title: "Row pinning", href: "/docs/guides/row-pinning" },
      { title: "Row numbers", href: "/docs/guides/row-numbers" },
    ],
  },
  {
    title: "Sorting, grouping & expanding",
    icon: RiSortDesc,
    items: [
      { title: "Sorting", href: "/docs/guides/sorting" },
      { title: "Grouping & aggregation", href: "/docs/guides/grouping" },
      { title: "Detail panel", href: "/docs/guides/detail-panel" },
      { title: "Tree data", href: "/docs/guides/tree" },
    ],
  },
  {
    title: "Editing & actions",
    icon: RiEditBoxLine,
    items: [
      { title: "Editing", href: "/docs/guides/editing" },
      { title: "Row actions", href: "/docs/guides/row-actions" },
      { title: "Cell actions", href: "/docs/guides/cell-actions" },
      { title: "Event listeners", href: "/docs/guides/event-listeners" },
    ],
  },
  {
    title: "Display & customization",
    icon: RiPaletteLine,
    items: [
      { title: "Density", href: "/docs/guides/density" },
      { title: "Sticky header & footer", href: "/docs/guides/sticky" },
      { title: "Toolbar customization", href: "/docs/guides/toolbar" },
      {
        title: "Part props (slotProps)",
        href: "/docs/guides/slot-props",
        badge: "New",
      },
      {
        title: "Display columns",
        href: "/docs/guides/display-columns",
        badge: "New",
      },
      { title: "Composition", href: "/docs/guides/composition", badge: "New" },
      { title: "Display modes", href: "/docs/guides/display-modes" },
      { title: "Table refs", href: "/docs/guides/refs" },
      { title: "Theming", href: "/docs/guides/theming" },
      { title: "Custom icons", href: "/docs/guides/custom-icons" },
      { title: "Localization", href: "/docs/guides/localization" },
      { title: "Right-to-left", href: "/docs/guides/rtl" },
    ],
  },
  {
    title: "Data & performance",
    icon: RiSpeedUpLine,
    items: [
      { title: "Loading state", href: "/docs/guides/loading" },
      { title: "Server-side data", href: "/docs/guides/server-side" },
      {
        title: "Production-ready tables",
        href: "/docs/guides/production-ready",
        badge: "New",
      },
      { title: "Pagination", href: "/docs/guides/pagination", badge: "New" },
      { title: "Infinite scroll", href: "/docs/guides/infinite-scroll" },
      { title: "Virtualization", href: "/docs/guides/virtualization" },
      { title: "Row height", href: "/docs/guides/row-height" },
      { title: "Export", href: "/docs/guides/export" },
      { title: "State management", href: "/docs/guides/state" },
      {
        title: "Best practices",
        href: "/docs/guides/best-practices",
        badge: "New",
      },
      {
        title: "Accessibility & keyboard",
        href: "/docs/guides/accessibility",
        badge: "New",
      },
    ],
  },
  {
    title: "API reference",
    icon: RiCodeSSlashLine,
    items: [
      { title: "useDataTable options", href: "/docs/api/use-data-table" },
      { title: "Column options", href: "/docs/api/column-options" },
      { title: "DataTable props", href: "/docs/api/data-table-props" },
      { title: "Table instance", href: "/docs/api/table-instance" },
      { title: "Localization", href: "/docs/api/localization" },
      { title: "Icons", href: "/docs/api/icons" },
    ],
  },
]

/** Flattened, in-order list for prev/next navigation. */
export const docsFlatNav: DocsNavItem[] = docsNav.flatMap((g) => g.items)

/**
 * Strip a trailing slash so route matching works both in dev and under the
 * GitHub Pages export (`trailingSlash: true`), where `usePathname()` returns
 * e.g. `/docs/guides/column-resizing/` but nav hrefs have no trailing slash.
 */
export function normalizeDocsPath(path: string): string {
  return path.replace(/\/+$/, "") || "/"
}
