"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import { EXAMPLES } from "@/components/examples/registry"
import { EXAMPLE_SOURCE } from "@/lib/example-source.generated"

const GITHUB_SRC =
  "https://github.com/Monabbir-Ahmmad/shadcn-react-table/blob/main/apps/web/components/examples/registry.tsx"

/**
 * Embeds a live example from the shared registry by slug, with a Live/Code
 * toggle. The "Code" tab shows the example's source (extracted at build time by
 * scripts/build-example-source.mjs) with copy-to-clipboard and a GitHub link.
 */
export function Example({ slug }: { slug: string }) {
  const example = EXAMPLES.find((e) => e.slug === slug)
  const [tab, setTab] = React.useState<"preview" | "code">("preview")
  const [copied, setCopied] = React.useState(false)

  if (!example) {
    return (
      <div className="my-6 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        Unknown example: <code className="font-mono">{slug}</code>
      </div>
    )
  }

  const Component = example.Component
  const source = EXAMPLE_SOURCE[slug]

  const copy = () => {
    if (!source) return
    void navigator.clipboard.writeText(source).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="my-6 overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-1.5">
        <span className="text-xs font-medium">{example.title}</span>
        <div className="flex items-center gap-1">
          {source && (
            <div
              role="tablist"
              aria-label="Example view"
              className="flex items-center rounded-md border bg-background p-0.5"
            >
              <TabButton
                active={tab === "preview"}
                onClick={() => setTab("preview")}
              >
                Preview
              </TabButton>
              <TabButton active={tab === "code"} onClick={() => setTab("code")}>
                Code
              </TabButton>
            </div>
          )}
          {source && tab === "code" && (
            <button
              type="button"
              onClick={copy}
              className="rounded-md border bg-background px-2 py-1 text-xs font-medium transition-colors hover:bg-muted"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
          <a
            href={GITHUB_SRC}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border bg-background px-2 py-1 text-xs font-medium transition-colors hover:bg-muted"
            aria-label="View example source on GitHub"
          >
            GitHub
          </a>
        </div>
      </div>

      {tab === "preview" || !source ? (
        <div className="p-4">
          <Component />
        </div>
      ) : (
        <pre className="max-h-[28rem] overflow-auto bg-muted/30 p-4 text-sm">
          <code className="font-mono text-[13px] leading-relaxed">{source}</code>
        </pre>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded px-2 py-0.5 text-xs font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
