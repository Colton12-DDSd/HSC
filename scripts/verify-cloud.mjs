import { createClient } from '@supabase/supabase-js';
process.loadEnvFile('.env.local');
const db = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
});
const { count, error } = await db.from('cards').select('id', { head: true, count: 'exact' });
if (error) throw error;
const sample = await db
  .from('cards')
  .select('hearthstone_id,name,mana_cost,raw_data')
  .eq('hearthstone_id', 'CS2_029')
  .single();
if (sample.error) throw sample.error;
if (sample.data.name !== 'Fireball' || sample.data.mana_cost !== 4)
  throw Error('Metadata readback mismatch');
const privateDecks = await db.from('decks').select('id');
if (privateDecks.data?.length) throw Error('Anonymous deck data leak');
const jobs = await db.from('import_jobs').select('id');
if (!jobs.error) throw Error('Anonymous import jobs readable');
const denied = await db.from('cards').insert({ hearthstone_id: 'SHOULD_NOT_INSERT' });
if (!denied.error) throw Error('Anonymous metadata write accepted');
console.log(
  JSON.stringify({
    publicCardCount: count,
    sample: {
      name: sample.data.name,
      cost: sample.data.mana_cost,
      originalMetadataPreserved: sample.data.raw_data.id === 'CS2_029',
    },
    anonymousDecksVisible: privateDecks.data?.length ?? 0,
    anonymousImportJobsDenied: !!jobs.error,
    anonymousMetadataWritesDenied: !!denied.error,
  }),
);
