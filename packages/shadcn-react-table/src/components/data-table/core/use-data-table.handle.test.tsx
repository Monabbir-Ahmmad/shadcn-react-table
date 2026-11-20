import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { toCallerTable, toStableInstance } from "../helpers/stable-instance"
import { useDataTable } from "./use-data-table"

const columns = [{ accessorKey: "name", header: "Name" }]

function setup() {
  return renderHook(
    ({ data }: { data: { name: string }[] }) => useDataTable({ columns, data }),
    { initialProps: { data: [{ name: "a" }] } }
  )
}

describe("useDataTable — the returned handle", () => {
  it("is a new object on every render", () => {
    const { result, rerender } = setup()
    const first = result.current
    rerender({ data: [{ name: "b" }] })
    expect(result.current).not.toBe(first)
  })

  it("wraps the same instance on every render", () => {
    const { result, rerender } = setup()
    const first = toStableInstance(result.current)
    rerender({ data: [{ name: "b" }] })
    expect(toStableInstance(result.current)).toBe(first)
  })

  it("reads the latest data and state through the handle", () => {
    const { result, rerender } = setup()
    rerender({ data: [{ name: "b" }, { name: "c" }] })
    expect(result.current.getRowModel().rows).toHaveLength(2)
    act(() => result.current.setDensity("compact"))
    expect(result.current.getState().density).toBe("compact")
  })

  it("keeps the methods and config of the instance", () => {
    const { result } = setup()
    expect(typeof result.current.setGlobalFilter).toBe("function")
    expect(result.current.dataTable).toBe(
      toStableInstance(result.current).dataTable
    )
  })
})

describe("toStableInstance / toCallerTable", () => {
  it("returns an object that is not a handle as it is", () => {
    const table = {}
    expect(toStableInstance(table)).toBe(table)
    expect(toCallerTable(table)).toBe(table)
  })

  it("maps the instance back to the caller's latest handle", () => {
    const { result, rerender } = setup()
    rerender({ data: [{ name: "b" }] })
    const instance = toStableInstance(result.current)
    expect(toCallerTable(instance)).toBe(result.current)
  })
})
