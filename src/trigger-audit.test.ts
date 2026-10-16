import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, debugAction, applyAction, replay, type Game, type Action } from './engine';
import {
  battlecryFor,
  deathrattleFor,
  battlecries,
  deathrattles,
  supported,
  unsupportedReason,
} from './effects';
import type { Card } from './cards';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
const card = (id: string) => cards.find((c) => c.id === id)!;
const allAudited = cards.filter(
  (c) => battlecries[c.id.replace(/^CORE_/, '')] || deathrattles[c.id.replace(/^CORE_/, '')],
);
// This batch has independent per-printing, dual-trigger, and sequence tests in armor-effects.test.ts.
const armorBatch = new Set([
  'BAR_745',
  'EX1_319',
  'LOOT_013',
  'EX1_313',
  'TRL_546',
  'RLK_921',
  'TTN_832',
  'BOT_447',
  'GVG_053',
  'YOP_032',
  'RLK_657',
  'BE_572',
  'DEEP_030',
  'TID_716',
]);
const audited = allAudited.filter((c) => !armorBatch.has(c.id.replace(/^CORE_/, '')));
const cleanId = (id: string) => id.replace(/^CORE_/, '');
interface Expected {
  trigger: 'Battlecry' | 'Deathrattle';
  kind: string;
  amount?: number;
  zone?: string;
  tokens?: [string, number, number, boolean][];
}
// Independent expectations checked against the imported text, not generated from executable effects.
const expected: Record<string, Expected> = {
  CS2_188: { trigger: 'Battlecry', kind: 'temp-buff', amount: 2 },
  EX1_046: { trigger: 'Battlecry', kind: 'temp-buff', amount: 2 },
  GVG_011: { trigger: 'Battlecry', kind: 'temp-buff', amount: -3 },
  WON_314: { trigger: 'Battlecry', kind: 'temp-buff', amount: -3 },
  BT_720: { trigger: 'Battlecry', kind: 'self-buff', amount: 4 },
  GIL_803: { trigger: 'Battlecry', kind: 'self-buff', amount: 3 },
  AT_054: { trigger: 'Battlecry', kind: 'zone-buff', amount: 1, zone: 'hand-deck' },
  CFM_753: { trigger: 'Battlecry', kind: 'zone-buff', amount: 1, zone: 'hand' },
  CFM_853: { trigger: 'Battlecry', kind: 'zone-buff', amount: 1, zone: 'hand' },
  CFM_685: { trigger: 'Battlecry', kind: 'zone-buff', amount: 5, zone: 'hand' },
  WON_137: { trigger: 'Battlecry', kind: 'zone-buff', amount: 5, zone: 'hand' },
  CATA_216: { trigger: 'Battlecry', kind: 'healing-bonus', amount: 2 },
  CS2_189: { trigger: 'Battlecry', kind: 'damage', amount: 1 },
  CS2_141: { trigger: 'Battlecry', kind: 'damage', amount: 1 },
  CS2_150: { trigger: 'Battlecry', kind: 'damage', amount: 2 },
  CS2_117: { trigger: 'Battlecry', kind: 'heal', amount: 3 },
  EX1_011: { trigger: 'Battlecry', kind: 'heal', amount: 2 },
  CS2_147: { trigger: 'Battlecry', kind: 'draw' },
  EX1_015: { trigger: 'Battlecry', kind: 'draw' },
  EX1_019: { trigger: 'Battlecry', kind: 'buff' },
  EX1_593: { trigger: 'Battlecry', kind: 'enemy-heroes', amount: 3 },
  DS1_055: { trigger: 'Battlecry', kind: 'heal-friendly', amount: 2 },
  CS2_196: { trigger: 'Battlecry', kind: 'summon', tokens: [['Boar', 1, 1, false]] },
  EX1_025: {
    trigger: 'Battlecry',
    kind: 'summon',
    tokens: [['Mechanical Dragonling', 2, 1, false]],
  },
  EX1_096: { trigger: 'Deathrattle', kind: 'draw' },
  EX1_029: { trigger: 'Deathrattle', kind: 'enemy-heroes', amount: 2 },
  EX1_097: { trigger: 'Deathrattle', kind: 'damage-all-characters', amount: 2 },
  FP1_024: { trigger: 'Deathrattle', kind: 'damage-all-minions', amount: 1 },
  GVG_076: { trigger: 'Deathrattle', kind: 'damage-all-minions', amount: 2 },
  EX1_556: { trigger: 'Deathrattle', kind: 'summon', tokens: [['Damaged Golem', 2, 1, false]] },
  FP1_002: {
    trigger: 'Deathrattle',
    kind: 'summon',
    tokens: [
      ['Spectral Spider', 1, 1, false],
      ['Spectral Spider', 1, 1, false],
    ],
  },
  FP1_007: { trigger: 'Deathrattle', kind: 'summon', tokens: [['Nerubian', 4, 4, false]] },
  FP1_012: { trigger: 'Deathrattle', kind: 'summon', tokens: [['Slime', 1, 2, true]] },
  WON_128: { trigger: 'Deathrattle', kind: 'summon', tokens: [['Slime', 1, 2, true]] },
};
function setup() {
  const s = createGame(cards);
  for (const p of s.players) {
    p.mana = 10;
    p.reserve = 0;
    p.hand = [];
    p.deck = Array(20).fill(card('CS2_182'));
  }
  return s;
}
function summon(s: Game, p: number, c: Card) {
  return debugAction(s, { type: 'summon', p, card: c });
}
function play(s: Game, c: Card, target?: { p: number; uid?: number }, position?: number) {
  const next = structuredClone(s);
  next.players[0].mana = 10;
  next.players[0].hand =
    expected[cleanId(c.id)]?.kind === 'zone-buff' ? [c, card('CS2_182'), card('CS2_029')] : [c];
  return applyAction(next, { type: 'cast', p: 0, index: 0, target, position });
}
describe('Every enabled Battlecry and Deathrattle printing', () => {
  it('has an independent audit expectation for every enabled trigger card', () => {
    expect(audited).toHaveLength(39);
    expect(new Set(audited.map((c) => c.name)).size).toBe(31);
    expect(allAudited).toHaveLength(55);
    expect(new Set(allAudited.map((c) => c.name)).size).toBe(45);
    for (const c of audited) expect(expected[cleanId(c.id)], c.id).toBeDefined();
    const enabledByMechanic = cards.filter(
      (c) => allAudited.some((x) => x.id === c.id) && supported(c),
    );
    expect(enabledByMechanic.map((c) => c.id).sort()).toEqual(allAudited.map((c) => c.id).sort());
  });
  it.each(audited.map((c) => [c.id, c] as const))('%s matches its audited behavior', (id, c) => {
    const e = expected[cleanId(id)];
    expect(c.text?.toLowerCase()).toContain(e.trigger.toLowerCase());
    let s = summon(setup(), 0, card('CS2_182'));
    s = summon(s, 1, card('CS2_182'));
    const friendly = s.players[0].board[0].uid,
      enemy = s.players[1].board[0].uid;
    if (e.trigger === 'Battlecry') {
      if (e.kind === 'buff' || e.kind === 'heal-friendly') s.players[0].board[0].health = 2;
      const target =
        e.kind === 'temp-buff'
          ? { p: 1, uid: enemy }
          : e.kind === 'buff'
            ? { p: 0, uid: friendly }
            : e.kind === 'heal'
              ? { p: 0 }
              : e.kind === 'damage'
                ? { p: 1, uid: enemy }
                : undefined;
      s = play(s, c, target, 0);
      expect(s.players[0].board[0].card.id).toBe(id);
      if (e.kind === 'damage') expect(s.players[1].board[0].health).toBe(5 - e.amount!);
      if (e.kind === 'heal') expect(s.players[0].health).toBe(40 + e.amount!);
      if (e.kind === 'buff')
        expect(s.players[0].board.find((u) => u.uid === friendly)).toMatchObject({
          attack: 5,
          health: 3,
          maxHealth: 6,
        });
      if (e.kind === 'heal-friendly') {
        expect(s.players[0].health).toBe(42);
        expect(s.players[0].board.find((u) => u.uid === friendly)?.health).toBe(4);
        expect(s.players[1].health).toBe(40);
      }
      if (e.kind === 'enemy-heroes')
        expect(s.players.map((p) => p.health)).toEqual([40, 37, 37, 37]);
    } else {
      s = summon(s, 1, c);
      s = summon(s, 1, card('CS2_182'));
      const dying = s.players[1].board[1].uid;
      s = play(s, card('CS2_029'), { p: 1, uid: dying });
      expect(s.players[1].board.some((u) => u.uid === dying)).toBe(false);
      expect(s.players[1].grave.some((x) => x.id === id)).toBe(true);
      if (e.kind === 'enemy-heroes')
        expect(s.players.map((p) => p.health)).toEqual([38, 40, 38, 38]);
      if (e.kind.startsWith('damage-all')) {
        expect(s.players[0].board[0].health).toBe(5 - e.amount!);
        expect(s.players[1].board.map((u) => u.health)).toEqual([5 - e.amount!, 5 - e.amount!]);
        expect(s.players.map((p) => p.health)).toEqual(
          Array(4).fill(e.kind === 'damage-all-characters' ? 38 : 40),
        );
      }
    }
    if (e.kind === 'healing-bonus')
      expect(s.players[0].effects).toEqual([
        { kind: 'healing-bonus', amount: 2, sourceCardId: id, sourceName: c.name },
      ]);
    if (e.kind === 'zone-buff') {
      expect(s.players[0].hand[0].modifiers).toEqual([
        { sourceCardId: id, sourceName: c.name, attack: e.amount, health: e.amount },
      ]);
      expect(s.players[0].hand[1].modifiers).toBeUndefined();
      expect(
        s.players[0].deck.every(
          (c) => (c.modifiers?.length ?? 0) === (e.zone === 'hand-deck' ? 1 : 0),
        ),
      ).toBe(true);
      expect(s.players[1].deck.every((c) => !c.modifiers?.length)).toBe(true);
    }
    if (e.kind === 'temp-buff') {
      expect(s.players[1].board[0].attack).toBe(4 + e.amount!);
      expect(s.players[1].board[0].modifiers?.at(-1)).toMatchObject({
        attack: e.amount,
        health: 0,
        expiresAtTurn: s.turn,
      });
    }
    if (e.kind === 'self-buff') {
      expect(s.players[0].board[0].attack).toBe(c.attack! + e.amount!);
      expect(s.players[0].board[0].rushOnly).toBe(true);
      expect(s.players[0].board[0].modifiers?.at(-1)?.expiresAtTurn).toBe(s.turn);
    }
    const owner = e.trigger === 'Battlecry' ? 0 : 1;
    if (e.kind === 'draw') {
      expect(s.players[owner].hand).toHaveLength(1);
      expect(s.players[owner].deck).toHaveLength(19);
    }
    if (e.tokens) {
      const tokens = s.players[owner].board.slice(1, -1);
      expect(
        tokens.map((u) => [
          u.card.name,
          u.attack,
          u.maxHealth,
          !!u.card.mechanics?.includes('TAUNT'),
        ]),
      ).toEqual(e.tokens);
      for (const token of tokens) {
        expect(token.ready).toBe(false);
        expect(token.card.collectible).toBe(false);
        expect(token.modifiers).toEqual([]);
      }
    }
    expect(s.log.filter((l) => l.includes(`${c.name} triggers ${e.trigger}`))).toHaveLength(1);
  });
  it.each(audited.filter((c) => battlecryFor(c)).map((c) => [c.id, c] as const))(
    '%s never activates Battlecry on a direct summon',
    (id, c) => {
      const s = summon(setup(), 0, c);
      expect(s.players.map((p) => p.health)).toEqual([40, 40, 40, 40]);
      expect(s.players[0].hand).toHaveLength(0);
      expect(s.players[0].deck).toHaveLength(20);
      expect(s.players[0].board).toHaveLength(1);
      expect(s.players[0].board[0].attack).toBe(c.attack);
      expect(s.log.some((l) => l.includes('triggers Battlecry'))).toBe(false);
    },
  );
  it.each(audited.filter((c) => deathrattleFor(c)).map((c) => [c.id, c] as const))(
    '%s never activates Deathrattle just by being played',
    (id, c) => {
      const s = play(setup(), c);
      expect(s.players.map((p) => p.health)).toEqual([40, 40, 40, 40]);
      expect(s.players[0].hand).toHaveLength(0);
      expect(s.players[0].deck).toHaveLength(20);
      expect(s.players[0].board).toHaveLength(1);
      expect(s.players[0].board[0].attack).toBe(c.attack);
      expect(s.log.some((l) => l.includes('triggers Deathrattle'))).toBe(false);
    },
  );
});
describe('Lasting buffs', () => {
  it('stacks with provenance and survives turns, damage, healing, and source death', () => {
    let s = summon(setup(), 0, card('CS2_182'));
    const uid = s.players[0].board[0].uid;
    s = play(s, card('EX1_019'), { p: 0, uid });
    s = play(s, card('EX1_019'), { p: 0, uid });
    expect(s.players[0].board[0]).toMatchObject({ attack: 6, health: 7, maxHealth: 7 });
    expect(s.players[0].board[0].modifiers).toEqual(
      Array(2).fill({
        sourceCardId: 'EX1_019',
        sourceName: 'Shattered Sun Cleric',
        attack: 1,
        health: 1,
      }),
    );
    for (let i = 0; i < 4; i++) s = applyAction(s, { type: 'end', p: s.active });
    s = play(s, card('CS2_189'), { p: 0, uid });
    s = play(s, card('CS2_117'), { p: 0, uid });
    expect(s.players[0].board.find((u) => u.uid === uid)).toMatchObject({
      attack: 6,
      health: 7,
      maxHealth: 7,
    });
    const source = s.players[0].board.find((u) => u.card.id === 'EX1_019')!.uid;
    s = play(s, card('CS2_029'), { p: 0, uid: source });
    expect(s.players[0].board.find((u) => u.uid === uid)?.modifiers).toHaveLength(2);
    expect(s.players[0].board.find((u) => u.uid === uid)?.attack).toBe(6);
  });
  it('does not transfer battlefield buffs to a fresh summon of the card', () => {
    let s = summon(setup(), 0, card('CS2_182'));
    const uid = s.players[0].board[0].uid;
    s = play(s, card('EX1_019'), { p: 0, uid });
    s = play(s, card('CS2_029'), { p: 0, uid });
    expect(s.players[0].board.some((u) => u.uid === uid)).toBe(false);
    const dead = s.players[0].grave.find((c) => c.id === 'CS2_182')!;
    s = summon(s, 0, dead);
    expect(s.players[0].board.at(-1)).toMatchObject({
      attack: 4,
      health: 5,
      maxHealth: 5,
      modifiers: [],
    });
  });
  it('records lasting buffs identically in saved scenarios and replay', () => {
    const initial = summon(setup(), 0, card('CS2_182'));
    initial.players[0].hand = [card('EX1_019')];
    const actions: Action[] = [
      { type: 'cast', p: 0, index: 0, target: { p: 0, uid: initial.players[0].board[0].uid } },
    ];
    const n = applyAction(initial, actions[0]);
    expect(replay(JSON.parse(JSON.stringify({ version: 1, initial, actions })))).toEqual(n);
    expect(n.players[0].board[0].modifiers?.[0].sourceName).toBe('Shattered Sun Cleric');
  });
  it('accepts older units without modifier metadata and records new effects', () => {
    let s = summon(setup(), 0, card('CS2_182'));
    delete s.players[0].board[0].modifiers;
    s = play(s, card('EX1_019'), { p: 0, uid: s.players[0].board[0].uid });
    expect(s.players[0].board[0].modifiers).toHaveLength(1);
  });
  it('keeps game-wide and aura cards blocked with an honest explanation', () => {
    for (const id of ['BT_020', 'BT_026']) {
      expect(supported(card(id))).toBe(false);
      expect(unsupportedReason(card(id))).toMatch(/tracking|persistent/);
    }
    expect(unsupportedReason(card('EX1_019'))).toBe('');
  });
});
