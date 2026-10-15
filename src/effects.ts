import type { Card } from './cards';
export type Effect =
  | { type: 'damage'; amount: number }
  | { type: 'heal'; amount: number }
  | { type: 'draw'; amount: number }
  | { type: 'wipe'; amount: number }
  | { type: 'buff'; attack: number; health: number };
// Explicit registry: display text is never interpreted as executable behavior.
export const effects: Record<string, Effect> = {
  CS2_029: { type: 'damage', amount: 6 },
  CS2_023: { type: 'draw', amount: 2 },
  CS2_032: { type: 'wipe', amount: 5 },
  CS2_189: { type: 'damage', amount: 1 },
  CS2_117: { type: 'heal', amount: 3 },
};
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
    !!effects[c.id.replace(/^CORE_/, '')] ||
    (c.type === 'MINION' &&
      !(c.mechanics ?? []).some((m) => !basic.has(m)) &&
      !c.text?.replace(
        /<[^>]+>|\[x\]|\.|\s|Taunt|Divine Shield|Charge|Rush|Lifesteal|Windfury|Poisonous/gi,
        '',
      ))
  );
}
export const effectFor = (c: Card) => effects[c.id.replace(/^CORE_/, '')];

export type ImplementationStatus = 'not_implemented' | 'partial' | 'implemented' | 'tested';
