import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { type Card, cardStats, cardCost } from './cards';
import { applyAction, createGame, debugAction, handCost, type Game, type Target } from './engine';
import { supported } from './effects';
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];
const manifest = JSON.parse(readFileSync('data/memory-battlecry-batch.json', 'utf8')) as {
  names: string[];
};
const card = (name: string) => {
  const c = cards.find((c) => c.name === name);
  if (!c) throw Error(name);
  return structuredClone(c);
};
function setup() {
  const s = createGame(cards);
  s.events = [];
  s.turn = 9;
  for (const p of s.players)
    Object.assign(p, {
      hand: [],
      deck: [],
      board: [],
      grave: [],
      health: 40,
      armor: 0,
      mana: 100,
      maxMana: 10,
      reserve: 0,
      reduction: 0,
      handReduction: 0,
    });
  return s;
}
function put(s: Game, name: string, p = 0) {
  return debugAction(s, { type: 'summon', p, card: card(name) });
}
function play(s: Game, name: string, target?: Target) {
  s = structuredClone(s);
  s.players[0].hand.push({ ...card(name), heldSince: 0 });
  return applyAction(s, { type: 'cast', p: 0, index: s.players[0].hand.length - 1, target });
}
function kill(s: Game, uid: number, p = 0) {
  s = structuredClone(s);
  s.players[p].board.find((u) => u.uid === uid)!.health = 0;
  return debugAction(s, { type: 'edit', p: 0, field: 'mana', value: 10 });
}
const last = (s: Game, p = 0) => s.players[p].board.at(-1)!;
const target = (s: Game, p = 0) => ({ p, uid: last(s, p).uid });
const hand = (s: Game, p = 0) => s.players[p].hand;
const choose = (s: Game, index = 0) => applyAction(s, { type: 'choose', p: 0, index });
function events(s: Game, names: string[], turn = 9, p = 0) {
  for (const n of names) s.events!.push({ type: 'play', player: p, turn, card: card(n) });
  return s;
}
function undead(s: Game) {
  s.events = [
    { type: 'turn', player: 0, turn: 5 },
    { type: 'death', player: 0, turn: 6, card: card('Wisp') },
  ];
  return s;
}
function equip(s: Game, p = 0) {
  s.players[p].weapon = { card: card('Fiery War Axe'), attack: 3, durability: 2 };
  return s;
}
describe('stored identity, weapons and resource Battlecries', () => {
  it('contains fifty distinct additions', () => expect(new Set(manifest.names).size).toBe(50));
  it.each(manifest.names)('%s supports all collectible printings', (n) =>
    expect(cards.filter((c) => c.name === n).every(supported)).toBe(true),
  );
  it('Amorphous Slime discards one Undead and later summons exactly that minion without Battlecry', () => {
    const s = setup();
    s.players[0].hand = [card('Wisp'), card('Fireball')];
    let n = play(s, 'Amorphous Slime');
    expect(hand(n).map((c) => c.name)).toEqual(['Fireball']);
    expect(last(n).grantedDeathrattles![0].source.name).toContain('Wisp');
    n = kill(n, last(n).uid);
    expect(last(n).card.name).toBe('Wisp');
  });
  it('Expired Merchant remembers the discarded highest-Cost physical card and returns two copies', () => {
    const s = setup();
    s.players[0].hand = [card('Fireball'), card('Wisp')];
    let n = play(s, 'Expired Merchant');
    expect(hand(n).map((c) => c.name)).toEqual(['Wisp']);
    n = kill(n, last(n).uid);
    expect(hand(n).map((c) => c.name)).toEqual(['Wisp', 'Fireball', 'Fireball']);
  });
  it.each([
    ['Carnivorous Cube', 2],
    ['Ravenous Kraken', 1],
  ] as const)(
    '%s destroys a chosen friendly minion and later summons the stored number of fresh copies',
    (name, count) => {
      let s = put(setup(), 'Chillwind Yeti');
      last(s).health = 1;
      const t = target(s);
      s = play(s, name, t);
      expect(s.players[0].board.some((u) => u.uid === t.uid)).toBe(false);
      s = kill(s, last(s).uid);
      expect(s.players[0].board).toHaveLength(count);
      expect(
        s.players[0].board.every((u) => u.card.name === 'Chillwind Yeti' && u.health === 5),
      ).toBe(true);
    },
  );
  it('Mindflayer Kaahrj leaves the chosen enemy alone and summons a fresh copy for you on death', () => {
    let s = put(setup(), 'Chillwind Yeti', 1);
    const t = target(s, 1);
    s = play(s, 'Mindflayer Kaahrj', t);
    expect(s.players[1].board).toHaveLength(1);
    s = kill(s, last(s).uid);
    expect(last(s).card.name).toBe('Chillwind Yeti');
    expect(s.players[1].board[0].uid).toBe(t.uid);
  });
  it('Moat Lurker returns its remembered victim to the original controller, not the Lurker controller', () => {
    let s = put(setup(), 'Chillwind Yeti', 2);
    s = play(s, 'Moat Lurker', target(s, 2));
    expect(s.players[2].board).toHaveLength(0);
    s = kill(s, last(s).uid);
    expect(last(s, 2).card.name).toBe('Chillwind Yeti');
    expect(s.players[0].board).toHaveLength(0);
  });
  it('Gral eats a deck minion, gains its current stats, and returns the remembered card on death', () => {
    const s = setup();
    s.players[0].deck = [card('Chillwind Yeti')];
    let n = play(s, 'Gral, the Shark');
    expect(n.players[0].deck).toHaveLength(0);
    expect(last(n).attack).toBe(card('Gral, the Shark').attack! + 4);
    expect(last(n).health).toBe(card('Gral, the Shark').health! + 5);
    n = kill(n, last(n).uid);
    expect(hand(n).map((c) => c.name)).toEqual(['Chillwind Yeti']);
  });
  it('Teron stores all other friendly minions and resummons each with +1/+1', () => {
    let s = put(setup(), 'Chillwind Yeti');
    s = put(s, 'River Crocolisk');
    s = play(s, 'Teron Gorefiend');
    expect(s.players[0].board).toHaveLength(1);
    s = kill(s, last(s).uid);
    expect(s.players[0].board.map((u) => [u.card.name, u.attack, u.health])).toEqual([
      ['Chillwind Yeti', 5, 6],
      ['River Crocolisk', 3, 4],
    ]);
  });
  it('Voodoo Doll destroys only the remembered unit identity, even after ownership changes', () => {
    let s = put(setup(), 'Chillwind Yeti', 1);
    const t = target(s, 1);
    s = play(s, 'Voodoo Doll', t);
    const doll = last(s).uid;
    const u = s.players[1].board.pop()!;
    s.players[2].board.push(u);
    s = kill(s, doll);
    expect(s.players[2].board).toHaveLength(0);
  });
  it('Voodoo Doll does not destroy a later same-named minion after the original leaves play', () => {
    let s = put(setup(), 'Chillwind Yeti', 1);
    const t = target(s, 1);
    s = play(s, 'Voodoo Doll', t);
    const doll = last(s).uid;
    s.players[1].board = [];
    s = put(s, 'Chillwind Yeti', 1);
    s = kill(s, doll);
    expect(s.players[1].board).toHaveLength(1);
  });
  it('Seeping Oozeling gains the exact eligible deck Deathrattle without removing its card', () => {
    const s = setup();
    s.players[0].deck = [card('Loot Hoarder'), card('Fireball')];
    let n = play(s, 'Seeping Oozeling');
    expect(n.players[0].deck).toHaveLength(2);
    n = kill(n, last(n).uid);
    expect(hand(n).map((c) => c.name)).toEqual(['Loot Hoarder']);
    expect(n.players[0].deck).toHaveLength(1);
  });
  it('Wretched Reclaimer destroys a friendly minion and returns a fresh full-health copy without Battlecry', () => {
    let s = put(setup(), 'Chillwind Yeti');
    const t = target(s);
    last(s).health = 1;
    s = play(s, 'Wretched Reclaimer', t);
    const u = s.players[0].board.find((u) => u.card.name === 'Chillwind Yeti')!;
    expect(u.health).toBe(5);
    expect(u.uid).not.toBe(t.uid);
    expect(s.events!.filter((e) => e.type === 'death')).toHaveLength(1);
  });
  it('Brood Keeper equips its exact 2/2 Sword only while a Dragon is held', () => {
    const s = setup();
    s.players[0].hand = [card('Alexstrasza')];
    const n = play(s, 'Brood Keeper');
    expect(n.players[0].weapon?.card.id).toBe('EDR_457t');
    expect([n.players[0].weapon?.attack, n.players[0].weapon?.durability]).toEqual([2, 2]);
    expect(play(setup(), 'Brood Keeper').players[0].weapon).toBeUndefined();
  });
  it('Dimensional Weaponsmith buffs only hand minions and weapons and the weapon keeps that Attack when equipped', () => {
    const s = setup();
    s.players[0].hand = [card('Fiery War Axe'), card('Chillwind Yeti'), card('Fireball')];
    let n = play(s, 'Dimensional Weaponsmith');
    expect(cardStats(hand(n)[0]).attack).toBe(5);
    expect(cardStats(hand(n)[1]).attack).toBe(6);
    n = applyAction(n, { type: 'cast', p: 0, index: 0 });
    expect(n.players[0].weapon?.attack).toBe(5);
  });
  it('Kobold Stickyfinger transfers live weapon stats and destroys only a replaced weapon', () => {
    const s = equip(equip(setup()), 1);
    s.players[1].weapon!.attack = 7;
    s.players[2].health = 0;
    const n = play(s, 'Kobold Stickyfinger');
    expect(n.players[1].weapon).toBeUndefined();
    expect(n.players[0].weapon?.attack).toBe(7);
    expect(n.events!.filter((e) => e.type === 'weapon-destroyed').map((e) => e.player)).toEqual([
      0,
    ]);
  });
  it('Lady Ashvane buffs weapons in hand, deck and play; equipped hand buffs are applied once', () => {
    const s = equip(setup());
    s.players[0].hand = [card('Fiery War Axe')];
    s.players[0].deck = [card('Fiery War Axe')];
    let n = play(s, 'Lady Ashvane');
    expect([n.players[0].weapon!.attack, n.players[0].weapon!.durability]).toEqual([4, 3]);
    expect(cardStats(hand(n)[0]).attack).toBe(4);
    expect(cardStats(n.players[0].deck[0]).health).toBe(3);
    n = applyAction(n, { type: 'cast', p: 0, index: 0 });
    expect([n.players[0].weapon!.attack, n.players[0].weapon!.durability]).toEqual([4, 3]);
  });
  it('Obsidiansmith buffs a chosen bottom-deck weapon and preserves it on top until drawn', () => {
    const s = setup();
    s.players[0].deck = [card('Fiery War Axe')];
    const n = choose(play(s, 'Obsidiansmith'));
    expect(n.players[0].deck).toHaveLength(1);
    expect(cardStats(n.players[0].deck[0])).toEqual({ attack: 4, health: 3 });
    expect(hand(n)).toHaveLength(0);
  });
  it('Phantom Freebooter gains current weapon Attack and Durability, not printed stats', () => {
    const s = equip(setup());
    s.players[0].weapon!.attack = 6;
    s.players[0].weapon!.durability = 1;
    const n = play(s, 'Phantom Freebooter');
    expect([last(n).attack, last(n).health]).toEqual([
      card('Phantom Freebooter').attack! + 6,
      card('Phantom Freebooter').health! + 1,
    ]);
  });
  it('Selfless Sidekick removes one actual weapon from the deck and equips its enchantments', () => {
    const s = setup(),
      c = card('Fiery War Axe');
    c.modifiers = [{ sourceCardId: 'test', sourceName: 'Test', attack: 2, health: 1 }];
    s.players[0].deck = [c, card('Wisp')];
    const n = play(s, 'Selfless Sidekick');
    expect(n.players[0].deck.map((c) => c.name)).toEqual(['Wisp']);
    expect([n.players[0].weapon?.attack, n.players[0].weapon?.durability]).toEqual([5, 3]);
  });
  it('Steeldancer summons a minion costing the current weapon Attack, without a Battlecry', () => {
    const n = play(equip(setup()), 'Steeldancer');
    expect(
      n.players[0].board.filter((u) => u.card.name !== 'Steeldancer').map((u) => u.card.cost),
    ).toEqual([3]);
    expect(n.log.filter((x) => x.includes('triggers Battlecry'))).toHaveLength(1);
  });
  it('Swarthy Swordshiner sets weapon Attack and Durability to exactly three', () => {
    const s = equip(setup());
    s.players[0].weapon!.attack = 8;
    const n = play(s, 'Swarthy Swordshiner');
    expect([n.players[0].weapon?.attack, n.players[0].weapon?.durability]).toEqual([3, 3]);
  });
  it('Sword Eater equips its pinned 3/2 Sword', () => {
    const n = play(setup(), 'Sword Eater');
    expect(n.players[0].weapon?.card.id).toBe('DMF_521t');
    expect([n.players[0].weapon?.attack, n.players[0].weapon?.durability]).toEqual([3, 2]);
  });
  it('Weapons Attendant requires another Pirate before equipping a deck weapon', () => {
    let s = put(setup(), 'Bloodsail Raider');
    s.players[0].deck = [card('Fiery War Axe')];
    s = play(s, 'Weapons Attendant');
    expect(s.players[0].weapon?.card.name).toBe('Fiery War Axe');
    expect(play(setup(), 'Weapons Attendant').players[0].weapon).toBeUndefined();
  });
  it('Weapons Expert buffs an equipped weapon, otherwise draws one without equipping it', () => {
    const n = play(equip(setup()), 'Weapons Expert');
    expect([n.players[0].weapon?.attack, n.players[0].weapon?.durability]).toEqual([4, 3]);
    const s = setup();
    s.players[0].deck = [card('Fiery War Axe')];
    const draw = play(s, 'Weapons Expert');
    expect(hand(draw)[0].name).toBe('Fiery War Axe');
    expect(draw.players[0].weapon).toBeUndefined();
  });
  it('Arcane Golem gives every living opponent a full crystal, respecting their cap', () => {
    const s = setup();
    s.players.slice(1).forEach((p) => {
      p.maxMana = 3;
      p.mana = 1;
    });
    s.players[2].health = 0;
    const n = play(s, 'Arcane Golem');
    expect(n.players[1].maxMana).toBe(4);
    expect(n.players[1].mana).toBe(2);
    expect(n.players[2].maxMana).toBe(3);
  });
  it('Audio Amplifier raises the Mana and hand caps to eleven without refreshing current crystals', () => {
    const s = setup();
    s.players[0].mana = 2;
    let n = play(s, 'Audio Amplifier');
    expect(n.players[0].manaCap).toBe(11);
    expect(n.players[0].maxHandSize).toBe(11);
    expect(n.players[0].maxMana).toBe(10);
    expect(n.players[0].mana).toBe(2 - card('Audio Amplifier').cost);
    for (let i = 0; i < 4; i++) n = applyAction(n, { type: 'end', p: n.active });
    expect(n.players[0].maxMana).toBe(11);
    expect(n.players[0].mana).toBe(11);
  });
  it.each([
    ['Foxy Fraud', 2],
    ['Spacerock Collector', 1],
  ] as const)('%s discounts the next matching Combo card only', (name, n) => {
    const s = play(setup(), name),
      combo = cards.find((c) => c.mechanics?.includes('COMBO') && c.cost >= 2)!;
    expect(handCost(s.players[0], combo)).toBe(Math.max(0, combo.cost - n));
    expect(handCost(s.players[0], card('Fireball'))).toBe(4);
  });
  it('Pride Seeker discounts the next Choose One card only', () => {
    const s = play(setup(), 'Pride Seeker'),
      c = cards.find((c) => c.mechanics?.includes('CHOOSE_ONE') && c.cost >= 2)!;
    expect(handCost(s.players[0], c)).toBe(c.cost - 2);
    expect(handCost(s.players[0], card('Fireball'))).toBe(4);
  });
  it('Spelunker discounts a Temporary hand card and ignores ordinary copies', () => {
    const n = play(setup(), 'Spelunker');
    expect(handCost(n.players[0], { ...card('Fireball'), temporaryUntilTurn: n.turn })).toBe(2);
    expect(handCost(n.players[0], card('Fireball'))).toBe(4);
  });
  it('Ingenious Artificer refreshes by the next Draenei live Attack, then consumes the effect', () => {
    let s = play(setup(), 'Ingenious Artificer');
    s.players[0].mana = card('Crimson Commander').cost;
    s = play(s, 'Crimson Commander');
    expect(s.players[0].mana).toBe(card('Crimson Commander').attack);
    expect(s.players[0].playEffects).toHaveLength(0);
  });
  it('Wizened Truthseeker resets every living hand to printed Costs without deleting stat buffs', () => {
    const s = setup(),
      c = card('Fireball');
    c.cost = 0;
    c.printedCost = 4;
    c.temporaryCosts = [{ turn: 9, set: 1, source: 'Test' }];
    s.players[0].hand = [c];
    s.players[1].hand = [
      {
        ...card('Chillwind Yeti'),
        cost: 1,
        printedCost: 4,
        modifiers: [{ sourceCardId: 'test', sourceName: 'Test', attack: 1, health: 1 }],
      },
    ];
    const n = play(s, 'Wizened Truthseeker');
    expect(hand(n)[0].cost).toBe(4);
    expect(hand(n)[0].temporaryCosts).toEqual([]);
    expect(hand(n, 1)[0].cost).toBe(4);
    expect(cardStats(hand(n, 1)[0])).toEqual({ attack: 5, health: 6 });
  });
  it('Ysiel Windsinger makes every spell, including future arrivals, cost one until end of turn', () => {
    let s = play(setup(), 'Ysiel Windsinger');
    expect(handCost(s.players[0], card('Fireball'))).toBe(1);
    expect(handCost(s.players[0], card('Wisp'))).toBe(0);
    s = applyAction(s, { type: 'end', p: 0 });
    expect(handCost(s.players[0], card('Fireball'))).toBe(4);
  });
  it("Bearon Gla'shear summons a freezing token for each own Frost spell play", () => {
    const n = play(events(setup(), ['Frost Nova', 'Frost Nova', 'Fireball']), "Bearon Gla'shear");
    expect(n.players[0].board.filter((u) => u.card.id === 'AV_257t')).toHaveLength(2);
  });
  it('Inquisitive Creation deals one combined hit of one plus distinct schools, respecting Shield', () => {
    let s = put(events(setup(), ['Fireball', 'Frost Nova']), 'Annoy-o-Tron', 1);
    s = put(s, 'Chillwind Yeti', 2);
    s = play(s, 'Inquisitive Creation');
    expect(last(s, 1).health).toBe(2);
    expect(last(s, 1).shield).toBe(false);
    expect(last(s, 2).health).toBe(2);
  });
  it('Living Prairie summons two exact Rush Cows only after an Elemental on your previous turn', () => {
    const s = setup();
    s.events = [{ type: 'turn', player: 0, turn: 5 }];
    events(s, ['Water Elemental'], 5);
    const n = play(s, 'Living Prairie');
    expect(n.players[0].board.filter((u) => u.card.id === 'WW_024t')).toHaveLength(2);
  });
  it('Pogo-Hopper counts prior own copies, excluding the current play and opponents', () => {
    const s = events(setup(), ['Pogo-Hopper', 'Pogo-Hopper']);
    events(s, ['Pogo-Hopper'], 9, 1);
    const n = play(s, 'Pogo-Hopper');
    expect(last(n).attack).toBe(card('Pogo-Hopper').attack! + 4);
  });
  it('SI:7 Informant counts prior SI:7 names rather than unrelated Rogue cards', () => {
    const n = play(events(setup(), ['SI:7 Agent', 'SI:7 Smuggler', 'Wisp']), 'SI:7 Informant');
    expect(last(n).attack).toBe(card('SI:7 Informant').attack! + 2);
  });
  it('SI:7 Smuggler upgrades its summon Cost per prior own SI:7 play', () => {
    const n = play(events(setup(), ['SI:7 Agent', 'SI:7 Informant']), 'SI:7 Smuggler');
    expect(n.players[0].board.filter((u) => u.card.name !== 'SI:7 Smuggler')[0].card.cost).toBe(3);
  });
  it('Joymancer Jepetto uses recorded play-time stats, including hand buffs, and copies printed cards', () => {
    const s = setup();
    s.events = [
      {
        type: 'play',
        player: 0,
        turn: 1,
        card: card('Chillwind Yeti'),
        playedAttack: 1,
        playedHealth: 5,
      },
      { type: 'play', player: 0, turn: 2, card: card('Wisp'), playedAttack: 2, playedHealth: 2 },
    ];
    const n = play(s, 'Joymancer Jepetto');
    expect(hand(n).map((c) => c.name)).toEqual(['Chillwind Yeti']);
    expect(cardStats(hand(n)[0])).toEqual({ attack: 4, health: 5 });
  });
  it('Kargal Battlescar counts actual Watch Post summons, not merely card plays', () => {
    let s = put(setup(), 'Far Watch Post');
    s = put(s, 'Far Watch Post');
    events(s, ['Far Watch Post']);
    s = play(s, 'Kargal Battlescar');
    expect(s.players[0].board.filter((u) => u.card.id === 'BAR_077t')).toHaveLength(2);
  });
  it('Bone Flinger deals two to a chosen character after an own Undead died since the last turn', () => {
    const n = play(undead(setup()), 'Bone Flinger', { p: 2 });
    expect(n.players[2].health).toBe(38);
    expect(n.players[1].health).toBe(40);
  });
  it('Nerubian Flyer summons its exact 2/2 Nerubian after the qualifying death', () =>
    expect(
      play(undead(setup()), 'Nerubian Flyer').players[0].board.some(
        (u) => u.card.id === 'RLK_956t',
      ),
    ).toBe(true));
  it('Noxious Infiltrator applies Poisonous to its Battlecry damage after a qualifying death', () => {
    let s = put(undead(setup()), 'Chillwind Yeti', 1);
    s = play(s, 'Noxious Infiltrator', target(s, 1));
    expect(s.players[1].board).toHaveLength(0);
  });
  it('Unliving Champion summons two pinned 3/2 Undead after the qualifying death', () => {
    const n = play(undead(setup()), 'Unliving Champion');
    expect(
      n.players[0].board.filter(
        (u) => u.card.id === 'RLK_909t' && u.attack === 3 && u.health === 2,
      ),
    ).toHaveLength(2);
  });
  it('High Cultist Basaleph revives only friendly Undead that died after the previous own turn', () => {
    const s = undead(setup());
    s.events!.push(
      { type: 'death', player: 0, turn: 5, card: card('Wisp') },
      { type: 'death', player: 1, turn: 6, card: card('Wisp') },
    );
    const n = play(s, 'High Cultist Basaleph');
    expect(n.players[0].board.filter((u) => u.card.name === 'Wisp')).toHaveLength(1);
  });
  it('Nerubian Vizier discounts the discovered spell only after a qualifying Undead death', () => {
    let n = play(undead(setup()), 'Nerubian Vizier');
    const base = n.choice!.options[0].cost;
    n = choose(n);
    expect(hand(n)[0].cost).toBe(Math.max(0, base - 2));
    const s = play(setup(), 'Nerubian Vizier'),
      original = s.choice!.options[0].cost;
    expect(hand(choose(s))[0].cost).toBe(original);
  });
  it('Amalgam of the Deep discovers only minions matching a chosen friendly tribe', () => {
    let s = put(setup(), 'River Crocolisk');
    s = play(s, 'Amalgam of the Deep', target(s));
    expect(
      s.choice!.options.every(
        (c) => c.race === 'BEAST' || c.race === 'ALL' || c.races?.includes('BEAST'),
      ),
    ).toBe(true);
    expect(hand(choose(s))).toHaveLength(1);
  });
  it('Elemental of Madness offers any-class spells of its Attack and sets the chosen Cost to zero this turn', () => {
    let s = play(setup(), 'Elemental of Madness');
    const printed = s.choice!.options[0].cost;
    expect(s.choice!.options.every((c) => c.type === 'SPELL' && c.cost === last(s).attack)).toBe(
      true,
    );
    s = choose(s);
    expect(cardCost(hand(s)[0])).toBe(0);
    s = applyAction(s, { type: 'end', p: 0 });
    expect(cardCost(hand(s)[0])).toBe(printed);
  });
  it('Scrappy Scavenger discovers cards costing precisely the remaining regular Mana', () => {
    const s = setup();
    s.players[0].mana = card('Scrappy Scavenger').cost + 3;
    const n = play(s, 'Scrappy Scavenger');
    expect(n.choice!.options.every((c) => c.cost === 3)).toBe(true);
  });
  it('Madam Goya recruits all available same-named deck copies without moving the target', () => {
    let s = put(setup(), 'Chillwind Yeti');
    const t = target(s);
    s.players[0].deck = [card('Chillwind Yeti'), card('Chillwind Yeti'), card('Fireball')];
    s = play(s, 'Madam Goya', t);
    expect(s.players[0].board.filter((u) => u.card.name === 'Chillwind Yeti')).toHaveLength(3);
    expect(s.players[0].board.some((u) => u.uid === t.uid)).toBe(true);
    expect(s.players[0].deck.map((c) => c.name)).toEqual(['Fireball']);
  });
  it('empty discard and deck pools create no stored card or phantom Deathrattle reward', () => {
    for (const name of ['Amorphous Slime', 'Expired Merchant', 'Gral, the Shark']) {
      let n = play(setup(), name);
      expect(last(n).grantedDeathrattles).toBeUndefined();
      n = kill(n, last(n).uid);
      expect(hand(n)).toHaveLength(0);
      expect(n.players[0].board).toHaveLength(0);
    }
  });
  it('silencing a Cube clears its stored victim, while a live copied Cube retains independent memory', () => {
    let s = put(setup(), 'Chillwind Yeti');
    s = play(s, 'Carnivorous Cube', target(s));
    const cube = last(s).uid;
    s = play(s, 'Faceless Manipulator', { p: 0, uid: cube });
    const copy = last(s).uid;
    s = play(s, 'Ironbeak Owl', { p: 0, uid: cube });
    s = kill(s, cube);
    expect(s.players[0].board.some((u) => u.card.name === 'Chillwind Yeti')).toBe(false);
    s = kill(s, copy);
    expect(s.players[0].board.filter((u) => u.card.name === 'Chillwind Yeti')).toHaveLength(2);
  });
  it('a stored reward respects the seven-minion board limit and cannot replay the captured Battlecry', () => {
    let s = put(setup(), 'Elven Archer');
    s = play(s, 'Carnivorous Cube', target(s));
    const cube = last(s).uid;
    for (let i = 0; i < 6; i++) s = put(s, 'Wisp');
    s = kill(s, cube);
    expect(s.players[0].board).toHaveLength(7);
    expect(s.players[0].board.filter((u) => u.card.name === 'Elven Archer')).toHaveLength(1);
    expect(s.players[1].health).toBe(40);
  });
  it('the remembered card state survives a JSON scenario round trip without referencing live card objects', () => {
    const s = setup();
    s.players[0].hand = [card('Fireball')];
    const n = play(s, 'Expired Merchant'),
      uid = last(n).uid;
    const restored = JSON.parse(JSON.stringify(n)) as Game;
    expect(kill(restored, uid)).toEqual(kill(n, uid));
  });
  it('Kobold theft processes all living opponents without recording their stolen weapons as destroyed', () => {
    let s = equip(equip(equip(setup(), 1), 2), 3);
    s.players[3].weapon!.attack = 8;
    s = play(s, 'Kobold Stickyfinger');
    expect(s.players.slice(1).every((p) => !p.weapon)).toBe(true);
    expect(s.players[0].weapon!.attack).toBe(8);
    expect(s.events!.filter((e) => e.type === 'weapon-destroyed').map((e) => e.player)).toEqual([
      0, 0,
    ]);
  });
  it('Undead prerequisites ignore deaths during the last own turn and deaths controlled by opponents', () => {
    const s = setup();
    s.events = [
      { type: 'turn', player: 0, turn: 5 },
      { type: 'death', player: 0, turn: 5, card: card('Wisp') },
      { type: 'death', player: 1, turn: 6, card: card('Wisp') },
    ];
    expect(play(s, 'Bone Flinger', { p: 1 }).players[1].health).toBe(40);
    expect(play(s, 'Nerubian Flyer').players[0].board).toHaveLength(1);
  });
  it('Jepetto records actual hand-enchanted play stats rather than recomputing them at recall time', () => {
    let s = setup();
    const yeti = card('Chillwind Yeti');
    yeti.modifiers = [{ sourceCardId: 'test', sourceName: 'Test', attack: -3, health: 0 }];
    s.players[0].hand = [yeti];
    s = applyAction(s, { type: 'cast', p: 0, index: 0 });
    expect(s.events!.find((e) => e.type === 'play')!.playedAttack).toBe(1);
    s = play(s, 'Joymancer Jepetto');
    expect(hand(s).map((c) => c.name)).toEqual(['Chillwind Yeti']);
    expect(cardStats(hand(s)[0])).toEqual({ attack: 4, health: 5 });
  });
  it('Amalgam accepts either tribe of a dual-type target and does not offer unrelated tribes', () => {
    let s = put(setup(), 'Cloud Serpent');
    s = play(s, 'Amalgam of the Deep', target(s));
    expect(
      s.choice!.options.every(
        (c) =>
          c.race === 'ALL' ||
          c.races?.includes('ALL') ||
          c.race === 'ELEMENTAL' ||
          c.race === 'DRAGON' ||
          c.races?.some((t) => ['ELEMENTAL', 'DRAGON'].includes(t)),
      ),
    ).toBe(true);
  });
});
