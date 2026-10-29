"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

/** What the last command did, for the bar's status line. */
export type CommandStatus =
  | { kind: "idle" }
  | { kind: "busy"; text: string }
  | { kind: "done"; text: string }
  | { kind: "miss"; input: string; suggestions: string[] }

function Chip({
  children,
  onClick,
}: {
  children: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-dashed px-2 py-1 font-mono text-xs text-muted-foreground transition-colors outline-none hover:border-solid hover:border-foreground/40 hover:text-foreground focus-visible:border-solid focus-visible:border-ring focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      {children}
    </button>
  )
}

/**
 * The command input: Enter runs what was typed (and clears it when the table
 * understood), ↑/↓ walk back through earlier commands, chips run examples.
 * The status line under it is a live region, so results are announced.
 */
export function CommandBar({
  onRun,
  status,
  examples,
  statusId,
}: {
  /** Runs a command; false when it wasn't understood. */
  onRun: (text: string) => boolean
  status: CommandStatus
  examples: string[]
  /** Bumped per result, so a repeated message is announced again. */
  statusId: number
}) {
  const [value, setValue] = React.useState("")
  const history = React.useRef<string[]>([])
  const cursor = React.useRef(-1)
  const inputId = React.useId()
  const hintId = React.useId()

  const run = (text: string) => {
    const command = text.trim()
    if (!command) return false
    if (history.current.at(-1) !== command) history.current.push(command)
    cursor.current = -1
    return onRun(command)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const past = history.current
    if (event.key === "ArrowUp" && past.length) {
      event.preventDefault()
      cursor.current =
        cursor.current < 0 ? past.length - 1 : Math.max(0, cursor.current - 1)
      setValue(past[cursor.current]!)
    } else if (event.key === "ArrowDown" && cursor.current >= 0) {
      event.preventDefault()
      cursor.current += 1
      if (cursor.current >= past.length) {
        cursor.current = -1
        setValue("")
      } else setValue(past[cursor.current]!)
    } else if (event.key === "Escape" && value) {
      event.preventDefault()
      cursor.current = -1
      setValue("")
    }
  }

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (run(value)) setValue("")
        }}
        className="group/bar flex h-14 items-center border bg-background shadow-xs transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30 md:h-16"
      >
        <label
          htmlFor={inputId}
          className="flex h-full shrink-0 items-center ps-4 pe-3 font-mono text-xl text-muted-foreground transition-colors group-focus-within/bar:text-foreground md:ps-5"
        >
          <span aria-hidden>›</span>
          <span className="sr-only">Command</span>
        </label>
        <input
          id={inputId}
          value={value}
          onChange={(event) => {
            cursor.current = -1
            setValue(event.target.value)
          }}
          onKeyDown={onKeyDown}
          placeholder="Tell the table what to do… try ‘group by department’"
          aria-describedby={hintId}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/80 md:text-lg"
        />
        <span
          aria-hidden
          className="me-3 hidden items-center gap-1.5 font-mono text-[11px] text-muted-foreground sm:flex md:me-4"
        >
          <kbd className="border px-1.5 py-0.5">↑</kbd>
          <kbd className="border px-1.5 py-0.5">Enter</kbd>
        </span>
      </form>
      <p id={hintId} className="sr-only">
        Press Enter to run. Up arrow recalls the last command.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="me-1.5 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
          Try
        </span>
        {examples.map((example) => (
          <Chip key={example} onClick={() => run(example)}>
            {example}
          </Chip>
        ))}
      </div>

      <div
        role="status"
        aria-live="polite"
        className="mt-4 flex min-h-8 items-center font-mono text-xs"
      >
        <StatusLine key={statusId} status={status} onRun={run} />
      </div>
    </div>
  )
}

function StatusLine({
  status,
  onRun,
}: {
  status: CommandStatus
  onRun: (text: string) => boolean
}) {
  if (status.kind === "idle") {
    return (
      <p className="text-muted-foreground">
        Runs in your browser: a small parser, no AI service.
      </p>
    )
  }
  if (status.kind === "miss") {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="me-1.5 text-foreground">
          Didn&apos;t catch that. Try:
        </span>
        {status.suggestions.map((suggestion) => (
          <Chip key={suggestion} onClick={() => onRun(suggestion)}>
            {suggestion}
          </Chip>
        ))}
      </div>
    )
  }
  return (
    <p className="flex items-center gap-2.5">
      <span
        aria-hidden
        className={cn(
          "h-px w-6",
          status.kind === "busy" ? "bg-border" : "bg-primary"
        )}
      />
      <span
        className={cn(
          status.kind === "busy" ? "text-muted-foreground" : "text-foreground"
        )}
      >
        {status.text}
      </span>
    </p>
  )
}
