import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { Card } from './cards';
import { applyAction, createGame, debugAction } from './engine';
import { damageFeedback } from './combat-feedback';

const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
function attacker(attack: number, armor: number) {
  let s = createGame(cards);
  for (const p of s.players) {
    p.board = [];
    p.reserve = 0;
    p.health = 40;
    p.armor = 0;
  }
  s = debugAction(s, {
    type: 'summon',
    p: 0,
    card: cards.find((c) => c.name === 'Argent Braggart')!,
  });
  s.players[0].board[0].attack = attack;
  s.players[0].board[0].ready = true;
  s.players[1].armor = armor;
  return s;
}
describe('visible combat damage feedback', () => {
  it.each([4, 3])(
    'the supplied scenario’s 1-Attack hit reduces %i Armor before Health',
    (armor) => {
      const s = attacker(1, armor);
      const next = applyAction(s, {
        type: 'attack',
        p: 0,
        uid: s.players[0].board[0].uid,
        target: { p: 1 },
      });
      expect(next.players[1].health).toBe(40);
      expect(next.players[1].armor).toBe(armor - 1);
      expect(damageFeedback(s, next)).toEqual([
        { anchor: 'hero:1:armor', kind: 'armor', amount: 1 },
      ]);
      expect(next.log.at(-1)).toContain(`Armor ${armor} → ${armor - 1}; Health 40 → 40`);
    },
  );
  it('splits overflow between the Armor and Health counters', () => {
    const s = attacker(6, 2);
    const next = applyAction(s, {
      type: 'attack',
      p: 0,
      uid: s.players[0].board[0].uid,
      target: { p: 1 },
    });
    expect(next.players[1].health).toBe(36);
    expect(damageFeedback(s, next)).toEqual([
      { anchor: 'hero:1:armor', kind: 'armor', amount: 2 },
      { anchor: 'hero:1:health', kind: 'health', amount: 4 },
    ]);
  });
  it('shows Shield absorption rather than inventing Health damage', () => {
    const s = attacker(6, 2);
    s.players[1].shield = true;
    const next = applyAction(s, {
      type: 'attack',
      p: 0,
      uid: s.players[0].board[0].uid,
      target: { p: 1 },
    });
    expect(damageFeedback(s, next)).toEqual([
      { anchor: 'hero:1:health', kind: 'blocked', amount: 0 },
    ]);
    expect(next.players[1].armor).toBe(2);
  });
  it('reports damage to both combatants even when the defender dies', () => {
    let s = attacker(4, 0);
    s.players[0].board[0].health = s.players[0].board[0].maxHealth = 5;
    s = debugAction(s, {
      type: 'summon',
      p: 1,
      card: cards.find((c) => c.name === 'Bloodfen Raptor')!,
    });
    const own = s.players[0].board[0].uid,
      enemy = s.players[1].board[0].uid;
    const next = applyAction(s, { type: 'attack', p: 0, uid: own, target: { p: 1, uid: enemy } });
    expect(next.players[1].board).toHaveLength(0);
    expect(damageFeedback(s, next)).toEqual([
      { anchor: `unit:${enemy}:health`, kind: 'health', amount: 2 },
      { anchor: `unit:${own}:health`, kind: 'health', amount: 3 },
    ]);
  });
  it('does not present debug Health edits as combat damage', () => {
    const s = attacker(1, 0),
      next = debugAction(s, { type: 'edit', p: 1, field: 'health', value: 10 });
    expect(damageFeedback(s, next)).toEqual([]);
  });
});
