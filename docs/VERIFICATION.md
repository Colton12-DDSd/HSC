# Verification checkpoint

Verified on 2026-10-15 against organization HC, project HSC (`voxjyzgkvhkxxomdsmgq`). No operations targeted Designer Palms Oasis.

- Both versioned migrations are applied on HSC.
- Import completed: 6,470 metadata records, 6,470 unique Hearthstone IDs, zero failed records. Original JSON and source hashes are preserved.
- Compatibility records: 155 implemented in the local engine, 6,315 not implemented. None are falsely marked tested.
- App tables plus indexes: 8,986,624 bytes (about 8.6 MiB) at the recorded measurement. Zero image files and zero Storage objects. This excludes Supabase's own platform tables.
- Public REST checks: exact count 6,470; Fireball name, cost and original JSON retrieved correctly; anonymous metadata writes and import-job reads denied.
- Owner-isolation checks on live PostgreSQL: save/retrieve deck and contents as owner; deny another user's reads and RPC overwrite; verify unchanged original. All fixture accounts and decks were rolled back.
- RLS enabled on every app table. Security advisors returned zero findings after explicitly declaring backend-only import access.
- Performance advisors flagged newly created indexes as unused (informational on a fresh database). Keep useful search/ownership/FK indexes while real usage develops. [Advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).
- Local .env.local contains only HSC URL and publishable frontend key. It is ignored by Git. No backend key was downloaded or stored.
- Browser loaded the HSC collection and returned Fireball search results. Collection requests are shared across React development mounts to avoid duplicate downloads.
- 24 automated tests pass, including both migrations in embedded PostgreSQL, a full simulated match to victory and server seat/revision enforcement. Production build passes.

Pending: actual user email sign-in and UI cloud deck save/load; authoritative Wild format/temporary-ban verification; broader effects and online hosting/multiplayer. No sign-in email was sent during verification.

Repeatable public smoke test: `node scripts/verify-cloud.mjs`. Backend ownership test: `scripts/verify-owner-access.sql` (transactional and rolled back). Detailed recorded cloud report: `data/cloud-verification.json`.

All source is saved in C:\Users\colto\Desktop\Hearthstone Commander. GitHub/Vercel connection and hosting were discussed as next steps; no repository was pushed and no deployment was created.
