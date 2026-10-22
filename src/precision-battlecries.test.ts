import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { type Card } from './cards';
import {
  applyAction,
  createGame,
  debugAction,
  effectTargets,
  type Game,
  type Target,
} from './engine';
import { supported } from './effects';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
const card = (name: string) => structuredClone(cards.find((c) => c.name === name)!);
const names = [
  'Alexstrasza the Life-Binder',
  'Undercooked Calamari',
  'King Plush',
  'The Lurker Below',
  'Ball Hog',
  'Bloodsworn Mercenary',
  'Utgarde Grapplesniper',
  'Countess Ashmore',
  'Multicaster',
  'Aessina',
];
function setup() {
  const s = createGame(cards);
  s.events = [];
  for (const p of s.players) {
    p.hand = [];
    p.board = [];
    p.grave = [];
    p.deck = Array.from({ length: 20 }, () => card('Wisp'));
    p.health = 40;
    p.armor = 0;
    p.reserve = 0;
    p.mana = 100;
    p.maxMana = 10;
  }
  return s;
}
function put(s: Game, p: number, name: string) {
  return debugAction(s, { type: 'summon', p, card: card(name) });
}
function play(s: Game, name: string, target?: Target, p = 0) {
  s.active = p;
  s.players[p].hand.push(card(name));
  return applyAction(s, { type: 'cast', p, index: s.players[p].hand.length - 1, target });
}
const last = (s: Game, p = 0) => s.players[p].board.at(-1)!;
describe('precision and linked Battlecries', () => {
  it.each(names)('%s supports every printing', (name) =>
    expect(cards.filter((c) => c.name === name).every(supported)).toBe(true),
  );
  it('Alexstrasza heals a chosen friendly hero above 40, but damages only the selected enemy', () => {
    let s = play(setup(), 'Alexstrasza the Life-Binder', { p: 0 });
    expect(s.players[0].health).toBe(48);
    s = play(s, 'Alexstrasza the Life-Binder', { p: 2 });
    expect(s.players.map((p) => p.health)).toEqual([48, 40, 32, 40]);
  });
  it('Alexstrasza heals minions up to maximum Health and respects enemy Shield', () => {
    let s = put(setup(), 0, 'Chillwind Yeti');
    last(s).health = 1;
    const uid = last(s).uid;
    s = play(s, 'Alexstrasza the Life-Binder', { p: 0, uid });
    expect(s.players[0].board.find((u) => u.uid === uid)?.health).toBe(5);
    s = put(s, 1, 'Annoy-o-Tron');
    const shield = last(s, 1).uid;
    s = play(s, 'Alexstrasza the Life-Binder', { p: 1, uid: shield });
    expect(last(s, 1).health).toBe(2);
    expect(last(s, 1).shield).toBe(false);
  });
  it('Calamari highlights only enemy minions at or below its current Attack', () => {
    let s = put(setup(), 1, 'Chillwind Yeti');
    s = put(s, 1, 'Wisp');
    const strong = s.players[1].board[0],
      weak = last(s, 1);
    const c = card('Undercooked Calamari');
    const targets = effectTargets(s, 0, c);
    expect(targets.some((t) => t.uid === weak.uid)).toBe(true);
    strong.attack = 20;
    expect(effectTargets(s, 0, c).some((t) => t.uid === strong.uid)).toBe(false);
    s = play(s, c.name, { p: 1, uid: weak.uid });
    expect(s.players[1].board.some((u) => u.uid === weak.uid)).toBe(false);
  });
  it('Calamari targeting previews hand buffs and queued stat changes without mutating state', () => {
    let s = put(setup(), 1, 'Chillwind Yeti');
    last(s, 1).attack = 7;
    const target = { p: 1, uid: last(s, 1).uid };
    const c = card('Undercooked Calamari');
    s.players[0].playEffects = [
      {
        source: card('Sunwatcher'),
        filter: { type: 'MINION' },
        remaining: 1,
        steps: [{ op: 'set-stats', scope: 'target', target: 'minion', attack: 8, health: 8 }],
      },
    ];
    const before = structuredClone(s);
    expect(effectTargets(s, 0, c)).toContainEqual(target);
    expect(s).toEqual(before);
    s.players[0].hand = [c];
    s = applyAction(s, { type: 'cast', p: 0, index: 0, target });
    expect(s.players[1].board).toHaveLength(0);
    expect(last(s).attack).toBe(8);
  });
  it('Calamari can enter without an effect when no legal target exists', () => {
    const s = play(setup(), 'Undercooked Calamari');
    expect(last(s).card.name).toBe('Undercooked Calamari');
  });
  it('Calamari counts hand buffs and rechecks a target that grows during priority', () => {
    let s = put(setup(), 1, 'Chillwind Yeti');
    const c = card('Undercooked Calamari');
    c.modifiers = [{ sourceCardId: 'test', sourceName: 'Hand buff', attack: 5, health: 0 }];
    last(s, 1).attack = (c.attack ?? 0) + 4;
    const target = { p: 1, uid: last(s, 1).uid };
    expect(effectTargets(s, 0, c)).toContainEqual(target);
    s.players[0].hand = [c];
    s.players[1].reserve = 3;
    s = applyAction(s, { type: 'cast', p: 0, index: 0, target });
    last(s, 1).attack = 100;
    s = applyAction(s, { type: 'pass', p: 1 });
    expect(s.players[1].board).toHaveLength(1);
  });
  it('King Plush shuffles weaker minions on every living board without Deathrattles or retained buffs', () => {
    let s = put(setup(), 0, 'Loot Hoarder');
    s = put(s, 1, 'Chillwind Yeti');
    s = put(s, 2, 'Chillwind Yeti');
    s.players[2].board[0].attack = 30;
    s.players[1].board[0].health = 1;
    const hand = s.players[0].hand.length;
    s = play(s, 'King Plush');
    expect(s.players[0].hand).toHaveLength(hand);
    expect(s.players[0].deck.some((c) => c.name === 'Loot Hoarder')).toBe(true);
    expect(s.players[1].board).toHaveLength(0);
    expect(s.players[2].board).toHaveLength(1);
    expect(last(s).card.name).toBe('King Plush');
    expect(s.events?.some((e) => e.type === 'death')).toBe(false);
  });
  it('King Plush sends a weaker commander to its command zone without putting a duplicate in a deck', () => {
    let s = setup();
    s.players[1].commander = card('Wickerflame Burnbristle');
    s.players[1].mana = 100;
    s.active = 1;
    s = applyAction(s, { type: 'cast', p: 1, command: true });
    s = play(s, 'King Plush');
    expect(s.players[1].zone).toBe('command');
    expect(s.players[1].replacement).toBe(true);
    expect(s.players[1].deck.some((c) => c.name === 'Wickerflame Burnbristle')).toBe(false);
  });
  it('Lurker damage walks neighbors on the selected board and stops at a survivor', () => {
    let s = put(setup(), 1, 'Wisp');
    s = put(s, 1, 'Wisp');
    s = put(s, 1, 'Chillwind Yeti');
    s = put(s, 2, 'Wisp');
    const uid = s.players[1].board[0].uid;
    s = play(s, 'The Lurker Below', { p: 1, uid });
    expect(s.players[1].board.map((u) => [u.card.name, u.health])).toEqual([['Chillwind Yeti', 2]]);
    expect(s.players[2].board).toHaveLength(1);
  });
  it('Divine Shield prevents a Lurker chain from continuing', () => {
    let s = put(setup(), 1, 'Annoy-o-Tron');
    s = put(s, 1, 'Wisp');
    s = play(s, 'The Lurker Below', { p: 1, uid: s.players[1].board[0].uid });
    expect(s.players[1].board).toHaveLength(2);
    expect(s.players[1].board[0].shield).toBe(false);
  });
  it('Ball Hog chooses the lowest current Health enemy and heals from its Battlecry and Deathrattle', () => {
    let s = setup();
    s.players[2].health = 10;
    s = play(s, 'Ball Hog');
    expect(s.players[2].health).toBe(7);
    expect(s.players[0].health).toBe(43);
    last(s).health = 1;
    const uid = last(s).uid;
    s = play(s, 'Elven Archer', { p: 0, uid });
    expect(s.players[2].health).toBe(4);
    expect(s.players[0].health).toBe(46);
  });
  it('a copied Ball Hog Deathrattle does not grant its host Lifesteal', () => {
    let s = play(setup(), 'Ball Hog');
    const hog = last(s).uid;
    s = play(s, "Mok'Nathal Lion", { p: 0, uid: hog });
    const lion = last(s).uid;
    s.players[0].health = 40;
    s = play(s, 'Fireball', { p: 0, uid: lion }, 1);
    expect(s.players[0].health).toBe(40);
  });
  it('Ball Hog respects Shield and does not heal a blocked hit', () => {
    let s = put(setup(), 1, 'Annoy-o-Tron');
    s = play(s, 'Ball Hog');
    expect(s.players[0].health).toBe(40);
    expect(last(s, 1).shield).toBe(false);
    expect(last(s, 1).health).toBe(2);
  });
  it('Mercenary copies current damage and buffs rather than re-running Battlecry', () => {
    let s = put(setup(), 0, 'Nightblade');
    const original = last(s);
    original.health = 2;
    original.attack = 9;
    s = play(s, 'Bloodsworn Mercenary', { p: 0, uid: original.uid });
    const copy = s.players[0].board.find(
      (u) => u.card.name === 'Nightblade' && u.uid !== original.uid,
    )!;
    expect([copy.attack, copy.health, copy.maxHealth]).toEqual([9, 2, 4]);
    expect(s.players.map((p) => p.health)).toEqual([40, 40, 40, 40]);
  });
  it('Mercenary rejects undamaged targets and keeps a full board at seven', () => {
    let s = put(setup(), 0, 'Chillwind Yeti');
    expect(effectTargets(s, 0, card('Bloodsworn Mercenary'))).toHaveLength(0);
    last(s).health = 3;
    const uid = last(s).uid;
    for (let i = 0; i < 5; i++) s = put(s, 0, 'Wisp');
    s = play(s, 'Bloodsworn Mercenary', { p: 0, uid });
    expect(s.players[0].board).toHaveLength(7);
  });
  it('Grapplesniper draws for every living player, summoning drawn Dragons without Battlecries', () => {
    let s = setup();
    for (const p of s.players) p.deck = [card('Alexstrasza'), card('Wisp')];
    s.players[3].health = 0;
    s = play(s, 'Utgarde Grapplesniper');
    expect(s.players.map((p) => p.health)).toEqual([40, 40, 40, 0]);
    expect(
      s.players.slice(0, 3).every((p) => p.board.some((u) => u.card.name === 'Alexstrasza')),
    ).toBe(true);
    expect(s.players[3].deck).toHaveLength(2);
  });
  it('Grapplesniper leaves a Dragon in hand if its board is full and never summons burned Dragons', () => {
    let s = setup();
    for (let i = 0; i < 6; i++) s = put(s, 0, 'Wisp');
    s.players[0].deck = [card('Alexstrasza')];
    s.players[1].deck = [card('Alexstrasza')];
    s.players[1].hand = Array.from({ length: 10 }, () => card('Wisp'));
    s = play(s, 'Utgarde Grapplesniper');
    expect(s.players[0].board).toHaveLength(7);
    expect(s.players[0].hand.map((c) => c.name)).toContain('Alexstrasza');
    expect(s.players[1].board).toHaveLength(0);
    expect(s.players[1].grave.map((c) => c.name)).toContain('Alexstrasza');
  });
  it('Grapplesniper summons the newly drawn duplicate with its own buffs', () => {
    let s = setup();
    s.players[1].hand = [card('Alexstrasza')];
    const drawn = card('Alexstrasza');
    drawn.modifiers = [{ sourceCardId: 'test', sourceName: 'Test buff', attack: 3, health: 2 }];
    s.players[1].deck = [drawn];
    s = play(s, 'Utgarde Grapplesniper');
    expect(last(s, 1).attack).toBe(drawn.attack! + 3);
    expect(s.players[1].hand[0].modifiers).toBeUndefined();
  });
  it('Ashmore draws one card for each keyword, without drawing the same card twice', () => {
    let s = setup();
    s.players[0].deck = [
      card('Loot Hoarder'),
      card('Wickerflame Burnbristle'),
      card('Ratcatcher'),
      card('Wisp'),
    ];
    s = play(s, 'Countess Ashmore');
    expect(s.players[0].hand.map((c) => c.name).sort()).toEqual(
      ['Loot Hoarder', 'Ratcatcher', 'Wickerflame Burnbristle'].sort(),
    );
    expect(s.players[0].deck.map((c) => c.name)).toEqual(['Wisp']);
  });
  it('Multicaster counts unique schools, ignores other players and schoolless spells', () => {
    let s = setup();
    s.events = [
      { type: 'play', player: 0, turn: 1, card: card('Fireball') },
      { type: 'play', player: 0, turn: 1, card: card('Fireball') },
      { type: 'play', player: 0, turn: 1, card: card('Frostbolt') },
      { type: 'play', player: 1, turn: 1, card: card('Holy Smite') },
      { type: 'play', player: 0, turn: 1, card: { ...card('Fireball'), spellSchool: undefined } },
    ];
    s = play(s, 'Multicaster');
    expect(s.players[0].hand).toHaveLength(2);
  });
  it.each([19, 20])(
    'Aessina requires twenty friendly deaths, including repeated copies (%i)',
    (count) => {
      let s = setup();
      s.events = Array.from({ length: count }, () => ({
        type: 'death',
        player: 0,
        turn: 1,
        card: card('Wisp'),
      }));
      s.events.push({ type: 'death', player: 1, turn: 1, card: card('Wisp') });
      s = play(s, 'Aessina');
      expect(s.players.slice(1).reduce((n, p) => n + p.health, 0)).toBe(count === 20 ? 100 : 120);
    },
  );
});
