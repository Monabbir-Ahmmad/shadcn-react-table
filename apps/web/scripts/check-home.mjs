/* global document -- used inside page.evaluate() callbacks, which run in the browser */
// Drives the home page in a real browser against the served static export and
// checks the things that only work live: the hero's table demo (and that it
// holds still under reduced motion), the features section, the command driven
// table (including the large dataset), and the style deck — once in light and
// once in dark mode. Page errors and console errors fail the check.
//   GITHUB_PAGES=true pnpm --filter shadcn-react-table-web build
//   node apps/web/scripts/preview-server.mjs
//   node apps/web/scripts/check-home.mjs [baseUrl]
// baseUrl defaults to http://localhost:3000/shadcn-react-table. Exits non-zero
// with a message on the first failure.
import { readFileSync } from "node:fs"
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

// The large dataset's size and its last row's id come from the app's source.
const bigSource = readFileSync(join(REPO, "apps/web/lib/big-data.ts"), "utf8")
const BIG_ROW_COUNT = Number(
  /BIG_ROW_COUNT\s*=\s*([\d_]+)/.exec(bigSource)?.[1].replaceAll("_", "")
)
if (!BIG_ROW_COUNT) throw new Error("could not read BIG_ROW_COUNT")
const BIG_LABEL = BIG_ROW_COUNT.toLocaleString("en-US")
// Row ids come from makeUsers in apps/web/lib/example-data.ts: `U-${1000 + i}`.
const LAST_ID = `U-${1000 + BIG_ROW_COUNT - 1}`

class CheckError extends Error {}
function assert(condition, message) {
  if (!condition) throw new CheckError(message)
}

const SURFACE = '[data-slot="data-table-surface"]'
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

const CAPTION = "[data-auto-demo] [data-demo-caption]"
// The caption as read on screen ("01 Sort enableSorting").
const captionText = (page) =>
  page.evaluate(
    (selector) =>
      document.querySelector(selector)?.innerText.replace(/\s+/g, " "),
    CAPTION
  )

