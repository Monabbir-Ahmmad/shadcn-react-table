// Loads scenes: code scenes (scenes/<id>.mjs) or step-list scenes (scenes/<id>.yaml, .yml or
// .json). A step list covers most clips without code; the steps are the keys of STEPS below.
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import {
  ACCOUNTS,
  HERE,
  MAILPIT,
  clearMail,
  linkIn,
  nextTotpStep,
  totp,
  waitForMail,
} from './lib.mjs';
import { SCENE_IDS } from './scenes/index.mjs';

const require = createRequire(import.meta.url);
const SCENES = path.join(HERE, 'scenes');
const TIMEOUT = 30000;

/** "/regex/flags" stays a regex; any other string matches case-insensitively as a substring. */
const toMatcher = (v) => {
  if (v instanceof RegExp || v == null) return v;
  const m = String(v).match(/^\/(.+)\/([a-z]*)$/);
  return m
    ? new RegExp(m[1], m[2] || 'i')
    : new RegExp(String(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
};

/** Replaces {{name}} and {{a.b}} in every string of `v` with values from `vars`. */
function fill(v, vars) {
  if (typeof v === 'string') {
    return v.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
      const val = key.split('.').reduce((o, k) => (o == null ? o : o[k]), vars);
      if (val == null) throw new Error(`No value for {{${key}}}`);
      return String(val);
    });
  }
  if (Array.isArray(v)) return v.map((x) => fill(x, vars));
  if (v && typeof v === 'object')
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x, vars)]));
  return v;
}

/**
 * A locator from a target: a string (visible text) or
 * { role, name, label, text, placeholder, selector, within, hasText, nth, any }.
 * `within` scopes to a dialog ("dialog") or any other target; `hasText` keeps matches that
 * contain the text; `any` is a list of targets, the first that exists wins.
 */
function locate(page, target) {
  if (typeof target === 'string') return page.getByText(toMatcher(target)).first();
  if (target.any)
    return target.any
      .map((t) => locate(page, t))
      .reduce((a, b) => a.or(b))
      .first();
  let scope = page;
  if (target.within === 'dialog') scope = page.getByRole('dialog');
  else if (target.within) scope = locate(page, target.within);
  let loc;
  if (target.role)
    loc = scope.getByRole(target.role, target.name ? { name: toMatcher(target.name) } : {});
  else if (target.label) loc = scope.getByLabel(toMatcher(target.label));
  else if (target.placeholder) loc = scope.getByPlaceholder(toMatcher(target.placeholder));
  else if (target.text) loc = scope.getByText(toMatcher(target.text));
  else if (target.selector) loc = scope.locator(target.selector);
  else throw new Error(`Cannot locate ${JSON.stringify(target)}`);
  if (target.hasText) loc = loc.filter({ hasText: toMatcher(target.hasText) });
  return target.nth != null ? loc.nth(target.nth) : loc.first();
}

/** A login: a key in accounts.local.json, or { email, password } (for people a clip creates). */
const account = (key) => {
  if (key == null) return null;
  if (typeof key === 'object') return key;
  if (!ACCOUNTS[key]) throw new Error(`No account "${key}" in accounts.local.json`);
  return ACCOUNTS[key];
};

/** The project's helpers (app.mjs), loaded once. */
let appModule;
const app = async () => (appModule ??= await import('./app.mjs'));

/**
 * Runs helpers from app.mjs: a name, `{ name: args }`, or a list of either. Each is called as
 * fn(r, args); a returned object is merged into the scene's values for {{...}}.
 */
async function callHelpers(r, spec) {
  if (spec == null) return;
  for (const one of [].concat(spec)) {
    const [name, args] = typeof one === 'string' ? [one, undefined] : Object.entries(one)[0];
    const fn = (await app())[name];
    if (typeof fn !== 'function') throw new Error(`app.mjs exports no function "${name}"`);
    const out = await fn(r, fill(args, r.vars));
    if (out && typeof out === 'object') Object.assign(r.vars, out);
  }
}

/**
 * Opens a context as `as`, runs `before` helpers (for example an organisation switch), warms
 * pages, goes to `start` and starts capture, all off camera. `warm` and `start` are filled after
 * the helpers ran, so they can use the values the helpers return.
 */
async function openScene(r, { as, before, warm = [], start = '/' }) {
  await r.openAs(account(fill(as, r.vars)));
  await callHelpers(r, before);
  await r.warm(fill(warm, r.vars));
  await r.goto(fill(start, r.vars));
  await r.startCapture();
}

/**
 * Steps whose values are filled inside the step, because they produce values first. `code` is
 * shown verbatim, so JSX like style={{ ... }} is not read as a {{value}}.
 */
const FILLS_ITSELF = new Set(['switchUser', 'code']);

