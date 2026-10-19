import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cardCost, cardStats, type Card } from './cards';
import {
  applyAction,
  createGame,
  debugAction,
  unitMechanics,
  type Game,
  type Target,
} from './engine';
import { supported } from './effects';

const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
const catalog = JSON.parse(readFileSync('src/generated/catalog.json', 'utf8')) as Card[];
const byName = (name: string) => {
  const c = [...cards, ...catalog].find((c) => c.name === name && supported(c));
  if (!c) throw Error(`Missing supported ${name}`);
  return structuredClone(c);
};
const baseline = createGame(cards);
function setup() {
  const s = structuredClone(baseline);
  s.events = [];
  for (const p of s.players) {
    p.board = [];
    p.hand = [];
    p.deck = [];
    p.grave = [];
    p.reserve = 0;
    p.mana = 100;
    p.maxMana = 10;
    p.health = 100;
    p.armor = 0;
  }
  return s;
}
function put(s: Game, p: number, name: string) {
  return debugAction(s, { type: 'summon', p, card: byName(name) });
}
function play(s: Game, name: string, target?: Target, position?: number) {
  s.players[0].hand.push(byName(name));
  return applyAction(s, {
    type: 'cast',
    p: 0,
    index: s.players[0].hand.length - 1,
    target,
    position,
  });
}
const self = (s: Game, name: string) => s.players[0].board.find((u) => u.card.name === name)!;

