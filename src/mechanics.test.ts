import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, debugAction, applyAction, supported } from './engine';
import type { Card } from './cards';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
it('Windfury allows exactly two attacks per turn', () => {
  let s = createGame(cards);
  const c = cards.find((c) => supported(c) && c.mechanics?.includes('WINDFURY'))!;
  expect(c).toBeDefined();
  s = debugAction(s, { type: 'summon', p: 0, card: c });
  const u = s.players[0].board[0];
  u.ready = true;
  s = applyAction(s, { type: 'attack', p: 0, uid: u.uid, target: { p: 1 } });
  expect(s.players[0].board[0].ready).toBe(true);
  s = applyAction(s, { type: 'attack', p: 0, uid: u.uid, target: { p: 1 } });
  expect(() => applyAction(s, { type: 'attack', p: 0, uid: u.uid, target: { p: 1 } })).toThrow(
    /exhausted/,
  );
});
it('Poisonous does not kill through Divine Shield', () => {
  let s = createGame(cards);
  const poison = cards.find((c) => supported(c) && c.mechanics?.includes('POISONOUS'))!,
    shield = cards.find((c) => c.id === 'EX1_032')!;
  s = debugAction(s, { type: 'summon', p: 0, card: poison });
  s = debugAction(s, { type: 'summon', p: 1, card: shield });
  s.players[0].board[0].ready = true;
  const hp = s.players[1].board[0].health;
  s = applyAction(s, {
    type: 'attack',
    p: 0,
    uid: s.players[0].board[0].uid,
    target: { p: 1, uid: s.players[1].board[0].uid },
  });
  expect(s.players[1].board[0].health).toBe(hp);
  expect(s.players[1].board[0].shield).toBe(false);
});
