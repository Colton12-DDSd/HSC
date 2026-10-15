import { createClient } from '@supabase/supabase-js';
import type { Deck } from './cards';
const url = import.meta.env.VITE_SUPABASE_URL,
  key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const db = url && key ? createClient(url, key) : null;
export async function saveCloud(d: Deck) {
  if (!db) throw Error('Configure Supabase first');
  const { data, error } = await db.rpc('save_deck', {
    p_id: d.id ?? null,
    p_name: d.name,
    p_class: d.class,
    p_commander: d.commander,
    p_cards: d.cards,
  });
  if (error) throw error;
  return { ...d, id: data as string };
}
export async function loadCloud(): Promise<Deck[]> {
  if (!db) throw Error('Configure Supabase first');
  const { data, error } = await db
    .from('decks')
    .select(
      'id,name,class,commander:cards!commander_card_id(hearthstone_id),deck_cards(cards(hearthstone_id))',
    );
  if (error) throw error;
  return (data ?? []).map((x: any) => ({
    version: 1,
    id: x.id,
    name: x.name,
    class: x.class,
    commander: x.commander?.hearthstone_id ?? null,
    cards: x.deck_cards.map((r: any) => r.cards.hearthstone_id),
  }));
}
export function download(name: string, value: unknown) {
  const a = document.createElement('a'),
    url = URL.createObjectURL(
      new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }),
    );
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
