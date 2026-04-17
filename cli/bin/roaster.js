#!/usr/bin/env node
import { run } from '../src/index.js';

run(process.argv.slice(2)).catch((err) => {
  console.error(`\n✘ ${err.message}\n`);
  if (process.env.DEBUG) console.error(err.stack);
  process.exit(1);
});
