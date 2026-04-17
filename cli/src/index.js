import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, HELP_TEXT } from './args.js';
import { collectGitHub } from './collectors/github.js';
import { collectNpm, npmTells } from './collectors/npm.js';
import { collectCrates, cratesTells } from './collectors/crates.js';
import { collectGo, goTells } from './collectors/go.js';
import { buildSystemPrompt, buildUserPrompt } from './prompt.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

export async function run(argv) {
  const args = parseArgs(argv);

  if (args.help) {
    process.stdout.write(HELP_TEXT + '\n');
    return;
  }
  if (args.version) {
    process.stdout.write(`roaster ${pkg.version}\n`);
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'Set ANTHROPIC_API_KEY in your environment.\n  Get one at https://console.anthropic.com'
    );
  }

  log(`▸ Collecting data for @${args.target}...`);

  // GitHub is always the anchor
  const data = await collectGitHub(args.target);

  // Optional sources
  if (args.sources.includes('npm')) {
    log('  · npm...');
    try {
      const packages = await collectNpm(args.target);
      data.packages = { ...(data.packages || {}), npm: packages };
      data.tells.push(...npmTells(packages));
      if (!data.meta.sources.includes('npm')) data.meta.sources.push('npm');
    } catch (err) {
      log(`  · npm skipped (${err.message})`);
    }
  }

  if (args.sources.includes('crates')) {
    log('  · crates.io...');
    try {
      const crates = await collectCrates(args.target);
      data.packages = { ...(data.packages || {}), crates };
      data.tells.push(...cratesTells(crates));
      if (!data.meta.sources.includes('crates')) data.meta.sources.push('crates');
    } catch (err) {
      log(`  · crates skipped (${err.message})`);
    }
  }

  if (args.sources.includes('go')) {
    log('  · pkg.go.dev...');
    try {
      // Infer Go repos from the languageBreakdown hint + a fresh repo list call
      // NOTE: we'd need the raw repo list here. For now, only runs if top language is Go.
      // TODO v0.2: refactor collectGitHub to expose the raw repos list so Go + future
      // collectors can introspect it without re-fetching.
      const hasGo = data.portfolio.languageBreakdown.some(
        (l) => l.language === 'Go'
      );
      if (!hasGo) {
        log('  · go skipped (no Go repos detected)');
      } else {
        log('  · go skipped (repo-list introspection not wired yet — see TODO)');
      }
    } catch (err) {
      log(`  · go skipped (${err.message})`);
    }
  }

  // Soft-roast safety override
  if (data.meta.softRoastFlag && args.spice !== 'mild') {
    log(
      `  · target appears to be a learner — softening spice from "${args.spice}" to "mild"`
    );
    args.spice = 'mild';
  }

  log(`▸ ${data.tells.length} tells collected. Generating roast...`);

  // Call the Claude API
  const client = new Anthropic();
  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2000,
    system: buildSystemPrompt({
      persona: args.persona,
      spice: args.spice,
      format: args.format,
      lang: args.lang,
      data,
    }),
    messages: [
      { role: 'user', content: buildUserPrompt({ target: args.target }) },
    ],
  });

  const roast = message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');

  process.stdout.write('\n' + roast + '\n\n');

  // Share hints
  process.stderr.write(
    `──\n  Share suggestions:\n` +
      `  • Reddit title: "I had Claude roast my GitHub in the voice of ${PERSONA_LABEL[args.persona]}"\n` +
      `  • Twitter: post as image screenshot of the terminal format\n` +
      `  • Try: roaster ${args.target} --format=terminal\n\n`
  );
}

const PERSONA_LABEL = {
  linus: 'Linus Torvalds',
  'steve-jobs': 'Steve Jobs',
  'bill-gates': 'Bill Gates',
  trump: 'Donald Trump (parody)',
  maddog: 'Jon "Maddog" Hall',
  dhh: 'DHH',
  carmack: 'John Carmack',
  'terry-davis': 'Terry Davis',
};

function log(msg) {
  if (!process.env.QUIET) process.stderr.write(msg + '\n');
}
