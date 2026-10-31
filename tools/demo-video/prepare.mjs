// Turns takes/<scene>/ (screencast frames + event log from record.mjs) into what the Remotion
// project needs in remotion/public/<scene>/: the frames (hard links) and timeline.json with one
// entry per output frame (camera crop, cursor, caption, card) plus sound cues. Shared files go
// in remotion/public/: the audio, the fonts from demo.config.json (downloaded from Google Fonts), and
// a fresh screenshot of the hero page that the title cards use as their background.
// Camera smoothing is stateful, so it is computed here once rather than per frame in Remotion,
// which renders frames in parallel and out of order.
// Usage: node prepare.mjs <scene...|all>   (the frontend must be running for the hero screenshot)
import fs from 'fs';
import path from 'path';
import { CONFIG, chromium, FE, HERE } from './lib.mjs';
import { VIEW, DPR } from './recorder.mjs';
import { SCENE_IDS } from './scenes/index.mjs';

const PUBLIC = path.join(HERE, 'remotion', 'public');
const MIX = JSON.parse(fs.readFileSync(path.join(HERE, 'remotion', 'src', 'mix.json'), 'utf8'));
const FPS = 30;
const W = 1920;
const H = 1080;
const SW = Math.round(VIEW.width * DPR);
const SH = Math.round(VIEW.height * DPR);
const CARD_SECONDS = { title: 4, chapter: 3.2, end: 3, customEnd: 5 };
// Annotation kit (project addition): frames each overlay takes to animate out.
const OUT = { bubble: 10, headline: 12, stat: 12, callout: 10, keys: 8, code: 9, spotlight: 12 };

// Music: Mixkit "Digital Clouds" (Mixkit free licence: video use, no credit needed; no broadcast).
// Effects: Remotion's sound effects; keystrokes: Kenney Interface Sounds (CC0).
// Downloaded once into public/audio, so previews and exports work offline. Swap by changing a URL.
const AUDIO = {
  'music.mp3': 'https://assets.mixkit.co/music/175/175.mp3',
  'click.wav': 'https://remotion.media/mouse-click.wav',
  'switch.wav': 'https://remotion.media/switch.wav',
  'ding.wav': 'https://remotion.media/ding.wav',
  'whoosh.wav': 'https://remotion.media/whoosh.wav',
  'tick-1.ogg':
    'https://raw.githubusercontent.com/kapishdima/soundcn/main/assets/kenney_interface-sounds/tick_001.ogg',
  'tick-2.ogg':
    'https://raw.githubusercontent.com/kapishdima/soundcn/main/assets/kenney_interface-sounds/tick_002.ogg',
  'tick-4.ogg':
    'https://raw.githubusercontent.com/kapishdima/soundcn/main/assets/kenney_interface-sounds/tick_004.ogg',
};

const bisectRight = (arr, x) => {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};
const r1 = (v) => Math.round(v * 10) / 10;
const cardKind = (e) => (e.end ? 'end' : /^\d+\s/.test(e.title) ? 'chapter' : 'title');
/**
 * "Signed in as Asha, assessor at Acme" -> "Asha  ·  assessor at Acme". Only a subtitle that names
 * who is signed in ("Signed in as …", "Back as …", or "Name, role") makes a badge; a descriptive
 * one ("What a prospective client sees first") makes none.
 */
const badgeFrom = (subtitle) => {
  if (!/^(Signed in as|Back as) |^[A-Z][a-z]+, /.test(subtitle)) return null;
  const who = subtitle
    .replace(/^(Signed in as|Back as) (the )?/, '')
    .split(', ')
    .join('  ·  ');
  return who.charAt(0).toUpperCase() + who.slice(1);
};

