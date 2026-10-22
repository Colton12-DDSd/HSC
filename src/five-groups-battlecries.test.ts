import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { type Card } from './cards';
import { applyAction, createGame, debugAction, unitMechanics, type Game } from './engine';
import { supported } from './effects';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
const card = (name: string) => structuredClone(cards.find((c) => c.name === name)!);
const names = [
  'Rock Master Voone',
  'Power Slider',
  'Felscale Evoker',
  'Primus of Power',
  'Scorchfist Scholar',
  'Death Blossom Whomper',
  'Hullbreaker',
  'Furnacefire Colossus',
  'Muckmorpher',
  'Merithra',
];
function setup() {
  const s = createGame(cards);
  s.events = [];
  for (const p of s.players)
    Object.assign(p, {
      hand: [],
      board: [],
      grave: [],
      deck: Array.from({ length: 12 }, () => card('Wisp')),
      health: 40,
      armor: 0,
      reserve: 0,
      mana: 100,
      maxMana: 10,
    });
  return s;
}
function play(s: Game, name: string, heldSince = 0) {
  s.players[0].mana = 100;
  s.players[0].hand.push({ ...card(name), heldSince });
  return applyAction(s, { type: 'cast', p: 0, index: s.players[0].hand.length - 1 });
}
function put(s: Game, name: string, p = 0) {
  return debugAction(s, { type: 'summon', p, card: card(name) });
}
const last = (s: Game, p = 0) => s.players[p].board.at(-1)!;
function kill(s: Game, uid: number) {
  s.players[0].board.find((u) => u.uid === uid)!.health = 0;
  return debugAction(s, { type: 'edit', p: 0, field: 'mana', value: 10 });
}

