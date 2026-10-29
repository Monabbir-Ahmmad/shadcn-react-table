export interface VirtualHeaderRun<H> {
  header: H
  /** Position of the run's first column in the rendered (virtual) columns. */
  start: number
  /** Number of adjacent rendered columns the run covers. */
  span: number
}

/**
 * Lays out one header row under column virtualization. Each header covers
 * `colSpan` leaf columns; this finds the header over each rendered column and
 * merges adjacent rendered columns under the same header into one run. A gap
 * in the rendered columns (skipped by the virtualizer) splits a run.
 */
export function getVirtualHeaderRuns<H extends { colSpan: number }>(
  headers: H[],
  virtualIndexes: number[]
): VirtualHeaderRun<H>[] {
  const owners: H[] = []
  for (const header of headers) {
    for (let i = 0; i < header.colSpan; i++) owners.push(header)
  }
  const runs: VirtualHeaderRun<H>[] = []
  virtualIndexes.forEach((index, position) => {
    const header = owners[index]
    if (!header) return
    const last = runs[runs.length - 1]
    if (
      last &&
      last.header === header &&
      virtualIndexes[position - 1] === index - 1
    ) {
      last.span++
    } else {
      runs.push({ header, start: position, span: 1 })
    }
  })
  return runs
}
