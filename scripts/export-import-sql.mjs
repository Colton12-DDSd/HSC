import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { supported } from '../src/effects.ts';
const rawText = await readFile('data/cards.collectible.original.json', 'utf8');
const source = JSON.parse(rawText),
  snapshot = JSON.parse(await readFile('public/data/cards.json', 'utf8'));
const report = JSON.parse(await readFile('public/data/import-report.json', 'utf8'));
const version = 'sha256:' + createHash('sha256').update(rawText).digest('hex');
if (report.source_version !== version) throw Error('Source fingerprint mismatch');
const originals = new Map(source.map((c) => [c.id, c]));
const columns = [
  'hearthstone_id',
  'dbf_id',
  'name',
  'card_type',
  'card_set',
  'rarity',
  'mana_cost',
  'attack',
  'health',
  'durability',
  'classes',
  'mechanics',
  'tribes',
  'rules_text',
  'image_url',
  'collectible',
  'wild_legal',
  'legality_verified_at',
  'legendary',
  'raw_data',
  'source_version',
  'updated_at',
];
const started = new Date().toISOString(),
  jobId = randomUUID();
const quote = (s) => "'" + s.replaceAll("'", "''") + "'";
await mkdir('data/import-batches', { recursive: true });
const files = [];
for (let i = 0; i < snapshot.length; i += 100) {
  const batch = snapshot.slice(i, i + 100);
  const rows = batch.map((local) => {
    const c = originals.get(local.id);
    if (!c) throw Error('Missing original ' + local.id);
    return {
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
      collectible: !!c.collectible,
      wild_legal: local.wildLegal === true,
      legality_verified_at: local.wildLegal === null ? null : report.format_version,
      legendary: c.rarity === 'LEGENDARY',
      raw_data: c,
      source_version: version,
      updated_at: started,
    };
  });
  const json = JSON.stringify(rows),
    delimiter = '$_hc_card_batch_$';
  if (json.includes(delimiter)) throw Error('SQL delimiter collision');
  const impl = batch
    .map((c) => `(${quote(c.id)},${quote(supported(c) ? 'implemented' : 'not_implemented')})`)
    .join(',');
  const query = `begin;
 with input as (select * from jsonb_populate_recordset(null::public.cards,${delimiter}${json}${delimiter}::jsonb)),existing as (select count(*) n from public.cards c join input i on c.hearthstone_id=i.hearthstone_id),upserted as (insert into public.cards(${columns.join(',')}) select ${columns.join(',')} from input on conflict(hearthstone_id) do update set ${columns
   .filter((k) => k !== 'hearthstone_id')
   .map((k) => `${k}=excluded.${k}`)
   .join(',')} returning id)
 update public.import_jobs set imported_count=imported_count+(select count(*) from upserted)-(select n from existing),updated_count=updated_count+(select n from existing) where id=${quote(jobId)}::uuid;
 insert into public.card_implementations(card_id,implementation_status,implementation_version,notes) select c.id,i.status,'alpha-0.1',case when i.status='implemented' then 'Supported by the local explicit effect registry; not independently marked tested.' else 'Metadata imported; gameplay effects are not implemented.' end from (values ${impl}) i(hs_id,status) join public.cards c on c.hearthstone_id=i.hs_id on conflict(card_id) do update set implementation_status=excluded.implementation_status,implementation_version=excluded.implementation_version,notes=excluded.notes where public.card_implementations.implementation_status not in ('tested','partial');
 commit;`;
  const filename = `data/import-batches/${String(files.length).padStart(3, '0')}.sql`;
  await writeFile(filename, query);
  files.push(filename);
}
await writeFile(
  'data/import-batches/manifest.json',
  JSON.stringify(
    {
      jobId,
      source: report.source,
      sourceVersion: version,
      started,
      count: snapshot.length,
      files,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify({ jobId, batches: files.length, cards: snapshot.length }));
