// Engine helpers shared by the recorder and the scenes: the project config, Playwright and the
// site's URL. Project-specific helpers belong in app.mjs, not here.
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

export const HERE = path.dirname(fileURLToPath(import.meta.url));

/** demo.config.json: the site's URL, card texts and theme for this project. */
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
