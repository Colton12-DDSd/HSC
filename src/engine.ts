import type { Card } from './cards';
export type Target = { p: number; uid?: number };
import { effectFor, supported } from './effects';
export { effectFor, supported } from './effects';
export interface Unit {
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
      x.grave.push(c);
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
/** Shared by the authoritative transition and target highlighting in the UI. */
export function attackError(
  s: Game,
  player: number,
  uid: number | undefined,
  target: Target,
): string | null {
  if (s.winner !== null) return 'Match is over';
  const p = s.players[player];
  if (!p || p.health <= 0) return 'Player is eliminated';
  if (s.pending) return 'Finish interruption priority first';
  if (s.active !== player) return 'Not your turn';
  const unit = uid === undefined ? null : p.board.find((u) => u.uid === uid);
  if (uid !== undefined && !unit) return 'Attacker is no longer on the board';
  if ((unit?.attack ?? p.heroAttack) <= 0) return 'This character has no attack';
  if (unit ? !unit.ready : !p.heroReady) return 'Attacker is exhausted or has summoning sickness';
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
function settle(s: Game) {
  for (const p of s.players) {
    p.board = p.board.filter((u) => {
      if (u.health > 0) return true;
      if (u.commander) {
        p.zone = 'command';
        p.replacement = true;
        note(s, `${u.card.name} returns to command zone (default replacement)`);
      } else p.grave.push(u.card);
      return false;
    });
    if (p.health <= 0) {
      p.board = [];
      p.reserve = 0;
    }
  }
  const alive = s.players.map((p, i) => (p.health > 0 ? i : -1)).filter((i) => i >= 0);
  if (alive.length <= 1) {
    s.winner = alive[0] ?? -1;
    s.pending = null;
    note(s, alive.length ? `${s.players[alive[0]].name} wins` : 'Draw');
  }
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
    card: c,
    attack: c.attack ?? 0,
    health: c.health ?? 1,
    maxHealth: c.health ?? 1,
    ready: !!c.mechanics?.some((m) => m === 'CHARGE' || m === 'RUSH'),
    rushOnly: !!c.mechanics?.includes('RUSH') && !c.mechanics?.includes('CHARGE'),
    shield: !!c.mechanics?.includes('DIVINE_SHIELD'),
    commander,
    attacksRemaining: c.mechanics?.includes('WINDFURY') ? 2 : 1,
  });
  if (commander) x.zone = 'board';
}
function resolve(s: Game) {
  const w = s.pending!;
  s.pending = null;
  const p = s.players[w.caster];
  if (w.card.type === 'MINION') {
    summon(s, w.caster, w.card, w.commander, w.position);
    if (w.command) p.casts++;
  }
  const e = effectFor(w.card);
  if (e) {
    if (e.type === 'draw') for (let i = 0; i < e.amount; i++) draw(s, w.caster);
    if (e.type === 'damage' && w.target) damage(s, w.target, e.amount);
    if (e.type === 'heal' && w.target) {
      const t = getTarget(s, w.target);
      t.health = Math.min('maxHealth' in t ? t.maxHealth : 40, t.health + e.amount);
    }
    if (e.type === 'buff' && w.target) {
      const t = getTarget(s, w.target);
      if ('attack' in t) {
        t.attack += e.attack;
        t.health += e.health;
        t.maxHealth += e.health;
      }
    }
    if (e.type === 'wipe')
      for (let i = 0; i < 4; i++)
        if (i !== w.caster)
          for (const u of s.players[i].board) damage(s, { p: i, uid: u.uid }, e.amount);
  }
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
  const p = s.players[s.active];
  p.reserve = Math.min(3, p.reserve + p.mana);
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
  const s: Game = {
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
                    (c.cardClass === 'NEUTRAL' || c.cardClass === 'HUNTER') &&
                    c.name !== fallback.name,
                )
                .map((c) => [c.name, c]),
            ).values(),
          ].slice(0, 100)),
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
      else caster.grave.push(w.card);
      note(s, `${p.name} interrupts ${w.card.name}`);
      s.pending = null;
    } else {
      s.pending.queue.shift();
      note(s, `${p.name} passes`);
      if (!s.pending.queue.length) resolve(s);
    }
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
    const effect = effectFor(c);
    if (effect && ['damage', 'heal', 'buff'].includes(effect.type)) {
      if (!a.target) throw Error('Choose a target');
      const t = getTarget(s, a.target);
      if (effect.type === 'buff' && (!('attack' in t) || a.target.p !== a.p))
        throw Error('Choose a friendly minion');
    }
    if (a.target) getTarget(s, a.target);
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
      target: a.target,
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
    if (dealt > 0 && u?.card.mechanics?.includes('POISONOUS') && 'attack' in t) t.health = 0;
    if ('attack' in t) {
      const retaliation = damage(s, { p: a.p, uid: u?.uid }, t.attack);
      if (retaliation > 0 && t.card.mechanics?.includes('POISONOUS') && u) u.health = 0;
      if (t.card.mechanics?.includes('LIFESTEAL'))
        enemy.health = Math.min(40, enemy.health + retaliation);
    }
    if (u) {
      u.attacksRemaining--;
      u.ready = u.attacksRemaining > 0;
      if (u.card.mechanics?.includes('LIFESTEAL')) p.health = Math.min(40, p.health + dealt);
    } else p.heroReady = false;
    note(
      s,
      `${u?.card.name ?? p.name} attacks ${'card' in t ? `${enemy.name}'s ${t.card.name}` : `${enemy.name}'s hero`} for ${dealt}${'card' in t ? `; defender ${Math.max(0, t.health)}/${t.maxHealth} health` : ''}${u ? `; attacker ${Math.max(0, u.health)}/${u.maxHealth} health` : ''}`,
    );
    settle(s);
  } else if (a.type === 'power') {
    if (p.powerUsed || p.mana < 2) throw Error('Hero power unavailable');
    if (!['MAGE', 'PRIEST', 'HUNTER', 'WARLOCK', 'WARRIOR'].includes(p.class))
      throw Error('This class power is not implemented yet');
    if (['MAGE', 'PRIEST'].includes(p.class) && !a.target) throw Error('Choose a target');
    if (a.target) getTarget(s, a.target);
    p.mana -= 2;
    p.powerUsed = true;
    if (p.class === 'MAGE') damage(s, a.target!, 1);
    if (p.class === 'PRIEST') {
      const t = getTarget(s, a.target!);
      t.health = Math.min('maxHealth' in t ? t.maxHealth : 40, t.health + 2);
    }
    if (p.class === 'HUNTER') {
      if (!a.target || a.target.p === a.p || a.target.uid) throw Error('Choose an enemy hero');
      damage(s, a.target, 2);
    }
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
    (c) => supported(c) && c.cost <= x.mana && (c.type !== 'MINION' || x.board.length < 7),
  );
  if (i >= 0)
    return {
      type: 'cast',
      p,
      index: i,
      target: effectFor(x.hand[i])?.type === 'buff' ? { p, uid: x.board[0]?.uid } : { p: enemy },
    };
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
