import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame } from '../engine';
import { AuthoritativeMatch } from './match';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8'));
describe('Authoritative match boundary', () => {
  it('rejects spoofed seats and stale revisions, and hides other hands and all decks', () => {
    const match = new AuthoritativeMatch(
      createGame(cards),
      new Map([
        ['alice', 0],
        ['bob', 1],
      ]),
    );
    expect(() => match.submit('bob', { revision: 0, action: { type: 'end', p: 0 } })).toThrow(
      /Seat/,
    );
    const v = match.submit('alice', { revision: 0, action: { type: 'end', p: 0 } });
    expect(v.revision).toBe(1);
    expect(v.state.players[0].hand).toBeDefined();
    expect(v.state.players[1].hand).toBeUndefined();
    expect(v.state.players[0].deck).toBeUndefined();
    expect(() => match.submit('bob', { revision: 0, action: { type: 'end', p: 1 } })).toThrow(
      /Stale/,
    );
  });
});
