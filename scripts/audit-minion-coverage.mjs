import { readFile, writeFile } from 'node:fs/promises';
import ts from 'typescript';

// Load the actual local registry without adding a second maintained support list.
const source = await readFile(new URL('../src/effects.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { supported, battlecryFor, deathrattleFor } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
);
const cards = JSON.parse(
  await readFile(new URL('../public/data/cards.json', import.meta.url), 'utf8'),
);
const triggers = cards.filter(
  (c) => c.type === 'MINION' && c.mechanics?.some((m) => ['BATTLECRY', 'DEATHRATTLE'].includes(m)),
);
const groups = new Map();
for (const c of triggers) {
  const entry = {
    id: c.id,
    text: c.text ?? '',
    supported: supported(c),
    battlecry: c.mechanics.includes('BATTLECRY') ? !!battlecryFor(c) : null,
    deathrattle: c.mechanics.includes('DEATHRATTLE') ? !!deathrattleFor(c) : null,
  };
  const group = groups.get(c.name) ?? { name: c.name, printings: [] };
  group.printings.push(entry);
  groups.set(c.name, group);
}
const minions = [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
const summary = {
  collectionRecords: cards.length,
  supportedCollectionRecords: cards.filter(supported).length,
  triggerRecords: triggers.length,
  supportedTriggerRecords: triggers.filter(supported).length,
  triggerNames: minions.length,
  fullySupportedTriggerNames: minions.filter((g) => g.printings.every((c) => c.supported)).length,
  remainingTriggerRecords: triggers.filter((c) => !supported(c)).length,
};
await writeFile(
  new URL('../data/minion-coverage.json', import.meta.url),
  JSON.stringify({ summary, minions }, null, 2) + '\n',
);
console.log(JSON.stringify(summary, null, 2));
