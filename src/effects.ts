import { freezesOnDamage, type Card } from './cards';
import compiledBattlecries from './generated/battlecries.json';
import compiledDeathrattles from './generated/deathrattles.json';
import compiledSpells from './generated/spells.json';
import type { ScriptStep } from './script-types';
export type EffectTarget =
  | 'character'
  | 'minion'
  | 'friendly-minion'
  | 'friendly-character'
  | 'enemy-hero'
  | 'enemy-character'
  | 'enemy-minion';
export const expandedBattlecries = compiledBattlecries as unknown as Record<
  string,
  { text: string; steps: ScriptStep[] }
>;
export const expandedDeathrattles = compiledDeathrattles as unknown as Record<
  string,
  { text: string; steps: ScriptStep[] }
>;
export const expandedSpells = compiledSpells as unknown as Record<
  string,
  { text: string; steps: ScriptStep[] }
>;
export function scriptTarget(steps: ScriptStep[]): ScriptStep | undefined {
  for (const step of steps) {
    if (step.op === 'future-play') continue;
    if (step.target) return step;
    const nested =
      (step.steps && scriptTarget(step.steps)) || (step.elseSteps && scriptTarget(step.elseSteps));
    if (nested) return nested;
  }
}
export type Effect =
  | { type: 'script'; steps: ScriptStep[] }
  | { type: 'sequence'; effects: Effect[] }
  | { type: 'armor'; amount: number; allHeroes?: boolean }
  | { type: 'self-damage'; amount: number }
  | { type: 'damage'; amount: number; target?: EffectTarget }
  | { type: 'heal'; amount: number; target?: EffectTarget }
  | { type: 'draw'; amount: number }
  | { type: 'wipe'; amount: number }
  | { type: 'buff'; attack: number; health: number; target?: EffectTarget; expires?: 'turn' }
  | { type: 'self-buff'; attack: number; health: number; expires: 'turn' }
  | { type: 'summon'; token: Card; amount: number }
  | { type: 'heal-friendly'; amount: number }
  | { type: 'damage-all'; amount: number; heroes?: boolean }
  | { type: 'enemy-heroes'; amount: number }
  | { type: 'healing-bonus'; amount: number }
  | {
      type: 'zone-buff';
      zone: 'hand' | 'hand-deck';
      attack: number;
      health: number;
      random?: boolean;
    };
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
  BAR_745: { type: 'self-damage', amount: 3 },
  EX1_319: { type: 'self-damage', amount: 3 },
  LOOT_013: { type: 'self-damage', amount: 2 },
  EX1_313: { type: 'self-damage', amount: 5 },
  TRL_546: { type: 'self-damage', amount: 5 },
  RLK_921: { type: 'self-damage', amount: 2 },
  TTN_832: { type: 'self-damage', amount: 4 },
  BOT_447: {
    type: 'sequence',
    effects: [
      { type: 'self-damage', amount: 5 },
      { type: 'armor', amount: 5 },
    ],
  },
  GVG_053: { type: 'armor', amount: 5 },
  YOP_032: { type: 'armor', amount: 4, allHeroes: true },
  RLK_657: { type: 'armor', amount: 6 },
  BE_572: { type: 'armor', amount: 3 },
  DEEP_030: {
    type: 'sequence',
    effects: [
      { type: 'draw', amount: 1 },
      { type: 'self-damage', amount: 2 },
    ],
  },
  TID_716: {
    type: 'sequence',
    effects: [
      { type: 'damage', amount: 5 },
      { type: 'armor', amount: 8 },
    ],
  },
  CS2_188: { type: 'buff', attack: 2, health: 0, target: 'minion', expires: 'turn' },
  EX1_046: { type: 'buff', attack: 2, health: 0, target: 'minion', expires: 'turn' },
  GVG_011: { type: 'buff', attack: -3, health: 0, target: 'minion', expires: 'turn' },
  WON_314: { type: 'buff', attack: -3, health: 0, target: 'minion', expires: 'turn' },
  BT_720: { type: 'self-buff', attack: 4, health: 0, expires: 'turn' },
  GIL_803: { type: 'self-buff', attack: 3, health: 0, expires: 'turn' },
  AT_054: { type: 'zone-buff', zone: 'hand-deck', attack: 1, health: 1 },
  CFM_753: { type: 'zone-buff', zone: 'hand', attack: 1, health: 1 },
  CFM_853: { type: 'zone-buff', zone: 'hand', attack: 1, health: 1, random: true },
  CFM_685: { type: 'zone-buff', zone: 'hand', attack: 5, health: 5, random: true },
  WON_137: { type: 'zone-buff', zone: 'hand', attack: 5, health: 5, random: true },
  CATA_216: { type: 'healing-bonus', amount: 2 },
  CS2_189: { type: 'damage', amount: 1 },
  CS2_117: { type: 'heal', amount: 3 },
  CS2_141: { type: 'damage', amount: 1 },
  CS2_150: { type: 'damage', amount: 2 },
  CS2_147: { type: 'draw', amount: 1 },
  EX1_015: { type: 'draw', amount: 1 },
  EX1_011: { type: 'heal', amount: 2 },
  EX1_019: { type: 'buff', attack: 1, health: 1, target: 'friendly-minion' },
  EX1_593: { type: 'enemy-heroes', amount: 3 },
  DS1_055: { type: 'heal-friendly', amount: 2 },
  CS2_196: { type: 'summon', token: token('CS2_boar', 'Boar', 1, 1, [], 'BEAST'), amount: 1 },
  EX1_025: {
    type: 'summon',
    token: token('EX1_025t', 'Mechanical Dragonling', 2, 1, [], 'MECHANICAL'),
    amount: 1,
  },
};
export const deathrattles: Record<string, Effect> = {
  RLK_657: { type: 'armor', amount: 6 },
  BE_572: { type: 'armor', amount: 3 },
  DEEP_030: {
    type: 'sequence',
    effects: [
      { type: 'draw', amount: 1 },
      { type: 'self-damage', amount: 2 },
    ],
  },
  EX1_096: { type: 'draw', amount: 1 },
  EX1_029: { type: 'enemy-heroes', amount: 2 },
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
export const battlecryFor = (c: Card): Effect | undefined =>
  battlecries[key(c)] ??
  (expandedBattlecries[c.id]
    ? { type: 'script', steps: expandedBattlecries[c.id].steps }
    : undefined);
export const deathrattleFor = (c: Card): Effect | undefined =>
  deathrattles[key(c)] ??
  (expandedDeathrattles[c.id]
    ? { type: 'script', steps: expandedDeathrattles[c.id].steps }
    : undefined);
export const effectFor = (c: Card): Effect | undefined =>
  c.type === 'MINION'
    ? battlecryFor(c)
    : (effects[key(c)] ??
      (expandedSpells[c.id] ? { type: 'script', steps: expandedSpells[c.id].steps } : undefined));
export const targetFor = (e: Effect | undefined): EffectTarget | undefined =>
  e?.type === 'script'
    ? (scriptTarget(e.steps)?.target as EffectTarget | undefined)
    : e?.type === 'sequence'
      ? e.effects.map(targetFor).find(Boolean)
      : e && ['damage', 'heal', 'buff'].includes(e.type)
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
  'STEALTH',
  'REBORN',
]);
export function supported(c: Card) {
  return (
    (c.type === 'MINION' && freezesOnDamage(c)) ||
    (c.type === 'WEAPON' && !c.text) ||
    !!effectFor(c) ||
    !!deathrattleFor(c) ||
    (c.type === 'MINION' &&
      !(c.mechanics ?? []).some((m) => !basic.has(m)) &&
      !c.text?.replace(
        /<[^>]+>|\[x\]|\.|\s|Taunt|Divine Shield|Charge|Rush|Lifesteal|Windfury|Poisonous|Stealth|Reborn/gi,
        '',
      ))
  );
}

export function unsupportedReason(c: Card): string {
  if (supported(c)) return '';
  if (/rest of the game|this game|wherever.*are|your deck and hand/i.test(c.text ?? ''))
    return 'Requires game-wide effect tracking or persistent counters that are not implemented yet.';
  if (c.mechanics?.some((m) => m === 'AURA' || m === 'ADJACENT_BUFF'))
    return 'This aura or ongoing effect is not implemented yet.';
  return 'This card’s complete gameplay effects are not implemented yet.';
}

export type ImplementationStatus = 'not_implemented' | 'partial' | 'implemented' | 'tested';
