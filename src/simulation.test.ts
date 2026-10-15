import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, applyAction, botAction } from './engine';
import { battlecryFor, deathrattleFor, supported } from './effects';
import type { Card } from './cards';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
it('starter decks have 100 singleton cards excluding their commander and a full simulation reaches victory', () => {
  let s = createGame(cards);
  for (const p of s.players) {
    const deck = [...p.deck, ...p.hand];
    expect(deck).toHaveLength(100);
    expect(new Set(deck.map((c) => c.name)).size).toBe(100);
    expect(deck.some((c) => c.name === p.commander.name)).toBe(false);
    expect(deck.every(supported)).toBe(true);
    expect(deck.filter((c) => battlecryFor(c)).length).toBeGreaterThanOrEqual(8);
    expect(deck.filter((c) => deathrattleFor(c)).length).toBeGreaterThanOrEqual(8);
    for (const name of [
      'Novice Engineer',
      'Shattered Sun Cleric',
      'Haunted Creeper',
      'Loot Hoarder',
      'Harvest Golem',
      'Sludge Belcher',
    ])
      expect(deck.some((c) => c.name === name)).toBe(true);
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
it('keeps a user-supplied deck intact instead of inserting starter test cards', () => {
  const custom = cards.filter((c) => ['CS2_182', 'CS2_172'].includes(c.id));
  const s = createGame(cards, 42, custom);
  expect([...s.players[0].hand, ...s.players[0].deck].map((c) => c.id).sort()).toEqual(
    custom.map((c) => c.id).sort(),
  );
});
