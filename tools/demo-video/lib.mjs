// Engine helpers shared by the recorder and the scenes: project config, local logins, signing in,
// the local mail catcher and authenticator codes. Project-specific helpers (API clients, seeding)
// belong in app.mjs, not here; this file is replaced when the engine is updated.
import fs from 'fs';
import path from 'path';
import { createHmac } from 'crypto';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

export const HERE = path.dirname(fileURLToPath(import.meta.url));

/** demo.config.json: URLs, sign-in form, card texts and theme for this project. */
export const CONFIG = JSON.parse(fs.readFileSync(path.join(HERE, 'demo.config.json'), 'utf8'));

// Playwright comes from the project when it has it, otherwise from this folder.
const findPlaywright = () => {
  for (let dir = HERE; ; dir = path.dirname(dir)) {
    try {
      return createRequire(path.join(dir, 'package.json'))('@playwright/test');
    } catch {
      if (path.dirname(dir) === dir)
        throw new Error('Install @playwright/test in the project or in this folder');
    }
  }
};
export const { chromium } = findPlaywright();

export const FE = process.env.DEMO_FRONTEND_URL ?? CONFIG.frontendUrl;
export const MAILPIT = process.env.DEMO_MAILPIT_URL ?? CONFIG.mailpitUrl;

/** Logins from accounts.local.json (gitignored), keyed by the names the scenes use. */
export const ACCOUNTS = (() => {
  const file = path.join(HERE, 'accounts.local.json');
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${file}. Copy accounts.example.json and fill in your local accounts.`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
})();

const rx = (s) => new RegExp(s, 'i');

/** Signs in through the app's own form, as configured in demo.config.json. */
export async function signIn(page, who) {
  const s = CONFIG.signIn;
  await page.goto(`${FE}${s.path}`);
  await page.getByLabel(rx(s.emailLabel)).first().fill(who.email);
  await page.getByLabel(rx(s.passwordLabel)).first().fill(who.password);
  await page
    .getByRole('button', { name: rx(s.submitButton) })
    .first()
    .click();
  await page.waitForURL((u) => !u.pathname.startsWith(s.path), { timeout: 30000 });
  await page.waitForLoadState('networkidle').catch(() => {});
}

// ---------------------------------------------------------------- local mail (Mailpit)
/** Deletes every message in the local mail catcher. */
export async function clearMail() {
  await fetch(`${MAILPIT}/api/v1/messages`, { method: 'DELETE' });
}

/**
 * Waits for the newest message to `to` (any recipient when null) whose subject matches, and
 * returns it with its HTML.
 */
export async function waitForMail(to, subject, timeoutMs = 30000) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    const url = to
      ? `${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${to}`)}&limit=20`
      : `${MAILPIT}/api/v1/messages?limit=20`;
    const list = await (await fetch(url)).json();
    const hit = (list.messages ?? []).find((m) => subject.test(m.Subject));
    if (hit) return (await fetch(`${MAILPIT}/api/v1/message/${hit.ID}`)).json();
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`No mail to ${to ?? 'anyone'} matching ${subject} within ${timeoutMs / 1000}s`);
}

/** The first link in a message's HTML that matches `pattern`, with HTML entities decoded. */
export function linkIn(message, pattern) {
  const links = [...message.HTML.matchAll(/href="([^"]+)"/g)].map((m) =>
    m[1].replace(/&amp;/g, '&'),
  );
  const link = links.find((l) => pattern.test(l));
  if (!link) throw new Error(`No link matching ${pattern} in "${message.Subject}"`);
  return link;
}

// ---------------------------------------------------------------- authenticator codes
// RFC 6238: HMAC-SHA1, 30-second steps, 6 digits (what authenticator apps use by default).
const base32Decode = (s) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const c of s.replace(/[\s=]/g, '').toUpperCase())
    bits += alphabet.indexOf(c).toString(2).padStart(5, '0');
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
};

export function totp(secret, at = Date.now()) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(at / 1000 / 30)));
  const hmac = createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(code).padStart(6, '0');
}

/**
 * Waits until the next 30-second step has started. Servers usually refuse a code from the same
 * step as the last one they accepted, so consecutive MFA prompts need a fresh step.
 */
export async function nextTotpStep() {
  const msLeft = 30000 - (Date.now() % 30000);
  await new Promise((r) => setTimeout(r, msLeft + 500));
}
