// Project-specific helpers for the scenes: API clients, off-camera setup, cleanup. The engine never
// replaces this file. Delete what you do not need.
import { ACCOUNTS, signIn } from './lib.mjs';

// Re-export the logins under the names the scenes use, e.g. `import { ADMIN } from '../app.mjs'`.
export const { ADMIN, USER } = ACCOUNTS;

// Values step lists can use as {{name}} or {{a.b}}, for example the people a clip creates.
export const VARS = {};

// Any other exported function is a helper step lists can run with `setup`, `teardown`, `before`
// or a `call` step. It is called as fn(r, args); a returned object adds values for {{...}}:
//
//   export async function signUpOn(r) { ... }
//   export async function newRecord(r, { title }) { ...; return { recordId: id }; }

/**
 * A JSON API client authorised as the signed-in user of `page`. Adapt the token lookup to the app:
 * a bearer token from an endpoint, or rely on the session cookie with `credentials: 'include'`.
 */
export function apiFor(page, baseUrl) {
  return async (method, url, body) => {
    const res = await page.request.fetch(`${baseUrl}${url}`, {
      method,
      data: body,
      headers: { 'Content-Type': 'application/json' },
    });
    const text = await res.text();
    if (res.status() >= 400)
      throw new Error(`${method} ${url} -> ${res.status()} ${text.slice(0, 300)}`);
    return text ? JSON.parse(text) : null;
  };
}

/** A signed-in API client from a throwaway browser context, for off-camera setup. */
export async function apiAs(browser, who, baseUrl) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await signIn(page, who);
  return { api: apiFor(page, baseUrl), close: () => ctx.close() };
}
