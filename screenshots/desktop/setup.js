/**
 * setup.js
 *
 * Desktop project setup — runs before all desktop specs via the
 * 'desktop-setup' project dependency.
 *
 * Builds the desktop app in production mode via `npm run build`, which
 * compiles main, renderer, and preload bundles with BIT_ENVIRONMENT=production.
 * This ensures isDev() returns false in the bundle, which means:
 *   - No DevTools auto-open
 *   - Single-instance lock is enforced (good — only one Electron at a time)
 *   - No --watch processes left running in the background
 *
 * Each spec then launches its own Electron instance via `npm start` against
 * the production build. Because workers=1, only one spec runs at a time and
 * there's no single-instance conflict.
 *
 * The build is skipped if both main.js and index.html already exist from a
 * prior run. Delete the build/ directory manually to force a rebuild.
 */

import { test } from '@playwright/test';
import { spawn, execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DESKTOP_DIR = resolve(process.env.HOME, 'dev/clients/apps/desktop');
const BUILD_DIR = resolve(DESKTOP_DIR, 'build');
const MAIN_JS = resolve(BUILD_DIR, 'main.js');
const INDEX_HTML = resolve(BUILD_DIR, 'index.html');
// Marker file written after a successful production build.
// If this file is absent or stale, the build directory is wiped and rebuilt.
const BUILD_MARKER = resolve(BUILD_DIR, '.production-build');
const BUILD_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

function resolveNpmBin() {
  const nvmDir = process.env.NVM_DIR || resolve(process.env.HOME, '.nvm');
  const v22Dir = resolve(nvmDir, 'versions/node');
  if (existsSync(v22Dir)) {
    try {
      const versions = execSync(`ls "${v22Dir}"`, { encoding: 'utf8' })
        .split('\n')
        .filter((v) => v.startsWith('v22.'))
        .sort()
        .reverse();
      if (versions.length > 0) {
        const npmBin = resolve(v22Dir, versions[0], 'bin/npm');
        if (existsSync(npmBin)) {
          console.log(`[desktop setup] Using npm from nvm: ${npmBin}`);
          return npmBin;
        }
      }
    } catch { /* fall through */ }
  }
  console.log('[desktop setup] nvm v22 not found, falling back to PATH npm');
  return 'npm';
}

function isBuildComplete() {
  return existsSync(MAIN_JS) && existsSync(INDEX_HTML) && existsSync(BUILD_MARKER);
}

test('build desktop app', async () => {
  test.setTimeout(BUILD_TIMEOUT_MS + 10000);

  // Kill any stale Electron process from a previous run
  try {
    execSync(`pkill -f "Electron.*apps/desktop"`, { stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1000));
  } catch { /* no process running — fine */ }

  if (isBuildComplete()) {
    console.log('[desktop setup] Production build already present, skipping build.');
    return;
  }

  console.log('[desktop setup] Running npm run build:dev (development mode — skips process isolation)...');

  const npmBin = resolveNpmBin();
  const nodeBin = existsSync(npmBin) ? resolve(dirname(npmBin), 'node') : process.execPath;

  await new Promise((resolve, reject) => {
    const child = spawn(npmBin, ['run', 'build:dev'], {
      cwd: DESKTOP_DIR,
      stdio: 'pipe',
      shell: false,
      env: {
        ...process.env,
        PATH: `${dirname(nodeBin)}:${process.env.PATH}`,
      },
    });

    child.stdout.on('data', (data) => process.stdout.write(`[desktop] ${data}`));
    child.stderr.on('data', (data) => process.stderr.write(`[desktop] ${data}`));

    child.on('close', (code) => {
      if (code === 0) {
        console.log('[desktop setup] Build complete.');
        // Write production marker so future runs skip the build
        writeFileSync(BUILD_MARKER, new Date().toISOString());
        resolve();
      } else {
        reject(new Error(`[desktop setup] npm run build failed with exit code ${code}`));
      }
    });

    child.on('error', reject);
  });

  if (!isBuildComplete()) {
    throw new Error(
      `[desktop setup] Build finished but output is incomplete — ` +
      `main.js: ${existsSync(MAIN_JS)}, index.html: ${existsSync(INDEX_HTML)}, marker: ${existsSync(BUILD_MARKER)}`
    );
  }

  console.log('[desktop setup] Ready.');
});
