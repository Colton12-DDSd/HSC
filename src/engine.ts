import { cardStats, type Card, type StatModifier } from './cards';
export type Target = { p: number; uid?: number };
import {
  effectFor,
  supported,
  battlecryFor,
  deathrattleFor,
  targetFor,
  type Effect,
} from './effects';
export { effectFor, supported } from './effects';
export interface Unit {
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
  caster: number;
  card: Card;
  command: boolean;
  commander: boolean;
  queue: number[];
  target?: Target;
  position?: number;
}
export interface Game {
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
    if (x.hand.length < 10) x.hand.push(c);
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
  return Math.max(1, p.commander.cost + 2 * p.casts - p.reduction - p.handReduction);
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
  if (s.pending) return 'Finish interruption priority first';
  if (s.active !== player) return 'Not your turn';
  const unit = uid === undefined ? null : p.board.find((u) => u.uid === uid);
  if (uid !== undefined && !unit) return 'Attacker is no longer on the board';
  if ((unit?.attack ?? p.heroAttack) <= 0) return 'This character has no attack';
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
  if (unit?.rushOnly && target.uid === undefined) return 'Rush can only attack minions this turn';
  if (
    s.players[target.p].board.some((u) => u.card.mechanics?.includes('TAUNT')) &&
    (!('card' in defender) || !defender.card.mechanics?.includes('TAUNT'))
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
function heal(target: Player | Unit, amount: number, controller?: Player) {
  // Absorbed/zero damage must never manufacture a Lifesteal heal.
  if (amount > 0 && controller) amount += healingBonus(controller);
  const before = target.health;
  target.health =
    'maxHealth' in target
      ? Math.min(target.maxHealth, target.health + amount)
      : target.health + amount;
  return target.health - before;
}
function damage(s: Game, t: Target, n: number) {
  const x = getTarget(s, t);
  const dealt = n;
  if ('shield' in x && x.shield && n > 0) {
    x.shield = false;
    return 0;
  }
  if ('armor' in x) {
    const absorbed = Math.min(x.armor, n);
    x.armor -= absorbed;
    n -= absorbed;
  }
  x.health -= n;
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
        p.zone = 'command';
        p.replacement = true;
        note(s, `${u.card.name} returns to command zone (default replacement)`);
      } else p.grave.push(u.card);
      if (deathrattleFor(u.card)) queue.push(entry);
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
    note(s, `${s.players[player].name}'s ${unit.card.name} triggers Deathrattle`);
    const before = s.nextId;
    runEffect(s, player, deathrattleFor(unit.card)!, undefined, position, unit.card);
    const summoned = board.filter((u) => u.uid >= before).map((u) => u.uid);
    layout.splice(marker, 0, ...summoned);
  }
}
function printedCard(c: Card): Card {
  const { modifiers: _modifiers, ...printed } = c;
  return printed;
}
function summon(
  s: Game,
  p: number,
  c: Card,
  commander = false,
  position = s.players[p].board.length,
) {
  const x = s.players[p];
  if (x.board.length >= 7) throw Error('Battlefield is full');
  x.board.splice(position, 0, {
    uid: s.nextId++,
    card: printedCard(c),
    attackBase: c.attack ?? 0,
    attack: cardStats(c).attack,
    health: cardStats(c).health,
    maxHealth: cardStats(c).health,
    ready: !!c.mechanics?.some((m) => m === 'CHARGE' || m === 'RUSH'),
    rushOnly: !!c.mechanics?.includes('RUSH') && !c.mechanics?.includes('CHARGE'),
    shield: !!c.mechanics?.includes('DIVINE_SHIELD'),
    commander,
    attacksRemaining: c.mechanics?.includes('WINDFURY') ? 2 : 1,
    modifiers: structuredClone(c.modifiers ?? []),
  });
  if (commander) x.zone = 'board';
  note(s, `${x.name} summons ${c.name} at position ${position + 1}`);
  return x.board[position].uid;
}
export function effectTargets(s: Game, player: number, card: Card): Target[] {
  const rule = targetFor(effectFor(card));
  if (!rule) return [];
  return s.players.flatMap((p, index) =>
    p.health <= 0
      ? []
      : [
          ...(rule === 'minion' ||
          rule === 'friendly-minion' ||
          (rule === 'enemy-hero' && index === player)
            ? []
            : [{ p: index }]),
          ...(rule === 'enemy-hero' || (rule === 'friendly-minion' && index !== player)
            ? []
            : p.board.filter((u) => u.health > 0).map((u) => ({ p: index, uid: u.uid }))),
        ],
  );
}
export function effectTargetError(
  s: Game,
  player: number,
  card: Card,
  target?: Target,
): string | null {
  const rule = targetFor(effectFor(card));
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
  if (e.type === 'draw') {
    note(s, `${p.name} draws ${e.amount} card${e.amount === 1 ? '' : 's'}`);
    for (let i = 0; i < e.amount && p.health > 0; i++) draw(s, player);
  }
  if ((e.type === 'damage' || e.type === 'heal' || e.type === 'buff') && target) {
    const t = getTarget(s, target);
    const name = 'card' in t ? `${s.players[target.p].name}'s ${t.card.name}` : `${t.name}'s hero`;
    if (e.type === 'damage') note(s, `${name} takes ${damage(s, target, e.amount)} damage`);
    if (e.type === 'heal') {
      note(s, `${name} restores ${heal(t, e.amount, p)} health`);
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
    for (const t of [p, ...p.board]) heal(t, e.amount, p);
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
    !targeted ||
    (!!w.target &&
      effectTargets(s, w.caster, w.card).some(
        (t) => t.p === w.target!.p && t.uid === w.target!.uid,
      ));
  let sourceUid: number | undefined;
  if (w.card.type === 'MINION') {
    sourceUid = summon(s, w.caster, w.card, w.commander, w.position);
    if (w.command) p.casts++;
  }
  if (e && validTarget) {
    if (battlecryFor(w.card)) note(s, `${p.name}'s ${w.card.name} triggers Battlecry`);
    runEffect(s, w.caster, e, w.target, (w.position ?? p.board.length - 1) + 1, w.card, sourceUid);
  } else if (e && targeted) note(s, `${w.card.name} effect skipped: no valid target`);
  if (w.card.type !== 'MINION') p.grave.push(w.card);
  note(s, `${p.name} resolves ${w.card.name}`);
  settle(s);
}
function startTurn(s: Game) {
  const p = s.players[s.active];
  s.turn++;
  p.maxMana = Math.min(10, p.maxMana + 1);
  p.mana = p.maxMana;
  p.powerUsed = false;
  p.heroAttack = 0;
  p.heroReady = true;
  for (const u of p.board) {
    u.ready = true;
    u.attacksRemaining = u.card.mechanics?.includes('WINDFURY') ? 2 : 1;
    u.rushOnly = false;
  }
  draw(s, s.active);
  note(s, `${p.name}'s turn`);
  settle(s);
  if (s.winner === null && p.health <= 0) advance(s);
}
function advance(s: Game) {
  expireTurnModifiers(s);
  const p = s.players[s.active];
  p.reserve = p.health > 0 ? Math.min(3, p.reserve + p.mana) : 0;
  p.mana = 0;
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
  const s: Game = {
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
    const deck = shuffle(s, [
      ...(i === 0 && localDeck
        ? localDeck
        : [
            ...new Map(
              pool
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
                (battlecryFor(a) || deathrattleFor(a) ? 0 : keywordSamples.has(a.name) ? 1 : 2) -
                (battlecryFor(b) || deathrattleFor(b) ? 0 : keywordSamples.has(b.name) ? 1 : 2),
            )
            .slice(0, 100)),
    ]);
    const p: Player = {
      name: ['You', 'Ember', 'Thorne', 'Lyra'][i],
      class: i === 0 ? localClass : 'HUNTER',
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
      commander: i === 0 && commander ? commander : fallback,
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
  if (!a || !Number.isInteger(a.p) || a.p < 0 || a.p > 3) throw Error('Invalid player');
  if (a.type === 'commander-destination' && !['hand', 'command', 'grave'].includes(a.destination))
    throw Error('Invalid commander destination');
  const s = structuredClone(state);
  if (s.winner !== null) throw Error('Match is over');
  const p = s.players[a.p];
  if (!p || p.health <= 0) throw Error('Player is eliminated');
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
      else if (caster.hand.length < 10) caster.hand.push(w.card);
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
      if (p.hand.length >= 10) throw Error('Hand full');
      p.hand.push(p.commander);
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
    if (!['MINION', 'SPELL'].includes(c.type)) throw Error('Card type unsupported');
    if (c.type === 'MINION' && p.board.length >= 7) throw Error('Seven minion limit');
    if (
      a.position !== undefined &&
      (c.type !== 'MINION' ||
        !Number.isInteger(a.position) ||
        a.position < 0 ||
        a.position > p.board.length)
    )
      throw Error('Invalid minion placement');
    const cost = a.command ? commandCost(p) : Math.max(0, c.cost - p.reduction - p.handReduction);
    if (p.mana < cost) throw Error('Not enough regular mana');
    const targetError = effectTargetError(s, a.p, c, a.target);
    if (targetError) throw Error(targetError);
    const chosenTarget =
      targetFor(effectFor(c)) && effectTargets(s, a.p, c).length ? a.target : undefined;
    p.mana -= cost;
    if (c.id === p.commander.id) p.replacement = false;
    if (!a.command) p.hand.splice(a.index!, 1);
    const queue: number[] = [];
    for (let j = 1; j < 4; j++) {
      const n = (a.p + j) % 4;
      if (s.players[n].health > 0 && s.players[n].reserve >= 3) queue.push(n);
    }
    s.pending = {
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
    const atk = u?.attack ?? p.heroAttack;
    const t = getTarget(s, a.target),
      enemy = s.players[a.target.p];
    const dealt = damage(s, a.target, atk);
    const lifestealHeals: string[] = [];
    const restoreLifesteal = (owner: Player, source: Unit, amount: number) => {
      const restored = heal(owner, amount, owner);
      if (restored > 0)
        lifestealHeals.push(
          `${owner.name}'s ${source.card.name} Lifesteal restores ${restored} health (${owner.health - restored} → ${owner.health})`,
        );
    };
    if (dealt > 0 && u?.card.mechanics?.includes('POISONOUS') && 'attack' in t) t.health = 0;
    if ('attack' in t) {
      const retaliation = damage(s, { p: a.p, uid: u?.uid }, t.attack);
      if (retaliation > 0 && t.card.mechanics?.includes('POISONOUS') && u) u.health = 0;
      if (t.card.mechanics?.includes('LIFESTEAL')) restoreLifesteal(enemy, t, retaliation);
    }
    if (u) {
      u.attacksRemaining--;
      u.ready = u.attacksRemaining > 0;
      if (u.card.mechanics?.includes('LIFESTEAL')) restoreLifesteal(p, u, dealt);
    } else p.heroReady = false;
    note(
      s,
      `${u?.card.name ?? p.name} attacks ${'card' in t ? `${enemy.name}'s ${t.card.name}` : `${enemy.name}'s hero`} for ${dealt}${'card' in t ? `; defender ${Math.max(0, t.health)}/${t.maxHealth} health` : ''}${u ? `; attacker ${Math.max(0, u.health)}/${u.maxHealth} health` : ''}`,
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
    p.powerUsed = true;
    if (p.class === 'MAGE') damage(s, a.target!, 1);
    if (p.class === 'PRIEST') {
      const t = getTarget(s, a.target!);
      heal(t, 2, p);
    }
    if (p.class === 'HUNTER') runEffect(s, a.p, { type: 'enemy-heroes', amount: 2 });
    if (p.class === 'WARLOCK') {
      damage(s, { p: a.p }, 2);
      draw(s, a.p);
    }
    if (p.class === 'WARRIOR') p.armor += 2;
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
  const s = structuredClone(state);
  if (s.pending) throw Error('Finish priority before editing');
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
      if (p.hand.length >= 10) throw Error('Hand full');
      p.hand.push(a.card);
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
  if (s.pending) return { type: 'pass', p: s.pending.queue[0] };
  const p = s.active,
    x = s.players[p];
  const enemy = [1, 2, 3].map((n) => (p + n) % 4).find((i) => s.players[i].health > 0)!;
  for (const u of x.board)
    if (u.ready && u.attack > 0) {
      const t =
        s.players[enemy].board.find((v) => v.card.mechanics?.includes('TAUNT')) ??
        (u.rushOnly ? s.players[enemy].board[0] : undefined);
      if (!u.rushOnly || t)
        return { type: 'attack', p, uid: u.uid, target: { p: enemy, uid: t?.uid } };
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
