export interface StatModifier {
  expiresAtTurn?: number;
  sourceCardId: string;
  sourceName: string;
  attack: number;
  health: number;
}
export interface Card {
  modifiers?: StatModifier[];
  id: string;
  dbfId: number;
  name: string;
  type: string;
  set: string;
  rarity: string;
  cost: number;
  attack?: number;
  health?: number;
  durability?: number;
  cardClass: string;
  classes?: string[];
  mechanics?: string[];
  race?: string;
  races?: string[];
  text?: string;
  collectible: boolean;
  wildLegal: boolean | null;
}
export interface Deck {
  version: 1;
  id?: string;
  name: string;
  class: string;
  commander: string | null;
  cards: string[];
}
export const classes = [
  'DEATHKNIGHT',
  'DEMONHUNTER',
  'DRUID',
  'HUNTER',
  'MAGE',
  'PALADIN',
  'PRIEST',
  'ROGUE',
  'SHAMAN',
  'WARLOCK',
  'WARRIOR',
];
export const clean = (s = '') =>
  s
    .replace(/<[^>]*>/g, '')
    .replace(/\[x\]/g, '')
    .replace(/\$|#/g, '')
    .replace(/&nbsp;/g, ' ');
export const image = (c: Card) =>
  `${import.meta.env.VITE_CARD_ASSET_BASE || 'https://art.hearthstonejson.com/v1/render/latest/enUS/512x'}/${c.id}.png`;
export const eligibleClass = (c: Card, cls: string) =>
  (c.classes ?? [c.cardClass]).some((v) => v === 'NEUTRAL' || v === cls);
export function validateDeck(d: Deck, cards: Card[]) {
  const map = new Map(cards.map((c) => [c.id, c]));
  const errors: string[] = [];
  const commander = map.get(d.commander ?? '');
  if (d.cards.length !== 100)
    errors.push(`${d.cards.length}/100 cards · add ${Math.max(0, 100 - d.cards.length)} more`);
  if (
    !commander ||
    commander.type !== 'MINION' ||
    commander.rarity !== 'LEGENDARY' ||
    !commander.collectible
  )
    errors.push('Choose a collectible legendary minion commander');
  else if (!eligibleClass(commander, d.class)) errors.push('Commander does not match chosen class');
  const names = new Set<string>();
  for (const id of [...d.cards, ...(d.commander ? [d.commander] : [])]) {
    const c = map.get(id);
    if (!c) {
      errors.push(`Unknown card: ${id}`);
      continue;
    }
    if (names.has(c.name)) errors.push(`Singleton conflict: ${c.name}`);
    names.add(c.name);
    if (!eligibleClass(c, d.class)) errors.push(`Class mismatch: ${c.name}`);
    if (c.wildLegal !== true)
      errors.push(
        c.wildLegal === null
          ? 'Wild legality awaits Blizzard verification'
          : `Not Wild legal: ${c.name}`,
      );
  }
  return [...new Set(errors)];
}
export function parseDeck(value: unknown, cards: Card[]): Deck {
  const d = value as Deck;
  if (
    !d ||
    d.version !== 1 ||
    typeof d.name !== 'string' ||
    !classes.includes(d.class) ||
    !(d.commander === null || typeof d.commander === 'string') ||
    !Array.isArray(d.cards) ||
    d.cards.length > 100 ||
    !d.cards.every((c) => typeof c === 'string')
  )
    throw Error('Invalid Commander deck JSON');
  const known = new Set(cards.map((c) => c.id));
  if ([...d.cards, ...(d.commander ? [d.commander] : [])].some((id) => !known.has(id)))
    throw Error('Deck contains unknown cards');
  if (new Set(d.cards).size !== d.cards.length) throw Error('Deck contains duplicate IDs');
  return {
    version: 1,
    name: d.name.slice(0, 100),
    class: d.class,
    commander: d.commander,
    cards: d.cards,
  };
}

/** Printed card data stays unchanged; physical cards carry their own enchantments. */
export function cardStats(card: Card) {
  return (card.modifiers ?? []).reduce(
    (stats, modifier) => ({
      attack: stats.attack + modifier.attack,
      health: stats.health + modifier.health,
    }),
    { attack: card.attack ?? 0, health: card.health ?? 1 },
  );
}
