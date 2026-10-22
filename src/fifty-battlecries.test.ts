import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { type Card, cardStats } from './cards';
import {
  applyAction,
  createGame,
  debugAction,
  handCost,
  unitMechanics,
  type Game,
  type Target,
} from './engine';
import { supported } from './effects';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
const manifest = JSON.parse(readFileSync('data/fifty-battlecry-batch.json', 'utf8')) as {
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
      deck: Array.from({ length: 12 }, () => card('Wisp')),
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
function events(s: Game, names: string[], turn = s.turn, p = 0) {
  for (const name of names) s.events!.push({ type: 'play', player: p, turn, card: card(name) });
  return s;
}
function change(s: Game, type: string, amount: number, turn = s.turn, p = 0) {
  s.events!.push({ type, player: p, turn, amount });
  return s;
}
const last = (s: Game) => s.players[0].board.at(-1)!;
const stats = (s: Game) => [last(s).attack, last(s).health];
const base = (name: string, a: number, h = a) => [card(name).attack! + a, card(name).health! + h];
const hand = (s: Game) => s.players[0].hand;
function previous(s: Game, names: string[]) {
  s.events!.push({ type: 'turn', player: 0, turn: 5 });
  events(s, names, 5);
  return s;
}
describe('fifty-name cost, history and copying batch', () => {
  it('counts fifty distinct new names', () => expect(manifest.names).toHaveLength(50));
  it.each(manifest.names)('%s supports every printing', (name) =>
    expect(cards.filter((c) => c.name === name).every(supported)).toBe(true),
  );
  it('Astral Vigilant copies only the most recent friendly Draenei play', () => {
    const s = events(setup(), ['Crimson Commander', 'Primus of Power']);
    events(s, ['Wisp'], 9, 1);
    expect(hand(play(s, 'Astral Vigilant')).map((c) => c.name)).toEqual(['Crimson Commander']);
  });
  it('Baleful Blazer destroys the chosen minion after a Fire spell this turn', () => {
    let s = put(events(setup(), ['Fireball']), 'Chillwind Yeti', 1);
    const uid = s.players[1].board[0].uid;
    s = play(s, 'Baleful Blazer', { p: 1, uid });
    expect(s.players[1].board).toHaveLength(0);
  });
  it('Barista copies other friendly Battlecries and excludes itself and vanilla minions', () => {
    let s = put(setup(), 'Elven Archer');
    s = put(s, 'Wisp');
    s = play(s, 'Barista Lynchen');
    expect(hand(s).map((c) => c.name)).toEqual(['Elven Archer']);
  });
  it('Captain Galvangar counts Armor gained, not current Armor or enemy gains', () => {
    const s = change(
      change(change(setup(), 'armor-change', 15), 'armor-change', -15),
      'armor-change',
      20,
      9,
      1,
    );
    const n = play(s, 'Captain Galvangar');
    expect(stats(n)).toEqual(base('Captain Galvangar', 3));
    expect(unitMechanics(last(n))).toContain('CHARGE');
    expect(last(n).ready).toBe(true);
  });
  it('Cloud Serpent copies a matching hand minion without removing it', () => {
    const s = setup();
    s.players[0].hand = [card('Water Elemental'), card('Wisp')];
    expect(hand(play(s, 'Cloud Serpent')).map((c) => c.name)).toEqual([
      'Water Elemental',
      'Wisp',
      'Water Elemental',
    ]);
  });
  it('Clownfish discounts precisely the next two Murlocs and ignores other cards', () => {
    let s = play(setup(), 'Clownfish');
    expect(handCost(s.players[0], card('Murloc Raider'))).toBe(0);
    s = play(s, 'Wisp');
    expect(s.players[0].nextDiscounts![0].remaining).toBe(2);
    s = play(s, 'Murloc Raider');
    expect(s.players[0].nextDiscounts![0].remaining).toBe(1);
    s = play(s, 'Murloc Raider');
    expect(handCost(s.players[0], card('Murloc Raider'))).toBe(1);
  });
  it('Commander Sivara returns the first three spells cast while held, once', () => {
    const s = events(setup(), ['Fireball', 'Frostbolt', 'Shadow Bolt', 'Fireball']);
    expect(hand(play(s, 'Commander Sivara')).map((c) => c.name)).toEqual([
      'Fireball',
      'Frostbolt',
      'Shadow Bolt',
    ]);
  });
  it('Coral Keeper summons one Elemental per distinct own school', () => {
    const s = events(setup(), ['Fireball', 'Fireball', 'Frostbolt']);
    events(s, ['Shadow Bolt'], 9, 1);
    const n = play(s, 'Coral Keeper');
    expect(n.players[0].board.filter((u) => u.card.name === 'Coral Elemental')).toHaveLength(2);
  });
  it('Crystal Stag counts actual own healing across turns and summons one Rush copy', () => {
    const s = change(change(setup(), 'heal', 3, 1), 'heal', 2);
    const n = play(s, 'Crystal Stag');
    expect(n.players[0].board).toHaveLength(2);
    expect(n.players[0].board.every((u) => unitMechanics(u).includes('RUSH'))).toBe(true);
  });
  it('Dragoncaller Alanna counts expensive own spell plays only and respects slots', () => {
    const s = events(setup(), ['Flamestrike', 'Fireball', 'Flamestrike']);
    events(s, ['Flamestrike'], 9, 1);
    const n = play(s, 'Dragoncaller Alanna');
    expect(n.players[0].board.filter((u) => u.card.name === 'Fire Dragon')).toHaveLength(2);
  });
  it('Dragoncaster needs a held Dragon and gives one free spell this turn', () => {
    const s = setup();
    s.players[0].hand = [card('Alexstrasza')];
    const n = play(s, 'Dragoncaster');
    expect(handCost(n.players[0], card('Fireball'))).toBe(0);
    expect(handCost(play(n, 'Fireball', { p: 1 }).players[0], card('Fireball'))).toBe(4);
    expect(handCost(play(setup(), 'Dragoncaster').players[0], card('Fireball'))).toBe(4);
  });
  it('Druid of the Fang transforms into the pinned 7/7 Beast only with a friendly Beast', () => {
    const n = play(put(setup(), 'River Crocolisk'), 'Druid of the Fang');
    expect(stats(n)).toEqual([7, 7]);
    expect(last(n).card.id).toBe('GVG_080t');
    expect(stats(play(setup(), 'Druid of the Fang'))).toEqual(base('Druid of the Fang', 0));
  });
  it('Eternal Sentinel restores locked crystals and clears future Overload', () => {
    const s = setup();
    Object.assign(s.players[0], { mana: 5, lockedMana: 3, overload: 2 });
    const n = play(s, 'Eternal Sentinel');
    expect(n.players[0].lockedMana).toBe(0);
    expect(n.players[0].overload).toBe(0);
    expect(n.players[0].mana).toBe(5 - card('Eternal Sentinel').cost + 3);
  });
  it('Ethereal Peddler discounts only non-neutral cards outside your class', () => {
    const s = setup();
    s.players[0].class = 'ROGUE';
    s.players[0].hand = [card('Fireball'), card('Wisp'), card('Backstab')];
    expect(hand(play(s, 'Ethereal Peddler')).map((c) => c.cost)).toEqual([2, 0, 0]);
  });
  it('Fearless Flamejuggler gains total damage taken this turn, including Armor absorbed', () => {
    const s = change(change(setup(), 'hero-damage', 4), 'hero-damage', 2);
    change(s, 'hero-damage', 9, 8);
    expect(stats(play(s, 'Fearless Flamejuggler'))).toEqual(base('Fearless Flamejuggler', 6));
  });
  it('Freebird excludes its current play and opponents while counting earlier copies', () => {
    const s = events(setup(), ['Freebird', 'Freebird']);
    events(s, ['Freebird'], 9, 1);
    expect(stats(play(s, 'Freebird'))).toEqual(base('Freebird', 2));
  });
  it('Future Emissary discounts and buffs only Dragons already in hand', () => {
    const s = setup();
    s.players[0].hand = [card('Alexstrasza'), card('Wisp')];
    const n = play(s, 'Future Emissary');
    expect(hand(n)[0].cost).toBe(8);
    expect(cardStats(hand(n)[0])).toEqual({ attack: 9, health: 9 });
    expect(cardStats(hand(n)[1])).toEqual({ attack: 1, health: 1 });
  });
  it('Green-Thumb Gardener refreshes by the largest spell Cost without growing maximum Mana', () => {
    const s = setup();
    s.players[0].mana = 6;
    s.players[0].hand = [card('Flamestrike'), card('Fireball')];
    const n = play(s, 'Green-Thumb Gardener');
    expect(n.players[0].mana).toBe(7);
    expect(n.players[0].maxMana).toBe(10);
  });
  it('Hedra summons by each held spell Cost without replaying its spell', () => {
    const s = events(setup(), ['Fireball', 'Frostbolt']);
    const n = play(s, 'Hedra the Heretic');
    expect(
      n.players[0].board
        .slice(1)
        .map((u) => u.card.cost)
        .sort((a, b) => a - b),
    ).toEqual([2, 4]);
    expect(n.players[1].health).toBe(40);
  });
  it('Immortal spends exactly four remaining Mana to double its live stats, or does nothing', () => {
    const s = setup();
    s.players[0].mana = card('Immortal').cost + 4;
    const n = play(s, 'Immortal');
    expect(stats(n)).toEqual([card('Immortal').attack! * 2, card('Immortal').health! * 2]);
    expect(n.players[0].mana).toBe(0);
    s.players[0].mana = card('Immortal').cost + 3;
    expect(stats(play(s, 'Immortal'))).toEqual(base('Immortal', 0));
  });
  it('Inkmaster Solia grants a free spell only when the remaining deck has no duplicates', () => {
    const s = setup();
    s.players[0].deck = [card('Wisp'), card('Fireball')];
    expect(handCost(play(s, 'Inkmaster Solia').players[0], card('Fireball'))).toBe(0);
    expect(handCost(play(setup(), 'Inkmaster Solia').players[0], card('Fireball'))).toBe(4);
  });
  it('Kragwa copies only spells from the most recent own turn, not the preceding seat', () => {
    const s = previous(setup(), ['Fireball']);
    events(s, ['Frostbolt'], 8, 1);
    events(s, ['Shadow Bolt'], 1);
    expect(hand(play(s, "Krag'wa, the Frog")).map((c) => c.name)).toEqual(['Fireball']);
  });
  it('Lunar Trailblazer changes one spell to its own modified card Cost', () => {
    const s = setup();
    s.players[0].hand = [card('Fireball'), card('Frostbolt')];
    const n = play(s, 'Lunar Trailblazer');
    expect(hand(n).filter((c) => c.cost === card('Lunar Trailblazer').cost)).toHaveLength(1);
  });
  it('Mana Cyclone adds one Mage spell per own spell this turn', () => {
    const s = events(setup(), ['Fireball', 'Frostbolt']);
    events(s, ['Shadow Bolt'], 8);
    const n = play(s, 'Mana Cyclone');
    expect(hand(n)).toHaveLength(2);
    expect(
      hand(n).every((c) => c.type === 'SPELL' && (c.classes ?? [c.cardClass]).includes('MAGE')),
    ).toBe(true);
  });
  it('Metamorfin requires an own Fel spell this turn', () => {
    const fel = cards.find((c) => c.type === 'SPELL' && c.spellSchool === 'FEL')!;
    const s = setup();
    s.events!.push({ type: 'play', player: 0, turn: 9, card: fel });
    expect(stats(play(s, 'Metamorfin'))).toEqual(base('Metamorfin', 2));
    expect(stats(play(setup(), 'Metamorfin'))).toEqual(base('Metamorfin', 0));
  });
  it('Naga Sand Witch sets current hand spells to five and leaves minions alone', () => {
    const s = setup();
    s.players[0].hand = [card('Fireball'), card('Flamestrike'), card('Wisp')];
    expect(hand(play(s, 'Naga Sand Witch')).map((c) => c.cost)).toEqual([5, 5, 0]);
  });
  it('Nethersoul Buster gains Attack, not Health, from damage taken this turn', () =>
    expect(stats(play(change(setup(), 'hero-damage', 7), 'Nethersoul Buster'))).toEqual(
      base('Nethersoul Buster', 7, 0),
    ));
  it('Nobleman copies one physical hand card with its enchantments', () => {
    const s = setup();
    const c = card('Wisp');
    c.modifiers = [{ sourceCardId: 'test', sourceName: 'Test', attack: 2, health: 1 }];
    s.players[0].hand = [c];
    const n = play(s, 'Nobleman');
    expect(hand(n)).toHaveLength(2);
    expect(cardStats(hand(n)[1])).toEqual({ attack: 3, health: 2 });
  });
  it('Nordrassil Druid discounts one matching spell by three', () => {
    const n = play(setup(), 'Nordrassil Druid');
    expect(handCost(n.players[0], card('Fireball'))).toBe(1);
    expect(handCost(n.players[0], card('Chillwind Yeti'))).toBe(4);
  });
  it('Ozruk gains five Health per Elemental on your last turn', () => {
    const s = previous(setup(), ['Water Elemental', 'Water Elemental', 'Wisp']);
    expect(stats(play(s, 'Ozruk'))).toEqual(base('Ozruk', 0, 10));
  });
  it('Priestess Valishj refreshes one empty crystal per own spell this turn', () => {
    const s = events(setup(), ['Fireball', 'Frostbolt']);
    s.players[0].mana = card('Priestess Valishj').cost;
    expect(play(s, 'Priestess Valishj').players[0].mana).toBe(2);
  });
  it('Primordial Overseer requires a Nature spell cast while it was held', () => {
    const nature = cards.find((c) => c.type === 'SPELL' && c.spellSchool === 'NATURE')!;
    const s = setup();
    s.events!.push({ type: 'play', player: 0, turn: 9, card: nature });
    const n = play(s, 'Primordial Overseer');
    expect(stats(n)).toEqual(base('Primordial Overseer', 1));
    expect(hand(n)).toHaveLength(1);
  });
  it('Queensguard gains +1/+1 per own spell this turn', () =>
    expect(stats(play(events(setup(), ['Fireball', 'Frostbolt']), 'Queensguard'))).toEqual(
      base('Queensguard', 2),
    ));
  it('Razzle-Dazzler summons its base minion plus one per distinct school', () => {
    const n = play(events(setup(), ['Fireball', 'Fireball', 'Frostbolt']), 'Razzle-Dazzler');
    expect(n.players[0].board).toHaveLength(4);
    expect(n.players[0].board.slice(1).every((u) => u.card.cost === 5)).toBe(true);
  });
  it('Rimescale Siren freezes three distinct enemy minions, never heroes', () => {
    let s = events(setup(), ['Fireball', 'Frostbolt', 'Fireball']);
    for (let i = 0; i < 4; i++) s = put(s, 'Wisp', 1);
    s = play(s, 'Rimescale Siren');
    expect(s.players[1].board.filter((u) => u.frozen)).toHaveLength(3);
    expect(s.players[1].frozen).not.toBe(true);
  });
  it('Sea Shill waits for an other-class card and is not consumed by Neutral cards', () => {
    const s = setup();
    s.players[0].class = 'ROGUE';
    let n = play(s, 'Sea Shill');
    n = play(n, 'Wisp');
    expect(handCost(n.players[0], card('Fireball'))).toBe(2);
    n = play(n, 'Fireball', { p: 1 });
    expect(handCost(n.players[0], card('Fireball'))).toBe(4);
  });
  it('Shadowblade Slinger damages only the selected enemy minion by own hero damage', () => {
    let s = put(change(setup(), 'hero-damage', 3), 'Chillwind Yeti', 1);
    const uid = s.players[1].board[0].uid;
    s = play(s, 'Shadowblade Slinger', { p: 1, uid });
    expect(s.players[1].board[0].health).toBe(2);
    expect(s.players[1].health).toBe(40);
  });
  it('Shapeless Constellation copies a hand minion as 8/8 without removing it or firing its Battlecry', () => {
    const s = setup();
    s.players[0].hand = [card('Elven Archer')];
    const n = play(s, 'Shapeless Constellation');
    expect(stats(n)).toEqual([8, 8]);
    expect(last(n).card.name).toBe('Elven Archer');
    expect(hand(n)).toHaveLength(1);
    expect(n.players[1].health).toBe(40);
  });
  it('Spire Security reveals without drawing and splits five damage only among enemy minions', () => {
    let s = put(setup(), 'Chillwind Yeti', 1);
    s.players[0].deck = [card('Flamestrike')];
    s = play(s, 'Spire Security');
    expect(s.players[1].board).toHaveLength(0);
    expect(s.players[0].deck).toHaveLength(1);
    expect(s.players.slice(1).every((p) => p.health === 40)).toBe(true);
  });
  it('Spiteful Summoner reveals a spell without consuming it and summons that exact Cost', () => {
    const s = setup();
    s.players[0].deck = [card('Fireball')];
    const n = play(s, 'Spiteful Summoner');
    expect(last(n).card.cost).toBe(4);
    expect(n.players[0].deck).toHaveLength(1);
  });
  it('Stone Sentinel summons two pinned Taunt Elementals after an Elemental last turn', () => {
    const n = play(previous(setup(), ['Water Elemental']), 'Stone Sentinel');
    expect(n.players[0].board).toHaveLength(3);
    expect(
      n.players[0].board
        .slice(1)
        .every((u) => u.card.id === 'UNG_208t' && unitMechanics(u).includes('TAUNT')),
    ).toBe(true);
  });
  it('Swiftscale Trickster makes the next spell free and its unused discount expires', () => {
    let n = play(setup(), 'Swiftscale Trickster');
    expect(handCost(n.players[0], card('Fireball'))).toBe(0);
    n = applyAction(n, { type: 'end', p: 0 });
    expect(handCost(n.players[0], card('Fireball'))).toBe(4);
  });
  it('Thorim unlocks both current and pending Overload and draws that many cards', () => {
    const s = setup();
    Object.assign(s.players[0], { mana: 6, lockedMana: 2, overload: 1 });
    const n = play(s, 'Thorim, Stormlord');
    expect(hand(n)).toHaveLength(3);
    expect(n.players[0].lockedMana).toBe(0);
    expect(n.players[0].overload).toBe(0);
  });
  it('Twilight Medium changes only the top card to zero', () => {
    const s = setup();
    s.players[0].deck = [card('Fireball'), card('Frostbolt')];
    expect(play(s, 'Twilight Medium').players[0].deck.map((c) => c.cost)).toEqual([0, 2]);
  });
  it('Unchained Gladiator draws once plus once for each Elemental last turn', () =>
    expect(
      hand(play(previous(setup(), ['Water Elemental', 'Water Elemental']), 'Unchained Gladiator')),
    ).toHaveLength(3));
  it('Vanndar requires a strict comparison against every remaining deck minion', () => {
    const s = setup();
    s.players[0].deck = [card('Alexstrasza'), card('Onyxia'), card('Fireball')];
    const n = play(s, 'Vanndar Stormpike');
    expect(n.players[0].deck.map((c) => c.cost)).toEqual([6, 6, 4]);
    s.players[0].deck.push(card('Vanndar Stormpike'));
    expect(play(s, 'Vanndar Stormpike').players[0].deck[0].cost).toBe(9);
  });
  it('Wizened Wildspeaker refreshes three only if no minion was played last turn', () => {
    const s = previous(setup(), ['Fireball']);
    s.players[0].mana = card('Wizened Wildspeaker').cost;
    expect(play(s, 'Wizened Wildspeaker').players[0].mana).toBe(3);
    events(s, ['Wisp'], 5);
    expect(play(s, 'Wizened Wildspeaker').players[0].mana).toBe(0);
  });
  it('Xyrella uses actual healing this turn and hits every enemy board', () => {
    let s = change(setup(), 'heal', 2);
    s = put(s, 'Chillwind Yeti', 1);
    s = put(s, 'Chillwind Yeti', 2);
    change(s, 'heal', 9, 8);
    s = play(s, 'Xyrella');
    expect(s.players[1].board[0].health).toBe(3);
    expect(s.players[2].board[0].health).toBe(3);
    expect(s.players[1].health).toBe(40);
  });
  it('Zandalari Templar unlocks exactly at ten own restored Health', () => {
    const n = play(change(setup(), 'heal', 10), 'Zandalari Templar');
    expect(stats(n)).toEqual(base('Zandalari Templar', 4));
    expect(unitMechanics(last(n))).toContain('TAUNT');
    expect(stats(play(change(setup(), 'heal', 9), 'Zandalari Templar'))).toEqual(
      base('Zandalari Templar', 0),
    );
  });
  it('Zaqali Flamemancer checks distinct current hand Costs before discounting every card', () => {
    const s = setup();
    s.players[0].hand = [card('Fireball'), card('Frostbolt')];
    expect(hand(play(s, 'Zaqali Flamemancer')).map((c) => c.cost)).toEqual([2, 0]);
    s.players[0].hand = [card('Fireball'), card('Chillwind Yeti')];
    expect(hand(play(s, 'Zaqali Flamemancer')).map((c) => c.cost)).toEqual([4, 4]);
  });
  it('held history excludes spells before acquisition and opposing spell plays', () => {
    const s = events(setup(), ['Fireball', 'Frostbolt']);
    const heldSince = s.events!.length;
    events(s, ['Shadow Bolt', 'Fireball']);
    events(s, ['Fireball'], 9, 1);
    s.players[0].hand.push({ ...card('Commander Sivara'), heldSince });
    const n = applyAction(s, { type: 'cast', p: 0, index: 0 });
    expect(hand(n)).toHaveLength(0);
    s.events!.push({ type: 'play', player: 0, turn: 9, card: card('Frost Nova') });
    const ready = applyAction(s, { type: 'cast', p: 0, index: 0 });
    expect(hand(ready).map((c) => c.name)).toEqual(['Shadow Bolt', 'Fireball', 'Frost Nova']);
  });
  it('held-copy rewards burn overflow without growing the hand or modifying history', () => {
    const s = events(setup(), ['Fireball', 'Frost Nova', 'Shadow Bolt']);
    s.players[0].hand = Array.from({ length: 10 }, () => card('Wisp'));
    const n = play(s, 'Commander Sivara');
    expect(hand(n)).toHaveLength(10);
    expect(n.players[0].grave).toHaveLength(3);
    expect(n.events!.filter((e) => e.type === 'play' && e.card?.type === 'SPELL')).toHaveLength(3);
  });
  it('history-based summons stop at seven slots without replaying Battlecries', () => {
    let s = events(
      setup(),
      Array.from({ length: 10 }, () => 'Flamestrike'),
    );
    for (let i = 0; i < 5; i++) s = put(s, 'Wisp');
    s = play(s, 'Dragoncaller Alanna');
    expect(s.players[0].board).toHaveLength(7);
    expect(s.players[0].board.filter((u) => u.card.name === 'Fire Dragon')).toHaveLength(1);
  });
  it('school-count summons still have their base summon with no school history', () => {
    expect(play(setup(), 'Razzle-Dazzler').players[0].board).toHaveLength(2);
    expect(play(setup(), 'Coral Keeper').players[0].board).toHaveLength(1);
  });
  it('a reveal below threshold, an empty deck, and a non-spell deck have no payoff', () => {
    let s = put(setup(), 'Chillwind Yeti', 1);
    s.players[0].deck = [card('Fireball')];
    expect(play(s, 'Spire Security').players[1].board[0].health).toBe(5);
    s.players[0].deck = [];
    expect(play(s, 'Spiteful Summoner').players[0].board).toHaveLength(1);
    expect(play(setup(), 'Thorim, Stormlord').players[0].hand).toHaveLength(0);
  });
  it('unused Clownfish discounts persist across turns, but temporary free spells expire', () => {
    let n = play(setup(), 'Clownfish');
    n = applyAction(n, { type: 'end', p: 0 });
    expect(handCost(n.players[0], card('Murloc Tidehunter'))).toBe(0);
    expect(n.players[0].nextDiscounts![0].remaining).toBe(2);
  });
  it('permanent hand cost setters preserve the printed Cost for reset on leaving hand', () => {
    const s = setup();
    s.players[0].hand = [card('Fireball')];
    const n = play(s, 'Naga Sand Witch');
    expect(hand(n)[0].cost).toBe(5);
    expect(hand(n)[0].printedCost).toBe(4);
  });
  it('healing thresholds count actual restored Health from the engine, not an attempted overheal', () => {
    let s = put(setup(), 'Chillwind Yeti');
    last(s).health = 4;
    s = play(s, 'Healing Touch', { p: 0, uid: last(s).uid });
    expect(
      s.events!.filter((e) => e.type === 'heal').reduce((n, e) => n + (e.amount ?? 0), 0),
    ).toBe(1);
    expect(stats(play(s, 'Crystal Stag'))).toEqual(base('Crystal Stag', 0));
  });
});
