import Link from "next/link"

import { CopyButton } from "@/components/copy-button"
import { Step, Steps } from "@/components/docs/steps"
import { ProofSection, Wrappable } from "@/components/home/proof/proof-section"
import { INSTALL_COMMAND } from "@/lib/site"

const SNIPPET = `import { DataTable, useDataTable } from "@/components/ui/data-table"

function Users({ data, columns }) {
  const table = useDataTable({ data, columns })
  return <DataTable table={table} />
}`

/**
 * The install section: three steps — add the block, build a table, make it
 * yours.
 */
export function InstallSection() {
  return (
    <ProofSection
      id="install"
      index="04"
      label="Install"
      title="Three steps."
      lead="One command installs the table source, the primitives it uses in your style, and its dependencies."
    >
      <div className="[&>ol]:my-0">
        <Steps>
          <Step title="Add the block">
            <CommandBlock />
          </Step>
          <Step title="Build a table">
            <pre className="overflow-x-auto border bg-background p-4 text-[13px] leading-relaxed">
              <code className="font-mono">{SNIPPET}</code>
            </pre>
          </Step>
          <Step title="Make it yours">
            <p className="text-sm text-pretty text-muted-foreground">
              The source lives in your project, so edit it in place — restyle
              it, change a behavior, or delete what you do not use.
            </p>
          </Step>
        </Steps>
      </div>
      <Link
        href="/docs/installation"
        className="mt-8 inline-block font-mono text-xs underline-offset-4 transition-colors hover:text-primary hover:underline"
      >
        Installation guide →
      </Link>
    </ProofSection>
  )
}

/** The install command; only its copy button runs on the client. */
function CommandBlock() {
  return (
    <div className="flex items-start gap-4 border bg-background p-4 font-mono text-[13px] leading-relaxed">
      <code className="min-w-0 flex-1 break-words">
        <span className="text-muted-foreground select-none">$ </span>
        <Wrappable text={INSTALL_COMMAND} />
      </code>
      <CopyButton text={INSTALL_COMMAND} what="the install command" />
    </div>
  )
}
