import { existsSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cliDir = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(cliDir, '.pack-manifest.json');

if (!existsSync(manifestPath)) {
  console.error('[postpack] no manifest found, nothing to clean');
  process.exit(0);
}

const { copied = [] } = JSON.parse(readFileSync(manifestPath, 'utf-8'));

for (const name of copied) {
  const path = join(cliDir, name);
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
    console.error(`[postpack] removed cli/${name}`);
  }
}

rmSync(manifestPath, { force: true });
console.error('[postpack] manifest cleared');
