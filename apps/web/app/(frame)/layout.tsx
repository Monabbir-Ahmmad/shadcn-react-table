import "@workspace/ui/globals.css"
import { htmlFontClassName, htmlFontStyle } from "@/lib/fonts"

// Paint dark from the first frame when the site is dark (next-themes keeps the
// choice under "theme"), before the home page sends the frame its theme.
const DARK_FIRST = `try{var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`

/**
 * The style frames' root layout: just the document, the stylesheet and the
 * font variables the style presets use. No theme provider, icon provider or
 * header, so each of the deck's six frames boots only its own table. The
 * frame takes light/dark and colors from the home page's messages.
 */
export default function FrameLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={htmlFontClassName}
      style={htmlFontStyle}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: DARK_FIRST }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
