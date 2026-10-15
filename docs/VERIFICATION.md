# Verification checkpoint

Verified on 2026-10-15 against organization HC, project HSC (`voxjyzgkvhkxxomdsmgq`). No operations targeted Designer Palms Oasis.

- Both versioned migrations are applied on HSC.
- Import completed: 6,470 metadata records, 6,470 unique Hearthstone IDs, zero failed records. Original JSON and source hashes are preserved.
- Compatibility records at the original database import: 155 implemented, 6,315 not implemented. The local registry now supports 177 records after the trigger batch; stored import statuses remain the historical snapshot until the next explicit metadata sync. None are falsely marked tested.
- App tables plus indexes: 8,986,624 bytes (about 8.6 MiB) at the recorded measurement. Zero image files and zero Storage objects. This excludes Supabase's own platform tables.
- Public REST checks: exact count 6,470; Fireball name, cost and original JSON retrieved correctly; anonymous metadata writes and import-job reads denied.
- Owner-isolation checks on live PostgreSQL: save/retrieve deck and contents as owner; deny another user's reads and RPC overwrite; verify unchanged original. All fixture accounts and decks were rolled back.
- RLS enabled on every app table. Security advisors returned zero findings after explicitly declaring backend-only import access.
- Performance advisors flagged newly created indexes as unused (informational on a fresh database). Keep useful search/ownership/FK indexes while real usage develops. [Advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).
- Local .env.local contains only HSC URL and publishable frontend key. It is ignored by Git. No backend key was downloaded or stored.
- Browser loaded the HSC collection and returned Fireball search results. Collection requests are shared across React development mounts to avoid duplicate downloads.
- 82 automated tests pass, including 35 new Battlecry/Deathrattle cases and minion readiness coverage, alongside including exact combat targets, independent Taunt protection, simultaneous damage, persistent injuries, healing, Divine Shield, positional minion casts, placement after clockwise passes, canceled placement on interruption, commander insertion, invalid positions, replay, both migrations in embedded PostgreSQL, a full simulated match to victory and server seat/revision enforcement. Production build passes.
- Browser combat verification: selected Argent Horserider, rejected Thorne's Taunt-protected hero, and attacked Ember's second Chillwind Yeti. Only that Yeti changed to 3/5 health with a −2 badge; the other Yeti stayed 5/5. After advancing a full round, the injury remained, and Ember's unprotected hero was attacked to 38 health despite having non-Taunt minions.
- Browser placement verification: clicked Chillwind Yeti into the middle of two Bloodfen Raptors; dragged Upgradeable Framebot between the first Raptor and Yeti; dragged Argent Horserider to the end. Dropping outside the board left mana, hand and minion order unchanged. Measured minion-group center equals battlefield center. All four boards use the same centered layout.

Pending: actual user email sign-in and UI cloud deck save/load; authoritative Wild format/temporary-ban verification; broader effects and online hosting/multiplayer. No sign-in email was sent during verification.

Repeatable public smoke test: `node scripts/verify-cloud.mjs`. Backend ownership test: `scripts/verify-owner-access.sql` (transactional and rolled back). Detailed recorded cloud report: `data/cloud-verification.json`.

All source is saved in C:\Users\colto\Desktop\Hearthstone Commander and connected to https://github.com/Colton12-DDSd/HSC. SSH authentication is scoped to this repository; the private key and .env.local are outside version control. No Vercel deployment has been created.

Trigger checkpoint: targeted Battlecries highlight legal characters in blue and allow clicking a friendly target without selecting an attacker. Browser play of Shattered Sun Cleric buffed only the chosen Yeti from 4/5 to 5/6 and spent 3 mana. Fireball killed an opposing Haunted Creeper, which spawned exactly two 1/1 Spectral Spiders; both token images loaded and the history recorded the death, Deathrattle and each summon. No browser console errors were observed. See [TRIGGERS.md](TRIGGERS.md) for exact variant rules. No database or Storage writes were needed for this feature.
