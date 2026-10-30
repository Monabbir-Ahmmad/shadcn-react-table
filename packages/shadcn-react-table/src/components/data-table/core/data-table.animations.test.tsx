import type * as React from "react"
import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DataTable } from "./data-table"
import { useDataTable } from "./use-data-table"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

type Row = { id: string; name: string }
const data: Row[] = [
  { id: "1", name: "Ada" },
  { id: "2", name: "Alan" },
]

function Harness({
  enableAnimations,
  style,
}: {
  enableAnimations?: boolean
  style?: React.CSSProperties
}) {
  const table = useDataTable<Row>({
    data,
    columns: [{ accessorKey: "name", header: "Name" }],
    getRowId: (r) => r.id,
    enableAnimations,
  })
  return <DataTable table={table} style={style} />
}

const root = () => document.querySelector('[data-slot="data-table"]')!
const layer = () =>
  document.querySelector('[data-slot="data-table-motion-layer"]')

describe("enableAnimations", () => {
  it("is on by default", () => {
    render(<Harness />)
    expect(root().hasAttribute("data-animations")).toBe(true)
    expect(layer()).not.toBeNull()
    expect(
      (root() as HTMLElement).style.getPropertyValue("--dt-motion-duration")
    ).toBe("280ms")
  })

  it("lets the consumer retime the motion", () => {
    render(
      <Harness
        style={{ "--dt-motion-duration": "500ms" } as React.CSSProperties}
      />
    )
    expect(
      (root() as HTMLElement).style.getPropertyValue("--dt-motion-duration")
    ).toBe("500ms")
  })

  it("can be turned off", () => {
    render(<Harness enableAnimations={false} />)
    expect(root().hasAttribute("data-animations")).toBe(false)
    expect(layer()).toBeNull()
  })

  it("is off when the user prefers reduced motion", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addEventListener() {},
      removeEventListener() {},
    }))
    render(<Harness />)
    expect(root().hasAttribute("data-animations")).toBe(false)
  })
})
