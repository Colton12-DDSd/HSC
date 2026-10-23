import { cardCost, cardStats, type Card } from './cards';
import { deathrattleFor } from './effects';
import type { Game, Target, Unit } from './engine';
import type { CardFilter, ScriptStep } from './script-types';
import type { Helpers } from './foundation-effects';
export const memoryOperations = [
  'remember-cards',
  'stored-deathrattle',
  'release-cards',
  'destroy-remembered',
  'grant-return',
  'reclaim',
  'gain-zone-deathrattle',
  'weapon-memory',
  'enemy-mana',
  'mana-limits',
  'reset-hand-costs',
  'turn-cost',
  'history-sized-summon',
  'dynamic-discover',
  'recruit-copies',
];
function plain(c: Card): Card {
  const {
    modifiers: _mods,
    temporaryCosts: _costs,
    temporaryUntilTurn: _temp,
    printedCost,
    ...base
  } = structuredClone(c);
  return { ...base, cost: printedCost ?? c.cost };
}
export function resolveMemory(
  s: Game,
  player: number,
  step: ScriptStep,
  source: Card,
  sourceUid: number | undefined,
  target: Target | undefined,
  h: Helpers,
): boolean {
  if (!memoryOperations.includes(step.op)) return false;
  const p = s.players[player],
    self = p.board.find((u) => u.uid === sourceUid);
  const grant = (host: Unit, steps: ScriptStep[], names: string[]) => {
    (host.grantedDeathrattles ??= []).push({
      source: { ...source, name: `${source.name} (${names.join(', ')})` },
      steps,
    });
    h.note(`${host.card.name} remembers ${names.join(', ')}`);
  };
  if (step.op === 'remember-cards' && self) {
    const remembered: { card: Card; owner: number; uid?: number }[] = [];
    if (step.zone === 'hand' || step.zone === 'deck') {
      const zone = step.zone;
      let pool = p[zone].filter((c) => h.matches(c, step.filter));
      if (step.order && pool.length) {
        const cost = Math.max(...pool.map(cardCost));
        pool = pool.filter((c) => cardCost(c) === cost);
      }
      if (pool.length) {
        const c = pool[h.random(pool.length)];
        p[zone].splice(p[zone].indexOf(c), 1);
        remembered.push({ card: structuredClone(c), owner: player });
        if (zone === 'hand') {
          p.grave.push(plain(c));
          h.note(`${p.name} discards ${c.name}`);
        } else h.note(`${source.name} eats ${c.name}`);
        if (step.after === 'stats') {
          const stats = cardStats(c);
          h.buff(self, stats.attack, stats.health);
        }
      }
    } else {
      for (const t of h.targets(step)) {
        const u = h.get(t);
        if (!('card' in u)) continue;
        remembered.push({ card: plain(u.card), owner: t.p, uid: u.uid });
        if (!step.copy) {
          u.health = 0;
          h.note(`${source.name} destroys ${u.card.name}`);
        }
      }
    }
    if (step.mode === 'destroy')
      for (const c of remembered)
        grant(self, [{ op: 'destroy-remembered', victimUid: c.uid }], [c.card.name]);
    else {
      const groups = new Map<number, Card[]>();
      for (const c of remembered) {
        const owner = step.destination === 'original-owner' ? c.owner : player;
        groups.set(owner, [...(groups.get(owner) ?? []), c.card]);
      }
      for (const [owner, cards] of groups)
        grant(
          self,
          [
            {
              op: 'release-cards',
              cards,
              owner,
              amount: step.amount ?? 1,
              mode: step.mode,
              attack: step.attack,
              health: step.health,
            },
          ],
          cards.map((c) => c.name),
        );
    }
  }

  if (step.op === 'release-cards') {
    const owner = step.owner ?? player;
    let offset = 0;
    if (s.players[owner]?.health > 0)
      for (const c of step.cards ?? [])
        for (let i = 0; i < (typeof step.amount === 'number' ? step.amount : 1); i++) {
          if (step.mode === 'hand') {
            h.add(owner, c);
            h.note(`${source.name} returns ${c.name} to ${s.players[owner].name}'s hand`);
          } else {
            const fresh = h.spawn(
              owner,
              structuredClone(c),
              owner === player ? h.position + offset : undefined,
            );
            if (fresh) {
              offset++;
              if (step.attack || step.health) h.buff(fresh, step.attack ?? 0, step.health ?? 0);
            }
          }
        }
  }
  if (step.op === 'destroy-remembered')
    for (const owner of s.players)
      if (owner.health > 0) {
        const u = owner.board.find((u) => u.uid === step.victimUid);
        if (u) {
          u.health = 0;
          h.note(`${source.name} destroys remembered ${u.card.name}`);
        }
      }
  if (step.op === 'grant-return')
    for (const t of h.targets(step)) {
      const u = h.get(t);
      if ('card' in u)
        grant(
          u,
          [{ op: 'release-cards', cards: [plain(u.card)], mode: 'summon', amount: 1 }],
          [u.card.name],
        );
    }
  if (step.op === 'reclaim')
    for (const t of h.targets(step)) {
      const u = h.get(t);
      if ('card' in u) {
        const c = plain(u.card),
          position = s.players[t.p].board.indexOf(u);
        u.health = 0;
        h.finishDeaths();
        h.spawn(t.p, c, position);
      }
    }
  if (step.op === 'gain-zone-deathrattle' && self) {
    const pool = p.deck.filter((c) => !!deathrattleFor(c));
    if (pool.length) {
      const c = pool[h.random(pool.length)],
        effect = deathrattleFor(c)!;
      grant(
        self,
        effect.type === 'script'
          ? structuredClone(effect.steps)
          : [{ op: 'legacy-deathrattle', token: c.id }],
        [c.name],
      );
    }
  }
  if (step.op === 'weapon-memory') {
    if (step.mode === 'steal')
      for (const [i, owner] of s.players.entries())
        if (i !== player && owner.health > 0 && owner.weapon) {
          h.destroyWeapon(player);
          p.weapon = owner.weapon;
          delete owner.weapon;
          h.note(`${source.name} steals ${owner.name}'s weapon`);
        }
    if (step.mode === 'equip-deck') {
      const pool = p.deck.filter((c) => c.type === 'WEAPON');
      if (pool.length) {
        const c = pool[h.random(pool.length)];
        p.deck.splice(p.deck.indexOf(c), 1);
        h.equip(player, c);
        h.note(`${source.name} equips ${c.name} from the deck`);
      }
    }
    if (step.mode === 'stats' && p.weapon && self)
      h.buff(self, p.weapon.attack, p.weapon.durability);
    if (step.mode === 'summon' && p.weapon)
      h.run([{ op: 'summon-pool', filter: { type: 'MINION', cost: p.weapon.attack }, amount: 1 }]);
    if (step.mode === 'set' && p.weapon) {
      p.weapon.attack = step.attack!;
      p.weapon.durability = step.health!;
      h.note(`${source.name} sets weapon Attack and Durability to ${step.attack}/${step.health}`);
    }
  }
  if (step.op === 'enemy-mana')
    for (const [i, owner] of s.players.entries())
      if (i !== player && owner.health > 0) {
        const gain = Math.min(
          typeof step.amount === 'number' ? step.amount : 1,
          Math.max(0, (owner.manaCap ?? 10) - owner.maxMana),
        );
        owner.maxMana += gain;
        owner.mana += gain;
      }
  if (step.op === 'mana-limits') {
    const n = typeof step.amount === 'number' ? step.amount : 11;
    p.manaCap = n;
    p.maxHandSize = n;
    h.note(`${p.name}'s maximum Mana and hand size are ${n}`);
  }
  if (step.op === 'reset-hand-costs')
    for (const owner of s.players)
      if (owner.health > 0)
        for (const c of owner.hand) {
          c.cost = c.printedCost ?? h.catalog.find((x) => x.id === c.id)?.cost ?? c.cost;
          delete c.printedCost;
          c.temporaryCosts = [];
        }
  if (step.op === 'turn-cost')
    (p.turnCosts ??= []).push({
      filter: step.filter ?? {},
      set: step.setCost ?? 1,
      turn: s.turn,
      source: source.name,
    });
  if (step.op === 'history-sized-summon') {
    const n = (s.events ?? [])
      .filter((e) => e.player === player && e.type === 'play')
      .slice(0, -1)
      .filter((e) => e.card && h.matches(e.card, step.filter)).length;
    h.run([{ op: 'summon-pool', filter: { type: 'MINION', cost: 1 + n }, amount: 1 }]);
  }
  if (step.op === 'dynamic-discover') {
    let filter: CardFilter =
      step.mode === 'attack'
        ? { type: 'SPELL', cost: self?.attack ?? 0, anyClass: true }
        : { cost: p.mana };
    if (step.mode === 'tribe') {
      if (!target) return true;
      const u = h.get(target);
      if (!('card' in u)) return true;
      const tribes = u.card.races ?? (u.card.race ? [u.card.race] : []);
      if (!tribes.length) return true;
      filter = tribes.includes('ALL')
        ? { type: 'MINION', hasTribe: true }
        : { type: 'MINION', any: tribes.map((tribe) => ({ tribe })) };
    }
    h.run([{ op: 'discover', filter, setCost: step.setCost, expires: step.expires }]);
  }
  if (step.op === 'recruit-copies' && target) {
    const u = h.get(target);
    if ('card' in u)
      h.run([
        { op: 'recruit', zone: 'deck', filter: { type: 'MINION', name: u.card.name }, amount: 7 },
      ]);
  }
  return true;
}
