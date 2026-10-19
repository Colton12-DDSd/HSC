import type { Card } from './cards';
import type { ScriptStep } from './script-types';
import { battlecryFor, deathrattleFor, effectFor, supported } from './effects';
import { createGame } from './engine';

export interface Premade {
  id: string;
  name: string;
  class: string;
  description: string;
  objectives: string[];
  core: string[];
  opening: string[];
  tribes?: string[];
  operations: string[];
}

// Mixed-class local test decks deliberately prioritize mechanic coverage over ladder strength.
export const premades: Premade[] = [
  {
    id: 'token-workshop',
    name: 'Token Workshop',
    class: 'HUNTER',
    description: 'Board placement, full-board limits and Divine Shield interactions.',
    objectives: [
      'Place Alleycat or Desert Hare between two minions; their summons do not repeat Battlecries.',
      'Play Giggling Inventor, then Blood Knight; verify every consumed Shield adds +3/+3.',
      'Fill the seven slots and verify excess summons stop without removing existing minions.',
    ],
    opening: ['Alleycat', 'Desert Hare', 'Giggling Inventor', 'Blood Knight', 'Argent Braggart'],
    core: [
      'Arcanosmith',
      'Big-Time Racketeer',
      'Onyxia',
      'Dr. Boom',
      'Ram Commander',
      'Herald Volazj',
      "Hir'eek, the Bat",
      'Twin Tyrant',
      'Veranus',
    ],
    operations: [
      'summon-token',
      'summon-copy',
      'summon-self',
      'shield-harvest',
      'battlefield-stats',
    ],
  },
  {
    id: 'hungry-board',
    name: 'Hungry Board',
    class: 'WARLOCK',
    description: 'Sacrifice fodder, consume live stats, and test Deathrattle ordering.',
    objectives: [
      'Use Alleycat as fodder for Sanguine Reveler or Ratcatcher; compare their stat gains.',
      'Place Void Terror between two minions and verify it absorbs both current Attack and Health.',
      'Consume a Deathrattle minion and verify its Deathrattle runs after the Battlecry.',
    ],
    opening: ['Alleycat', 'Sanguine Reveler', 'Ratcatcher', 'Void Terror', 'Loot Hoarder'],
    core: [
      'Natalie Seline',
      'Mutanus the Devourer',
      'Elder Nadox',
      'Riftcleaver',
      'Haunted Creeper',
      'Nerubian Egg',
      'Harvest Golem',
      'Blood Knight',
      'Baritone Imp',
      'Crazed Conductor',
    ],
    operations: ['consume', 'eat-hand', 'trigger-deathrattle', 'fatigue-payoff'],
  },
  {
    id: 'deck-laboratory',
    name: 'Deck Laboratory',
    class: 'MAGE',
    description: 'Dredge, temporary discounts, linked draws and deliberate deck order.',
    objectives: [
      'Use Excavation Specialist to discount a bottom-three card and put it on top; draw it next.',
      'Draw with Sharp-Eyed Lookout; check the discount disappears at the end of the turn.',
      'Play Deepwater Evoker and compare Armor gained with the exact spell drawn.',
    ],
    opening: [
      'Excavation Specialist',
      'Novice Engineer',
      'Sharp-Eyed Lookout',
      'Deepwater Evoker',
      'Sightless Watcher',
    ],
    core: [
      'Igneous Lavagorger',
      'Trench Surveyor',
      'Seafloor Savior',
      'Balinda Stonehearth',
      'Lorekeeper Polkelt',
      'Timeless Causality',
      'Gaslight Gatekeeper',
      'Stonehearth Vindicator',
      'Primal Dungeoneer',
      'Bright-Eyed Scout',
      'Envoy of Prosperity',
    ],
    operations: [
      'draw-linked',
      'discover',
      'deck-order',
      'hand-to-deck',
      'deck-cost',
      'shuffle-hand-draw',
    ],
  },
  {
    id: 'spellwork',
    name: 'Ember & Ice',
    class: 'MAGE',
    description: 'Targeted damage, area damage, Freeze and Silence.',
    objectives: [
      'Use Elven Archer on a chosen minion; verify that damage persists.',
      'Freeze a defender, then silence it to remove Freeze.',
      'Compare one-target damage with effects that hit every opponent.',
    ],
    core: [
      'Elven Archer',
      'Glacial Shard',
      'Ironbeak Owl',
      'Fireball',
      'Flamestrike',
      'North Sea Kraken',
      'Nightblade',
      'Spammy Arcanist',
      'Varden Dawngrasp',
    ],
    opening: ['Elven Archer', 'Glacial Shard', 'Ironbeak Owl', 'Fireball', 'Novice Engineer'],
    operations: ['damage', 'missiles', 'freeze', 'silence', 'damage-then', 'repeat-death'],
  },
  {
    id: 'last-rites',
    name: 'Last Rites',
    class: 'WARLOCK',
    description: 'Deathrattle tokens, copied Deathrattles, resurrection and Reborn.',
    objectives: [
      'Copy a Loot Hoarder Deathrattle with Mok’Nathal Lion, then kill the Lion.',
      'Trigger a Deathrattle without killing its owner.',
      'Resurrect a fallen minion; verify that its Battlecry does not repeat.',
    ],
    core: [
      'Loot Hoarder',
      'Haunted Creeper',
      'Harvest Golem',
      'Sludge Belcher',
      "Mok'Nathal Lion",
      'Primal Rockfang',
      'Terrorscale Stalker',
      'Nerubian Egg',
      'Twilight Summoner',
      'Onyx Bishop',
      'Psychopomp',
    ],
    opening: [
      'Loot Hoarder',
      "Mok'Nathal Lion",
      'Haunted Creeper',
      'Elven Archer',
      'Novice Engineer',
    ],
    operations: [
      'resurrect',
      'gain-deathrattle',
      'grant-deathrattle',
      'trigger-deathrattle',
      'summon-token',
    ],
  },
  {
    id: 'iron-reserve',
    name: 'Iron Reserve',
    class: 'WARRIOR',
    description: 'Armor, self-damage, weapon durability and weapon removal.',
    objectives: [
      'Play Crystallizer and verify damage happens before Armor gain.',
      'Equip a weapon, attack, then check durability; remove an enemy weapon.',
      'Compare Armor absorption with actual Health loss.',
    ],
    core: [
      'Crystallizer',
      'Armor Vendor',
      'Shieldmaiden',
      'Underking',
      'Tidal Revenant',
      'Fiery War Axe',
      'Acidic Swamp Ooze',
      'Platebreaker',
      'Shivering Sorceress',
    ],
    opening: ['Crystallizer', 'Armor Vendor', 'Fiery War Axe', 'Acidic Swamp Ooze', 'Shieldmaiden'],
    operations: ['armor', 'destroy-armor', 'destroy-weapon', 'equip', 'next-cost'],
  },
  {
    id: 'life-garden',
    name: 'Life Garden',
    class: 'PRIEST',
    description: 'Uncapped hero healing, Lifesteal and lasting stat growth.',
    objectives: [
      'Play Cleansing Cleric, then heal your hero past the starting 40.',
      'Buff a damaged minion; compare printed, maximum and current Health.',
      'Attack with Grafted Knight and compare damage dealt with healing restored.',
    ],
    core: [
      'Cleansing Cleric',
      'Darkscale Healer',
      'Earthen Ring Farseer',
      'Grafted Knight',
      'Shattered Sun Cleric',
      'Grimestreet Outfitter',
      'The Mistcaller',
      'Antique Healbot',
      'Chillwind Yeti',
    ],
    opening: [
      'Cleansing Cleric',
      'Darkscale Healer',
      'Grafted Knight',
      'Shattered Sun Cleric',
      'Chillwind Yeti',
    ],
    operations: ['heal', 'buff', 'zone-buff', 'zone-double', 'summon-effect'],
  },
  {
    id: 'dragon-school',
    name: 'Dragon School',
    class: 'HUNTER',
    description: 'Hold a Dragon, check conditional Battlecries, then compare tribal buffs.',
    objectives: [
      'Keep Twilight Whelp in hand while playing Blackwing Corruptor.',
      'Compare a conditional card with and without its prerequisite in hand.',
      'Place minions between neighbors to test adjacent effects.',
    ],
    core: [
      'Twilight Whelp',
      'Blackwing Corruptor',
      'Blackwing Technician',
      'Twilight Guardian',
      'Drakonid Crusher',
      'Alexstrasza',
      'Dragon Consort',
      'Ethereal Conjurer',
      'Chillwind Yeti',
    ],
    opening: [
      'Twilight Whelp',
      'Blackwing Corruptor',
      'Blackwing Technician',
      'Twilight Guardian',
      'Dragon Consort',
    ],
    tribes: ['DRAGON'],
    operations: ['if', 'next-cost', 'set-health', 'summon-copy'],
  },
  {
    id: 'discovery',
    name: 'Curiosity Cabinet',
    class: 'MAGE',
    description: 'Discover, filtered draws, generation, hand choices and deck order.',
    objectives: [
      'Play Ethereal Conjurer; choose one card and verify exactly one addition.',
      'Use Grave Defiler to copy a Fel spell without discarding the original.',
      'Use Sightless Watcher to put a selected card on top; draw it next.',
    ],
    core: [
      'Ethereal Conjurer',
      'Grave Defiler',
      'Sightless Watcher',
      'Pack Kodo',
      'Southsea Scoundrel',
      'Novice Engineer',
      'Arcane Intellect',
      'Chaos Strike',
      'Coilbearer',
    ],
    opening: [
      'Ethereal Conjurer',
      'Grave Defiler',
      'Chaos Strike',
      'Sightless Watcher',
      'Novice Engineer',
    ],
    operations: ['discover', 'choose-hand', 'generate', 'copy-zone', 'draw'],
  },
];

