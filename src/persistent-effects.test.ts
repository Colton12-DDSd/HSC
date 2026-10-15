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
import { cardStats, type Card } from './cards';
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

function castFromHand(s: Game, index: number) {
  const next = structuredClone(s);
  next.players[0].mana = 10;
  let n = applyAction(next, { type: 'cast', p: 0, index });
  while (n.pending) n = applyAction(n, { type: 'pass', p: n.pending.queue[0] });
  return n;
}
describe('Hand and deck buff batch', () => {
  it.each(['CFM_753', 'CORE_CFM_753'])(
    '%s buffs every current hand minion, not spells, board, deck, or opponents',
    (id) => {
      let s = summon(setup(), 0, card('CS2_182'));
      s.players[0].hand = [card('CS2_182'), card('FP1_007'), card('CS2_029')];
      s = play(s, id);
      expect(s.players[0].hand.map(cardStats)).toEqual([
        { attack: 5, health: 6 },
        { attack: 1, health: 3 },
        { attack: 0, health: 1 },
      ]);
      expect(s.players[0].hand[2].modifiers).toBeUndefined();
      expect(s.players[0].deck.every((c) => !c.modifiers?.length)).toBe(true);
      expect(s.players[0].board[0].attack).toBe(4);
      expect(s.players[1].deck.every((c) => !c.modifiers?.length)).toBe(true);
      expect(card('CS2_182').modifiers).toBeUndefined();
    },
  );
  it('Mistcaller buffs physical hand/deck copies exactly once, survives source death, and does not affect future cards', () => {
    let s = setup();
    s.players[0].hand = [card('CS2_182'), card('CS2_029')];
    s = play(s, 'AT_054');
    expect(cardStats(s.players[0].hand[0])).toEqual({ attack: 5, health: 6 });
    expect(s.players[0].deck.every((c) => c.modifiers?.length === 1)).toBe(true);
    expect(s.players[0].board[0]).toMatchObject({ attack: 4, health: 4, modifiers: [] });
    s = play(s, 'CS2_029', { p: 0, uid: s.players[0].board[0].uid });
    expect(s.players[0].deck.every((c) => c.modifiers?.length === 1)).toBe(true);
    s = debugAction(s, { type: 'add', p: 0, card: card('CS2_182') });
    expect(s.players[0].hand.at(-1)?.modifiers).toBeUndefined();
  });
  it('hand buffs stack, carry into play once, and reset after leaving play', () => {
    let s = setup();
    s.players[0].hand = [card('CS2_182')];
    s = play(s, 'CFM_753');
    s = play(s, 'AT_054');
    expect(cardStats(s.players[0].hand[0])).toEqual({ attack: 6, health: 7 });
    s = castFromHand(s, 0);
    const unit = s.players[0].board.at(-1)!;
    expect(unit).toMatchObject({ attack: 6, health: 7, maxHealth: 7 });
    expect(unit.modifiers).toHaveLength(2);
    expect(unit.card).toMatchObject({ attack: 4, health: 5 });
    expect(unit.card.modifiers).toBeUndefined();
    unit.health = 6;
    s = play(s, 'CS2_029', { p: 0, uid: unit.uid });
    const grave = s.players[0].grave.find((c) => c.id === 'CS2_182')!;
    expect(grave.modifiers).toBeUndefined();
    s = summon(s, 0, grave);
    expect(s.players[0].board.at(-1)).toMatchObject({
      attack: 4,
      health: 5,
      maxHealth: 5,
      modifiers: [],
    });
  });
  it('buffed cards keep their enchantments when drawn from the deck', () => {
    let s = play(setup(), 'AT_054');
    for (let i = 0; i < 4; i++) s = applyAction(s, { type: 'end', p: s.active });
    const drawn = s.players[0].hand.find((c) => c.id === 'CS2_182')!;
    expect(cardStats(drawn)).toEqual({ attack: 5, health: 6 });
    expect(drawn.modifiers?.[0].sourceName).toBe('The Mistcaller');
  });
  it.each([
    ['CFM_853', 1],
    ['CFM_685', 5],
    ['WON_137', 5],
  ] as const)('%s chooses exactly one hand minion and replays its random choice', (id, amount) => {
    const initial = setup();
    initial.players[0].hand = [card('CS2_029'), card('CS2_182'), card('FP1_007'), card(id)];
    const action = { type: 'cast' as const, p: 0, index: 3 };
    const n = applyAction(initial, action);
    expect(n.players[0].hand.filter((c) => c.modifiers?.length)).toHaveLength(1);
    const chosen = n.players[0].hand.find((c) => c.modifiers?.length)!;
    expect(chosen.type).toBe('MINION');
    expect(chosen.modifiers?.[0]).toMatchObject({
      attack: amount,
      health: amount,
      sourceCardId: id,
    });
    expect(n.players[0].hand[0].modifiers).toBeUndefined();
    expect(replay(JSON.parse(JSON.stringify({ version: 1, initial, actions: [action] })))).toEqual(
      n,
    );
  });
  it('an empty random-minion pool does not fail or consume randomness', () => {
    const initial = setup();
    initial.players[0].hand = [card('CS2_029')];
    const n = play(initial, 'CFM_685');
    expect(n.seed).toBe(initial.seed);
    expect(n.players[0].hand[0].modifiers).toBeUndefined();
  });
  it('interrupted minion play returns the enhanced physical card without losing or doubling buffs', () => {
    let s = setup();
    s.players[0].hand = [card('CS2_182')];
    s = play(s, 'CFM_753');
    s.players[0].mana = 10;
    s.players[1].reserve = 3;
    s = applyAction(s, { type: 'cast', p: 0, index: 0 });
    s = applyAction(s, { type: 'interrupt', p: 1 });
    expect(s.players[0].hand[0].modifiers).toHaveLength(1);
    expect(cardStats(s.players[0].hand[0])).toEqual({ attack: 5, health: 6 });
  });
  it('burning an enchanted deck card strips its buffs in the graveyard', () => {
    let s = play(setup(), 'AT_054');
    s.players[0].hand = Array(10).fill(card('CS2_029'));
    for (let i = 0; i < 4; i++) s = applyAction(s, { type: 'end', p: s.active });
    expect(s.players[0].grave.find((c) => c.id === 'CS2_182')?.modifiers).toBeUndefined();
    expect(s.players[0].grave.some((c) => c.id === 'CS2_182')).toBe(true);
  });
  it('direct summoning a hand/deck buff source does not enchant other cards', () => {
    const s = summon(setup(), 0, card('AT_054'));
    expect(s.players[0].deck.every((c) => !c.modifiers?.length)).toBe(true);
  });
});
