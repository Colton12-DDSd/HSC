import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { classify, normalize, groups, lanes } from './battlecry-groups.mjs';
import { buildGrouping, markdown } from './group-battlecries.mjs';
const json = async (name) =>
  JSON.parse(await readFile(new URL('../' + name, import.meta.url), 'utf8'));
const coverage = await json('data/minion-coverage.json');
const cards = await json('public/data/cards.json');
const report = await buildGrouping(coverage, cards);
const classifyText = (name, text, mechanics = ['BATTLECRY']) =>
  classify(name, [{ id: 'TEST', text, mechanics }]);

test('every remaining unique name has exactly one primary group; supported names are excluded', () => {
  const byId = new Map(cards.map((c) => [c.id, c]));
  const expected = coverage.minions
    .filter(
      (m) =>
        !m.printings.some((p) => p.supported && p.battlecry) &&
        m.printings.some((p) => byId.get(p.id)?.mechanics?.includes('BATTLECRY')),
    )
    .map((m) => m.name)
    .sort();
  assert.deepEqual(report.entries.map((e) => e.name).sort(), expected);
  assert.equal(new Set(report.entries.map((e) => e.name)).size, report.totalRemaining);
  assert.equal(
    report.groups.reduce((sum, g) => sum + g.count, 0),
    report.totalRemaining,
  );
  assert.equal(
    report.lanes.reduce((sum, g) => sum + g.count, 0),
    report.totalRemaining,
  );
  assert.equal(report.totalRemaining, coverage.summary.remainingBattlecryNames);
});

test('all raw Battlecry printings survive, including their metadata and UI variants', () => {
  for (const e of report.entries) {
    const expected = cards.filter((c) => c.name === e.name && c.mechanics?.includes('BATTLECRY'));
    assert.deepEqual(e.printings.map((p) => p.id).sort(), expected.map((c) => c.id).sort());
    for (const p of e.printings) assert.equal(p.text, expected.find((c) => c.id === p.id).text);
    assert.ok(groups.some((g) => g.id === e.primary));
    assert.ok(lanes[e.lane]);
    assert.equal(new Set(e.dependencies).size, e.dependencies.length);
    assert.ok(e.dependencies.includes(e.primary));
    assert.ok(e.dependencies.every((id) => groups.some((g) => g.id === id)));
  }
});

test('simple-looking Battlecries retain their attached systems', () => {
  assert.equal(
    classifyText(
      'Big Game Hunter',
      'Tradeable Battlecry: Destroy a minion with 7 or more Attack.',
      ['BATTLECRY', 'TRADEABLE'],
    ).primary,
    'keyword-packages',
  );
  assert.equal(
    classifyText('Azure Drake', 'Spell Damage +1 Battlecry: Draw a card.', [
      'BATTLECRY',
      'SPELLPOWER',
    ]).primary,
    'spell-power',
  );
});

test('a reference to a keyword is distinct from having that keyword', () => {
  const c = classifyText('Generator', 'Battlecry: Get a random Outcast card.');
  assert.equal(c.primary, 'generate-pools');
  assert.deepEqual(c.attachedKeywords, []);
  assert.deepEqual(c.referencedKeywords, ['Outcast']);
  for (const family of report.keywordFamilies)
    assert.equal(family.attachedCount + family.referenceOnlyCount, family.count);
});

test('history of casting is not an instruction to cast another spell', () => {
  const c = classifyText(
    'History Test',
    "Battlecry: If you've cast 3 spells while holding this, deal 5 damage.",
  );
  assert.equal(c.primary, 'history');
  assert.ok(!c.dependencies.includes('spell-casting'));
  assert.equal(
    classifyText('Cast Test', 'Battlecry: Cast a random spell.').primary,
    'spell-casting',
  );
});

test('mana qualifiers in a generated card do not turn generation into a discount rule', () => {
  assert.equal(
    classifyText(
      'Cobalt Spellkin',
      'Battlecry: Add two 1-Cost spells from your class to your hand.',
    ).primary,
    'generate-pools',
  );
  assert.equal(
    classifyText('Discount', 'Battlecry: Your next spell costs (2) less.').primary,
    'cost-mana',
  );
  assert.equal(
    classifyText('Pride Seeker', 'Battlecry: Your next Choose One card costs (2) less.').primary,
    'cost-mana',
  );
  assert.equal(
    classifyText('Coldlight Oracle', 'Battlecry: Each player draws 2 cards.').primary,
    'draw-zones',
  );
});

test('source-bound auras and delayed effects are not flat stat buffs', () => {
  assert.equal(
    classifyText('Fan', 'Battlecry: Choose a minion. It has +4 Attack while this is alive.')
      .primary,
    'ongoing',
  );
  assert.equal(
    classifyText('Delayed', 'Battlecry: At the start of your next turn, draw a card.').primary,
    'scheduling',
  );
});

test('reviewed exceptions use the pinned text and existing engine foundations', () => {
  const expected = {
    'Lord Godfrey': 'damage-stats',
    'Razzle-Dazzler': 'history',
    'The Jailer': 'damage-stats',
    'Murmuring Elemental': 'spell-casting',
    'Primordial Lord': 'generate-pools',
    'Broodchamber Tunneler': 'generate-pools',
    'Lorekeeper Polkelt': 'draw-zones',
    'Unseen Saboteur': 'spell-casting',
    'Alexandros Mograine': 'scheduling',
    Siamat: 'choices',
    'Enhance-o Mechano': 'damage-stats',
    'Primalfin Challenger': 'keyword-packages',
  };
  for (const [name, primary] of Object.entries(expected))
    assert.equal(report.entries.find((e) => e.name === name)?.primary, primary, name);
});

test('normalization handles formatting but the report never invents card rules', () => {
  assert.equal(
    normalize('[x]<b>Battlecry:</b> Draw\u00a0a card.@ (Ready!)'),
    'Battlecry: Draw a card.',
  );
  const text = markdown(report);
  for (const e of report.entries) assert.ok(text.includes(e.name.replaceAll('|', '\\|')), e.name);
  assert.ok(text.includes('not enable a card'));
  assert.ok(text.includes('overlap'));
});

test('regeneration is deterministic and does not mutate the support audit', async () => {
  const before = JSON.stringify(coverage);
  assert.deepEqual(await buildGrouping(coverage, cards), report);
  assert.equal(JSON.stringify(coverage), before);
  const invalid = structuredClone(coverage);
  invalid.summary.remainingBattlecryNames++;
  await assert.rejects(buildGrouping(invalid, cards), /full remaining-name inventory/);
});
