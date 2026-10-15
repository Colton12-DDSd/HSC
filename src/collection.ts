import type { Card } from './cards';
import { db } from './storage';
export async function loadCollection(): Promise<Card[]> {
  if (db) {
    const cards: Card[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await db
        .from('cards')
        .select('raw_data,wild_legal,legality_verified_at')
        .order('hearthstone_id')
        .range(from, from + 999);
      if (error) throw Error(`Supabase collection: ${error.message}`);
      for (const row of data)
        cards.push({
          ...row.raw_data,
          wildLegal: row.legality_verified_at ? row.wild_legal : null,
        });
      if (data.length < 1000) break;
    }
    if (cards.length) return cards;
  }
  const r = await fetch('/data/cards.json');
  if (!r.ok) throw Error('Card snapshot could not load');
  return r.json();
}
