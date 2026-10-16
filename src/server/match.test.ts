import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame } from '../engine';
import { AuthoritativeMatch } from './match';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8'));
describe('Authoritative match boundary', () => {
  it('keeps Discover options private and accepts only the choosing seat at the current revision', () => {
    const initial = createGame(cards);
    initial.players[0].mana = 10;
    initial.players[0].hand = [cards.find((c: { id: string }) => c.id === 'LOE_003')!];
    const match = new AuthoritativeMatch(
      initial,
      new Map([
        ['alice', 0],
        ['bob', 1],
      ]),
    );
    const own = match.submit('alice', { revision: 0, action: { type: 'cast', p: 0, index: 0 } });
    expect(own.state.choice?.options.length).toBe(3);
    expect(match.view('bob').state.choice).toBeUndefined();
    expect(() =>
      match.submit('bob', { revision: 1, action: { type: 'choose', p: 0, index: 0 } }),
    ).toThrow(/Seat/);
    const chosen = own.state.choice!.options[0].id;
    const result = match.submit('alice', {
      revision: 1,
      action: { type: 'choose', p: 0, index: 0 },
    });
    expect(result.state.choice).toBeUndefined();
    expect(result.state.players[0].hand?.[0].id).toBe(chosen);
  });
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
