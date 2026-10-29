/* global document, window, getComputedStyle -- used inside page.evaluate() callbacks, which run in the browser */
// Drives the home page in a real browser against the served static export and
// checks the four things that only work live: the anatomy stage, the command
// driven table (including the large dataset), and the style deck.
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
async function step(name, fn) {
  const started = Date.now()
  try {
    await fn()
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new CheckError(`${name}: ${reason}`)
  }
  results.push(`ok  ${name} (${Date.now() - started} ms)`)
}

const browser = await chromium.launch()
const failures = []
try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  })
  const page = await context.newPage()
  page.on("pageerror", (error) => failures.push(`page error: ${error.message}`))
  const command = page.locator('input[placeholder^="Tell the table"]')
  const run = async (text) => {
    await command.fill(text)
    await command.press("Enter")
  }

  await page.goto(`${BASE}/`, { waitUntil: "load" })

  await step("anatomy: one layer panel with a Guide link at 50%", async () => {
    await page.waitForSelector("[data-anatomy-stage]", { state: "visible" })
    await page.evaluate(() => {
      const section = document.querySelector("[data-anatomy-stage]")
      const rect = section.getBoundingClientRect()
      const distance = rect.height - window.innerHeight + 57
      window.scrollTo({
        top: rect.top + window.scrollY - 57 + 0.5 * distance,
        behavior: "instant",
      })
    })
    // Panels cross-fade over 200 ms.
    await page.waitForTimeout(600)
    const shown = await page.evaluate(() =>
      [...document.querySelectorAll("[data-anatomy-panel]")]
        .filter((panel) => Number(getComputedStyle(panel).opacity) > 0.9)
        .map((panel) => ({
          title: panel.querySelector("h2")?.textContent,
          guides: [...panel.querySelectorAll("a")].filter(
            (a) => /Guide/.test(a.textContent) && a.getClientRects().length
          ).length,
        }))
    )
    assert(
      shown.length === 1,
      `expected one visible layer panel, found ${shown.length}`
    )
    // 50% of the walk-through is the third part, "Rows".
    assert(
      shown[0].title === "Rows",
      `expected the "Rows" panel at 50%, found "${shown[0].title}"`
    )
    assert(shown[0].guides > 0, `panel "${shown[0].title}" has no Guide link`)
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
