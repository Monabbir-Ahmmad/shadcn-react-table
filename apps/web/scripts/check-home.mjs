/* global document, getComputedStyle -- used inside page.evaluate() callbacks, which run in the browser */
// Drives the home page in a real browser against the served static export and
// checks the things that only work live: the hero's feature tour playing on its
// own (and jumping to a clicked feature, and holding still under reduced
// motion), the customize section's style preview, and the feature grid's guide
// links — once in light and once in dark mode. Page errors and console errors
// fail the check.
//   GITHUB_PAGES=true pnpm --filter shadcn-react-table-web build
//   node apps/web/scripts/preview-server.mjs
//   node apps/web/scripts/check-home.mjs [baseUrl]
// baseUrl defaults to http://localhost:3000/shadcn-react-table. Exits non-zero
// with a message on the first failure.
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../..")
// playwright is a dev dependency of the table package, not of the docs app.
const require = createRequire(
  join(REPO, "packages/shadcn-react-table/package.json")
)
const { chromium } = require("playwright")

const BASE = (
  process.argv[2] ?? "http://localhost:3000/shadcn-react-table"
).replace(/\/$/, "")

class CheckError extends Error {}
function assert(condition, message) {
  if (!condition) throw new CheckError(message)
}

const HERO = "[data-hero]"
const CAPTION = "[data-tour-caption]"
const HERO_TABLE = `${HERO} [data-slot="data-table-surface"]`
const results = []
let scheme = "light"
async function step(name, fn) {
  const started = Date.now()
  try {
    await fn()
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new CheckError(`[${scheme}] ${name}: ${reason}`)
  }
  results.push(`ok  [${scheme}] ${name} (${Date.now() - started} ms)`)
}

// The static export has no per-segment RSC files, so the router's prefetches
// of `__next.<segments>.txt` (a route group shows as `!<base64>`) 404 on every
// page. Those, and only those, are not failures.
const PREFETCH_404 = /\/__next\.[\w.!-]+\.txt(\?|$)/
const isPrefetch404 = (message) =>
  /^Failed to load resource: .*\b404\b/.test(message.text()) &&
  PREFETCH_404.test(message.location().url)

const browser = await chromium.launch()
const failures = []

function watchErrors(page) {
  page.on("pageerror", (error) =>
    failures.push(`[${scheme}] page error: ${error.message}`)
  )
  page.on("console", (message) => {
    if (message.type() !== "error" || isPrefetch404(message)) return
    const where = message.location().url
    failures.push(
      `[${scheme}] console error: ${message.text()}${where ? ` (${where})` : ""}`
    )
  })
}

// The hero's real table is up: its surface is visible with at least 5 rows.
const waitForHeroTable = (page, timeout) =>
  page.waitForFunction(
    (selector) => {
      const surface = document.querySelector(selector)
      return (
        surface?.getClientRects().length &&
        getComputedStyle(surface).visibility !== "hidden" &&
        surface.querySelectorAll("tbody tr[data-row-id]").length >= 5
      )
    },
    HERO_TABLE,
    { timeout }
  )

/** Picks a different value in the customize section's "Style" control. */
async function pickAnotherStyle(page, section) {
  const picker = section.getByLabel("Style", { exact: true }).first()
  await picker.waitFor({ state: "visible", timeout: 5000 })
  const tag = await picker.evaluate((el) => el.tagName.toLowerCase())
  const role = await picker.getAttribute("role")

  if (tag === "select") {
    const current = await picker.inputValue()
    const values = await picker
      .locator("option")
      .evaluateAll((options) => options.map((o) => o.value))
    const next = values.find((value) => value && value !== current)
    assert(next, "the Style picker has no other option")
    await picker.selectOption(next)
    return next
  }

  if (role === "radiogroup") {
    const radio = picker.locator(
      '[role="radio"]:not([aria-checked="true"]):not([data-state="checked"])'
    )
    const name = await radio.first().innerText()
    await radio.first().click()
    return name
  }

  // A combobox (shadcn Select): open it and choose an unselected option.
  await picker.click()
  const option = page.locator(
    '[role="option"]:not([aria-selected="true"]):not([data-state="checked"])'
  )
  await option.first().waitFor({ state: "visible", timeout: 5000 })
  const name = await option.first().innerText()
  await option.first().click()
  return name
}

