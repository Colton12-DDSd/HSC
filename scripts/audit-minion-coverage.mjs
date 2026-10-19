import { readFile, writeFile } from 'node:fs/promises';
import ts from 'typescript';

// Load the actual local registry without adding a second maintained support list.
let source = await readFile(new URL('../src/effects.ts', import.meta.url), 'utf8');
for (const [name, file] of [
  ['compiledBattlecries', 'battlecries.json'],
  ['compiledDeathrattles', 'deathrattles.json'],
  ['compiledSpells', 'spells.json'],
]) {
  const data = await readFile(new URL('../src/generated/' + file, import.meta.url), 'utf8');
  source = source.replace(
    new RegExp(`import ${name} from ['"].+?['"];`),
    `const ${name} = ${data};`,
  );
}
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const cardHelpers = ts.transpileModule(
  await readFile(new URL('../src/cards.ts', import.meta.url), 'utf8'),
  {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  },
).outputText;
const runnable = compiled.replace(
  /from ['"]\.\/cards['"]/,
  `from 'data:text/javascript;base64,${Buffer.from(cardHelpers).toString('base64')}'`,
);
const { supported, battlecryFor, deathrattleFor, battlecries } = await import(
  `data:text/javascript;base64,${Buffer.from(runnable).toString('base64')}`
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
const bc = triggers.filter((c) => c.mechanics.includes('BATTLECRY'));
const bcNames = new Set(bc.map((c) => c.name));
const supportedBcNames = new Set(bc.filter(supported).map((c) => c.name));
const oldBcNames = new Set(
  JSON.parse(
    await readFile(new URL('../data/battlecry-expansion-baseline.json', import.meta.url), 'utf8'),
  ).names,
);
const summary = {
  collectionRecords: cards.length,
  battlecryRecords: bc.length,
  supportedBattlecryRecords: bc.filter(supported).length,
  battlecryNames: bcNames.size,
  supportedBattlecryNames: supportedBcNames.size,
  additionalBattlecryNames: [...supportedBcNames].filter((n) => !oldBcNames.has(n)).length,
  remainingBattlecryNames: bcNames.size - supportedBcNames.size,
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
