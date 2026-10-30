import { describe, expect, it, vi } from "vitest"

import { copyAnnouncement, copyLabel, copyText } from "./use-copy"

describe("copyText", () => {
  it("writes a string and reports copied", async () => {
    const writeText = vi.fn(async () => {})
    expect(await copyText("npx shadcn add", { writeText })).toBe("copied")
    expect(writeText).toHaveBeenCalledWith("npx shadcn add")
  })

  it("writes a string synchronously, inside the click", () => {
    const writeText = vi.fn(async () => {})
    void copyText("now", { writeText })
    expect(writeText).toHaveBeenCalledWith("now")
  })

  it("awaits a function source before writing", async () => {
    const writeText = vi.fn(async () => {})
    const result = await copyText(async () => "# Page", { writeText })
    expect(result).toBe("copied")
    expect(writeText).toHaveBeenCalledWith("# Page")
  })

  it("fails without a clipboard API", async () => {
    expect(await copyText("x", undefined)).toBe("failed")
    expect(
      await copyText("x", {} as unknown as Parameters<typeof copyText>[1])
    ).toBe("failed")
  })

  it("fails when the write is refused", async () => {
    const writeText = vi.fn(async () => {
      throw new DOMException("denied", "NotAllowedError")
    })
    expect(await copyText("x", { writeText })).toBe("failed")
  })

  it("fails when fetching the text fails, without writing", async () => {
    const writeText = vi.fn(async () => {})
    const result = await copyText(
      async () => {
        throw new Error("404")
      },
      { writeText }
    )
    expect(result).toBe("failed")
    expect(writeText).not.toHaveBeenCalled()
  })
})

describe("copy labels", () => {
  it("shows the idle text, then Copied or Couldn't copy", () => {
    expect(copyLabel("idle")).toBe("Copy")
    expect(copyLabel("idle", "Copy page")).toBe("Copy page")
    expect(copyLabel("copied", "Copy page")).toBe("Copied")
    expect(copyLabel("failed")).toBe("Couldn't copy")
  })

  it("announces only a result", () => {
    expect(copyAnnouncement("idle")).toBe("")
    expect(copyAnnouncement("copied")).toMatch(/Copied/)
    expect(copyAnnouncement("failed")).toMatch(/Couldn't copy/)
  })
})
