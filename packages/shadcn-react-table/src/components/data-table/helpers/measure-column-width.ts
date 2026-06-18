export interface MeasureColumnWidthOptions {
  /** CSS `font` shorthand read from a rendered cell (e.g. `getComputedStyle(cell).font`). */
  font: string
  /** Total horizontal cell padding (left + right) in px. */
  padding: number
  /** Extra space for header affordances (sort icon, actions trigger). Default 0. */
  extraWidth?: number
  /** Lower bound for the result. Default 0. */
  minWidth?: number
  /** Upper bound, to stop one long value producing an absurd column. Default 400. */
  maxWidth?: number
}

// A single reused canvas keeps text measurement off the DOM (no reflow) and
// avoids allocating a canvas per call.
let sharedCtx: CanvasRenderingContext2D | null | undefined

function getContext(): CanvasRenderingContext2D | null {
  if (sharedCtx !== undefined) return sharedCtx
  if (typeof document === "undefined") {
    sharedCtx = null
    return null
  }
  sharedCtx = document.createElement("canvas").getContext("2d")
  return sharedCtx
}

/**
 * Measure the width a column needs to fit its widest value without wrapping.
 *
 * Pure + framework-free: canvas text measurement means it covers the full
 * dataset (not just the rows currently rendered under virtualization), at the
 * cost of not accounting for custom cell markup — it measures the raw string
 * values the caller passes in. Falls back to a rough character estimate when no
 * canvas is available (non-browser environments).
 */
export function measureColumnWidth(
  values: string[],
  headerText: string,
  options: MeasureColumnWidthOptions
): number {
  const { font, padding, extraWidth = 0, minWidth = 0, maxWidth = 400 } = options
  const ctx = getContext()

  let contentWidth: number
  if (ctx) {
    ctx.font = font
    contentWidth = ctx.measureText(headerText).width
    for (const value of values) {
      const width = ctx.measureText(value).width
      if (width > contentWidth) contentWidth = width
    }
  } else {
    // ~8px per character is a coarse fallback for non-browser environments.
    const longest = values.reduce(
      (max, v) => (v.length > max ? v.length : max),
      headerText.length
    )
    contentWidth = longest * 8
  }

  const total = Math.ceil(contentWidth + padding + extraWidth)
  return Math.max(minWidth, Math.min(maxWidth, total))
}
