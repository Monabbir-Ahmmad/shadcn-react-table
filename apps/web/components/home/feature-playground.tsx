"use client"

import * as React from "react"

import {
  DataTable,
  useDataTable,
} from "@monabbir/shadcn-react-table/components/data-table"
import { cn } from "@workspace/ui/lib/utils"

import { userColumns } from "@/components/examples/columns"
import { makeUsers, type User } from "@/lib/example-data"
import {
  DEFAULT_PLAYGROUND,
  playgroundCode,
  playgroundOptions,
  type PlaygroundConfig,
} from "@/lib/playground"

import { Reveal } from "./reveal"

const DATA = makeUsers(200)

type Choice = {
  [K in keyof PlaygroundConfig]: {
    key: K
    label: string
    options: readonly PlaygroundConfig[K][]
  }
}[keyof PlaygroundConfig]

const SWITCHES: Choice[] = [
  { key: "rowSelection", label: "Row selection", options: [false, true] },
  { key: "grouping", label: "Grouping", options: [false, true] },
  { key: "columnPinning", label: "Column pinning", options: [false, true] },
  { key: "rowPinning", label: "Row pinning", options: [false, true] },
  {
    key: "editing",
    label: "Editing",
    options: ["off", "cell", "row", "modal"],
  },
  { key: "filters", label: "Filters", options: ["subheader", "popover"] },
  {
    key: "density",
    label: "Density",
    options: ["compact", "comfortable", "spacious"],
  },
  { key: "virtualization", label: "Virtualization", options: [false, true] },
]

/** The live table for one configuration (remounted when it changes). */
function PlaygroundTable({ config }: { config: PlaygroundConfig }) {
  const columns = React.useMemo(() => userColumns(), [])
  const [data, setData] = React.useState(DATA)
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    onEditingCellSave: ({ row, column, value }) =>
      setData((prev) =>
        prev.map((u) =>
          u.id === row.id ? ({ ...u, [column.id]: value } as User) : u
        )
      ),
    onEditingRowSave: ({ row, values, exit }) => {
      setData((prev) =>
        prev.map((u) =>
          u.id === row.id ? { ...u, ...(values as Partial<User>) } : u
        )
      )
      exit()
    },
    ...playgroundOptions(config),
  })
  return <DataTable table={table} />
}

/** Copies the generated code. */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        // clipboard is undefined on insecure origins.
        void navigator.clipboard
          ?.writeText(text)
          .then(() => {
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
          })
          .catch(() => {})
      }}
      className="rounded-md border bg-background px-2 py-1 text-xs transition-colors hover:bg-muted"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

/** Switches on the left, the live table (or its code) on the right. */
export function FeaturePlayground() {
  const [config, setConfig] = React.useState(DEFAULT_PLAYGROUND)
  const [view, setView] = React.useState<"preview" | "code">("preview")
  const code = playgroundCode(config)
  return (
    <Reveal className="border-y bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Turn features on and see the code
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Every switch is one option on the same hook.
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-[16rem_1fr]">
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
            {SWITCHES.map((s) => (
              <fieldset key={s.key} className="flex flex-col gap-1.5">
                <legend className="mb-1.5 text-xs font-medium">
                  {s.label}
                </legend>
                <div className="flex flex-wrap gap-1">
                  {s.options.map((option) => {
                    const selected = config[s.key] === option
                    return (
                      <button
                        key={String(option)}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          setConfig((c) => ({ ...c, [s.key]: option }))
                        }
                        className={cn(
                          "rounded-md border px-2 py-1 text-xs capitalize transition-colors",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        {option === true
                          ? "On"
                          : option === false
                            ? "Off"
                            : String(option)}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ))}
          </div>
          <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-2">
              <div role="group" aria-label="Playground view" className="flex">
                {(["preview", "code"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={view === v}
                    onClick={() => setView(v)}
                    className={cn(
                      "-mb-px border-b-2 px-3 py-2 text-xs font-medium capitalize",
                      view === v
                        ? "border-primary"
                        : "border-transparent text-muted-foreground"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {view === "code" ? <CopyButton text={code} /> : null}
            </div>
            <div className="p-3">
              {/* Both views stay mounted so edits survive a switch. */}
              <div hidden={view !== "preview"}>
                <PlaygroundTable key={JSON.stringify(config)} config={config} />
              </div>
              <pre
                hidden={view !== "code"}
                className="overflow-x-auto p-2 font-mono text-sm"
              >
                {code}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  )
}
