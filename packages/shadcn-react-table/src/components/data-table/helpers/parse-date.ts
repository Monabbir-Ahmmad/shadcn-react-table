const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Parses a cell or filter value as a Date, or null when blank or invalid.
 * A date-only string (`"2025-01-10"`) is that calendar day at local midnight;
 * `new Date()` would read it as UTC midnight, the previous day west of UTC.
 */
export function parseDate(value: unknown): Date | null {
  if (value == null || value === "") return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === "string") {
    const match = DATE_ONLY.exec(value.trim())
    if (match) {
      const [, y, m, d] = match.map(Number) as [number, number, number, number]
      const date = new Date(y, m - 1, d)
      // Reject overflow such as Feb 30, which Date would roll into March.
      return date.getMonth() === m - 1 && date.getDate() === d ? date : null
    }
  }
  if (typeof value !== "string" && typeof value !== "number") return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
