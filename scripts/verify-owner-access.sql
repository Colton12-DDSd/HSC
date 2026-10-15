-- Disposable live smoke fixtures exist only within this transaction.
begin;
select set_config('hc.owner',gen_random_uuid()::text,true),set_config('hc.other',gen_random_uuid()::text,true),set_config('hc.deck',gen_random_uuid()::text,true);
insert into auth.users(id) values(current_setting('hc.owner')::uuid),(current_setting('hc.other')::uuid);
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('hc.owner'),true);
select public.save_deck(current_setting('hc.deck')::uuid,'Transactional smoke deck','HUNTER','EX1_543',array['CS2_182']);
do $$ begin
 if (select count(*) from public.decks where id=current_setting('hc.deck')::uuid)<>1 then raise exception 'Owner cannot retrieve deck';end if;
 if (select count(*) from public.deck_cards where deck_id=current_setting('hc.deck')::uuid)<>1 then raise exception 'Owner cannot retrieve contents';end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('hc.other'),true);
do $$ begin
 if exists(select 1 from public.decks where id=current_setting('hc.deck')::uuid) then raise exception 'Non-owner can read deck';end if;
 if exists(select 1 from public.deck_cards where deck_id=current_setting('hc.deck')::uuid) then raise exception 'Non-owner can read contents';end if;
 begin
  perform public.save_deck(current_setting('hc.deck')::uuid,'Unauthorized edit','HUNTER','EX1_543',array['CS2_182']);
  raise exception 'Non-owner RPC write was accepted';
 exception when insufficient_privilege then null;
 end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('hc.owner'),true);
do $$ begin
 if (select name from public.decks where id=current_setting('hc.deck')::uuid)<>'Transactional smoke deck' then raise exception 'Unauthorized edit changed deck';end if;
end $$;
rollback;
select 'Owner read/write and non-owner denial passed; all fixtures rolled back' as result;
