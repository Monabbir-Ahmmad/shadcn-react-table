import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useControllableState } from "./use-controllable-state"

describe("useControllableState", () => {
  it("chains functional updates queued in the same tick (uncontrolled)", () => {
    const { result } = renderHook(() =>
      useControllableState<number>(undefined, 0)
    )

    act(() => {
      const [, setValue] = result.current
      setValue((prev) => prev + 1)
      setValue((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(2)
  })

  it("chains functional updates in controlled mode via onChange", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useControllableState<number>(5, 0, onChange)
    )

    act(() => {
      const [, setValue] = result.current
      setValue((prev) => prev + 1)
      setValue((prev) => prev + 1)
    })

    expect(onChange).toHaveBeenNthCalledWith(1, 6)
    expect(onChange).toHaveBeenNthCalledWith(2, 7)
  })

  it("stays controlled: internal state never takes over", () => {
    const { result, rerender } = renderHook(
      ({ controlled }) => useControllableState<number>(controlled, 0),
      { initialProps: { controlled: 5 } }
    )

    act(() => {
      result.current[1](99)
    })
    expect(result.current[0]).toBe(5)

    rerender({ controlled: 7 })
    expect(result.current[0]).toBe(7)
  })

  it("resolves against an externally-updated controlled value", () => {
    const onChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ controlled }) => useControllableState<number>(controlled, 0, onChange),
      { initialProps: { controlled: 5 } }
    )

    rerender({ controlled: 10 })
    act(() => {
      result.current[1]((prev) => prev + 1)
    })

    expect(onChange).toHaveBeenCalledWith(11)
  })

  it("fires onChange for plain updates in uncontrolled mode", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useControllableState<string>(undefined, "a", onChange)
    )

    act(() => {
      result.current[1]("b")
    })

    expect(result.current[0]).toBe("b")
    expect(onChange).toHaveBeenCalledWith("b")
  })
})
