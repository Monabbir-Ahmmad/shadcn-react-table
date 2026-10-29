import { playwright } from "@vitest/browser-playwright"
import process from "node:process"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// The table's layout (sticky header, pinned offsets, scroll surface) comes
// from Tailwind classes, so browser tests compile the real stylesheet with the
// UI package's PostCSS config.
const uiPostcss = fileURLToPath(
  new URL("../ui/postcss.config.mjs", import.meta.url)
)

export default defineConfig({
  test: {
    // Windows intermittently fails file reads ("UNKNOWN: unknown error,
    // read") when every core imports the module graph at once; half the cores
    // keeps local runs reliable. CI (Linux) uses the default.
    maxWorkers: process.platform === "win32" ? "50%" : undefined,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: ["src/**/*.browser.test.tsx"],
        },
      },
      {
        extends: true,
        css: { postcss: uiPostcss },
        test: {
          name: "browser",
          include: ["src/**/*.browser.test.tsx"],
          setupFiles: ["./vitest.browser.setup.ts"],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
            viewport: { width: 1280, height: 800 },
          },
        },
      },
    ],
  },
})
