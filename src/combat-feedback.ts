import type { Game } from './engine';

export interface DamageFeedback {
  anchor: string;
  kind: 'armor' | 'health' | 'blocked';
  amount: number;
}

// Damage events keep feedback accurate even if the victim dies or heals in the
// same action. These presentation values never influence combat resolution.
export function damageFeedback(before: Game, after: Game): DamageFeedback[] {
  const feedback: DamageFeedback[] = [];
  for (const e of (after.events ?? []).slice(before.events?.length ?? 0)) {
    if (e.type !== 'damage') continue;
    const base = e.targetUid === undefined ? `hero:${e.player}` : `unit:${e.targetUid}`;
    if (e.armorDamage)
      feedback.push({ anchor: `${base}:armor`, kind: 'armor', amount: e.armorDamage });
    if (e.healthDamage)
      feedback.push({ anchor: `${base}:health`, kind: 'health', amount: e.healthDamage });
    if (e.blocked) feedback.push({ anchor: `${base}:health`, kind: 'blocked', amount: 0 });
  }
  return feedback;
}
