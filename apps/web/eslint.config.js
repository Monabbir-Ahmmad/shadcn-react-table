import { nextJsConfig } from "@workspace/eslint-config/next-js"

/** @type {import("eslint").Linter.Config[]} */
export default [
  // Never lint build output (the static export bundles its own minified JS),
  // nor the smoke-test fixture, whose @/ imports only resolve inside the
  // generated consumer app.
  {
    ignores: ["out/**", ".next/**", "scripts/smoke-fixture/**", "generated/**"],
  },
  ...(Array.isArray(nextJsConfig) ? nextJsConfig : [nextJsConfig]),
]
