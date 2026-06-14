"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// The site opens on the docs. Redirect on the client so this works under the
// static export (GitHub Pages) where server redirects aren't available; the
// Next router applies the base path automatically.
export default function Home() {
  const router = useRouter()
  React.useEffect(() => {
    router.replace("/docs")
  }, [router])

  return (
    <div className="flex min-h-svh items-center justify-center p-6 text-sm text-muted-foreground">
      Redirecting to the
      <Link href="/docs" className="ml-1 underline underline-offset-4">
        documentation
      </Link>
      …
    </div>
  )
}
