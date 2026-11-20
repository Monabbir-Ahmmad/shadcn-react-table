import { act, cleanup, render } from "@testing-library/react"
import * as React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import type { DataTableInstance } from "./types"
import { useDataTable } from "./use-data-table"

/** IntersectionObserver stand-in (jsdom has none) that records what it watches. */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  callback: IntersectionObserverCallback
  observed = new Set<Element>()

  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb
    MockIntersectionObserver.instances.push(this)
  }
  observe(el: Element) {
    this.observed.add(el)
  }
  unobserve(el: Element) {
    this.observed.delete(el)
  }
  disconnect() {
    this.observed.clear()
  }
  takeRecords() {
    return []
  }
}

/** Marks the sentinel visible through every observer currently watching it. */
function scrollSentinelIntoView(container: HTMLElement) {
  const sentinel = container.querySelector(
    '[data-slot="data-table-infinite-sentinel"]'
  )
  expect(sentinel).not.toBeNull()
  const watching = MockIntersectionObserver.instances.filter((o) =>
    o.observed.has(sentinel!)
  )
  expect(watching.length).toBeGreaterThan(0)
  act(() => {
    for (const observer of watching) {
      observer.callback(
        [
          {
            isIntersecting: true,
            target: sentinel,
          } as IntersectionObserverEntry,
        ],
        observer as unknown as IntersectionObserver
      )
    }
  })
}

beforeEach(() => {
  MockIntersectionObserver.instances = []
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

type Person = { id: string; name: string }

const firstPage: Person[] = [
  { id: "1", name: "Mason" },
  { id: "2", name: "Lily" },
]

const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
]

function Harness({
  data,
  onLoadMore,
  onTable,
}: {
  data: Person[]
  onLoadMore: () => void
  onTable?: (table: DataTableInstance<Person>) => void
}) {
  const table = useDataTable<Person>({
    data,
    columns,
    getRowId: (row) => row.id,
    enableInfiniteScroll: true,
    hasNextPage: true,
    isFetchingNextPage: false,
    onLoadMore,
  })
  onTable?.(table)
  return <DataTable table={table} />
}

describe("DataTable — infinite scroll sentinel", () => {
  it("loads more when the rows are there on the first render", () => {
    const onLoadMore = vi.fn()
    const { container } = render(
      <Harness data={firstPage} onLoadMore={onLoadMore} />
    )
    scrollSentinelIntoView(container)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it("loads more when the rows arrive after an empty first render", () => {
    const onLoadMore = vi.fn()
    const { container, rerender } = render(
      <Harness data={[]} onLoadMore={onLoadMore} />
    )
    rerender(<Harness data={firstPage} onLoadMore={onLoadMore} />)
    scrollSentinelIntoView(container)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it("loads more when the rows are cleared and come back", () => {
    const onLoadMore = vi.fn()
    const { container, rerender } = render(
      <Harness data={firstPage} onLoadMore={onLoadMore} />
    )
    rerender(<Harness data={[]} onLoadMore={onLoadMore} />)
    rerender(<Harness data={firstPage} onLoadMore={onLoadMore} />)
    scrollSentinelIntoView(container)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it("loads more when the table's own filter hides every row, then clears", () => {
    const onLoadMore = vi.fn()
    let table!: DataTableInstance<Person>
    const { container } = render(
      <Harness
        data={firstPage}
        onLoadMore={onLoadMore}
        onTable={(t) => (table = t)}
      />
    )
    act(() => table.setGlobalFilter("no such name"))
    act(() => table.setGlobalFilter(""))
    scrollSentinelIntoView(container)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })
})
