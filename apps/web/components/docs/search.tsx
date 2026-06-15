"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { RiSearchLine } from "@remixicon/react"

import { Button } from "@monabbir/tablecn/components/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@monabbir/tablecn/components/command"

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

interface PagefindSubResult {
  title: string
  url: string
  excerpt: string
}
interface PagefindResultData {
  url: string
  excerpt: string
  meta: { title?: string }
  sub_results?: PagefindSubResult[]
}
interface Pagefind {
  search: (
    query: string
  ) => Promise<{ results: { data: () => Promise<PagefindResultData> }[] }>
}

/**
 * Loads the Pagefind runtime from the static export at build-relative
 * `/pagefind/pagefind.js`. The indirect `import()` keeps the bundler from trying
 * to resolve it (it only exists after `pnpm search:build`), so dev — where there
 * is no index — degrades to an empty result set instead of erroring.
 */
function loadPagefind(): Promise<Pagefind> {
  const url = `${BASE_PATH}/pagefind/pagefind.js`
  return new Function("u", "return import(u)")(url) as Promise<Pagefind>
}

/**
 * Normalize Pagefind's stored url to a base-path-relative app route.
 *
 * Pagefind derives the url from the built HTML, which embeds the full
 * base-path-prefixed route (e.g. `/tablecn/docs/guides/toolbar`). `router.push`
 * prepends the base path itself, so we strip any leading base path here to avoid
 * doubling it (`/tablecn/tablecn/…`).
 */
function toHref(url: string): string {
  let path = url.replace(/\.html$/, "")
  if (BASE_PATH && path.startsWith(BASE_PATH)) {
    path = path.slice(BASE_PATH.length) || "/"
  }
  return path
}

export function DocsSearch() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<PagefindResultData[]>([])
  const pagefindRef = React.useRef<Pagefind | null>(null)

  // ⌘K / Ctrl+K opens the dialog.
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  // Debounced search; Pagefind is loaded once on first query.
  React.useEffect(() => {
    let cancelled = false
    const handle = setTimeout(async () => {
      if (!query) {
        if (!cancelled) setResults([])
        return
      }
      try {
        if (!pagefindRef.current) pagefindRef.current = await loadPagefind()
        const search = await pagefindRef.current.search(query)
        const data = await Promise.all(
          search.results.slice(0, 8).map((r) => r.data())
        )
        if (!cancelled) setResults(data)
      } catch {
        // No index available (e.g. `next dev`) — show nothing.
        if (!cancelled) setResults([])
      }
    }, 150)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [query])

  const onSelect = (url: string) => {
    setOpen(false)
    setQuery("")
    router.push(toHref(url))
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 text-muted-foreground"
        aria-label="Search documentation"
      >
        <RiSearchLine className="size-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search documentation"
        description="Search the tablecn docs"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search documentation…"
          />
          <CommandList>
            <CommandEmpty>
              {query ? "No results found." : "Type to search the docs."}
            </CommandEmpty>
            {results.map((result) => (
              <CommandItem
                key={result.url}
                value={result.url}
                onSelect={() => onSelect(result.url)}
                className="flex flex-col items-start gap-1"
              >
                <span className="text-sm font-medium">
                  {result.meta.title ?? "Untitled"}
                </span>
                <span
                  className="line-clamp-2 text-xs text-muted-foreground [&_mark]:bg-transparent [&_mark]:font-medium [&_mark]:text-foreground"
                  dangerouslySetInnerHTML={{ __html: result.excerpt }}
                />
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
