// Exports clips to MP4 with sound: remotion/out/<scene>.mp4.
// Remotion renders the picture as a JPEG sequence; the audio mix and the final encode run on
// ffmpeg-static instead of Remotion's bundled ffmpeg, which Windows Smart App Control blocks
// because it is unsigned. The mix follows the same timeline.json and mix.json as the preview.
// Usage: node export.mjs <scene...|all> [--reuse-frames]
//   --reuse-frames skips the picture render and reuses remotion/out/<scene>/frames from the
//   last export, for when only the sound changed.
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { SCENE_IDS } from './scenes/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const FFMPEG = require('ffmpeg-static');
const STUDIO = path.join(HERE, 'remotion');
const PUBLIC = path.join(STUDIO, 'public');
const OUT_DIR = path.join(STUDIO, 'out');
// Called through node rather than npx: no shell, so paths with spaces stay one argument.
const REMOTION_CLI = path.join(STUDIO, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');

const args = process.argv.slice(2);
const REUSE_FRAMES = args.includes('--reuse-frames');
const wanted = args.filter((a) => !a.startsWith('--'));
const ids = wanted.includes('all')
  ? SCENE_IDS.filter((id) => fs.existsSync(path.join(PUBLIC, id, 'timeline.json')))
  : wanted;
if (!ids.length) {
  console.log(
    `Usage: node export.mjs <scene...|all> [--reuse-frames]\nScenes: ${SCENE_IDS.join(', ')}`,
  );
  process.exit(1);
}

const run = (cmd, cmdArgs, opts = {}) => {
  const r = spawnSync(cmd, cmdArgs, { stdio: 'inherit', ...opts });
  if (r.status !== 0) throw new Error(`${path.basename(cmd)} exited with ${r.status}`);
};
const mix = JSON.parse(fs.readFileSync(path.join(STUDIO, 'src', 'mix.json'), 'utf8'));

for (const id of ids) {
  const timeline = JSON.parse(fs.readFileSync(path.join(PUBLIC, id, 'timeline.json'), 'utf8'));
  const { fps, durationInFrames } = timeline;
  const D = durationInFrames / fps;
  const work = path.join(OUT_DIR, id);
  const frames = path.join(work, 'frames');
  const out = path.join(OUT_DIR, `${id}.mp4`);
  fs.mkdirSync(work, { recursive: true });

  // 1. Picture.
  if (!REUSE_FRAMES) {
    fs.rmSync(frames, { recursive: true, force: true });
    run(
      process.execPath,
      [
        REMOTION_CLI,
        'render',
        'Clip',
        frames,
        '--sequence',
        `--props=${JSON.stringify({ scene: id })}`,
        '--image-format=jpeg',
        '--jpeg-quality=92',
        '--log=error',
      ],
      { cwd: STUDIO },
    );
  }
  if (!fs.existsSync(frames)) throw new Error(`No frames in ${frames}`);
  const first = fs.readdirSync(frames).sort()[0];
  const pad = first.match(/(\d+)\.jpe?g$/)[1].length;
  const pattern = path.join(frames, first.replace(/\d+(\.jpe?g)$/, `%0${pad}d$1`));

  // 2. Sound: music with its fades and card lift, plus every effect at its frame.
  const cardWindows = timeline.cards.map(
    (c) =>
      `between(t,${(c.from / fps).toFixed(3)},${((c.from + c.durationInFrames) / fps).toFixed(3)})`,
  );
  const musicExpr = `if(gt(${cardWindows.join('+') || '0'},0),${mix.musicOnCards},${mix.music})*min(1,t/${mix.fadeInSeconds})*min(1,max(0,(${D.toFixed(3)}-t)/${mix.fadeOutSeconds}))`;
  const files = [...new Set(timeline.sounds.map((s) => s.file))];
  const inputs = ['-stream_loop', '-1', '-i', path.join(PUBLIC, 'audio', 'music.mp3')];
  for (const f of files) inputs.push('-i', path.join(PUBLIC, f));
  const graph = [
    `[0:a]atrim=0:${D.toFixed(3)},asetpts=N/SR/TB,volume='${musicExpr}':eval=frame[m]`,
  ];
  const mixed = ['[m]'];
  files.forEach((file, fi) => {
    const uses = timeline.sounds.filter((s) => s.file === file);
    const labels = uses.map((_, j) => `[s${fi}_${j}]`);
    graph.push(`[${fi + 1}:a]asplit=${uses.length}${labels.join('')}`);
    uses.forEach((s, j) => {
      const ms = Math.round((s.frame / fps) * 1000);
      const vol = (mix.effects[s.kind] * (s.volume ?? 1)).toFixed(3);
      graph.push(`[s${fi}_${j}]adelay=${ms}:all=1,volume=${vol}[e${fi}_${j}]`);
      mixed.push(`[e${fi}_${j}]`);
    });
  });
  graph.push(
    `${mixed.join('')}amix=inputs=${mixed.length}:normalize=0:duration=first:dropout_transition=0,loudnorm=I=-16:TP=-1.5:LRA=11[out]`,
  );
  const graphFile = path.join(work, 'mix.filtergraph');
  fs.writeFileSync(graphFile, graph.join(';\n'));
  const wav = path.join(work, 'mix.wav');
  run(FFMPEG, [
    '-v',
    'error',
    '-y',
    ...inputs,
    '-filter_complex_script',
    graphFile,
    '-map',
    '[out]',
    '-ar',
    '48000',
    wav,
  ]);

  // 3. Encode.
  run(FFMPEG, [
    '-v',
    'error',
    '-y',
    '-framerate',
    String(fps),
    '-i',
    pattern,
    '-i',
    wav,
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '18',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-shortest',
    '-movflags',
    '+faststart',
    out,
  ]);
  console.log(`wrote ${out} (${D.toFixed(1)}s, ${timeline.sounds.length} sound cues)`);
}
