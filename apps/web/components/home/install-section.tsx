"use client"

import * as React from "react"
import Link from "next/link"
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { Step, Steps } from "@/components/docs/steps"
import { INSTALL_COMMAND } from "@/lib/site"

import { Reveal } from "./reveal"

const SNIPPET = `import { DataTable, useDataTable } from "@/components/ui/data-table"

function Users({ data, columns }) {
  const table = useDataTable({ data, columns })
  return <DataTable table={table} />
}`

/**
 * The "start in seconds" section: three steps — add the block, build a table,
 * make it yours.
 */
export function InstallSection() {
  return (
    <Reveal className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Drop it in with the shadcn CLI
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          One command installs the table source, the primitives it uses in your
          style, and its dependencies.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <Steps>
          <Step title="Add the block">
            <CommandBlock />
          </Step>
          <Step title="Build a table">
            <pre className="overflow-x-auto rounded-lg border bg-card p-4 text-[13px] leading-relaxed">
              <code className="font-mono">{SNIPPET}</code>
            </pre>
          </Step>
          <Step title="Make it yours">
            <p className="text-sm text-muted-foreground">
              The source lives in your project, so edit it in place — restyle
              it, change a behavior, or delete what you do not use.
            </p>
          </Step>
        </Steps>
      </div>

      <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link href="/docs/installation">Read the installation guide →</Link>
        </Button>
      </div>
    </Reveal>
  )
}

function CommandBlock() {
  const [copied, setCopied] = React.useState(false)

  const copy = () => {
    void navigator.clipboard.writeText(INSTALL_COMMAND).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="flex flex-col rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
        <span className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
          Terminal
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={copied ? "Copied" : "Copy install command"}
          onClick={copy}
        >
          {copied ? (
            <RiCheckLine className={cn("text-primary")} />
          ) : (
            <RiFileCopyLine />
          )}
        </Button>
      </div>
      <div className="flex-1 overflow-x-auto p-4">
        <code className="font-mono text-[13px] leading-relaxed whitespace-pre">
          <span className="text-muted-foreground select-none">$ </span>
          {INSTALL_COMMAND}
        </code>
      </div>
    </div>
  )
}