const targetOf = (v) => (typeof v === 'string' ? { text: v } : v);
const textOf = (v) => (typeof v === 'string' ? { text: v } : (v ?? {}));

const STEPS = {
  caption: (r, v) => r.caption(v),
  // ---- annotation kit (project addition; see README)
  voice: (r, v) => r.voice(String(v)),
  /** text, or { text, hold, dim, position, wait } */
  headline: (r, v) => {
    const { text, ...opts } = textOf(v);
    return r.headline(String(text), opts);
  },
  /** text, null, or { text, at } */
  code: (r, v) => (v == null || typeof v === 'string' ? r.code(v) : r.code(v.text, v)),
  /** { target, text, hold, side, wait } */
  callout: async (r, v) => {
    const { target, text, ...opts } = v;
    await r.callout(locate(r.page, targetOf(target)), String(text), opts);
  },
  /** target (with optional pad), or null */
  spotlight: async (r, v) => {
    if (v == null) return r.spotlight(null);
    const { pad, ...target } = targetOf(v);
    await r.spotlight(locate(r.page, target), { pad });
  },
  /** "Enter" or ["Shift", "Click"] */
  keys: (r, v) => r.keys(v),
  /** { value, label, prefix, suffix, hold, dim, at, wait } */
  stat: (r, v) => r.stat(v),
  /** text, or { text, dur } */
  stinger: (r, v) => {
    const { text, ...opts } = textOf(v);
    return r.stinger(String(text), opts);
  },
  zoom: (r, v) => r.zoom(v),
  hold: (r, v) => r.hold(v),
  settle: (r, v) => r.settle(v ?? 600),
  success: (r) => r.success(),
  show: (r) => r.show(),
  hide: (r) => r.hide(),
  badge: (r, v) => r.role(v),
  log: (r, v) => r.log(v),
  move: (r, [x, y, ms]) => r.moveTo(x, y, ms),
  scroll: (r, v) => (Array.isArray(v) ? r.scrollBy(v[0], v[1]) : r.scrollBy(v)),
  goto: (r, v) => r.goto(v),
  reload: async (r) => {
    await r.page.reload();
    await r.settle(800);
  },
  point: async (r, v) => {
    const { ms, dx, dy, ...target } = targetOf(v);
    await r.pointAt(locate(r.page, target), { ms, dx, dy });
  },
  /** `optional: true` skips the click when the target is not on screen. */
  click: async (r, v) => {
    const { sound, after, optional, ...target } = targetOf(v);
    const loc = locate(r.page, target);
    if (optional && !(await loc.isVisible().catch(() => false))) return;
    await r.click(loc, { sound, after });
  },
  /** `clear: true` empties the field first; `ifEmpty: true` types only into an empty field. */
  type: async (r, v) => {
    const { text, delay, clear, ifEmpty, ...target } = v;
    const loc = locate(r.page, target);
    if (ifEmpty && (await loc.inputValue().catch(() => ''))) return;
    if (clear) await loc.fill('');
    await r.type(loc, String(text), delay ?? 32);
  },
  /** Sets a value without typing, for date and other native inputs. */
  fill: async (r, v) => {
    const { value, ...target } = v;
    const loc = locate(r.page, target);
    await r.click(loc, { after: 100 });
    await loc.fill(String(value));
  },
  choose: (r, { trigger, option }) => r.chooseOption(locate(r.page, trigger), toMatcher(option)),
  /** Presses a key, e.g. Escape to close a picker without closing the dialog under it. */
  press: async (r, key) => {
    await r.page.keyboard.press(key);
    await r.settle(300);
  },
  /** { file } or { files: [...] }, paths relative to the demo folder, plus the target to use. */
  upload: async (r, v) => {
    const { file, files, after, ...target } = v;
    const paths = [].concat(files ?? file).map((f) => path.resolve(HERE, f));
    const loc = locate(r.page, target);
    const isInput = await loc
      .evaluate((el) => el instanceof HTMLInputElement && el.type === 'file')
      .catch(() => false);
    if (isInput) await loc.setInputFiles(paths);
    else {
      const chooser = r.page.waitForEvent('filechooser', { timeout: TIMEOUT });
      await r.click(loc, { after: 0 });
      await (await chooser).setFiles(paths);
    }
    await r.settle(after ?? 600);
  },
  waitFor: async (r, v) => {
    const timeout = v.timeout ?? TIMEOUT;
    if (v.url) await r.page.waitForURL(toMatcher(v.url), { timeout });
    else if (v.hidden) await locate(r.page, v.hidden).waitFor({ state: 'hidden', timeout });
    else {
      const { timeout: _t, ...target } = v;
      await locate(r.page, target).waitFor({ timeout });
    }
  },
  /**
   * Keeps a value for later steps as {{name}}: { name, url: /pattern(group)/ } from the address,
   * or { name, from: target, match: /pattern(group)/ } from an element's text.
   */
  remember: async (r, v) => {
    let source;
    if (v.url) source = r.page.url();
    else {
      const loc = locate(r.page, v.from);
      await loc.waitFor({ timeout: v.timeout ?? TIMEOUT });
      source = await loc.innerText();
    }
    const pattern = v.url ?? v.match;
    const m = pattern ? source.match(toMatcher(pattern)) : [source];
    if (!m) throw new Error(`"${v.name}": ${pattern} not found in ${source.slice(0, 120)}`);
    const value = m[1] ?? m[0];
    // `strip` removes every match, for example /\s/ to join a grouped secret.
    r.vars[v.name] = v.strip
      ? value.replace(new RegExp(toMatcher(v.strip).source, 'g'), '')
      : value;
  },
  /** Runs helpers from app.mjs (see callHelpers). Use hide/show around slow work. */
  call: (r, v) => callHelpers(r, v),
  clearMail: () => clearMail(),
  /**
   * Waits for an email { to, subject }, shows it in the mail catcher unless `show: false`, then
   * opens the first link matching `follow`; `hold` (ms) pauses on the message first.
   */
  mail: async (r, v) => {
    const wait = waitForMail(v.to ?? null, toMatcher(v.subject), v.timeout ?? TIMEOUT);
    // `optional: true` carries on without the email when it does not arrive.
    const msg = v.optional ? await wait.catch(() => null) : await wait;
    if (!msg) return;
    if (v.show !== false) {
      await r.goto(`${MAILPIT}/view/${msg.ID}`);
      if (v.hold) await r.hold(v.hold);
    }
    if (v.follow) await r.goto(linkIn(msg, toMatcher(v.follow)));
  },
  /**
   * Types the authenticator code for `secret` into the target. `fresh: true` first waits off
   * camera for the next 30-second step, since a code from the last accepted step is refused.
   */
  mfaCode: async (r, v) => {
    const { secret, fresh, delay, ...target } = v;
    if (fresh) {
      r.hide();
      await nextTotpStep();
      r.show();
    }
    await r.type(locate(r.page, target), totp(secret), delay ?? 120);
  },
  /** Changes person mid-clip: { as, start, warm, before, badge }. */
  switchUser: async (r, v) => {
    r.hide();
    await openScene(r, v);
    if (v.badge) r.role(fill(v.badge, r.vars));
    r.show();
  },
};

