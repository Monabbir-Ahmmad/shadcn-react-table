// The recording engine shared by every scene: a browser, Chrome screencast capture and an event
// log (mouse path, clicks, typing, captions, zoom, chapter cards, hidden spans) that prepare.mjs
// turns into a Remotion timeline. Scenes in scenes/ drive the app through the helpers here.
import fs from 'fs';
import path from 'path';
import { CONFIG, chromium, FE, signIn } from './lib.mjs';

export const VIEW = { width: 1600, height: 900 };
export const DPR = 1.5;

// Dev overlays (framework badges, query devtools) stay out of the frames.
const HIDE_DEV_UI = `
  (() => {
    const css = ${JSON.stringify(`${(CONFIG.hideSelectors ?? []).join(', ') || 'x-none'} { display: none !important; }`)};
    const add = () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); };
    if (document.head) add(); else document.addEventListener('DOMContentLoaded', add);
  })();`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** One take of one scene, written to outDir (frames/ and events.json). */
export async function createRecorder({ outDir, headed = false }) {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(outDir, 'frames'), { recursive: true });

  const events = [];
  const frames = [];
  const now = () => Date.now() / 1000;
  const ev = (type, data = {}) => events.push({ t: now(), type, ...data });
  const startedAt = Date.now();

  const browser = await chromium.launch({
    headless: !headed,
    // A visible window captures at the screen's real pixel density, which ignores the context's
    // deviceScaleFactor; forcing it keeps headed frames as sharp as headless ones.
    args: headed ? [`--force-device-scale-factor=${DPR}`] : [],
  });
  let page = null;
  let cdp = null;
  let frameN = 0;
  const mouse = { x: VIEW.width / 2, y: VIEW.height / 2 };

  const r = {
    browser,
    get page() {
      return page;
    },
    sleep,
    hold: sleep,

    /** Prints a step with the time since the start, so a take can be followed live. */
    log(text) {
      const s = Math.round((Date.now() - startedAt) / 1000);
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      console.log(`[${mm}:${String(s % 60).padStart(2, '0')}] ${text}`);
    },

    save() {
      fs.writeFileSync(
        path.join(outDir, 'events.json'),
        JSON.stringify({ view: VIEW, dpr: DPR, events, frames }, null, 1),
      );
    },

    async newContext() {
      const ctx = await browser.newContext({
        viewport: VIEW,
        deviceScaleFactor: DPR,
        colorScheme: CONFIG.colorScheme ?? 'light',
      });
      await ctx.addInitScript(HIDE_DEV_UI);
      return ctx;
    },

    /** A fresh browser context, signed in as `who` (or signed out when `who` is null). */
    async openAs(who) {
      await r.stopCapture();
      if (page) await page.context().close();
      page = await (await r.newContext()).newPage();
      // Page changes, including client-side route changes, for the optional navigation whoosh.
      page.on('framenavigated', (frame) => {
        if (frame === page.mainFrame()) ev('nav', { url: frame.url() });
      });
      if (who) await signIn(page, who);
      return page;
    },

    async startCapture() {
      cdp = await page.context().newCDPSession(page);
      cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
        const f = `frames/${String(frameN++).padStart(6, '0')}.jpg`;
        fs.writeFileSync(path.join(outDir, f), Buffer.from(data, 'base64'));
        frames.push({ t: metadata.timestamp, f });
        cdp?.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
      });
      await cdp.send('Page.startScreencast', {
        format: 'jpeg',
        quality: 88,
        maxWidth: VIEW.width * DPR,
        maxHeight: VIEW.height * DPR,
        everyNthFrame: 1,
      });
      // Force a fresh frame so the shown span starts on the current page.
      await page.evaluate(() => {
        document.body.style.outline = '0px solid transparent';
      });
      await sleep(300);
    },

    async stopCapture() {
      if (!cdp) return;
      await cdp.send('Page.stopScreencast').catch(() => {});
      cdp = null;
    },

    show: () => ev('show'),
    hide: () => ev('hide'),
    caption(text) {
      if (text) r.log(`  ${text}`);
      ev('caption', { text });
    },
    zoom: (level, focus) => ev('zoom', { level, ...(focus ?? {}) }),
    /** A title card. Titles starting with "N  " are chapter cards; `end` marks the closing card. */
    chapter(title, subtitle, opts = {}) {
      r.log(subtitle ? `${title} (${subtitle})` : title);
      // The closing card carries the scene's own end-card content when it set one (r.end).
      const endCard = opts.end && r.endCard ? { endCard: r.endCard } : {};
      ev('chapter', { title, subtitle, ...opts, ...endCard });
    },
    /** Changes the signed-in badge without a card, e.g. "Carla  ·  contributor at Acme Health". */
    role: (text) => ev('role', { text }),
    /** A save went through: the renderer plays a success sound here. */
    success: () => ev('sfx', { name: 'ding' }),

    // ---------------------------------------------------------------- annotation kit
    // (project addition) Each call logs an event at this moment; prepare.mjs places it on the
    // timeline and Demo.tsx draws it (remotion/src/annotations/). Element boxes are page CSS px at
    // the moment of the call, so the overlay follows the camera but not a later scroll.

    /** A marker for the voiceover script: renders nothing, kept in events.json with its time. */
    voice(text) {
      r.log(`  voice: ${text}`);
      ev('voice', { text });
    },

    /**
     * Kinetic headline; `**word**` marks accent words. { hold = 1800 ms, dim = true,
     * position: 'center' | 'top' | 'bottom', wait = true } (wait: pause the take for hold + exit).
     */
    async headline(text, { hold = 1800, dim = true, position = 'center', wait = true } = {}) {
      r.log(`  headline: ${text}`);
      ev('headline', { text, hold, dim, position });
      if (wait) await sleep(hold + 400);
    },

    /** Floating code chip that types itself out; null clears it. { at: 'top-right' | ... } */
    code(text, { at = 'top-right' } = {}) {
      ev('code', { text: text ?? null, at });
    },

    /** The element's box in page CSS px, after scrolling it into view and letting it settle. */
    async boxOf(loc) {
      await r.bringIntoView(loc);
      await r.stillness();
      const b = await loc.boundingBox();
      if (!b) throw new Error('Annotation target has no box (hidden or detached)');
      return { x: b.x, y: b.y, w: b.width, h: b.height };
    },

    /** Label pill with a connector to the element. { hold = 2000, side, wait = true } */
    async callout(loc, text, { hold = 2000, side, wait = true } = {}) {
      const box = await r.boxOf(loc);
      r.log(`  callout: ${text}`);
      ev('callout', { text, box, hold, side });
      if (wait) await sleep(hold + 300);
    },

    /** Dims everything but the element until the next spotlight; null clears it. { pad = 10 } */
    async spotlight(loc, { pad = 10 } = {}) {
      ev('spotlight', { box: loc ? await r.boxOf(loc) : null, pad });
    },

    /** Keycaps near the cursor (or at `at`, page CSS px), e.g. ['Shift', 'Click']; about 1.2 s. */
    keys(list, at) {
      ev('keys', { keys: [].concat(list).map(String), x: at?.x ?? mouse.x, y: at?.y ?? mouse.y });
    },

    /**
     * A speech bubble saying `text` (`**accent**` allowed), its tail on the element `loc` (or low in
     * the frame, as a caption, when loc is null). Words light up over `speak` ms from `speakAt` ms.
     * { hold = 2600, side, speak = 1500, speakAt = 0 }; never pauses the take.
     */
    async bubble(loc, text, { hold = 2600, side, speak = 1500, speakAt = 0 } = {}) {
      const box = loc ? await r.boxOf(loc) : null;
      r.log(`  bubble: ${text}`);
      ev('bubble', { text, box, side, hold, speak, speakAt });
    },

    /** A big number that counts up. { value, label, prefix, suffix, hold = 2200, dim, at, wait } */
    async stat({ value, label = '', prefix = '', suffix = '', hold = 2200, dim = true, at = 'center', wait = true }) {
      r.log(`  stat: ${prefix}${value}${suffix} ${label}`);
      ev('stat', { value: Number(value), label, prefix, suffix, hold, dim, at });
      if (wait) await sleep(hold + 400);
    },

    /** A ~0.8 s section transition card between two moments of the take. */
    stinger(text, { dur = 800 } = {}) {
      r.log(`  stinger: ${text}`);
      ev('stinger', { text, dur });
    },

    /** Content for the closing card: { title, command, links: [...], footer, hold }. */
    end(spec) {
      r.endCard = spec ?? null;
    },

    async settle(ms = 600) {
      await page.waitForLoadState('networkidle').catch(() => {});
      await sleep(ms);
    },

    async goto(url) {
      await page.goto(url.startsWith('http') ? url : `${FE}${url}`);
      await r.settle(900);
    },

    async warm(urls) {
      for (const u of urls)
        await page
          .goto(`${FE}${u}`)
          .then(() => r.settle(200))
          .catch(() => {});
    },

    async moveTo(x, y, ms) {
      const dist = Math.hypot(x - mouse.x, y - mouse.y);
      const dur = ms ?? Math.min(1100, 380 + dist * 0.55);
      const steps = Math.max(8, Math.round(dur / 16));
      const sx = mouse.x;
      const sy = mouse.y;
      for (let i = 1; i <= steps; i++) {
        const k = ease(i / steps);
        mouse.x = sx + (x - sx) * k;
        mouse.y = sy + (y - sy) * k;
        await page.mouse.move(mouse.x, mouse.y);
        ev('mouse', { x: mouse.x, y: mouse.y });
        await sleep(dur / steps);
      }
    },

    /** Scrolls an element into the comfortable band of the viewport with smooth wheel steps. */
    async bringIntoView(loc) {
      await loc.waitFor({ state: 'visible', timeout: 20000 });
      // Off to the side (a wide table, a carousel): scroll its container sideways first.
      const side = await loc.boundingBox();
      if (side && (side.x < 0 || side.x + side.width > VIEW.width)) {
        await loc.evaluate((el) =>
          el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }),
        );
        await sleep(600);
      }
      for (let guard = 0; guard < 40; guard++) {
        const box = await loc.boundingBox();
        if (!box) return;
        const top = 110;
        const bottom = VIEW.height - 150;
        let delta = 0;
        if (box.y < top) delta = box.y - top;
        else if (box.y + box.height > bottom)
          delta = Math.min(box.y + box.height - bottom, box.y - top);
        if (Math.abs(delta) < 4) return;
        await page.mouse.wheel(0, Math.sign(delta) * Math.min(Math.abs(delta), 120));
        await sleep(28);
      }
    },

    async scrollBy(dy, stepPx = 90) {
      const n = Math.ceil(Math.abs(dy) / stepPx);
      for (let i = 0; i < n; i++) {
        await page.mouse.wheel(0, Math.sign(dy) * stepPx);
        await sleep(30);
      }
      await sleep(300);
    },

    /** Waits (up to 1.5 s) for finite animations, such as a dialog opening, to settle. */
    async stillness() {
      await page
        .evaluate(
          () =>
            Promise.race([
              Promise.all(
                document
                  .getAnimations()
                  .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
                  .map((a) => a.finished.catch(() => {})),
              ),
              new Promise((ok) => setTimeout(ok, 1500)),
            ]),
          undefined,
        )
        .catch(() => {});
    },

    async pointAt(loc, { ms, dx = 0.5, dy = 0.5 } = {}) {
      await r.bringIntoView(loc);
      await r.stillness();
      let box = await loc.boundingBox();
      await r.moveTo(box.x + box.width * dx, box.y + box.height * dy, ms);
      // Moved during the glide (a late layout shift): finish on where it is now.
      const now = await loc.boundingBox();
      if (now && (Math.abs(now.x - box.x) > 2 || Math.abs(now.y - box.y) > 2)) {
        box = now;
        await r.moveTo(box.x + box.width * dx, box.y + box.height * dy, 200);
      }
      return box;
    },

    async click(loc, opts = {}) {
      await r.pointAt(loc, opts);
      await sleep(140);
      // The effect the renderer plays: a soft tick for checkboxes, radios and switches, a click
      // for everything else. `opts.sound` overrides it.
      const sound =
        opts.sound ??
        (await loc
          .evaluate((el) =>
            el.closest(
              '[role="checkbox"], [role="switch"], [role="radio"], input[type="checkbox"], input[type="radio"]',
            )
              ? 'switch'
              : 'click',
          )
          .catch(() => 'click'));
      ev('click', { x: mouse.x, y: mouse.y, sound });
      await page.mouse.down();
      await sleep(70);
      await page.mouse.up();
      await sleep(opts.after ?? 450);
    },

    async type(loc, text, delay = 32) {
      await r.click(loc, { after: 150 });
      ev('typing', { on: true });
      await page.keyboard.type(text, { delay });
      ev('typing', { on: false });
      await sleep(250);
    },

    async chooseOption(trigger, optionName) {
      await r.click(trigger, { after: 350 });
      await r.click(page.getByRole('option', { name: optionName }).first(), { after: 350 });
    },

    async highlight(loc, seconds = 2.2, pad = 6) {
      const box = await loc.boundingBox();
      if (box)
        ev('highlight', {
          x: box.x - pad,
          y: box.y - pad,
          w: box.width + pad * 2,
          h: box.height + pad * 2,
          dur: seconds,
        });
    },

    async close() {
      await r.stopCapture();
      r.save();
      await browser.close();
    },
  };
  return r;
}