function buildTimeline(id) {
  const takeDir = path.join(HERE, 'takes', id);
  const data = JSON.parse(fs.readFileSync(path.join(takeDir, 'events.json'), 'utf8'));
  const events = [...data.events].sort((a, b) => a.t - b.t);
  const frames = [...data.frames].sort((a, b) => a.t - b.t);
  const frameTs = frames.map((f) => f.t);
  const S = data.dpr; // CSS px -> source px

  const byType = {};
  for (const e of events) (byType[e.type] ??= []).push(e);
  const byTypeTs = Object.fromEntries(
    Object.entries(byType).map(([k, v]) => [k, v.map((e) => e.t)]),
  );
  const latest = (kind, t) => {
    const i = bisectRight(byTypeTs[kind] ?? [], t);
    return i ? byType[kind][i - 1] : null;
  };
  const mouse = (byType.mouse ?? []).map((e) => [e.t, e.x * S, e.y * S]);
  const mouseTs = mouse.map((m) => m[0]);
  const cursorAt = (t) => {
    if (!mouse.length) return [SW / 2, SH / 2];
    const i = bisectRight(mouseTs, t);
    if (i === 0) return [mouse[0][1], mouse[0][2]];
    if (i >= mouse.length) return [mouse.at(-1)[1], mouse.at(-1)[2]];
    const [t0, x0, y0] = mouse[i - 1];
    const [t1, x1, y1] = mouse[i];
    const k = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
    return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
  };

  // Shown spans of the take, with cards between them.
  const segments = [];
  let visible = false;
  let spanStart = null;
  let pendingCards = [];
  for (const e of events) {
    if (e.type === 'chapter' || e.type === 'stinger') {
      const kind = e.type === 'stinger' ? 'stinger' : cardKind(e);
      const card = {
        kind: 'card',
        t: e.t,
        cardKind: kind,
        title: e.type === 'stinger' ? e.text : e.title,
        subtitle: e.subtitle ?? '',
        ...(e.endCard ? { endCard: e.endCard } : {}),
      };
      card.dur =
        kind === 'stinger'
          ? (e.dur ?? 800) / 1000
          : e.endCard
            ? (e.endCard.hold ?? CARD_SECONDS.customEnd * 1000) / 1000
            : CARD_SECONDS[kind];
      if (visible) {
        segments.push({ kind: 'src', t0: spanStart, t1: e.t }, card);
        spanStart = e.t;
      } else pendingCards.push(card);
    } else if (e.type === 'show' && !visible) {
      segments.push(...pendingCards);
      pendingCards = [];
      visible = true;
      spanStart = e.t;
    } else if (e.type === 'hide' && visible) {
      segments.push({ kind: 'src', t0: spanStart, t1: e.t });
      visible = false;
    }
  }
  segments.push(...pendingCards);

  const out = [];
  const cards = [];
  const captions = [];
  const roles = [];
  const ripples = [];
  const sounds = [];
  const intern = (list, v) => {
    let i = list.indexOf(v);
    if (i < 0) i = list.push(v) - 1;
    return i;
  };
  const srcSegs = [];
  const stingers = [];
  const cam = { z: 1, cx: SW / 2, cy: SH / 2 };
  const dt = 1 / FPS;
  let role = -1;
  let roleSetAt = -Infinity;
  let seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  for (const seg of segments.filter((s) => s.kind === 'card' || s.t1 - s.t0 > 0.05)) {
    if (seg.kind === 'card' && seg.cardKind === 'stinger') {
      // Stingers are kept apart from cards, so the music does not lift for them.
      const from = out.length;
      const n = Math.max(6, Math.round(seg.dur * FPS));
      stingers.push({ kind: 'stinger', title: seg.title, subtitle: '', from, durationInFrames: n });
      for (let i = 0; i < n; i++) out.push({ stinger: stingers.length - 1 });
      if (from > 0) sounds.push({ frame: from, kind: 'whoosh', volume: 0.8 });
      continue;
    }
    if (seg.kind === 'card') {
      const from = out.length;
      const n = Math.round(seg.dur * FPS);
      cards.push({
        kind: seg.cardKind,
        title: seg.title,
        subtitle: seg.subtitle,
        ...(seg.endCard ? { endCard: seg.endCard } : {}),
        from,
        durationInFrames: n,
      });
      for (let i = 0; i < n; i++) out.push({ card: cards.length - 1 });
      if (from > 0) sounds.push({ frame: from, kind: 'whoosh' });
      if (seg.cardKind === 'chapter' && seg.subtitle) {
        const badge = badgeFrom(seg.subtitle);
        role = badge ? intern(roles, badge) : -1;
        roleSetAt = seg.t;
      }
      continue;
    }
    const n = Math.max(1, Math.round((seg.t1 - seg.t0) * FPS));
    const segFrom = out.length;
    srcSegs.push({ t0: seg.t0, t1: seg.t1, from: segFrom, n });
    for (let i = 0; i < n; i++) {
      const ts = seg.t0 + i * dt;
      const zev = latest('zoom', ts);
      let [tx, ty] = cursorAt(ts);
      if (zev?.x != null) [tx, ty] = [zev.x * S, zev.y * S];
      cam.z += ((zev ? zev.level : 1) - cam.z) * (1 - Math.exp(-dt / 0.3));
      cam.cx += (tx - cam.cx) * (1 - Math.exp(-dt / 0.45));
      cam.cy += (ty - cam.cy) * (1 - Math.exp(-dt / 0.45));
      const cw = SW / cam.z;
      const ch = SH / cam.z;
      const x0 = Math.min(Math.max(cam.cx - cw / 2, 0), SW - cw);
      const y0 = Math.min(Math.max(cam.cy - ch / 2, 0), SH - ch);
      const [mx, my] = cursorAt(ts);
      const cap = latest('caption', ts);
      const typing = latest('typing', ts);
      const roleEv = latest('role', ts);
      if (roleEv && roleEv.t > roleSetAt) {
        role = intern(roles, roleEv.text);
        roleSetAt = roleEv.t;
      }
      out.push({
        img: Math.max(0, bisectRight(frameTs, ts) - 1),
        x0: r1(x0),
        y0: r1(y0),
        k: Math.round((W / cw) * 10000) / 10000,
        mx: r1(mx),
        my: r1(my),
        cap: cap?.text ? intern(captions, cap.text) : -1,
        capFrom: cap?.text ? Math.max(segFrom, out.length - Math.round((ts - cap.t) * FPS)) : 0,
        role,
        typing: Boolean(typing?.on),
      });
    }
    // Point events inside this span land on the output frame where they happen.
    const at = (t) => segFrom + Math.floor((t - seg.t0) / dt);
    let lastNav = -Infinity;
    for (const e of events) {
      if (e.t < seg.t0 || e.t >= seg.t1) continue;
      if (e.type === 'click') {
        ripples.push({ frame: at(e.t), x: r1(e.x * S), y: r1(e.y * S) });
        sounds.push({ frame: at(e.t), kind: e.sound === 'switch' ? 'switch' : 'click' });
      } else if (e.type === 'sfx') {
        sounds.push({ frame: at(e.t), kind: e.name });
      } else if (e.type === 'nav' && MIX.navigationWhoosh && e.t - lastNav > 1.5) {
        // One soft whoosh per page change; redirects within 1.5 s count as the same change.
        sounds.push({ frame: at(e.t), kind: 'nav' });
        lastNav = e.t;
      }
    }
  }

  // ---------------------------------------------------------------- annotation kit
  // (project addition) Take time -> output frame: inside a shown span, the frame where it happens;
  // in a hidden gap, the first frame of the next shown span (so it starts as the take comes back).
  const outFrame = (t) => {
    for (const s of srcSegs) {
      if (t < s.t0) return s.from;
      if (t < s.t1) return Math.min(s.from + s.n - 1, s.from + Math.floor((t - s.t0) * FPS));
    }
    return out.length;
  };
  const boxPx = (b) => b && { x: r1(b.x * S), y: r1(b.y * S), w: r1(b.w * S), h: r1(b.h * S) };
  const annotations = [];
  // Held overlays: shown from the event for `hold` ms of take time, then OUT frames to leave.
  const held = (e, kind, holdMs, extra) => {
    const from = outFrame(e.t);
    const exitAt = Math.max(from + 6, outFrame(e.t + holdMs / 1000));
    annotations.push({ kind, from, exitAt, to: exitAt + OUT[kind], ...extra });
    return from;
  };
  for (const e of events) {
    if (e.type === 'headline') {
      const from = held(e, 'headline', e.hold ?? 1800, {
        text: e.text,
        dim: e.dim !== false,
        position: e.position ?? 'center',
      });
      sounds.push({ frame: from, kind: 'whoosh', volume: 0.55 });
    } else if (e.type === 'stat') {
      const from = held(e, 'stat', e.hold ?? 2200, {
        value: e.value,
        label: e.label ?? '',
        prefix: e.prefix ?? '',
        suffix: e.suffix ?? '',
        dim: e.dim !== false,
        at: e.at ?? 'center',
      });
      sounds.push({ frame: from, kind: 'whoosh', volume: 0.6 });
      sounds.push({ frame: from + 44, kind: 'tick', variant: 4, volume: 0.9 });
    } else if (e.type === 'callout') {
      const from = held(e, 'callout', e.hold ?? 2000, {
        text: e.text,
        box: boxPx(e.box),
        side: e.side ?? null,
      });
      sounds.push({ frame: from + 10, kind: 'switch', volume: 0.45 });
    } else if (e.type === 'bubble') {
      const from = held(e, 'bubble', e.hold ?? 2600, {
        text: e.text,
        box: boxPx(e.box),
        side: e.side ?? null,
        speakAt: Math.round(((e.speakAt ?? 0) / 1000) * FPS),
        speakFrames: Math.round(((e.speak ?? 1500) / 1000) * FPS),
      });
      sounds.push({ frame: from, kind: 'switch', volume: 0.3 });
    } else if (e.type === 'keys') {
      const from = held(e, 'keys', 1200, { keys: e.keys, x: r1(e.x * S), y: r1(e.y * S) });
      e.keys.forEach((_, i) =>
        sounds.push({ frame: from + 2 + i * 4, kind: 'tick', variant: 2, volume: 1 }),
      );
    }
  }
  // Code chips and spotlights stay until the next one of their kind (or null) replaces them.
  const codes = events.filter((e) => e.type === 'code');
  codes.forEach((e, i) => {
    if (!e.text) return;
    const next = codes[i + 1];
    const from = outFrame(e.t);
    const exitAt = next ? outFrame(next.t) : out.length;
    const typeFrames = Math.round(Math.min(e.text.length * 1.4, 54));
    const swapIn = Boolean(codes[i - 1]?.text) && outFrame(codes[i - 1].t) < from;
    annotations.push({
      kind: 'code',
      from,
      exitAt,
      to: Math.min(out.length, exitAt + OUT.code),
      text: e.text,
      at: e.at ?? 'top-right',
      swapIn,
      typeFrames,
    });
    // A soft keystroke every 3 frames while it types.
    const start = from + (swapIn ? 11 : 6);
    for (let k = 0; k < typeFrames; k += 3)
      sounds.push({ frame: start + k, kind: 'tick', variant: [1, 2, 4][k % 3], volume: 0.3 });
  });
  const spots = events.filter((e) => e.type === 'spotlight');
  spots.forEach((e, i) => {
    if (!e.box) return;
    const next = spots[i + 1];
    const prev = spots[i - 1];
    const from = outFrame(e.t);
    const exitAt = next ? outFrame(next.t) : out.length;
    const continues = Boolean(next?.box);
    annotations.push({
      kind: 'spotlight',
      from,
      exitAt,
      to: continues ? exitAt : Math.min(out.length, exitAt + OUT.spotlight),
      box: boxPx(e.box),
      pad: (e.pad ?? 10) * S,
      // Moving on from another spotlight: the hole glides from the previous box.
      fromBox: prev?.box && outFrame(prev.t) < from ? boxPx(prev.box) : null,
      continues,
    });
  });
  annotations.sort((a, b) => a.from - b.from);
  // Stinger cards: the last shown frame under the wipe in, the next one under the wipe out.
  for (const [si, st] of stingers.entries()) {
    const half = Math.floor(st.durationInFrames / 2);
    for (let i = 0; i < st.durationInFrames; i++) {
      const under = i < half ? st.from - 1 : st.from + st.durationInFrames;
      if (out[under]?.img != null) out[st.from + i] = { stinger: si, under };
    }
  }
  // Voiceover markers at their time in the finished video (after cuts and cards), in seconds.
  const voiceCues = (byType.voice ?? []).map((e) => ({
    text: e.text,
    at: Math.round((outFrame(e.t) / FPS) * 1000) / 1000,
  }));

  // Keystrokes: a tick every 3-4 frames while typing, with variant and volume jitter.
  for (let f = 0; f < out.length; f++) {
    if (!out[f].typing) continue;
    const variant = [1, 2, 4][Math.floor(rand() * 3)];
    sounds.push({
      frame: f,
      kind: 'tick',
      variant,
      volume: Math.round((0.55 + rand() * 0.3) * 100) / 100,
    });
    f += 2 + (rand() < 0.5 ? 1 : 0);
  }
  sounds.sort((a, b) => a.frame - b.frame);
  for (const s of sounds)
    s.file =
      s.kind === 'tick'
        ? `audio/tick-${s.variant}.ogg`
        : s.kind === 'nav'
          ? 'audio/whoosh.wav'
          : `audio/${s.kind}.wav`;

  // remotion/public/<id>/
  const dir = path.join(PUBLIC, id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, 'take'), { recursive: true });
  const used = [...new Set(out.filter((o) => o.img != null).map((o) => o.img))];
  for (const i of used) {
    const src = path.join(takeDir, frames[i].f);
    const dst = path.join(dir, 'take', `${i}.jpg`);
    try {
      fs.linkSync(src, dst);
    } catch {
      fs.copyFileSync(src, dst);
    }
  }
  const timeline = {
    scene: id,
    theme: THEME,
    parts: SCENE_IDS.length,
    fps: FPS,
    width: W,
    height: H,
    source: { width: SW, height: SH },
    durationInFrames: out.length,
    frames: out,
    cards,
    stingers,
    captions,
    roles,
    ripples,
    sounds,
    annotations,
    voiceCues,
  };
  fs.writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify(timeline));
  const counts = sounds.reduce((m, s) => ((m[s.kind] = (m[s.kind] ?? 0) + 1), m), {});
  console.log(
    `${id}: ${(out.length / FPS).toFixed(1)}s, ${used.length} frames, sounds ${JSON.stringify(counts)}`,
  );
}