async function runSteps(r, id, steps) {
  for (const [i, step] of steps.entries()) {
    const [name, raw] = typeof step === 'string' ? [step, undefined] : Object.entries(step)[0];
    const fn = STEPS[name];
    if (!fn) throw new Error(`scenes/${id} step ${i + 1}: unknown step "${name}"`);
    try {
      await fn(r, FILLS_ITSELF.has(name) ? raw : fill(raw, r.vars));
    } catch (e) {
      throw new Error(`scenes/${id} step ${i + 1} (${name}): ${e.message}`);
    }
  }
}

/** A scene object from a parsed step-list file. */
export function sceneFromSteps(id, spec) {
  if (!spec.title || !Array.isArray(spec.steps)) {
    throw new Error(`scenes/${id}: a step list needs "title" and "steps"`);
  }
  return {
    id,
    title: spec.title,
    async run(r) {
      // Values for {{...}}: the project's VARS export from app.mjs, then whatever helpers return.
      r.vars = { ...((await app()).VARS ?? {}) };
      await callHelpers(r, spec.setup);
      // Optional closing-card content: { title, command, links, footer, hold }.
      if (spec.end) r.end(fill(spec.end, r.vars));
      try {
        await openScene(r, spec);
        r.intro(fill(spec.intro, r.vars));
        r.show();
        await runSteps(r, id, spec.steps);
        r.caption(null);
        r.hide();
      } finally {
        await callHelpers(r, spec.teardown);
      }
    },
  };
}

function readSteps(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.json')) return JSON.parse(text);
  return require('yaml').parse(text);
}

export async function loadScene(id) {
  const n = SCENE_IDS.indexOf(id);
  if (n < 0) throw new Error(`Unknown scene "${id}". Scenes: ${SCENE_IDS.join(', ')}`);
  const base = path.join(SCENES, id);
  let scene;
  if (fs.existsSync(`${base}.mjs`)) scene = (await import(`./scenes/${id}.mjs`)).default;
  else {
    const file = ['.yaml', '.yml', '.json'].map((x) => base + x).find((f) => fs.existsSync(f));
    if (!file) throw new Error(`No scenes/${id}.mjs, .yaml or .json`);
    scene = sceneFromSteps(id, readSteps(file));
  }
  return {
    ...scene,
    part: n + 1,
    parts: SCENE_IDS.length,
    next: SCENE_IDS[n + 1] ?? null,
  };
}
