-- Metadata is public-read only, independent of project default grants.
revoke insert,update,delete,truncate,references,trigger on public.cards,public.card_implementations from anon,authenticated;
-- Document the backend access model explicitly; service_role already bypasses RLS.
create policy import_jobs_backend_only on public.import_jobs for all to service_role using(true) with check(true);
