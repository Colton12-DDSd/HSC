import type { Card } from './cards';
export type EffectTarget = 'character' | 'friendly-minion' | 'enemy-hero';
export type Effect =
  | { type: 'damage'; amount: number; target?: EffectTarget }
  | { type: 'heal'; amount: number; target?: EffectTarget }
  | { type: 'draw'; amount: number }
  | { type: 'wipe'; amount: number }
  | { type: 'buff'; attack: number; health: number; target?: EffectTarget }
  | { type: 'summon'; token: Card; amount: number }
  | { type: 'heal-friendly'; amount: number }
  | { type: 'damage-all'; amount: number; heroes?: boolean }
  | { type: 'random-enemy-hero'; amount: number };
// Explicit registry: display text is never interpreted as executable behavior.
export const effects: Record<string, Effect> = {
  CS2_029: { type: 'damage', amount: 6 },
  CS2_023: { type: 'draw', amount: 2 },
  CS2_032: { type: 'wipe', amount: 5 },
};
function token(
  id: string,
  name: string,
  attack: number,
  health: number,
  mechanics: string[] = [],
  race?: string,
  cost = 1,
): Card {
  return {
    id,
    dbfId: 0,
    name,
    attack,
    health,
    cost,
    mechanics,
    race,
    type: 'MINION',
    set: 'TOKEN',
    rarity: 'COMMON',
    cardClass: 'NEUTRAL',
    collectible: false,
    wildLegal: null,
  };
}
export const battlecries: Record<string, Effect> = {
  CS2_189: { type: 'damage', amount: 1 },
  CS2_117: { type: 'heal', amount: 3 },
  CS2_141: { type: 'damage', amount: 1 },
  CS2_150: { type: 'damage', amount: 2 },
  CS2_147: { type: 'draw', amount: 1 },
  EX1_015: { type: 'draw', amount: 1 },
  EX1_011: { type: 'heal', amount: 2 },
  EX1_019: { type: 'buff', attack: 1, health: 1, target: 'friendly-minion' },
  EX1_593: { type: 'damage', amount: 3, target: 'enemy-hero' },
  DS1_055: { type: 'heal-friendly', amount: 2 },
  CS2_196: { type: 'summon', token: token('CS2_boar', 'Boar', 1, 1, [], 'BEAST'), amount: 1 },
  EX1_025: {
    type: 'summon',
    token: token('EX1_025t', 'Mechanical Dragonling', 2, 1, [], 'MECHANICAL'),
    amount: 1,
  },
};
export const deathrattles: Record<string, Effect> = {
  EX1_096: { type: 'draw', amount: 1 },
  EX1_029: { type: 'random-enemy-hero', amount: 2 },
  EX1_097: { type: 'damage-all', amount: 2, heroes: true },
  FP1_024: { type: 'damage-all', amount: 1 },
  GVG_076: { type: 'damage-all', amount: 2 },
  EX1_556: {
    type: 'summon',
    token: token('skele21', 'Damaged Golem', 2, 1, [], 'MECHANICAL'),
    amount: 1,
  },
  FP1_002: {
    type: 'summon',
    token: token('FP1_002t', 'Spectral Spider', 1, 1, [], 'BEAST'),
    amount: 2,
  },
  FP1_007: {
    type: 'summon',
    token: token('FP1_007t', 'Nerubian', 4, 4, [], undefined, 4),
    amount: 1,
  },
  FP1_012: { type: 'summon', token: token('FP1_012t', 'Slime', 1, 2, ['TAUNT']), amount: 1 },
  WON_128: { type: 'summon', token: token('FP1_012t', 'Slime', 1, 2, ['TAUNT']), amount: 1 },
};
const key = (c: Card) => c.id.replace(/^CORE_/, '');
export const battlecryFor = (c: Card) => battlecries[key(c)];
export const deathrattleFor = (c: Card) => deathrattles[key(c)];
export const effectFor = (c: Card) => (c.type === 'MINION' ? battlecryFor(c) : effects[key(c)]);
export const targetFor = (e: Effect | undefined): EffectTarget | undefined =>
  e && ['damage', 'heal', 'buff'].includes(e.type)
    ? (('target' in e ? e.target : undefined) ??
      (e.type === 'buff' ? 'friendly-minion' : 'character'))
    : undefined;
const basic = new Set([
  'TAUNT',
  'DIVINE_SHIELD',
  'CHARGE',
  'RUSH',
  'LIFESTEAL',
  'WINDFURY',
  'POISONOUS',
]);
export function supported(c: Card) {
  return (
    !!effectFor(c) ||
    !!deathrattleFor(c) ||
    (c.type === 'MINION' &&
      !(c.mechanics ?? []).some((m) => !basic.has(m)) &&
      !c.text?.replace(
        /<[^>]+>|\[x\]|\.|\s|Taunt|Divine Shield|Charge|Rush|Lifesteal|Windfury|Poisonous/gi,
        '',
      ))
  );
}

export type ImplementationStatus = 'not_implemented' | 'partial' | 'implemented' | 'tested';
