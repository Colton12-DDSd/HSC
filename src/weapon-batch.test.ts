import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { Card } from './cards';
import { applyAction, createGame, unitMechanics, type Game } from './engine';
import { supported } from './effects';

const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
const names = [
  'Air Guitarist',
  'Arathi Weaponsmith',
  'Blackscale Brute',
  'Bloodsail Corsair',
  'Bloodsail Raider',
  'Gluttonous Ooze',
  'Grimtotem Buzzkill',
  'Harrison Jones',
  'Hoard Pillager',
  'Luckydo Buccaneer',
  'Rummaging Kobold',
  'Toxic Sewer Ooze',
];
const card = (name: string) => structuredClone(cards.find((c) => c.name === name)!);
function setup() {
  const s = createGame(cards);
  s.events = [];
  for (const p of s.players) {
    p.board = [];
    p.hand = [];
    p.grave = [];
    p.deck = Array.from({ length: 20 }, () => card('Wisp'));
    p.mana = 100;
    p.reserve = 0;
    p.health = 40;
    p.armor = 0;
    delete p.weapon;
  }
  return s;
}
function play(s: Game, name: string, p = 0) {
  s.active = p;
  s.players[p].hand.push(card(name));
  return applyAction(s, { type: 'cast', p, index: s.players[p].hand.length - 1 });
}
function weapon(s: Game, p: number, attack: number, durability: number) {
  s.players[p].weapon = { card: card('Fiery War Axe'), attack, durability };
}
const unit = (s: Game, name: string) => s.players[0].board.find((u) => u.card.name === name)!;

