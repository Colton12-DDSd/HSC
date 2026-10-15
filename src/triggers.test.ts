import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  createGame,
  debugAction,
  applyAction,
  effectTargets,
  replay,
  botAction,
  type Game,
  type Target,
} from './engine';
import { supported, battlecries, deathrattles } from './effects';
import type { Card } from './cards';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
const card = (id: string) => {
  const c = cards.find((c) => c.id === id);
  if (!c) throw Error(`Missing fixture ${id}`);
  return c;
};
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
function summon(s: Game, p: number, id: string) {
  return debugAction(s, { type: 'summon', p, card: card(id) });
}
function cast(s: Game, id: string, target?: Target, position?: number) {
  const next = structuredClone(s);
  next.players[0].hand = [card(id)];
  next.players[0].mana = 10;
  return applyAction(next, { type: 'cast', p: 0, index: 0, target, position });
}
function kill(s: Game, p: number, index: number) {
  return cast(s, 'CS2_029', { p, uid: s.players[p].board[index].uid });
}

describe('Battlecry effects', () => {
  it.each(['EX1_015', 'CS2_147'])('%s draws only on play, never on a direct summon', (id) => {
    const s = summon(setup(), 0, id);
    expect(s.players[0].hand).toHaveLength(0);
    const n = cast(s, id);
    expect(n.players[0].hand).toHaveLength(1);
    expect(n.players[0].deck).toHaveLength(19);
    expect(n.log.some((l) => l.includes('triggers Battlecry'))).toBe(true);
  });
  it.each([
    ['CS2_189', 1],
    ['CS2_141', 1],
    ['CS2_150', 2],
  ] as const)('%s damages the chosen character', (id, amount) => {
    const n = cast(setup(), id, { p: 2 });
    expect(n.players[2].health).toBe(40 - amount);
    expect(n.players[1].health).toBe(40);
  });
  it.each([
    ['EX1_011', 2],
    ['CS2_117', 3],
  ] as const)('%s heals an injured minion to its cap', (id, amount) => {
    const s = summon(setup(), 0, 'CS2_182');
    s.players[0].board[0].health = 1;
    const n = cast(s, id, { p: 0, uid: s.players[0].board[0].uid });
    expect(n.players[0].board[0].health).toBe(1 + amount);
  });
  it('requires a friendly minion for Cleric before spending mana; cannot buff itself', () => {
    let s = setup();
    s.players[0].hand = [card('EX1_019')];
    expect(effectTargets(s, 0, card('EX1_019'))).toEqual([]);
    const alone = applyAction(s, { type: 'cast', p: 0, index: 0 });
    expect(alone.players[0].board[0].attack).toBe(card('EX1_019').attack);
    expect(alone.log.some((l) => l.includes('effect skipped'))).toBe(true);
    s = summon(s, 0, 'CS2_182');
    expect(() => applyAction(s, { type: 'cast', p: 0, index: 0, target: { p: 1 } })).toThrow(
      /friendly minion/,
    );
    expect(s.players[0].mana).toBe(10);
    const n = applyAction(s, {
      type: 'cast',
      p: 0,
      index: 0,
      target: { p: 0, uid: s.players[0].board[0].uid },
    });
    expect(n.players[0].board[0]).toMatchObject({ attack: 5, health: 6, maxHealth: 6 });
  });
  it('Nightblade requires one enemy hero and does not damage all opponents', () => {
    const s = setup();
    s.players[0].hand = [card('EX1_593')];
    expect(() => applyAction(s, { type: 'cast', p: 0, index: 0, target: { p: 0 } })).toThrow(
      /enemy hero/,
    );
    const n = applyAction(s, { type: 'cast', p: 0, index: 0, target: { p: 3 } });
    expect(n.players.map((p) => p.health)).toEqual([40, 40, 40, 37]);
  });
  it('Darkscale Healer heals only friendly characters and caps their health', () => {
    let s = summon(setup(), 0, 'CS2_182');
    s = summon(s, 1, 'CS2_182');
    s.players[0].health = 39;
    s.players[0].board[0].health = 2;
    s.players[1].board[0].health = 2;
    const n = cast(s, 'DS1_055');
    expect(n.players[0].health).toBe(40);
    expect(n.players[0].board[0].health).toBe(4);
    expect(n.players[1].board[0].health).toBe(2);
  });
  it.each([
    ['CS2_196', 'Boar'],
    ['EX1_025', 'Mechanical Dragonling'],
  ])('%s summons its token to the right', (id, name) => {
    let s = summon(setup(), 0, 'CS2_182');
    s = summon(s, 0, 'CS2_182');
    const n = cast(s, id, undefined, 1);
    expect(n.players[0].board.map((u) => u.card.name)).toEqual([
      'Chillwind Yeti',
      card(id).name,
      name,
      'Chillwind Yeti',
    ]);
    expect(n.players[0].board[2].ready).toBe(false);
    expect(n.players[0].board[2].card.collectible).toBe(false);
  });
  it('skips a summon at seven minions without rolling back the played minion or cost', () => {
    let s = setup();
    for (let i = 0; i < 6; i++) s = summon(s, 0, 'CS2_182');
    const n = cast(s, 'CS2_196');
    expect(n.players[0].board).toHaveLength(7);
    expect(n.players[0].mana).toBe(10 - card('CS2_196').cost);
    expect(n.log.at(-2)).toContain('battlefield full');
  });
  it('interruption prevents both the minion and its Battlecry', () => {
    const s = setup();
    s.players[1].reserve = 3;
    let n = cast(s, 'EX1_015');
    expect(n.players[0].board).toHaveLength(0);
    expect(n.players[0].deck).toHaveLength(20);
    n = applyAction(n, { type: 'interrupt', p: 1 });
    expect(n.players[0].board).toHaveLength(0);
    expect(n.players[0].deck).toHaveLength(20);
    expect(n.log.some((l) => l.includes('triggers Battlecry'))).toBe(false);
  });
  it('a missing target at delayed resolution skips the effect but still resolves the minion', () => {
    let s = summon(setup(), 1, 'CS2_182');
    s.players[1].reserve = 3;
    s = cast(s, 'CS2_150', { p: 1, uid: s.players[1].board[0].uid });
    // Future response effects may remove a chosen target while the play is pending.
    s.players[1].board = [];
    const n = applyAction(s, { type: 'pass', p: 1 });
    expect(n.players[0].board[0].card.id).toBe('CS2_150');
    expect(n.log.some((l) => l.includes('effect skipped'))).toBe(true);
  });
  it('bots choose a legal friendly Battlecry target', () => {
    let s = summon(setup(), 0, 'CS2_182');
    s.players[0].hand = [card('EX1_019')];
    const a = botAction(s)!;
    expect(a).toMatchObject({ type: 'cast', target: { p: 0, uid: s.players[0].board[0].uid } });
    expect(() => applyAction(s, a)).not.toThrow();
  });
});