const wanted = process.argv.slice(2);
const ids = wanted.includes('all')
  ? SCENE_IDS.filter((id) => fs.existsSync(path.join(HERE, 'takes', id, 'events.json')))
  : wanted;
if (!ids.length) {
  console.log(`Usage: node prepare.mjs <scene...|all>\nScenes: ${SCENE_IDS.join(', ')}`);
  process.exit(1);
}

fs.mkdirSync(path.join(PUBLIC, 'audio'), { recursive: true });
for (const [name, url] of Object.entries(AUDIO)) {
  const dst = path.join(PUBLIC, 'audio', name);
  if (fs.existsSync(dst)) continue;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  fs.writeFileSync(dst, Buffer.from(await res.arrayBuffer()));
}
{
  // Same viewport and pixel density as the takes, signed out, with the dev overlay hidden.
  const browser = await chromium.launch();
  try {
    const page = await (
      await browser.newContext({ viewport: VIEW, deviceScaleFactor: DPR, colorScheme: CONFIG.colorScheme ?? 'light' })
    ).newPage();
    await page.goto(`${FE}${CONFIG.heroPath ?? '/'}`);
    await page.waitForLoadState('networkidle');
    if (CONFIG.hideSelectors?.length)
      await page.addStyleTag({
        content: `${CONFIG.hideSelectors.join(', ')} { display: none !important; }`,
      });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(PUBLIC, 'hero.jpg'), type: 'jpeg', quality: 90 });
  } finally {
    await browser.close();
  }
}
// Fonts: the latin files of each configured family and weight, kept local so renders are offline.
const fontFiles = [];
fs.mkdirSync(path.join(PUBLIC, 'fonts'), { recursive: true });
const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
for (const [role, font] of Object.entries(CONFIG.theme.fonts)) {
  const family = font.family.replace(/ /g, '+');
  const css = await (
    await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@${font.weights.join(';')}&display=block`,
      {
        headers: { 'User-Agent': CHROME_UA },
      },
    )
  ).text();
  // Google returns one @font-face per subset, each preceded by a /* subset */ comment.
  for (const m of css.matchAll(/\/\* latin \*\/\s*@font-face\s*{([^}]+)}/g)) {
    const weight = m[1].match(/font-weight:\s*(\d+)/)[1];
    const url = m[1].match(/url\((https:[^)]+\.woff2)\)/)[1];
    const file = `fonts/${role}-${weight}.woff2`;
    const dst = path.join(PUBLIC, file);
    if (!fs.existsSync(dst))
      fs.writeFileSync(dst, Buffer.from(await (await fetch(url)).arrayBuffer()));
    fontFiles.push({ role, family: font.family, weight: Number(weight), file });
  }
}
const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};
const THEME = {
  brand: hexToRgb(CONFIG.theme.brand),
  ink: CONFIG.theme.ink,
  fonts: Object.fromEntries(Object.entries(CONFIG.theme.fonts).map(([k, v]) => [k, v.family])),
  fontFiles,
  eyebrow: CONFIG.cards.eyebrow,
  footer: CONFIG.cards.footer,
};
for (const id of ids) buildTimeline(id);
