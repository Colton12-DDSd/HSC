import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  applyAction,
  createGame,
  commandCost,
  debugAction,
  replay,
  supported,
  type Game,
  type Action,
} from './engine';
import { validateDeck, parseDeck, type Card } from './cards';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
const card = (id: string) => cards.find((c) => c.id === id)!;
function setup() {
  const s = createGame(cards);
  s.players.forEach((p) => {
    p.mana = 10;
    p.maxMana = 10;
    p.reserve = 0;
  });
  return s;
}
const cast = (s: Game) => applyAction(s, { type: 'cast', p: 0, command: true });
describe('Commander rules', () => {
  it('charges printed cost and increments only successful command casts', () => {
    const s = setup();
    const n = cast(s);
    expect(n.players[0].mana).toBe(10 - s.players[0].commander.cost);
    expect(n.players[0].casts).toBe(1);
    expect(n.players[0].zone).toBe('board');
    expect(s.players[0].zone).toBe('command');
  });
  it('does not increase tax on interruption and keeps casting mana spent', () => {
    let s = setup();
    s.players[1].reserve = 3;
    s = cast(s);
    expect(s.pending?.queue).toEqual([1]);
    s = applyAction(s, { type: 'interrupt', p: 1 });
    expect(s.players[0].casts).toBe(0);
    expect(s.players[0].zone).toBe('command');
    expect(s.players[0].mana).toBe(1);
    expect(s.players[1].reserve).toBe(0);
    expect(s.players[0].board).toHaveLength(0);
  });
  it('applies cumulative tax, reductions, and minimum one', () => {
    const p = setup().players[0];
    p.casts = 3;
    expect(commandCost(p)).toBe(15);
    p.reduction = 30;
    expect(commandCost(p)).toBe(1);
  });
  it('hand casting can cost zero without tax and preserves accumulated tax', () => {
    let s = setup();
    const p = s.players[0];
    p.zone = 'hand';
    p.hand = [p.commander];
    p.casts = 4;
    p.handReduction = 20;
    s = applyAction(s, { type: 'cast', p: 0, index: 0 });
    expect(s.players[0].mana).toBe(10);
    expect(s.players[0].casts).toBe(4);
    expect(s.players[0].zone).toBe('board');
  });
  it('returns a dead commander to command and allows owner destination choice', () => {
    let s = cast(setup());
    s.players[0].board[0].health = 0;
    s = debugAction(s, { type: 'edit', p: 1, field: 'mana', value: 10 });
    expect(s.players[0].zone).toBe('command');
    s = applyAction(s, { type: 'commander-destination', p: 0, destination: 'hand' });
    expect(s.players[0].hand.some((c) => c.id === s.players[0].commander.id)).toBe(true);
    expect(s.players[0].casts).toBe(1);
  });
});
describe('Clockwise interruption', () => {
  it('skips eliminated and insufficient reserve opponents', () => {
    let s = setup();
    s.players[1].health = 0;
    s.players[1].reserve = 3;
    s.players[2].reserve = 2;
    s.players[3].reserve = 3;
    s = cast(s);
    expect(s.pending?.queue).toEqual([3]);
    expect(() => applyAction(s, { type: 'pass', p: 2 })).toThrow();
    s = applyAction(s, { type: 'pass', p: 3 });
    expect(s.pending).toBeNull();
    expect(s.players[0].casts).toBe(1);
  });
  it('passing is final and one interruption ends a window', () => {
    let s = setup();
    s.players[1].reserve = 3;
    s.players[2].reserve = 3;
    s.players[3].reserve = 3;
    s = cast(s);
    s = applyAction(s, { type: 'pass', p: 1 });
    expect(() => applyAction(s, { type: 'interrupt', p: 1 })).toThrow();
    s = applyAction(s, { type: 'interrupt', p: 2 });
    expect(s.pending).toBeNull();
    expect(s.players[3].reserve).toBe(3);
  });
  it('returns interrupted spells to hand with no effect', () => {
    let s = setup();
    s.players[0].hand = [card('CS2_029')];
    s.players[1].reserve = 3;
    s = applyAction(s, { type: 'cast', p: 0, index: 0, target: { p: 1 } });
    s = applyAction(s, { type: 'interrupt', p: 1 });
    expect(s.players[1].health).toBe(40);
    expect(s.players[0].hand[0].id).toBe('CS2_029');
    expect(s.players[0].mana).toBe(6);
  });
  it('cannot pay regular casting costs with reserve', () => {
    const s = setup();
    s.players[0].mana = 0;
    s.players[0].reserve = 3;
    expect(() => cast(s)).toThrow();
  });
});
describe('Turns and combat', () => {
  it('caps reserve at 3 and preserves existing reserve', () => {
    let s = setup();
    s.players[0].reserve = 2;
    s = applyAction(s, { type: 'end', p: 0 });
    expect(s.players[0].reserve).toBe(3);
    expect(s.players[0].mana).toBe(0);
    expect(s.active).toBe(1);
    expect(s.players[1].maxMana).toBe(10);
  });
  it('applies fatigue and skips dead players', () => {
    let s = setup();
    s.players[1].health = 0;
    s.players[2].deck = [];
    s.players[2].fatigue = 2;
    s = applyAction(s, { type: 'end', p: 0 });
    expect(s.active).toBe(2);
    expect(s.players[2].health).toBe(37);
  });
  it('blocks unsupported effects and seven-slot overflow', () => {
    const s = setup();
    s.players[0].hand = [card('EX1_287')];
    expect(supported(card('EX1_287'))).toBe(false);
    expect(() => applyAction(s, { type: 'cast', p: 0, index: 0, target: { p: 1 } })).toThrow(
      /not implemented/,
    );
    let n = s;
    for (let i = 0; i < 7; i++) n = debugAction(n, { type: 'summon', p: 0, card: card('CS2_182') });
    expect(() => cast(n)).toThrow(/Seven/);
  });
  it('enforces summoning sickness and separate opponent Taunts', () => {
    let s = setup();
    s = debugAction(s, { type: 'summon', p: 0, card: card('CS2_182') });
    s = debugAction(s, { type: 'summon', p: 1, card: card('CS2_179') });
    const uid = s.players[0].board[0].uid;
    expect(() => applyAction(s, { type: 'attack', p: 0, uid, target: { p: 2 } })).toThrow(
      /Summoning sickness/,
    );
    s.players[0].board[0].ready = true;
    expect(() => applyAction(s, { type: 'attack', p: 0, uid, target: { p: 1 } })).toThrow(/Taunt/);
    const n = applyAction(s, { type: 'attack', p: 0, uid, target: { p: 2 } });
    expect(n.players[2].health).toBe(36);
  });
  it('finishes with the last surviving player', () => {
    let s = setup();
    s.players[1].health = 0;
    s.players[2].health = 0;
    s = debugAction(s, { type: 'edit', p: 3, field: 'health', value: 0 });
    expect(s.winner).toBe(0);
    expect(() => applyAction(s, { type: 'end', p: 0 })).toThrow(/over/);
  });
  it('replays the same actions without mutation or ambient randomness', () => {
    const initial = setup();
    const actions: Action[] = [
      { type: 'cast', p: 0, command: true },
      { type: 'end', p: 0 },
    ];
    const a = replay({ version: 1, initial, actions });
    const b = actions.reduce(applyAction, initial);
    expect(a).toEqual(b);
    expect(initial.players[0].casts).toBe(0);
    expect(createGame(cards, 42)).toEqual(createGame(cards, 42));
  });
});
describe('Collection and deck data', () => {
  it('has a complete source snapshot and keeps original IDs', () => {
    expect(cards.length).toBeGreaterThan(6000);
    expect(new Set(cards.map((c) => c.id)).size).toBe(cards.length);
    expect(card('CS2_029').dbfId).toBe(315);
    expect(cards.every((c) => c.wildLegal !== true)).toBe(true);
  });
  it('recognizes vanilla minions without adding fabricated effects', () => {
    expect(supported(card('CS2_182'))).toBe(true);
    let s = setup();
    s.players[0].hand = [card('CS2_182')];
    s = applyAction(s, { type: 'cast', p: 0, index: 0 });
    expect(s.players[0].board[0].attack).toBe(4);
    expect(s.players[0].board[0].health).toBe(5);
  });
  it('detects duplicate versions by card name and class mismatches', () => {
    const d = {
      version: 1 as const,
      name: 'Test',
      class: 'MAGE',
      commander: 'EX1_543',
      cards: ['CS2_182', 'CS2_182'],
    };
    expect(validateDeck(d, cards).some((e) => e.includes('Singleton'))).toBe(true);
    expect(validateDeck(d, cards)).toContain('Commander does not match chosen class');
    expect(() => parseDeck(d, cards)).toThrow(/duplicate/);
  });
  it('does not label an unverified collection as Wild legal', () => {
    const d = {
      version: 1 as const,
      name: 'Test',
      class: 'HUNTER',
      commander: 'EX1_543',
      cards: [],
    };
    expect(validateDeck(d, cards)).toContain('Wild legality awaits Blizzard verification');
  });
});