describe('Deathrattle queue', () => {
  it('Loot Hoarder draws only after dying, exactly once', () => {
    const s = summon(setup(), 1, 'EX1_096');
    expect(s.players[1].hand).toHaveLength(0);
    const n = kill(s, 1, 0);
    expect(n.players[1].hand).toHaveLength(1);
    expect(n.players[1].grave.map((c) => c.id)).toEqual(['EX1_096']);
    const next = debugAction(n, { type: 'edit', p: 0, field: 'mana', value: 10 });
    expect(next.players[1].hand).toHaveLength(1);
  });
  it.each([
    ['EX1_556', ['Damaged Golem']],
    ['FP1_002', ['Spectral Spider', 'Spectral Spider']],
    ['FP1_007', ['Nerubian']],
    ['FP1_012', ['Slime']],
    ['WON_128', ['Slime']],
  ] as const)('%s replaces its position with tokens', (id, names) => {
    let s = summon(setup(), 1, 'CS2_182');
    s = summon(s, 1, id);
    s = summon(s, 1, 'CS2_182');
    const n = kill(s, 1, 1);
    expect(n.players[1].board.map((u) => u.card.name)).toEqual([
      'Chillwind Yeti',
      ...names,
      'Chillwind Yeti',
    ]);
    for (const u of n.players[1].board.slice(1, -1)) {
      expect(u.ready).toBe(false);
      expect(u.commander).toBe(false);
      if (id.includes('012') || id === 'WON_128') expect(u.card.mechanics).toContain('TAUNT');
    }
  });
  it('a full board frees the dead slot and summons only as many tokens as fit', () => {
    let s = summon(setup(), 1, 'FP1_002');
    for (let i = 0; i < 6; i++) s = summon(s, 1, 'CS2_182');
    const n = kill(s, 1, 0);
    expect(n.players[1].board).toHaveLength(7);
    expect(n.players[1].board.filter((u) => u.card.name === 'Spectral Spider')).toHaveLength(1);
  });
  it('processes simultaneous deaths by summon order, preserving adjacent death slots', () => {
    let s = summon(setup(), 1, 'FP1_002');
    s = summon(s, 1, 'EX1_556');
    s.players[1].board.reverse(); // Position does not change order of play.
    const n = cast(s, 'CS2_032');
    expect(
      n.log.filter((l) => l.includes('triggers Deathrattle')).map((l) => l.split("'s ")[1]),
    ).toEqual(['Haunted Creeper triggers Deathrattle', 'Harvest Golem triggers Deathrattle']);
    expect(n.players[1].board.map((u) => u.card.name)).toEqual([
      'Damaged Golem',
      'Spectral Spider',
      'Spectral Spider',
    ]);
  });
  it('removes chained deaths before the next effect and appends their triggers to the queue', () => {
    let s = summon(setup(), 1, 'GVG_076');
    s = summon(s, 1, 'EX1_097');
    s = summon(s, 2, 'EX1_096');
    const n = cast(s, 'CS2_032');
    const logs = n.log.filter((l) => l.includes('triggers Deathrattle'));
    expect(logs[0]).toContain('Explosive Sheep');
    expect(logs[1]).toContain('Abomination');
    expect(logs[2]).toContain('Loot Hoarder');
    expect(n.players[2].hand).toHaveLength(1);
    expect(n.players[2].board).toHaveLength(0);
    expect(n.players.map((p) => p.health)).toEqual([38, 38, 38, 38]);
  });
  it('area Deathrattle damage respects Divine Shield and hits friendly minions too', () => {
    let s = summon(setup(), 1, 'FP1_024');
    s = summon(s, 0, 'CS2_182');
    s = summon(s, 2, 'EX1_008');
    const n = kill(s, 1, 0);
    expect(n.players[0].board[0].health).toBe(4);
    expect(n.players[2].board[0].health).toBe(card('EX1_008').health);
    expect(n.players[2].board[0].shield).toBe(false);
  });
  it('handles fatigue from a Deathrattle draw and eliminates that player', () => {
    let s = summon(setup(), 1, 'EX1_096');
    s.players[1].deck = [];
    s.players[1].health = 1;
    const n = kill(s, 1, 0);
    expect(n.players[1].health).toBe(0);
    expect(n.players[1].board).toHaveLength(0);
    expect(n.players[1].fatigue).toBe(1);
  });
  it('preserves commander replacement while triggering its Deathrattle', () => {
    let s = setup();
    s.players[0].commander = card('EX1_556');
    s = applyAction(s, { type: 'cast', p: 0, command: true });
    const n = kill(s, 0, 0);
    expect(n.players[0].zone).toBe('command');
    expect(n.players[0].replacement).toBe(true);
    expect(n.players[0].board[0].card.name).toBe('Damaged Golem');
    expect(n.players[0].casts).toBe(1);
  });
  it('seeded enemy-hero damage and the entire trigger history replay identically', () => {
    const initial = summon(setup(), 1, 'EX1_029');
    initial.players[0].hand = [card('CS2_029')];
    const action = {
      type: 'cast' as const,
      p: 0,
      index: 0,
      target: { p: 1, uid: initial.players[1].board[0].uid },
    };
    const n = applyAction(initial, action);
    expect(n.players[1].health).toBe(40);
    expect(n.players.filter((p) => p.health === 38)).toHaveLength(1);
    expect(replay({ version: 1, initial, actions: [action] })).toEqual(n);
    expect(applyAction(initial, action)).toEqual(n);
  });
  it('only explicit complete effects become supported, including Core aliases', () => {
    for (const id of [...Object.keys(battlecries), ...Object.keys(deathrattles)]) {
      expect(supported(card(id))).toBe(true);
      const core = cards.find((c) => c.id === `CORE_${id}`);
      if (core) expect(supported(core)).toBe(true);
    }
    expect(supported(card('EX1_012'))).toBe(false); // Bloodmage also needs Spell Damage.
    expect(supported(card('GVG_082'))).toBe(false); // Spare Parts remain unsupported.
  });
});

