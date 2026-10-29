"use client"

import * as React from "react"
import Link from "next/link"
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react"

import { Button } from "@workspace/ui/components/button"

import { ProofSection, Wrappable } from "@/components/home/proof/proof-section"
import { SITE_URL } from "@/lib/site"

const PROMPT = `Install shadcn-react-table in my app: ${SITE_URL}/SKILL.md`

const LINES = [
  {
    label: "Skill",
    value: "npx skills add Monabbir-Ahmmad/shadcn-react-table",
  },
  { label: "MCP", value: "pnpm dlx shadcn@latest mcp init --client claude" },
  { label: "Docs", value: `${SITE_URL}/llms.txt` },
]

/** The one-line agent prompt, plus the skill, MCP and docs index. */
export function ForAgents() {
  const [copied, setCopied] = React.useState(false)

  const copy = () => {
    void navigator.clipboard
      ?.writeText(PROMPT)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      })
      .catch(() => {})
  }

  return (
    <ProofSection
      id="agents"
      index="09"
      label="For coding agents"
      title="Paste one line into your agent."
      lead="The skill teaches your agent the install, the API and the patterns, so it builds the table the way the docs do."
    >
      <div className="flex items-start gap-4 border bg-background p-4 font-mono text-sm">
        <span aria-hidden className="text-primary select-none">
          ›
        </span>
        <p className="min-w-0 flex-1 break-words">
          <Wrappable text={PROMPT} />
        </p>
        <Button
          variant="outline"
          size="xs"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy the agent prompt"}
          className="shrink-0"
        >
          {copied ? (
            <RiCheckLine data-icon="inline-start" className="text-primary" />
          ) : (
            <RiFileCopyLine data-icon="inline-start" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <dl className="mt-6 border-b">
        {LINES.map((line) => (
          <div
            key={line.label}
            className="grid grid-cols-[4rem_minmax(0,1fr)] items-baseline gap-4 border-t py-3"
          >
            <dt className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
              {line.label}
            </dt>
            <dd className="font-mono text-xs break-words">
              <Wrappable text={line.value} />
            </dd>
          </div>
        ))}
      </dl>
      <Link
        href="/docs/ai"
        className="mt-4 inline-block font-mono text-xs underline-offset-4 transition-colors hover:text-primary hover:underline"
      >
        AI agent setup →
      </Link>
    </ProofSection>
  )
}
