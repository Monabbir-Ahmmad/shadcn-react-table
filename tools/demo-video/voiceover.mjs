// Spoken voiceover, read locally by Kokoro (Kokoro-82M v1.0, Apache 2.0) through kokoro-js; no
// text leaves the machine. The model downloads once into kokoro-js's cache.
//
//   node voiceover.mjs synth <scene>   reads every voice line of scenes/<scene>.voice.json into
//                                      voice/<hash>.wav and writes voice/lengths.json, so the
//                                      scene can wait for each line to finish before moving on
//   node voiceover.mjs mix <scene>     lays the lines on remotion/out/<scene>.mp4 at the
//                                      timeline's voiceCues, ducking music and effects under them:
//                                      remotion/out/<scene>.voice.mp4 (picture copied, not re-encoded)
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const FFMPEG = require('ffmpeg-static');
const PUBLIC = path.join(HERE, 'remotion', 'public');
const OUT_DIR = path.join(HERE, 'remotion', 'out');
const VOICE_DIR = path.join(HERE, 'voice');

const MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const VOICE = process.env.DEMO_VOICE ?? 'af_heart';
const SPEED = Number(process.env.DEMO_VOICE_SPEED ?? 1.05);
// Seconds between a cue and its line starting.
export const LEAD_IN = 0.15;
// Kokoro's lines average about -23 dB; this lifts them over the music, a limiter catches peaks.
const VOICE_VOLUME = 2.0;
// Respellings for words the model says wrongly, applied to the spoken text only.
const SAY = [
  [/\bshadcn\b/gi, 'shad C N'],
  [/\b1\.0\b/g, 'one point oh'],
];

const spoken = (text) => SAY.reduce((t, [from, to]) => t.replace(from, to), text);
export const fileFor = (text) =>
  path.join(
    VOICE_DIR,
    `${crypto.createHash('sha1').update(`${VOICE}\n${SPEED}\n${spoken(text)}`).digest('hex').slice(0, 12)}.wav`,
  );

function wavSeconds(file) {
  const buf = fs.readFileSync(file);
  // Byte rate sits at offset 28 of the 44-byte header kokoro-js writes.
  return (buf.length - 44) / buf.readUInt32LE(28);
}

async function synth(id) {
  const { KokoroTTS } = await import('kokoro-js');
  const lines = JSON.parse(fs.readFileSync(path.join(HERE, 'scenes', `${id}.voice.json`), 'utf8'));
  fs.mkdirSync(VOICE_DIR, { recursive: true });
  let tts;
  const lengths = {};
  for (const text of lines) {
    const file = fileFor(text);
    if (!fs.existsSync(file)) {
      tts ??= await KokoroTTS.from_pretrained(MODEL, { dtype: 'fp32', device: 'cpu' });
      const audio = await tts.generate(spoken(text), { voice: VOICE, speed: SPEED });
      await audio.save(file);
    }
    lengths[text] = Math.round(wavSeconds(file) * 100) / 100;
    console.log(`${lengths[text].toFixed(2)}s  ${text}`);
  }
  fs.writeFileSync(path.join(VOICE_DIR, `${id}.lengths.json`), JSON.stringify(lengths, null, 1));
}

function mix(id) {
  const timeline = JSON.parse(fs.readFileSync(path.join(PUBLIC, id, 'timeline.json'), 'utf8'));
  const cues = timeline.voiceCues ?? [];
  if (!cues.length) throw new Error(`${id}: the timeline has no voiceCues`);
  const lines = cues.map((c, i) => {
    const file = fileFor(c.text);
    if (!fs.existsSync(file)) throw new Error(`No audio for "${c.text}": run synth first`);
    const at = c.at + LEAD_IN;
    const next = cues[i + 1]?.at ?? timeline.frames.length / timeline.fps;
    const len = wavSeconds(file);
    if (at + len > next + 0.05)
      console.warn(`${id}: "${c.text}" runs ${(at + len - next).toFixed(2)}s into the next cue`);
    return { file, at };
  });

  const inputs = lines.flatMap((l) => ['-i', l.file]);
  const placed = lines.map((l, i) => {
    const ms = Math.round(l.at * 1000);
    return `[${i + 1}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${ms}|${ms}[v${i}]`;
  });
  const voices = lines.map((_, i) => `[v${i}]`).join('');
  const graph = [
    ...placed,
    `${voices}amix=inputs=${lines.length}:normalize=0,volume=${VOICE_VOLUME},asplit=2[voice][key]`,
    `[0:a][key]sidechaincompress=threshold=0.01:ratio=20:attack=40:release=700[bed]`,
    `[bed][voice]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.9[out]`,
  ].join(';');

  const target = path.join(OUT_DIR, `${id}.voice.mp4`);
  const run = spawnSync(
    FFMPEG,
    ['-y', '-loglevel', 'error', '-i', path.join(OUT_DIR, `${id}.mp4`), ...inputs,
      '-filter_complex', graph, '-map', '0:v', '-map', '[out]',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', target],
    { stdio: 'inherit' },
  );
  if (run.status !== 0) process.exit(run.status ?? 1);
  console.log(`${id}: ${lines.length} lines -> ${path.relative(HERE, target)}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [mode, id] = process.argv.slice(2);
  if (mode === 'synth' && id) await synth(id);
  else if (mode === 'mix' && id) mix(id);
  else {
    console.error('Usage: node voiceover.mjs synth|mix <scene>');
    process.exit(1);
  }
}