describe('Elimination during triggers', () => {
  it('advances past the active player if a Deathrattle kills their hero', () => {
    const s = summon(setup(), 1, 'EX1_097');
    s.players[0].health = 2;
    const n = kill(s, 1, 0);
    expect(n.players[0].health).toBe(0);
    expect(n.players[0].reserve).toBe(0);
    expect(n.active).toBe(1);
    expect(n.winner).toBeNull();
    expect(() => applyAction(n, { type: 'end', p: 1 })).not.toThrow();
  });
  it('advances after a delayed cast resolves and kills the active hero', () => {
    const s = summon(setup(), 1, 'EX1_097');
    s.players[0].health = 2;
    s.players[1].reserve = 3;
    let n = kill(s, 1, 0);
    expect(n.pending).not.toBeNull();
    n = applyAction(n, { type: 'pass', p: 1 });
    expect(n.active).toBe(1);
    expect(n.players[0].health).toBe(0);
  });
  it('does not trigger Deathrattles merely because their owner is eliminated', () => {
    let s = summon(setup(), 1, 'FP1_002');
    s.players[1].health = 1;
    const n = cast(s, 'CS2_029', { p: 1 });
    expect(n.players[1].board).toHaveLength(0);
    expect(n.log.some((l) => l.includes('triggers Deathrattle'))).toBe(false);
  });
});

