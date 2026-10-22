import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { type Card, cardStats } from './cards';
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
const manifest = JSON.parse(readFileSync('data/mirror-battlecry-batch.json', 'utf8')) as {
  names: string[];
};
const card = (name: string) => {
  const c = cards.find((c) => c.name === name);
  if (!c) throw Error(name);
  return structuredClone(c);
};
function setup() {
  const s = createGame(cards);
  s.events = [];
  s.turn = 9;
  for (const p of s.players)
    Object.assign(p, {
      hand: [],
      deck: [],
      board: [],
      grave: [],
      health: 40,
      armor: 0,
      mana: 100,
      maxMana: 10,
      reserve: 0,
      reduction: 0,
      handReduction: 0,
    });
  return s;
}
function put(s: Game, name: string, p = 0) {
  return debugAction(s, { type: 'summon', p, card: card(name) });
}
function play(s: Game, name: string, target?: Target) {
  s = structuredClone(s);
  s.players[0].hand.push({ ...card(name), heldSince: 0 });
  return applyAction(s, { type: 'cast', p: 0, index: s.players[0].hand.length - 1, target });
}
function kill(s: Game, uid: number, p = 0) {
  s.players[p].board.find((u) => u.uid === uid)!.health = 0;
  return debugAction(s, { type: 'edit', p: 0, field: 'mana', value: 10 });
}
const last = (s: Game, p = 0) => s.players[p].board.at(-1)!;
const hand = (s: Game) => s.players[0].hand;
const choose = (s: Game, index = 0) => applyAction(s, { type: 'choose', p: 0, index });
const target = (s: Game, p = 0) => ({ p, uid: last(s, p).uid });
describe('fifty mirror, swap and Deathrattle names', () => {
  it('contains fifty unique additions', () => expect(new Set(manifest.names).size).toBe(50));
  it.each(manifest.names)('%s supports every printing', (name) =>
    expect(cards.filter((c) => c.name === name).every(supported)).toBe(true),
  );
  it.each(["Alara'shi", 'Lady Prestor'])(
    '%s transforms only its matching zone while preserving enchanted stats and Cost',
    (name) => {
      const s = setup();
      const c = card('Chillwind Yeti');
      c.cost = 2;
      c.printedCost = 4;
      c.modifiers = [{ sourceCardId: 'test', sourceName: 'Test', attack: 2, health: 3 }];
      s.players[0].hand = [structuredClone(c), card('Fireball')];
      s.players[0].deck = [structuredClone(c), card('Fireball')];
      const n = play(s, name),
        zone = name === 'Lady Prestor' ? 'deck' : 'hand',
        fresh = n.players[0][zone][0];
      expect(fresh.races ?? [fresh.race]).toContain(name === 'Lady Prestor' ? 'DRAGON' : 'DEMON');
      expect(cardStats(fresh)).toEqual({ attack: 6, health: 8 });
      expect(fresh.cost).toBe(2);
      expect(n.players[0][zone][1].name).toBe('Fireball');
      expect(n.players[0][zone === 'hand' ? 'deck' : 'hand'][0].name).toBe('Chillwind Yeti');
    },
  );
  it('Arch-Villain Rafaam replaces every hand and deck card with a Legendary minion', () => {
    const s = setup();
    s.players[0].hand = [card('Wisp'), card('Fireball')];
    s.players[0].deck = [card('Fiery War Axe')];
    const n = play(s, 'Arch-Villain Rafaam');
    expect(
      [...hand(n), ...n.players[0].deck].every(
        (c) => c.type === 'MINION' && c.rarity === 'LEGENDARY',
      ),
    ).toBe(true);
    expect(hand(n)).toHaveLength(2);
    expect(unitMechanics(last(n))).toContain('TAUNT');
  });
  it("Cera'thine Fleetrunner replaces minions with discounted other-class cards, preserving spells", () => {
    const s = setup();
    s.players[0].class = 'ROGUE';
    s.players[0].hand = [card('Chillwind Yeti'), card('Fireball')];
    s.players[0].deck = [card('Wisp')];
    const n = play(s, "Cera'thine Fleetrunner");
    for (const c of [hand(n)[0], n.players[0].deck[0]]) {
      expect(c.type).toBe('MINION');
      expect(c.cardClass).not.toBe('NEUTRAL');
      expect(c.classes ?? [c.cardClass]).not.toContain('ROGUE');
      expect(c.cost).toBe(Math.max(0, c.printedCost! - 2));
    }
    expect(hand(n)[1].name).toBe('Fireball');
  });
  it('Energy Shaper changes spells to printed Cost three higher but retains their payable Cost', () => {
    const s = setup();
    s.players[0].hand = [card('Fireball'), card('Wisp')];
    const n = play(s, 'Energy Shaper');
    expect(hand(n)[0].type).toBe('SPELL');
    expect(hand(n)[0].printedCost).toBe(7);
    expect(hand(n)[0].cost).toBe(4);
    expect(hand(n)[1].name).toBe('Wisp');
  });
  it.each(['Envoy of the Glade', 'Wyrmrest Purifier'])(
    '%s transforms only Neutral deck cards to the correct class',
    (name) => {
      const s = setup();
      s.players[0].class = 'MAGE';
      s.players[0].deck = [card('Wisp'), card('Fireball')];
      const n = play(s, name);
      expect(n.players[0].deck[0].classes ?? [n.players[0].deck[0].cardClass]).toContain(
        name === 'Envoy of the Glade' ? 'DRUID' : 'MAGE',
      );
      expect(n.players[0].deck[1].name).toBe('Fireball');
    },
  );
  it('Lilian Voss replaces hand spells using living enemy classes only', () => {
    const s = setup();
    s.players[1].class = 'PRIEST';
    s.players[2].class = 'WARLOCK';
    s.players[3].class = 'MAGE';
    s.players[3].health = 0;
    s.players[0].hand = [card('Fireball'), card('Wisp')];
    const n = play(s, 'Lilian Voss');
    expect(hand(n)[0].type).toBe('SPELL');
    expect(['PRIEST', 'WARLOCK']).toContain(hand(n)[0].cardClass);
    expect(hand(n)[1].name).toBe('Wisp');
  });
  it('Prince Liam transforms only one-Cost deck cards into Legendary minions', () => {
    const s = setup();
    s.players[0].deck = [card('Murloc Raider'), card('Fireball')];
    const n = play(s, 'Prince Liam');
    expect(n.players[0].deck[0].rarity).toBe('LEGENDARY');
    expect(n.players[0].deck[0].type).toBe('MINION');
    expect(n.players[0].deck[1].name).toBe('Fireball');
  });
  it.each([
    ['Darkspeaker', 'both', 0],
    ['Origami Dragon', 'both', 1],
    ['Origami Crane', 'health', 1],
    ["Vol'jin", 'health', 1],
    ['Origami Frog', 'attack', 1],
    ['Twilight Acolyte', 'attack', 1],
  ] as const)('%s swaps the indicated live stats with a damaged minion', (name, mode, p) => {
    let s = put(setup(), 'Chillwind Yeti', p);
    const t = target(s, p);
    last(s, p).health = 2;
    if (name === 'Twilight Acolyte') s.players[0].hand = [card('Alexstrasza')];
    s = play(s, name, t);
    const self = last(s),
      u = s.players[p].board.find((u) => u.uid === t.uid)!,
      base = card(name);
    expect(self.attack).toBe(mode === 'health' ? base.attack : 4);
    expect(u.attack).toBe(mode === 'health' ? 4 : base.attack);
    expect(self.health).toBe(mode === 'attack' ? base.health : 2);
    expect(u.health).toBe(mode === 'attack' ? 2 : base.health);
    if (mode !== 'attack') {
      expect(self.maxHealth).toBe(2);
      expect(u.maxHealth).toBe(base.health);
    }
    expect(s.events!.some((e) => e.type === 'heal')).toBe(false);
  });
  it('Furbolg Mossbinder replaces a friendly minion with its exact 6/6 Elemental token', () => {
    let s = put(setup(), 'Chillwind Yeti');
    const t = target(s);
    s = play(s, 'Furbolg Mossbinder', t);
    const u = s.players[0].board.find((u) => u.uid === t.uid)!;
    expect(u.card.id).toBe('LOOT_150t1');
    expect([u.attack, u.health]).toEqual([6, 6]);
    expect(s.events!.some((e) => e.type === 'death')).toBe(false);
  });
  it('Tinkmaster transforms one other random minion into exactly one of the pinned tokens', () => {
    let s = put(setup(), 'Chillwind Yeti', 1);
    s = play(s, 'Tinkmaster Overspark');
    expect(['EX1_tk28', 'EX1_tk29']).toContain(last(s, 1).card.id);
    expect(last(s).card.name).toBe('Tinkmaster Overspark');
  });
  it.each([
    ['Celestial Projectionist', undefined, undefined, true],
    ['Dragon Breeder', undefined, undefined, false],
    ['Shadowcaster', 1, 1, false],
    ['Splintergraft', 10, 10, false],
    ['Zola the Gorgon', undefined, undefined, false],
  ] as const)(
    '%s adds the correct card copy to hand without moving the target',
    (name, stat, cost, temporary) => {
      let s = put(setup(), 'Alexstrasza');
      const t = target(s);
      s = play(s, name, t);
      expect(s.players[0].board.some((u) => u.uid === t.uid)).toBe(true);
      expect(hand(s)).toHaveLength(1);
      expect(hand(s)[0].name).toBe('Alexstrasza');
      if (stat !== undefined) expect(cardStats(hand(s)[0])).toEqual({ attack: stat, health: stat });
      if (cost !== undefined) expect(hand(s)[0].cost).toBe(cost);
      expect(hand(s)[0].temporaryUntilTurn).toBe(temporary ? s.turn : undefined);
    },
  );
  it('Faceless Manipulator copies live damage and keywords without triggering the copied Battlecry', () => {
    let s = put(setup(), 'Annoy-o-Tron', 1);
    last(s, 1).health = 1;
    last(s, 1).shield = false;
    const t = target(s, 1);
    s = play(s, 'Faceless Manipulator', t);
    expect(last(s).card.name).toBe('Annoy-o-Tron');
    expect(last(s).health).toBe(1);
    expect(last(s).shield).toBe(false);
    expect(unitMechanics(last(s))).toContain('TAUNT');
    expect(s.log.filter((x) => x.includes('triggers Battlecry'))).toHaveLength(1);
  });
  it('Menagerie Warden summons an independent live copy of a friendly Beast', () => {
    let s = put(setup(), 'River Crocolisk');
    last(s).health = 1;
    const t = target(s);
    s = play(s, 'Menagerie Warden', t);
    const copies = s.players[0].board.filter((u) => u.card.name === 'River Crocolisk');
    expect(copies).toHaveLength(2);
    expect(copies.every((u) => u.health === 1)).toBe(true);
    expect(new Set(copies.map((u) => u.uid)).size).toBe(2);
  });
  it('Mirage Caller summons a full-health 1/1 copy under your control', () => {
    let s = put(setup(), 'Annoy-o-Tron', 1);
    const t = target(s, 1);
    s = play(s, 'Mirage Caller', t);
    const u = s.players[0].board.find((u) => u.card.name === 'Annoy-o-Tron')!;
    expect([u.attack, u.health, u.maxHealth]).toEqual([1, 1, 1]);
    expect(u.shield).toBe(true);
    expect(s.players[1].board).toHaveLength(1);
  });
  it('Northshire Farmer shuffles exactly three 3/3 copies while keeping the original Beast', () => {
    let s = put(setup(), 'River Crocolisk');
    const t = target(s);
    s = play(s, 'Northshire Farmer', t);
    expect(s.players[0].deck).toHaveLength(3);
    expect(
      s.players[0].deck.every(
        (c) =>
          c.name === 'River Crocolisk' && cardStats(c).attack === 3 && cardStats(c).health === 3,
      ),
    ).toBe(true);
    expect(s.players[0].board.some((u) => u.uid === t.uid)).toBe(true);
  });
  it('Sathrovarr independently copies a friendly minion to hand, deck and board', () => {
    let s = put(setup(), 'Chillwind Yeti');
    const t = target(s);
    s = play(s, 'Sathrovarr', t);
    expect(hand(s).map((c) => c.name)).toEqual(['Chillwind Yeti']);
    expect(s.players[0].deck.map((c) => c.name)).toEqual(['Chillwind Yeti']);
    expect(s.players[0].board.filter((u) => u.card.name === 'Chillwind Yeti')).toHaveLength(2);
  });
  it('The Nameless One becomes a 4/4 copy before silencing only the original', () => {
    let s = put(setup(), 'Annoy-o-Tron', 1);
    const t = target(s, 1);
    s = play(s, 'The Nameless One', t);
    expect([last(s).attack, last(s).health]).toEqual([4, 4]);
    expect(last(s).shield).toBe(true);
    expect(unitMechanics(last(s))).toContain('TAUNT');
    expect(last(s, 1).shield).toBe(false);
    expect(last(s, 1).silenced).toBe(true);
  });
  it('Ini Stormcoil grants all three keywords to only the new Mech copy', () => {
    let s = put(setup(), 'Annoy-o-Tron');
    last(s).shield = false;
    const t = target(s);
    s = play(s, 'Ini Stormcoil', t);
    const fresh = s.players[0].board
      .filter((u) => u.card.name === 'Annoy-o-Tron')
      .find((u) => u.uid !== t.uid)!;
    expect(unitMechanics(fresh)).toEqual(
      expect.arrayContaining(['RUSH', 'WINDFURY', 'DIVINE_SHIELD']),
    );
    expect(fresh.attacksRemaining).toBe(2);
    expect(fresh.ready).toBe(true);
    expect(s.players[0].board.find((u) => u.uid === t.uid)!.shield).toBe(false);
  });
  it.each([
    ['Grimestreet Informant', ['HUNTER', 'PALADIN', 'WARRIOR']],
    ['Kabal Courier', ['MAGE', 'PRIEST', 'WARLOCK']],
    ['Lotus Agents', ['DRUID', 'ROGUE', 'SHAMAN']],
  ] as const)('%s offers only cards from its named three classes', (name, classes) => {
    const n = play(setup(), name);
    expect(n.choice!.options).toHaveLength(3);
    expect(
      n.choice!.options.every((c) =>
        (c.classes ?? [c.cardClass]).some((cls) => (classes as readonly string[]).includes(cls)),
      ),
    ).toBe(true);
    expect(hand(choose(n))).toHaveLength(1);
  });
  it("Kaja'mite Creation offers only cheap other-class spells", () => {
    const s = setup();
    s.players[0].class = 'ROGUE';
    const n = play(s, "Kaja'mite Creation");
    expect(
      n.choice!.options.every(
        (c) =>
          c.type === 'SPELL' &&
          c.cost <= 3 &&
          c.cardClass !== 'NEUTRAL' &&
          !(c.classes ?? [c.cardClass]).includes('ROGUE'),
      ),
    ).toBe(true);
    expect(hand(choose(n))).toHaveLength(1);
  });
  it('Flowrider moves the chosen spell from deck only while Overloaded', () => {
    const s = setup();
    s.players[0].deck = [card('Fireball'), card('Frost Nova')];
    s.players[0].lockedMana = 1;
    const n = choose(play(s, 'Flowrider'));
    expect(hand(n)).toHaveLength(1);
    expect(n.players[0].deck).toHaveLength(1);
    s.players[0].lockedMana = 0;
    expect(play(s, 'Flowrider').choice).toBeUndefined();
  });
  it('Gurubashi Hypemon creates a 1/1 Battlecry minion costing one with its printed ability intact', () => {
    let s = play(setup(), 'Gurubashi Hypemon');
    expect(
      s.choice!.options.every((c) => c.type === 'MINION' && c.mechanics?.includes('BATTLECRY')),
    ).toBe(true);
    s = choose(s);
    expect(cardStats(hand(s)[0])).toEqual({ attack: 1, health: 1 });
    expect(hand(s)[0].cost).toBe(1);
    expect(hand(s)[0].mechanics).toContain('BATTLECRY');
  });
  it('Hellraiser discovers from a nonempty deck, or gains +4/+4 when empty', () => {
    const empty = play(setup(), 'Hellraiser');
    expect(empty.choice).toBeUndefined();
    expect(last(empty).attack).toBe(card('Hellraiser').attack! + 4);
    const s = setup();
    s.players[0].deck = [card('Wisp')];
    const n = choose(play(s, 'Hellraiser'));
    expect(hand(n)[0].name).toBe('Wisp');
    expect(n.players[0].deck).toHaveLength(0);
  });
  it('Anka sets only Deathrattle hand minions to 1/1 costing one without removing Deathrattle', () => {
    const s = setup();
    s.players[0].hand = [card('Loot Hoarder'), card('Chillwind Yeti')];
    const n = play(s, 'Anka, the Buried');
    expect(cardStats(hand(n)[0])).toEqual({ attack: 1, health: 1 });
    expect(hand(n)[0].cost).toBe(1);
    expect(hand(n)[0].mechanics).toContain('DEATHRATTLE');
    expect(cardStats(hand(n)[1])).toEqual({ attack: 4, health: 5 });
  });
  it('Crimson Commander buffs hand Draenei on both play and death', () => {
    const s = setup();
    s.players[0].hand = [card('Crimson Commander'), card('Wisp')];
    let n = play(s, 'Crimson Commander');
    const base = card('Crimson Commander');
    expect(cardStats(hand(n)[0])).toEqual({ attack: base.attack! + 2, health: base.health! + 1 });
    n = kill(n, last(n).uid);
    expect(cardStats(hand(n)[0])).toEqual({ attack: base.attack! + 4, health: base.health! + 2 });
    expect(cardStats(hand(n)[1])).toEqual({ attack: 1, health: 1 });
  });
  it('Invincible selects one Undead for both buff and Taunt, repeats its Deathrattle, then returns Reborn', () => {
    let s = put(setup(), 'Wisp');
    s = put(s, 'Wisp');
    s = play(s, 'Invincible');
    const uid = last(s).uid;
    let wisps = s.players[0].board.filter((u) => u.card.name === 'Wisp');
    expect(wisps.filter((u) => u.attack === 6 && unitMechanics(u).includes('TAUNT'))).toHaveLength(
      1,
    );
    s = kill(s, uid);
    wisps = s.players[0].board.filter((u) => u.card.name === 'Wisp');
    expect(wisps.reduce((n, u) => n + u.attack, 0)).toBe(12);
    expect(s.players[0].board.find((u) => u.card.name === 'Invincible')!.health).toBe(1);
  });
  it('Lord Barov sets other minions to one Health and its Deathrattle respects Divine Shield', () => {
    let s = put(setup(), 'Chillwind Yeti');
    s = put(s, 'Annoy-o-Tron', 1);
    s = play(s, 'Lord Barov');
    expect(s.players[0].board[0].health).toBe(1);
    expect(last(s, 1).health).toBe(1);
    s = kill(s, last(s).uid);
    expect(s.players[0].board).toHaveLength(0);
    expect(last(s, 1).health).toBe(1);
    expect(last(s, 1).shield).toBe(false);
  });
  it('Scarlet Purifier damages only Deathrattle minions across all boards', () => {
    let s = put(setup(), 'Loot Hoarder');
    s = put(s, 'Loot Hoarder', 1);
    s = put(s, 'Chillwind Yeti', 2);
    s = play(s, 'Scarlet Purifier');
    expect(s.players[1].board).toHaveLength(0);
    expect(last(s, 2).health).toBe(5);
  });
  it.each(['Snakebite', 'Wicked Skeleton'])(
    '%s counts all minion deaths this turn, excluding earlier turns',
    (name) => {
      const s = setup();
      s.events = [0, 1, 2].map((player) => ({
        type: 'death',
        player,
        turn: 9,
        card: card('Wisp'),
      }));
      s.events.push({ type: 'death', player: 0, turn: 8, card: card('Wisp') });
      const n = play(s, name);
      expect(last(n).attack).toBe(card(name).attack! + 3);
      expect(last(n).health).toBe(card(name).health! + 3);
    },
  );
  it('Rattling Rascal summons its Skeleton, then one for every living opponent on death', () => {
    let s = play(setup(), 'Rattling Rascal');
    const uid = s.players[0].board.find((u) => u.card.name === 'Rattling Rascal')!.uid;
    expect(
      s.players[0].board.some((u) => u.card.id === 'ICC_025t' && u.attack === 5 && u.health === 5),
    ).toBe(true);
    s = kill(s, uid);
    expect(
      s.players.slice(1).every((p) => p.board.length === 1 && p.board[0].card.id === 'ICC_025t'),
    ).toBe(true);
  });
  it('Mailbox Dancer gives you one Coin on play and each living opponent one on death', () => {
    let s = play(setup(), 'Mailbox Dancer');
    expect(hand(s).map((c) => c.name)).toEqual(['The Coin']);
    s = kill(s, last(s).uid);
    expect(
      s.players.slice(1).every((p) => p.hand.length === 1 && p.hand[0].id === 'GAME_005'),
    ).toBe(true);
  });
  it('Loan Shark gives opponents a Coin on play and you two on death', () => {
    let s = play(setup(), 'Loan Shark');
    expect(
      s.players.slice(1).every((p) => p.hand.length === 1 && p.hand[0].id === 'GAME_005'),
    ).toBe(true);
    s = kill(s, last(s).uid);
    expect(hand(s).map((c) => c.id)).toEqual(['GAME_005', 'GAME_005']);
  });
  it('Forbidden Ancient spends all remaining regular Mana for equal stats, leaving reserve alone', () => {
    const s = setup();
    s.players[0].mana = 10;
    s.players[0].reserve = 2;
    const n = play(s, 'Forbidden Ancient'),
      spent = 10 - card('Forbidden Ancient').cost;
    expect(last(n).attack).toBe(card('Forbidden Ancient').attack! + spent);
    expect(last(n).health).toBe(card('Forbidden Ancient').health! + spent);
    expect(n.players[0].mana).toBe(0);
    expect(n.players[0].reserve).toBe(2);
  });
  it('King Phaoris summons once per hand spell by its current Cost, keeping those spells', () => {
    const s = setup();
    s.players[0].hand = [card('Fireball'), card('Frost Nova'), card('Chillwind Yeti')];
    const n = play(s, 'King Phaoris');
    expect(
      n.players[0].board
        .filter((u) => u.card.name !== 'King Phaoris')
        .map((u) => u.card.cost)
        .sort(),
    ).toEqual([3, 4]);
    expect(hand(n)).toHaveLength(3);
  });
  it('Undefeated Champion fills every living enemy board to seven with one-Cost minions', () => {
    let s = put(setup(), 'Wisp', 1);
    const uid = last(s, 1).uid;
    s = play(s, 'Undefeated Champion');
    expect(s.players.slice(1).every((p) => p.board.length === 7)).toBe(true);
    expect(s.players[1].board.some((u) => u.uid === uid)).toBe(true);
    expect(s.players[2].board.every((u) => u.card.cost === 1)).toBe(true);
    expect(s.players[0].board).toHaveLength(1);
  });
  it('Cabaret Headliner discounts exactly one spell of each present school', () => {
    const s = setup();
    s.players[0].hand = [card('Fireball'), card('Fireball'), card('Frost Nova'), card('Wisp')];
    const n = play(s, 'Cabaret Headliner');
    expect(
      hand(n)
        .slice(0, 2)
        .map((c) => c.cost)
        .sort(),
    ).toEqual([2, 4]);
    expect(hand(n)[2].cost).toBe(1);
    expect(hand(n)[3].cost).toBe(0);
  });
  it('silence removes Health buffs while preserving missing Health, and can kill an over-damaged minion', () => {
    let s = put(setup(), 'Chillwind Yeti');
    const uid = last(s).uid;
    last(s).maxHealth = 8;
    last(s).health = 6;
    last(s).modifiers = [{ sourceCardId: 'test', sourceName: 'Test', attack: 0, health: 3 }];
    s = play(s, 'Ironbeak Owl', { p: 0, uid });
    expect(s.players[0].board.find((u) => u.uid === uid)!.health).toBe(3);
    let lethal = put(setup(), 'Chillwind Yeti');
    const dead = last(lethal).uid;
    last(lethal).maxHealth = 10;
    last(lethal).health = 3;
    lethal = play(lethal, 'Ironbeak Owl', { p: 0, uid: dead });
    expect(lethal.players[0].board.some((u) => u.uid === dead)).toBe(false);
  });
  it('silence removes a swapped Health debuff without creating healing history', () => {
    let s = put(setup(), 'Chillwind Yeti');
    const t = target(s);
    last(s).health = 2;
    s = play(s, "Vol'jin", t);
    expect(s.players[0].board.find((u) => u.uid === t.uid)!.maxHealth).toBe(2);
    s = play(s, 'Ironbeak Owl', t);
    expect(s.players[0].board.find((u) => u.uid === t.uid)!.health).toBe(5);
    expect(s.events!.some((e) => e.type === 'heal')).toBe(false);
  });
  it('Temporary hand copies expire at end of turn while ordinary originals remain', () => {
    let s = put(setup(), 'Chillwind Yeti');
    s = play(s, 'Celestial Projectionist', target(s));
    s = applyAction(s, { type: 'end', p: 0 });
    expect(hand(s)).toHaveLength(0);
    expect(s.players[0].grave.some((c) => c.name === 'Chillwind Yeti')).toBe(true);
    expect(s.players[0].board.some((u) => u.card.name === 'Chillwind Yeti')).toBe(true);
  });
  it('Sathrovarr still creates hand and deck copies when the last board slot is occupied by itself', () => {
    let s = put(setup(), 'Chillwind Yeti');
    const t = target(s);
    for (let i = 0; i < 5; i++) s = put(s, 'Wisp');
    s = play(s, 'Sathrovarr', t);
    expect(s.players[0].board).toHaveLength(7);
    expect(hand(s)).toHaveLength(1);
    expect(s.players[0].deck).toHaveLength(1);
  });
  it('hand copies burn at the cap, without removing or changing their target', () => {
    let s = put(setup(), 'Chillwind Yeti');
    const t = target(s);
    s.players[0].hand = Array.from({ length: 10 }, () => card('Wisp'));
    s = play(s, 'Shadowcaster', t);
    expect(hand(s)).toHaveLength(10);
    expect(s.players[0].grave.some((c) => c.name === 'Chillwind Yeti')).toBe(true);
    expect(s.players[0].board.find((u) => u.uid === t.uid)!.health).toBe(5);
  });
  it('Invincible with no other Undead does not buff itself on play or Reborn', () => {
    let s = play(setup(), 'Invincible');
    expect(last(s).attack).toBe(card('Invincible').attack);
    s = kill(s, last(s).uid);
    expect(last(s).attack).toBe(card('Invincible').attack);
    expect(last(s).health).toBe(1);
  });
  it('silenced Mailbox Dancer has no Deathrattle reward', () => {
    let s = play(setup(), 'Mailbox Dancer');
    const uid = last(s).uid;
    s = play(s, 'Ironbeak Owl', { p: 0, uid });
    s = kill(s, uid);
    expect(s.players.slice(1).every((p) => p.hand.length === 0)).toBe(true);
  });
  it('Energy Shaper preserves a spell if no exact higher-Cost replacement exists', () => {
    const s = setup();
    s.players[0].hand = [{ ...card('Fireball'), cost: 100, printedCost: 4 }];
    expect(hand(play(s, 'Energy Shaper'))[0].id).toBe(card('Fireball').id);
  });
  it('replacement choices and copies replay identically with the same seed', () => {
    const s = setup();
    s.players[0].hand = [card('Wisp'), card('Fireball')];
    s.players[0].deck = [card('Chillwind Yeti')];
    expect(play(s, 'Arch-Villain Rafaam')).toEqual(play(s, 'Arch-Villain Rafaam'));
  });
  it('Sathrovarr makes ordinary hand/deck copies, while the battlefield copy retains enchantments and damage', () => {
    let s = put(setup(), 'Chillwind Yeti');
    const t = target(s);
    last(s).attack = 7;
    last(s).health = 6;
    last(s).maxHealth = 8;
    last(s).modifiers = [{ sourceCardId: 'test', sourceName: 'Test', attack: 3, health: 3 }];
    s = play(s, 'Sathrovarr', t);
    expect(cardStats(hand(s)[0])).toEqual({ attack: 4, health: 5 });
    expect(cardStats(s.players[0].deck[0])).toEqual({ attack: 4, health: 5 });
    const copy = s.players[0].board.find(
      (u) => u.card.name === 'Chillwind Yeti' && u.uid !== t.uid,
    )!;
    expect([copy.attack, copy.health, copy.maxHealth]).toEqual([7, 6, 8]);
  });
});
