import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { IconLibraryProvider } from "@/components/icon-library-provider"
import { htmlFontClassName, htmlFontStyle } from "@/lib/fonts"
import { SITE_HEADER_HEIGHT } from "@/lib/site"

/**
 * The site's root layout (home + docs). The style frames have their own,
 * minimal one in `app/(frame)`.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={htmlFontClassName}
      style={
        {
          ...htmlFontStyle,
          "--site-header-h": `${SITE_HEADER_HEIGHT}px`,
        } as React.CSSProperties
      }
    >
      <body>
        <ThemeProvider>
          <IconLibraryProvider>{children}</IconLibraryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
