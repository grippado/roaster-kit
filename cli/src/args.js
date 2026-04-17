// Minimal argv parser. Keeps us zero-dep beyond the Anthropic SDK.

const VALID_PERSONAS = [
  'linus',
  'steve-jobs',
  'bill-gates',
  'trump',
  'maddog',
  'dhh',
  'carmack',
  'terry-davis',
];
const VALID_SPICE = ['mild', 'spicy', 'nuclear'];
const VALID_FORMATS = ['reddit', 'twitter', 'linkedin', 'terminal'];
const VALID_LANGS = ['en', 'pt-br'];

const DEFAULTS = {
  persona: 'linus',
  spice: 'spicy',
  format: 'reddit',
  lang: 'en',
  sources: ['github'],
  model: 'claude-sonnet-4-6',
  consented: false,
  help: false,
  version: false,
};

export function parseArgs(argv) {
  const out = { ...DEFAULTS };
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      out.help = true;
    } else if (arg === '--version' || arg === '-v') {
      out.version = true;
    } else if (arg === '--consented' || arg === '--they-know') {
      out.consented = true;
    } else if (arg.startsWith('--persona=')) {
      out.persona = arg.split('=')[1];
    } else if (arg === '--persona' || arg === '-p') {
      out.persona = argv[++i];
    } else if (arg.startsWith('--spice=')) {
      out.spice = arg.split('=')[1];
    } else if (arg === '--spice' || arg === '-s') {
      out.spice = argv[++i];
    } else if (arg.startsWith('--format=')) {
      out.format = arg.split('=')[1];
    } else if (arg === '--format' || arg === '-f') {
      out.format = argv[++i];
    } else if (arg.startsWith('--lang=')) {
      out.lang = arg.split('=')[1].toLowerCase();
    } else if (arg === '--lang' || arg === '-l') {
      out.lang = (argv[++i] || '').toLowerCase();
    } else if (arg.startsWith('--sources=')) {
      out.sources = arg.split('=')[1].split(',');
    } else if (arg === '--sources') {
      out.sources = (argv[++i] || '').split(',');
    } else if (arg.startsWith('--model=')) {
      out.model = arg.split('=')[1];
    } else if (arg === '--model' || arg === '-m') {
      out.model = argv[++i];
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown flag: ${arg}`);
    } else {
      // Accept "@username" or "username"
      positional.push(arg.replace(/^@/, ''));
    }
  }

  out.target = positional[0] || null;

  if (out.help || out.version) return out;

  if (!out.target) {
    throw new Error(
      'Missing GitHub username.\n  Try:  roaster grippado --persona=steve-jobs --spice=spicy\n'
    );
  }
  if (!VALID_PERSONAS.includes(out.persona)) {
    throw new Error(
      `Invalid persona: ${out.persona}\n  Valid: ${VALID_PERSONAS.join(', ')}`
    );
  }
  if (!VALID_SPICE.includes(out.spice)) {
    throw new Error(
      `Invalid spice: ${out.spice}\n  Valid: ${VALID_SPICE.join(', ')}`
    );
  }
  if (!VALID_FORMATS.includes(out.format)) {
    throw new Error(
      `Invalid format: ${out.format}\n  Valid: ${VALID_FORMATS.join(', ')}`
    );
  }
  if (!VALID_LANGS.includes(out.lang)) {
    throw new Error(
      `Invalid lang: ${out.lang}\n  Valid: ${VALID_LANGS.join(', ')}`
    );
  }

  return out;
}

export const HELP_TEXT = `
  roaster — roast a developer's public GitHub profile

  Usage:
    roaster <github-username> [options]

  Options:
    -p, --persona <name>    Voice to roast in. Default: linus
                            Values: linus, steve-jobs, bill-gates, trump,
                                    maddog, dhh, carmack, terry-davis
    -s, --spice <level>     Intensity. Default: spicy
                            Values: mild, spicy, nuclear
    -f, --format <shape>    Output shape. Default: reddit
                            Values: reddit, twitter, linkedin, terminal
    -l, --lang <code>       Output language. Default: en
                            Values: en, pt-br
    -m, --model <id>        Anthropic model ID. Default: claude-sonnet-4-6
                            Examples: claude-sonnet-4-6, claude-opus-4-7
        --sources <list>    Comma-separated data sources. Default: github
        --sources <list>    Comma-separated data sources. Default: github
                            Values: github, npm, crates, go
        --consented         Confirm the target is in on the joke. Required for
                            spicy/nuclear against a third party.
    -h, --help              Show this help.
    -v, --version           Show version.

  Environment:
    ANTHROPIC_API_KEY       Required. Get one at https://console.anthropic.com
    GITHUB_TOKEN            Optional. Higher rate limits (60 → 5000/hr).

  Examples:
    roaster grippado
    roaster torvalds --persona=trump --format=twitter
    roaster @yourself --spice=nuclear --lang=pt-br --sources=github,npm

  Public data only. Punch up or sideways, never down. ❤️
`;
