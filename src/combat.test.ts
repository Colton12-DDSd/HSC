import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  createGame,
  debugAction,
  applyAction,
  attackError,
  attackReadinessError,
  type Game,
} from './engine';
import type { Card } from './cards';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
const card = (id: string) => cards.find((c) => c.id === id)!;
function summon(s: Game, p: number, id: string) {
  return debugAction(s, { type: 'summon', p, card: card(id) });
}
function setup() {
  let s = summon(createGame(cards), 0, 'CS2_182');
  s.players[0].board[0].ready = true;
  s.players[0].mana = 10;
  return s;
}
describe('Chosen attack targets and persistent damage', () => {
  it('damages exactly the chosen enemy minion and tracks simultaneous retaliation', () => {
    let s = setup();
    s = summon(s, 1, 'CS2_182');
    s = summon(s, 1, 'CS2_182');
    const uid = s.players[0].board[0].uid,
      target = s.players[1].board[1].uid;
    const n = applyAction(s, { type: 'attack', p: 0, uid, target: { p: 1, uid: target } });
    expect(n.players[1].board.map((u) => u.health)).toEqual([5, 1]);
    expect(n.players[0].board[0].health).toBe(1);
    expect(n.players[0].board[0].maxHealth).toBe(5);
    expect(n.players[1].health).toBe(40);
    expect(s.players[1].board[1].health).toBe(5);
    expect(n.log.at(-1)).toContain("Ember's Chillwind Yeti");
  });
  it('allows attacking a hero even if that opponent has non-Taunt minions', () => {
    let s = setup();
    s = summon(s, 1, 'CS2_182');
    const n = applyAction(s, {
      type: 'attack',
      p: 0,
      uid: s.players[0].board[0].uid,
      target: { p: 1 },
    });
    expect(n.players[1].health).toBe(36);
    expect(n.players[1].board[0].health).toBe(5);
    expect(n.players[0].board[0].health).toBe(5);
  });
  it('Taunt protects its own hero and non-Taunt minions, but not other opponents', () => {
    let s = setup();
    s = summon(s, 1, 'CS2_179');
    s = summon(s, 1, 'CS2_182');
    const uid = s.players[0].board[0].uid;
    expect(attackError(s, 0, uid, { p: 1 })).toMatch(/Taunt/);
    expect(attackError(s, 0, uid, { p: 1, uid: s.players[1].board[1].uid })).toMatch(/Taunt/);
    expect(attackError(s, 0, uid, { p: 1, uid: s.players[1].board[0].uid })).toBeNull();
    expect(attackError(s, 0, uid, { p: 2 })).toBeNull();
    expect(() => applyAction(s, { type: 'attack', p: 0, uid, target: { p: 1 } })).toThrow(/Taunt/);
    expect(applyAction(s, { type: 'attack', p: 0, uid, target: { p: 2 } }).players[2].health).toBe(
      36,
    );
  });
  it('retains minion damage across an entire round', () => {
    let s = setup();
    s = summon(s, 1, 'CS2_182');
    s = applyAction(s, {
      type: 'attack',
      p: 0,
      uid: s.players[0].board[0].uid,
      target: { p: 1, uid: s.players[1].board[0].uid },
    });
    for (let i = 0; i < 4; i++) s = applyAction(s, { type: 'end', p: s.active });
    expect(s.active).toBe(0);
    expect(s.players[0].board[0].health).toBe(1);
    expect(s.players[1].board[0].health).toBe(1);
    expect(s.players[0].board[0].ready).toBe(true);
  });
  it('tracks repeated spell/battlecry damage and healing against maximum health', () => {
    let s = setup();
    s = summon(s, 1, 'CS2_182');
    const target = { p: 1, uid: s.players[1].board[0].uid };
    s.players[0].hand = [card('CS2_189'), card('CS2_189'), card('CS2_117')];
    s = applyAction(s, { type: 'cast', p: 0, index: 0, target });
    s = applyAction(s, { type: 'cast', p: 0, index: 0, target });
    expect(s.players[1].board[0].health).toBe(3);
    expect(s.players[1].board[0].maxHealth - s.players[1].board[0].health).toBe(2);
    s = applyAction(s, { type: 'cast', p: 0, index: 0, target });
    expect(s.players[1].board[0].health).toBe(5);
  });
  it('does not count Divine Shield absorption as health damage', () => {
    let s = setup();
    s = summon(s, 1, 'EX1_032');
    s = applyAction(s, {
      type: 'attack',
      p: 0,
      uid: s.players[0].board[0].uid,
      target: { p: 1, uid: s.players[1].board[0].uid },
    });
    expect(s.players[1].board[0].health).toBe(s.players[1].board[0].maxHealth);
    expect(s.players[1].board[0].shield).toBe(false);
  });
  it('rejects friendly, exhausted, missing and Rush-only hero targets', () => {
    const s = setup(),
      uid = s.players[0].board[0].uid;
    expect(attackError(s, 0, uid, { p: 0 })).toMatch(/friendly/);
    expect(attackError(s, 0, uid, { p: 1, uid: 999999 })).toMatch(/available/);
    s.players[0].board[0].rushOnly = true;
    expect(attackError(s, 0, uid, { p: 1 })).toMatch(/Rush/);
    s.players[0].board[0].ready = false;
    expect(attackError(s, 0, uid, { p: 1 })).toMatch(/Summoning sickness/);
  });
});

describe('Attack readiness indicators', () => {
  it('distinguishes sickness, ready, spent, another turn, and zero attack', () => {
    let s = summon(createGame(cards), 0, 'CS2_182');
    const uid = s.players[0].board[0].uid;
    expect(attackReadinessError(s, 0, uid)).toBe('Summoning sickness');
    s.players[0].board[0].ready = true;
    expect(attackReadinessError(s, 0, uid)).toBeNull();
    s = applyAction(s, { type: 'attack', p: 0, uid, target: { p: 1 } });
    expect(attackReadinessError(s, 0, uid)).toBe('No attacks left this turn');
    for (let i = 0; i < 4; i++) s = applyAction(s, { type: 'end', p: s.active });
    expect(attackReadinessError(s, 0, uid)).toBeNull();
    s.players[0].board[0].attack = 0;
    expect(attackReadinessError(s, 0, uid)).toBe('This character has no attack');
    s = applyAction(s, { type: 'end', p: 0 });
    expect(attackReadinessError(s, 0, uid)).toBe('Not your turn');
  });
});
