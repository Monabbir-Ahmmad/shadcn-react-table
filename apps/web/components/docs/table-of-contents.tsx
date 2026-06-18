"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import { cn } from "@workspace/ui/lib/utils"

type TocEntry = { id: string; text: string }
type TocItem = TocEntry & { children: TocEntry[] }

function useTableOfContents(): { items: TocItem[]; activeId: string | null } {
  const pathname = usePathname()
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const article = document.querySelector("[data-docs-article]")
    if (!article) return

    const headings = Array.from(
      article.querySelectorAll<HTMLElement>("h2[id], h3[id]")
    )

    const built: TocItem[] = []
    for (const el of headings) {
      const entry: TocEntry = { id: el.id, text: el.textContent ?? "" }
      if (el.tagName === "H2") {
        built.push({ ...entry, children: [] })
      } else {
        const parent = built[built.length - 1]
        if (parent) {
          parent.children.push(entry)
        } else {
          built.push({ ...entry, children: [] })
        }
      }
    }
    setItems(built)

    const hash = window.location.hash.slice(1)
    setActiveId(hash || built[0]?.id || null)

    const onHashChange = () =>
      setActiveId(window.location.hash.slice(1) || null)
    window.addEventListener("hashchange", onHashChange)

    if (headings.length > 0) {
      // URL hash has priority on initial load — suppress the observer until
      // the user scrolls so its first sweep doesn't overwrite the hash.
      let hashPriority = !!window.location.hash.slice(1)
      const clearHashPriority = () => {
        hashPriority = false
      }
      window.addEventListener("scroll", clearHashPriority, { once: true })

      const observer = new IntersectionObserver(
        (entries) => {
          if (hashPriority) return
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          const first = visible[0]
          if (first) {
            setActiveId((first.target as HTMLElement).id)
          }
        },
        { rootMargin: "-57px 0% -85% 0%", threshold: 0 }
      )

      headings.forEach((h) => observer.observe(h))
      return () => {
        observer.disconnect()
        window.removeEventListener("hashchange", onHashChange)
        window.removeEventListener("scroll", clearHashPriority)
      }
    }

    return () => window.removeEventListener("hashchange", onHashChange)
  }, [pathname])

  return { items, activeId }
}

export function DocsTableOfContents() {
  const { items, activeId } = useTableOfContents()

  const totalHeadings = items.reduce((n, i) => n + 1 + i.children.length, 0)
  if (totalHeadings < 2) return null

  return (
    <nav aria-label="On this page">
      <p className="mb-4 text-sm font-medium">On this page</p>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block py-1 transition-colors hover:text-foreground",
                activeId === item.id
                  ? "border-l-2 border-primary pl-2 font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.text}
            </a>
            {item.children.length > 0 && (
              <ul className="mt-1 space-y-1 pl-4">
                {item.children.map((child) => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      className={cn(
                        "block py-1 transition-colors hover:text-foreground",
                        activeId === child.id
                          ? "border-l-2 border-primary pl-2 font-medium text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {child.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
