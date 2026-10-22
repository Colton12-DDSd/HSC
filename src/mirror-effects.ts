import { cardCost, cardStats, type Card } from './cards';
import type { Game, Target } from './engine';
import type { ScriptStep } from './script-types';
import type { Helpers } from './foundation-effects';
export const mirrorOperations = [
  'transform-zone',
  'swap-source',
  'transform-random',
  'copy-target-hand',
  'buff-keyword',
  'hand-spell-summons',
  'school-discounts',
];
export function resolveMirror(
  s: Game,
  player: number,
  step: ScriptStep,
  source: Card,
  sourceUid: number | undefined,
  target: Target | undefined,
  h: Helpers,
): boolean {
  if (!mirrorOperations.includes(step.op)) return false;
  const p = s.players[player],
    self = p.board.find((u) => u.uid === sourceUid);
  if (step.op === 'transform-zone') {
    for (const zone of step.zone === 'hand and deck'
      ? (['hand', 'deck'] as const)
      : [step.zone as 'hand' | 'deck']) {
      p[zone] = p[zone].map((old) => {
        if (!h.matches(old, step.filter)) return old;
        const pool = [
          ...new Map(
            h.catalog
              .filter(
                (c) =>
                  c.collectible &&
                  ['MINION', 'SPELL', 'WEAPON', 'HERO', 'LOCATION'].includes(c.type) &&
                  h.matches(c, step.resultFilter) &&
                  (step.costDelta === undefined || c.cost === cardCost(old) + step.costDelta) &&
                  (step.mode !== 'opponent-class' ||
                    s.players.some(
                      (owner, i) =>
                        i !== player &&
                        owner.health > 0 &&
                        (c.classes ?? [c.cardClass]).includes(owner.class),
                    )),
              )
              .map((c) => [c.name, c]),
          ).values(),
        ];
        if (!pool.length) return old;
        const fresh = structuredClone(pool[h.random(pool.length)]);
        if (step.mode === 'keep-stats-cost') {
          const from = cardStats(old),
            to = cardStats(fresh);
          fresh.modifiers = [
            {
              sourceCardId: source.id,
              sourceName: source.name,
              attack: from.attack - to.attack,
              health: from.health - to.health,
            },
          ];
        }
        if (step.mode === 'keep-stats-cost' || step.mode === 'keep-cost') {
          fresh.printedCost = fresh.cost;
          fresh.cost = cardCost(old);
        } else if (step.reduction) {
          fresh.printedCost = fresh.cost;
          fresh.cost = Math.max(0, fresh.cost - step.reduction);
        }
        if (zone === 'hand') fresh.heldSince = s.events?.length ?? 0;
        h.note(`${source.name} transforms ${old.name} into ${fresh.name}`);
        return fresh;
      });
    }
  }
  if (step.op === 'swap-source' && self) {
    for (const t of h.targets(step)) {
      const u = h.get(t);
      if (!('card' in u) || u.uid === self.uid) continue;
      const a = { attack: self.attack, health: self.health },
        b = { attack: u.attack, health: u.health };
      if (step.mode === 'attack' || step.mode === 'both') {
        h.buff(self, b.attack - a.attack, 0);
        h.buff(u, a.attack - b.attack, 0);
      }
      if (step.mode === 'health' || step.mode === 'both') {
        h.buff(self, 0, b.health - self.maxHealth);
        self.health = self.maxHealth = b.health;
        h.buff(u, 0, a.health - u.maxHealth);
        u.health = u.maxHealth = a.health;
      }
      h.note(`${source.name} swaps ${step.mode} with ${u.card.name}`);
    }
  }
  if (step.op === 'copy-target-hand') {
    for (const t of h.targets(step)) {
      const u = h.get(t);
      if (!('card' in u)) continue;
      const c = structuredClone(u.card);
      if (step.attack !== undefined && step.health !== undefined) {
        const stats = cardStats(c);
        c.modifiers = [
          {
            sourceCardId: source.id,
            sourceName: source.name,
            attack: step.attack - stats.attack,
            health: step.health - stats.health,
          },
        ];
      }
      if (step.setCost != null) {
        c.printedCost ??= c.cost;
        c.cost = step.setCost;
      }
      if (step.expires === 'turn') c.temporaryUntilTurn = s.turn;
      h.add(player, c);
      h.note(`${source.name} copies ${u.card.name} to hand`);
    }
  }
  if (step.op === 'transform-random')
    for (const t of h.targets(step)) {
      const tokens = step.pool ?? [];
      if (tokens.length)
        h.run(
          [
            {
              op: 'transform',
              scope: 'target',
              target: 'minion',
              from: 'token',
              token: tokens[h.random(tokens.length)],
            },
          ],
          t,
        );
    }
  if (step.op === 'buff-keyword')
    for (const t of h.targets(step))
      h.run(
        [
          {
            op: 'buff',
            scope: 'target',
            target: 'minion',
            attack: step.attack,
            health: step.health,
          },
          { op: 'keyword', scope: 'target', target: 'minion', keyword: step.keyword },
        ],
        t,
      );
  if (step.op === 'hand-spell-summons')
    for (const c of [...p.hand].filter((c) => c.type === 'SPELL'))
      h.run([{ op: 'summon-pool', amount: 1, filter: { type: 'MINION', cost: cardCost(c) } }]);
  if (step.op === 'school-discounts') {
    const schools = [
      ...new Set(
        p.hand.filter((c) => c.type === 'SPELL' && c.spellSchool).map((c) => c.spellSchool!),
      ),
    ];
    for (const school of schools) {
      const pool = p.hand.filter((c) => c.type === 'SPELL' && c.spellSchool === school);
      const c = pool[h.random(pool.length)];
      c.printedCost ??= c.cost;
      c.cost = Math.max(0, c.cost - (step.reduction ?? 0));
    }
  }
  return true;
}
