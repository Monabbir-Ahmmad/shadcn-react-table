import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useInfiniteScroll } from "./use-infinite-scroll"

/**
 * Controllable IntersectionObserver stand-in (jsdom has none). Each instance
 * records its callback + init so a test can drive intersection changes.
 */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  callback: IntersectionObserverCallback
  options?: IntersectionObserverInit
  observed = new Set<Element>()

  constructor(
    cb: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    this.callback = cb
    this.options = options
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
  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    )
  }
}

function latestObserver() {
  const { instances } = MockIntersectionObserver
  return instances[instances.length - 1]!
}

beforeEach(() => {
  MockIntersectionObserver.instances = []
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

type Props = Parameters<typeof useInfiniteScroll>[0]

function setup(overrides: Partial<Props> = {}) {
  const onLoadMore = vi.fn()
  const scrollRef = { current: document.createElement("div") }
  const sentinelRef = { current: document.createElement("div") }
  const base: Props = {
    enabled: true,
    hasNextPage: true,
    isFetchingNextPage: false,
    onLoadMore,
    scrollRef,
    sentinelRef,
    ...overrides,
  }
  const view = renderHook((props: Props) => useInfiniteScroll(props), {
    initialProps: base,
  })
  const rerenderWith = (partial: Partial<Props>) =>
    view.rerender({ ...base, ...partial })
  return { onLoadMore, view, rerenderWith }
}

describe("useInfiniteScroll", () => {
  it("calls onLoadMore when the sentinel intersects", () => {
    const { onLoadMore } = setup()
    act(() => latestObserver().trigger(true))
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it("does not call onLoadMore when hasNextPage is false", () => {
    const { onLoadMore } = setup({ hasNextPage: false })
    act(() => latestObserver().trigger(true))
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it("does not call onLoadMore while a fetch is in flight", () => {
    const { onLoadMore } = setup({ isFetchingNextPage: true })
    act(() => latestObserver().trigger(true))
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it("does not observe at all when disabled", () => {
    setup({ enabled: false })
    expect(MockIntersectionObserver.instances).toHaveLength(0)
  })

  it("does not call onLoadMore when the sentinel is not intersecting", () => {
    const { onLoadMore } = setup()
    act(() => latestObserver().trigger(false))
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it("calls onLoadMore again after a fetch cycle while still intersecting", () => {
    const { onLoadMore, rerenderWith } = setup()

    act(() => latestObserver().trigger(true))
    expect(onLoadMore).toHaveBeenCalledTimes(1)

    // Consumer starts fetching, then finishes — sentinel still intersecting.
    act(() => rerenderWith({ isFetchingNextPage: true }))
    act(() => rerenderWith({ isFetchingNextPage: false }))
    expect(onLoadMore).toHaveBeenCalledTimes(2)
  })

  it("passes the threshold through as the observer rootMargin", () => {
    setup({ threshold: 300 })
    expect(latestObserver().options?.rootMargin).toContain("300px")
  })
})