describe('weapon Battlecry batch', () => {
  it.each(names)('%s supports every collectible printing', (name) => {
    const versions = cards.filter((c) => c.name === name);
    expect(versions.length).toBeGreaterThan(0);
    expect(versions.every(supported)).toBe(true);
  });
  it('adds durability and Attack independently, without creating a missing weapon', () => {
    let s = setup();
    weapon(s, 0, 3, 1);
    s = play(s, 'Air Guitarist');
    s = play(s, 'Toxicologist');
    expect(s.players[0].weapon).toMatchObject({ attack: 4, durability: 2 });
    expect(play(setup(), 'Air Guitarist').players[0].weapon).toBeUndefined();
  });
  it('Raider uses current weapon Attack, while an unarmed Raider gains nothing', () => {
    let s = setup();
    weapon(s, 0, 7, 2);
    s = play(s, 'Bloodsail Raider');
    expect(unit(s, 'Bloodsail Raider').attack).toBe(card('Bloodsail Raider').attack! + 7);
    expect(unit(play(setup(), 'Bloodsail Raider'), 'Bloodsail Raider').attack).toBe(
      card('Bloodsail Raider').attack,
    );
  });
  it.each([0, 2, 3, 8])('Luckydo checks the weapon threshold at %i Attack', (attack) => {
    let s = setup();
    if (attack) weapon(s, 0, attack, 1);
    s = play(s, 'Luckydo Buccaneer');
    const u = unit(s, 'Luckydo Buccaneer'),
      bonus = attack >= 3 ? 4 : 0;
    expect([u.attack, u.health]).toEqual([
      card('Luckydo Buccaneer').attack! + bonus,
      card('Luckydo Buccaneer').health! + bonus,
    ]);
  });
  it.each(['Bloodsail Corsair', 'Toxic Sewer Ooze'])(
    '%s removes one durability from living enemies and breaks depleted weapons',
    (name) => {
      let s = setup();
      weapon(s, 0, 3, 2);
      weapon(s, 1, 3, 1);
      weapon(s, 2, 3, 3);
      weapon(s, 3, 3, 2);
      s.players[3].health = 0;
      s = play(s, name);
      expect(s.players[0].weapon?.durability).toBe(2);
      expect(s.players[1].weapon).toBeUndefined();
      expect(s.players[2].weapon?.durability).toBe(2);
      expect(s.players[3].weapon?.durability).toBe(2);
      expect(s.events?.filter((e) => e.type === 'weapon-destroyed').map((e) => e.player)).toEqual([
        1,
      ]);
    },
  );
  it('Harrison draws current Durability across enemy weapons, rather than Attack', () => {
    let s = setup();
    weapon(s, 1, 9, 2);
    weapon(s, 2, 1, 3);
    s = play(s, 'Harrison Jones');
    expect(s.players[0].hand).toHaveLength(5);
    expect(s.players[0].deck).toHaveLength(15);
    expect(s.players[1].weapon).toBeUndefined();
    expect(s.players[2].weapon).toBeUndefined();
  });
  it('Harrison respects the hand limit and fatigue when rewards exhaust the deck', () => {
    let s = setup();
    weapon(s, 1, 2, 3);
    s.players[0].deck = [card('Wisp')];
    s.players[0].hand = Array.from({ length: 10 }, () => card('Wisp'));
    s = play(s, 'Harrison Jones');
    expect(s.players[0].hand).toHaveLength(10);
    expect(s.players[0].health).toBe(37);
    expect(s.players[0].weapon).toBeUndefined();
    expect(s.players[1].weapon).toBeUndefined();
  });
  it('Gluttonous Ooze gains Armor from current Attack, not Durability', () => {
    let s = setup();
    weapon(s, 1, 7, 1);
    weapon(s, 2, 2, 5);
    s = play(s, 'Gluttonous Ooze');
    expect(s.players[0].armor).toBe(9);
    expect(s.players[0].health).toBe(40);
  });
  it('Weaponsmith equips the exact 2/2 Battle Axe token', () => {
    const s = play(setup(), 'Arathi Weaponsmith');
    expect(s.players[0].weapon).toMatchObject({
      attack: 2,
      durability: 2,
      card: { id: 'EX1_398t', name: 'Battle Axe' },
    });
  });
  it('Blackscale requires a weapon and summons its Rush Naga without Charge', () => {
    expect(play(setup(), 'Blackscale Brute').players[0].board).toHaveLength(1);
    let s = setup();
    weapon(s, 0, 3, 2);
    s = play(s, 'Blackscale Brute');
    const naga = unit(s, 'Firescale Berserker');
    expect([naga.attack, naga.health]).toEqual([5, 6]);
    expect(unitMechanics(naga)).toContain('RUSH');
    expect(naga.rushOnly).toBe(true);
  });
  it('Buzzkill discards only a weapon and draws three; without a weapon it draws nothing', () => {
    let s = setup();
    s.players[0].hand = [card('Wisp'), card('Fiery War Axe')];
    s = play(s, 'Grimtotem Buzzkill');
    expect(s.players[0].grave.map((c) => c.name)).toContain('Fiery War Axe');
    expect(s.players[0].hand).toHaveLength(4);
    expect(s.players[0].deck).toHaveLength(17);
    s = play(setup(), 'Grimtotem Buzzkill');
    expect(s.players[0].hand).toHaveLength(0);
    expect(s.players[0].deck).toHaveLength(20);
  });
  it('Pillager restores printed stats of a weapon actually broken in combat', () => {
    let s = play(setup(), 'Fiery War Axe');
    s.players[0].weapon!.attack = 7;
    s.players[0].weapon!.durability = 1;
    s.players[0].heroReady = true;
    s = applyAction(s, { type: 'attack', p: 0, target: { p: 1 } });
    expect(s.players[0].weapon).toBeUndefined();
    s = play(s, 'Hoard Pillager');
    expect(s.players[0].weapon).toMatchObject({ attack: 3, durability: 2 });
  });
  it('enemy weapon removal records history for the weapon owner', () => {
    let s = play(setup(), 'Fiery War Axe');
    s = play(s, 'Acidic Swamp Ooze', 1);
    expect(s.events?.filter((e) => e.type === 'weapon-destroyed').map((e) => e.player)).toEqual([
      0,
    ]);
    s = play(s, 'Hoard Pillager');
    expect(s.players[0].weapon?.card.name).toBe('Fiery War Axe');
    expect(s.players[1].weapon).toBeUndefined();
  });
  it('replacement counts as destruction, and recovery does not remove the old grave entry', () => {
    let s = play(setup(), 'Fiery War Axe');
    s = play(s, 'Arathi Weaponsmith');
    s = play(s, 'Rummaging Kobold');
    expect(s.players[0].hand.map((c) => c.name)).toContain('Fiery War Axe');
    expect(s.players[0].grave.map((c) => c.name)).toContain('Fiery War Axe');
    expect(s.players[0].weapon?.card.name).toBe('Battle Axe');
  });
  it('re-equipping a recovered weapon records the replaced weapon as destroyed', () => {
    let s = play(setup(), 'Fiery War Axe');
    s = play(s, 'Arathi Weaponsmith');
    s = play(s, 'Hoard Pillager');
    expect(s.events?.filter((e) => e.type === 'weapon-destroyed')).toHaveLength(2);
    expect(['Fiery War Axe', 'Battle Axe']).toContain(s.players[0].weapon?.card.name);
  });
  it.each(['Hoard Pillager', 'Rummaging Kobold'])(
    '%s cannot recover discarded or interrupted weapons',
    (name) => {
      let s = setup();
      s.players[0].hand = [card('Fiery War Axe')];
      s = play(s, 'Grimtotem Buzzkill');
      s = play(s, name);
      expect(s.players[0].weapon).toBeUndefined();
      expect(s.players[0].hand.some((c) => c.type === 'WEAPON')).toBe(false);
      s = setup();
      s.players[1].reserve = 3;
      s = play(s, 'Fiery War Axe');
      s = applyAction(s, { type: 'interrupt', p: 1 });
      s.players[1].reserve = 0;
      s = play(s, name);
      expect(s.players[0].weapon).toBeUndefined();
      // Interrupt returns the original card to hand, but recovery must not add a second.
      expect(s.players[0].hand.filter((c) => c.type === 'WEAPON')).toHaveLength(1);
      expect(s.events?.some((e) => e.type === 'weapon-destroyed')).toBe(false);
    },
  );
  it('Kobold burns a recovered card when the hand is full', () => {
    let s = play(setup(), 'Fiery War Axe');
    s = play(s, 'Arathi Weaponsmith');
    s.players[0].hand = Array.from({ length: 10 }, () => card('Wisp'));
    s = play(s, 'Rummaging Kobold');
    expect(s.players[0].hand).toHaveLength(10);
    expect(s.log.some((line) => line.includes('burns Fiery War Axe'))).toBe(true);
  });
});
