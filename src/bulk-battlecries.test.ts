import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  applyAction,
  createGame,
  debugAction,
  effectTargets,
  replay,
  attackError,
  botAction,
  unitMechanics,
  type Game,
  type Action,
  type Target,
} from './engine';
import {
  expandedBattlecries,
  expandedDeathrattles,
  expandedSpells,
  battlecries,
  battlecryFor,
  deathrattleFor,
  supported,
  targetFor,
} from './effects';
import type { Card } from './cards';
import type { ScriptStep } from './script-types';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
const catalog = JSON.parse(readFileSync('src/generated/catalog.json', 'utf8')) as Card[];
const card = (id: string) => {
  const c = cards.find((c) => c.id === id) ?? catalog.find((c) => c.id === id);
  if (!c) throw Error(id);
  return c;
};
const oldNames = new Set(
  (
    JSON.parse(readFileSync('data/battlecry-expansion-baseline.json', 'utf8')) as {
      names: string[];
    }
  ).names,
);
const added = cards.filter((c) => expandedBattlecries[c.id] && !oldNames.has(c.name));
const baseline = createGame(cards);
function setup() {
  const s = structuredClone(baseline);
  for (const p of s.players) {
    p.hand = [];
    p.deck = cards
      .filter((c) => ['CS2_182', 'CS2_029', 'CS2_023', 'EX1_543'].includes(c.id))
      .map((c) => structuredClone(c));
    p.board = [];
    p.health = 100;
    p.armor = 0;
    p.reserve = 0;
    p.mana = 100;
    p.maxMana = 10;
  }
  s.events = [];
  return s;
}
function summon(s: Game, p: number, id: string) {
  return debugAction(s, { type: 'summon', p, card: card(id) });
}
function play(s: Game, id: string, target?: Target) {
  const n = structuredClone(s);
  n.players[0].mana = 100;
  n.players[0].hand.push({ ...card(id), heldSince: n.events?.length ?? 0 });
  return applyAction(n, { type: 'cast', p: 0, index: n.players[0].hand.length - 1, target });
}
function finish(s: Game) {
  for (let i = 0; (s.pending || s.choice) && i < 40; i++)
    s = applyAction(
      s,
      s.pending
        ? { type: 'pass', p: s.pending.queue[0] }
        : { type: 'choose', p: s.choice!.player, index: 0 },
    );
  expect(s.choice).toBeUndefined();
  return s;
}
function flatten(steps: ScriptStep[]): ScriptStep[] {
  return steps.flatMap((s) => [s, ...flatten(s.steps ?? [])]);
}
function fixture() {
  let s = summon(setup(), 0, 'CS2_182');
  s = summon(s, 0, 'CS2_172');
  s = summon(s, 1, 'CS2_182');
  s = summon(s, 1, 'EX1_543');
  s.players[0].board[0].health = 3;
  return s;
}
describe('500 additional distinct Battlecry names', () => {
  it('counts unique new names, never duplicate Core printings', () => {
    expect(new Set(added.map((c) => c.name)).size).toBeGreaterThanOrEqual(500);
  });
  it('pins every complete script to its full source text and excludes extra unhandled clauses', () => {
    for (const c of cards.filter((c) => expandedBattlecries[c.id]))
      expect(expandedBattlecries[c.id].text, c.id).toBe(c.text);
    for (const id of [
      'EX1_012',
      'GVG_082',
      'BE_557',
      'RLK_659',
      'ULD_003',
      'BE_009',
      'REV_906',
      'TTN_458',
    ])
      expect(supported(card(id)), id).toBe(false);
  });
  it.each(added.map((c) => [c.id, c] as const))(
    '%s executes, resolves choices, and preserves game invariants',
    (id, c) => {
      let s = fixture();
      const target = effectTargets(s, 0, c).find((t) => t.p === 1) ?? effectTargets(s, 0, c)[0];
      s = finish(play(s, id, target));
      for (const p of s.players) {
        expect(p.board.length).toBeLessThanOrEqual(7);
        expect(p.hand.length).toBeLessThanOrEqual(p.maxHandSize ?? 10);
        expect(Number.isFinite(p.health)).toBe(true);
        expect(p.armor).toBeGreaterThanOrEqual(0);
        for (const u of p.board) {
          expect(Number.isFinite(u.attack)).toBe(true);
          expect(u.attack).toBeGreaterThanOrEqual(0);
          expect(u.health).toBeGreaterThan(0);
          expect(Number.isFinite(u.maxHealth)).toBe(true);
        }
      }
      expect(s.log.filter((l) => l.includes(`${c.name} triggers Battlecry`))).toHaveLength(1);
    },
  );
  it.each(
    added
      .filter((c) => expandedBattlecries[c.id].steps[0]?.op === 'if')
      .map((c) => [c.id, c] as const),
  )('%s executes its conditional branch when the prerequisite is present', (id, c) => {
    let s = fixture();
    const condition = expandedBattlecries[id].steps[0].condition!;
    let p = s.players[0];
    p.weapon = { card: card('CS2_106'), attack: 3, durability: 2 };
    const find = () =>
      [...cards, ...catalog].find((x) => {
        const f = condition.filter ?? {};
        return (
          (!['friendly', 'all', 'enemy'].includes(condition.zone ?? '') ||
            condition.filter?.keyword === 'SECRET' ||
            x.type === 'MINION') &&
          (!f.name || x.name === f.name) &&
          (!f.nameSuffix || x.name.endsWith(f.nameSuffix)) &&
          (f.health === undefined || x.health === f.health) &&
          (f.minHealth === undefined || (x.health ?? 0) >= f.minHealth) &&
          (!f.type || x.type === f.type) &&
          (!f.tribe || x.race === f.tribe || x.races?.includes(f.tribe)) &&
          (!f.school || x.spellSchool === f.school) &&
          (!f.keyword || x.mechanics?.includes(f.keyword)) &&
          (f.minCost === undefined || x.cost >= f.minCost) &&
          (f.cost === undefined || x.cost === f.cost) &&
          (f.minAttack === undefined || (x.attack ?? 0) >= f.minAttack) &&
          (!f.otherClass || (x.cardClass !== 'NEUTRAL' && x.cardClass !== p.class))
        );
      }) ?? card('CS2_182');
    const count = condition.min ?? 1;
    if (condition.zone === 'friendly-deaths')
      s.events = Array.from({ length: count }, () => ({
        type: 'death',
        player: 0,
        turn: s.turn,
        card: card('CS2_182'),
      }));
    if (condition.zone === 'enemy-hand')
      s.players[1].hand = Array.from({ length: condition.min ?? 0 }, () => card('CS2_182'));
    if (condition.zone === 'hand')
      p.hand =
        condition.max === 0 ? [] : Array.from({ length: count }, () => structuredClone(find()));
    if (condition.zone === 'deck')
      p.deck =
        condition.max !== undefined
          ? []
          : Array.from({ length: count }, () => structuredClone(find()));
    if (
      condition.zone === 'friendly' ||
      condition.zone === 'friendly-including-self' ||
      condition.zone === 'all' ||
      condition.zone === 'enemy'
    ) {
      if (condition.filter?.keyword === 'SECRET') p.secrets = [find()];
      else {
        const owner = condition.zone === 'enemy' ? 1 : 0;
        s.players[owner].board = [];
        if (condition.zone === 'all') for (const p of s.players) p.board = [];
        if (condition.max === undefined)
          for (let i = 0; i < count; i++) {
            s = debugAction(s, { type: 'summon', p: owner, card: find() });
            if (condition.filter?.frozen) s.players[owner].board.at(-1)!.frozen = true;
            if (condition.filter?.damaged) {
              const u = s.players[owner].board.at(-1)!;
              u.maxHealth = Math.max(2, u.maxHealth);
              u.health = u.maxHealth - 1;
            }
          }
      }
    }
    p = s.players[0];
    if (id === 'ONY_026') p.hand.push({ ...card('CS2_029'), spellSchool: 'SHADOW' });
    if (id === 'KAR_033') s.players[1].board[0].attack = 2;
    if (id === 'TRL_326')
      s.players[1].board[0].health = Math.max(1, s.players[1].board[0].maxHealth - 1);
    if (condition.zone === 'enemy-frozen') s.players[1].frozen = true;
    if (condition.stat === 'overload') p.overload = 1;
    if (condition.special === 'odd-deck') p.deck = p.deck.filter((c) => c.cost % 2 === 1);
    if (condition.special === 'even-deck') p.deck = p.deck.filter((c) => c.cost % 2 === 0);
    if (condition.special === 'last-cost-one')
      (s.events ??= []).push({
        type: 'play',
        player: 0,
        turn: s.turn,
        card: { ...card('CS2_182'), cost: 1 },
      });
    if (condition.special === 'any-hero-damage')
      (s.events ??= []).push({ type: 'hero-damage', player: 1, turn: s.turn, amount: 1 });
    if (condition.special === 'combined-health-42')
      s.players.forEach((p, i) => {
        p.health = i < 2 ? 11 : 10;
      });
    if (condition.special === 'source-more-expensive')
      for (const c of p.deck) if (c.type === 'MINION') c.cost = 0;
    if (condition.stat === 'remaining-mana') p.mana = c.cost;
    if (condition.stat === 'enemy-health')
      s.players[1].health = condition.max ?? condition.min ?? 15;
    if (condition.stat === 'health') p.health = condition.min ?? condition.max ?? 30;
    if (condition.stat === 'armor') p.armor = condition.min ?? 1;
    if (condition.stat === 'weapon') p.weapon = { card: card('CS2_106'), attack: 3, durability: 2 };
    if (condition.stat === 'mana') p.maxMana = condition.min ?? 10;
    if (condition.zone?.startsWith('played') || condition.zone?.endsWith('this-turn')) {
      const turn = condition.zone === 'played-last-turn' ? s.turn - 1 : s.turn;
      const type = condition.zone.startsWith('played')
        ? 'play'
        : (
            {
              'power-this-turn': 'power',
              'hero-damage-this-turn': 'hero-damage',
              'hero-attack-this-turn': 'hero-attack',
              'healed-this-turn': 'heal',
              'health-changed-this-turn': 'health-change',
              'armor-changed-this-turn': 'armor-change',
              'died-this-turn': 'death',
            } as Record<string, string>
          )[condition.zone];
      s.events = [
        { type: 'turn', turn, player: 0 },
        ...Array.from({ length: count }, () => ({
          type,
          turn,
          player: 0,
          card: find(),
          amount: 1,
        })),
      ];
    }
    s.players[0].hand.push({
      ...c,
      heldSince: 0,
      ...(condition.stat === 'source-attack'
        ? {
            modifiers: [
              {
                sourceCardId: 'fixture',
                sourceName: 'Fixture',
                attack: Math.max(0, (condition.min ?? 0) - (c.attack ?? 0)),
                health: 0,
              },
            ],
          }
        : {}),
      ...(condition.stat === 'source-cost' ? { cost: 0 } : {}),
    });
    const target = effectTargets(s, 0, c).find((t) => t.p === 1) ?? effectTargets(s, 0, c)[0];
    s = applyAction(s, { type: 'cast', p: 0, index: s.players[0].hand.length - 1, target });
    s = finish(s);
    const trigger =
      s.log
        .map((l, i) => (l.includes(`${c.name} triggers Battlecry`) ? i : -1))
        .filter((i) => i >= 0)
        .at(-1) ?? -1;
    expect(
      s.log.slice(trigger + 1).some((l) => !l.endsWith(`resolves ${c.name}`)),
      id,
    ).toBe(true);
  });
  it.each(added.map((c) => [c.id, c] as const))(
    '%s never executes a Battlecry on direct summoning',
    (id, c) => {
      const initial = setup(),
        s = debugAction(initial, { type: 'summon', p: 0, card: c });
      expect(s.players.map((p) => [p.health, p.armor, p.hand.length, p.deck.length])).toEqual(
        initial.players.map((p) => [p.health, p.armor, p.hand.length, p.deck.length]),
      );
      expect(s.choice).toBeUndefined();
      expect(s.log.some((l) => l.includes('triggers Battlecry'))).toBe(false);
    },
  );
  it.each(Object.keys(expandedDeathrattles).filter((id) => !battlecries[id.replace(/^CORE_/, '')]))(
    '%s runs its registered Deathrattle after death',
    (id) => {
      let s = fixture();
      s = debugAction(s, { type: 'summon', p: 0, card: card(id) });
      const u = s.players[0].board.find((u) => u.card.id === id)!;
      expect(u).toBeDefined();
      u.health = 1;
      u.shield = false;
      s = play(s, 'CS2_189', { p: 0, uid: u.uid });
      s = finish(s);
      expect(s.log.filter((l) => l.includes(`${card(id).name} triggers Deathrattle`))).toHaveLength(
        1,
      );
    },
  );
});
describe('Independent mechanic and interaction checks', () => {
  it('rejects a changed generation catalog rather than silently replaying different random cards', () => {
    const s = setup();
    s.catalogVersion = 'different-catalog';
    expect(() => applyAction(s, { type: 'end', p: 0 })).toThrow(/catalog/);
    delete s.catalogVersion;
    expect(() => applyAction(s, { type: 'end', p: 0 })).not.toThrow();
  });
  it('debug additions begin a new while-held interval instead of counting older spells', () => {
    let s = setup();
    s.players[0].hand = [card('CS2_023')];
    s = applyAction(s, { type: 'cast', p: 0, index: 0 });
    s = debugAction(s, { type: 'add', p: 0, card: card('TSC_017') });
    const index = s.players[0].hand.findIndex((c) => c.id === 'TSC_017');
    s = applyAction(s, { type: 'cast', p: 0, index, target: { p: 1 } });
    expect(s.players[1].health).toBe(100);
  });
  it.each(Object.keys(expandedSpells).map((id) => [id] as const))(
    '%s generated/basic spell either completes or requires its legal target before spending mana',
    (id) => {
      let s = fixture();
      const c = catalog.find((c) => c.id === id)!;
      expect(c).toBeDefined();
      const targets = effectTargets(s, 0, c);
      s.players[0].hand = [c];
      const action: Action = {
        type: 'cast',
        p: 0,
        index: 0,
        target: targets.find((t) => t.p === 1) ?? targets[0],
      };
      if (
        targetFor(battlecryFor(c) ?? { type: 'script', steps: expandedSpells[id].steps }) &&
        !targets.length
      ) {
        expect(() => applyAction(s, action)).toThrow(/Choose/);
        expect(s.players[0].mana).toBe(100);
        return;
      }
      s = finish(applyAction(s, action));
      for (const p of s.players) {
        expect(p.board.length).toBeLessThanOrEqual(7);
        expect(p.hand.length).toBeLessThanOrEqual(10);
        expect(Number.isFinite(p.health)).toBe(true);
      }
    },
  );
  it('default Discover excludes neutral-tagged dual-class cards that do not belong to the hero class', () => {
    for (let seed = 0; seed < 16; seed++) {
      const initial = setup();
      initial.seed = seed;
      initial.players[0].class = 'HUNTER';
      const s = play(initial, 'LOE_003');
      expect(
        s.choice!.options.every((c) =>
          (c.classes ?? [c.cardClass]).some((k) => k === 'NEUTRAL' || k === 'HUNTER'),
        ),
      ).toBe(true);
    }
  });
  it('friendly-character Attack buffs include the hero and expire at end of turn', () => {
    let s = fixture();
    s = play(s, 'AV_294');
    expect(s.players[0].heroAttack).toBe(1);
    expect(s.players[0].board[0].attack).toBe(5);
    s = applyAction(s, { type: 'end', p: 0 });
    expect(s.players[0].heroAttack).toBe(0);
    expect(s.players[0].board[0].attack).toBe(4);
  });
  it('Silence cannot restore an attack used before Windfury was removed', () => {
    let s = summon(setup(), 0, 'EX1_033');
    const u = s.players[0].board[0];
    u.ready = true;
    u.summonedTurn = 0;
    s = applyAction(s, { type: 'attack', p: 0, uid: u.uid, target: { p: 1 } });
    s = play(s, 'CS2_203', { p: 0, uid: u.uid });
    expect(s.players[0].board[0].attacksRemaining).toBe(0);
  });
  it('existing Armor and health absorb all-character lethal damage without invalidating the same area effect', () => {
    let s = fixture();
    s.players[1].health = 1;
    s = play(s, 'UNG_803');
    expect(s.players.map((p) => p.health)).toEqual([99, 0, 99, 99]);
  });
  it('full-health restoration uses starting hero Health without erasing over-healing', () => {
    const initial = setup();
    initial.players[0].health = 20;
    initial.players[1].health = 80;
    const s = play(initial, 'DAL_581');
    expect(s.players.map((p) => p.health)).toEqual([40, 80, 100, 100]);
  });
  it('a bounced minion with a full hand dies and triggers its Deathrattle', () => {
    let s = summon(setup(), 1, 'EX1_096');
    s.players[1].hand = Array(10).fill(card('CS2_182'));
    s = play(s, 'CATA_201');
    expect(s.players[1].board).toHaveLength(0);
    expect(s.players[1].grave.some((c) => c.id === 'EX1_096')).toBe(true);
    expect(s.log.filter((l) => l.includes('Loot Hoarder triggers Deathrattle'))).toHaveLength(1);
  });
  it('weapon Attack buffs apply to equipped weapons, and attacks consume durability', () => {
    let s = play(setup(), 'CS2_106');
    expect(s.players[0].weapon).toMatchObject({ attack: 3, durability: 2 });
    s = play(s, 'BAR_061');
    expect(s.players[0].weapon?.attack).toBe(4);
    s = applyAction(s, { type: 'attack', p: 0, target: { p: 2 } });
    expect(s.players[2].health).toBe(96);
    expect(s.players[0].weapon?.durability).toBe(1);
  });
  it('conditional Mana Crystal counts use capacity rather than remaining mana', () => {
    const initial = setup();
    initial.players[0].maxMana = 10;
    const s = play(initial, 'BOT_296');
    expect(s.players[0].board[0].attack).toBe(card('BOT_296').attack! + 10);
  });
  it('generated tokens use gameplay records, never Battlegrounds or enchantment lookalikes', () => {
    const s = play(setup(), 'RLK_548');
    expect(s.players[0].hand[0].id).toBe('RLK_843');
    expect(supported(s.players[0].hand[0])).toBe(true);
    const bananas = play(setup(), 'EX1_014');
    for (const p of bananas.players.slice(1))
      expect(p.hand.map((c) => c.id)).toEqual(['EX1_014t', 'EX1_014t']);
  });
  it('new token spells execute their own full effects', () => {
    let s = play(setup(), 'AV_260');
    expect(s.players[0].hand[0].id).toBe('AV_266');
    s = summon(s, 1, 'CS2_182');
    const uid = s.players[1].board[0].uid;
    s = applyAction(s, { type: 'cast', p: 0, index: 0, target: { p: 1, uid } });
    expect(s.players[1].board[0].frozen).toBe(true);
    expect(s.players[0].hand).toHaveLength(1);
  });
  it('North Sea Kraken deals exactly four damage to only the chosen character', () => {
    const s = play(setup(), 'AT_103', { p: 2 });
    expect(s.players.map((p) => p.health)).toEqual([100, 100, 96, 100]);
  });
  it('Lance Carrier grants lasting Attack only, preserving damage', () => {
    const initial = fixture(),
      uid = initial.players[0].board[0].uid;
    let s = play(initial, 'AT_084', { p: 0, uid });
    expect(s.players[0].board[0]).toMatchObject({ attack: 6, health: 3, maxHealth: 5 });
    for (let i = 0; i < 4; i++) s = applyAction(s, { type: 'end', p: s.active });
    expect(s.players[0].board[0].attack).toBe(6);
  });
  it('tribe-restricted buffs reject an illegal minion before spending anything', () => {
    const s = fixture();
    expect(() => play(s, 'AT_040', { p: 0, uid: s.players[0].board[0].uid })).toThrow(/Choose/);
    const n = play(s, 'AT_040', { p: 0, uid: s.players[0].board[1].uid });
    expect(n.players[0].board[1]).toMatchObject({ attack: 3, health: 5, maxHealth: 5 });
  });
  it('conditional Dragon buffs do nothing without a Dragon and grant stats/Charge with one', () => {
    let s = play(setup(), 'AT_071');
    expect(s.players[0].board[0]).toMatchObject({ attack: card('AT_071').attack, ready: false });
    const initial = setup();
    initial.players[0].hand = [card('EX1_561')];
    s = play(initial, 'AT_071');
    expect(s.players[0].board[0].attack).toBe(card('AT_071').attack! + 1);
    expect(s.players[0].board[0].ready).toBe(true);
  });
  it('Draw tutors find the requested spell school and do not fatigue when none match', () => {
    let s = setup();
    s.players[0].deck = [card('CS2_182'), card('CS2_029')];
    s = play(s, 'BAR_873');
    expect(s.players[0].hand).toHaveLength(0);
    expect(s.players[0].fatigue).toBe(0);
    const frost = cards.find((c) => c.type === 'SPELL' && c.spellSchool === 'FROST')!;
    s = setup();
    s.players[0].deck = [card('CS2_182'), frost];
    s = play(s, 'AV_101');
    expect(s.players[0].hand[0].id).toBe(frost.id);
    expect(s.players[0].deck.map((c) => c.id)).toEqual(['CS2_182']);
  });
  it('Discover is a real private choice with three distinct eligible options and a validated response', () => {
    const initial = setup();
    initial.players[0].class = 'MAGE';
    let s = play(initial, 'LOE_003');
    expect(s.choice?.options).toHaveLength(3);
    expect(new Set(s.choice!.options.map((c) => c.name)).size).toBe(3);
    expect(
      s.choice!.options.every(
        (c) =>
          c.type === 'SPELL' &&
          (c.classes ?? [c.cardClass]).some((k) => ['MAGE', 'NEUTRAL'].includes(k)),
      ),
    ).toBe(true);
    expect(() => applyAction(s, { type: 'choose', p: 1, index: 0 })).toThrow(/choice/);
    expect(() => applyAction(s, { type: 'choose', p: 0, index: 99 })).toThrow(/Invalid/);
    expect(() => applyAction(s, { type: 'end', p: 0 })).toThrow(/choice/);
    const chosen = s.choice!.options[1];
    s = applyAction(s, { type: 'choose', p: 0, index: 1 });
    expect(s.players[0].hand[0].id).toBe(chosen.id);
  });
  it('Discovering from the deck draws, while an explicit copy leaves the deck intact', () => {
    let s = setup();
    s.players[0].deck = [card('CS2_029')];
    s = play(s, 'GDB_443');
    expect(s.choice?.options.map((c) => c.id)).toEqual(['CS2_029']);
    s = finish(s);
    expect(s.players[0].deck).toHaveLength(0);
    expect(s.players[0].hand[0].cost).toBe(0);
    let copy = setup();
    copy.players[0].deck = [card('CS2_182')];
    copy = finish(play(copy, 'ICC_415'));
    expect(copy.players[0].deck).toHaveLength(1);
    expect(copy.players[0].hand[0].id).toBe('CS2_182');
  });
  it('Discover continuation waits for the choice, then heals for the chosen Cost', () => {
    const initial = setup();
    initial.players[0].class = 'PALADIN';
    let s = play(initial, 'KAR_057');
    const cost = s.choice!.options[0].cost;
    expect(s.players[0].health).toBe(100);
    s = finish(s);
    expect(s.players[0].health).toBe(100 + cost);
  });
  it('Freeze blocks attacks and expires at the correct owner end turn', () => {
    let s = fixture();
    const uid = s.players[1].board[0].uid;
    s.players[1].board[0].ready = true;
    s = play(s, 'EX1_283', { p: 1, uid });
    s = applyAction(s, { type: 'end', p: 0 });
    expect(attackError(s, 1, uid, { p: 0 })).toBe('Frozen');
    s = applyAction(s, { type: 'end', p: 1 });
    expect(s.players[1].board[0].frozen).toBe(false);
  });
  it('Silence removes buffs, active Shield, and Deathrattle without changing the printed card', () => {
    let s = summon(setup(), 0, 'EX1_556');
    const uid = s.players[0].board[0].uid;
    s = play(s, 'EX1_019', { p: 0, uid });
    s = play(s, 'CS2_203', { p: 0, uid });
    expect(s.players[0].board[0]).toMatchObject({
      attack: 2,
      maxHealth: 3,
      silenced: true,
      modifiers: [],
    });
    s = play(s, 'CS2_029', { p: 0, uid });
    expect(s.players[0].board.some((u) => u.card.name === 'Damaged Golem')).toBe(false);
    expect(card('EX1_556').mechanics).toContain('DEATHRATTLE');
  });
  it('granted Divine Shield blocks the next damage and granted Windfury permits a second attack', () => {
    let s = fixture();
    const uid = s.players[0].board[0].uid;
    s.players[0].board[0].summonedTurn = 0;
    s.players[0].board[0].ready = true;
    s = play(s, 'EX1_362', { p: 0, uid });
    s = play(s, 'CS2_189', { p: 0, uid });
    expect(s.players[0].board[0].health).toBe(3);
    expect(s.players[0].board[0].shield).toBe(false);
    s = applyAction(s, { type: 'attack', p: 0, uid, target: { p: 2 } });
    s = play(s, 'EX1_587', { p: 0, uid });
    expect(attackError(s, 0, uid, { p: 2 })).toBeNull();
    s = applyAction(s, { type: 'attack', p: 0, uid, target: { p: 2 } });
    expect(s.players[2].health).toBe(92);
  });
  it('Reborn returns once at one Health and keeps its Deathrattle for the second death', () => {
    let s = play(setup(), 'RLK_223');
    const first = s.players[0].board[0].uid;
    s.players[0].board[0].health = 1;
    s = play(s, 'CS2_189', { p: 0, uid: first });
    const reborn = s.players[0].board.find((u) => u.card.id === 'RLK_223')!;
    expect(reborn).toMatchObject({ health: 1, rebornUsed: true });
    s = play(s, 'CS2_189', { p: 0, uid: reborn.uid });
    expect(s.players[0].board.some((u) => u.card.id === 'RLK_223')).toBe(false);
    expect(
      s.log.filter((l) => l.includes(`${card('RLK_223').name} triggers Deathrattle`)),
    ).toHaveLength(2);
  });
  it('temporary buffs expire and leave lasting enhancements and damage intact', () => {
    const initial = fixture(),
      uid = initial.players[0].board[0].uid;
    let s = play(initial, 'EX1_019', { p: 0, uid });
    s = play(s, 'CS2_188', { p: 0, uid });
    expect(s.players[0].board[0].attack).toBe(7);
    s = applyAction(s, { type: 'end', p: 0 });
    expect(s.players[0].board[0]).toMatchObject({ attack: 5, health: 4, maxHealth: 6 });
  });
  it('transforms preserve board position and do not trigger the copied Battlecry', () => {
    let s = fixture();
    const uid = s.players[0].board[0].uid;
    s = play(s, 'DRG_076', { p: 0, uid });
    expect(s.players[0].board[0].card.id).toBe('DRG_076');
    expect(s.players[0].board[0].uid).toBe(uid);
    expect(s.log.filter((l) => l.includes('triggers Battlecry'))).toHaveLength(1);
  });
  it('a 2/2 copy retains the copied Deathrattle but not its Battlecry or old stats', () => {
    let s = summon(setup(), 0, 'EX1_556');
    const target = s.players[0].board[0].uid;
    s = play(s, 'DAL_030', { p: 0, uid: target });
    const copy = s.players[0].board[1];
    expect(copy.card.id).toBe('EX1_556');
    expect(copy).toMatchObject({ attack: 2, health: 2, maxHealth: 2 });
    s = play(s, 'CS2_029', { p: 0, uid: copy.uid });
    expect(s.players[0].board.some((u) => u.card.name === 'Damaged Golem')).toBe(true);
  });
  it('elemental-last-turn history checks the controller previous turn, not the previous opponent', () => {
    let s = setup();
    s.players[0].hand = [cards.find((c) => c.name === 'Arcane Servant')!, card('UNG_847')];
    s = applyAction(s, { type: 'cast', p: 0, index: 0 });
    for (let i = 0; i < 4; i++) s = applyAction(s, { type: 'end', p: s.active });
    s.players[0].mana = 100;
    const index = s.players[0].hand.findIndex((c) => c.id === 'UNG_847');
    s = applyAction(s, { type: 'cast', p: 0, index, target: { p: 2 } });
    s = finish(s);
    expect(s.players[2].health).toBe(95);
  });
  it('spells cast before drawing a while-held card do not satisfy its condition', () => {
    let s = setup();
    s.players[0].hand = [card('CS2_023')];
    s = applyAction(s, { type: 'cast', p: 0, index: 0 });
    s = play(s, 'TSC_017', { p: 1 });
    expect(s.players[1].health).toBe(100);
    const initial = setup();
    initial.players[0].hand = [{ ...card('TSC_017'), heldSince: 0 }, card('CS2_023')];
    s = applyAction(initial, { type: 'cast', p: 0, index: 1 });
    s = applyAction(s, { type: 'cast', p: 0, index: 0, target: { p: 1 } });
    expect(s.players[1].health).toBe(97);
  });
  it('targeted Lifesteal Battlecry heals its controller, including lasting healing bonuses', () => {
    const initial = setup();
    initial.players[0].effects = [
      {
        kind: 'healing-bonus',
        amount: 2,
        sourceCardId: 'CATA_216',
        sourceName: 'Cleansing Cleric',
      },
    ];
    initial.players[0].deck = [];
    let withTarget = summon(initial, 1, 'CS2_182');
    withTarget.players[1].board[0].health = 10;
    withTarget.players[1].board[0].maxHealth = 10;
    const s = play(withTarget, 'BAR_916', { p: 1, uid: withTarget.players[1].board[0].uid });
    expect(s.players[1].board[0].health).toBe(4);
    expect(s.players[0].health).toBe(108);
  });
  it('interruption blocks an entire Discover effect, and choices replay deterministically', () => {
    const initial = setup();
    initial.players[0].hand = [card('LOE_003')];
    initial.players[1].reserve = 3;
    const cast: Action = { type: 'cast', p: 0, index: 0 };
    let s = applyAction(initial, cast);
    expect(s.choice).toBeUndefined();
    const stopped = applyAction(s, { type: 'interrupt', p: 1 });
    expect(stopped.players[0].hand[0].id).toBe('LOE_003');
    s = applyAction(s, { type: 'pass', p: 1 });
    const chosen = applyAction(s, { type: 'choose', p: 0, index: 1 });
    expect(
      replay(
        JSON.parse(
          JSON.stringify({
            version: 1,
            initial,
            actions: [cast, { type: 'pass', p: 1 }, { type: 'choose', p: 0, index: 1 }],
          }),
        ),
      ),
    ).toEqual(chosen);
  });
  it('all generated opcodes are recognized and every nested condition has an implemented shape', () => {
    const valid = new Set([
      'deck-token',
      'consume',
      'set-minion-health',
      'edge-damage',
      'remove-keyword',
      'deck-order',
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
      'discard-weapons-stats',
      'deck-copy',
      'future-play',
      'random-damage',
      'missiles-then',
      'summon-until',
      'swap-extreme-attack',
      'burn-or-draw',
      'recruit-gain',
      'shuffle-hands',
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
    for (const e of Object.values(expandedBattlecries))
      for (const op of flatten(e.steps)) expect(valid.has(op.op), op.op).toBe(true);
  });
});
