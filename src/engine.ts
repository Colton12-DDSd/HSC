import { cardMechanics } from './cards';
import { cardCost, cardStats, freezesOnDamage, type Card, type StatModifier } from './cards';
import { foundationOperations, resolveFoundation } from './foundation-effects';
import catalogData from './generated/catalog.json';
import generatedHashes from '../data/battlecry-generated-hashes.json';
export const catalogVersion = generatedHashes['src/generated/catalog.json'];
import type { CardFilter, ScriptCondition, ScriptStep, ScriptValue } from './script-types';
export type Target = { p: number; uid?: number };
import {
  effectFor,
  supported,
  battlecryFor,
  deathrattleFor,
  targetFor,
  scriptTarget,
  battlecries,
  deathrattles,
  expandedBattlecries,
  type Effect,
} from './effects';
export { effectFor, supported } from './effects';
export interface Unit {
  immune?: boolean;
  commanderOwner?: number;
  grantedDeathrattles?: { source: Card; steps: ScriptStep[] }[];
  immuneUntilTurn?: number;
  stealth?: boolean;
  rebornUsed?: boolean;
  silenced?: boolean;
  keywords?: string[];
  keywordSources?: {
    keyword: string;
    sourceCardId: string;
    sourceName: string;
    expiresAtTurn?: number;
  }[];
  temporaryKeywords?: { keyword: string; turn: number }[];
  frozen?: boolean;
  freezeSkipEnd?: boolean;
  summonedTurn?: number;
  playedCost?: number;
  attackBase?: number;
  // Optional so older exported scenarios remain readable. These buffs end on leaving play.
  modifiers?: StatModifier[];
  attacksRemaining: number;
  uid: number;
  card: Card;
  attack: number;
  health: number;
  maxHealth: number;
  ready: boolean;
  rushOnly: boolean;
  shield: boolean;
  commander: boolean;
}
export interface Player {
  shield?: boolean;
  maxHandSize?: number;
  playEffects?: { source: Card; filter: CardFilter; remaining: number; steps: ScriptStep[] }[];
  overload?: number;
  lockedMana?: number;
  nextDiscounts?: { filter: CardFilter; amount: number; source: string }[];
  endEffects?: { source: Card; steps: ScriptStep[]; once: boolean; sourceUid?: number }[];
  summonEffects?: {
    source: Card;
    filter: CardFilter;
    attack?: number;
    health?: number;
    set?: number;
  }[];
  weapon?: { card: Card; attack: number; durability: number };
  secrets?: Card[];
  immuneUntilTurn?: number;
  frozen?: boolean;
  freezeSkipEnd?: boolean;
  // Game-wide effects survive their source minion leaving play; optional for old replays.
  effects?: { kind: 'healing-bonus'; amount: number; sourceCardId: string; sourceName: string }[];
  name: string;
  class: string;
  health: number;
  armor: number;
  mana: number;
  maxMana: number;
  reserve: number;
  fatigue: number;
  hand: Card[];
  deck: Card[];
  board: Unit[];
  grave: Card[];
  commander: Card;
  zone: 'command' | 'board' | 'hand' | 'grave';
  casts: number;
  reduction: number;
  handReduction: number;
  powerUsed: boolean;
  heroAttack: number;
  heroReady: boolean;
  replacement: boolean;
}
export interface Pending {
  cost?: number;
  caster: number;
  card: Card;
  command: boolean;
  commander: boolean;
  queue: number[];
  target?: Target;
  position?: number;
}
export interface Game {
  testPreset?: { id: string; name: string; objectives: string[]; guided: boolean };
  catalogVersion?: string;
  events?: {
    type: string;
    player: number;
    turn: number;
    card?: Card;
    amount?: number;
    targetUid?: number;
    healthDamage?: number;
    armorDamage?: number;
    blocked?: boolean;
  }[];
  choice?: {
    player: number;
    options: Card[];
    step: ScriptStep;
    remaining: ScriptStep[];
    source: Card;
    sourceUid?: number;
    target?: Target;
    position: number;
  };
  starterSandbox?: boolean;
  version: 1;
  seed: number;
  active: number;
  turn: number;
  nextId: number;
  players: Player[];
  pending: Pending | null;
  winner: number | null;
  log: string[];
}
export type Action =
  | { type: 'choose'; p: number; index: number }
  | {
      type: 'cast';
      p: number;
      index?: number;
      command?: boolean;
      target?: Target;
      position?: number;
    }
  | { type: 'pass' | 'interrupt'; p: number }
  | { type: 'end'; p: number }
  | { type: 'attack'; p: number; uid?: number; target: Target }
  | { type: 'power'; p: number; target?: Target }
  | { type: 'commander-destination'; p: number; destination: 'hand' | 'command' | 'grave' };
export type DebugAction =
  | {
      type: 'edit';
      p: number;
      field: 'health' | 'mana' | 'reserve' | 'casts' | 'reduction' | 'handReduction';
      value: number;
    }
  | { type: 'add' | 'summon'; p: number; card: Card }
  | { type: 'advance' };
const note = (s: Game, t: string) => {
  s.log.push(`T${s.turn} · ${t}`);
};
const catalog = catalogData as unknown as Card[];
function event(s: Game, player: number, type: string, amount?: number, card?: Card) {
  (s.events ??= []).push({
    type,
    player,
    turn: s.turn,
    ...(amount !== undefined ? { amount } : {}),
    ...(card ? { card: printedCard(card) } : {}),
  });
}
function destroyWeapon(s: Game, player: number) {
  const owner = s.players[player];
  if (!owner.weapon) return;
  const card = printedCard(owner.weapon.card);
  owner.grave.push(card);
  event(s, player, 'weapon-destroyed', undefined, card);
  delete owner.weapon;
}
export const unitMechanics = (u: Unit) =>
  [
    ...new Set([
      ...(u.silenced ? [] : cardMechanics(u.card)),
      ...(u.keywords ?? []),
      ...(u.temporaryKeywords ?? []).map((k) => k.keyword),
      ...(u.grantedDeathrattles?.length ? ['DEATHRATTLE'] : []),
    ]),
  ]
    .filter((k) => k !== 'STEALTH' || u.stealth !== false)
    .filter((k) => k !== 'REBORN' || !u.rebornUsed)
    .filter((k) => k !== 'DIVINE_SHIELD' || u.shield);