it('both Loot Hoarders trigger after simultaneous lethal combat damage', () => {
  let s = summon(setup(), 0, 'EX1_096');
  s = summon(s, 1, 'EX1_096');
  s.players[0].board[0].ready = true;
  const n = applyAction(s, {
    type: 'attack',
    p: 0,
    uid: s.players[0].board[0].uid,
    target: { p: 1, uid: s.players[1].board[0].uid },
  });
  expect(n.players[0].board).toHaveLength(0);
  expect(n.players[1].board).toHaveLength(0);
  expect(n.players[0].hand).toHaveLength(1);
  expect(n.players[1].hand).toHaveLength(1);
  expect(n.log.filter((l) => l.includes('triggers Deathrattle'))).toHaveLength(2);
});
it('a Deathrattle draw burns a card at the hand limit without changing hand size', () => {
  const s = summon(setup(), 1, 'EX1_096');
  s.players[1].hand = Array(10).fill(card('CS2_182'));
  const n = kill(s, 1, 0);
  expect(n.players[1].hand).toHaveLength(10);
  expect(n.players[1].deck).toHaveLength(19);
  expect(n.log.some((l) => l.includes('burns Chillwind Yeti'))).toBe(true);
});

it.each(['CS2_189', 'CORE_CS2_189'])(
  '%s waits for a valid explicit target and deals one damage after priority',
  (id) => {
    const s = summon(setup(), 1, 'CS2_182');
    s.players[0].hand = [card(id)];
    s.players[1].reserve = 3;
    expect(() => applyAction(s, { type: 'cast', p: 0, index: 0, position: 0 })).toThrow(/target/);
    expect(s.players[0].mana).toBe(10);
    expect(s.players[0].hand).toHaveLength(1);
    const target = { p: 1, uid: s.players[1].board[0].uid };
    let n = applyAction(s, { type: 'cast', p: 0, index: 0, position: 0, target });
    expect(n.players[0].mana).toBe(9);
    expect(n.players[1].board[0].health).toBe(5);
    expect(n.pending?.target).toEqual(target);
    n = applyAction(n, { type: 'pass', p: 1 });
    expect(n.players[1].board[0].health).toBe(4);
    expect(n.players[1].health).toBe(40);
    expect(n.players[0].board[0].card.id).toBe(id);
    expect(n.log.some((l) => l.includes('Chillwind Yeti takes 1 damage'))).toBe(true);
  },
);
