import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// Unit tests for the docs app's pure logic (no DOM).
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "scripts/**/*.test.ts"],
  },
})
