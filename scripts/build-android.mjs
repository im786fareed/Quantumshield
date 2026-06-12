/**
 * QuantumShield — Android bundle build
 * =====================================
 * Produces a fully static export in `out/` for Capacitor to bundle into
 * the APK (instead of loading the website remotely, which Google Play
 * rejects under the "minimum functionality" policy).
 *
 * Next.js static export cannot include API route handlers, so this script
 * temporarily moves src/app/api aside, builds with CAPACITOR_BUILD=true,
 * then restores it. The bundled app calls the production deployment for
 * API features (see src/lib/apiBase.ts).
 *
 * Usage: npm run build:android
 */
import { execSync } from 'node:child_process';
import { existsSync, renameSync, rmSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const API_DIR = path.join(ROOT, 'src', 'app', 'api');
const API_TMP = path.join(ROOT, '.api-excluded-during-export');
const MIDDLEWARE = path.join(ROOT, 'src', 'middleware.ts');
const MIDDLEWARE_TMP = path.join(ROOT, '.middleware-excluded-during-export');

function renameWithRetry(from, to) {
  for (let attempt = 1; ; attempt++) {
    try {
      renameSync(from, to);
      return;
    } catch (err) {
      if (attempt >= 5) {
        console.error(
          `\n✖ Could not move ${from}.\n` +
          `  On Windows this usually means the dev server is running and ` +
          `locking the folder — stop "npm run dev" and try again.\n`
        );
        throw err;
      }
      // brief pause before retrying (file watchers releasing locks)
      const waitUntil = Date.now() + 1000 * attempt;
      while (Date.now() < waitUntil) { /* busy wait — script context only */ }
    }
  }
}

function moveAside() {
  if (existsSync(API_DIR)) renameWithRetry(API_DIR, API_TMP);
  if (existsSync(MIDDLEWARE)) renameWithRetry(MIDDLEWARE, MIDDLEWARE_TMP);
}

function restore() {
  if (existsSync(API_TMP)) renameWithRetry(API_TMP, API_DIR);
  if (existsSync(MIDDLEWARE_TMP)) renameWithRetry(MIDDLEWARE_TMP, MIDDLEWARE);
}

console.log('▶ Building static Android bundle (API routes excluded)…');
moveAside();
try {
  rmSync(path.join(ROOT, 'out'), { recursive: true, force: true });
  // Clear stale build artifacts (dev-server type manifests still reference
  // the API routes we just moved aside).
  rmSync(path.join(ROOT, '.next'), { recursive: true, force: true });
  execSync('npx next build --webpack', {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, CAPACITOR_BUILD: 'true' },
  });
  console.log('✔ Static export written to out/');
} finally {
  restore();
}
