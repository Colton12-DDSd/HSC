import { cardCost, cardStats, type Card } from './cards';
import { deathrattleFor } from './effects';
import { mirrorOperations, resolveMirror } from './mirror-effects';
import type { Game, Player, Unit, Target } from './engine';
import type { CardFilter, ScriptStep } from './script-types';

// Shared transactions that must retain a drawn/destroyed object's identity.
// All randomness, damage and summons still use the authoritative engine helpers.
export const foundationOperations = [
  ...mirrorOperations,
  'battlefield-stats',
  'shield-harvest',
  'draw-linked',
  'shuffle-hand-draw',
  'board-shots',
  'random-keyword',
  'source-stats',
  'zone-stats',
  'convert-health',
  'hand-limit',
  'freeze-or-damage',
  'reborn-or-copy',
  'overheal-buff',
  'tribe-damage',
  'destroy-copies',
  'eat-hand',
  'hand-to-deck',
  'deck-cost',
  'held-damage',
  'hero-history-damage',
  'fatigue-payoff',
  'summon-sized',
  'menagerie',
  'held-spells',
  'history-cards',
  'resource-payoff',
  'unlock-mana',
  'reveal-spell',
  'copy-board-hand',
  'discard-weapons-stats',
  'deck-copy',
  'swap-extreme-attack',
  'burn-or-draw',
  'recruit-gain',
  'shuffle-hands',
];
export interface Helpers {
  random: (n: number) => number;
  shuffle: (cards: Card[]) => Card[];
  matches: (c: Card, f?: CardFilter, u?: Unit) => boolean;
  add: (owner: number, c: Card) => void;
  draw: () => void;
  note: (text: string) => void;
  event: (type: string, amount: number) => void;
  damage: (t: Target, amount: number, source?: Unit) => number;
  heal: (u: Player | Unit, amount: number) => number;
  healingBonus: number;
  buff: (u: Unit, attack: number, health: number) => void;
  keys: (u: Unit) => string[];
  targets: (step: ScriptStep) => Target[];
  get: (t: Target) => Player | Unit;
  run: (steps: ScriptStep[], t?: Target) => void;
  catalog: Card[];
}
export function resolveFoundation(
  s: Game,
  player: number,
  step: ScriptStep,
  source: Card,
  sourceUid: number | undefined,
  amount: number,
  target: Target | undefined,
  h: Helpers,
): boolean {
  const p = s.players[player],
    self = p.board.find((u) => u.uid === sourceUid);
  const op = step.op;
  if (!foundationOperations.includes(op)) return false;
  if (resolveMirror(s, player, step, source, sourceUid, target, h)) return true;
  if (op === 'history-cards') {
    const previous =
      (s.events ?? [])
        .filter((e) => e.type === 'turn' && e.player === player && e.turn < s.turn)
        .at(-1)?.turn ??
      (s.events ?? [])
        .filter((e) => e.type === 'play' && e.player === player && e.turn < s.turn)
        .at(-1)?.turn;
    let played = (s.events ?? []).filter(
      (e, i) =>
        e.type === 'play' &&
        e.player === player &&
        e.card &&
        h.matches(e.card, step.filter) &&
        (step.zone !== 'held' || i >= (source.heldSince ?? 0)) &&
        (step.zone !== 'previous' || e.turn === previous),
    );
    if (step.mode === 'last-copy') played = played.slice(-1);
    if (step.amount !== undefined) played = played.length >= amount ? played.slice(0, amount) : [];
    for (const e of played) {
      if (step.mode === 'summon-cost')
        h.run([{ op: 'summon-pool', amount: 1, filter: { type: 'MINION', cost: e.card!.cost } }]);
      else h.add(player, e.card!);
    }
    h.note(`${source.name} uses ${played.length} cards from play history`);
  }
  if (op === 'unlock-mana') {
    const locked = p.lockedMana ?? 0,
      total = locked + (p.overload ?? 0);
    p.lockedMana = 0;
    p.overload = 0;
    p.mana = Math.min(p.maxMana, p.mana + locked);
    if (step.after === 'draw') for (let i = 0; i < total && p.health > 0; i++) h.draw();
    h.note(`${source.name} unlocks ${total} Mana Crystals`);
  }
  if (op === 'resource-payoff') {
    if (step.mode === 'spend-buff' && self) {
      const n = p.mana;
      p.mana = 0;
      h.buff(self, n, n);
    }
    if (step.mode === 'highest-spell')
      h.run([
        {
          op: 'mana',
          mode: 'refresh',
          amount: Math.max(0, ...p.hand.filter((c) => c.type === 'SPELL').map(cardCost)),
        },
      ]);
    if (step.mode === 'spend-double' && self && p.mana >= amount) {
      p.mana -= amount;
      h.buff(self, self.attack, self.health);
    }
    if (step.mode === 'spell-cost') {
      const spells = p.hand.filter((c) => c.type === 'SPELL');
      if (spells.length) {
        const c = spells[h.random(spells.length)];
        c.printedCost ??= c.cost;
        c.cost = cardCost(source);
      }
    }
    if (step.mode === 'distinct-costs' && new Set(p.hand.map(cardCost)).size === p.hand.length)
      h.run([{ op: 'cost', zone: 'hand', reduction: step.reduction }]);
  }
  if (op === 'reveal-spell') {
    const pool = p.deck.filter((c) => c.type === 'SPELL');
    if (pool.length) {
      const c = pool[h.random(pool.length)];
      h.note(`${source.name} reveals ${c.name} (Cost ${c.cost})`);
      if (step.mode === 'summon')
        h.run([{ op: 'summon-pool', amount: 1, filter: { type: 'MINION', cost: c.cost } }]);
      if (step.mode === 'missiles' && c.cost >= 5)
        h.run([{ op: 'missiles', scope: 'enemy', amount }]);
    }
  }
  if (op === 'copy-board-hand')
    for (const t of h.targets(step)) {
      const u = h.get(t);
      if ('card' in u) h.add(player, u.card);
    }
  if (op === 'held-spells') {
    const spells = (s.events ?? []).filter(
      (e, i) =>
        i >= (source.heldSince ?? 0) &&
        e.type === 'play' &&
        e.player === player &&
        e.card?.type === 'SPELL',
    );
    const count = step.distinct
      ? new Set(spells.map((e) => e.card!.spellSchool).filter(Boolean)).size
      : spells.length;
    if (count >= amount) h.run(step.steps ?? []);
  }
  if (op === 'discard-weapons-stats') {
    const weapons = p.hand.filter((c) => c.type === 'WEAPON');
    p.hand = p.hand.filter((c) => c.type !== 'WEAPON');
    for (const c of weapons) {
      const { modifiers: _modifiers, printedCost, temporaryCosts: _costs, ...printed } = c;
      p.grave.push({ ...printed, cost: printedCost ?? c.cost });
      const stats = cardStats(c);
      if (self)
        h.buff(
          self,
          stats.attack,
          (c.durability || c.health || 1) + (c.modifiers ?? []).reduce((n, m) => n + m.health, 0),
        );
      h.note(`${p.name} discards ${c.name}`);
    }
  }
  if (op === 'deck-copy') {
    const pool = p[step.zone === 'hand' ? 'hand' : 'deck'].filter(
      (c) => c.type === 'MINION' && (step.zone === 'hand' || c.name !== source.name),
    );
    if (pool.length)
      h.run([
        {
          op: 'transform',
          scope: 'self',
          from: 'token',
          token: pool[h.random(pool.length)].id,
          attack: step.attack,
          health: step.health,
        },
      ]);
  }
  if (op === 'hand-limit') {
    p.maxHandSize = amount;
    h.note(`${p.name}'s hand limit is ${amount}`);
  }
  if (op === 'shuffle-hands') {
    const living = s.players.filter((p) => p.health > 0),
      sizes = living.map((p) => p.hand.length);
    const pool = h.shuffle(living.flatMap((p) => p.hand));
    living.forEach((p, i) => {
      p.hand = pool
        .splice(0, sizes[i])
        .map((c) => ({ ...c, heldTurn: s.turn, heldSince: s.events?.length ?? 0 }));
    });
  }
  if (op === 'burn-or-draw')
    for (let i = 0; i < amount && p.deck.length; i++) {
      const c = p.deck.shift()!;
      if (h.matches(c, step.filter)) h.add(player, c);
      else {
        p.grave.push(c);
        h.note(`${source.name} destroys ${c.name}`);
      }
    }
  if (op === 'recruit-gain') {
    const before = s.nextId;
    h.run([{ ...step, op: 'recruit', zone: 'deck' }]);
    const summoned = p.board.find((u) => u.uid >= before);
    if (self && summoned) h.buff(self, summoned.attack, summoned.health);
  }
  if (op === 'swap-extreme-attack') {
    const units = s.players.flatMap((p) => p.board).filter((u) => u.health > 0);
    if (units.length) {
      const low = Math.min(...units.map((u) => u.attack)),
        high = Math.max(...units.map((u) => u.attack));
      const lows = units.filter((u) => u.attack === low),
        highs = units.filter((u) => u.attack === high);
      const a = lows[h.random(lows.length)],
        b = highs[h.random(highs.length)];
      if (a !== b) {
        h.buff(a, high - low, 0);
        h.buff(b, low - high, 0);
      }
    }
  }
  if (op === 'menagerie') {
    const items =
      step.zone === 'played'
        ? (s.events ?? []).flatMap((e) =>
            e.type === 'play' && e.player === player && e.card?.type === 'MINION' ? [e.card] : [],
          )
        : step.zone === 'hand'
          ? p.hand.filter((c) => c.type === 'MINION')
          : p.board.filter((u) => u.health > 0 && u.uid !== sourceUid);
    const cards = items.map((x) => ('card' in x ? x.card : x));
    const all = [
      'BEAST',
      'DEMON',
      'DRAGON',
      'ELEMENTAL',
      'MECHANICAL',
      'MURLOC',
      'PIRATE',
      'TOTEM',
      'UNDEAD',
      'DRAENEI',
      'QUILBOAR',
      'NAGA',
    ];
    const tribes = cards.map((c) =>
      c.race === 'ALL' || c.races?.includes('ALL') ? all : (c.races ?? (c.race ? [c.race] : [])),
    );
    const order = cards.map((_, i) => i).sort(() => 0);
    for (let i = order.length - 1; i > 0; i--) {
      const j = h.random(i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    const assignments = new Map<string, number>();
    const assign = (i: number, seen: Set<string>): boolean => {
      for (const t of tribes[i])
        if (!seen.has(t)) {
          seen.add(t);
          const previous = assignments.get(t);
          if (previous === undefined || assign(previous, seen)) {
            assignments.set(t, i);
            return true;
          }
        }
      return false;
    };
    for (const i of order) assign(i, new Set());
    const selected = [...new Set(assignments.values())].slice(0, amount);
    if (step.mode === 'self' && self)
      h.buff(self, selected.length * (step.attack ?? 0), selected.length * (step.health ?? 0));
    for (const i of step.mode === 'self' ? [] : selected) {
      const x = items[i];
      if (step.mode === 'copy' && !('card' in x)) {
        h.add(player, x);
        continue;
      }
      if ('card' in x) h.buff(x, step.attack ?? 0, step.health ?? 0);
      else
        (x.modifiers ??= []).push({
          sourceCardId: source.id,
          sourceName: source.name,
          attack: step.attack ?? 0,
          health: step.health ?? 0,
        });
    }
  }
  if (op === 'fatigue-payoff') {
    const n = ++p.fatigue;
    h.damage({ p: player }, n);
    if (step.mode === 'buff' && self) h.buff(self, n, n);
    if (step.mode === 'summon') h.run([{ op: 'summon-token', token: step.token, amount: n }]);
  }
  if (op === 'summon-sized') {
    const before = s.nextId;
    h.run([
      {
        op: step.mode === 'cost-hand' ? 'summon-pool' : 'summon-token',
        token: step.token,
        filter: { type: 'MINION', cost: p.hand.length },
        amount: 1,
      },
    ]);
    const fresh = p.board.find((u) => u.uid >= before);
    if (fresh && step.mode !== 'cost-hand') {
      const attack = step.mode === 'opposite' ? (self?.health ?? 0) : p.hand.length;
      const health = step.mode === 'opposite' ? (self?.attack ?? 0) : p.hand.length;
      fresh.attackBase = fresh.attack = attack;
      fresh.health = fresh.maxHealth = health;
      fresh.modifiers = [];
    }
  }
  if (op === 'held-damage' || op === 'hero-history-damage') {
    const extra =
      op === 'held-damage'
        ? source.heldTurn === s.turn
          ? 2
          : 0
        : (s.events ?? []).filter((e) => e.player === player && e.type === 'hero-attack').length;
    h.run([{ ...step, op: 'damage', amount: amount + extra }], target);
  }
  if (op === 'draw-linked') {
    const drawn: Card[] = [];
    let budget = 10;
    for (
      let i = 0;
      (i < amount || (step.mode === 'excess-discount' && budget > 0)) && p.health > 0;
      i++
    ) {
      let candidates = p.deck.filter((c) => h.matches(c, step.filter));
      if (step.order) {
        const cost = Math.max(...candidates.map((c) => c.cost));
        candidates = candidates.filter((c) => c.cost === cost);
      }
      const chosen = candidates[step.filter ? h.random(candidates.length) : 0];
      if (!chosen) {
        if (!step.filter) h.draw();
        break;
      }
      p.deck.splice(p.deck.indexOf(chosen), 1);
      let c = structuredClone(chosen);
      const drawnStats = cardStats(c),
        drawnCost = c.cost;
      if (step.mode === 'legendary') {
        const pool = h.catalog.filter(
          (c) => c.collectible && c.type === 'MINION' && c.rarity === 'LEGENDARY',
        );
        if (pool.length) {
          const fresh = structuredClone(pool[h.random(pool.length)]);
          fresh.printedCost ??= fresh.cost;
          fresh.cost = drawnCost;
          const stats = cardStats(fresh);
          fresh.modifiers = [
            {
              sourceCardId: source.id,
              sourceName: source.name,
              attack: drawnStats.attack - stats.attack,
              health: drawnStats.health - stats.health,
            },
          ];
          c = fresh;
        }
      }
      if (step.mode === 'excess-discount') {
        c.printedCost ??= c.cost;
        c.cost = Math.max(0, c.cost - budget);
        budget = Math.max(0, budget - drawnCost);
      }
      if (step.mode === 'holy-discount' && c.spellSchool === 'HOLY') {
        c.printedCost ??= c.cost;
        c.cost = Math.max(0, c.cost - 2);
      }
      if (step.mode === 'swap-cost-stats' && self) {
        const stat = i === 0 ? self.attack : self.health;
        if (i === 0) {
          self.attackBase = self.attack = c.cost;
          for (const m of self.modifiers ?? []) m.attack = 0;
        } else {
          self.health = self.maxHealth = c.cost;
          for (const m of self.modifiers ?? []) m.health = 0;
        }
        c.printedCost ??= c.cost;
        c.cost = stat;
      }
      if (step.mode === 'self-damage') h.damage({ p: player }, c.cost);
      if (step.mode === 'deathrattle' && self) {
        const effect = deathrattleFor(c);
        if (effect)
          (self.grantedDeathrattles ??= []).push({
            source: structuredClone(c),
            steps:
              effect.type === 'script'
                ? structuredClone(effect.steps)
                : [{ op: 'legacy-deathrattle', token: c.id }],
          });
      }
      if (step.mode === 'armor') {
        p.armor += c.cost;
        h.event('armor-change', c.cost);
      }
      if (step.mode === 'chicken' && c.type === 'MINION') {
        const chicken = h.catalog.find((c) => c.id === 'GVG_092t');
        if (!chicken) throw Error('Missing pinned Chicken token');
        c = structuredClone(chicken);
      }
      drawn.push(c);
      const enemies = s.players.flatMap((owner, i) =>
        i !== player && owner.health > 0 ? [i] : [],
      );
      const recipient =
        step.mode === 'give-spells' && c.type === 'SPELL' && enemies.length
          ? enemies[h.random(enemies.length)]
          : player;
      const before = s.players[recipient].hand.length;
      h.add(recipient, c);
      if (step.mode === 'temporary-copy')
        h.add(player, { ...structuredClone(c), temporaryUntilTurn: s.turn });
      if (step.mode === 'transform-board')
        h.run([
          {
            op: 'transform',
            scope: 'friendly',
            other: true,
            from: 'token',
            token: c.id,
            attack: drawnStats.attack,
            health: drawnStats.health,
          },
        ]);
      if (step.mode === 'left' && p.hand.length > before) p.hand.unshift(p.hand.pop()!);
      if (step.mode === 'gain-keyword')
        h.run([{ op: 'keyword', scope: 'self', keyword: step.keyword }]);
      if (step.mode === 'nature-elemental' && c.spellSchool === 'NATURE')
        h.run([{ op: 'draw', amount: 1, filter: { type: 'MINION', tribe: 'ELEMENTAL' } }]);
      if (step.mode === 'summon-cost')
        h.run([{ op: 'summon-pool', amount: 1, filter: { type: 'MINION', cost: c.cost } }]);
      if (step.mode === 'frost-shards' && c.spellSchool === 'FROST')
        h.run([{ op: 'summon-token', amount: 2, token: step.token }]);
      if (step.mode === 'non-minion-elemental' && c.type !== 'MINION')
        h.run([{ op: 'summon-token', amount: 1, token: step.token }]);
      if (
        step.mode === 'until-not-dragon' &&
        !(c.race === 'DRAGON' || c.races?.includes('DRAGON') || c.race === 'ALL')
      )
        break;
    }
    if (
      drawn.length === amount &&
      step.mode === 'minions-charge' &&
      drawn.every((c) => c.type === 'MINION')
    )
      h.run([{ op: 'keyword', scope: 'self', keyword: 'CHARGE' }]);
    if (
      drawn.length === amount &&
      step.mode === 'frost-damage' &&
      drawn.every((c) => c.spellSchool === 'FROST')
    )
      h.run([{ op: 'damage', scope: 'enemies', amount: 2 }]);
    h.note(`${source.name} resolves ${drawn.length} linked draws`);
  }
  if (op === 'battlefield-stats') {
    const units = s.players.flatMap((p) => p.board).filter((u) => u.health > 0);
    if (self) {
      self.attackBase = self.attack = Math.max(...units.map((u) => u.attack));
      self.maxHealth = self.health = Math.max(...units.map((u) => u.health));
      self.modifiers = [];
    }
  }
  if (op === 'shield-harvest') {
    let count = 0;
    for (const owner of s.players)
      for (const u of owner.board)
        if (u.shield) {
          count++;
          u.shield = false;
        }
    if (self) h.buff(self, (step.attack ?? 0) * count, (step.health ?? 0) * count);
    h.note(`${source.name} consumes ${count} Divine Shields`);
  }
  if (op === 'convert-health') {
    const n = Math.max(0, p.health - 1);
    p.health -= n;
    p.armor += n;
    h.event('health-change', -n);
    h.event('armor-change', n);
  }
  if (op === 'shuffle-hand-draw') {
    const count = p.hand.length;
    p.deck.push(...p.hand);
    p.hand = [];
    h.shuffle(p.deck);
    for (let i = 0; i < count && p.health > 0; i++) h.draw();
  }
  if (op === 'hand-to-deck') {
    const cost = (step.order === 'highest Cost' ? Math.max : Math.min)(
      ...p.hand.map((c) => c.cost),
    );
    const candidates = p.hand.filter((c) => c.cost === cost);
    if (candidates.length) {
      const c = candidates[h.random(candidates.length)];
      p.hand.splice(p.hand.indexOf(c), 1);
      if (step.destination === 'top') p.deck.unshift(c);
      else p.deck.splice(h.random(p.deck.length + 1), 0, c);
    }
  }
  if (op === 'deck-cost')
    for (const c of step.mode === 'top'
      ? p.deck.slice(0, step.until)
      : p.deck.slice(-(step.until ?? 0))) {
      c.printedCost ??= c.cost;
      c.cost = step.setCost!;
    }
  if (op === 'zone-stats') {
    for (const c of p[step.zone as 'hand' | 'deck'])
      if (h.matches(c, step.filter)) {
        const stats = cardStats(c),
          high = Math.max(stats.attack, stats.health);
        (c.modifiers ??= []).push({
          sourceCardId: source.id,
          sourceName: source.name,
          attack:
            (step.mode === 'higher'
              ? high
              : step.mode === 'inner-fire'
                ? stats.health
                : step.attack!) - stats.attack,
          health:
            (step.mode === 'higher'
              ? high
              : step.mode === 'inner-fire'
                ? stats.health
                : step.health!) - stats.health,
        });
      }
  }
  if (op === 'board-shots') {
    for (const u of [...p.board])
      if (u.health > 0 && u.attack > 0) {
        const ts = h.targets({ op: 'damage', scope: 'enemies', random: 1 });
        if (ts[0]) h.damage(ts[0], u.attack, u);
      }
  }
  if (op === 'random-keyword')
    for (const t of h.targets(step)) {
      const u = h.get(t);
      if (!('card' in u)) continue;
      const keys = (step.pool ?? []).filter((k) => !h.keys(u).includes(k));
      if (keys.length)
        h.run(
          [
            {
              op: 'keyword',
              scope: 'target',
              target: 'minion',
              keyword: keys[h.random(keys.length)],
            },
          ],
          t,
        );
    }
  if (op === 'overheal-buff') {
    let count = 0;
    for (const u of p.board.filter((u) => u.uid !== sourceUid && u.health > 0)) {
      if (u.health + amount + h.healingBonus > u.maxHealth) count++;
      h.heal(u, amount);
    }
    if (self) h.buff(self, count, count);
  }
  if (op === 'eat-hand')
    for (const [i, owner] of s.players.entries())
      if (i !== player && owner.health > 0) {
        const cards = owner.hand.filter((c) => c.type === 'MINION');
        if (!cards.length) continue;
        const c = cards[h.random(cards.length)];
        owner.hand.splice(owner.hand.indexOf(c), 1);
        owner.grave.push(c);
        if (self) {
          const stats = cardStats(c);
          h.buff(self, stats.attack, stats.health);
        }
        h.note(`${source.name} eats ${owner.name}'s ${c.name}`);
      }
  if (op === 'tribe-damage' || op === 'destroy-copies') {
    const chosen = target ? h.get(target) : undefined;
    if (chosen && 'card' in chosen) {
      const tribes = chosen.card.races ?? (chosen.card.race ? [chosen.card.race] : []);
      for (const t of h.targets({ scope: 'all', op })) {
        const u = h.get(t) as Unit;
        const same =
          op === 'destroy-copies'
            ? u.card.name === chosen.card.name
            : u.uid === chosen.uid ||
              (tribes.length > 0 &&
                (tribes.includes('ALL') || tribes.some((r) => h.matches(u.card, { tribe: r }, u))));
        if (same) {
          if (op === 'destroy-copies') u.health = 0;
          else h.damage(t, amount);
        }
      }
      if (op === 'destroy-copies')
        for (const owner of s.players)
          for (const zone of ['hand', 'deck'] as const)
            owner[zone] = owner[zone].filter((c) => c.name !== chosen.card.name);
    }
  }
  if (op === 'source-stats' && self)
    for (const t of h.targets(step)) {
      const u = h.get(t);
      if ('card' in u) h.buff(u, self.attack, self.health);
    }
  if (op === 'freeze-or-damage')
    for (const t of h.targets(step)) {
      if (h.get(t).frozen) h.damage(t, amount);
      else h.run([{ op: 'freeze', scope: 'target', target: 'minion' }], t);
    }
  if (op === 'reborn-or-copy')
    for (const t of h.targets(step)) {
      const u = h.get(t);
      if ('card' in u)
        h.run(
          [
            {
              op: h.keys(u).includes('REBORN') ? 'summon-copy' : 'keyword',
              scope: 'target',
              target: 'friendly-minion',
              keyword: 'REBORN',
            },
          ],
          t,
        );
    }
  h.note(`${source.name} resolves ${op}`);
  return true;
}
