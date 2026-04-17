import { cpSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cliDir = dirname(dirname(fileURLToPath(import.meta.url)));
const rootDir = dirname(cliDir);

const plan = [
  { from: 'skill', to: 'skill' },
  { from: 'README.md', to: 'README.md' },
  { from: 'LICENSE', to: 'LICENSE' },
];

const copied = [];
for (const { from, to } of plan) {
  const src = join(rootDir, from);
  const dest = join(cliDir, to);
  if (!existsSync(src)) {
    console.error(`[prepack] source not found, skipping: ${from}`);
    continue;
  }
  if (existsSync(dest)) {
    console.error(
      `[prepack] destination already exists, leaving untouched: cli/${to}`
    );
    continue;
  }
  cpSync(src, dest, { recursive: true });
  copied.push(to);
  console.error(`[prepack] copied ${from} -> cli/${to}`);
}

writeFileSync(
  join(cliDir, '.pack-manifest.json'),
  JSON.stringify({ copied }, null, 2)
);

console.error(`[prepack] wrote manifest with ${copied.length} entries`);
