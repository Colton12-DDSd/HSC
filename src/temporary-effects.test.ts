import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  createGame,
  applyAction,
  debugAction,
  replay,
  effectTargets,
  attackError,
  botAction,
  type Game,
  type Target,
} from './engine';
import type { Card } from './cards';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
const card = (id: string) => cards.find((c) => c.id === id)!;
function setup() {
  const s = createGame(cards);
  for (const p of s.players) {
    p.hand = [];
    p.deck = Array(20).fill(card('CS2_182'));
    p.mana = 10;
    p.reserve = 0;
  }
  return s;
}
function summon(s: Game, p = 0) {
  return debugAction(s, { type: 'summon', p, card: card('CS2_182') });
}
function play(s: Game, id: string, target?: Target) {
  const n = structuredClone(s);
  n.players[0].mana = 10;
  n.players[0].hand.push(card(id));
  let next = applyAction(n, { type: 'cast', p: 0, index: n.players[0].hand.length - 1, target });
  while (next.pending) next = applyAction(next, { type: 'pass', p: next.pending.queue[0] });
  return next;
}
describe('Temporary Attack effects', () => {
  it.each([
    ['CS2_188', 2],
    ['CORE_CS2_188', 2],
    ['EX1_046', 2],
    ['GVG_011', -3],
    ['WON_314', -3],
  ] as const)('%s expires on the casting turn, even on an enemy minion', (id, amount) => {
    let s = summon(setup(), 1);
    const target = { p: 1, uid: s.players[1].board[0].uid };
    s = play(s, id, target);
    expect(s.players[1].board[0].attack).toBe(4 + amount);
    expect(s.players[1].board[0].modifiers?.[0].expiresAtTurn).toBe(s.turn);
    s = applyAction(s, { type: 'end', p: 0 });
    expect(s.active).toBe(1);
    expect(s.players[1].board[0].attack).toBe(4);
    expect(s.players[1].board[0].modifiers).toEqual([]);
    expect(s.log.some((l) => l.includes('expires at end of turn'))).toBe(true);
  });
  it('rejects heroes before mana is spent and allows friendly or enemy minions', () => {
    const s = summon(summon(setup(), 0), 1);
    s.players[0].hand = [card('CS2_188')];
    expect(effectTargets(s, 0, card('CS2_188'))).toHaveLength(2);
    expect(() => applyAction(s, { type: 'cast', p: 0, index: 0, target: { p: 1 } })).toThrow(
      /minion/,
    );
    expect(s.players[0].mana).toBe(10);
    expect(s.players[0].hand).toHaveLength(1);
  });
  it('does not trigger immediately for an interrupted play', () => {
    const s = summon(setup(), 1);
    s.players[0].hand = [card('CS2_188')];
    s.players[1].reserve = 3;
    let n = applyAction(s, {
      type: 'cast',
      p: 0,
      index: 0,
      target: { p: 1, uid: s.players[1].board[0].uid },
    });
    expect(n.players[1].board[0].attack).toBe(4);
    n = applyAction(n, { type: 'interrupt', p: 1 });
    expect(n.players[1].board[0].attack).toBe(4);
  });
  it('stacks reductions and bonuses without negative damage or incorrect recovery', () => {
    let s = summon(setup());
    const target = { p: 0, uid: s.players[0].board[0].uid };
    s = play(s, 'GVG_011', target);
    s = play(s, 'WON_314', target);
    expect(s.players[0].board[0].attack).toBe(0);
    expect(attackError(s, 0, target.uid, { p: 1 })).toMatch(/no attack/);
    s = play(s, 'CS2_188', target);
    expect(s.players[0].board[0].attack).toBe(0);
    s = play(s, 'EX1_046', target);
    expect(s.players[0].board[0].attack).toBe(2);
    s = applyAction(s, { type: 'end', p: 0 });
    expect(s.players[0].board[0].attack).toBe(4);
  });
  it('preserves permanent hand and battlefield buffs when temporary modifiers expire', () => {
    let s = setup();
    s.players[0].hand = [card('CS2_182')];
    s = play(s, 'AT_054');
    s.players[0].mana = 10;
    s = applyAction(s, { type: 'cast', p: 0, index: 0 });
    const target = { p: 0, uid: s.players[0].board[1].uid };
    s = play(s, 'EX1_019', target);
    s = play(s, 'CS2_188', target);
    s = play(s, 'GVG_011', target);
    expect(s.players[0].board.find((u) => u.uid === target.uid)?.attack).toBe(5);
    s = applyAction(s, { type: 'end', p: 0 });
    expect(s.players[0].board.find((u) => u.uid === target.uid)).toMatchObject({
      attack: 6,
      maxHealth: 7,
      health: 7,
    });
    expect(s.players[0].board.find((u) => u.uid === target.uid)?.modifiers).toHaveLength(2);
  });
  it('source death does not remove a temporary effect early and expiry does not erase damage', () => {
    let s = summon(setup());
    const target = { p: 0, uid: s.players[0].board[0].uid };
    s = play(s, 'CS2_188', target);
    const source = s.players[0].board[1].uid;
    s = play(s, 'CS2_029', { p: 0, uid: source });
    expect(s.players[0].board[0].attack).toBe(6);
    s = play(s, 'CS2_189', target);
    expect(s.players[0].board[0].health).toBe(4);
    s = applyAction(s, { type: 'end', p: 0 });
    expect(s.players[0].board[0]).toMatchObject({ attack: 4, health: 4, maxHealth: 5 });
  });
  it.each([
    ['BT_720', 4],
    ['GIL_803', 3],
  ] as const)(
    '%s gains its own temporary Attack while retaining Rush and its restrictions',
    (id, amount) => {
      let s = summon(setup(), 1);
      s = play(s, id);
      const unit = s.players[0].board[0];
      expect(unit.attack).toBe(card(id).attack! + amount);
      expect(unit.ready).toBe(true);
      expect(unit.rushOnly).toBe(true);
      expect(attackError(s, 0, unit.uid, { p: 1 })).toMatch(/Rush/);
      expect(attackError(s, 0, unit.uid, { p: 1, uid: s.players[1].board[0].uid })).toBeNull();
      s = applyAction(s, { type: 'end', p: 0 });
      expect(s.players[0].board[0].attack).toBe(card(id).attack);
      expect(s.players[0].board[0].card.mechanics).toEqual(card(id).mechanics);
    },
  );
  it('does not grant an extra attack when a temporary Attack bonus is applied', () => {
    let s = summon(setup());
    s.players[0].board[0].ready = true;
    const uid = s.players[0].board[0].uid;
    s = applyAction(s, { type: 'attack', p: 0, uid, target: { p: 1 } });
    s = play(s, 'CS2_188', { p: 0, uid });
    expect(s.players[0].board[0].ready).toBe(false);
    expect(s.players[0].board[0].attacksRemaining).toBe(0);
  });
  it('replays modifier durations and expiry identically', () => {
    const initial = summon(setup());
    initial.players[0].hand = [card('CS2_188')];
    const actions = [
      {
        type: 'cast' as const,
        p: 0,
        index: 0,
        target: { p: 0, uid: initial.players[0].board[0].uid },
      },
      { type: 'end' as const, p: 0 },
    ];
    const n = applyAction(applyAction(initial, actions[0]), actions[1]);
    expect(replay(JSON.parse(JSON.stringify({ version: 1, initial, actions })))).toEqual(n);
  });
  it('preserves untracked legacy Attack changes after expiration', () => {
    let s = summon(setup());
    s.players[0].board[0].attack = 6;
    delete s.players[0].board[0].attackBase;
    delete s.players[0].board[0].modifiers;
    s = play(s, 'CS2_188', { p: 0, uid: s.players[0].board[0].uid });
    expect(s.players[0].board[0].attack).toBe(8);
    s = applyAction(s, { type: 'end', p: 0 });
    expect(s.players[0].board[0].attack).toBe(6);
  });
  it('bots direct negative Attack changes at opponents instead of friendly minions', () => {
    const s = summon(summon(setup()), 1);
    s.players[0].hand = [card('GVG_011')];
    expect(botAction(s)).toMatchObject({
      type: 'cast',
      p: 0,
      target: { p: 1, uid: s.players[1].board[0].uid },
    });
  });
});
