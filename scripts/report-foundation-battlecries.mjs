import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = async (p) => JSON.parse(await readFile(new URL(p, root), 'utf8'));
const [frozen, coverage] = await Promise.all([
  read('data/foundation-battlecry-targets.json'),
  read('data/minion-coverage.json'),
]);
const printings = new Map(coverage.minions.flatMap((m) => m.printings.map((p) => [p.id, p])));
const dependency = (text) => {
  if (/Kindred/.test(text)) return 'Kindred activation, history and dependent targeting/costs';
  if (/starting hand|started with|didn.t start|Upgrades each time/.test(text))
    return 'Original-card identity, starting snapshots or while-held progression';
  if (/Snapshot|Suitcase|Jars|Bones of/.test(text))
    return 'Generated cards that carry stored cards or victim-specific values';
  if (/You pick the targets|hand or battlefield/.test(text))
    return 'Multiple selections or a choice spanning hand and battlefield';
  if (/Attack YOUR hero|Attack three|kills a minion this turn/.test(text))
    return 'Forced attacks or a combat-result listener';
  if (
    /Concoction|Potion|Dream card|Spare Part|from the past|Power Chord|Infinite Banana/.test(text)
  )
    return 'Verified named pool and complete generated-card behavior';
  if (/Aura|Nest|Totem|invention|Treasure Chest|FULL of Coins|Highkeeper Ra|Epoch/.test(text))
    return 'Special token, passive, start/end trigger or Aura lifecycle';
  if (/Frozen until|healing effect|Overloaded this turn|Animal Companions/.test(text))
    return 'Persistent rule, resource threshold or effect replacement';
  if (/Choose One|Magnetic|Tendrils|Hero Power|Jail/.test(text))
    return 'Generated-card keyword/subsystem and its complete lifecycle';
  return 'Authored complete transaction, target relationship and independent outcome tests';
};
const entries = frozen.entries.map((e) => {
  const complete = e.printings.every(
    (p) => printings.get(p.id)?.supported && printings.get(p.id)?.battlecry,
  );
  return {
    name: e.name,
    group: e.primary,
    complete,
    ids: e.printings.map((p) => p.id),
    text: e.printings[0].normalizedText,
    ...(complete ? {} : { dependency: dependency(e.printings[0].normalizedText) }),
  };
});
const complete = entries.filter((e) => e.complete),
  pending = entries.filter((e) => !e.complete);
const currentNames = coverage.minions
  .filter((m) => m.printings.some((p) => p.supported && p.battlecry))
  .map((m) => m.name);
const extra = currentNames.filter(
  (n) => !frozen.baselineSupportedNames.includes(n) && !frozen.names.includes(n),
);
const report = {
  baselineCommit: frozen.commit,
  target: entries.length,
  completed: complete.length,
  remaining: pending.length,
  supportedBattlecryNames: currentNames.length,
  additionalOutsideBatch: extra,
  entries,
};
await writeFile(
  new URL('data/foundation-battlecry-progress.json', root),
  JSON.stringify(report, null, 2) + '\n',
);
const esc = (s) => String(s).replaceAll('|', '\\|');
await writeFile(
  new URL('docs/FOUNDATION-BATTLECRIES.md', root),
  `# Foundation Battlecry implementation pass

The original candidate list is frozen at commit ${frozen.commit}: **${entries.length} unique names**. **${complete.length} are implemented across every listed printing; ${pending.length} remain blocked.** The initial grouping was a planning estimate. It was too optimistic about custom tokens, named pools, identity/history, Kindred and target choices. This pass does not claim all 315 are finished.

Total supported Battlecry names: **${currentNames.length}**, up from **${frozen.baselineSupportedNames.length}**. Shared patterns also added ${extra.length} names outside the frozen list: ${extra.map(esc).join('; ')}. Counts come from the actual support registry. Alternate printings do not inflate name counts.

The new shared transactions cover linked draws, temporary Costs, Dredge rewards, consumed live stats, random keyword grants, tribal selection, future-play buffs, full-hand/board limits, deck ordering, burn/draw replacement, hero Divine Shield and permanent minion Immunity. Boom Bots have their Deathrattles; Ice Shards and Water Elementals freeze on damage, including retaliation, and respect Shield and Silence. Unrecognized clauses still block the whole source card. Generation can produce cards with separately unimplemented abilities; these stay explicitly labeled and cannot be played. Summoned special passives are enabled only when their behavior is handled.

Three new [test decks](TEST-DECKS.md) provide guided openings: Token Workshop, Hungry Board and Deck Laboratory. Current hand Costs are visible, queued buffs and expanded hand limits appear in Active effects, and hero Divine Shield is displayed. No database/schema, Storage, image upload or cloud deployment changes are required.

## Implemented candidates

| Minion | Printings | Full printed rules |
| --- | --- | --- |
${complete.map((e) => `| ${esc(e.name)} | ${e.ids.join(', ')} | ${esc(e.text)} |`).join('\n')}

## Remaining candidates — not enabled

These are still work items, not approximate implementations. Some need an authored rule or verified pool; others require a new subsystem. The dependency notes describe the next work needed, not an automatic promise of support.

| Minion | Next dependency | Full printed rules |
| --- | --- | --- |
${pending.map((e) => `| ${esc(e.name)} | ${esc(e.dependency)} | ${esc(e.text)} |`).join('\n')}

Run \`npm run audit:foundation\` to refresh this report after changing support. The frozen list never shrinks as cards are completed. Run \`npm test\`, \`npm run test:compiler\`, \`npm run test:battlecry-groups\` and \`npm run build\` for verification.
`,
);
console.log(
  JSON.stringify(
    {
      target: entries.length,
      completed: complete.length,
      remaining: pending.length,
      supported: currentNames.length,
      outsideBatch: extra,
    },
    null,
    2,
  ),
);
