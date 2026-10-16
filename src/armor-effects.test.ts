import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { applyAction, createGame, debugAction, replay, type Game, type Target } from './engine';
import { supported, targetFor, effectFor } from './effects';
import type { Card } from './cards';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
const card = (id: string) => cards.find((c) => c.id === id)!;
// Independent per-printing expectations from the imported printed card text.
const cases = [
  ['BAR_745', 3, 0, 0],
  ['CORE_EX1_319', 3, 0, 0],
  ['EX1_319', 3, 0, 0],
  ['CORE_LOOT_013', 2, 0, 0],
  ['EX1_313', 5, 0, 0],
  ['TRL_546', 5, 0, 0],
  ['RLK_921', 2, 0, 0],
  ['TTN_832', 4, 0, 0],
  ['BOT_447', 5, 5, 0],
  ['GVG_053', 0, 5, 0],
  ['YOP_032', 0, 4, 0],
  ['RLK_657', 0, 6, 0],
  ['CORE_RLK_657', 0, 6, 0],
  ['BE_572', 0, 3, 0],
  ['DEEP_030', 2, 0, 1],
  ['TID_716', 0, 8, 0],
] as const;
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
  next.players[0].mana = 10;
  next.players[0].hand.push(card(id));
  return applyAction(next, { type: 'cast', p: 0, index: next.players[0].hand.length - 1, target });
}
describe('Armor, self-damage, and ordered Battlecry effects', () => {
  it.each(cases)('%s completes its full printed Battlecry', (id, damage, armor, draw) => {
    expect(card(id)).toBeDefined();
    expect(supported(card(id))).toBe(true);
    const s = play(setup(), id, id === 'TID_716' ? { p: 1 } : undefined);
    expect(s.players.map((p) => p.health)).toEqual([
      40 - damage,
      id === 'TID_716' ? 35 : 40,
      40,
      40,
    ]);
    expect(s.players.map((p) => p.armor)).toEqual(
      id === 'YOP_032' ? [4, 4, 4, 4] : [armor, 0, 0, 0],
    );
    expect(s.players[0].hand).toHaveLength(draw);
    expect(s.players[0].deck).toHaveLength(20 - draw);
    expect(s.players[0].board[0].card.id).toBe(id);
    expect(s.log.filter((l) => l.includes(`${card(id).name} triggers Battlecry`))).toHaveLength(1);
    expect(s.log.some((l) => l.includes('triggers Deathrattle'))).toBe(false);
    if (id === 'RLK_921') expect(s.players[0].board[0].shield).toBe(true);
    if (id === 'TTN_832' || id.includes('RLK_657'))
      expect(s.players[0].board[0].rushOnly).toBe(true);
  });
  it.each(cases)('%s does not trigger on direct summon', (id) => {
    const s = debugAction(setup(), { type: 'summon', p: 0, card: card(id) });
    expect(s.players.map((p) => [p.health, p.armor])).toEqual(Array(4).fill([40, 0]));
    expect(s.players[0].hand).toHaveLength(0);
    expect(s.log.some((l) => l.includes('triggers Battlecry'))).toBe(false);
  });
  it.each(['RLK_657', 'CORE_RLK_657', 'BE_572', 'DEEP_030'])(
    '%s triggers Deathrattle once for its owner',
    (id) => {
      let s = debugAction(setup(), { type: 'summon', p: 1, card: card(id) });
      s = play(s, 'CS2_029', { p: 1, uid: s.players[1].board[0].uid });
      expect(s.players[1].board).toHaveLength(0);
      expect(s.players[1].grave.filter((c) => c.id === id)).toHaveLength(1);
      expect(s.players[1].armor).toBe(id === 'DEEP_030' ? 0 : id === 'BE_572' ? 3 : 6);
      expect(s.players[1].health).toBe(id === 'DEEP_030' ? 38 : 40);
      expect(s.players[1].hand).toHaveLength(id === 'DEEP_030' ? 1 : 0);
      expect(s.players[0].armor).toBe(0);
      expect(s.log.filter((l) => l.includes(`${card(id).name} triggers Deathrattle`))).toHaveLength(
        1,
      );
    },
  );
  it('Crystallizer consumes existing Armor before adding its new Armor', () => {
    const initial = setup();
    initial.players[0].armor = 3;
    const s = play(initial, 'BOT_447');
    expect(s.players[0]).toMatchObject({ health: 38, armor: 5 });
    const damage = s.log.findIndex((l) => l.includes('self-damage'));
    const gain = s.log.findIndex((l) => l.includes('gains 5 Armor'));
    expect(damage).toBeLessThan(gain);
    expect(initial.players[0]).toMatchObject({ health: 40, armor: 3 });
  });
  it.each(['RLK_657', 'CORE_RLK_657', 'BE_572', 'DEEP_030'])(
    '%s resolves both triggers on the same played minion',
    (id) => {
      let s = play(setup(), id);
      const uid = s.players[0].board[0].uid;
      s = play(s, 'CS2_029', { p: 0, uid });
      expect(s.players[0].armor).toBe(id === 'DEEP_030' ? 0 : id === 'BE_572' ? 6 : 12);
      expect(s.players[0].health).toBe(id === 'DEEP_030' ? 36 : 40);
      expect(s.players[0].hand).toHaveLength(id === 'DEEP_030' ? 2 : 0);
      expect(s.log.filter((l) => l.includes(`${card(id).name} triggers Battlecry`))).toHaveLength(
        1,
      );
      expect(s.log.filter((l) => l.includes(`${card(id).name} triggers Deathrattle`))).toHaveLength(
        1,
      );
    },
  );
  it('armor stacks, absorbs damage, and does not increase healing', () => {
    let s = play(play(setup(), 'GVG_053'), 'GVG_053');
    s = play(s, 'EX1_319');
    expect(s.players[0]).toMatchObject({ health: 40, armor: 7 });
    s = play(s, 'EX1_011', { p: 0 });
    expect(s.players[0]).toMatchObject({ health: 42, armor: 7 });
    s = play(s, 'CS2_029', { p: 0 });
    expect(s.players[0]).toMatchObject({ health: 42, armor: 1 });
  });
  it('Armor Vendor affects living heroes only', () => {
    const initial = setup();
    initial.players[2].health = 0;
    initial.players[2].armor = 7;
    const s = play(initial, 'YOP_032');
    expect(s.players.map((p) => p.armor)).toEqual([4, 4, 7, 4]);
    expect(s.players[2].health).toBe(0);
  });
  it('Elementium Geode draws before self-damage, including fatigue and armor', () => {
    const initial = setup();
    initial.players[0].deck = [];
    initial.players[0].armor = 1;
    const s = play(initial, 'DEEP_030');
    expect(s.players[0]).toMatchObject({ health: 38, armor: 0, fatigue: 1 });
    expect(s.log.findIndex((l) => l.includes('fatigue'))).toBeLessThan(
      s.log.findIndex((l) => l.includes('self-damage')),
    );
  });
  it('Geode burns a draw at the hand limit and still applies self-damage on death', () => {
    let s = debugAction(setup(), { type: 'summon', p: 1, card: card('DEEP_030') });
    s.players[1].hand = Array(10).fill(card('CS2_182'));
    s = play(s, 'CS2_029', { p: 1, uid: s.players[1].board[0].uid });
    expect(s.players[1].hand).toHaveLength(10);
    expect(s.players[1].grave.map((c) => c.id)).toContain('CS2_182');
    expect(s.players[1].health).toBe(38);
  });
  it('lethal self-damage eliminates the caster and advances the turn', () => {
    const initial = setup();
    initial.players[0].health = 3;
    const s = play(initial, 'BOT_447');
    expect(s.players[0].health).toBe(-2);
    expect(s.players[0].armor).toBe(0);
    expect(s.players[0].board).toHaveLength(0);
    expect(s.active).toBe(1);
  });
  it('lethal Geode fatigue skips further self-damage without invalid-target errors', () => {
    const initial = setup();
    initial.players[0].health = 1;
    initial.players[0].deck = [];
    const s = play(initial, 'DEEP_030');
    expect(s.players[0].health).toBe(0);
    expect(s.active).toBe(1);
  });
  it('Tidal Revenant requires an explicit target and gains Armor through Divine Shield', () => {
    let initial = debugAction(setup(), { type: 'summon', p: 1, card: card('EX1_008') });
    expect(targetFor(effectFor(card('TID_716')))).toBe('character');
    expect(() => play(initial, 'TID_716')).toThrow(/Choose/);
    const uid = initial.players[1].board[0].uid;
    const s = play(initial, 'TID_716', { p: 1, uid });
    expect(s.players[1].board[0]).toMatchObject({ health: card('EX1_008').health, shield: false });
    expect(s.players[0].armor).toBe(8);
    expect(s.players[0].mana).toBe(2);
  });
  it('interrupting an ordered Battlecry prevents every part and preserves replay', () => {
    const initial = setup();
    initial.players[0].hand = [card('TID_716')];
    initial.players[1].reserve = 3;
    const cast = { type: 'cast' as const, p: 0, index: 0, target: { p: 2 } };
    const pending = applyAction(initial, cast);
    expect(pending.players.map((p) => [p.health, p.armor])).toEqual(Array(4).fill([40, 0]));
    const stop = { type: 'interrupt' as const, p: 1 };
    const s = applyAction(pending, stop);
    expect(s.players[0].board).toHaveLength(0);
    expect(s.players[0].hand[0].id).toBe('TID_716');
    expect(s.players[0].armor).toBe(0);
    expect(s.players[2].health).toBe(40);
    expect(
      replay(JSON.parse(JSON.stringify({ version: 1, initial, actions: [cast, stop] }))),
    ).toEqual(s);
    const passed = applyAction(pending, { type: 'pass', p: 1 });
    expect(passed.players[0].armor).toBe(8);
    expect(passed.players[2].health).toBe(35);
  });
  it('keeps incomplete multi-part armor cards blocked', () => {
    for (const id of ['BE_557', 'DRG_020', 'RLK_659', 'YOG_500'])
      expect(supported(card(id)), id).toBe(false);
  });
});
