# Launch Checklist — v0.1

Roteiro do "zip no /home/claude" até "no ar, com stars, com tweet viral". Foco no que dá pra fazer em 1-2 finais de semana.

## Day 0 — setup do repo

- [ ] Criar repo público `grippado/roaster-kit` no GitHub
- [ ] `git init` no conteúdo do kit, primeiro commit: "initial commit: skill + CLI + slash command"
- [ ] Adicionar `.gitignore` para Node: `node_modules/`, `.env`, `*.log`, `dist/`, `.DS_Store`
- [ ] Proteger branch `main`, exigir PR para merges (disciplina pra futuro)
- [ ] Configurar topics do repo no GitHub: `claude-skill`, `cli`, `roast`, `github-api`, `developer-humor`, `open-source`
- [ ] Escolher uma social preview image — pode ser o terminal screenshot do README renderizado

## Day 1 — testar de verdade

Agora que não estamos mais no sandbox:

- [ ] Clonar localmente, `cd cli && npm install`
- [ ] Criar `.env` com `ANTHROPIC_API_KEY` + `GITHUB_TOKEN`
- [ ] `node bin/roaster.js grippado --persona=linus --spice=spicy` — roast real, a sério
- [ ] Rodar em 5 perfis diferentes pra calibrar:
  - [ ] Seu perfil (`grippado`)
  - [ ] Alguém famoso autoroastável (`torvalds` — ele já foi roastado pela internet mil vezes)
  - [ ] Um perfil de dev ativo e prolífico (ver o que o skill detecta bem)
  - [ ] Um perfil de dev iniciante (validar o `softRoastFlag` funcionando)
  - [ ] Um perfil com só 1-2 repos (caso extremo do soft roast)
- [ ] Testar todas 8 personas no mesmo perfil pra ver se as vozes estão distintas o suficiente
- [ ] Testar `--format=twitter` pra confirmar <280 chars consistente
- [ ] Testar `--lang=pt-br` pra ver se a tradução de persona funciona bem

**Sinal de calibração boa:** se eu te entrego 3 roasts do mesmo perfil com personas diferentes e você consegue identificar a persona sem ver o nome → passou.

## Day 2 — iterar baseado no teste

- [ ] Ajustar prompts em `cli/src/prompt.js` se algum persona ficou fraco
- [ ] Adicionar tells que deram risada e faltaram
- [ ] Remover tells que não geraram piada real
- [ ] Atualizar `personas/<n>.md` com novas calibration examples baseadas nos outputs reais
- [ ] Se alguma persona não ficou distinguível das outras → rescrever voice rules

## Day 3 — publicar no npm

- [ ] Criar conta/scope `@grippado` no npmjs.com (se ainda não existe)
- [ ] Testar `npm pack` pra ver o que vai no pacote, remover lixo via `"files"` do package.json
- [ ] `npm login`
- [ ] `npm publish --access public`
- [ ] Testar `npx @grippado/roaster-kit grippado` numa máquina limpa/diferente
- [ ] Adicionar badge de npm ao README: `![npm version](https://img.shields.io/npm/v/@grippado/roaster-kit)`

## Day 4 — assets de lançamento

- [ ] **GIF demo** gravado com asciinema ou terminalizer
  - Mostrar: install → rodar em `grippado` → ver o roast aparecer linha a linha
  - Duração ideal: 15-25 segundos
  - Exportar como GIF otimizado (≤ 2MB)
  - Adicionar ao topo do README
- [ ] **Screenshot de referência** do roast em formato terminal — vira imagem de capa do post
- [ ] **Tweet de lançamento** já rascunhado (ver abaixo)
- [ ] **Post do Reddit** já rascunhado (ver abaixo)

## Day 5 — lançar

Ordem de lançamento importa. Fazer nesta sequência:

1. **Tweet/post próprio** — early morning BR time (anoitecer US West Coast, manhã Europa)
2. **Reddit r/webdev** — 1h depois do tweet. Título abaixo.
3. **Reddit r/programming** — só se r/webdev performar. Eles são mais rigorosos.
4. **LinkedIn post** — no final do dia, formato mais sério/irônico
5. **Show HN** no dia seguinte — só se os primeiros posts pegaram tração. HN castiga lançamentos com zero social proof.

### Rascunho de tweet

> built a tool that roasts your github in the voice of linus, jobs, carmack + 5 other tech icons
>
> paste a username, pick your executioner, get humbled
>
> i tested it on myself first. it was rough.
>
> `npx @grippado/roaster-kit yourname`
>
> [GIF]

### Rascunho de título Reddit (r/webdev)

> *"I built a CLI that roasts your GitHub in Linus Torvalds' voice. First roast was on myself and it hurt."*

Corpo do post: link pro repo, o GIF, um exemplo real do roast em você, convite pra tentarem.

**Por que self-deprecating abre o post:** Reddit pune autopromoção descarada. Se você abre com "testei em mim e doeu", vira "cara corajoso compartilhando coisa divertida" em vez de "cara vendendo produto". Tática antiga e funciona.

### Rascunho de post LinkedIn

Formato irônico — usar o próprio `--format=linkedin` do roaster no seu próprio perfil e postar o resultado. Meta. Viral. Self-deprecating. Gera comentário "ESPERA ISSO É REAL?". Perfeito.

## Day 7 — pós-lançamento

- [ ] Responder a cada comentário do Reddit/Twitter nas primeiras 48h (crítico pro algoritmo)
- [ ] Abrir issues para os pedidos recorrentes que aparecerem
- [ ] Aceitar PRs de novas personas se a qualidade passar — ter critério
- [ ] Marcar no calendário: revisitar em 2 semanas pra decidir se v0.2 (landing) vale o esforço
- [ ] Se viralizar: escrever blog post *"How I built roaster-kit in a weekend with Claude Code"* — conteúdo orgânico pro seu próprio brand

## Gatilhos pra ir pra v0.2 (landing)

Só começar a construir a landing se:
- ≥ 100 stars no repo
- OU ≥ 1 post com 500+ upvotes em algum subreddit
- OU ≥ 1 tweet com 10k+ impressões

Sem um desses, a landing é esforço prematuro. Fica no backlog sem culpa.

## Se NÃO viralizar

Normal. 90% dos side projects não viralizam. O kit ainda vale:
- Conteúdo pra seus posts de LinkedIn sobre Claude Code workflow
- Prova de que você ship side projects → ajuda no PDI L12
- Funciona como ferramenta pessoal mesmo sem tração pública
- Portfolio piece pra candidaturas futuras

Não ligar se flopar. Ship next thing.

## Riscos a monitorar

- **GitHub rate limit se viralizar sem token:** usar `GITHUB_TOKEN` desde o dia 1
- **Alguém usar pra bullying de dev específico:** se aparecer issue sobre isso, responder rápido, ajustar `safety-examples.md`, considerar adicionar "report roast" mechanism depois
- **Anthropic API cost se rodarem em loop:** cap de budget no console antes do lançamento
- **Trademark dos personas:** todos são public figures, voz é parody, mas se alguém reclamar legalmente → remover a persona específica sem drama, seguir em frente
