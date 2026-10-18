import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import type { Card } from './cards';
import { premades, buildPremade, createPremadeGame } from './premades';
import { supported } from './effects';
import { applyAction, botAction, replay } from './engine';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];

describe('themed premade test decks', () => {
  it.each(premades.map((p) => [p.id, p] as const))(
    '%s is a supported singleton 100 with its prerequisites and a playable curve',
    (id, p) => {
      const deck = buildPremade(cards, id);
      expect(deck.cards).toHaveLength(100);
      expect(new Set(deck.cards.map((c) => c.name)).size).toBe(100);
      expect(deck.cards.some((c) => c.name === deck.commander.name)).toBe(false);
      expect(deck.cards.every(supported)).toBe(true);
      for (const name of p.opening)
        expect(
          deck.cards.some((c) => c.name === name),
          name,
        ).toBe(true);
      expect(deck.cards.filter((c) => c.cost <= 4).length).toBeGreaterThanOrEqual(50);
      expect(p.objectives).toHaveLength(3);
    },
  );
  it('uses distinct theme lists rather than renaming the starter deck', () => {
    const lists = premades.map((p) => new Set(buildPremade(cards, p.id).cards.map((c) => c.name)));
    for (let i = 0; i < lists.length; i++)
      for (let j = i + 1; j < lists.length; j++)
        expect([...lists[i]].filter((n) => !lists[j].has(n)).length).toBeGreaterThan(15);
  });
  it.each(premades.map((p) => [p.id, p] as const))(
    '%s offers a deterministic guided opening for all four distinct seats',
    (id, p) => {
      const s = createPremadeGame(cards, id, true);
      expect(s.players[0].hand.map((c) => c.name)).toEqual(p.opening);
      expect(s.testPreset?.name).toBe(p.name);
      expect(s.players.every((p) => p.deck.length + p.hand.length === 100)).toBe(true);
      expect(
        s.players
          .map((p) => p.class)
          .every((c) => ['HUNTER', 'MAGE', 'WARLOCK', 'WARRIOR', 'PRIEST'].includes(c)),
      ).toBe(true);
      expect(createPremadeGame(cards, id, true)).toEqual(s);
      expect(createPremadeGame(cards, id, false).players[0].hand.map((c) => c.name)).not.toEqual(
        p.opening,
      );
    },
  );
  it.each(premades.map((p) => [p.id] as const))(
    '%s completes a full match with legal bot actions and replays identically',
    (id) => {
      const initial = createPremadeGame(cards, id, true, 73);
      let s = initial;
      const actions = [];
      for (let i = 0; s.winner === null && i < 5000; i++) {
        const action = botAction(s);
        expect(action).toBeDefined();
        actions.push(action!);
        s = applyAction(s, action!);
      }
      expect(s.winner).not.toBeNull();
      expect(replay({ version: 1, initial, actions })).toEqual(s);
    },
  );
});
