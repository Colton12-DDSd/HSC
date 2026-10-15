import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  createGame,
  debugAction,
  applyAction,
  replay,
  healingBonus,
  type Game,
  type Target,
} from './engine';
import type { Card } from './cards';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
const card = (id: string) => {
  const c = cards.find((c) => c.id === id);
  if (!c) throw Error(id);
  return c;
};
function setup() {
  const s = createGame(cards);
  for (const p of s.players) {
    p.hand = [];
    p.deck = Array(20).fill(card('CS2_182'));
    p.reserve = 0;
    p.mana = 10;
  }
  return s;
}
function play(s: Game, id: string, target?: Target) {
  const next = structuredClone(s);
  const p = next.players[0];
  p.mana = 10;
  p.hand.push(card(id));
  let n = applyAction(next, { type: 'cast', p: 0, index: p.hand.length - 1, target });
  while (n.pending) n = applyAction(n, { type: 'pass', p: n.pending.queue[0] });
  return n;
}
function summon(s: Game, p: number, c: Card) {
  return debugAction(s, { type: 'summon', p, card: c });
}
describe('Persistent healing bonus', () => {
  it('records its source, stacks, and survives turns and source death', () => {
    let s = play(setup(), 'CATA_216');
    const first = s.players[0].board[0].uid;
    s = play(s, 'CATA_216');
    expect(healingBonus(s.players[0])).toBe(4);
    expect(s.players[0].effects?.map((e) => e.sourceName)).toEqual([
      'Cleansing Cleric',
      'Cleansing Cleric',
    ]);
    s = play(s, 'CS2_029', { p: 0, uid: first });
    expect(healingBonus(s.players[0])).toBe(4);
    for (let i = 0; i < 4; i++) s = applyAction(s, { type: 'end', p: s.active });
    s = play(s, 'EX1_011', { p: 0 });
    expect(s.players[0].health).toBe(46);
  });
  it('boosts healing according to its controller, not the recipient', () => {
    let s = play(setup(), 'CATA_216');
    s = play(s, 'CS2_117', { p: 1 });
    expect(s.players[1].health).toBe(45);
    expect(healingBonus(s.players[1])).toBe(0);
  });
  it('boosts each friendly healing recipient independently and keeps minion caps', () => {
    let s = play(setup(), 'CATA_216');
    s = summon(s, 0, card('CS2_182'));
    s.players[0].board[1].health = 1;
    s = play(s, 'DS1_055');
    expect(s.players[0].health).toBe(44);
    expect(s.players[0].board[1].health).toBe(5);
    expect(s.players[1].health).toBe(40);
  });
  it('boosts Priest power once while preserving its mana cost and once-per-turn limit', () => {
    let s = play(setup(), 'CATA_216');
    s.players[0].class = 'PRIEST';
    s.players[0].mana = 2;
    s = applyAction(s, { type: 'power', p: 0, target: { p: 0 } });
    expect(s.players[0].health).toBe(44);
    expect(s.players[0].mana).toBe(0);
    expect(() => applyAction(s, { type: 'power', p: 0, target: { p: 0 } })).toThrow(/unavailable/);
  });
  it('boosts attacking and defending Lifesteal, but not shield-absorbed zero damage', () => {
    const leech = cards.find((c) => c.name === 'Swamp Leech')!;
    let s = play(setup(), 'CATA_216');
    s = summon(s, 0, leech);
    s.players[0].board[1].ready = true;
    s = applyAction(s, { type: 'attack', p: 0, uid: s.players[0].board[1].uid, target: { p: 1 } });
    expect(s.players[0].health).toBe(40 + leech.attack! + 2);
    let shield = play(setup(), 'CATA_216');
    shield = summon(shield, 0, leech);
    shield = summon(shield, 1, card('EX1_008'));
    shield.players[0].board[1].ready = true;
    shield = applyAction(shield, {
      type: 'attack',
      p: 0,
      uid: shield.players[0].board[1].uid,
      target: { p: 1, uid: shield.players[1].board[0].uid },
    });
    expect(shield.players[0].health).toBe(40);
    let defending = summon(setup(), 0, card('CS2_182'));
    defending = summon(defending, 1, leech);
    defending.players[1].effects = structuredClone(s.players[0].effects);
    defending.players[0].board[0].ready = true;
    defending = applyAction(defending, {
      type: 'attack',
      p: 0,
      uid: defending.players[0].board[0].uid,
      target: { p: 1, uid: defending.players[1].board[0].uid },
    });
    expect(defending.players[1].health).toBe(40 + leech.attack! + 2);
  });
  it('does not grant a bonus on direct summon or interrupted play', () => {
    const s = summon(setup(), 0, card('CATA_216'));
    expect(healingBonus(s.players[0])).toBe(0);
    s.players[0].hand = [card('CATA_216')];
    s.players[1].reserve = 3;
    let n = applyAction(s, { type: 'cast', p: 0, index: 0 });
    n = applyAction(n, { type: 'interrupt', p: 1 });
    expect(healingBonus(n.players[0])).toBe(0);
    expect(n.players[0].board).toHaveLength(1);
  });
  it('serializes and replays the game-wide effect and accepts old player snapshots', () => {
    const initial = setup();
    delete initial.players[0].effects;
    expect(healingBonus(initial.players[0])).toBe(0);
    initial.players[0].hand = [card('CATA_216')];
    const action = { type: 'cast' as const, p: 0, index: 0 };
    const n = applyAction(initial, action);
    expect(replay(JSON.parse(JSON.stringify({ version: 1, initial, actions: [action] })))).toEqual(
      n,
    );
    expect(healingBonus(n.players[0])).toBe(2);
  });
});
