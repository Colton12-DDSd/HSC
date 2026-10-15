import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
const migration = readFileSync('supabase/migrations/20261015174605_initial_schema.sql', 'utf8');
describe('Supabase schema integration (embedded PostgreSQL)', () => {
  it('migrates, upserts metadata and isolates private decks using RLS', async () => {
    const pg = new PGlite();
    await pg.exec(
      `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth,public to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`,
    );
    await pg.exec(migration);
    const a = '00000000-0000-0000-0000-000000000001',
      b = '00000000-0000-0000-0000-000000000002';
    await pg.query('insert into auth.users(id) values ($1),($2)', [a, b]);
    const raw = JSON.stringify({ id: 'TEST', name: 'Metadata fixture' });
    const q = `insert into public.cards(hearthstone_id,dbf_id,name,card_type,card_set,mana_cost,classes,image_url,collectible,raw_data) values ('TEST',1,'Metadata fixture','MINION','LEGACY',1,ARRAY['NEUTRAL'],'https://example.com/TEST.png',true,$1) on conflict(hearthstone_id) do update set name=excluded.name returning id`;
    await pg.query(q, [raw]);
    await pg.query(q, [raw]);
    expect(
      (await pg.query<{ n: number }>('select count(*)::int n from public.cards')).rows[0].n,
    ).toBe(1);
    await pg.exec(`set role anon`);
    expect((await pg.query('select raw_data from public.cards')).rows).toHaveLength(1);
    await expect(pg.query('select * from public.import_jobs')).rejects.toThrow();
    await pg.exec(
      `reset role; set role authenticated; select set_config('request.jwt.claim.sub','${a}',false)`,
    );
    const saved = await pg.query<{ id: string }>(
      `select public.save_deck(null,'Private deck','MAGE','TEST',ARRAY['TEST']) id`,
    );
    const id = saved.rows[0].id;
    expect((await pg.query('select * from public.decks')).rows).toHaveLength(1);
    await pg.exec(`select set_config('request.jwt.claim.sub','${b}',false)`);
    expect((await pg.query('select * from public.decks')).rows).toHaveLength(0);
    expect((await pg.query('select * from public.deck_cards')).rows).toHaveLength(0);
    await expect(
      pg.query(`insert into public.deck_cards(deck_id,card_id) select $1,id from public.cards`, [
        id,
      ]),
    ).rejects.toThrow();
    await expect(
      pg.query(`select public.save_deck($1,'Stolen','MAGE','TEST',ARRAY['TEST'])`, [id]),
    ).rejects.toThrow();
    await pg.exec(`select set_config('request.jwt.claim.sub','${a}',false)`);
    await expect(
      pg.query(`select public.save_deck($1,'Duplicate','MAGE','TEST',ARRAY['TEST','TEST'])`, [id]),
    ).rejects.toThrow();
    expect((await pg.query<{ name: string }>('select name from public.decks')).rows[0].name).toBe(
      'Private deck',
    );
    await pg.close();
  }, 20000);
});
