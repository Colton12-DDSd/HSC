import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { applyAction, createGame, debugAction, replay, type Action, type Game } from './engine';
import type { Card } from './cards';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
const yeti = cards.find((c) => c.id === 'CS2_182')!;
function setup() {
  let s = createGame(cards);
  s = debugAction(s, { type: 'summon', p: 0, card: yeti });
  s = debugAction(s, { type: 'summon', p: 0, card: yeti });
  s.players[0].hand = [yeti];
  s.players[0].mana = 10;
  return s;
}
describe('Minion placement', () => {
  it.each([0, 1, 2])('inserts at position %i without rearranging existing minions', (position) => {
    const s = setup(),
      before = s.players[0].board.map((u) => u.uid);
    const n = applyAction(s, { type: 'cast', p: 0, index: 0, position });
    expect(n.players[0].board[position].uid).toBe(s.nextId);
    expect(n.players[0].board.filter((u) => u.uid !== s.nextId).map((u) => u.uid)).toEqual(before);
    expect(s.players[0].board).toHaveLength(2);
  });
  it('defaults older actions to placement at the end', () => {
    const s = setup();
    expect(applyAction(s, { type: 'cast', p: 0, index: 0 }).players[0].board[2].uid).toBe(s.nextId);
  });
  it.each([-1, 3, 0.5, NaN, Infinity])(
    'rejects invalid position %s before spending mana or consuming the card',
    (position) => {
      const s = setup();
      expect(() => applyAction(s, { type: 'cast', p: 0, index: 0, position })).toThrow(/placement/);
      expect(s.players[0].mana).toBe(10);
      expect(s.players[0].hand).toHaveLength(1);
    },
  );
  it('preserves selected position through clockwise passes', () => {
    let s = setup();
    s.players[1].reserve = 3;
    s.players[2].reserve = 3;
    const id = s.nextId;
    s = applyAction(s, { type: 'cast', p: 0, index: 0, position: 1 });
    expect(s.pending?.position).toBe(1);
    expect(s.players[0].board).toHaveLength(2);
    s = applyAction(s, { type: 'pass', p: 1 });
    s = applyAction(s, { type: 'pass', p: 2 });
    expect(s.players[0].board[1].uid).toBe(id);
  });
  it('does not insert or reorder anything when interrupted', () => {
    let s = setup();
    s.players[1].reserve = 3;
    const before = s.players[0].board;
    s = applyAction(s, { type: 'cast', p: 0, index: 0, position: 0 });
    s = applyAction(s, { type: 'interrupt', p: 1 });
    expect(s.players[0].board).toEqual(before);
    expect(s.players[0].hand[0].id).toBe(yeti.id);
  });
  it('positions command-zone casts and applies their successful-cast tax', () => {
    const s = setup(),
      n = applyAction(s, { type: 'cast', p: 0, command: true, position: 1 });
    expect(n.players[0].board[1].commander).toBe(true);
    expect(n.players[0].casts).toBe(1);
  });
  it('rejects positions on spells and still enforces seven slots', () => {
    const s = setup();
    s.players[0].hand = [cards.find((c) => c.id === 'CS2_029')!];
    expect(() =>
      applyAction(s, { type: 'cast', p: 0, index: 0, position: 0, target: { p: 1 } }),
    ).toThrow(/placement/);
    while (s.players[0].board.length < 7) {
      const n = debugAction(s, { type: 'summon', p: 0, card: yeti });
      Object.assign(s, n);
    }
    s.players[0].hand = [yeti];
    expect(() => applyAction(s, { type: 'cast', p: 0, index: 0, position: 3 })).toThrow(/Seven/);
  });
  it('replays position choices deterministically', () => {
    const initial = setup(),
      actions: Action[] = [{ type: 'cast', p: 0, index: 0, position: 1 }];
    expect(replay({ version: 1, initial, actions })).toEqual(applyAction(initial, actions[0]));
  });
});
