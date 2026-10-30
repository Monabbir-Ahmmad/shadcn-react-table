"use client"

import * as React from "react"

export type CopyState = "idle" | "copied" | "failed"

/** The text to copy, or a function that fetches it (say, a page's Markdown). */
export type CopySource = string | (() => Promise<string>)

type Clipboard = Pick<globalThis.Clipboard, "writeText">

/**
 * Writes `source` to the clipboard and says how it went: "failed" when there
 * is no clipboard API (an insecure context, an old browser), when fetching the
 * text fails, or when the browser refuses the write. Never throws. A string is
 * written synchronously, inside the click that asked for it, as Safari needs.
 */
export async function copyText(
  source: CopySource,
  clipboard: Clipboard | undefined = globalThis.navigator?.clipboard
): Promise<Exclude<CopyState, "idle">> {
  if (typeof clipboard?.writeText !== "function") return "failed"
  try {
    const text = typeof source === "string" ? source : await source()
    await clipboard.writeText(text)
    return "copied"
  } catch {
    return "failed"
  }
}

/** A copy button's label: its idle text, then "Copied" or "Couldn't copy". */
export function copyLabel(state: CopyState, idle = "Copy"): string {
  if (state === "copied") return "Copied"
  if (state === "failed") return "Couldn't copy"
  return idle
}

/** What a polite live region says after a copy ("" while idle). */
export function copyAnnouncement(state: CopyState): string {
  if (state === "copied") return "Copied to the clipboard"
  if (state === "failed") return "Couldn't copy to the clipboard"
  return ""
}

/**
 * Copy-to-clipboard for a button: `copy(text)` writes it and sets `state` to
 * "copied" or "failed" for `timeout` ms, then back to "idle". Pair it with
 * `<CopyStatus state={state} />` so screen readers hear the result.
 */
export function useCopy(timeout = 1500) {
  const [state, setState] = React.useState<CopyState>("idle")
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const copy = React.useCallback(
    async (source: CopySource) => {
      const result = await copyText(source)
      clearTimeout(timer.current)
      setState(result)
      timer.current = setTimeout(() => setState("idle"), timeout)
    },
    [timeout]
  )

  return { state, copy }
}
