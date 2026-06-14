import { Geist, Geist_Mono, Raleway, Noto_Serif } from "next/font/google"

import "@monabbir/tablecn/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@monabbir/tablecn/lib/utils";

const notoSerifHeading = Noto_Serif({subsets:['latin'],variable:'--font-heading'});

const raleway = Raleway({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", raleway.variable, notoSerifHeading.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
