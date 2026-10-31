// The 1.0 release reel: one ~60 s clip for social posts, with a voiceover. Each section starts on a
// voice line (scenes/reel.voice.json, read by `node voiceover.mjs synth reel`), and the take waits
// for a line to finish before the next one starts or the picture cuts away.
// Needs the static export served at demo.config.json's frontendUrl, with the local-only
// /reel pages (apps/web/app/(demo)/).
import fs from 'fs';
import path from 'path';
import { HERE } from '../lib.mjs';
import { LEAD_IN } from '../voiceover.mjs';

const LENGTHS = JSON.parse(fs.readFileSync(path.join(HERE, 'voice', 'reel.lengths.json'), 'utf8'));
// Breath between two lines.
const GAP = 0.25;
// Cursor glide for clicks, ms: brisk, it is a reel.
const GLIDE = 520;

export default {
  id: 'reel',
  title: 'shadcn-react-table 1.0',
  async run(r) {
    // The engine waits up to 1.5 s for animations before each click; the row glides are part of
    // the show, so a short wait is enough.
    const still = r.stillness;
    r.stillness = () => Promise.race([still(), r.sleep(250)]);

    let until = 0;
    const done = async () => {
      const ms = until - Date.now();
      if (ms > 0) await r.sleep(ms);
    };
    /**
     * Speaks a line and shows it as a caption bubble whose words light up as they are said.
     * `shown` is the bubble's text (with **accents**); false shows none (a headline says it).
     */
    const say = async (text, shown = text) => {
      await done();
      if (!(text in LENGTHS)) throw new Error(`No voice line "${text}": run voiceover.mjs synth reel`);
      r.voice(text);
      const ms = (LEAD_IN + LENGTHS[text] + GAP) * 1000;
      if (shown)
        await r.bubble(null, shown, {
          hold: ms + 350,
          speak: LENGTHS[text] * 1000 - 150,
          speakAt: LEAD_IN * 1000,
        });
      until = Date.now() + ms;
    };
    // Keycaps go in the empty strip left of the toolbar, clear of the rows.
    const KEYS_AT = { x: 236, y: 6 };
    /** Cuts to another page: the load happens off camera. */
    const cut = async (url) => {
      await done();
      r.hide();
      await r.goto(url);
      await still();
      r.show();
    };
    const page = () => r.page;
    const click = (loc, after = 450) => r.click(loc, { ms: GLIDE, after });
    const button = (name, nth = 0) => page().getByRole('button', { name, exact: true }).nth(nth);
    const header = (name) => page().getByRole('columnheader', { name: new RegExp(name, 'i') });
    const grip = (name) => header(name).getByRole('button', { name: 'Reorder column' });
    /** Presses at `from`, glides to (x, y) and lets go: a pointer drag the camera follows. */
    const drag = async (from, x, y, ms = 700) => {
      const b = await r.pointAt(from, { ms: GLIDE });
      await page().mouse.down();
      await r.moveTo(b.x + b.width / 2 + 12, b.y + b.height / 2, 90);
      await r.moveTo(x, y, ms);
      await r.sleep(100);
      await page().mouse.up();
      await r.sleep(350);
    };

    r.end({
      title: 'Stop rebuilding. **Start shipping.**',
      command: 'npx shadcn@latest add monabbir-ahmmad.github.io/shadcn-react-table/r/data-table.json',
      links: ['Docs', 'Examples', 'GitHub'],
      footer: 'Free and open source · MIT',
      hold: 4200,
    });

    await r.openAs(null);
    await r.warm(['/reel/', '/reel/big/', '/reel/rtl/']);
    await r.goto('/');
    await r.startCapture();
    r.show();

    // ---- Hook: the hero's live table behind two headlines.
    await r.sleep(300);
    await say('Stop rebuilding data tables.', false);
    await r.headline('Stop rebuilding **data tables**.', { hold: 1900 });
    await say('Meet shadcn react table, 1.0.', false);
    await r.headline('shadcn-react-table **1.0**', { hold: 2500 });

    // ---- The table: sort, search.
    await cut('/reel/');
    r.code('useDataTable({ data, columns })', { at: 'top-left' });
    await say('Sort and search, out of the box.', '**Sort** and **search**, out of the box.');
    await click(button('Sort by Salary ascending'), 800);
    await click(button('Search'), 250);
    await r.type(page().getByPlaceholder('Search…'), 'research', 45);
    await r.sleep(800);
    await page().keyboard.press('Control+A');
    await page().keyboard.press('Backspace');
    await r.sleep(450);
    r.code(null);

    // ---- Columns: drag one into place, resize another.
    await say(
      'Drag columns into place. Resize them to fit.',
      '**Drag** columns into place. **Resize** them to fit.',
    );
    const team = await header('team').boundingBox();
    await drag(grip('rating'), team.x + 8, team.y + team.height / 2);
    const rb = await r.pointAt(page().getByRole('separator', { name: 'Resize column' }).first(), {
      ms: GLIDE,
    });
    await page().mouse.down();
    await r.moveTo(rb.x + rb.width / 2 + 120, rb.y + rb.height / 2, 600);
    await page().mouse.up();
    await r.sleep(300);

    // ---- Selection: one row, then a range with Shift.
    await say('Select one row, or a whole range.', 'Select one row, or a **whole range**.');
    const boxes = page().getByRole('checkbox', { name: 'Select row' });
    await click(boxes.nth(0), 300);
    await r.pointAt(boxes.nth(5), { ms: GLIDE });
    r.keys(['Shift', 'Click'], KEYS_AT);
    await page().keyboard.down('Shift');
    await click(boxes.nth(5), 250);
    await page().keyboard.up('Shift');
    await r.sleep(500);

    // ---- Editing: a raise sends the row gliding up the sorted table.
    await say('Edit right in the cell.', '**Edit** right in the cell.');
    await click(page().locator('tbody tr').nth(3).getByRole('button').last(), 300);
    await page().keyboard.press('Control+A');
    await page().keyboard.type('250000', { delay: 55 });
    await r.sleep(200);
    r.keys('Enter', KEYS_AT);
    await page().keyboard.press('Enter');
    r.success();
    await r.sleep(1100);

    // ---- Grouping: drop a column on the group zone.
    await say('Group your data, with totals, in one move.', '**Group** your data, with totals, in one move.');
    const zone = await page().locator('[data-slot="data-table-group-zone"]').boundingBox();
    await drag(grip('team'), zone.x + 180, zone.y + zone.height / 2, 800);
    await r.sleep(1600);

    // ---- Scale: 100,000 rows, virtualized, flung through in one smooth scroll.
    await cut('/reel/big/');
    await say('A hundred thousand rows? Still smooth.', 'A hundred thousand rows? **Still smooth.**');
    await r.stat({ value: 100000, label: 'rows · virtualized', hold: 1300 });
    await r.moveTo(800, 520, 400);
    await page().evaluate(
      () =>
        new Promise((done) => {
          const el = [...document.querySelectorAll('[data-slot="data-table-surface"] *, [data-slot="data-table-surface"]')].find(
            (e) => e.scrollHeight > e.clientHeight + 100 && getComputedStyle(e).overflowY !== 'visible',
          );
          if (!el) return done();
          const to = Math.min(el.scrollHeight - el.clientHeight, 5000);
          const start = performance.now();
          const step = (now) => {
            const k = Math.min(1, (now - start) / 2400);
            el.scrollTop = to * (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2);
            if (k < 1) requestAnimationFrame(step);
            else done();
          };
          requestAnimationFrame(step);
        }),
    );
    await r.sleep(300);

    // ---- Styles: the table restyles in every shadcn style.
    await cut('/#customize');
    await say('It looks like your app, in any shadcn style.', 'It looks like **your app**, in any shadcn style.');
    const style = page().getByLabel('Style', { exact: true });
    for (const name of ['Maia', 'Lyra']) {
      await click(style, 250);
      await click(page().getByRole('option', { name: new RegExp(`^${name}`) }).first(), 900);
    }

    // ---- Languages: Arabic, right to left.
    await cut('/reel/rtl/');
    await say('Thirty-eight languages. Right to left, included.', '**38 languages.** Right to left, included.');
    await r.stat({ value: 38, label: 'languages · right to left included', hold: 1600 });

    // ---- The close: the install command on the end card.
    await say('One command. The code is yours.', false);
    // A beat on the page, so the line's cue lands on the end card, not after it.
    await r.sleep(60);
    r.hide();
  },
};
