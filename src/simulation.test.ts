import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, applyAction, botAction } from './engine';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8'));
it('starter decks have 100 singleton cards excluding their commander and a full simulation reaches victory', () => {
  let s = createGame(cards);
  for (const p of s.players) {
    const deck = [...p.deck, ...p.hand];
    expect(deck).toHaveLength(100);
    expect(new Set(deck.map((c) => c.name)).size).toBe(100);
    expect(deck.some((c) => c.name === p.commander.name)).toBe(false);
  }
  let steps = 0;
  while (s.winner === null && steps < 4000) {
    const a = botAction(s)!;
    s = applyAction(s, a);
    steps++;
  }
  expect(s.winner).not.toBeNull();
  expect(steps).toBeLessThan(4000);
});
