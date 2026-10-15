create table public.cards (
 id uuid primary key default gen_random_uuid(), hearthstone_id text not null unique, dbf_id bigint not null unique,
 name text not null, card_type text not null, card_set text not null, rarity text, mana_cost int not null check(mana_cost>=0),
 attack int, health int, durability int, classes text[] not null, mechanics text[] not null default '{}', tribes text[] not null default '{}',
 rules_text text not null default '', image_url text not null, collectible boolean not null, wild_legal boolean not null default false,
 legendary boolean not null default false, raw_data jsonb not null, source_version text, legality_verified_at timestamptz, updated_at timestamptz not null default now()
);
create index cards_name_idx on public.cards(lower(name));
create index cards_filter_idx on public.cards(card_set,card_type,mana_cost);
create index cards_classes_idx on public.cards using gin(classes);
create table public.decks (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(length(name) between 1 and 100), class text not null,
 commander_card_id uuid references public.cards(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index decks_owner_idx on public.decks(user_id);
create index decks_commander_idx on public.decks(commander_card_id);
create table public.deck_cards (
 deck_id uuid not null references public.decks(id) on delete cascade, card_id uuid not null references public.cards(id),
 quantity int not null default 1 check(quantity=1), primary key(deck_id,card_id)
);
create index deck_cards_card_idx on public.deck_cards(card_id);
create table public.card_implementations (
 card_id uuid primary key references public.cards(id) on delete cascade,
 implementation_status text not null default 'not_implemented' check(implementation_status in ('not_implemented','partial','implemented','tested')),
 implementation_version text, notes text, tested_at timestamptz
);
create table public.import_jobs (
 id uuid primary key default gen_random_uuid(), source text not null, source_version text, started_at timestamptz not null default now(),
 completed_at timestamptz, imported_count int not null default 0, updated_count int not null default 0, failed_count int not null default 0,
 status text not null check(status in ('running','complete','partial','failed')), error_log jsonb not null default '[]'
);
alter table public.cards enable row level security;
alter table public.decks enable row level security;
alter table public.deck_cards enable row level security;
alter table public.card_implementations enable row level security;
alter table public.import_jobs enable row level security;
grant select on public.cards,public.card_implementations to anon,authenticated;
grant select,insert,update,delete on public.decks,public.deck_cards to authenticated;
revoke all on public.import_jobs from anon,authenticated;
create policy cards_public on public.cards for select to anon,authenticated using(true);
create policy implementations_public on public.card_implementations for select to anon,authenticated using(true);
create policy decks_owner on public.decks for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy deck_cards_owner on public.deck_cards for all to authenticated
 using(exists(select 1 from public.decks d where d.id=deck_id and d.user_id=(select auth.uid())))
 with check(exists(select 1 from public.decks d where d.id=deck_id and d.user_id=(select auth.uid())));
-- Atomic owner-scoped save; caller privileges and RLS remain in force.
create function public.save_deck(p_id uuid,p_name text,p_class text,p_commander text,p_cards text[]) returns uuid
language plpgsql security invoker set search_path='' as $$
declare result uuid; begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if cardinality(p_cards)>100 then raise exception 'Maximum 100 cards'; end if;
 insert into public.decks(id,user_id,name,class,commander_card_id)
 values(coalesce(p_id,gen_random_uuid()),auth.uid(),p_name,p_class,(select id from public.cards where hearthstone_id=p_commander))
 on conflict(id) do update set name=excluded.name,class=excluded.class,commander_card_id=excluded.commander_card_id,updated_at=now()
 returning id into result;
 delete from public.deck_cards where deck_id=result;
 insert into public.deck_cards(deck_id,card_id) select result,c.id from public.cards c where c.hearthstone_id=any(p_cards);
 if (select count(*) from public.deck_cards where deck_id=result)<>cardinality(p_cards) then raise exception 'Unknown or duplicate cards'; end if;
 return result;
end $$;
revoke all on function public.save_deck(uuid,text,text,text,text[]) from public;
grant execute on function public.save_deck(uuid,text,text,text,text[]) to authenticated;
