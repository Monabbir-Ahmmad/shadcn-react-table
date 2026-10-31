// Records demo clips: one take per scene in takes/<id>/ (Chrome screencast frames and an event
// log). prepare.mjs and export.mjs turn takes into videos.
// Usage: node record.mjs <scene...|all> [--headed]
//   --headed shows the browser so you can watch the take; do not touch that window meanwhile.
import path from 'path';
import { CONFIG, HERE } from './lib.mjs';
import { createRecorder } from './recorder.mjs';
import { SCENE_IDS } from './scenes/index.mjs';
import { loadScene } from './steps.mjs';

const args = process.argv.slice(2);
const headed = args.includes('--headed');
const wanted = args.filter((a) => !a.startsWith('--'));
const ids = wanted.includes('all') ? SCENE_IDS : wanted;
if (!ids.length) {
  console.log(`Usage: node record.mjs <scene...|all> [--headed]\nScenes: ${SCENE_IDS.join(', ')}`);
  process.exit(1);
}

let failed = false;
for (const id of ids) {
  const scene = await loadScene(id);
  const r = await createRecorder({ outDir: path.join(HERE, 'takes', id), headed });
  r.intro = (subtitle) => r.chapter(`${scene.part}  ${scene.title}`, subtitle);
  r.log(`=== ${scene.part}/${scene.parts} ${id}: ${scene.title}`);
  try {
    await scene.run(r);
    const next = scene.next ? await loadScene(scene.next).catch(() => null) : null;
    r.chapter(CONFIG.productName, next ? `Next: ${next.title}` : CONFIG.cards.endSubtitle, {
      end: true,
    });
    r.log(`done ${id}`);
  } catch (e) {
    failed = true;
    r.log(`ERROR in ${id}: ${e.message.split('\n').slice(0, 4).join(' | ')}`);
    await r.page?.screenshot({ path: path.join(HERE, 'takes', id, 'error.png') }).catch(() => {});
  } finally {
    await r.close();
  }
}
process.exit(failed ? 1 : 0);
