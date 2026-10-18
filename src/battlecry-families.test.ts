import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import type { Card } from './cards';
import {
  createGame,
  applyAction,
  debugAction,
  effectTargets,
  handCost,
  unitMechanics,
  type Game,
  type Target,
} from './engine';
import { supported } from './effects';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
const catalog = JSON.parse(readFileSync('src/generated/catalog.json', 'utf8')) as Card[];
function card(name: string) {
  const c =
    cards.find((c) => c.name === name && supported(c)) ?? catalog.find((c) => c.name === name);
  if (!c) throw Error(name);
  return structuredClone(c);
}
function setup() {
  const s = createGame(cards);
  s.events = [];
  for (const p of s.players) {
    p.hand = [];
    p.board = [];
    p.deck = [card('Chillwind Yeti'), card('Spider Tank'), card('Fireball')];
    p.mana = 100;
    p.maxMana = 10;
    p.health = 100;
    p.armor = 0;
    p.reserve = 0;
  }
  return s;
}
function play(s: Game, name: string, target?: Target) {
  const n = structuredClone(s);
  n.players[0].mana = 100;
  n.players[0].hand.push(card(name));
  return applyAction(n, { type: 'cast', p: 0, index: n.players[0].hand.length - 1, target });
}
function summon(s: Game, p: number, name: string) {
  return debugAction(s, { type: 'summon', p, card: card(name) });
}
function round(s: Game) {
  const turn = s.turn;
  do {
    s = applyAction(s, { type: 'end', p: s.active });
  } while (s.active !== 0 && s.winner === null && s.turn < turn + 5);
  return s;
}
function kill(s: Game, p: number, index = 0) {
  const n = structuredClone(s);
  n.players[p].board[index].health = 1;
  n.players[p].board[index].shield = false;
  return play(n, 'Elven Archer', { p, uid: n.players[p].board[index].uid });
}

