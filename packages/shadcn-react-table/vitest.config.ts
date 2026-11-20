import { transformAsync } from "@babel/core"
import { playwright } from "@vitest/browser-playwright"
import reactCompiler from "babel-plugin-react-compiler"
import process from "node:process"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// The table's layout (sticky header, pinned offsets, scroll surface) comes
// from Tailwind classes, so browser tests compile the real stylesheet with the
// UI package's PostCSS config.
const uiPostcss = fileURLToPath(
  new URL("../ui/postcss.config.mjs", import.meta.url)
)

// Runs React Compiler over the components under test/react-compiler, as a
// consumer's app build would, so tests can check the table under it.
const compiledFixtures = /\/test\/react-compiler\/.*\.tsx$/

const reactCompilerFixtures = {
  name: "react-compiler-fixtures",
  enforce: "pre" as const,
  async transform(code: string, id: string) {
    if (!compiledFixtures.test(id)) return null
    const result = await transformAsync(code, {
      filename: id,
      babelrc: false,
      configFile: false,
      parserOpts: { plugins: ["jsx", "typescript"] },
      plugins: [[reactCompiler, { panicThreshold: "all_errors" }]],
      sourceMaps: true,
    })
    return result?.code ? { code: result.code, map: result.map } : null
  },
}

export default defineConfig({
  test: {
    // Windows intermittently fails file reads ("UNKNOWN: unknown error,
    // read") when every core imports the module graph at once; half the cores
    // keeps local runs reliable. CI (Linux) uses the default.
    maxWorkers: process.platform === "win32" ? "50%" : undefined,
    projects: [
      {
        extends: true,
        plugins: [reactCompilerFixtures],
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