function spells(s: Game, names: string[], p = 0) {
  for (const name of names)
    s.events!.push({ type: 'play', player: p, turn: s.turn, card: card(name) });
}
describe('five linked Battlecry groups', () => {
  it.each(names)('%s supports all collection printings', (name) =>
    expect(cards.filter((c) => c.name === name).every(supported)).toBe(true),
  );
  it('Voone copies one representative per tribe, preserves buffs and leaves originals', () => {
    const s = setup();
    const beast = card('River Crocolisk');
    beast.modifiers = [{ sourceCardId: 'test', sourceName: 'Test', attack: 2, health: 3 }];
    s.players[0].hand = [
      beast,
      card('River Crocolisk'),
      card('Chillwind Yeti'),
      card('Murloc Raider'),
    ];
    const n = play(s, 'Rock Master Voone');
    expect(n.players[0].hand).toHaveLength(6);
    expect(n.players[0].hand.filter((c) => c.name === 'Chillwind Yeti')).toHaveLength(1);
    expect(n.players[0].hand.filter((c) => c.name === 'Murloc Raider')).toHaveLength(2);
  });
  it('Voone cannot copy a dual-tribe card twice and respects the hand cap', () => {
    const s = setup();
    const dual = card('River Crocolisk');
    dual.races = ['BEAST', 'DRAGON'];
    s.players[0].hand = [dual];
    expect(play(s, 'Rock Master Voone').players[0].hand).toHaveLength(2);
    s.players[0].hand = [...Array.from({ length: 9 }, () => card('Murloc Raider'))];
    expect(play(s, 'Rock Master Voone').players[0].hand).toHaveLength(10);
  });
  it('Power Slider counts distinct played types excluding untyped minions, enemy plays and summons', () => {
    let s = put(setup(), 'River Crocolisk');
    spells(s, ['Murloc Raider', 'Murloc Raider']);
    spells(s, ['River Crocolisk'], 1);
    s = play(s, 'Power Slider');
    expect(last(s).attack).toBe(card('Power Slider').attack! + 1);
    expect(last(s).ready).toBe(true);
  });
  it('Power Slider uses maximum one-to-one tribe assignment for dual types and ALL', () => {
    const s = setup();
    const dual = card('River Crocolisk');
    dual.races = ['BEAST', 'DRAGON'];
    const all = card('River Crocolisk');
    all.race = 'ALL';
    all.races = ['ALL'];
    s.events!.push(...[dual, all].map((c) => ({ type: 'play', player: 0, turn: s.turn, card: c })));
    const n = play(s, 'Power Slider');
    expect(last(n).attack).toBe(card('Power Slider').attack! + 2);
  });
  it.each(['Primus of Power', 'Scorchfist Scholar'])(
    '%s ignores schools before entering hand and other players',
    (name) => {
      const s = setup();
      spells(s, ['Fireball', 'Frostbolt']);
      const held = s.events!.length;
      spells(s, ['Shadow Bolt'], 1);
      spells(s, ['Fireball', 'Fireball']);
      const n = play(s, name, held);
      expect(n.players[0].board).toHaveLength(1);
      expect(n.players[1].health).toBe(40);
    },
  );
  it('Primus summons only one copy with Taunt and without repeating its Battlecry', () => {
    const s = setup();
    spells(s, ['Fireball', 'Frostbolt']);
    const n = play(s, 'Primus of Power');
    expect(n.players[0].board).toHaveLength(2);
    expect(n.players[0].board.every((u) => unitMechanics(u).includes('TAUNT'))).toBe(true);
    expect(n.log.filter((x) => x.includes('triggers Battlecry'))).toHaveLength(1);
  });
  it('Scorchfist damages every living enemy and respects Armor and Divine Shield', () => {
    let s = put(setup(), 'Annoy-o-Tron', 1);
    s.players[1].armor = 3;
    s.players[3].health = 0;
    spells(s, ['Fireball', 'Frostbolt']);
    s = play(s, 'Scorchfist Scholar');
    expect(s.players.map((p) => p.health)).toEqual([40, 39, 36, 0]);
    expect(last(s, 1).health).toBe(2);
    expect(last(s, 1).shield).toBe(false);
  });
  it('Felscale requires three own spells while held and recruits a different Demon without Battlecry', () => {
    const s = setup();
    s.players[0].deck = [card('Felscale Evoker'), card('Flame Imp')];
    spells(s, ['Fireball', 'Fireball', 'Fireball']);
    const n = play(s, 'Felscale Evoker');
    expect(n.players[0].board.map((u) => u.card.name)).toEqual(['Felscale Evoker', 'Flame Imp']);
    expect(n.players[0].health).toBe(40);
    expect(n.players[0].deck.map((c) => c.name)).toEqual(['Felscale Evoker']);
  });
  it('Felscale does nothing below threshold or when the board is full', () => {
    let s = setup();
    s.players[0].deck = [card('Flame Imp')];
    spells(s, ['Fireball', 'Frostbolt']);
    expect(play(s, 'Felscale Evoker').players[0].board).toHaveLength(1);
    for (let i = 0; i < 6; i++) s = put(s, 'Wisp');
    spells(s, ['Fireball']);
    const n = play(s, 'Felscale Evoker');
    expect(n.players[0].board).toHaveLength(7);
    expect(n.players[0].deck).toHaveLength(1);
  });
  it('Whomper gains the exact drawn Deathrattle, even when that draw burns', () => {
    const s = setup();
    s.players[0].deck = [card('Loot Hoarder'), card('Wisp')];
    let n = play(s, 'Death Blossom Whomper');
    expect(last(n).grantedDeathrattles).toHaveLength(1);
    n = kill(n, last(n).uid);
    expect(n.players[0].hand.map((c) => c.name)).toEqual(['Loot Hoarder', 'Wisp']);
    s.players[0].hand = Array.from({ length: 10 }, () => card('Wisp'));
    n = play(s, 'Death Blossom Whomper');
    expect(last(n).grantedDeathrattles).toHaveLength(1);
    expect(n.players[0].hand).toHaveLength(10);
  });
  it('Whomper does not gain anything without a matching draw; silence clears its grant', () => {
    let s = play(setup(), 'Death Blossom Whomper');
    expect(last(s).grantedDeathrattles).toBeUndefined();
    s = setup();
    s.players[0].deck = [card('Loot Hoarder')];
    s = play(s, 'Death Blossom Whomper');
    const uid = last(s).uid;
    s.players[0].hand.push(card('Ironbeak Owl'));
    s = applyAction(s, {
      type: 'cast',
      p: 0,
      index: s.players[0].hand.length - 1,
      target: { p: 0, uid },
    });
    expect(s.players[0].board.find((u) => u.uid === uid)?.grantedDeathrattles).toHaveLength(0);
  });
  it('Hullbreaker uses the actual spell Cost on Battlecry and Deathrattle, consuming Armor', () => {
    const s = setup();
    s.players[0].armor = 2;
    s.players[0].deck = [card('Fireball')];
    let n = play(s, 'Hullbreaker');
    expect(n.players[0].health).toBe(38);
    expect(n.players[0].armor).toBe(0);
    n.players[0].deck = [card('Frostbolt')];
    n = kill(n, last(n).uid);
    expect(n.players[0].health).toBe(36);
    expect(n.players[0].hand).toHaveLength(2);
  });
  it('Hullbreaker causes no damage without a spell and still pays for a burned draw', () => {
    expect(play(setup(), 'Hullbreaker').players[0].health).toBe(40);
    const s = setup();
    s.players[0].hand = Array.from({ length: 10 }, () => card('Wisp'));
    s.players[0].deck = [card('Fireball')];
    const n = play(s, 'Hullbreaker');
    expect(n.players[0].health).toBe(36);
    expect(n.players[0].hand).toHaveLength(10);
  });
  it('Furnacefire discards only hand weapons and gains summed Attack and Durability', () => {
    const s = setup();
    const axe = card('Fiery War Axe');
    axe.modifiers = [{ sourceCardId: 'test', sourceName: 'Test', attack: 2, health: 1 }];
    s.players[0].hand = [axe, card('Fiery War Axe'), card('Wisp')];
    const n = play(s, 'Furnacefire Colossus'),
      u = last(n),
      base = card('Furnacefire Colossus');
    expect(u.attack).toBe(base.attack! + 8);
    expect(u.health).toBe(base.health! + 5);
    expect(n.players[0].hand.map((c) => c.name)).toEqual(['Wisp']);
    expect(n.players[0].grave).toHaveLength(2);
    expect(n.events!.some((e) => e.type === 'weapon-destroyed')).toBe(false);
    expect(n.players[0].grave[0].modifiers).toBeUndefined();
  });
  it('Muckmorpher keeps deck cards, gains abilities, sets 4/4 and does not trigger Battlecry', () => {
    const s = setup();
    s.players[0].deck = [card('Muckmorpher'), card('Sunwalker')];
    const n = play(s, 'Muckmorpher');
    expect(n.players[0].deck).toHaveLength(2);
    expect(last(n).card.name).toBe('Sunwalker');
    expect([last(n).attack, last(n).health]).toEqual([4, 4]);
    expect(last(n).shield).toBe(true);
    expect(unitMechanics(last(n))).toContain('TAUNT');
    s.players[0].deck = [card('Muckmorpher')];
    expect(last(play(s, 'Muckmorpher')).card.name).toBe('Muckmorpher');
  });
  it('Merithra resurrects unique names across printings, only friendly expensive deaths, without Battlecries', () => {
    const s = setup();
    const ony = card('Onyxia');
    s.events = [
      { type: 'death', player: 0, turn: 1, card: ony },
      { type: 'death', player: 0, turn: 2, card: { ...ony, id: 'CORE_EX1_562' } },
      { type: 'death', player: 1, turn: 1, card: card('Ragnaros the Firelord') },
      { type: 'death', player: 0, turn: 1, card: card('Wisp') },
    ];
    const n = play(s, 'Merithra');
    expect(n.players[0].board.map((u) => u.card.name)).toEqual(['Merithra', 'Onyxia']);
  });
  it('Merithra respects board space and does not consume death history', () => {
    let s = setup();
    for (let i = 0; i < 5; i++) s = put(s, 'Wisp');
    for (const name of ['Onyxia', 'Ragnaros the Firelord', 'Alexstrasza'])
      s.events!.push({ type: 'death', player: 0, turn: 1, card: card(name) });
    const n = play(s, 'Merithra');
    expect(n.players[0].board).toHaveLength(7);
    expect(n.events!.filter((e) => e.type === 'death')).toHaveLength(3);
  });
});
