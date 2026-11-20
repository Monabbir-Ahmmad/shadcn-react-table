import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { UserTable } from "../../../../test/react-compiler/user-table"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

describe("DataTable — under React Compiler", () => {
  it("runs the compiled component", () => {
    // Guards the setup: the fixture must go through the compiler, which
    // caches the `<DataTable>` element on `table`, or the tests below prove
    // nothing.
    expect(UserTable.toString()).toMatch(/\$\[\d+\] !== table/)
  })

  it("shows new data passed to a compiled component", () => {
    const { rerender } = render(
      <UserTable users={[{ id: "1", name: "Mason" }]} />
    )
    expect(screen.getByText("Mason")).toBeTruthy()

    rerender(<UserTable users={[{ id: "1", name: "Lily" }]} />)
    expect(screen.queryByText("Mason")).toBeNull()
    expect(screen.getByText("Lily")).toBeTruthy()
  })
})
