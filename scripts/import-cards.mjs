import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
try {
  process.loadEnvFile('.env.local');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const source = 'https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json';
const started = new Date().toISOString();
process.on('uncaughtException', async (error) => {
  await mkdir('public/data', { recursive: true });
  await writeFile(
    'public/data/import-failure.json',
    JSON.stringify(
      {
        source,
        started_at: started,
        completed_at: new Date().toISOString(),
        status: 'failed',
        failed_count: 1,
        error_log: [String(error)],
      },
      null,
      2,
    ),
  );
  console.error('Card import failed:', error.message);
  process.exitCode = 1;
});
const res = await fetch(source);
if (!res.ok) throw Error(`Source HTTP ${res.status}`);
const sourceText = await res.text();
const sourceVersion = 'sha256:' + createHash('sha256').update(sourceText).digest('hex');
const raw = JSON.parse(sourceText);
if (!Array.isArray(raw) || raw.length < 1000) throw Error('Invalid card dataset');
await mkdir('public/data', { recursive: true });
await mkdir('data', { recursive: true });
await writeFile('data/cards.collectible.original.json', sourceText);
let legal = null,
  formatVersion = null;
// Wild group membership comes from Blizzard, not a guessed set allowlist.
// Verify temporary bans against current client/official data before production use.
if (process.env.BLIZZARD_ACCESS_TOKEN) {
  legal = new Set();
  let page = 1,
    pages = 1;
  do {
    const r = await fetch(
      `https://us.api.blizzard.com/hearthstone/cards?locale=en_US&gameMode=constructed&set=wild&collectible=1&pageSize=500&page=${page}`,
      { headers: { Authorization: `Bearer ${process.env.BLIZZARD_ACCESS_TOKEN}` } },
    );
    if (!r.ok) throw Error(`Blizzard format HTTP ${r.status}`);
    const data = await r.json();
    if (!Array.isArray(data.cards)) throw Error('Invalid Blizzard response');
    data.cards.forEach((c) => legal.add(c.id));
    pages = data.pageCount;
    page++;
  } while (page <= pages);
  formatVersion = new Date().toISOString();
  await writeFile(
    'public/data/wild-format.json',
    JSON.stringify({
      source: 'Blizzard /hearthstone/cards?set=wild',
      source_version: sourceVersion,
      verified_at: formatVersion,
      dbf_ids: [...legal],
    }),
  );
} else {
  try {
    const f = JSON.parse(await readFile('public/data/wild-format.json', 'utf8'));
    if (f.source_version === sourceVersion && Date.now() - Date.parse(f.verified_at) < 86400000) {
      legal = new Set(f.dbf_ids);
      formatVersion = f.verified_at;
    }
  } catch {
    /* No eligibility claims without authoritative data. */
  }
}
const excluded = new Set([
  'VANILLA',
  'HERO_SKINS',
  'BATTLEGROUNDS',
  'LETTUCE',
  'PLACEHOLDER',
  'CORE_HIDDEN',
]);
const cards = raw.filter(
  (c) =>
    c.collectible &&
    !excluded.has(c.set) &&
    ['MINION', 'SPELL', 'WEAPON', 'HERO', 'LOCATION'].includes(c.type) &&
    !c.battlegroundsPremiumDbfId &&
    !c.mercenariesRole,
);
const job = {
  source,
  source_version: sourceVersion,
  started_at: started,
  completed_at: new Date().toISOString(),
  imported_count: cards.length,
  updated_count: 0,
  failed_count: 0,
  status: 'local_complete',
  error_log: [],
  format_verified: !!legal,
  format_version: formatVersion,
  total_source_count: raw.length,
};
await writeFile(
  'public/data/cards.json',
  JSON.stringify(cards.map((c) => ({ ...c, wildLegal: legal ? legal.has(c.dbfId) : null }))),
);
const dbUrl = process.env.SUPABASE_URL,
  key = process.env.SUPABASE_SECRET_KEY;
if (dbUrl && key) {
  const db = createClient(dbUrl, key, { auth: { persistSession: false } });
  const { data: j, error: je } = await db
    .from('import_jobs')
    .insert({ source, source_version: sourceVersion, started_at: started, status: 'running' })
    .select('id')
    .single();
  if (je) throw je;
  try {
    const existing = new Set();
    let from = 0;
    for (;;) {
      const { data, error } = await db
        .from('cards')
        .select('hearthstone_id')
        .range(from, from + 999);
      if (error) throw error;
      data.forEach((c) => existing.add(c.hearthstone_id));
      if (data.length < 1000) break;
      from += 1000;
    }
    job.imported_count = 0;
    for (let i = 0; i < cards.length; i += 100) {
      const batch = cards.slice(i, i + 100);
      const rows = batch.map((c) => ({
        hearthstone_id: c.id,
        dbf_id: c.dbfId,
        name: c.name,
        card_type: c.type,
        card_set: c.set,
        rarity: c.rarity,
        mana_cost: c.cost ?? 0,
        attack: c.attack ?? null,
        health: c.health ?? null,
        durability: c.durability ?? null,
        classes: c.classes ?? [c.cardClass],
        mechanics: c.mechanics ?? [],
        tribes: c.races ?? (c.race ? [c.race] : []),
        rules_text: c.text ?? '',
        image_url: `https://art.hearthstonejson.com/v1/render/latest/enUS/512x/${c.id}.png`,
        collectible: true,
        wild_legal: legal?.has(c.dbfId) ?? false,
        legality_verified_at: formatVersion,
        legendary: c.rarity === 'LEGENDARY',
        raw_data: c,
        source_version: sourceVersion,
        updated_at: started,
      }));
      const { error } = await db.from('cards').upsert(rows, { onConflict: 'hearthstone_id' });
      if (error) {
        job.failed_count += batch.length;
        job.error_log.push(error.message);
      } else {
        job.imported_count += batch.filter((c) => !existing.has(c.id)).length;
        job.updated_count += batch.filter((c) => existing.has(c.id)).length;
      }
    }
    const { count, error } = await db.from('cards').select('id', { head: true, count: 'exact' });
    if (error || !count) throw error ?? Error('Read-back failed');
    const { error: finish } = await db
      .from('import_jobs')
      .update({
        completed_at: new Date().toISOString(),
        imported_count: job.imported_count,
        updated_count: job.updated_count,
        failed_count: job.failed_count,
        status: job.failed_count ? 'partial' : 'complete',
        error_log: job.error_log,
      })
      .eq('id', j.id);
    if (finish) throw finish;
    job.database_count = count;
    job.status = job.failed_count ? 'partial' : 'complete';
  } catch (e) {
    await db
      .from('import_jobs')
      .update({ status: 'failed', completed_at: new Date().toISOString(), error_log: [String(e)] })
      .eq('id', j.id);
    throw e;
  }
}
await writeFile('public/data/import-report.json', JSON.stringify(job, null, 2));
console.log(JSON.stringify(job, null, 2));
