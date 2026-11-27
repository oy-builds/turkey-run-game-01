// main.ts — entrypoint for the Turkey Trot entry (turkey-run-game-01).
//
// The game is plain static files under game/ (game/index.html plus its ES
// modules — no library, no build step, no network request) and 3 or 4
// screenshots of it under screenshots/. This program hands both in: it copies
// game/ and screenshots/ from beside this file into the output directory and
// writes /output/dossier.json, the summary the gate and the judge read, using
// buildDossier from the vendored make.fun library.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's caps, as the kit documents them: the dossier text is capped at
// 160 KiB; screenshots are at most 4 files of 256 KiB; game/ holds at most 993
// files and directories and 48 MiB in all, with no path over 1000 bytes. The
// whole of /output shares the platform's own 1000-entry / 64 MiB cap.
// The program is deterministic: two runs over the same tree write the same
// bytes, which is what the grader checks.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
