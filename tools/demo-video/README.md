# Demo video

Records and renders the one-minute release video (and the README GIF): Playwright drives the real
docs site and a few demo pages, Remotion draws the cursor, captions, overlays and cards, and a
local text-to-speech model reads the voiceover. Not a workspace: it has its own `package.json` and
`node_modules`.

## Make the video

```sh
cd tools/demo-video
npm install                       # once; npx playwright install chromium if Playwright asks
cp accounts.example.json accounts.local.json

# 1. The demo pages (/reel, /reel/big, /reel/rtl), copied in only while recording. The folder is
#    git-ignored, so they never ship with the docs site.
cp -r "demo-pages/(demo)" "../../apps/web/app/"

# 2. The production docs site, built and served at http://localhost:3000/shadcn-react-table
pnpm --filter shadcn-react-table-web preview      # from the repo root, in another terminal

# 3. Voice lines, then the take, then the video
node voiceover.mjs synth reel     # voice/<hash>.wav and voice/reel.lengths.json
node record.mjs reel              # takes/reel/ (add --headed to watch)
node sheet.mjs reel               # takes/reel/sheet.jpg: check the take before rendering
node prepare.mjs reel             # timeline, fonts, audio and hero screenshot
node export.mjs reel              # remotion/out/reel.mp4 (music and effects)
node voiceover.mjs mix reel       # remotion/out/reel.voice.mp4 (with the voiceover)

# 4. Remove the demo pages again
rm -r "../../apps/web/app/(demo)"
```

The README GIF (`.github/assets/demo.gif`) is the silent cut, from the repo root:

```sh
FF=$(node -e "console.log(require('./tools/demo-video/node_modules/ffmpeg-static'))")
"$FF" -i tools/demo-video/remotion/out/reel.voice.mp4 -vf "fps=10,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" .github/assets/demo.gif
```

Render with `export.mjs`, not `npx remotion render`: Windows Smart App Control blocks Remotion's
bundled ffmpeg, so `export.mjs` encodes with `ffmpeg-static`.

## How the reel is built

- `scenes/reel.mjs` is the whole clip: the hero with two headlines, then sort and search, column
  drag and resize, range selection, cell editing and grouping on `/reel`, 100,000 rows on
  `/reel/big`, the style picker on the home page, Arabic right to left on `/reel/rtl`, and the end
  card with the install command. Page loads happen off camera (`hide` / `show`), so the cuts are
  instant.
- `scenes/reel.voice.json` lists the voice lines. `voiceover.mjs synth` reads them with Kokoro
  (Kokoro-82M, Apache 2.0, through `kokoro-js`; runs locally, the model downloads once) and records
  each line's length. The scene waits for a line to finish before the next one starts or the
  picture cuts away, so the voice never runs over. `voiceover.mjs mix` places each line at its cue
  in the finished video and ducks the music under it. `SAY` in `voiceover.mjs` respells words the
  model says wrongly ("shadcn" as "shad C N").
- Each spoken line also shows as a caption bubble whose words light up as they are said, so the
  video works muted. The text can differ from what is spoken (`say(spoken, shown)`), and
  `**word**` marks accent words.
- `demo.config.json` sets the site URL, dark mode, the brand colour and fonts.

Change the script by editing `reel.voice.json` and the matching `say(...)` calls, then run all of
step 3 again. Changing only an overlay's look needs `export.mjs` and `voiceover.mjs mix`, not a new
take.

## Annotation kit

Overlays are logged at the moment the step runs and drawn above the take (below the cursor).
Element boxes are captured after scrolling the target into view and follow the camera's zoom and
pan, but not a later page scroll. Text accepts `**accent**` for brand-coloured words. In a code
scene:

- `r.headline(text, { hold, dim, position })`: big kinetic headline, pauses the take.
- `await r.bubble(locator | null, text, { hold, side, speak, speakAt })`: speech bubble; with an
  element its tail points at it, without one it is a caption low in the frame. Words light up over
  `speak` ms from `speakAt` ms.
- `r.code(text | null, { at })`: code chip that types itself out; stays until the next one.
- `await r.callout(locator, text, { hold, side })`: label pill with a connector to the element.
- `await r.spotlight(locator | null)`: dims everything but the element.
- `r.keys(['Shift', 'Click'], at?)`: keycaps beside the cursor, or at `{ x, y }` (page px).
- `await r.stat({ value, label, prefix, suffix, hold })`: big number that counts up.
- `r.stinger(text)`: a short transition card.
- `r.voice(text)`: voiceover cue; renders nothing.
- `r.end({ title, command, links, footer, hold })`: the closing card.

`prepare.mjs` writes the overlays to `timeline.annotations` and the voice cues, at their time in the
finished video, to `timeline.voiceCues`. The components live in `remotion/src/annotations/`.

## Licences

Remotion is free for individuals and teams of up to three people; larger companies need a
[Remotion licence](https://www.remotion.dev/license). Music: Mixkit "Digital Clouds" (Mixkit free
licence). Sound effects: Remotion's sound effects and Kenney Interface Sounds (CC0).