function matchesCard(c: Card, f: CardFilter = {}, player?: Player, unit?: Unit): boolean {
  const keys = unit ? unitMechanics(unit) : cardMechanics(c);
  const attack = unit?.attack ?? cardStats(c).attack;
  return (
    (!f.type || c.type === f.type) &&
    (!f.hasTribe || !!c.race || !!c.races?.length) &&
    (!f.notName || c.name !== f.notName) &&
    (!f.nameSuffix || c.name.endsWith(f.nameSuffix)) &&
    (!f.notClass || !(c.classes ?? [c.cardClass]).includes(f.notClass)) &&
    (!f.any || f.any.some((part) => matchesCard(c, part, player, unit))) &&
    (!f.notTribe ||
      !(c.race === f.notTribe || c.races?.includes(f.notTribe) || c.race === 'ALL')) &&
    (f.health === undefined || (unit?.health ?? c.health) === f.health) &&
    (f.minHealth === undefined || (unit?.health ?? cardStats(c).health) >= f.minHealth) &&
    (!f.frozen || !!unit?.frozen) &&
    (!f.tribe || c.race === f.tribe || c.races?.includes(f.tribe) || c.race === 'ALL') &&
    (!f.keyword || keys.includes(f.keyword)) &&
    (f.cost === undefined || c.cost === f.cost) &&
    (f.minCost === undefined || c.cost >= f.minCost) &&
    (f.maxCost === undefined || c.cost <= f.maxCost) &&
    (f.attack === undefined || attack === f.attack) &&
    (f.minAttack === undefined || attack >= f.minAttack) &&
    (f.maxAttack === undefined || attack <= f.maxAttack) &&
    (!f.rarity || c.rarity === f.rarity) &&
    (!f.school || c.spellSchool === f.school) &&
    (!f.classes || (c.classes ?? [c.cardClass]).some((x) => f.classes!.includes(x))) &&
    (!f.ownClass || (c.classes ?? [c.cardClass]).includes(player!.class)) &&
    (!f.otherClass ||
      (!(c.classes ?? [c.cardClass]).includes(player!.class) &&
        (c.classes ?? [c.cardClass]).some((x) => x !== 'NEUTRAL'))) &&
    (!f.damaged || (!!unit && unit.health < unit.maxHealth)) &&
    (!f.undamaged || (!!unit && unit.health === unit.maxHealth)) &&
    (!f.name || c.name === f.name)
  );
}
function scriptCount(
  s: Game,
  player: number,
  zone: string,
  filter?: CardFilter,
  sourceUid?: number,
): number {
  const p = s.players[player];
  if (zone === 'friendly-deaths')
    return (s.events ?? []).filter((e) => e.type === 'death' && e.player === player).length;
  if (zone === 'spell-schools-played')
    return new Set(
      (s.events ?? [])
        .filter(
          (e) =>
            e.type === 'play' &&
            e.player === player &&
            e.card?.type === 'SPELL' &&
            e.card.spellSchool,
        )
        .map((e) => e.card!.spellSchool),
    ).size;
  if (zone === 'enemy-frozen')
    return s.players.reduce(
      (n, owner, i) =>
        n +
        (i !== player && owner.health > 0
          ? Number(!!owner.frozen) + owner.board.filter((u) => u.frozen).length
          : 0),
      0,
    );
  if (zone === 'friendly-including-self')
    return p.board.filter((u) => u.health > 0 && matchesCard(u.card, filter, p, u)).length;
  if (zone === 'friendly' && filter?.keyword === 'SECRET')
    return (p.secrets ?? []).filter((c) => matchesCard(c, filter, p)).length;
  if (zone.startsWith('played') || zone.endsWith('this-turn')) {
    const events = s.events ?? [],
      source = p.board.find((u) => u.uid === sourceUid)?.card;
    const previousTurn =
      events.filter((e) => e.type === 'turn' && e.player === player && e.turn < s.turn).at(-1)
        ?.turn ??
      events.filter((e) => e.type === 'play' && e.player === player && e.turn < s.turn).at(-1)
        ?.turn;
    return events.reduce((n, e, i) => {
      const current = e.turn === s.turn;
      if (e.player !== player && zone !== 'died-this-turn') return n;
      if (
        zone.startsWith('played') &&
        (e.type !== 'play' ||
          !e.card ||
          !matchesCard(e.card, filter, p) ||
          (zone === 'played-last-turn' && e.turn !== previousTurn) ||
          (zone === 'played-this-turn' && !current) ||
          (zone === 'played-while-held' && i < (source?.heldSince ?? 0)))
      )
        return n;
      if (
        !zone.startsWith('played') &&
        (!current ||
          !(
            {
              'power-this-turn': 'power',
              'hero-damage-this-turn': 'hero-damage',
              'hero-attack-this-turn': 'hero-attack',
              'healed-this-turn': 'heal',
              'health-changed-this-turn': 'health-change',
              'armor-changed-this-turn': 'armor-change',
              'died-this-turn': 'death',
            } as Record<string, string>
          )[zone] ||
          e.type !==
            (
              {
                'power-this-turn': 'power',
                'hero-damage-this-turn': 'hero-damage',
                'hero-attack-this-turn': 'hero-attack',
                'healed-this-turn': 'heal',
                'health-changed-this-turn': 'health-change',
                'armor-changed-this-turn': 'armor-change',
                'died-this-turn': 'death',
              } as Record<string, string>
            )[zone])
      )
        return n;
      return (
        n + (zone === 'hero-damage-this-turn' || zone === 'healed-this-turn' ? (e.amount ?? 1) : 1)
      );
    }, 0);
  }
  if (zone === 'hand' || zone === 'deck')
    return p[zone].filter((c) => matchesCard(c, filter, p)).length;
  if (zone === 'enemy-hand')
    return s.players.reduce((n, p, i) => n + (i !== player && p.health > 0 ? p.hand.length : 0), 0);
  return s.players.reduce(
    (n, p, i) =>
      n +
      (p.health > 0 &&
      (zone === 'all' ||
        (zone === 'friendly' && i === player) ||
        (zone === 'enemy' && i !== player))
        ? p.board.filter(
            (u) =>
              u.uid !== sourceUid &&
              u.health > 0 &&
              matchesCard(u.card, filter, s.players[player], u),
          ).length
        : 0),
    0,
  );
}
function scriptNumber(
  s: Game,
  player: number,
  value: ScriptValue | undefined,
  sourceUid?: number,
): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  if (value.count) return scriptCount(s, player, value.count, value.filter, sourceUid);
  const p = s.players[player],
    u = p.board.find((u) => u.uid === sourceUid);
  return value.stat === 'attack'
    ? (u?.attack ?? 0)
    : value.stat === 'health'
      ? (u?.health ?? 0)
      : value.stat === 'armor'
        ? p.armor
        : value.stat === 'hero-attack'
          ? p.heroAttack + (p.weapon?.attack ?? 0)
          : value.stat === 'weapon-attack'
            ? (p.weapon?.attack ?? 0)
            : 0;
}
function scriptCondition(s: Game, player: number, c: ScriptCondition, sourceUid?: number) {
  const p = s.players[player];
  if (c.special === 'no-duplicates')
    return new Set(p.deck.map((c) => c.name)).size === p.deck.length;
  if (c.special === 'odd-deck' || c.special === 'even-deck')
    return p.deck.every((x) => x.cost % 2 === (c.special === 'odd-deck' ? 1 : 0));
  if (c.special === 'last-cost-one')
    return (
      (s.events ?? [])
        .filter((e) => e.player === player && e.type === 'play')
        .slice(0, -1)
        .at(-1)?.card?.cost === 1
    );
  if (c.special === 'any-hero-damage')
    return (s.events ?? []).some((e) => e.turn === s.turn && e.type === 'hero-damage');
  if (c.special === 'combined-health-42')
    return s.players.filter((p) => p.health > 0).reduce((n, p) => n + p.health, 0) === 42;
  if (c.special === 'source-more-expensive')
    return p.deck
      .filter((c) => c.type === 'MINION')
      .every((c) => c.cost < (p.board.find((u) => u.uid === sourceUid)?.playedCost ?? 0));
  if (c.stat === 'source-attack')
    return (p.board.find((u) => u.uid === sourceUid)?.attack ?? 0) >= (c.min ?? 0);
  if (c.stat === 'source-cost')
    return (p.board.find((u) => u.uid === sourceUid)?.playedCost ?? Infinity) <= (c.max ?? 0);
  if (c.stat === 'overload') return (p.overload ?? 0) + (p.lockedMana ?? 0) >= (c.min ?? 0);
  if (c.stat === 'weapon-attack')
    return (
      !!p.weapon &&
      (c.min === undefined || p.weapon.attack >= c.min) &&
      (c.max === undefined || p.weapon.attack <= c.max)
    );
  if (c.stat === 'remaining-mana')
    return (c.max === undefined || p.mana <= c.max) && (c.min === undefined || p.mana >= c.min);
  const n = c.stat
    ? c.stat === 'enemy-health'
      ? Math.min(...s.players.filter((x, i) => i !== player && x.health > 0).map((x) => x.health))
      : c.stat === 'health'
        ? p.health
        : c.stat === 'armor'
          ? p.armor
          : c.stat === 'weapon'
            ? Number(!!p.weapon)
            : p.maxMana
    : scriptCount(s, player, c.zone!, c.filter, sourceUid);
  return (c.min === undefined || n >= c.min) && (c.max === undefined || n <= c.max);
}
function scriptTargets(
  s: Game,
  player: number,
  step: ScriptStep,
  target?: Target,
  sourceUid?: number,
  position = 0,
): Target[] {
  let ts: Target[] = [];
  const scope = step.scope;
  if ((scope === 'target' && !target) || (scope === 'self' && sourceUid === undefined)) return [];
  if (scope === 'target' && target) ts = [target];
  else if (scope === 'self' && sourceUid !== undefined) ts = [{ p: player, uid: sourceUid }];
  else if (scope === 'hero') ts = [{ p: player }];
  else if (scope === 'adjacent') {
    const b = s.players[player].board,
      i = b.findIndex((u) => u.uid === sourceUid);
    if (sourceUid === undefined)
      ts = [b[position - 1], b[position]].filter(Boolean).map((u) => ({ p: player, uid: u.uid }));
    else if (i >= 0)
      ts = b.filter((_, j) => Math.abs(j - i) === 1).map((u) => ({ p: player, uid: u.uid }));
  } else
    for (const [i, p] of s.players.entries()) {
      if (p.health <= 0) continue;
      if (['friendly', 'friendly-characters'].includes(scope ?? '') && i !== player) continue;
      if (['enemy', 'enemies', 'enemy-heroes'].includes(scope ?? '') && i === player) continue;
      if (
        ['heroes', 'hero', 'enemy-heroes', 'enemies', 'characters', 'friendly-characters'].includes(
          scope ?? '',
        )
      )
        ts.push({ p: i });
      if (!['heroes', 'hero', 'enemy-heroes'].includes(scope ?? ''))
        ts.push(...p.board.map((u) => ({ p: i, uid: u.uid })));
    }
  if (['characters', 'enemies', 'friendly-characters'].includes(scope ?? ''))
    ts.sort((a, b) => a.p - b.p || Number(a.uid === undefined) - Number(b.uid === undefined));
  ts = ts.filter((t) => {
    try {
      const x = getTarget(s, t);
      return (
        x.health > 0 &&
        (!step.other || t.uid !== sourceUid) &&
        (!step.filter || ('card' in x && matchesCard(x.card, step.filter, s.players[player], x)))
      );
    } catch {
      return false;
    }
  });
  if (step.random) {
    const chosen: Target[] = [];
    while (ts.length && chosen.length < step.random)
      chosen.push(...ts.splice(random(s, ts.length), 1));
    return chosen;
  }
  return ts;
}
function addGenerated(s: Game, player: number, c: Card) {
  const p = s.players[player],
    copy = { ...structuredClone(c), heldSince: s.events?.length ?? 0, heldTurn: s.turn };
  if (p.hand.length < (p.maxHandSize ?? 10)) p.hand.push(copy);
  else {
    p.grave.push(printedCard(copy));
    note(s, `${p.name} burns ${c.name}`);
  }
}
function scriptPool(s: Game, player: number, step: ScriptStep): Card[] {
  const p = s.players[player],
    f = step.filter ?? {};
  if (step.zone === 'hand') return p.hand.filter((c) => matchesCard(c, f, p));
  const pool = step.pool
    ? catalog.filter((c) => step.pool!.includes(c.id))
    : step.zone === 'hand'
      ? p.hand
      : step.zone === 'deck'
        ? p.deck
        : step.zone === 'enemy-deck'
          ? s.players.flatMap((owner, i) =>
              i !== player && (step.owner === undefined || step.owner === i) && owner.health > 0
                ? owner.deck
                : [],
            )
          : catalog.filter(
              (c) =>
                c.collectible && ['MINION', 'SPELL', 'WEAPON', 'LOCATION', 'HERO'].includes(c.type),
            );
  return [
    ...new Map(
      pool
        .filter(
          (c) =>
            matchesCard(c, f, p) &&
            (step.zone === 'deck' ||
              step.zone === 'hand' ||
              step.zone === 'enemy-deck' ||
              step.op !== 'discover' ||
              f.anyClass ||
              f.otherClass ||
              f.classes ||
              (c.classes ?? [c.cardClass]).includes('NEUTRAL') ||
              (c.classes ?? [c.cardClass]).includes(p.class)),
        )
        .map((c) => [c.name, c]),
    ).values(),
  ];
}
function random(s: Game, n: number) {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed % n;
}
function shuffle(s: Game, a: Card[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = random(s, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function draw(s: Game, p: number) {
  const x = s.players[p],
    c = x.deck.shift();
  if (c) {
    if (x.hand.length < (x.maxHandSize ?? 10))
      x.hand.push({ ...c, heldSince: s.events?.length ?? 0, heldTurn: s.turn });
    else {
      x.grave.push(printedCard(c));
      note(s, `${x.name} burns ${c.name}`);
    }
  } else {
    damage(s, { p }, ++x.fatigue);
    note(s, `${x.name} takes ${x.fatigue} fatigue`);
  }
}
export function commandCost(p: Player) {
  return Math.max(
    0,
    Math.max(1, p.commander.cost + 2 * p.casts - p.reduction - p.handReduction) -
      nextDiscount(p, p.commander),
  );
}
function nextDiscount(p: Player, c: Card) {
  return (p.nextDiscounts ?? [])
    .filter((d) => matchesCard(c, d.filter, p))
    .reduce((n, d) => n + d.amount, 0);
}
export function handCost(p: Player, c: Card) {
  return Math.max(0, cardCost(c) - p.reduction - p.handReduction - nextDiscount(p, c));
}
function getTarget(s: Game, t: Target) {
  if (!Number.isInteger(t.p) || !s.players[t.p] || s.players[t.p].health <= 0)
    throw Error('Invalid target');
  if (t.uid !== undefined) {
    const u = s.players[t.p].board.find((u) => u.uid === t.uid);
    if (!u) throw Error('Target minion missing');
    return u;
  }
  return s.players[t.p];
}
/** Target-independent readiness, shared by combat and the board's status indicators. */
export function attackReadinessError(
  s: Game,
  player: number,
  uid: number | undefined,
): string | null {
  if (s.winner !== null) return 'Match is over';
  const p = s.players[player];
  if (!p || p.health <= 0) return 'Player is eliminated';
  if (s.choice) return 'Finish the card choice first';
  if (s.pending) return 'Finish interruption priority first';
  if (s.active !== player) return 'Not your turn';
  const unit = uid === undefined ? null : p.board.find((u) => u.uid === uid);
  if (uid !== undefined && !unit) return 'Attacker is no longer on the board';
  if (unit ? unit.frozen : p.frozen) return 'Frozen';
  if ((unit?.attack ?? p.heroAttack + (p.weapon?.attack ?? 0)) <= 0)
    return 'This character has no attack';
  if (unit ? !unit.ready : !p.heroReady)
    return unit && unit.attacksRemaining > 0 ? 'Summoning sickness' : 'No attacks left this turn';
  return null;
}
/** Shared by the authoritative transition and target highlighting in the UI. */
export function attackError(
  s: Game,
  player: number,
  uid: number | undefined,
  target: Target,
): string | null {
  const readiness = attackReadinessError(s, player, uid);
  if (readiness) return readiness;
  const p = s.players[player];
  const unit = uid === undefined ? null : p.board.find((u) => u.uid === uid);
  if (target.p === player) return 'Cannot attack a friendly character';
  let defender;
  try {
    defender = getTarget(s, target);
  } catch {
    return 'Target is no longer available';
  }
  if (
    'card' in defender &&
    unitMechanics(defender).includes('STEALTH') &&
    defender.stealth !== false
  )
    return 'Target has Stealth';
  if (
    ('immune' in defender && defender.immune) ||
    (defender.immuneUntilTurn !== undefined && defender.immuneUntilTurn >= s.turn)
  )
    return 'Target is Immune';
  if (unit?.rushOnly && target.uid === undefined) return 'Rush can only attack minions this turn';
  if (
    s.players[target.p].board.some(
      (u) =>
        unitMechanics(u).includes('TAUNT') &&
        !unitMechanics(u).includes('STEALTH') &&
        !u.immune &&
        !(u.immuneUntilTurn !== undefined && u.immuneUntilTurn >= s.turn),
    ) &&
    (!('card' in defender) || !unitMechanics(defender).includes('TAUNT'))
  )
    return `${s.players[target.p].name} has Taunt: attack one of their Taunt minions first`;
  return null;
}
/** Heroes may grow above their starting 40; minions heal only to their current maximum. */
export function healingBonus(player: Player) {
  return (player.effects ?? []).reduce(
    (total, effect) => total + (effect.kind === 'healing-bonus' ? effect.amount : 0),
    0,
  );
}
function heal(target: Player | Unit, amount: number, controller?: Player, state?: Game) {
  // Absorbed/zero damage must never manufacture a Lifesteal heal.
  if (amount > 0 && controller) amount += healingBonus(controller);
  const before = target.health;
  target.health =
    'maxHealth' in target
      ? Math.min(target.maxHealth, target.health + amount)
      : target.health + amount;
  const restored = target.health - before;
  if (state && controller && restored > 0) {
    const owner = state.players.indexOf(controller);
    event(state, owner, 'heal', restored);
    if (!('card' in target)) event(state, state.players.indexOf(target), 'health-change', restored);
  }
  return restored;
}
function damage(s: Game, t: Target, n: number) {
  const x = getTarget(s, t);
  const dealt = n;
  if (
    ('immune' in x && x.immune) ||
    (x.immuneUntilTurn !== undefined && x.immuneUntilTurn >= s.turn)
  )
    return 0;
  if ('shield' in x && x.shield && n > 0) {
    x.shield = false;
    (s.events ??= []).push({
      type: 'damage',
      player: t.p,
      turn: s.turn,
      targetUid: t.uid,
      amount: 0,
      healthDamage: 0,
      armorDamage: 0,
      blocked: true,
    });
    return 0;
  }
  let armorDamage = 0;
  if ('armor' in x) {
    const absorbed = Math.min(x.armor, n);
    armorDamage = absorbed;
    x.armor -= absorbed;
    n -= absorbed;
  }
  if (!('card' in x)) {
    if (dealt > 0) event(s, t.p, 'hero-damage', dealt);
    if (n > 0) event(s, t.p, 'health-change', -n);
    if (dealt !== n) event(s, t.p, 'armor-change', -(dealt - n));
  }
  const healthDamage = Math.max(0, Math.min(x.health, n));
  x.health -= n;
  if (dealt > 0)
    (s.events ??= []).push({
      type: 'damage',
      player: t.p,
      turn: s.turn,
      targetUid: t.uid,
      amount: dealt,
      healthDamage,
      armorDamage,
    });
  return dealt;
}
/** Remove deaths in batches; queue their effects by summon ID (global order of play).
 * New deaths join the tail, so an already queued batch finishes before chained effects. */
function settle(s: Game) {
  const queue: { player: number; unit: Unit; layout: number[] }[] = [];
  while (true) {
    for (const p of s.players)
      if (p.health <= 0) {
        p.board = [];
        p.reserve = 0;
      }
    const alive = s.players.map((p, i) => (p.health > 0 ? i : -1)).filter((i) => i >= 0);
    if (alive.length <= 1) {
      s.winner = alive[0] ?? -1;
      s.pending = null;
      note(s, alive.length ? `${s.players[alive[0]].name} wins` : 'Draw');
      return;
    }
    const deaths: typeof queue = [];
    s.players.forEach((p, player) => {
      const layout = p.board.map((u) => u.uid);
      for (const unit of p.board) if (unit.health <= 0) deaths.push({ player, unit, layout });
      p.board = p.board.filter((u) => u.health > 0);
    });
    deaths.sort((a, b) => a.unit.uid - b.unit.uid);
    for (const entry of deaths) {
      const p = s.players[entry.player],
        u = entry.unit;
      note(s, `${p.name}'s ${u.card.name} dies`);
      if (u.commander) {
        const owner = s.players[u.commanderOwner ?? entry.player];
        owner.zone = 'command';
        owner.replacement = true;
        note(s, `${u.card.name} returns to command zone (default replacement)`);
      } else p.grave.push(u.card);
      event(s, entry.player, 'death', undefined, u.card);
      if (
        !u.silenced &&
        (deathrattleFor(u.card) ||
          u.grantedDeathrattles?.length ||
          (unitMechanics(u).includes('REBORN') && !u.rebornUsed))
      )
        queue.push(entry);
    }
    const next = queue.shift();
    if (!next) return;
    if (s.players[next.player].health <= 0) continue;
    const { player, unit, layout } = next;
    // Retain death slots while processing a batch, including tokens from earlier deaths.
    const marker = layout.indexOf(unit.uid);
    const right = new Set(layout.slice(marker + 1));
    const board = s.players[player].board;
    const rightIndex = board.findIndex((u) => right.has(u.uid));
    const position = rightIndex < 0 ? board.length : rightIndex;
    if (deathrattleFor(unit.card))
      note(s, `${s.players[player].name}'s ${unit.card.name} triggers Deathrattle`);
    const before = s.nextId;
    if (deathrattleFor(unit.card))
      runEffect(s, player, deathrattleFor(unit.card)!, undefined, position, {
        ...unit.card,
        mechanics: unitMechanics(unit),
      });
    for (const grant of unit.grantedDeathrattles ?? []) {
      note(s, `${unit.card.name} triggers Deathrattle granted by ${grant.source.name}`);
      runScript(s, player, grant.steps, undefined, position, {
        ...grant.source,
        mechanics: unitMechanics(unit),
      });
    }
    if (
      unitMechanics(unit).includes('REBORN') &&
      !unit.rebornUsed &&
      board.length < 7 &&
      s.players[player].health > 0
    ) {
      const uid = summon(s, player, unit.card, false, Math.min(position, board.length));
      const reborn = board.find((u) => u.uid === uid)!;
      reborn.health = 1;
      reborn.rebornUsed = true;
      note(s, `${unit.card.name} returns with Reborn at 1 Health`);
    }
    const summoned = board.filter((u) => u.uid >= before).map((u) => u.uid);
    layout.splice(marker, 0, ...summoned);
  }
}
function printedCard(c: Card): Card {
  const {
    modifiers: _modifiers,
    printedCost,
    temporaryCosts: _temporaryCosts,
    temporaryUntilTurn: _temporaryUntilTurn,
    ...printed
  } = c;
  return { ...printed, cost: printedCost ?? c.cost };
}
function summon(
  s: Game,
  p: number,
  c: Card,
  commander = false,
  position = s.players[p].board.length,
) {
  c = { ...c, mechanics: cardMechanics(c) };
  const x = s.players[p];
  if (x.board.length >= 7) throw Error('Battlefield is full');
  x.board.splice(position, 0, {
    uid: s.nextId++,
    summonedTurn: s.turn,
    stealth: !!c.mechanics?.includes('STEALTH'),
    card: printedCard(c),
    attackBase: c.attack ?? 0,
    attack: cardStats(c).attack,
    health: cardStats(c).health,
    maxHealth: cardStats(c).health,
    ready: !!c.mechanics?.some((m) => m === 'CHARGE' || m === 'RUSH'),
    rushOnly: !!c.mechanics?.includes('RUSH') && !c.mechanics?.includes('CHARGE'),
    shield: !!c.mechanics?.includes('DIVINE_SHIELD'),
    commander,
    ...(commander ? { commanderOwner: p } : {}),
    attacksRemaining: c.mechanics?.includes('WINDFURY') ? 2 : 1,
    modifiers: structuredClone(c.modifiers ?? []),
  });
  if (commander) x.zone = 'board';
  const unit = x.board[position];
  for (const e of x.summonEffects ?? [])
    if (matchesCard(c, e.filter, x, unit)) {
      if (e.set !== undefined) {
        unit.attackBase = unit.attack = e.set;
        unit.health = unit.maxHealth = e.set;
        unit.modifiers = [];
      } else
        applyStatModifier(s, unit, p, { attack: e.attack ?? 0, health: e.health ?? 0 }, e.source);
    }
  note(s, `${x.name} summons ${c.name} at position ${position + 1}`);
  return x.board[position].uid;
}
export function effectTargets(s: Game, player: number, card: Card): Target[] {
  const activeEffect = targetingEffect(s, player, card);
  const rule = targetFor(activeEffect);
  if (!rule) return [];
  const effect = activeEffect,
    selector = effect?.type === 'script' ? scriptTarget(effect.steps) : undefined;
  // This selector depends on the entering minion's stats. Preview queued play
  // buffs on a clone so target highlighting never consumes those effects or RNG.
  let sourceAttack = cardStats(card).attack;
  if (selector?.op === 'attack-threshold-destroy' && s.players[player].board.length < 7) {
    const preview = structuredClone(s),
      owner = preview.players[player];
    const index = owner.hand.findIndex((c) => c.id === card.id);
    if (index >= 0) owner.hand.splice(index, 1);
    owner.mana -= handCost(owner, card);
    const uid = summon(preview, player, card);
    event(preview, player, 'play', undefined, card);
    for (const q of owner.playEffects ?? [])
      if (q.remaining > 0 && matchesCard(card, q.filter, owner))
        runScript(preview, player, q.steps, { p: player, uid }, owner.board.length, q.source, uid);
    sourceAttack = owner.board.find((u) => u.uid === uid)?.attack ?? sourceAttack;
  }
  return s.players
    .flatMap((p, index) =>
      p.health <= 0
        ? []
        : [
            ...(rule === 'minion' ||
            rule === 'enemy-minion' ||
            rule === 'friendly-minion' ||
            (['enemy-hero', 'enemy-character'].includes(rule) && index === player)
              ? []
              : [{ p: index }]),
            ...(rule === 'enemy-hero' ||
            (['enemy-minion', 'enemy-character'].includes(rule) && index === player) ||
            (rule === 'friendly-minion' && index !== player)
              ? []
              : p.board.filter((u) => u.health > 0).map((u) => ({ p: index, uid: u.uid }))),
          ],
    )
    .filter((t) => {
      const chosen = getTarget(s, t);
      if (
        t.p !== player &&
        'card' in chosen &&
        (chosen.immune ||
          unitMechanics(chosen).includes('STEALTH') ||
          (chosen.immuneUntilTurn !== undefined && chosen.immuneUntilTurn >= s.turn))
      )
        return false;
      if (selector?.filterHeroes && 'uid' in t && t.uid !== undefined) return false;
      if (['enemy-minion', 'enemy-character'].includes(rule) && t.p === player) return false;
      if (
        selector?.op === 'attack-threshold-destroy' &&
        (!('card' in chosen) || chosen.attack > sourceAttack)
      )
        return false;
      if (!selector?.filter) return true;
      const x = getTarget(s, t);
      return 'card' in x && matchesCard(x.card, selector.filter, s.players[player], x);
    });
}
export function effectTargetError(
  s: Game,
  player: number,
  card: Card,
  target?: Target,
): string | null {
  const rule = targetFor(targetingEffect(s, player, card));
  if (!rule) return null;
  const legal = effectTargets(s, player, card);
  // A targeted Battlecry may be played without its effect if no target exists.
  if (!legal.length && card.type === 'MINION') return null;
  if (target && legal.some((t) => t.p === target.p && t.uid === target.uid)) return null;
  return rule === 'friendly-minion'
    ? 'Choose a friendly minion for the Battlecry'
    : rule === 'enemy-hero'
      ? 'Choose an enemy hero for the Battlecry'
      : rule === 'minion'
        ? 'Choose a minion for the Battlecry'
        : 'Choose a character target';
}
function targetingEffect(s: Game, player: number, card: Card): Effect | undefined {
  const e = effectFor(card);
  if (e?.type !== 'script') return e;
  const remaining = s.players[player].mana - handCost(s.players[player], card);
  return {
    type: 'script',
    steps: e.steps.flatMap((step) =>
      step.op === 'if' && step.condition?.stat === 'remaining-mana'
        ? remaining <= (step.condition.max ?? Infinity) &&
          remaining >= (step.condition.min ?? -Infinity)
          ? (step.steps ?? [])
          : (step.elseSteps ?? [])
        : [step],
    ),
  };
}
function applyStatModifier(
  s: Game,
  unit: Unit,
  player: number,
  effect: { attack: number; health: number; expires?: 'turn' },
  source?: Card,
) {
  // Preserve old scenarios whose preexisting stat changes have no source records.
  unit.attackBase ??=
    unit.attack - (unit.modifiers ?? []).reduce((total, m) => total + m.attack, 0);
  const modifier: StatModifier = {
    sourceCardId: source?.id ?? 'unknown',
    sourceName: source?.name ?? 'Effect',
    attack: effect.attack,
    health: effect.health,
    ...(effect.expires === 'turn' ? { expiresAtTurn: s.turn } : {}),
  };
  (unit.modifiers ??= []).push(modifier);
  unit.attack = Math.max(
    0,
    unit.attackBase + unit.modifiers.reduce((total, m) => total + m.attack, 0),
  );
  unit.health += effect.health;
  unit.maxHealth += effect.health;
  note(
    s,
    `${s.players[player].name}'s ${unit.card.name} gains ${effect.attack >= 0 ? '+' : ''}${effect.attack}/+${effect.health} from ${modifier.sourceName} (${effect.expires === 'turn' ? 'until end of this turn' : 'until it leaves the battlefield'})`,
  );
}
function expireTurnModifiers(s: Game) {
  s.players.forEach((p) =>
    p.board.forEach((unit) => {
      const expired = (unit.modifiers ?? []).filter(
        (m) => m.expiresAtTurn !== undefined && m.expiresAtTurn <= s.turn,
      );
      if (!expired.length) return;
      unit.modifiers = unit.modifiers!.filter(
        (m) => m.expiresAtTurn === undefined || m.expiresAtTurn > s.turn,
      );
      unit.attack = Math.max(
        0,
        (unit.attackBase ?? unit.card.attack ?? 0) +
          unit.modifiers.reduce((total, m) => total + m.attack, 0),
      );
      for (const modifier of expired)
        note(s, `${p.name}'s ${unit.card.name}: ${modifier.sourceName} expires at end of turn`);
    }),
  );
}
function scriptedDamage(
  s: Game,
  player: number,
  target: Target,
  amount: number,
  source: Card,
  sourceUid?: number,
) {
  const dealt = damage(s, target, amount),
    u = s.players[player].board.find((u) => u.uid === sourceUid),
    keys = u ? unitMechanics(u) : (source.mechanics ?? []);
  if (dealt > 0 && freezesOnDamage(source) && !u?.silenced) freezeCharacter(s, target);
  if (dealt > 0 && keys.includes('POISONOUS') && target.uid !== undefined)
    getTarget(s, target).health = 0;
  if (dealt > 0 && keys.includes('LIFESTEAL')) {
    const restored = heal(s.players[player], dealt, s.players[player], s);
    note(s, `${source.name} Lifesteal restores ${restored} Health`);
  }
  return dealt;
}
function freezeCharacter(s: Game, t: Target) {
  if (s.players[t.p].health <= 0) return;
  const x = getTarget(s, t);
  x.frozen = true;
  x.freezeSkipEnd =
    s.active === t.p && ('attacksRemaining' in x ? !x.ready || !x.attacksRemaining : !x.heroReady);
}
const scriptOperations = new Set([
  'missiles-then',
  'summon-until',
  'random-damage',
  'future-play',
  ...foundationOperations,
  'deck-token',
  'consume',
  'set-minion-health',
  'edge-damage',
  'remove-keyword',
  'deck-order',
  'overload',
  'random-attack',
  'choose-hand',
  'legacy-deathrattle',
  'next-cost',
  'end-effect',
  'summon-effect',
  'destroy-weapon',
  'weapon-durability',
  'weapon-recover',
  'allegiance-effect',
  'attack-threshold-destroy',
  'shuffle-weaker',
  'neighbor-damage',
  'draw-summon-matching',
  'lowest-health-damage',
  'destroy-armor',
  'equip',
  'resurrect',
  'joust',
  'trigger-deathrattle',
  'gain-deathrattle',
  'grant-deathrattle',
  'steal',
  'damage-then',
  'repeat-death',
  'zone-swap',
  'replace-zone',
  'summon-copy',
  'if',
  'repeat',
  'damage',
  'missiles',
  'heal',
  'buff',
  'zone-buff',
  'keyword',
  'armor',
  'hero-attack',
  'mana',
  'discard',
  'destroy-zone',
  'cost',
  'zone-double',
  'copy-zone',
  'copy-enemy-decks',
  'shuffle-pool',
  'generate-token',
  'recruit',
  'discover',
  'draw',
  'generate',
  'summon-pool',
  'summon-token',
  'summon-self',
  'freeze',
  'destroy',
  'set-health',
  'immune',
  'silence',
  'set',
  'set-stats',
  'double',
  'copy-stats',
  'shuffle-copy',
  'transform',
  'swap',
  'bounce',
]);
function runScript(
  s: Game,
  player: number,
  steps: ScriptStep[],
  target: Target | undefined,
  position: number,
  source: Card,
  sourceUid?: number,
) {
  const p = s.players[player];
  for (let n = 0; n < steps.length; n++) {
    if (p.health <= 0) break;
    const step = steps[n],
      amount = scriptNumber(s, player, step.amount, sourceUid);
    if (!scriptOperations.has(step.op)) throw Error(`Unknown scripted effect: ${step.op}`);
    if (step.op === 'allegiance-effect') {
      if (target)
        runScript(
          s,
          player,
          [
            {
              op: target.p === player ? 'heal' : 'damage',
              scope: 'target',
              target: 'character',
              amount,
            },
          ],
          target,
          position,
          source,
          sourceUid,
        );
      continue;
    }
    if (step.op === 'attack-threshold-destroy') {
      const self = p.board.find((u) => u.uid === sourceUid);
      if (target && target.p !== player && self) {
        const victim = getTarget(s, target);
        if (
          'card' in victim &&
          victim.health > 0 &&
          victim.attack <= self.attack &&
          !victim.immune &&
          !(victim.immuneUntilTurn !== undefined && victim.immuneUntilTurn >= s.turn) &&
          !unitMechanics(victim).includes('STEALTH')
        ) {
          victim.health = 0;
          note(s, `${source.name} destroys ${victim.card.name} with ${victim.attack} Attack`);
        }
      }
      continue;
    }
    if (step.op === 'shuffle-weaker') {
      const self = p.board.find((u) => u.uid === sourceUid);
      if (!self) continue;
      for (const owner of s.players) {
        if (owner.health <= 0) continue;
        for (const u of [...owner.board]) {
          if (u.health <= 0 || u.attack >= self.attack) continue;
          owner.board = owner.board.filter((v) => v.uid !== u.uid);
          const destination =
            s.players[
              u.commander
                ? (u.commanderOwner ?? s.players.indexOf(owner))
                : s.players.indexOf(owner)
            ];
          if (u.commander) {
            destination.zone = 'command';
            destination.replacement = true;
          } else
            destination.deck.splice(random(s, destination.deck.length + 1), 0, printedCard(u.card));
          note(
            s,
            `${source.name} returns ${u.card.name} to ${destination.name}'s ${u.commander ? 'command zone' : 'deck'}`,
          );
        }
      }
      continue;
    }
    if (step.op === 'lowest-health-damage') {
      const ts = scriptTargets(
        s,
        player,
        { op: 'damage', scope: 'enemies' },
        undefined,
        sourceUid,
        position,
      );
      const lowest = Math.min(...ts.map((t) => getTarget(s, t).health));
      const choices = ts.filter((t) => getTarget(s, t).health === lowest);
      if (choices.length) {
        const t = choices[random(s, choices.length)];
        note(
          s,
          `${source.name} hits ${s.players[t.p].name}'s lowest-Health enemy for ${scriptedDamage(s, player, t, amount, source, sourceUid)}`,
        );
      }
      continue;
    }
    if (step.op === 'neighbor-damage') {
      let current = target;
      const visited = new Set<number>();
      while (current?.uid !== undefined) {
        const owner = s.players[current.p],
          index = owner.board.findIndex((u) => u.uid === current!.uid),
          victim = owner.board[index];
        if (!victim || victim.health <= 0 || visited.has(victim.uid)) break;
        visited.add(victim.uid);
        const neighbors = [owner.board[index - 1], owner.board[index + 1]].filter(
          (u) => u && u.health > 0 && !visited.has(u.uid),
        );
        const dealt = scriptedDamage(s, player, current, amount, source, sourceUid);
        note(s, `${source.name} deals ${dealt} to ${victim.card.name}`);
        if (victim.health > 0 || !neighbors.length) break;
        current = { p: current.p, uid: neighbors[random(s, neighbors.length)].uid };
      }
      continue;
    }
    if (step.op === 'draw-summon-matching') {
      const owners = s.players
        .map((owner, i) => ({ owner, i }))
        .filter(({ owner }) => owner.health > 0);
      for (const { owner, i } of owners) {
        const drawn = owner.deck[0],
          before = owner.hand.length;
        draw(s, i);
        if (
          !drawn ||
          owner.health <= 0 ||
          owner.hand.length <= before ||
          !matchesCard(drawn, step.filter, owner) ||
          owner.board.length >= 7
        )
          continue;
        const [c] = owner.hand.splice(before, 1);
        summon(s, i, c, false, owner.board.length);
      }
      continue;
    }
    if (step.op === 'summon-until') {
      do {
        if (p.board.length >= 7) break;
        runScript(
          s,
          player,
          [{ op: 'summon-token', token: step.token, amount: 1 }],
          undefined,
          position,
          source,
          sourceUid,
        );
      } while (
        s.players.some(
          (owner, i) => i !== player && owner.health > 0 && owner.board.length > p.board.length,
        )
      );
      continue;
    }
    if (step.op === 'missiles-then') {
      const before = (s.events ?? []).filter((e) => e.type === 'death').length;
      runScript(s, player, [{ ...step, op: 'missiles' }], undefined, position, source, sourceUid);
      settle(s);
      if ((s.events ?? []).filter((e) => e.type === 'death').length > before)
        runScript(s, player, step.steps ?? [], undefined, position, source, sourceUid);
      continue;
    }
    if (step.op === 'random-damage') {
      runScript(
        s,
        player,
        [
          {
            ...step,
            op: 'damage',
            amount: amount + random(s, (step.until ?? amount) - amount + 1),
          },
        ],
        target,
        position,
        source,
        sourceUid,
      );
      continue;
    }
    if (step.op === 'future-play') {
      (p.playEffects ??= []).push({
        source,
        filter: step.filter ?? { type: 'MINION' },
        remaining: amount,
        steps: step.steps ?? [],
      });
      note(s, `${source.name} enhances the next ${amount} matching minions played`);
      continue;
    }
    if (
      resolveFoundation(s, player, step, source, sourceUid, amount, target, {
        random: (n) => (n > 0 ? random(s, n) : 0),
        shuffle: (cs) => shuffle(s, cs),
        matches: (c, f, u) => matchesCard(c, f, p, u),
        add: (i, c) => addGenerated(s, i, c),
        draw: () => draw(s, player),
        note: (t) => note(s, t),
        event: (t, n) => event(s, player, t, n),
        damage: (t, n, u) =>
          scriptedDamage(s, player, t, n, u?.card ?? source, u?.uid ?? sourceUid),
        heal: (u, n) => heal(u, n, p, s),
        healingBonus: healingBonus(p),
        buff: (u, a, h) => applyStatModifier(s, u, player, { attack: a, health: h }, source),
        keys: unitMechanics,
        targets: (e) => scriptTargets(s, player, e, target, sourceUid, position),
        get: (t) => getTarget(s, t),
        run: (e, t) => runScript(s, player, e, t, position, source, sourceUid),
        catalog,
      })
    )
      continue;
    if (step.op === 'deck-token') {
      const c = catalog.find((c) => c.id === step.token);
      if (c) p.deck.push(structuredClone(c));
      note(s, `${source.name} places a card on the bottom of the deck`);
      continue;
    }
    if (step.op === 'deck-order') {
      if (step.mode === 'reverse') p.deck.reverse();
      else {
        shuffle(s, p.deck);
        p.deck.sort((a, b) => b.cost - a.cost);
      }
      note(s, `${source.name} reorders the deck`);
      continue;
    }
    if (step.op === 'edge-damage') {
      for (const [i, owner] of s.players.entries()) {
        if (i === player || owner.health <= 0) continue;
        const edges = [...new Set([owner.board[0], owner.board.at(-1)])].filter(Boolean) as Unit[];
        for (const u of edges)
          scriptedDamage(s, player, { p: i, uid: u.uid }, amount, source, sourceUid);
      }
      note(s, `${source.name} damages the outermost enemy minions`);
      continue;
    }
    if (step.op === 'consume') {
      const victims = scriptTargets(s, player, step, target, sourceUid, position);
      for (const t of victims) {
        const victim = getTarget(s, t);
        if (!('card' in victim)) continue;
        const stats = { attack: victim.attack, health: victim.health };
        victim.health = 0;
        const self = p.board.find((u) => u.uid === sourceUid);
        if (self && !['hero-damage', 'discard', 'board-attack'].includes(step.mode ?? ''))
          applyStatModifier(
            s,
            self,
            player,
            {
              attack: step.mode === 'stats' ? stats.attack : (step.attack ?? 0),
              health: ['stats', 'health'].includes(step.mode ?? '')
                ? stats.health
                : (step.health ?? 0),
            },
            source,
          );
        if (step.mode === 'hero-damage') damage(s, { p: player }, stats.health);
        if (step.mode === 'board-attack')
          for (const u of p.board.filter((u) => u.health > 0))
            applyStatModifier(s, u, player, { attack: stats.attack, health: 0 }, source);
        if (step.mode === 'discard')
          runScript(
            s,
            player,
            [{ op: 'discard', amount: 1 }],
            undefined,
            position,
            source,
            sourceUid,
          );
        note(s, `${source.name} destroys ${victim.card.name} and gains stats`);
      }
      continue;
    }
    if (step.op === 'overload') {
      p.overload = (p.overload ?? 0) + amount;
      note(s, `${p.name} overloads ${amount} Mana Crystals next turn`);
      continue;
    }
    if (step.op === 'random-attack') {
      const u = p.board.find((u) => u.uid === sourceUid);
      if (u)
        applyStatModifier(
          s,
          u,
          player,
          { attack: step.attack! + random(s, step.health! - step.attack! + 1), health: 0 },
          source,
        );
      continue;
    }
    if (step.op === 'legacy-deathrattle') {
      const c = catalog.find((c) => c.id === step.token);
      if (c && deathrattleFor(c)) runEffect(s, player, deathrattleFor(c)!, undefined, position, c);
      continue;
    }
    if (step.op === 'next-cost') {
      (p.nextDiscounts ??= []).push({
        filter: step.filter ?? {},
        amount: step.reduction ?? 0,
        source: source.name,
      });
      note(s, `${source.name}: next matching card costs ${step.reduction} less`);
      continue;
    }
    if (step.op === 'end-effect') {
      (p.endEffects ??= []).push({
        source: structuredClone(source),
        steps: step.steps!,
        once: !step.permanent,
        sourceUid,
      });
      note(s, `${source.name} schedules ${step.permanent ? 'a lasting' : 'an end-of-turn'} effect`);
      continue;
    }
    if (step.op === 'summon-effect') {
      (p.summonEffects ??= []).push({
        source,
        filter: step.filter ?? {},
        attack: step.attack,
        health: step.health,
        set: step.setCost ?? undefined,
      });
      note(s, `${source.name} changes matching future summons for the rest of the game`);
      continue;
    }
    if (step.op === 'weapon-durability') {
      for (const [i, owner] of s.players.entries()) {
        if (i === player || owner.health <= 0 || !owner.weapon) continue;
        owner.weapon.durability -= amount;
        note(s, `${source.name}: ${owner.name}'s weapon loses ${amount} Durability`);
        if (owner.weapon.durability <= 0) destroyWeapon(s, i);
      }
      continue;
    }
    if (step.op === 'weapon-recover') {
      const pool = (s.events ?? [])
        .filter(
          (e) => e.player === player && e.type === 'weapon-destroyed' && e.card?.type === 'WEAPON',
        )
        .map((e) => e.card!);
      if (!pool.length) continue;
      const card = printedCard(pool[random(s, pool.length)]);
      if (step.mode === 'equip') {
        destroyWeapon(s, player);
        p.weapon = {
          card,
          attack: card.attack ?? 0,
          durability: card.durability || card.health || 1,
        };
        note(s, `${source.name}: ${p.name} re-equips ${card.name}`);
      } else {
        addGenerated(s, player, card);
        note(s, `${source.name}: ${p.name} recovers ${card.name}`);
      }
      continue;
    }
    if (step.op === 'destroy-weapon' || step.op === 'destroy-armor') {
      for (const [i, owner] of s.players.entries())
        if (i !== player && owner.health > 0) {
          if (step.op === 'destroy-weapon' && owner.weapon) {
            const attack = owner.weapon.attack,
              durability = owner.weapon.durability;
            destroyWeapon(s, i);
            if (step.after === 'draw' || step.after === 'draw-durability')
              for (
                let j = 0;
                j < (step.after === 'draw-durability' ? durability : attack) && p.health > 0;
                j++
              )
                draw(s, player);
            if (step.after === 'armor') {
              p.armor += attack;
              event(s, player, 'armor-change', attack);
            }
          }
          if (step.op === 'destroy-armor') {
            event(s, i, 'armor-change', -owner.armor);
            owner.armor = 0;
          }
        }
      note(
        s,
        `${source.name} destroys enemy ${step.op === 'destroy-weapon' ? 'weapons' : 'Armor'}`,
      );
      continue;
    }
    if (step.op === 'equip') {
      for (const [i, owner] of s.players.entries())
        if (owner.health > 0 && (step.allPlayers || i === player)) {
          const pool = step.token
            ? catalog.filter((c) => c.id === step.token)
            : scriptPool(s, i, { ...step, filter: { ...step.filter, type: 'WEAPON' } });
          if (!pool.length) continue;
          const c = structuredClone(pool[random(s, pool.length)]);
          destroyWeapon(s, i);
          owner.weapon = {
            card: c,
            attack: c.attack ?? 0,
            durability: c.durability || c.health || 1,
          };
          note(s, `${source.name}: ${owner.name} equips ${c.name}`);
        }
      continue;
    }
    if (step.op === 'resurrect') {
      let pool = (s.events ?? [])
        .filter(
          (e) =>
            e.type === 'death' &&
            (step.mode !== 'this-turn' || e.turn === s.turn) &&
            (step.allPlayers || e.player === player) &&
            e.card &&
            matchesCard(e.card, step.filter, p),
        )
        .map((e) => e.card!);
      if (step.distinct) pool = [...new Map(pool.map((c) => [c.name, c])).values()];
      if (step.order === 'highest Cost' && pool.length) {
        const max = Math.max(...pool.map((c) => c.cost));
        pool = pool.filter((c) => c.cost === max);
      }
      const count = step.until === 7 ? 7 - p.board.length : amount;
      for (let i = 0; i < count && pool.length && p.board.length < 7; i++) {
        const c = pool.splice(random(s, pool.length), 1)[0];
        const uid = summon(
          s,
          player,
          printedCard(c),
          false,
          Math.min(position + i, p.board.length),
        );
        const u = p.board.find((u) => u.uid === uid)!;
        if (step.attack !== undefined && step.health !== undefined) {
          u.attackBase = u.attack = step.attack;
          u.maxHealth = u.health = step.health;
          u.modifiers = [];
        }
        if (step.keyword) {
          u.keywords = [...(u.keywords ?? []), step.keyword];
          (u.keywordSources ??= []).push({
            keyword: step.keyword,
            sourceCardId: source.id,
            sourceName: source.name,
          });
        }
        note(s, `${source.name} resurrects ${c.name}`);
      }
      continue;
    }
    if (step.op === 'joust') {
      const options = p.deck.filter((c) => matchesCard(c, step.filter ?? { type: 'MINION' }, p));
      const own = options.length ? options[random(s, options.length)] : undefined;
      let win = !!own;
      for (const [i, owner] of s.players.entries())
        if (i !== player && owner.health > 0) {
          const enemies = owner.deck.filter((c) =>
            matchesCard(c, step.filter ?? { type: 'MINION' }, owner),
          );
          const enemy = enemies.length ? enemies[random(s, enemies.length)] : undefined;
          if (enemy && (!own || own.cost <= enemy.cost)) win = false;
          note(
            s,
            `${source.name} reveals ${own?.name ?? 'no minion'} versus ${owner.name}'s ${enemy?.name ?? 'no minion'}`,
          );
        }
      if (win && own) {
        if (step.after === 'draw') {
          p.deck.splice(p.deck.indexOf(own), 1);
          addGenerated(s, player, own);
        }
        runScript(s, player, step.steps ?? [], target, position, source, sourceUid);
      }
      continue;
    }
    if (step.op === 'zone-swap' || step.op === 'replace-zone') {
      const owners = step.allPlayers ? s.players.filter((p) => p.health > 0) : [p];
      for (const owner of owners)
        for (const zone of step.zone === 'hand and deck'
          ? (['hand', 'deck'] as const)
          : [step.zone as 'hand' | 'deck']) {
          owner[zone] = owner[zone].map((c) => {
            if (!matchesCard(c, step.filter, owner)) return c;
            if (step.op === 'zone-swap') {
              const stats = cardStats(c);
              return {
                ...c,
                modifiers: [
                  ...(c.modifiers ?? []),
                  {
                    sourceCardId: source.id,
                    sourceName: source.name,
                    attack: stats.health - stats.attack,
                    health: stats.attack - stats.health,
                  },
                ],
              };
            }
            const pool = scriptPool(s, player, { ...step, filter: step.filter, op: 'generate' });
            if (!pool.length) return c;
            const fresh = structuredClone(pool[random(s, pool.length)]);
            fresh.heldSince = s.events?.length ?? 0;
            fresh.printedCost ??= fresh.cost;
            fresh.cost = Math.max(0, fresh.cost - (step.reduction ?? 0));
            return fresh;
          });
        }
      note(s, `${source.name} changes ${step.zone} cards`);
      continue;
    }
    if (step.op === 'repeat-death') {
      // Each repeat requires a death; finite boards plus a safety bound prevent token loops.
      for (let i = 0; i < 100; i++) {
        const before = (s.events ?? []).filter((e) => e.type === 'death').length;
        runScript(s, player, step.steps!, target, position, source, sourceUid);
        settle(s);
        if (
          s.winner !== null ||
          before === (s.events ?? []).filter((e) => e.type === 'death').length
        )
          break;
      }
      continue;
    }
    if (step.op === 'damage-then') {
      for (const t of scriptTargets(s, player, step, target, sourceUid, position)) {
        const u = getTarget(s, t);
        const before = u.health;
        const dealt = scriptedDamage(s, player, t, amount, source, sourceUid);
        note(
          s,
          `${source.name} deals ${dealt} damage to ${'card' in u ? u.card.name : s.players[t.p].name}`,
        );
        const killed = u.health <= 0;
        if (step.mode === 'excess-draw')
          for (let i = 0; i < (killed ? Math.max(0, dealt - before) : 0) && p.health > 0; i++)
            draw(s, player);
        const trigger =
          step.mode === 'survives'
            ? !killed
            : step.mode === 'honorable'
              ? before === amount && killed
              : killed;
        if (trigger) runScript(s, player, step.steps!, target, position, source, sourceUid);
      }
      settle(s);
      continue;
    }
    if (step.op === 'if') {
      const passed = scriptCondition(s, player, step.condition!, sourceUid);
      if (passed || step.elseSteps) {
        runScript(
          s,
          player,
          [...(passed ? step.steps! : step.elseSteps!), ...steps.slice(n + 1)],
          target,
          position,
          source,
          sourceUid,
        );
        return;
      }
      continue;
    }
    if (step.op === 'repeat') {
      const repeats = amount;
      for (let i = 0; i < repeats; i++) {
        runScript(s, player, step.steps!, target, position, source, sourceUid);
        if (s.choice) {
          s.choice.remaining = [
            ...s.choice.remaining,
            ...Array.from({ length: repeats - i - 1 }).flatMap(() => step.steps!),
            ...steps.slice(n + 1),
          ];
          return;
        }
      }
      continue;
    }
    if (step.scope === 'weapon') {
      if (p.weapon && step.op === 'buff') {
        p.weapon.attack = Math.max(0, p.weapon.attack + (step.attack ?? 0));
        p.weapon.durability += step.health ?? 0;
        note(s, `${source.name} enhances ${p.name}'s weapon`);
      }
      continue;
    }
    if (step.op === 'hero-attack') {
      p.heroAttack += amount;
      note(s, `${p.name} gains ${amount} hero Attack this turn`);
      continue;
    }
    if (step.op === 'mana') {
      for (const owner of step.allPlayers ? s.players : [p]) {
        if (owner.health <= 0) continue;
        owner.maxMana =
          step.mode === 'lose'
            ? Math.max(0, owner.maxMana - amount)
            : step.mode === 'set'
              ? Math.min(10, amount)
              : step.mode === 'refresh'
                ? owner.maxMana
                : Math.min(10, owner.maxMana + amount);
        owner.mana =
          step.mode === 'lose'
            ? Math.min(owner.mana, owner.maxMana)
            : step.mode === 'set'
              ? owner.maxMana
              : step.mode === 'empty'
                ? owner.mana
                : Math.min(
                    Math.max(0, owner.maxMana - (owner.lockedMana ?? 0)),
                    owner.mana + amount,
                  );
      }
      note(s, `${source.name} changes Mana Crystals`);
      continue;
    }
    if (step.op === 'discard') {
      for (let i = 0; i < amount && p.hand.length; i++) {
        let options = p.hand
          .map((c, index) => ({ c, index }))
          .filter(({ c }) => matchesCard(c, step.filter, p));
        if (!options.length) break;
        if (step.order) {
          const cost = (step.order === 'lowest Cost' ? Math.min : Math.max)(
            ...options.map((o) => o.c.cost),
          );
          options = options.filter((o) => o.c.cost === cost);
        }
        const { c, index } = options[random(s, options.length)];
        p.hand.splice(index, 1);
        p.grave.push(printedCard(c));
        note(s, `${p.name} discards ${c.name}`);
      }
      continue;
    }
    if (step.op === 'destroy-zone') {
      const owners = step.allPlayers
        ? s.players
        : step.enemy
          ? s.players.filter((x) => x !== p)
          : [p];
      for (const owner of owners)
        if (owner.health > 0)
          for (const zone of step.zone === 'hand and deck'
            ? (['hand', 'deck'] as const)
            : ([step.zone === 'hand' ? 'hand' : 'deck'] as const)) {
            let victims = owner[zone].filter((c) => matchesCard(c, step.filter, owner));
            if (step.mode === 'top') victims = victims.slice(0, amount);
            if (step.mode === 'keep-highest')
              victims = shuffle(s, [...victims])
                .sort((a, b) => b.cost - a.cost)
                .slice(step.until ?? 0);
            if (step.random) victims = victims.length ? [victims[random(s, victims.length)]] : [];
            owner[zone] = owner[zone].filter((c) => !victims.includes(c));
            owner.grave.push(...victims.map(printedCard));
          }
      note(s, `${source.name} removes matching cards from ${p.name}'s deck`);
      continue;
    }
    if (step.op === 'cost' || step.op === 'zone-double') {
      for (const zone of step.zone === 'hand and deck'
        ? (['hand', 'deck'] as const)
        : [step.zone as 'hand' | 'deck']) {
        const costs = p[zone].filter((c) => matchesCard(c, step.filter, p)).map((c) => c.cost);
        const selectedCost =
          step.order === 'highest Cost' ? Math.max(...costs) : Math.min(...costs);
        p[zone] = p[zone].map((c) => {
          if (!matchesCard(c, step.filter, p)) return c;
          if (step.order && c.cost !== selectedCost) return c;
          const copy = structuredClone(c);
          if (step.op === 'cost') {
            copy.printedCost ??= copy.cost;
            copy.cost = Math.max(0, copy.cost - (step.reduction ?? 0));
          } else {
            const stats = cardStats(c);
            (copy.modifiers ??= []).push({
              sourceCardId: source.id,
              sourceName: source.name,
              attack: stats.attack,
              health: stats.health,
            });
          }
          return copy;
        });
      }
      note(s, `${source.name} changes matching cards in ${p.name}'s ${step.zone}`);
      continue;
    }
    if (step.op === 'copy-zone') {
      let options = p.hand.filter((c) => matchesCard(c, step.filter, p));
      if (step.order === 'lowest Cost') {
        const cost = Math.min(...options.map((c) => c.cost));
        options = options.filter((c) => c.cost === cost);
        options = options.length ? [options[random(s, options.length)]] : [];
      }
      if (step.random && options.length) options = [options[random(s, options.length)]];
      for (const c of options) addGenerated(s, player, c);
      note(s, `${source.name} copies ${options.length} matching hand cards`);
      continue;
    }
    if (step.op === 'copy-enemy-decks') {
      for (const [i, owner] of s.players.entries())
        if (i !== player && owner.health > 0) p.deck.push(...structuredClone(owner.deck));
      shuffle(s, p.deck);
      continue;
    }
    if (step.op === 'shuffle-pool') {
      for (let i = 0; i < amount; i++) {
        const pool = scriptPool(s, player, step);
        if (!pool.length) break;
        const c = structuredClone(pool[random(s, pool.length)]);
        c.printedCost ??= c.cost;
        c.cost = step.setCost ?? Math.max(0, c.cost - (step.reduction ?? 0));
        p.deck.splice(random(s, p.deck.length + 1), 0, c);
      }
      continue;
    }
    if (step.op === 'generate-token') {
      const c = catalog.find((c) => c.id === step.token),
        owners = step.allPlayers
          ? s.players.flatMap((p, i) => (p.health > 0 ? [i] : []))
          : step.enemy
            ? s.players.flatMap((p, i) => (p.health > 0 && i !== player ? [i] : []))
            : [player];
      if (c)
        for (const owner of owners) {
          const count = step.until
            ? Math.max(0, (s.players[owner].maxHandSize ?? 10) - s.players[owner].hand.length)
            : amount;
          for (let i = 0; i < count; i++) addGenerated(s, owner, c);
        }
      note(s, `${source.name} adds ${amount} generated cards to hand`);
      continue;
    }
    if (step.op === 'recruit') {
      if (step.enemy || step.allPlayers) {
        for (const [i, owner] of s.players.entries())
          if (owner.health > 0 && (step.allPlayers || i !== player))
            runScript(
              s,
              i,
              [{ ...step, enemy: false, allPlayers: false }],
              undefined,
              owner.board.length,
              source,
            );
        continue;
      }
      const zone = step.zone as 'hand' | 'deck';
      const recruitedSets = new Set<string>();
      for (let i = 0; i < amount && p.board.length < 7; i++) {
        const options = p[zone]
          .map((c, index) => ({ c, index }))
          .filter(
            (o) =>
              o.c.type === 'MINION' &&
              matchesCard(o.c, step.filter, p) &&
              (!step.distinct || !recruitedSets.has(o.c.set)) &&
              (step.mode !== 'affordable' || handCost(p, o.c) <= p.mana),
          );
        if (!options.length) break;
        const { c, index } = options[random(s, options.length)];
        recruitedSets.add(c.set);
        if (!step.copy) p[zone].splice(index, 1);
        const uid = summon(s, player, c, false, Math.min(position + i, p.board.length));
        if (step.attack !== undefined && step.health !== undefined) {
          const u = p.board.find((u) => u.uid === uid)!;
          u.attackBase = u.attack = step.attack;
          u.maxHealth = u.health = step.health;
          u.modifiers = [];
        }
        if (step.keyword) {
          const u = p.board.find((u) => u.uid === uid)!;
          u.keywords = [step.keyword];
          if (step.keyword === 'RUSH' || step.keyword === 'CHARGE') {
            u.ready = true;
            u.rushOnly = step.keyword === 'RUSH';
          }
        }
      }
      note(s, `${source.name} finishes summoning matching minions from ${p.name}'s ${zone}`);
      continue;
    }
    if (step.op === 'discover' || step.op === 'choose-hand') {
      if (step.zone === 'enemy-deck' && step.owner === undefined) {
        const stages = s.players.flatMap((owner, i) =>
          i !== player && owner.health > 0 ? [{ ...step, owner: i }] : [],
        );
        runScript(
          s,
          player,
          [...stages, ...steps.slice(n + 1)],
          target,
          position,
          source,
          sourceUid,
        );
        return;
      }
      const pool = scriptPool(s, player, step),
        options: Card[] = [];
      if (step.mode === 'dredge')
        options.push(
          ...structuredClone(
            (step.zone === 'enemy-deck' ? s.players[step.owner!].deck : p.deck).slice(-3),
          ),
        );
      while (
        step.mode !== 'dredge' &&
        pool.length &&
        options.length < (step.op === 'choose-hand' ? (p.maxHandSize ?? 10) : 3)
      )
        options.push(structuredClone(pool.splice(random(s, pool.length), 1)[0]));
      if (!options.length) {
        note(s, `${source.name}: no eligible Discover cards`);
        continue;
      }
      s.choice = {
        player,
        options,
        step,
        remaining: steps.slice(n + 1),
        source,
        sourceUid,
        target,
        position,
      };
      note(s, `${p.name} is choosing a card for ${source.name}`);
      return;
    }
    if (step.op === 'draw') {
      if (step.allPlayers) {
        for (let i = 0; i < s.players.length; i++)
          if (s.players[i].health > 0)
            runScript(s, i, [{ ...step, allPlayers: false }], undefined, 0, source);
        continue;
      }
      let count =
        step.until === undefined
          ? amount
          : Math.max(
              0,
              (step.mode === 'fill-hand'
                ? (p.maxHandSize ?? 10)
                : Math.min(p.maxHandSize ?? 10, step.until)) - p.hand.length,
            );
      const drawnNames = new Set<string>();
      for (let i = 0; i < count && p.health > 0; i++) {
        if (step.filter || step.mode || step.summon) {
          let candidates = p.deck
            .map((c, index) => ({ c, index }))
            .filter(
              ({ c }) =>
                matchesCard(c, step.filter, p) && (!step.distinct || !drawnNames.has(c.name)),
            );
          if (step.order) {
            const costs = candidates.map((x) => x.c.cost),
              cost = step.order === 'lowest Cost' ? Math.min(...costs) : Math.max(...costs);
            candidates = candidates.filter((x) => x.c.cost === cost);
          }
          if (!candidates.length) break;
          const { c, index } = candidates[step.filter ? random(s, candidates.length) : 0];
          p.deck.splice(index, 1);
          drawnNames.add(c.name);
          const copy = structuredClone(c);
          if (step.reduction) {
            copy.printedCost ??= copy.cost;
            copy.cost = Math.max(0, copy.cost - step.reduction);
          }
          if (step.mode === 'buff' || step.mode === 'set') {
            const stats = cardStats(copy);
            (copy.modifiers ??= []).push({
              sourceCardId: source.id,
              sourceName: source.name,
              attack: step.mode === 'set' ? step.attack! - stats.attack : step.attack!,
              health: step.mode === 'set' ? step.health! - stats.health : step.health!,
            });
          }
          if (step.setCost !== undefined && step.setCost !== null) {
            copy.printedCost ??= copy.cost;
            copy.cost = step.setCost;
          }
          if (step.expires === 'turn') {
            copy.cost = c.cost;
            (copy.temporaryCosts ??= []).push({
              turn: s.turn,
              reduction: step.reduction,
              set: step.setCost ?? undefined,
              source: source.name,
            });
          }
          if (step.summon && copy.type === 'MINION' && p.board.length < 7)
            summon(s, player, copy, false, Math.min(position, p.board.length));
          else addGenerated(s, player, copy);
        } else draw(s, player);
      }
      note(s, `${p.name} resolves ${source.name}'s draw`);
      continue;
    }
    if (step.op === 'generate') {
      for (const owner of step.allPlayers
        ? s.players.flatMap((p, i) => (p.health > 0 ? [i] : []))
        : step.enemy
          ? s.players.flatMap((x, i) => (i !== player && x.health > 0 ? [i] : []))
          : [player])
        for (let i = 0; i < amount; i++) {
          const pool = scriptPool(s, owner, step).filter(
            (c) =>
              (step.mode !== 'affordable' || c.cost <= p.mana) &&
              (step.mode !== 'opponent-class' ||
                s.players.some(
                  (x, i) =>
                    i !== player && x.health > 0 && (c.classes ?? [c.cardClass]).includes(x.class),
                )),
          );
          if (pool.length) {
            const c = structuredClone(pool[random(s, pool.length)]);
            if (step.expires === 'turn') c.temporaryUntilTurn = s.turn;
            if (step.setCost !== undefined && step.setCost !== null) {
              c.printedCost ??= c.cost;
              c.cost = step.setCost;
            }
            if (owner === player && step.reduction) {
              c.printedCost ??= c.cost;
              c.cost = Math.max(0, c.cost - step.reduction);
            }
            const before = s.players[owner].hand.length;
            addGenerated(s, owner, c);
            if (step.destination === 'left' && s.players[owner].hand.length > before)
              s.players[owner].hand.unshift(s.players[owner].hand.pop()!);
          }
        }
      note(s, `${source.name} adds cards to ${p.name}'s hand`);
      continue;
    }
    if (step.op === 'zone-buff') {
      const zones: ('hand' | 'deck')[] =
        step.zone === 'hand and deck' ? ['hand', 'deck'] : [step.zone as 'hand' | 'deck'];
      for (const zone of zones) {
        let indices = p[zone].flatMap((c, i) => (matchesCard(c, step.filter, p) ? [i] : []));
        if (step.random && indices.length) indices = [indices[random(s, indices.length)]];
        if (step.until !== undefined) indices = indices.slice(0, step.until);
        p[zone] = p[zone].map((c, i) =>
          indices.includes(i)
            ? {
                ...c,
                modifiers: [
                  ...(c.modifiers ?? []),
                  {
                    sourceCardId: source.id,
                    sourceName: source.name,
                    attack: step.attack ?? 0,
                    health: step.health ?? 0,
                  },
                ],
              }
            : c,
        );
      }
      note(s, `${source.name} enhances eligible cards in ${p.name}'s ${step.zone}`);
      continue;
    }
    if (step.op === 'armor') {
      if (p.health > 0) {
        p.armor += amount;
        event(s, player, 'armor-change', amount);
        note(s, `${p.name} gains ${amount} Armor (${p.armor} total)`);
      }
      continue;
    }
    if (['summon-pool', 'summon-token', 'summon-self'].includes(step.op)) {
      const owners = step.enemy
        ? s.players.flatMap((p, i) => (i !== player && p.health > 0 ? [i] : []))
        : step.allPlayers
          ? s.players.flatMap((p, i) => (p.health > 0 ? [i] : []))
          : [player];
      for (const owner of owners)
        for (let i = 0; i < amount && s.players[owner].board.length < 7; i++) {
          const pool =
            step.op === 'summon-token'
              ? catalog.filter((c) => c.id === step.token)
              : step.op === 'summon-self'
                ? [source]
                : scriptPool(s, player, step);
          if (!pool.length) break;
          const c = structuredClone(pool[step.op === 'summon-pool' ? random(s, pool.length) : 0]);
          const uid = summon(
            s,
            owner,
            c,
            false,
            Math.min(position + i, s.players[owner].board.length),
          );
          if (step.op === 'summon-self') {
            const old = p.board.find((u) => u.uid === sourceUid),
              copy = s.players[owner].board.find((u) => u.uid === uid)!;
            if (old) {
              const ready = copy.ready;
              Object.assign(copy, structuredClone(old), {
                uid,
                commander: false,
                ready,
                summonedTurn: s.turn,
              });
            }
          }
        }
      continue;
    }
    const hits = step.op === 'missiles' ? amount : 1;
    for (let hit = 0; hit < hits; hit++) {
      let ts = scriptTargets(s, player, step, target, sourceUid, position);
      if (step.op === 'missiles') ts = ts.length ? [ts[random(s, ts.length)]] : [];
      for (const t of ts) {
        const x = getTarget(s, t),
          label = 'card' in x ? x.card.name : s.players[t.p].name;
        if (step.op === 'damage' || step.op === 'missiles')
          note(
            s,
            `${source.name}: ${label} takes ${scriptedDamage(s, player, t, step.op === 'missiles' ? 1 : amount, source, sourceUid)} damage`,
          );
        if (step.op === 'heal')
          note(
            s,
            `${source.name}: ${label} restores ${heal(x, step.full ? Math.max(0, ('card' in x ? x.maxHealth : 40) - x.health) : amount, p, s)} Health`,
          );
        if (step.op === 'freeze') {
          x.frozen = true;
          x.freezeSkipEnd =
            s.active === t.p &&
            ('attacksRemaining' in x ? !x.ready || !x.attacksRemaining : !x.heroReady);
          note(s, `${label} is Frozen`);
        }
        if (step.op === 'set-health') {
          if (!('card' in x)) event(s, t.p, 'health-change', amount - x.health);
          x.health = amount;
          note(s, `${label}'s Health is set to ${amount}`);
        }
        if (step.op === 'immune') {
          if (step.permanent && 'card' in x) x.immune = true;
          else x.immuneUntilTurn = s.turn;
          note(s, `${label} is Immune${step.permanent ? '' : ' this turn'}`);
        }
        if (!('card' in x)) {
          if (step.op === 'keyword' && step.keyword === 'DIVINE_SHIELD') {
            x.shield = true;
            note(s, `${label} gains Divine Shield`);
          }
          if (step.op === 'buff' && step.attack) {
            const scale = scriptNumber(s, player, step.scale ?? 1, sourceUid);
            x.heroAttack += step.attack * scale;
            note(s, `${label} gains ${step.attack * scale} hero Attack this turn`);
          }
          continue;
        }
        if (step.op === 'set-minion-health') {
          x.maxHealth = x.health = amount;
          // Keep Attack enchantments; Health is a new absolute value.
          for (const m of x.modifiers ?? []) m.health = 0;
          note(s, `${label}'s Health is set to ${amount}`);
        }
        if (step.op === 'remove-keyword' && step.keyword === 'STEALTH') {
          x.stealth = false;
          note(s, `${label} loses Stealth`);
        }
        if (step.op === 'trigger-deathrattle') {
          for (let i = 0; i < (step.amount === undefined ? 1 : amount); i++) {
            if (!x.silenced && deathrattleFor(x.card))
              runEffect(
                s,
                t.p,
                deathrattleFor(x.card)!,
                undefined,
                s.players[t.p].board.indexOf(x) + 1,
                x.card,
                x.uid,
              );
            for (const grant of x.grantedDeathrattles ?? [])
              runScript(
                s,
                t.p,
                grant.steps,
                undefined,
                s.players[t.p].board.indexOf(x) + 1,
                grant.source,
                x.uid,
              );
          }
          note(s, `${source.name} triggers ${x.card.name}'s Deathrattle`);
        }
        if (step.op === 'gain-deathrattle' || step.op === 'grant-deathrattle') {
          const recipient =
            step.op === 'gain-deathrattle' ? p.board.find((u) => u.uid === sourceUid) : x;
          if (recipient) {
            if (step.op === 'grant-deathrattle')
              (recipient.grantedDeathrattles ??= []).push({
                source,
                steps: structuredClone(step.steps!),
              });
            else if (!x.silenced) {
              const e = deathrattleFor(x.card);
              if (e?.type === 'script')
                (recipient.grantedDeathrattles ??= []).push({
                  source: x.card,
                  steps: structuredClone(e.steps),
                });
              else if (e)
                (recipient.grantedDeathrattles ??= []).push({
                  source: x.card,
                  steps: [{ op: 'legacy-deathrattle', token: x.card.id }],
                });
              recipient.grantedDeathrattles = [
                ...(recipient.grantedDeathrattles ?? []),
                ...structuredClone(x.grantedDeathrattles ?? []),
              ];
            }
            note(s, `${recipient.card.name} gains a Deathrattle from ${source.name}`);
          }
        }
        if (step.op === 'summon-copy') {
          const owner = step.enemy ? t.p : player;
          if (s.players[owner].board.length < 7) {
            const uid = summon(
              s,
              owner,
              x.card,
              false,
              Math.min(position, s.players[owner].board.length),
            );
            const fresh = s.players[owner].board.find((u) => u.uid === uid)!;
            const ready = fresh.ready,
              attacksRemaining = fresh.attacksRemaining;
            Object.assign(fresh, structuredClone(x), {
              uid,
              commander: false,
              ready,
              attacksRemaining,
              summonedTurn: s.turn,
            });
            if (step.attack !== undefined && step.health !== undefined) {
              fresh.attackBase = fresh.attack = step.attack;
              fresh.maxHealth = fresh.health = step.health;
              fresh.modifiers = [];
            }
            if (step.keyword)
              runScript(
                s,
                owner,
                [{ op: 'keyword', scope: 'target', target: 'minion', keyword: step.keyword }],
                { p: owner, uid },
                position,
                source,
                sourceUid,
              );
          }
        }
        if (step.op === 'steal' && t.p !== player && p.board.length < 7) {
          s.players[t.p].board = s.players[t.p].board.filter((u) => u.uid !== x.uid);
          p.board.splice(Math.min(position, p.board.length), 0, x);
          x.ready = unitMechanics(x).some((k) => k === 'CHARGE' || k === 'RUSH');
          x.rushOnly = !unitMechanics(x).includes('CHARGE');
          x.summonedTurn = s.turn;
          x.attacksRemaining = unitMechanics(x).includes('WINDFURY') ? 2 : 1;
          note(s, `${source.name} takes control of ${x.card.name}`);
        }
        if (step.op === 'destroy') {
          x.health = 0;
          note(s, `${source.name} destroys ${label}`);
        }
        if (step.op === 'buff') {
          const scale = scriptNumber(s, player, step.scale ?? 1, sourceUid);
          applyStatModifier(
            s,
            x,
            t.p,
            {
              attack: (step.attack ?? 0) * scale,
              health: (step.health ?? 0) * scale,
              ...(step.expires ? { expires: step.expires } : {}),
            },
            source,
          );
        }
        if (step.op === 'keyword') {
          const before = unitMechanics(x);
          if (step.expires === 'turn')
            (x.temporaryKeywords ??= []).push({ keyword: step.keyword!, turn: s.turn });
          else x.keywords = [...new Set([...(x.keywords ?? []), step.keyword!])];
          (x.keywordSources ??= []).push({
            keyword: step.keyword!,
            sourceCardId: source.id,
            sourceName: source.name,
            ...(step.expires === 'turn' ? { expiresAtTurn: s.turn } : {}),
          });
          if (step.keyword === 'STEALTH') x.stealth = true;
          if (step.keyword === 'DIVINE_SHIELD') x.shield = true;
          if (step.keyword === 'WINDFURY' && !before.includes('WINDFURY')) {
            x.attacksRemaining++;
            if (x.summonedTurn !== s.turn) x.ready = x.attacksRemaining > 0;
          }
          if (
            ['RUSH', 'CHARGE'].includes(step.keyword!) &&
            x.summonedTurn === s.turn &&
            x.attacksRemaining > 0
          ) {
            x.ready = true;
            x.rushOnly = step.keyword === 'RUSH' && !unitMechanics(x).includes('CHARGE');
          }
          note(s, `${label} gains ${step.keyword}`);
        }
        if (step.op === 'silence') {
          const usedAttacks = (unitMechanics(x).includes('WINDFURY') ? 2 : 1) - x.attacksRemaining;
          x.silenced = true;
          x.keywords = [];
          x.keywordSources = [];
          x.temporaryKeywords = [];
          x.grantedDeathrattles = [];
          x.modifiers = [];
          x.attackBase = x.card.attack ?? 0;
          x.attack = x.card.attack ?? 0;
          x.maxHealth = x.card.health ?? 1;
          x.health = Math.min(x.health, x.maxHealth);
          x.shield = false;
          x.frozen = false;
          delete x.immuneUntilTurn;
          delete x.immune;
          x.attacksRemaining = Math.max(0, 1 - usedAttacks);
          if (x.summonedTurn === s.turn) x.ready = false;
          note(s, `${label} is Silenced`);
        }
        if (step.op === 'set-stats') {
          x.attackBase = step.attack!;
          x.attack = step.attack!;
          x.health = step.health!;
          x.maxHealth = step.health!;
          x.modifiers = [];
          note(s, `${label}'s stats are set to ${x.attack}/${x.health}`);
        }
        if (step.op === 'double') {
          applyStatModifier(
            s,
            x,
            t.p,
            {
              attack: step.stat === 'attack' ? x.attack : 0,
              health: step.stat === 'health' ? x.health : 0,
            },
            source,
          );
        }
        if (step.op === 'copy-stats') {
          const self = p.board.find((u) => u.uid === sourceUid);
          if (self) {
            self.attackBase = step.stat === 'both' ? x.attack : self.attack;
            self.attack = self.attackBase;
            self.health = x.health;
            self.maxHealth = x.health;
            self.modifiers = [];
          }
        }
        if (step.op === 'shuffle-copy') {
          for (let i = 0; i < amount; i++) {
            const c = { ...structuredClone(x.card), modifiers: structuredClone(x.modifiers ?? []) };
            p.deck.splice(random(s, p.deck.length + 1), 0, c);
          }
        }
        if (step.op === 'transform') {
          const dest = step.from === 'target' ? p.board.find((u) => u.uid === sourceUid) : x;
          let templates: Card[] = [];
          let templateUnit: Unit | undefined;
          if (step.from === 'self') {
            templateUnit = p.board.find((u) => u.uid === sourceUid);
            templates = templateUnit ? [templateUnit.card] : [];
          } else if (step.from === 'target') {
            templateUnit = x;
            templates = [x.card];
          } else if (step.from === 'deck' || step.from === 'hand')
            templates = p[step.from].filter(
              (c) => c.type === 'MINION' && matchesCard(c, step.filter, p),
            );
          else if (step.from === 'token') templates = catalog.filter((c) => c.id === step.token);
          else
            templates = catalog.filter(
              (c) =>
                c.collectible &&
                c.type === 'MINION' &&
                c.cost === x.card.cost + (step.costDelta ?? 0),
            );
          if (dest && templates.length) {
            const c = structuredClone(
              templates[
                step.from === 'self' || step.from === 'target' || step.from === 'token'
                  ? 0
                  : random(s, templates.length)
              ],
            );
            const owner = s.players[step.from === 'target' ? player : t.p],
              index = owner.board.indexOf(dest);
            owner.board.splice(index, 1);
            const uid = summon(s, step.from === 'target' ? player : t.p, c, dest.commander, index);
            const fresh = owner.board.find((u) => u.uid === uid)!;
            const ready = dest.ready,
              attacksRemaining = dest.attacksRemaining;
            if (templateUnit) {
              Object.assign(fresh, structuredClone(templateUnit));
              fresh.commander = dest.commander;
            }
            Object.assign(fresh, {
              uid: dest.uid,
              commanderOwner: dest.commanderOwner,
              ready,
              attacksRemaining,
              summonedTurn: dest.summonedTurn,
            });
            const used = (unitMechanics(dest).includes('WINDFURY') ? 2 : 1) - dest.attacksRemaining;
            fresh.attacksRemaining = Math.max(
              0,
              (unitMechanics(fresh).includes('WINDFURY') ? 2 : 1) - used,
            );
            if (
              fresh.summonedTurn === s.turn &&
              unitMechanics(fresh).some((k) => k === 'CHARGE' || k === 'RUSH')
            ) {
              fresh.ready = fresh.attacksRemaining > 0;
              fresh.rushOnly = !unitMechanics(fresh).includes('CHARGE');
            }
            if (step.attack != null) {
              fresh.attackBase = step.attack;
              fresh.attack = step.attack;
              fresh.modifiers = [];
            }
            if (step.health != null) {
              fresh.health = step.health;
              fresh.maxHealth = step.health;
              fresh.modifiers = [];
            }
            note(s, `${source.name} transforms ${label} into ${c.name}`);
          }
        }
        if (step.op === 'set') {
          x.attackBase = step.attack!;
          x.attack = step.attack!;
          x.modifiers = (x.modifiers ?? []).map((m) => ({ ...m, attack: 0 }));
          note(s, `${label}'s Attack is set to ${step.attack}`);
        }
        if (step.op === 'swap') {
          const atk = x.attack,
            hp = x.health;
          x.attackBase = x.card.attack ?? 0;
          x.attack = hp;
          x.health = atk;
          x.maxHealth = atk;
          x.modifiers = [
            {
              sourceCardId: source.id,
              sourceName: source.name,
              attack: hp - (x.card.attack ?? 0),
              health: atk - (x.card.health ?? 1),
            },
          ];
          note(s, `${label} swaps Attack and Health`);
        }
        if (step.op === 'bounce') {
          const controller = s.players[t.p];
          const owner = s.players[x.commander ? (x.commanderOwner ?? t.p) : t.p];
          if (owner.hand.length >= (owner.maxHandSize ?? 10)) {
            x.health = 0;
            note(s, `${label} is destroyed because its owner's hand is full`);
            continue;
          }
          controller.board = controller.board.filter((u) => u.uid !== x.uid);
          const c = printedCard(x.card);
          if (step.reduction) {
            c.printedCost ??= c.cost;
            c.cost = Math.max(0, c.cost - step.reduction);
          }
          if (step.setCost != null) {
            c.printedCost ??= c.cost;
            c.cost = step.setCost;
          }
          if (step.expires === 'turn') {
            c.cost = c.printedCost ?? c.cost;
            (c.temporaryCosts ??= []).push({
              turn: s.turn,
              set: step.setCost ?? undefined,
              reduction: step.reduction,
              source: source.name,
            });
          }
          if (step.attack || step.health)
            c.modifiers = [
              {
                sourceCardId: source.id,
                sourceName: source.name,
                attack: step.attack ?? 0,
                health: step.health ?? 0,
              },
            ];
          if (owner.hand.length < (owner.maxHandSize ?? 10)) {
            owner.hand.push({ ...c, heldSince: s.events?.length ?? 0 });
            if (x.commander) owner.zone = 'hand';
          } else {
            owner.grave.push(printedCard(c));
            if (x.commander) {
              owner.zone = 'command';
              owner.replacement = true;
            }
          }
          note(s, `${label} returns to its owner's hand`);
        }
      }
      if (step.op === 'missiles') settle(s);
    }
  }
}
function runEffect(
  s: Game,
  player: number,
  e: Effect,
  target?: Target,
  position = s.players[player].board.length,
  source?: Card,
  sourceUid?: number,
) {
  const p = s.players[player];
  if (e.type === 'script') {
    runScript(s, player, e.steps, target, position, source!, sourceUid);
    return;
  }
  if (e.type === 'sequence') {
    for (const step of e.effects) runEffect(s, player, step, target, position, source, sourceUid);
    return;
  }
  if (e.type === 'armor') {
    for (const owner of e.allHeroes ? s.players : [p]) {
      if (owner.health <= 0) continue;
      owner.armor += e.amount;
      event(s, s.players.indexOf(owner), 'armor-change', e.amount);
      note(s, `${owner.name} gains ${e.amount} Armor (${owner.armor} total)`);
    }
  }
  if (e.type === 'self-damage' && p.health > 0) {
    const before = p.health,
      armor = p.armor;
    damage(s, { p: player }, e.amount);
    note(
      s,
      `${p.name}'s hero takes ${e.amount} self-damage (${before} → ${p.health} health; ${armor} → ${p.armor} Armor)`,
    );
  }
  if (e.type === 'draw') {
    note(s, `${p.name} draws ${e.amount} card${e.amount === 1 ? '' : 's'}`);
    for (let i = 0; i < e.amount && p.health > 0; i++) draw(s, player);
  }
  if ((e.type === 'damage' || e.type === 'heal' || e.type === 'buff') && target) {
    const t = getTarget(s, target);
    const name = 'card' in t ? `${s.players[target.p].name}'s ${t.card.name}` : `${t.name}'s hero`;
    if (e.type === 'damage') note(s, `${name} takes ${damage(s, target, e.amount)} damage`);
    if (e.type === 'heal') {
      note(s, `${name} restores ${heal(t, e.amount, p, s)} health`);
    }
    if (e.type === 'buff' && 'attack' in t) applyStatModifier(s, t, target.p, e, source);
  }
  if (e.type === 'self-buff') {
    const unit = p.board.find((u) => u.uid === sourceUid);
    if (unit) applyStatModifier(s, unit, player, e, source);
  }
  if (e.type === 'summon') {
    for (let i = 0; i < e.amount; i++) {
      if (p.board.length >= 7) {
        note(s, `${e.token.name} summon skipped: battlefield full`);
        break;
      }
      summon(s, player, e.token, false, Math.min(position + i, p.board.length));
    }
  }
  if (e.type === 'zone-buff') {
    const modifier: StatModifier = {
      sourceCardId: source!.id,
      sourceName: source!.name,
      attack: e.attack,
      health: e.health,
    };
    const eligible = p.hand
      .map((c, index) => (c.type === 'MINION' ? index : -1))
      .filter((index) => index >= 0);
    const selected = new Set(
      e.random && eligible.length
        ? [eligible[random(s, eligible.length)]]
        : e.random
          ? []
          : eligible,
    );
    p.hand = p.hand.map((c, index) =>
      selected.has(index) ? { ...c, modifiers: [...(c.modifiers ?? []), { ...modifier }] } : c,
    );
    let affected = selected.size;
    if (e.zone === 'hand-deck')
      p.deck = p.deck.map((c) => {
        if (c.type !== 'MINION') return c;
        affected++;
        return { ...c, modifiers: [...(c.modifiers ?? []), { ...modifier }] };
      });
    note(
      s,
      `${p.name}'s ${source!.name} grants +${e.attack}/+${e.health} to ${affected} minion card${affected === 1 ? '' : 's'} in ${e.zone === 'hand-deck' ? 'hand and deck' : 'hand'}${e.random ? ' (seeded random choice)' : ''}`,
    );
  }
  if (e.type === 'healing-bonus') {
    (p.effects ??= []).push({
      kind: 'healing-bonus',
      amount: e.amount,
      sourceCardId: source!.id,
      sourceName: source!.name,
    });
    note(
      s,
      `${p.name} gains +${e.amount} healing for the rest of the game from ${source!.name} (total +${healingBonus(p)})`,
    );
  }
  if (e.type === 'heal-friendly') {
    for (const t of [p, ...p.board]) heal(t, e.amount, p, s);
    note(
      s,
      `${p.name} restores up to ${e.amount + healingBonus(p)} health to all friendly characters`,
    );
  }
  if (e.type === 'enemy-heroes') {
    // Untargeted "enemy hero" effects apply to every living opponent in Commander.
    // Apply the full group before settling deaths so the damage is simultaneous.
    const enemies = s.players
      .map((x, i) => (i !== player && x.health > 0 ? i : -1))
      .filter((i) => i >= 0);
    for (const enemy of enemies)
      note(
        s,
        `${s.players[enemy].name}'s hero takes ${damage(s, { p: enemy }, e.amount)} damage (all enemy heroes)`,
      );
  }
  if (e.type === 'wipe' || e.type === 'damage-all') {
    // Snapshot before damage so every member receives the effect before deaths resolve.
    const targets = s.players.flatMap((x, i) =>
      x.health <= 0 || (e.type === 'wipe' && i === player)
        ? []
        : [
            ...x.board.filter((u) => u.health > 0).map((u) => ({ p: i, uid: u.uid })),
            ...(e.type === 'damage-all' && e.heroes ? [{ p: i }] : []),
          ],
    );
    for (const t of targets) damage(s, t, e.amount);
    note(
      s,
      `${e.amount} damage to ${e.type === 'wipe' ? 'all enemy minions' : e.heroes ? 'ALL characters' : 'all minions'}`,
    );
  }
}
function resolve(s: Game) {
  const w = s.pending!;
  s.pending = null;
  const p = s.players[w.caster];
  // Validate against the pre-summon board: a minion cannot target itself with its Battlecry.
  const e = effectFor(w.card);
  const targeted = !!targetFor(e);
  const validTarget =
    e?.type === 'script' ||
    !targeted ||
    (!!w.target &&
      effectTargets(s, w.caster, w.card).some(
        (t) => t.p === w.target!.p && t.uid === w.target!.uid,
      ));
  let sourceUid: number | undefined;
  if (w.card.type === 'WEAPON') {
    destroyWeapon(s, w.caster);
    p.weapon = {
      card: w.card,
      attack: w.card.attack ?? 0,
      durability: w.card.durability || w.card.health || 0,
    };
  }
  if (w.card.type === 'MINION') {
    sourceUid = summon(s, w.caster, w.card, w.commander, w.position);
    p.board.find((u) => u.uid === sourceUid)!.playedCost = w.cost ?? handCost(p, w.card);
    if (w.command) p.casts++;
  }
  event(s, w.caster, 'play', undefined, w.card);
  if (sourceUid !== undefined) {
    const queued = [...(p.playEffects ?? [])];
    for (const q of queued)
      if (q.remaining > 0 && matchesCard(w.card, q.filter, p)) {
        q.remaining--;
        runScript(
          s,
          w.caster,
          q.steps,
          { p: w.caster, uid: sourceUid },
          w.position ?? 0,
          q.source,
          sourceUid,
        );
      }
    p.playEffects = queued.filter((q) => q.remaining > 0);
  }
  if (e && validTarget) {
    if (battlecryFor(w.card)) note(s, `${p.name}'s ${w.card.name} triggers Battlecry`);
    runEffect(s, w.caster, e, w.target, (w.position ?? p.board.length - 1) + 1, w.card, sourceUid);
  } else if (e && targeted) note(s, `${w.card.name} effect skipped: no valid target`);
  if (w.card.type === 'SPELL') p.grave.push(w.card);
  note(s, `${p.name} resolves ${w.card.name}`);
  settle(s);
}
function startTurn(s: Game) {
  const p = s.players[s.active];
  s.turn++;
  event(s, s.active, 'turn');
  p.maxMana = Math.min(10, p.maxMana + 1);
  p.lockedMana = Math.min(p.maxMana, p.overload ?? 0);
  p.overload = 0;
  p.mana = p.maxMana - p.lockedMana;
  if (p.lockedMana) note(s, `${p.name} has ${p.lockedMana} overloaded Mana Crystals`);
  p.powerUsed = false;
  p.heroAttack = 0;
  p.heroReady = true;
  for (const u of p.board) {
    u.ready = true;
    u.attacksRemaining = unitMechanics(u).includes('WINDFURY') ? 2 : 1;
    u.rushOnly = false;
  }
  draw(s, s.active);
  note(s, `${p.name}'s turn`);
  settle(s);
  if (s.winner === null && p.health <= 0) advance(s);
}
function advance(s: Game) {
  const ending = s.players[s.active];
  const effects = [...(ending.endEffects ?? [])];
  ending.endEffects = effects.filter((e) => !e.once);
  for (const e of effects) {
    if (ending.health <= 0 || s.winner !== null) break;
    if (
      e.once &&
      e.sourceUid !== undefined &&
      !ending.board.some((u) => u.uid === e.sourceUid && !u.silenced)
    )
      continue;
    runScript(s, s.active, e.steps, undefined, ending.board.length, e.source, e.sourceUid);
    settle(s);
  }
  if (s.winner !== null) return;
  expireTurnModifiers(s);
  for (const owner of s.players) {
    for (const zone of ['hand', 'deck'] as const) {
      for (const c of owner[zone])
        c.temporaryCosts = (c.temporaryCosts ?? []).filter((e) => e.turn > s.turn);
      const expired = owner[zone].filter(
        (c) =>
          zone === 'hand' && c.temporaryUntilTurn !== undefined && c.temporaryUntilTurn <= s.turn,
      );
      for (const c of expired) {
        owner.grave.push(printedCard(c));
        note(s, `${owner.name} discards Temporary ${c.name}`);
      }
      owner[zone] = owner[zone].filter((c) => !expired.includes(c));
    }
  }
  for (const owner of s.players)
    for (const u of owner.board) {
      u.temporaryKeywords = (u.temporaryKeywords ?? []).filter((k) => k.turn > s.turn);
      u.keywordSources = (u.keywordSources ?? []).filter(
        (k) => k.expiresAtTurn === undefined || k.expiresAtTurn > s.turn,
      );
    }
  const p = s.players[s.active];
  for (const x of [p, ...p.board])
    if (x.frozen) {
      if (x.freezeSkipEnd) x.freezeSkipEnd = false;
      else x.frozen = false;
    }
  p.reserve = p.health > 0 ? Math.min(3, p.reserve + p.mana) : 0;
  p.mana = 0;
  p.heroAttack = 0;
  do {
    s.active = (s.active + 1) % 4;
  } while (s.players[s.active].health <= 0);
  startTurn(s);
}
export function createGame(
  cards: Card[],
  seed = 42,
  localDeck?: Card[],
  commander?: Card,
  localClass = 'HUNTER',
  seats?: { cards: Card[]; commander: Card; class: string; opening?: string[] }[],
): Game {
  const pool = cards.filter((c) => supported(c) && (c.type === 'MINION' || c.type === 'SPELL'));
  if (!pool.length) throw Error('No supported cards');
  const leaders = cards.filter((c) => c.type === 'MINION' && c.rarity === 'LEGENDARY');
  const fallback = leaders.find((c) => c.id === 'EX1_543') ?? leaders[0] ?? pool[0];
  const keywordSamples = new Set(
    ['TAUNT', 'DIVINE_SHIELD', 'CHARGE', 'RUSH', 'WINDFURY', 'POISONOUS', 'LIFESTEAL'].flatMap(
      (keyword) => {
        const sample = pool.find(
          (c) => c.type === 'MINION' && c.name !== fallback.name && c.mechanics?.includes(keyword),
        );
        return sample ? [sample.name] : [];
      },
    ),
  );
  const expandedSamples = new Set<string>();
  const seenOps = new Set<string>();
  const scan = (steps: ScriptStep[], name: string) => {
    for (const step of steps) {
      if (!seenOps.has(step.op)) {
        seenOps.add(step.op);
        expandedSamples.add(name);
      }
      if (step.steps) scan(step.steps, name);
    }
  };
  for (const c of pool)
    if (expandedBattlecries[c.id]) scan(expandedBattlecries[c.id].steps, c.name);
  const legacy = (c: Card) =>
    !!(battlecries[c.id.replace(/^CORE_/, '')] || deathrattles[c.id.replace(/^CORE_/, '')]);
  const s: Game = {
    catalogVersion,
    starterSandbox: !localDeck,
    version: 1,
    seed,
    active: 0,
    turn: 0,
    nextId: 1,
    players: [],
    pending: null,
    winner: null,
    log: ['Local rules sandbox · unsupported effects are blocked.'],
  };
  for (let i = 0; i < 4; i++) {
    const seat = seats?.[i];
    const deck = shuffle(s, [
      ...(seat
        ? seat.cards
        : i === 0 && localDeck
          ? localDeck
          : [
              ...new Map(
                shuffle(s, [...pool])
                  .filter(
                    (c) =>
                      (c.cardClass === 'NEUTRAL' ||
                        c.cardClass === 'HUNTER' ||
                        !!battlecryFor(c) ||
                        !!deathrattleFor(c) ||
                        keywordSamples.has(c.name)) &&
                      c.name !== fallback.name,
                  )
                  .map((c) => [c.name, c]),
              ).values(),
            ]
              // Keep every implemented trigger family in the test deck before filling
              // remaining slots; source-file ordering used to exclude later expansions.
              .sort(
                (a, b) =>
                  (legacy(a)
                    ? 0
                    : keywordSamples.has(a.name)
                      ? 1
                      : expandedSamples.has(a.name)
                        ? 2
                        : battlecryFor(a) || deathrattleFor(a)
                          ? 3
                          : 4) -
                  (legacy(b)
                    ? 0
                    : keywordSamples.has(b.name)
                      ? 1
                      : expandedSamples.has(b.name)
                        ? 2
                        : battlecryFor(b) || deathrattleFor(b)
                          ? 3
                          : 4),
              )
              .slice(0, 100)),
    ]);
    if (seat?.opening) {
      const order = new Map(seat.opening.map((name, index) => [name, index]));
      deck.sort((a, b) => (order.get(a.name) ?? 100) - (order.get(b.name) ?? 100));
    }
    const p: Player = {
      name: ['You', 'Ember', 'Thorne', 'Lyra'][i],
      class: seat?.class ?? (i === 0 ? localClass : 'HUNTER'),
      health: 40,
      armor: 0,
      mana: 0,
      maxMana: 0,
      reserve: 0,
      fatigue: 0,
      hand: [],
      deck,
      board: [],
      grave: [],
      commander: seat?.commander ?? (i === 0 && commander ? commander : fallback),
      zone: 'command',
      casts: 0,
      reduction: 0,
      handReduction: 0,
      powerUsed: false,
      heroAttack: 0,
      heroReady: true,
      replacement: false,
      effects: [],
    };
    s.players.push(p);
    for (let j = 0; j < 4; j++) draw(s, i);
  }
  startTurn(s);
  return s;
}
export function applyAction(state: Game, a: Action): Game {
  if (state.catalogVersion && state.catalogVersion !== catalogVersion)
    throw Error('Replay card catalog differs from this build');
  if (!a || !Number.isInteger(a.p) || a.p < 0 || a.p > 3) throw Error('Invalid player');
  if (a.type === 'commander-destination' && !['hand', 'command', 'grave'].includes(a.destination))
    throw Error('Invalid commander destination');
  const s = structuredClone(state);
  if (s.winner !== null) throw Error('Match is over');
  const p = s.players[a.p];
  if (!p || p.health <= 0) throw Error('Player is eliminated');
  if (s.choice) {
    const choice = s.choice;
    if (a.type !== 'choose' || a.p !== choice.player) throw Error('Finish the card choice first');
    if (!Number.isInteger(a.index) || a.index < 0 || a.index >= choice.options.length)
      throw Error('Invalid card choice');
    const c = structuredClone(choice.options[a.index]);
    if (choice.step.zone === 'hand' && !choice.step.copy) {
      const index = p.hand.findIndex(
        (x) => JSON.stringify(x) === JSON.stringify(choice.options[a.index]),
      );
      if (index < 0) throw Error('Chosen card is no longer in hand');
      p.hand.splice(index, 1);
    }
    if (choice.step.zone === 'deck' && !choice.step.copy) {
      const index = p.deck.findIndex(
        (x) => JSON.stringify(x) === JSON.stringify(choice.options[a.index]),
      );
      if (index < 0) throw Error('Chosen card is no longer in deck');
      p.deck.splice(index, 1);
    }
    const destinationOwner =
      choice.step.zone === 'enemy-deck' && choice.step.mode === 'dredge' ? choice.step.owner! : a.p;
    if (destinationOwner !== a.p) {
      const deck = s.players[destinationOwner].deck;
      const index = deck.findIndex(
        (x) => JSON.stringify(x) === JSON.stringify(choice.options[a.index]),
      );
      if (index < 0) throw Error('Chosen card is no longer in deck');
      deck.splice(index, 1);
    }
    if (choice.step.setCost !== undefined && choice.step.setCost !== null) {
      c.printedCost ??= c.cost;
      c.cost = choice.step.setCost;
    }
    if (choice.step.reduction) {
      c.printedCost ??= c.cost;
      c.cost = Math.max(0, c.cost - choice.step.reduction);
    }
    if (choice.step.after === 'armor') {
      p.armor += c.cost;
      event(s, a.p, 'armor-change', c.cost);
    }
    if (choice.step.after === 'heal') heal(p, c.cost, p, s);
    if (choice.step.after === 'damage') damage(s, { p: a.p }, c.cost);
    if (choice.step.after === 'source-attack') {
      const self = p.board.find((u) => u.uid === choice.sourceUid);
      if (self)
        (c.modifiers ??= []).push({
          sourceCardId: choice.source.id,
          sourceName: choice.source.name,
          attack: self.attack,
          health: 0,
        });
    }
    const matching = matchesCard(c, choice.step.filter, p);
    const self = p.board.find((u) => u.uid === choice.sourceUid);
    if (matching && choice.step.after === 'buff-matching' && self)
      (c.modifiers ??= []).push({
        sourceCardId: choice.source.id,
        sourceName: choice.source.name,
        attack: self.attack,
        health: self.health,
      });
    if (matching && choice.step.after === 'damage-matching')
      runScript(
        s,
        a.p,
        [{ op: 'damage', scope: 'enemy-heroes', amount: choice.step.amount }],
        undefined,
        choice.position,
        choice.source,
        choice.sourceUid,
      );
    const summonChosen =
      matching &&
      ['summon-matching', 'copy-matching'].includes(choice.step.after ?? '') &&
      p.board.length < 7;
    if (summonChosen) {
      const uid = summon(s, a.p, c, false, Math.min(choice.position, p.board.length));
      const u = p.board.find((u) => u.uid === uid)!;
      if (choice.step.attack !== undefined) {
        u.attackBase = u.attack = choice.step.attack;
        u.health = u.maxHealth = choice.step.health!;
        u.modifiers = [];
      }
    }
    if (choice.step.after === 'enemy-draw') {
      for (const [i, owner] of s.players.entries())
        if (i === choice.step.owner && owner.health > 0) {
          const index = owner.deck.findIndex(
            (x) => JSON.stringify(x) === JSON.stringify(choice.options[a.index]),
          );
          if (index >= 0) addGenerated(s, i, owner.deck.splice(index, 1)[0]);
        }
    }
    delete s.choice;
    if (choice.step.destination === 'shuffle') {
      p.deck.splice(random(s, p.deck.length + 1), 0, c);
      note(s, `${choice.source.name} shuffles the chosen card into ${p.name}'s deck`);
    } else if (matching && choice.step.after === 'draw-matching') addGenerated(s, a.p, c);
    else if (summonChosen && choice.step.after === 'summon-matching') {
      /* Card moved from deck to board. */
    } else if (choice.step.destination === 'top') {
      s.players[destinationOwner].deck.unshift(c);
      note(s, `${choice.source.name} arranges ${p.name}'s next draw`);
    } else addGenerated(s, a.p, c);
    note(s, `${p.name} completes ${choice.source.name}'s card choice`);
    runScript(
      s,
      a.p,
      choice.remaining,
      choice.target,
      choice.position,
      choice.source,
      choice.sourceUid,
    );
    settle(s);
    if (s.winner === null && s.players[s.active].health <= 0) advance(s);
    return s;
  }
  if (a.type === 'choose') throw Error('No card choice is pending');
  if (s.pending) {
    if (a.type !== 'pass' && a.type !== 'interrupt')
      throw Error('Resolve clockwise priority first');
    if (s.pending.queue[0] !== a.p) throw Error('Not your priority');
    if (a.type === 'interrupt') {
      if (p.reserve < 3) throw Error('Need 3 reserve');
      p.reserve -= 3;
      const w = s.pending,
        caster = s.players[w.caster];
      if (w.command) caster.zone = 'command';
      else if (caster.hand.length < (caster.maxHandSize ?? 10)) caster.hand.push(w.card);
      else caster.grave.push(printedCard(w.card));
      note(s, `${p.name} interrupts ${w.card.name}`);
      s.pending = null;
    } else {
      s.pending.queue.shift();
      note(s, `${p.name} passes`);
      if (!s.pending.queue.length) resolve(s);
    }
    if (s.winner === null && s.players[s.active].health <= 0) advance(s);
    return s;
  }
  if (a.type === 'commander-destination') {
    if (!p.replacement || !['command', 'grave', 'hand'].includes(p.zone))
      throw Error('Commander is still on battlefield');
    p.hand = p.hand.filter((c) => c.id !== p.commander.id);
    p.grave = p.grave.filter((c) => c.id !== p.commander.id);
    p.zone = a.destination;
    p.replacement = false;
    if (a.destination === 'hand') {
      if (p.hand.length >= (p.maxHandSize ?? 10)) throw Error('Hand full');
      p.hand.push({ ...p.commander, heldSince: s.events?.length ?? 0 });
    }
    if (a.destination === 'grave') p.grave.push(p.commander);
    note(s, `${p.name} chooses commander destination: ${a.destination}`);
    return s;
  }
  if (a.p !== s.active) throw Error('Not your turn');
  if (a.type === 'cast') {
    const c = a.command ? p.commander : p.hand[a.index ?? -1];
    if (!c) throw Error('Card missing');
    if (a.command && p.zone !== 'command') throw Error('Commander not in command zone');
    if (!supported(c)) throw Error('This card effect is not implemented');
    if (!['MINION', 'SPELL', 'WEAPON'].includes(c.type)) throw Error('Card type unsupported');
    if (c.type === 'MINION' && p.board.length >= 7) throw Error('Seven minion limit');
    if (
      a.position !== undefined &&
      (c.type !== 'MINION' ||
        !Number.isInteger(a.position) ||
        a.position < 0 ||
        a.position > p.board.length)
    )
      throw Error('Invalid minion placement');
    const cost = a.command ? commandCost(p) : handCost(p, c);
    if (p.mana < cost) throw Error('Not enough regular mana');
    const targetError = effectTargetError(s, a.p, c, a.target);
    if (targetError) throw Error(targetError);
    const chosenTarget =
      targetFor(effectFor(c)) && effectTargets(s, a.p, c).length ? a.target : undefined;
    p.mana -= cost;
    p.nextDiscounts = (p.nextDiscounts ?? []).filter((d) => !matchesCard(c, d.filter, p));
    if (c.id === p.commander.id) p.replacement = false;
    if (!a.command) p.hand.splice(a.index!, 1);
    const queue: number[] = [];
    for (let j = 1; j < 4; j++) {
      const n = (a.p + j) % 4;
      if (s.players[n].health > 0 && s.players[n].reserve >= 3) queue.push(n);
    }
    s.pending = {
      cost,
      caster: a.p,
      card: c,
      command: !!a.command,
      commander: c.id === p.commander.id,
      queue,
      target: chosenTarget,
      position: a.position,
    };
    note(s, `${p.name} casts ${c.name} for ${cost}`);
    if (!queue.length) resolve(s);
  } else if (a.type === 'end') advance(s);
  else if (a.type === 'attack') {
    const error = attackError(s, a.p, a.uid, a.target);
    if (error) throw Error(error);
    const u = a.uid === undefined ? null : p.board.find((u) => u.uid === a.uid);
    const atk = u?.attack ?? p.heroAttack + (p.weapon?.attack ?? 0);
    if (u) u.stealth = false;
    else event(s, a.p, 'hero-attack');
    const t = getTarget(s, a.target),
      enemy = s.players[a.target.p];
    const defendingArmor = 'card' in t ? 0 : t.armor;
    const defendingHealth = t.health;
    const dealt = damage(s, a.target, atk);
    const lifestealHeals: string[] = [];
    const restoreLifesteal = (owner: Player, source: Unit, amount: number) => {
      const restored = heal(owner, amount, owner, s);
      if (restored > 0)
        lifestealHeals.push(
          `${owner.name}'s ${source.card.name} Lifesteal restores ${restored} health (${owner.health - restored} → ${owner.health})`,
        );
    };
    if (dealt > 0 && u && unitMechanics(u).includes('POISONOUS') && 'attack' in t) t.health = 0;
    let retaliation = 0;
    if ('attack' in t) {
      retaliation = damage(s, { p: a.p, uid: u?.uid }, t.attack);
      if (retaliation > 0 && unitMechanics(t).includes('POISONOUS') && u) u.health = 0;
      if (unitMechanics(t).includes('LIFESTEAL')) restoreLifesteal(enemy, t, retaliation);
    }
    if (u) {
      u.attacksRemaining--;
      u.ready = u.attacksRemaining > 0;
      if (unitMechanics(u).includes('LIFESTEAL')) restoreLifesteal(p, u, dealt);
    } else {
      p.heroReady = false;
      if (p.weapon && --p.weapon.durability <= 0) {
        destroyWeapon(s, a.p);
      }
    }
    if (dealt > 0 && u && !u.silenced && freezesOnDamage(u.card)) freezeCharacter(s, a.target);
    // A freezing defender must have dealt damage through any Shield/Immunity.
    if (retaliation > 0 && 'card' in t && !t.silenced && freezesOnDamage(t.card))
      freezeCharacter(s, { p: a.p, uid: u?.uid });
    note(
      s,
      `${u?.card.name ?? p.name} attacks ${'card' in t ? `${enemy.name}'s ${t.card.name}` : `${enemy.name}'s hero`} for ${dealt}${'card' in t ? `; defender ${Math.max(0, t.health)}/${t.maxHealth} health` : `; Armor ${defendingArmor} → ${t.armor}; Health ${defendingHealth} → ${t.health}`}${u ? `; attacker ${Math.max(0, u.health)}/${u.maxHealth} health` : ''}`,
    );
    lifestealHeals.forEach((message) => note(s, message));
    settle(s);
  } else if (a.type === 'power') {
    if (p.powerUsed || p.mana < 2) throw Error('Hero power unavailable');
    if (!['MAGE', 'PRIEST', 'HUNTER', 'WARLOCK', 'WARRIOR'].includes(p.class))
      throw Error('This class power is not implemented yet');
    if (['MAGE', 'PRIEST'].includes(p.class) && !a.target) throw Error('Choose a target');
    if (a.target && ['MAGE', 'PRIEST'].includes(p.class)) getTarget(s, a.target);
    p.mana -= 2;
    event(s, a.p, 'power');
    p.powerUsed = true;
    if (p.class === 'MAGE') damage(s, a.target!, 1);
    if (p.class === 'PRIEST') {
      const t = getTarget(s, a.target!);
      heal(t, 2, p, s);
    }
    if (p.class === 'HUNTER') runEffect(s, a.p, { type: 'enemy-heroes', amount: 2 });
    if (p.class === 'WARLOCK') {
      damage(s, { p: a.p }, 2);
      draw(s, a.p);
    }
    if (p.class === 'WARRIOR') {
      p.armor += 2;
      event(s, a.p, 'armor-change', 2);
    }
    if (p.class === 'ROGUE') p.heroAttack = 1;
    if (p.class === 'DRUID') {
      p.heroAttack += 1;
      p.armor += 1;
    }
    note(s, `${p.name} uses class power`);
    settle(s);
  } else throw Error('Invalid action');
  if (s.winner === null && s.players[s.active].health <= 0) advance(s);
  return s;
}
export function debugAction(state: Game, a: DebugAction): Game {
  if (state.catalogVersion && state.catalogVersion !== catalogVersion)
    throw Error('Replay card catalog differs from this build');
  const s = structuredClone(state);
  if (s.pending) throw Error('Finish priority before editing');
  if (s.choice) throw Error('Finish the card choice before editing');
  if (a.type === 'advance') {
    if (s.winner !== null) throw Error('Match over');
    advance(s);
  } else {
    const p = s.players[a.p];
    if (!p) throw Error('Invalid player');
    if (a.type === 'edit') {
      if (!Number.isFinite(a.value)) throw Error('Invalid value');
      p[a.field] = Math.max(
        a.field === 'health' ? 0 : 0,
        Math.min(a.field === 'reserve' ? 3 : a.field === 'mana' ? 10 : 999, Math.floor(a.value)),
      );
      if (a.field === 'mana') p.maxMana = Math.max(p.maxMana, p.mana);
    } else if (a.type === 'add') {
      if (p.hand.length >= (p.maxHandSize ?? 10)) throw Error('Hand full');
      p.hand.push({ ...structuredClone(a.card), heldSince: s.events?.length ?? 0 });
    } else {
      if (a.card.type !== 'MINION') throw Error('Only minions can be summoned');
      summon(s, a.p, a.card);
    }
    note(s, `Developer action: ${a.type}`);
    settle(s);
    if (s.winner === null && s.players[s.active].health <= 0) advance(s);
  }
  return s;
}
export function botAction(s: Game): Action | null {
  if (s.choice) return { type: 'choose', p: s.choice.player, index: 0 };
  if (s.pending) return { type: 'pass', p: s.pending.queue[0] };
  const p = s.active,
    x = s.players[p];
  const enemy = [1, 2, 3].map((n) => (p + n) % 4).find((i) => s.players[i].health > 0)!;
  for (const u of x.board) {
    if (attackReadinessError(s, p, u.uid)) continue;
    for (const other of [1, 2, 3].map((n) => (p + n) % 4).filter((i) => s.players[i].health > 0)) {
      const targets: Target[] = [
        { p: other },
        ...s.players[other].board.map((t) => ({ p: other, uid: t.uid })),
      ];
      const target = targets.find((t) => !attackError(s, p, u.uid, t));
      if (target) return { type: 'attack', p, uid: u.uid, target };
    }
  }
  const i = x.hand.findIndex(
    (c) =>
      supported(c) &&
      c.cost <= x.mana &&
      (c.type !== 'MINION' || x.board.length < 7) &&
      (!targetFor(effectFor(c)) || c.type === 'MINION' || effectTargets(s, p, c).length > 0),
  );
  if (i >= 0) {
    const c = x.hand[i],
      targets = effectTargets(s, p, c);
    const effect = effectFor(c);
    const healing =
      (effect?.type === 'script' &&
        ['heal', 'buff', 'keyword', 'immune'].includes(scriptTarget(effect.steps)?.op ?? '')) ||
      effect?.type === 'heal' ||
      (effect?.type === 'buff' && effect.attack >= 0 && effect.health >= 0);
    const target = targets.find((t) => (healing ? t.p === p : t.p === enemy)) ?? targets[0];
    return { type: 'cast', p, index: i, target };
  }
  return { type: 'end', p };
}
export interface Replay {
  version: 1;
  initial: Game;
  actions: (Action | DebugAction)[];
}
export function replay(r: Replay): Game {
  if (r.version !== 1 || !r.initial || !Array.isArray(r.actions) || r.actions.length > 10000)
    throw Error('Invalid replay');
  return r.actions.reduce(
    (s, a) =>
      ['edit', 'add', 'summon', 'advance'].includes(a.type)
        ? debugAction(s, a as DebugAction)
        : applyAction(s, a as Action),
    structuredClone(r.initial),
  );
}
