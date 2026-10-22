import type { Card } from './cards';
import type { ScriptStep } from './script-types';
import { battlecryFor, deathrattleFor, effectFor, supported } from './effects';
import { createGame } from './engine';

export interface Premade {
  id: string;
  name: string;
  class: string;
  commander: string;
  commanderGoal: string;
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
    commander: 'Onyxia',
    commanderGoal: 'Cast Onyxia with open board slots; her Whelps fill only the remaining spaces.',
    description: 'Board placement, full-board limits and Divine Shield interactions.',
    objectives: [
      'Place Alleycat or Desert Hare between two minions; their summons do not repeat Battlecries.',
      'Play Giggling Inventor, then Blood Knight; verify every consumed Shield adds +3/+3.',
      'Play different tribes before Power Slider; use Rock Master Voone to copy one representative per tribe in hand.',
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
      'Aessina',
      'Power Slider',
      'Rock Master Voone',
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
    commander: 'Natalie Seline',
    commanderGoal: 'Use Natalie to consume a damaged minion; she gains its remaining Health.',
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
    commander: 'Balinda Stonehearth',
    commanderGoal:
      'Cast Balinda to draw two spells and compare their Costs with her resulting stats.',
    description: 'Dredge, temporary discounts, linked draws and deliberate deck order.',
    objectives: [
      'Use Excavation Specialist to discount a bottom-three card and put it on top; draw it next.',
      'Draw with Sharp-Eyed Lookout; check the discount disappears at the end of the turn.',
      'Keep Primus in hand while casting Fire and Frost spells, then play it to summon a Taunt copy; Muckmorpher copies deck abilities without Battlecries.',
    ],
    opening: [
      'Excavation Specialist',
      'Novice Engineer',
      'Sharp-Eyed Lookout',
      'Deepwater Evoker',
      'Primus of Power',
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
      'Muckmorpher',
      'Felscale Evoker',
      'Primus of Power',
      'Scorchfist Scholar',
      'Fireball',
      'Frost Nova',
      'Shadow Bolt',
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
    commander: 'Varden Dawngrasp',
    commanderGoal:
      'Freeze enemies before casting Varden; compare damage to already Frozen minions with fresh freezes.',
    description: 'Targeted damage, area damage, Freeze and Silence.',
    objectives: [
      'Damage your Yeti with Elven Archer, then copy it with Bloodsworn Mercenary; the copy keeps current damage.',
      'Compare enemy Attack with Undercooked Calamari before choosing a legal target.',
      'Use Alexstrasza to heal a friendly character or damage one enemy; compare Ball Hog’s lowest-Health selection.',
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
      'Alexstrasza the Life-Binder',
      'Undercooked Calamari',
      'King Plush',
      'The Lurker Below',
      'Ball Hog',
      'Bloodsworn Mercenary',
      'Multicaster',
      'Chillwind Yeti',
    ],
    opening: [
      'Elven Archer',
      'Chillwind Yeti',
      'Bloodsworn Mercenary',
      'Undercooked Calamari',
      'Alexstrasza the Life-Binder',
    ],
    operations: ['damage', 'missiles', 'freeze', 'silence', 'damage-then', 'repeat-death'],
  },
  {
    id: 'last-rites',
    name: 'Last Rites',
    class: 'WARLOCK',
    commander: "N'Zoth, the Corruptor",
    commanderGoal:
      'Let Deathrattle minions die, then cast N’Zoth to bring them back without repeating Battlecries.',
    description: 'Deathrattle tokens, copied Deathrattles, resurrection and Reborn.',
    objectives: [
      'Copy a Loot Hoarder Deathrattle with Mok’Nathal Lion, then kill the Lion.',
      'Use Whomper to draw and copy a Deathrattle; Hullbreaker draws a spell and damages your hero by its Cost on play and death.',
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
      'Death Blossom Whomper',
      'Hullbreaker',
      'Merithra',
    ],
    opening: [
      'Loot Hoarder',
      "Mok'Nathal Lion",
      'Haunted Creeper',
      'Elven Archer',
      'Death Blossom Whomper',
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
    commander: 'Captain Greenskin',
    commanderGoal: 'Equip a weapon before casting Greenskin; verify +1 Attack and +1 Durability.',
    description: 'Armor, self-damage, weapon durability and weapon removal.',
    objectives: [
      'Equip Fiery War Axe, then Air Guitarist and Bloodsail Raider; compare current Durability and Attack.',
      'Break or replace a weapon, then use Hoard Pillager or Rummaging Kobold; discarded weapons do not count.',
      'Discard hand weapons with Furnacefire Colossus; compare Attack and Durability gained, then verify these were not destroyed weapons.',
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
      'Air Guitarist',
      'Bloodsail Raider',
      'Bloodsail Corsair',
      'Toxic Sewer Ooze',
      'Arathi Weaponsmith',
      'Blackscale Brute',
      'Harrison Jones',
      'Gluttonous Ooze',
      'Hoard Pillager',
      'Rummaging Kobold',
      'Luckydo Buccaneer',
      'Grimtotem Buzzkill',
      'Furnacefire Colossus',
    ],
    opening: [
      'Fiery War Axe',
      'Air Guitarist',
      'Bloodsail Raider',
      'Hoard Pillager',
      'Harrison Jones',
    ],
    operations: ['armor', 'destroy-armor', 'destroy-weapon', 'equip', 'next-cost'],
  },
  {
    id: 'life-garden',
    name: 'Life Garden',
    class: 'PRIEST',
    commander: 'Wickerflame Burnbristle',
    commanderGoal:
      'Attack with Wickerflame to test Lifesteal, Taunt and Divine Shield on the same minion.',
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
    commander: 'Frizz Kindleroost',
    commanderGoal:
      'Cast Frizz before drawing Dragons; only Dragons still in your deck receive the two-mana discount.',
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
      'Utgarde Grapplesniper',
      'Countess Ashmore',
      'Dragon Consort',
    ],
    tribes: ['DRAGON'],
    operations: ['if', 'next-cost', 'set-health', 'summon-copy'],
  },
  {
    id: 'discovery',
    name: 'Curiosity Cabinet',
    class: 'MAGE',
    commander: 'Brightwing',
    commanderGoal:
      'Cast Brightwing to generate a random legendary; inspect it to check effect support before playing it.',
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
  {
    id: 'spell-chronicle',
    name: 'Spell Chronicle',
    class: 'MAGE',
    commander: 'Dragoncaller Alanna',
    commanderGoal:
      'Cast spells costing five or more, then play Alanna to summon one Dragon for each.',
    description: 'Track spell schools, spells cast while held, and your previous turn.',
    objectives: [
      'Hold Commander Sivara while casting three spells; play her to recover exactly those three.',
      'Cast Fire and Frost spells, then Coral Keeper or Razzle-Dazzler; repeated schools count once.',
      'Play an Elemental, then use Stone Sentinel, Ozruk or Unchained Gladiator on your next turn.',
    ],
    opening: ['Commander Sivara', 'Fireball', 'Frost Nova', 'Queensguard', 'Coral Keeper'],
    core: [
      'Hedra the Heretic',
      "Krag'wa, the Frog",
      'Mana Cyclone',
      'Metamorfin',
      'Nethersoul Buster',
      'Nordrassil Druid',
      'Ozruk',
      'Priestess Valishj',
      'Primordial Overseer',
      'Razzle-Dazzler',
      'Rimescale Siren',
      'Shadowblade Slinger',
      'Stone Sentinel',
      'Unchained Gladiator',
      'Xyrella',
      'Zandalari Templar',
      'Crystal Stag',
      'Baleful Blazer',
      'Fearless Flamejuggler',
      'Freebird',
      'Water Elemental',
      'Shadow Bolt',
      'Flamestrike',
      'Healing Touch',
      'Armor Vendor',
      'Earth Shock',
    ],
    operations: ['history-cards', 'summon-token', 'held-spells', 'next-cost', 'generate', 'mana'],
  },
  {
    id: 'mana-workshop',
    name: 'Mana Workshop',
    class: 'WARRIOR',
    commander: 'Captain Galvangar',
    commanderGoal:
      'Gain at least 15 Armor over the game, then cast Galvangar for +3/+3 and Charge.',
    description: 'Limited discounts, Overload unlocking, hand copies and reveal effects.',
    objectives: [
      'Play Clownfish, then two Murlocs; its discount lasts for exactly two matching cards.',
      'Play Swiftscale Trickster before a spell; use or expire the free-spell effect. Compare Green-Thumb Gardener refresh with Immortal spending.',
      'Reveal with Spiteful Summoner or Spire Security without drawing the revealed spell. Copy hand cards with Nobleman or Cloud Serpent.',
    ],
    opening: [
      'Clownfish',
      'Murloc Raider',
      'Murloc Tidehunter',
      'Swiftscale Trickster',
      'Fireball',
    ],
    core: [
      'Dragoncaster',
      'Eternal Sentinel',
      'Ethereal Peddler',
      'Future Emissary',
      'Green-Thumb Gardener',
      'Immortal',
      'Inkmaster Solia',
      'Lunar Trailblazer',
      'Naga Sand Witch',
      'Sea Shill',
      'Spire Security',
      'Spiteful Summoner',
      'Thorim, Stormlord',
      'Twilight Medium',
      'Vanndar Stormpike',
      'Wizened Wildspeaker',
      'Zaqali Flamemancer',
      'Astral Vigilant',
      'Barista Lynchen',
      'Cloud Serpent',
      'Druid of the Fang',
      'Nobleman',
      'Shapeless Constellation',
      'Crimson Commander',
      'Water Elemental',
      'Flamestrike',
      'Shieldmaiden',
      'Armor Vendor',
      'Crystallizer',
      'Fiery War Axe',
    ],
    operations: [
      'next-cost',
      'cost',
      'resource-payoff',
      'unlock-mana',
      'reveal-spell',
      'copy-zone',
      'copy-board-hand',
    ],
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
  const commander = byName.get(preset.commander);
  if (!commander || commander.type !== 'MINION' || commander.rarity !== 'LEGENDARY')
    throw Error(`${preset.name}: supported legendary commander ${preset.commander} is unavailable`);
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
