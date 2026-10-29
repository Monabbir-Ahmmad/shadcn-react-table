"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

/** The MDX `pre`: language label and a copy button over the code. */
export function CodeBlock({
  className,
  children,
  ...props
}: React.ComponentProps<"pre">) {
  const ref = React.useRef<HTMLPreElement>(null)
  const [copied, setCopied] = React.useState(false)
  const child = React.isValidElement<{ className?: string }>(children)
    ? children
    : null
  const language = /language-(\w+)/.exec(child?.props.className ?? "")?.[1]
  return (
    <div className="group relative my-6 overflow-hidden rounded-lg border bg-muted/40">
      <div className="flex items-center justify-between border-b px-4 py-1.5 text-xs text-muted-foreground">
        <span className="font-mono">{language ?? "text"}</span>
        <button
          type="button"
          onClick={() =>
            void navigator.clipboard
              .writeText(ref.current?.textContent ?? "")
              .then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              })
          }
          className="rounded px-2 py-0.5 font-medium hover:bg-muted hover:text-foreground"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        ref={ref}
        className={cn(
          "overflow-x-auto p-4 text-sm [&>code]:bg-transparent [&>code]:p-0",
          className
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  )
}
