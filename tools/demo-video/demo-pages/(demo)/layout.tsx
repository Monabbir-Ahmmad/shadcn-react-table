import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { IconLibraryProvider } from "@/components/icon-library-provider"
import { htmlFontClassName, htmlFontStyle } from "@/lib/fonts"

/** Temporary root layout for the marketing-video pages (local only). */
export default function DemoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={htmlFontClassName}
      style={htmlFontStyle}
    >
      <body>
        <ThemeProvider>
          <IconLibraryProvider>{children}</IconLibraryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