async function checkHome(colorScheme) {
  scheme = colorScheme
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme,
  })
  const page = await context.newPage()
  watchErrors(page)

  await page.goto(`${BASE}/`, { waitUntil: "load" })

  await step("hero: the feature tour plays on its own", async () => {
    await waitForHeroTable(page, 5000)
    const caption = page.locator(CAPTION)
    const first = (await caption.innerText()).replace(/\s+/g, " ")
    // Scenes last 3.2 s, so the caption moves on within 4.5 s.
    await page.waitForFunction(
      ([selector, was]) =>
        document.querySelector(selector)?.innerText.replace(/\s+/g, " ") !==
        was,
      [CAPTION, first],
      { timeout: 4500 }
    )
    results.push(`    caption: ${first} -> ${await caption.innerText()}`)
  })

  await step("hero: a feature tab plays when clicked", async () => {
    await page.locator(HERO).getByRole("tab", { name: "Group" }).first().click()
    await page.waitForFunction(
      (selector) =>
        document.querySelector(`${selector} [data-feature-tour]`)?.dataset
          .scene === "group",
      HERO,
      { timeout: 2000 }
    )
    // Moves the pointer off the table so the tour keeps playing.
    await page.mouse.move(0, 0)
  })

  await step("hero: the tour holds still under reduced motion", async () => {
    const still = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      colorScheme,
      reducedMotion: "reduce",
    })
    try {
      const stillPage = await still.newPage()
      watchErrors(stillPage)
      await stillPage.goto(`${BASE}/`, { waitUntil: "load" })
      await waitForHeroTable(stillPage, 5000)
      await stillPage.waitForTimeout(500)
      const before = await stillPage.locator(CAPTION).innerText()
      assert(
        /01\s+Sort/.test(before),
        `expected the still frame, found "${before}"`
      )
      await stillPage.waitForTimeout(4000)
      const after = await stillPage.locator(CAPTION).innerText()
      assert(before === after, `caption moved: ${before} -> ${after}`)
    } finally {
      await still.close()
    }
  })

  await step(
    "customize: the style preview follows the Style picker",
    async () => {
      const section = page.locator("#customize")
      await section.scrollIntoViewIfNeeded()
      const frame = section.locator('iframe[src*="/style-frame/"]').first()
      await frame.waitFor({ state: "attached", timeout: 15_000 })
      // The frame renders the real table once it has loaded.
      await (
        await frame.contentFrame()
      )
        .locator("table")
        .first()
        .waitFor({ timeout: 15_000 })
      const before = await frame.getAttribute("src")

      const picked = await pickAnotherStyle(page, section)
      await page.waitForFunction(
        (was) =>
          document
            .querySelector('#customize iframe[src*="/style-frame/"]')
            ?.getAttribute("src") !== was,
        before,
        { timeout: 5000 }
      )
      const after = await section
        .locator('iframe[src*="/style-frame/"]')
        .first()
        .getAttribute("src")
      const style = picked.split("\n")[0].trim()
      results.push(`    style ${style}: ${before} -> ${after}`)
    }
  )

  await step("features: nine cards link to their guides", async () => {
    const section = page.locator("#features")
    await section.scrollIntoViewIfNeeded()
    const hrefs = await section
      .locator('a[href*="/docs/"]')
      .evaluateAll((links) =>
        links
          .filter((a) => a.getClientRects().length)
          .map((a) => a.getAttribute("href"))
      )
    assert(
      hrefs.length === 9,
      `expected 9 visible guide links, found ${hrefs.length}: ${hrefs.join(", ")}`
    )
  })

  await context.close()
}

try {
  for (const colorScheme of ["light", "dark"]) await checkHome(colorScheme)
} catch (error) {
  failures.unshift(error instanceof Error ? error.message : String(error))
} finally {
  await browser.close()
}

for (const line of results) console.log(line)
if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`)
  process.exit(1)
}
console.log("home page checks passed")
