// Contact sheet per take: the frame on screen shortly after each caption starts, labelled with the
// caption. Catches a wrong screen or a caption that runs ahead of the page before exporting.
// (Project addition: annotation-kit events and voice markers get a tile too, labelled by kind.)
// Usage: node sheet.mjs <scene...|all>   -> takes/<scene>/sheet.jpg
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { HERE } from './lib.mjs';
import { SCENE_IDS } from './scenes/index.mjs';

const require = createRequire(import.meta.url);
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const COLS = 3;
const W = 640;
const H = 360;
const LABEL = 28;
const AFTER_CAPTION_SECONDS = 1.8;

const wanted = process.argv.slice(2);
const ids = wanted.includes('all')
  ? SCENE_IDS.filter((id) => fs.existsSync(path.join(HERE, 'takes', id, 'events.json')))
  : wanted;
if (!ids.length) {
  console.log(`Usage: node sheet.mjs <scene...|all>\nScenes: ${SCENE_IDS.join(', ')}`);
  process.exit(1);
}

for (const id of ids) {
  const dir = path.join(HERE, 'takes', id);
  const data = JSON.parse(fs.readFileSync(path.join(dir, 'events.json'), 'utf8'));
  const frames = [...data.frames].sort((a, b) => a.t - b.t);
  const label = (e) => {
    if (e.type === 'caption') return e.text;
    if (e.type === 'stat') return `stat: ${e.prefix ?? ''}${e.value}${e.suffix ?? ''} ${e.label ?? ''}`;
    if (e.type === 'keys') return `keys: ${e.keys.join(' + ')}`;
    if (e.type === 'spotlight') return e.box ? 'spotlight' : null;
    return e.text ? `${e.type}: ${e.text}` : null;
  };
  const KINDS = ['caption', 'headline', 'callout', 'code', 'spotlight', 'keys', 'stat', 'stinger', 'voice'];
  const captions = data.events
    .filter((e) => KINDS.includes(e.type) && label(e))
    .map((e) => ({ t: e.t, text: label(e) }));
  const frameAt = (t) => (frames.filter((f) => f.t <= t).at(-1) ?? frames[0]).f;
  const rows = Math.ceil(captions.length / COLS);
  const canvas = createCanvas(COLS * W, Math.max(1, rows) * (H + LABEL));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const [i, cap] of captions.entries()) {
    const img = await loadImage(
      fs.readFileSync(path.join(dir, frameAt(cap.t + AFTER_CAPTION_SECONDS))),
    );
    const x = (i % COLS) * W;
    const y = Math.floor(i / COLS) * (H + LABEL);
    ctx.drawImage(img, x, y + LABEL, W, H);
    ctx.fillStyle = '#b00';
    ctx.font = '15px sans-serif';
    ctx.fillText(`${i + 1}. ${cap.text}`.slice(0, 82), x + 6, y + 19);
  }
  const out = path.join(dir, 'sheet.jpg');
  fs.writeFileSync(out, await canvas.encode('jpeg', 72));
  console.log(`${id}: ${captions.length} captions -> ${out}`);
}
