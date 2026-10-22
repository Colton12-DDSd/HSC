import { readFile, writeFile } from 'node:fs/promises';
const json = async (path) =>
  JSON.parse(await readFile(new URL('../' + path, import.meta.url), 'utf8'));
const [coverage, cards, baseline] = await Promise.all([
  json('data/minion-coverage.json'),
  json('public/data/cards.json'),
  json('data/battlecry-wave2-baseline.json'),
]);
const byId = new Map(cards.map((c) => [c.id, c]));
const enabled = coverage.minions.filter((m) => m.printings.some((p) => p.supported && p.battlecry));
const names = new Set(enabled.map((m) => m.name));
for (const name of baseline.names)
  if (!names.has(name)) throw Error(`Battlecry coverage regressed: ${name}`);
const added = enabled.filter((m) => !baseline.names.includes(m.name));
const pending = coverage.minions.filter(
  (m) =>
    !names.has(m.name) && m.printings.some((p) => byId.get(p.id)?.mechanics?.includes('BATTLECRY')),
);
const clean = (s) =>
  (s ?? '')
    .split('@')[0]
    .replace(/<[^>]+>|\[x\]|[$#&]/g, '')
    .replace(/\s+/g, ' ')
    .replaceAll('|', '\\|')
    .trim();
const row = (m, implemented) => {
  const ps = m.printings.filter((p) =>
    implemented ? p.supported && p.battlecry : byId.get(p.id)?.mechanics?.includes('BATTLECRY'),
  );
  return `| ${m.name.replaceAll('|', '\\|')} | ${ps.map((p) => p.id).join(', ')} | ${clean(ps[0]?.text)} |`;
};
await writeFile(
  new URL('../docs/BATTLECRY-WAVE2-MANIFEST.md', import.meta.url),
  `# Battlecry expansion — 2026-10-22\n\nAdded **${added.length} unique names** beyond the ${baseline.names.length}-name baseline at ${baseline.commit}. Current coverage: **${names.size} Battlecry names**. See [rules, tests and deck guide](TEST-DECKS.md).\n\n| Minion | Enabled printings | Printed rules |\n| --- | --- | --- |\n${added.map((m) => row(m, true)).join('\n')}\n`,
);
await writeFile(
  new URL('../docs/BATTLECRY-REMAINING.md', import.meta.url),
  `# Remaining Battlecries — 2026-10-22\n\n**${pending.length} unique Battlecry minion names remain unsupported** in the pinned collection. This list is an implementation backlog, not enabled content. Some require new systems (auras, Secrets, spell casting/repetition, hero powers, mana/health/corpse resources, custom card construction, Infuse, Forge, Herald, Ritual and other expansion mechanics); others need additional full-clause patterns or card-specific rules. Existing numeric templates alone cannot finish the list.\n\nUnknown clauses remain blocked. Generated-card abilities are tracked independently from the source Battlecry. Local sandbox decks do not assert Wild legality. Run \`npm run audit:battlecries\` to regenerate both this backlog and the added-card manifest.\n\n| Minion | Candidate printings | Printed rules |\n| --- | --- | --- |\n${pending.map((m) => row(m, false)).join('\n')}\n`,
);
console.log(
  JSON.stringify(
    { added: added.length, supported: names.size, remaining: pending.length },
    null,
    2,
  ),
);