describe('foundation Battlecry outcomes', () => {
  it('fill-hand draws respect an expanded maximum hand size', () => {
    const s = setup();
    s.players[0].maxHandSize = 12;
    s.players[0].hand = Array.from({ length: 9 }, () => byName('Fireball'));
    s.players[0].deck = Array.from({ length: 6 }, () => byName('Arcane Explosion'));
    const r = play(s, 'Malygos the Spellweaver');
    expect(r.players[0].hand).toHaveLength(12);
    expect(r.players[0].deck).toHaveLength(3);
  });
  it('Finale uses all enemies with no target, while its normal version needs one', () => {
    let s = setup();
    s.players[0].mana = byName('Hardcore Cultist').cost;
    s = play(s, 'Hardcore Cultist');
    expect(s.players.map((p) => p.health)).toEqual([100, 98, 98, 98]);
    const r = play(setup(), 'Hardcore Cultist', { p: 2 });
    expect(r.players.map((p) => p.health)).toEqual([100, 100, 98, 100]);
  });
  it('hero Divine Shield absorbs one complete hit before Health or Armor', () => {
    let s = play(setup(), 'Hardlight Protector');
    s.players[0].armor = 5;
    s = play(s, 'Elven Archer', { p: 0 });
    expect(s.players[0].shield).toBe(false);
    expect(s.players[0].health).toBe(103);
    expect(s.players[0].armor).toBe(5);
    s = play(s, 'Elven Archer', { p: 0 });
    expect(s.players[0].armor).toBe(4);
  });
  it('freezing minions freeze a damaged hero and do not freeze through Divine Shield', () => {
    for (const shield of [false, true]) {
      let s = put(setup(), 0, 'Water Elemental');
      s.players[0].board[0].ready = true;
      s.players[1].shield = shield;
      s = applyAction(s, {
        type: 'attack',
        p: 0,
        uid: s.players[0].board[0].uid,
        target: { p: 1 },
      });
      expect(!!s.players[1].frozen).toBe(!shield);
      expect(s.players[1].health).toBe(shield ? 100 : 97);
    }
  });
  it('a freezing defender freezes the attacker after it uses its attack', () => {
    let s = put(setup(), 0, 'Chillwind Yeti');
    s = put(s, 1, 'Water Elemental');
    s.players[0].board[0].ready = true;
    s = applyAction(s, {
      type: 'attack',
      p: 0,
      uid: s.players[0].board[0].uid,
      target: { p: 1, uid: s.players[1].board[0].uid },
    });
    expect(s.players[0].board[0].frozen).toBe(true);
    expect(s.players[0].board[0].freezeSkipEnd).toBe(true);
    s = applyAction(s, { type: 'end', p: 0 });
    expect(s.players[0].board[0].frozen).toBe(true);
  });
  it('The Jailer remains Immune until Silence and destroys only its own deck', () => {
    let s = setup();
    for (const p of s.players) p.deck = [byName('Fireball')];
    s = play(s, 'The Jailer');
    const uid = self(s, 'The Jailer').uid,
      hp = self(s, 'The Jailer').health;
    expect(s.players.map((p) => p.deck.length)).toEqual([0, 1, 1, 1]);
    s = play(s, 'Elven Archer', { p: 0, uid });
    expect(self(s, 'The Jailer').health).toBe(hp);
    s = play(s, 'Ironbeak Owl', { p: 0, uid });
    s = play(s, 'Elven Archer', { p: 0, uid });
    expect(self(s, 'The Jailer').health).toBe(hp - 1);
  });
  it('Boom Bots explode for a seeded 1–4 damage after being killed', () => {
    let s = play(setup(), 'Dr. Boom');
    const bot = s.players[0].board.find((u) => u.card.name === 'Boom Bot')!;
    expect(bot).toBeDefined();
    s = play(s, 'Elven Archer', { p: 0, uid: bot.uid });
    const damage = 300 - s.players.slice(1).reduce((n, p) => n + p.health, 0);
    expect(damage).toBeGreaterThanOrEqual(1);
    expect(damage).toBeLessThanOrEqual(4);
    expect(s.log.some((l) => l.includes('Boom Bot triggers Deathrattle'))).toBe(true);
  });
  it('Morchok carries only excess discount into each subsequent draw', () => {
    const s = setup();
    s.players[0].deck = [
      { ...byName('Fireball'), cost: 3 },
      { ...byName('Arcane Explosion'), cost: 4 },
      { ...byName('Fireball'), cost: 5 },
      byName('Chillwind Yeti'),
    ];
    const r = play(s, 'Morchok');
    expect(r.players[0].hand.map((c) => c.cost)).toEqual([0, 0, 2]);
    expect(r.players[0].deck).toHaveLength(1);
  });
  it('Blazing Accretion draws matching physical cards and burns the others', () => {
    const s = setup();
    s.players[0].deck = [
      byName('Fireball'),
      byName('Chillwind Yeti'),
      byName('Water Elemental'),
      byName('Arcane Explosion'),
    ];
    const r = play(s, 'Blazing Accretion');
    expect(r.players[0].hand.map((c) => c.name)).toEqual(['Fireball', 'Water Elemental']);
    expect(r.players[0].grave[0].name).toBe('Chillwind Yeti');
    expect(r.players[0].deck[0].name).toBe('Arcane Explosion');
  });
  it('summons exactly two Desert Hares without recursively firing their Battlecries', () => {
    const s = play(setup(), 'Desert Hare');
    expect(s.players[0].board.map((u) => [u.attack, u.health])).toEqual([
      [1, 1],
      [1, 1],
      [1, 1],
    ]);
    expect(s.log.filter((l) => l.includes('triggers Battlecry'))).toHaveLength(1);
  });
  it('keeps source minion damage separate from all other characters', () => {
    let s = put(setup(), 0, 'Chillwind Yeti');
    s = put(s, 1, 'Chillwind Yeti');
    s = play(s, 'Dread Infernal');
    expect(s.players.map((p) => p.health)).toEqual([99, 99, 99, 99]);
    expect(self(s, 'Dread Infernal').health).toBe(6);
    expect(self(s, 'Chillwind Yeti').health).toBe(4);
  });
  it('Twin Tyrant chooses two different enemy minions across the enemy boards', () => {
    let s = setup();
    for (let p = 1; p < 4; p++) s = put(s, p, 'Chillwind Yeti');
    s = play(s, 'Twin Tyrant');
    expect(
      s.players
        .slice(1)
        .map((p) => p.board[0].health)
        .sort(),
    ).toEqual([1, 1, 5]);
  });
  it('Blood Knight removes each live shield and gains +3/+3 per shield', () => {
    let s = put(setup(), 0, 'Argent Squire');
    s = put(s, 1, 'Argent Squire');
    s = play(s, 'Blood Knight');
    expect([self(s, 'Blood Knight').attack, self(s, 'Blood Knight').health]).toEqual([9, 9]);
    expect(s.players.flatMap((p) => p.board).some((u) => u.shield)).toBe(false);
  });
  it('Argent Braggart takes the highest Attack and current Health independently', () => {
    let s = put(setup(), 0, 'Chillwind Yeti');
    s = put(s, 1, 'Boulderfist Ogre');
    s.players[1].board[0].health = 2;
    s.players[0].board[0].attack = 10;
    s = play(s, 'Argent Braggart');
    expect([self(s, 'Argent Braggart').attack, self(s, 'Argent Braggart').health]).toEqual([10, 5]);
  });
  it('Void Terror absorbs both damaged neighbors before their Deathrattles run', () => {
    let s = put(setup(), 0, 'Chillwind Yeti');
    s = put(s, 0, 'Loot Hoarder');
    s.players[0].board[0].health = 2;
    s.players[0].deck = [byName('Fireball')];
    s = play(s, 'Void Terror', undefined, 1);
    expect(s.players[0].board).toHaveLength(1);
    expect([self(s, 'Void Terror').attack, self(s, 'Void Terror').health]).toEqual([9, 7]);
    expect(s.players[0].hand[0].name).toBe('Fireball');
  });
  it('a Battlecry without a legal consume target never selects the entire battlefield', () => {
    let s = put(setup(), 1, 'Chillwind Yeti');
    s = play(s, 'Ratcatcher');
    expect(s.players[1].board[0].health).toBe(5);
    expect([self(s, 'Ratcatcher').attack, self(s, 'Ratcatcher').health]).toEqual([2, 2]);
  });
  it('Riftcleaver damages its owner by the victim’s current Health', () => {
    let s = put(setup(), 1, 'Chillwind Yeti');
    s.players[1].board[0].health = 2;
    s = play(s, 'Riftcleaver', { p: 1, uid: s.players[1].board[0].uid });
    expect(s.players[0].health).toBe(98);
    expect(s.players[1].board).toHaveLength(0);
  });
  it('Balinda swaps spell Costs with Attack and Health rather than granting a discount', () => {
    const s = setup();
    s.players[0].deck = [
      { ...byName('Fireball'), cost: 2 },
      { ...byName('Arcane Explosion'), cost: 8 },
    ];
    const r = play(s, 'Balinda Stonehearth'),
      u = self(r, 'Balinda Stonehearth');
    expect([u.attack, u.health].sort()).toEqual([2, 8]);
    expect(r.players[0].hand.map((c) => c.cost)).toEqual([5, 5]);
  });
  it('Deepwater Evoker gains Armor equal to the actual drawn spell Cost', () => {
    const s = setup();
    s.players[0].deck = [{ ...byName('Fireball'), cost: 7 }, byName('Chillwind Yeti')];
    const r = play(s, 'Deepwater Evoker');
    expect(r.players[0].armor).toBe(7);
    expect(r.players[0].hand[0].name).toBe('Fireball');
  });
  it('Devout Dungeoneer discounts only the Holy spell it draws', () => {
    const holy = { ...byName('Fireball'), spellSchool: 'HOLY', cost: 4 };
    for (const [school, expected] of [
      ['HOLY', 2],
      ['FIRE', 4],
    ] as const) {
      const s = setup();
      s.players[0].deck = [{ ...holy, spellSchool: school }];
      expect(play(s, 'Devout Dungeoneer').players[0].hand[0].cost).toBe(expected);
    }
  });
  it('Gnomish Experimenter replaces a drawn minion with the pinned Chicken token', () => {
    const s = setup();
    s.players[0].deck = [byName('Chillwind Yeti')];
    expect(play(s, 'Gnomish Experimenter').players[0].hand[0].id).toBe('GVG_092t');
  });
  it('Dredge selects a physical bottom-three card and applies its discount before the next draw', () => {
    let s = setup();
    s.players[0].deck = [
      byName('Chillwind Yeti'),
      byName('Fireball'),
      byName('Arcane Explosion'),
      byName('Boulderfist Ogre'),
    ];
    s = play(s, 'Excavation Specialist');
    expect(s.choice!.options.map((c) => c.name)).toEqual([
      'Fireball',
      'Arcane Explosion',
      'Boulderfist Ogre',
    ]);
    s = applyAction(s, { type: 'choose', p: 0, index: 1 });
    expect(s.players[0].deck[0].name).toBe('Arcane Explosion');
    expect(s.players[0].deck[0].cost).toBe(1);
    s = play(s, 'Novice Engineer');
    expect(s.players[0].hand[0].name).toBe('Arcane Explosion');
    expect(s.players[0].deck).toHaveLength(3);
  });
  it('conditional Dredge draws a Mech but leaves a non-Mech on top', () => {
    for (const name of ['Harvest Golem', 'Fireball']) {
      let s = setup();
      s.players[0].deck = [byName(name)];
      s = play(s, 'Trench Surveyor');
      s = applyAction(s, { type: 'choose', p: 0, index: 0 });
      expect(s.players[0].hand.length).toBe(name === 'Harvest Golem' ? 1 : 0);
      expect(s.players[0].deck.length).toBe(name === 'Harvest Golem' ? 0 : 1);
    }
  });
  it('temporary draw discounts expire without undoing a permanent Cost reduction', () => {
    let s = setup();
    s.players[0].deck = [{ ...byName('Fireball'), printedCost: 4, cost: 3 }];
    s = play(s, 'Sharp-Eyed Lookout');
    expect(cardCost(s.players[0].hand[0])).toBe(2);
    s = applyAction(s, { type: 'end', p: 0 });
    expect(cardCost(s.players[0].hand[0])).toBe(3);
  });
  it('Valdris raises the limit for actual subsequent draws and burns at 12', () => {
    const s = setup();
    s.players[0].hand = Array.from({ length: 9 }, () => byName('Fireball'));
    s.players[0].deck = Array.from({ length: 5 }, () => byName('Arcane Explosion'));
    const r = play(s, 'Valdris Felgorge');
    expect(r.players[0].maxHandSize).toBe(12);
    expect(r.players[0].hand).toHaveLength(12);
    expect(r.players[0].grave).toHaveLength(1);
  });
  it('Hodir counts played minions, applies before their Battlecry, and ignores direct summons', () => {
    let s = play(setup(), 'Hodir, Father of Giants');
    s = put(s, 0, 'Alleycat');
    expect(s.players[0].playEffects![0].remaining).toBe(3);
    s = play(s, 'Elven Archer', { p: 1 });
    expect([self(s, 'Elven Archer').attack, self(s, 'Elven Archer').health]).toEqual([8, 8]);
    expect(s.players[0].playEffects![0].remaining).toBe(2);
    expect(s.players[1].health).toBe(99);
  });
  it('Menagerie Mug buffs different types and never an untyped minion or itself', () => {
    let s = put(setup(), 0, 'River Crocolisk');
    s = put(s, 0, 'Bloodfen Raptor');
    s = put(s, 0, 'Harvest Golem');
    s = put(s, 0, 'Chillwind Yeti');
    s = play(s, 'Menagerie Mug');
    expect(
      s.players[0].board.filter((u) => u.modifiers?.some((m) => m.sourceName === 'Menagerie Mug')),
    ).toHaveLength(2);
    expect(self(s, 'Chillwind Yeti').attack).toBe(4);
    expect(self(s, 'Menagerie Mug').attack).toBe(3);
  });
  it('Thekal converts Health above 40 without dealing damage', () => {
    const s = play(setup(), 'High Priest Thekal');
    expect(s.players[0].health).toBe(1);
    expect(s.players[0].armor).toBe(99);
    expect(s.events!.some((e) => e.type === 'hero-damage')).toBe(false);
  });
  it('Varden damages already Frozen minions and freezes the others', () => {
    let s = put(setup(), 1, 'Chillwind Yeti');
    s = put(s, 2, 'Chillwind Yeti');
    s.players[1].board[0].frozen = true;
    s = play(s, 'Varden Dawngrasp');
    expect(s.players[1].board[0].health).toBe(1);
    expect(s.players[2].board[0].health).toBe(5);
    expect(s.players[2].board[0].frozen).toBe(true);
  });
  it('Specter Specialist copies an already Reborn minion instead of granting it twice', () => {
    let s = put(setup(), 0, 'Murmy');
    s = play(s, 'Specter Specialist', { p: 0, uid: s.players[0].board[0].uid });
    expect(s.players[0].board.filter((u) => u.card.name === 'Murmy')).toHaveLength(2);
    expect(unitMechanics(s.players[0].board[0])).toContain('REBORN');
  });
  it('Temporal Construct draws only excess damage that actually passed the shield', () => {
    for (const shield of [false, true]) {
      let s = put(setup(), 1, 'Chillwind Yeti');
      s.players[1].board[0].health = 2;
      s.players[1].board[0].shield = shield;
      s.players[0].deck = Array.from({ length: 5 }, () => byName('Fireball'));
      s = play(s, 'Temporal Construct', { p: 1, uid: s.players[1].board[0].uid });
      expect(s.players[0].hand.length).toBe(shield ? 0 : 3);
    }
  });
  it('Divine Augur uses enchanted hand stats and sets both to the higher value', () => {
    const s = setup();
    const c = byName('Chillwind Yeti');
    c.modifiers = [{ sourceCardId: 'test', sourceName: 'test', attack: 4, health: 0 }];
    s.players[0].hand = [c];
    expect(cardStats(play(s, 'Divine Augur').players[0].hand[0])).toEqual({ attack: 8, health: 8 });
  });
});
