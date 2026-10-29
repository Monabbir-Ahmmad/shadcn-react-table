"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@workspace/ui/lib/utils"
import { docsNav, normalizeDocsPath } from "@/lib/docs-nav"

export function DocsSidebar() {
  const pathname = normalizeDocsPath(usePathname())

  return (
    <nav className="flex flex-col gap-6">
      {docsNav.map((group) => (
        <div key={group.title} className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 px-2 pb-1 text-xs font-semibold text-foreground">
            <group.icon className="size-3.5 text-primary" aria-hidden />
            {group.title}
          </div>
          {group.items.map((item) => {
            const active = pathname === normalizeDocsPath(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center justify-between rounded-md py-1.5 ps-5 pe-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  active &&
                    "bg-primary/10 font-medium text-foreground before:absolute before:inset-y-1 before:start-2 before:w-0.5 before:rounded-full before:bg-primary"
                )}
              >
                {item.title}
                {item.badge && (
                  <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold text-primary">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