describe('additional Battlecry families: independent outcomes', () => {
  it('returns a stolen commander to its original owner on death', () => {
    let s = setup();
    s.players[1].commander = card('King Krush');
    s = debugAction(s, { type: 'summon', p: 1, card: s.players[1].commander });
    const u = s.players[1].board[0];
    u.attack = 2;
    u.commander = true;
    u.commanderOwner = 1;
    s.players[1].zone = 'board';
    s = play(s, 'Cabal Shadow Priest', { p: 1, uid: u.uid });
    s = kill(s, 0, 1);
    expect(s.players[1].zone).toBe('command');
    expect(s.players[1].replacement).toBe(true);
    expect(s.players[0].replacement).toBe(false);
  });
  it('overload locks the next own turn only, after maximum mana growth', () => {
    let s = play(setup(), 'Fireguard Destroyer');
    expect(s.players[0].board[0].attack).toBeGreaterThanOrEqual(4);
    expect(s.players[0].board[0].attack).toBeLessThanOrEqual(7);
    expect(s.players[0].overload).toBe(1);
    s = round(s);
    expect(s.players[0].mana).toBe(9);
    expect(s.players[0].lockedMana).toBe(1);
    s = round(s);
    expect(s.players[0].mana).toBe(10);
    expect(s.players[0].lockedMana).toBe(0);
  });
  it('next tribal discount survives its source and unrelated plays and is consumed once', () => {
    let s = play(setup(), 'Dragon Consort');
    const dragon = card('Twilight Drake');
    expect(handCost(s.players[0], dragon)).toBe(2);
    s = kill(s, 0);
    expect(handCost(s.players[0], dragon)).toBe(2);
    s = play(s, 'Spider Tank');
    expect(handCost(s.players[0], dragon)).toBe(2);
    s.players[0].hand = [dragon];
    s.players[0].mana = 2;
    s = applyAction(s, { type: 'cast', p: 0, index: 0 });
    expect(s.players[0].mana).toBe(0);
    expect(handCost(s.players[0], dragon)).toBe(4);
  });
  it('Joust requires a strict win over every living opponent and draws the revealed card only', () => {
    let s = setup();
    s.players[0].deck = [card('King Krush')];
    for (let i = 1; i < 4; i++) s.players[i].deck = [card('Chillwind Yeti')];
    s = play(s, "King's Elekk");
    expect(s.players[0].hand.map((c) => c.name)).toEqual(['King Krush']);
    expect(s.players[0].deck).toHaveLength(0);
    s = setup();
    s.players[0].deck = [card('Chillwind Yeti')];
    s = play(s, "King's Elekk");
    expect(s.players[0].hand).toHaveLength(0);
  });
  it('copying a Deathrattle does not kill or trigger its donor, and Silence removes the grant', () => {
    let s = summon(setup(), 0, 'Loot Hoarder');
    const donor = s.players[0].board[0].uid;
    s = play(s, "Mok'Nathal Lion", { p: 0, uid: donor });
    expect(s.players[0].hand).toHaveLength(0);
    expect(s.players[0].board[1].grantedDeathrattles).toHaveLength(1);
    s = kill(s, 0, 1);
    expect(s.players[0].hand).toHaveLength(1);
    expect(s.players[0].board.some((u) => u.uid === donor)).toBe(true);
    let n = summon(setup(), 0, 'Loot Hoarder');
    n = play(n, "Mok'Nathal Lion", { p: 0, uid: n.players[0].board[0].uid });
    n = play(n, 'Ironbeak Owl', { p: 0, uid: n.players[0].board[1].uid });
    expect(n.players[0].board[1].grantedDeathrattles).toEqual([]);
    n = kill(n, 0, 1);
    expect(n.players[0].hand).toHaveLength(0);
  });
  it('triggers a living friendly Deathrattle without removing its owner', () => {
    let s = summon(setup(), 0, 'Loot Hoarder');
    const uid = s.players[0].board[0].uid;
    s = play(s, 'Terrorscale Stalker', { p: 0, uid });
    expect(s.players[0].hand).toHaveLength(1);
    expect(s.players[0].board.some((u) => u.uid === uid)).toBe(true);
  });
  it('resurrects deaths rather than discards and never repeats a Battlecry', () => {
    let s = summon(setup(), 0, 'Novice Engineer');
    s = kill(s, 0);
    s.players[0].grave.push(card('King Krush'));
    s.players[0].hand = [];
    s = play(s, 'Onyx Bishop');
    expect(s.players[0].board.some((u) => u.card.name === 'Novice Engineer')).toBe(true);
    expect(s.players[0].board.some((u) => u.card.name === 'King Krush')).toBe(false);
    expect(s.players[0].hand).toHaveLength(0);
  });
  it('Psychopomp grants Reborn to the resurrected minion without repeating Battlecry', () => {
    let s = summon(setup(), 0, 'Novice Engineer');
    s = kill(s, 0);
    s.players[0].hand = [];
    s = play(s, 'Psychopomp');
    const u = s.players[0].board.find((u) => u.card.name === 'Novice Engineer')!;
    expect(unitMechanics(u)).toContain('REBORN');
    expect(s.players[0].hand).toHaveLength(0);
  });
  it('lasting future-summon stats persist after the source dies and skip other tribes', () => {
    let s = play(setup(), 'Neptulon, Lord of Tides');
    s = kill(s, 0);
    s = summon(s, 0, 'Fireguard Destroyer');
    const u = s.players[0].board.at(-1)!;
    expect([u.attack, u.health]).toEqual([5, 5]);
    s = summon(s, 0, 'Chillwind Yeti');
    expect(s.players[0].board.at(-1)!.health).toBe(5);
    expect(s.players[0].board.at(-1)!.attack).toBe(4);
  });
  it('scheduled self-copy only happens once, and requires an unsilenced source in play', () => {
    let s = play(setup(), 'Assimilating Ooze');
    s = applyAction(s, { type: 'end', p: 0 });
    expect(s.players[0].board.filter((u) => u.card.name === 'Assimilating Ooze')).toHaveLength(2);
    s = play(setup(), 'Assimilating Ooze');
    s = kill(s, 0);
    s = applyAction(s, { type: 'end', p: 0 });
    expect(s.players[0].board.some((u) => u.card.name === 'Assimilating Ooze')).toBe(false);
  });
  it('hand choice shows only Fel spells, copies one, and blocks other actions until selection', () => {
    let s = setup();
    s.players[0].hand = [card('Chaos Strike'), card('Fireball')];
    s = play(s, 'Grave Defiler');
    expect(s.choice?.options.map((c) => c.name)).toEqual(['Chaos Strike']);
    expect(() => applyAction(s, { type: 'end', p: 0 })).toThrow(/choice/);
    expect(() => applyAction(s, { type: 'choose', p: 1, index: 0 })).toThrow(/choice/);
    s = applyAction(s, { type: 'choose', p: 0, index: 0 });
    expect(s.players[0].hand.filter((c) => c.name === 'Chaos Strike')).toHaveLength(2);
  });
  it('deck-order choice moves the physical selected card, without drawing or duplicating it', () => {
    let s = play(setup(), 'Sightless Watcher');
    const name = s.choice!.options[1].name;
    s = applyAction(s, { type: 'choose', p: 0, index: 1 });
    expect(s.players[0].deck[0].name).toBe(name);
    expect(s.players[0].deck).toHaveLength(3);
    expect(s.players[0].hand).toHaveLength(0);
  });
  it('enemy-deck Discover is a copy, while its enemy-draw rider moves the original', () => {
    let s = setup();
    for (let i = 1; i < 4; i++) s.players[i].deck = [card('Spider Tank')];
    s = play(s, 'Southsea Scoundrel');
    for (let owner = 1; owner < 4; owner++) {
      expect(s.choice?.step.owner).toBe(owner);
      s = applyAction(s, { type: 'choose', p: 0, index: 0 });
    }
    expect(s.choice).toBeUndefined();
    expect(s.players[0].hand).toHaveLength(3);
    expect(s.players[0].hand[0].name).toBe('Spider Tank');
    for (let i = 1; i < 4; i++) {
      expect(s.players[i].deck).toHaveLength(0);
      expect(s.players[i].hand[0].name).toBe('Spider Tank');
    }
  });
  it('weapon removal affects living opponents and preserves the friendly weapon', () => {
    const s = setup();
    for (const p of s.players) p.weapon = { card: card('Fiery War Axe'), attack: 3, durability: 2 };
    const n = play(s, 'Acidic Swamp Ooze');
    expect(n.players[0].weapon?.attack).toBe(3);
    for (let i = 1; i < 4; i++) expect(n.players[i].weapon).toBeUndefined();
  });
  it('filtered control requires a legal small enemy and respects board capacity', () => {
    let s = summon(setup(), 1, 'Elven Archer');
    s = summon(s, 1, 'Chillwind Yeti');
    expect(effectTargets(s, 0, card('Cabal Shadow Priest')).map((t) => t.uid)).toEqual([
      s.players[1].board[0].uid,
    ]);
    const uid = s.players[1].board[0].uid;
    s = play(s, 'Cabal Shadow Priest', { p: 1, uid });
    expect(s.players[0].board.some((u) => u.uid === uid)).toBe(true);
    expect(s.players[1].board.some((u) => u.uid === uid)).toBe(false);
  });
  it('draw stat/cost replacement persists in hand and on board', () => {
    let s = play(setup(), 'Jepetto Joybuzz');
    expect(s.players[0].hand).toHaveLength(2);
    const c = s.players[0].hand[0];
    expect(c.cost).toBe(1);
    s = applyAction(s, { type: 'cast', p: 0, index: 0 });
    const u = s.players[0].board.at(-1)!;
    expect([u.attack, u.health]).toEqual([1, 1]);
  });
});