function steps(c: Card): ScriptStep[] {
  const e = effectFor(c);
  return e?.type === 'script'
    ? e.steps.flatMap(function scan(s): ScriptStep[] {
        return [s, ...(s.steps ?? []).flatMap(scan)];
      })
    : [];
}

export function buildPremade(cards: Card[], id: string) {
  const preset = premades.find((p) => p.id === id);
  if (!preset) throw Error('Unknown premade deck');
  const pool = [
    ...new Map(
      cards
        .filter((c) => supported(c) && ['MINION', 'SPELL', 'WEAPON'].includes(c.type))
        .map((c) => [c.name, c]),
    ).values(),
  ];
  const byName = new Map(pool.map((c) => [c.name, c]));
  const commander = byName.get('King Krush');
  if (!commander) throw Error('Test commander is unavailable');
  const preferred = [...new Set([...preset.opening, ...preset.core])].filter((name) =>
    byName.has(name),
  );
  // Opening prerequisites are mandatory; optional core examples may await an unsupported mechanic.
  for (const name of preset.opening)
    if (!byName.has(name)) throw Error(`${preset.name}: opening card ${name} is unavailable`);
  const score = (c: Card) => {
    const ops = steps(c);
    return (
      (preferred.includes(c.name) ? 10000 - preferred.indexOf(c.name) : 0) +
      (preset.tribes?.some((t) => c.race === t || c.races?.includes(t)) ? 65 : 0) +
      ops.reduce((n, s) => n + (preset.operations.includes(s.op) ? 12 : 0), 0) +
      (preset.id === 'last-rites' && deathrattleFor(c) ? 65 : 0) +
      (preset.id === 'life-garden' && c.mechanics?.includes('LIFESTEAL') ? 65 : 0) +
      (c.cardClass === preset.class ? 8 : 0) +
      (battlecryFor(c) ? 3 : 0)
    );
  };
  const ranked = pool
    .filter((c) => c.name !== commander.name)
    .sort((a, b) => score(b) - score(a) || a.cost - b.cost || a.name.localeCompare(b.name));
  const selected = preferred.map((n) => byName.get(n)!).filter((c) => c.name !== commander.name);
  // Fixed curve quotas keep these 100-card tests playable before their expensive showcase cards.
  for (const [low, high, quota] of [
    [0, 2, 24],
    [3, 4, 32],
    [5, 6, 26],
    [7, 20, 18],
  ]) {
    const existing = selected.filter((c) => c.cost >= low && c.cost <= high).length;
    const candidates = ranked.filter(
      (c) => c.cost >= low && c.cost <= high && !selected.some((x) => x.name === c.name),
    );
    selected.push(...candidates.slice(0, Math.max(0, quota - existing)));
  }
  for (const c of ranked)
    if (selected.length < 100 && !selected.some((x) => x.name === c.name)) selected.push(c);
  if (selected.length !== 100) throw Error('Premade deck must contain exactly 100 cards');
  return { preset, cards: selected, commander, class: preset.class };
}

export function createPremadeGame(cards: Card[], id: string, guided = true, seed = 42) {
  const selected = buildPremade(cards, id);
  const opponents = ['spellwork', 'last-rites', 'iron-reserve'].map((other) =>
    buildPremade(cards, other === id ? 'life-garden' : other),
  );
  const seats = [selected, ...opponents].map((d) => ({
    cards: d.cards,
    commander: d.commander,
    class: d.class,
    opening: guided ? d.preset.opening : undefined,
  }));
  const game = createGame(cards, seed, undefined, undefined, selected.class, seats);
  game.testPreset = {
    id,
    name: selected.preset.name,
    objectives: selected.preset.objectives,
    guided,
  };
  game.log.push(
    `Premade test deck: ${selected.preset.name} · ${guided ? 'guided opening' : 'shuffled opening'} · mixed classes · local sandbox`,
  );
  return game;
}