async function checkHome(colorScheme) {
  scheme = colorScheme
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme,
  })
  const page = await context.newPage()
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
  const command = page.locator('input[placeholder^="Tell the table"]')
  const run = async (text) => {
    await command.fill(text)
    await command.press("Enter")
  }

  await page.goto(`${BASE}/`, { waitUntil: "load" })

  await step("hero: the table demo moves on its own", async () => {
    const demo = page.locator("[data-auto-demo]")
    await demo.waitFor({ state: "visible" })
    const box = await demo.boundingBox()
    assert(box && box.height > 200, "the demo card did not render")
    const first = await captionText(page)
    assert(first, "the demo has no caption")
    // Scenes last 2.5 s, so the caption moves on within 4 s.
    await page.waitForFunction(
      ([selector, was]) =>
        document.querySelector(selector)?.innerText.replace(/\s+/g, " ") !==
        was,
      [CAPTION, first],
      { timeout: 4000 }
    )
    results.push(`    caption: ${first} -> ${await captionText(page)}`)
  })

  await step("hero: the demo holds still under reduced motion", async () => {
    const still = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      colorScheme,
      reducedMotion: "reduce",
    })
    try {
      const stillPage = await still.newPage()
      await stillPage.goto(`${BASE}/`, { waitUntil: "load" })
      await stillPage.locator("[data-auto-demo]").waitFor({ state: "visible" })
      // Let hydration swap in the still frame, then watch for 4 s.
      await stillPage.waitForTimeout(500)
      const before = await captionText(stillPage)
      // The still frame: sorted, filtered and two rows selected.
      assert(
        /\b03 Select\b.*\benableRowSelection\b/.test(before ?? ""),
        `expected the still frame's caption, found "${before}"`
      )
      await stillPage.waitForTimeout(4000)
      const after = await captionText(stillPage)
      assert(before === after, `caption moved: ${before} -> ${after}`)
    } finally {
      await still.close()
    }
  })

  await step("features: five parts with guide links", async () => {
    const section = page.locator("#features")
    await section.scrollIntoViewIfNeeded()
    const parts = await section
      .locator("h3")
      .evaluateAll((headings) =>
        headings
          .filter((h) => h.getClientRects().length)
          .map((h) => h.textContent)
      )
    assert(
      parts.length === 5,
      `expected five visible parts, found ${parts.length}: ${parts.join(", ")}`
    )
    const guides = await section
      .getByRole("link", { name: /^Guide/ })
      .evaluateAll(
        (links) => links.filter((a) => a.getClientRects().length).length
      )
    assert(guides > 0, "the features section has no Guide link")
  })

  await step("live table: commands drive the table", async () => {
    await page.locator("#try").scrollIntoViewIfNeeded()
    await page.waitForSelector(`#try ${SURFACE}`, { timeout: 20_000 })

    await run("group by department")
    await page.waitForSelector("#try tbody button[aria-expanded]", {
      timeout: 5000,
    })
    const group = await page
      .locator("#try tbody button[aria-expanded]")
      .first()
      .innerText()
    assert(/\(\d+\)/.test(group), `group row has no count: "${group}"`)

    await run("pin email left")
    await page.waitForSelector('#try thead th[data-pinned="left"]', {
      timeout: 5000,
    })
    const pinned = await page
      .locator('#try thead th[data-pinned="left"]')
      .allInnerTexts()
    assert(
      pinned.some((text) => /email/i.test(text)),
      `Email header is not pinned left (pinned: ${pinned.join(", ")})`
    )

    await run("arabic")
    await page.waitForFunction(
      (selector) =>
        document.querySelector(`#try ${selector}`)?.closest('[dir="rtl"]'),
      SURFACE,
      { timeout: 5000 }
    )
    await run("english")
    await page.waitForFunction(
      (selector) =>
        document.querySelector(`#try ${selector}`)?.closest('[dir="rtl"]') ===
        null,
      SURFACE,
      { timeout: 5000 }
    )
    await run("reset")
    await page.waitForFunction(
      () =>
        !document.querySelector('#try thead th[data-pinned="left"]') &&
        !document.querySelector("#try tbody button[aria-expanded]"),
      undefined,
      { timeout: 5000 }
    )
  })

  await step(`live table: ${BIG_LABEL} rows and the fling`, async () => {
    await page.getByRole("button", { name: `Load ${BIG_LABEL} rows` }).click()
    await page
      .locator("#try p", { hasText: `${BIG_LABEL} rows` })
      .first()
      .waitFor({ timeout: 15_000 })
    const counter = await page
      .locator("#try p", { hasText: /fps/ })
      .first()
      .innerText()
    assert(
      counter.includes(BIG_LABEL),
      `row counter "${counter}" lacks ${BIG_LABEL}`
    )

    await page.getByRole("button", { name: "Fling to bottom" }).click()
    // The fling eases for 1.8 s and then holds the bottom for a few frames, so
    // allow generous slack for slow machines: the last row (virtualized) has to
    // be rendered, which only happens once the table has scrolled to the end.
    await page
      .locator(`#try tbody td`, { hasText: new RegExp(`^${LAST_ID}$`) })
      .first()
      .waitFor({ timeout: 6000 })
  })

  await step("deck: six frames, arrow key turns the front card", async () => {
    await page.locator("#styles").scrollIntoViewIfNeeded()
    await page.waitForFunction(
      () => document.querySelectorAll("#styles iframe").length === 6,
      undefined,
      { timeout: 15_000 }
    )
    // The front card's frame renders the real table.
    await page
      .frameLocator(
        '#styles [aria-roledescription="slide"]:not([aria-hidden="true"]) iframe'
      )
      .first()
      .locator("table")
      .first()
      .waitFor({ timeout: 15_000 })
    const stage = page.locator('#styles [aria-roledescription="carousel"]')
    const front = () =>
      page
        .locator(
          '#styles [aria-roledescription="slide"]:not([aria-hidden="true"])'
        )
        .first()
        .getAttribute("aria-label")
    const before = await front()
    assert(before, "no front card found")
    await stage.focus()
    await page.keyboard.press("ArrowRight")
    await page.waitForFunction(
      (was) =>
        document
          .querySelector(
            '#styles [aria-roledescription="slide"]:not([aria-hidden="true"])'
          )
          ?.getAttribute("aria-label") !== was,
      before,
      { timeout: 5000 }
    )
    const after = await front()
    assert(after !== before, `front card stayed "${before}"`)
    results.push(`    front card: ${before} -> ${after}`)
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
