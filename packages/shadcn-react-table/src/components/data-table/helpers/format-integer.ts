/** A whole number in the language's own digits (Persian `۱۲`, Nepali `१२`),
 *  without thousands separators, for compact counters such as page buttons
 *  and row numbers. */
export function formatInteger(value: number, language: string): string {
  return value.toLocaleString(language, { useGrouping: false })
}
