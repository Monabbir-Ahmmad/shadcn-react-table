import type { CSSProperties } from "react"
import { Geist, Geist_Mono, Raleway, Noto_Serif } from "next/font/google"

import { cn } from "@workspace/ui/lib/utils"

// Each font gets its own CSS variable so the theme customizer (and the style
// deck's font picker) can switch --font-sans / --font-heading between them at
// runtime. Shared by the site's and the style frames' root layouts.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" })
const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
})
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

/** Classes for `<html>`: the font variables plus the base text styles. */
export const htmlFontClassName = cn(
  "font-sans antialiased",
  geist.variable,
  raleway.variable,
  notoSerif.variable,
  geistMono.variable
)

/** Defaults the customizer can override on `<html>`. */
export const htmlFontStyle = {
  "--font-sans": "var(--font-raleway)",
  "--font-heading": "var(--font-noto-serif)",
} as CSSProperties
