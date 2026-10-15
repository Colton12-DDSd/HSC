# Hearthstone Commander — Alpha 0.1

A playable local, four-seat fan prototype built with React, TypeScript, Vite and an independent deterministic rules engine. Noncommercial. Hearthstone card names, text and artwork belong to Blizzard Entertainment.

## Run

Requires Node 22.14 or newer.

```powershell
npm ci
npm run dev
```

Open the Local URL printed by Vite (normally http://127.0.0.1:5173). Open **Play table → Start a match**. Three scripted opponents act automatically. Select an opponent hero/minion as the target, click a hand card to cast, or select your minion and click **Attack selected**. Right-click a friendly minion to target it with a heal. End turn banks unused mana in reserve. Use **Testing lab** to pause bots and arrange scenarios.

```powershell
npm test
npm run build
npm run import:cards
```

Dependencies are pinned, and package-lock.json is tracked. No images are stored in PostgreSQL or Supabase Storage. Image URLs resolve directly to HearthstoneJSON. Set VITE_CARD_ASSET_BASE to an authorized local or remote artwork directory to replace them.

## Current implementation

- Full source download: 8,328 collectible records; the original source is archived at data/cards.collectible.original.json.
- 6,470 candidate deck-card/version records in the bundled searchable collection. Original IDs, descriptions, class arrays, sets, mechanics and tribes remain intact.
- Search, six filters, cost filter, pagination, artwork, inspection, commander selection, singleton-by-name checks across versions, class restrictions, JSON import/export, browser-local drafts, mana curve and distributions.
- Supabase paginated collection reads, email-link auth and transactional owner-scoped draft save/load are implemented behind configuration.
- Local four-player turns, 40 health, seven slots, fatigue, regular/reserve mana, clockwise interrupt/pass windows and configurable timeouts, commander zones, successful-cast tax and reductions, combat, elimination and victory.
- The starter decks contain 100 distinct supported cards, excluding King Krush in their command zones. They use Hunter and neutral cards. The starter sandbox bypasses external Wild validation to allow local rules testing.
- Supported minion mechanics: Taunt, Divine Shield, Charge, Rush, Lifesteal, Windfury and Poisonous, where those are the card's complete mechanics. Explicit effects: Fireball, Arcane Intellect, Flamestrike, Elven Archer and Earthen Ring Farseer (including matching Core variants). Other effects are blocked. No card text is executed as instructions.
- Hero powers currently implemented: Mage, Priest, Hunter, Warlock and Warrior. Other classes remain draftable but their powers require implementation. No fabricated default effect substitutes for an unsupported card.
- Testing lab: any candidate card into hand/board, health/mana/reserve/tax/reductions, turn advance, elimination, destination replacement, reset, priority decisions, detailed logs and deterministic JSON replay.
- Independent engine and a server-side match adapter with authenticated seat binding, revision checks and hidden-hand/deck projections. This adapter is not deployed. There are no online rooms, networking, reconnection or server timers yet.

## Important: Wild verification is pending

The downloaded collectible list is **not** presented as a verified Wild pool. Without authoritative format data, wildLegal is null in the local snapshot and false/unverified in the database. The collection explicitly says “Wild candidates.” Drafts can be edited and saved, but unverified decks cannot enter the deck-based match flow.

The importer can query Blizzard's authenticated game-data card endpoint using BLIZZARD_ACCESS_TOKEN and intersect DBF IDs with the collection. This path has not been exercised in this workspace: credentials are not available. Validate live API pagination, current bans and alternate-version handling before treating it as production-grade legality. Do not assume set membership alone handles temporary bans. A cached format manifest must be reviewed against its verification date and source version.

## Dedicated Supabase setup: HC / HSC

Target organization: **HC**. Target project: **HSC**. The connector in this session still exposes only Designer Palms. No cloud project was created and no remote migration/import ran. No changes were made to the Designer Palms Oasis database.

1. Refresh/reconnect the Supabase plugin and confirm HC is visible. Use a dedicated project in HC; review the quoted cost before project creation. Do not link this workspace to Oasis.
2. Apply supabase/migrations/20261015174605_initial_schema.sql to HSC using its SQL editor or link the Supabase CLI to HSC and run its migration workflow. Inspect `npx supabase --help` for the installed CLI's commands before linking/pushing.
3. Copy .env.example to .env.local. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to HSC's public connection values. Restart Vite.
4. Configure Supabase Auth's site/redirect URL for the development origin. Use the app's connection settings to request an email sign-in link.
5. For backend imports only, set SUPABASE_URL and SUPABASE_SECRET_KEY in your shell. Never put the secret under a VITE_ prefix, paste it into chat, or commit it. Run `npm run import:cards`. The importer can also load .env.local if supplied there; the file is ignored by Git.
6. Check import_jobs, card counts, selected card metadata, anonymous public reads, signed-in owner-only deck reads/writes, and Supabase security advisors on the live HSC project. These live checks are pending; embedded PostgreSQL checks are included in npm test.

Tables: cards, decks, deck_cards, card_implementations and import_jobs. RLS is enabled on all tables. Public roles can read card metadata/implementation metadata. Deck rows and their contents require ownership. Import jobs and metadata writes are backend-only. The save_deck RPC is SECURITY INVOKER and saves draft contents atomically under RLS. Draft saves allow incomplete decks; match readiness is a separate validation step.

## Small database footprint

The card snapshot is about 2.85 MB of raw JSON before indexes, PostgreSQL overhead and duplicated searchable columns; measure actual database size after import. Store one raw JSONB per source card plus searchable metadata, no images, no original XML or animation assets, and no per-game snapshots in PostgreSQL. Imports use batches of 100 and upsert by hearthstone_id. Repeated imports update records rather than duplicate them. Source hashes and job counts record provenance. Keep complete raw source archives on disk, outside public/.

## Code map

- src/cards.ts — metadata types, deck JSON validation and class/singleton legality checks.
- src/collection.ts, src/storage.ts — database/asset boundaries and local snapshot fallback.
- src/effects.ts — explicit effect registry and supported mechanic allowlist. Four implementation states are modeled; implemented means supported in this local engine, not complete collection compatibility.
- src/engine.ts — serializable state/actions, deterministic transitions and bots. No rendering, network, database access, clock reads or ambient randomness.
- src/server/match.ts — future authoritative host boundary. Never host an online match by trusting browser state or client-chosen seat IDs.
- src/App.tsx, src/style.css — deck builder, tabletop and developer controls.
- scripts/import-cards.mjs — repeatable source/format fetch and backend-only upsert.
- src/*.test.ts — engine rules, end-to-end simulated match, PostgreSQL RLS/RPC integration and server-seat tests.

## Remaining milestones

1. Provision HSC after refreshing the plugin; run and verify the cloud import and Auth/deck flow.
2. Finish authoritative Wild format and ban verification, then enable validated user-deck play.
3. Expand the effect registry and implementation-status synchronization with the database; implement deathrattles, triggered event queues, transformations, token generation and remaining class powers. The current engine does not claim these work.
4. Add proper interactive commander replacement prompts for all future removal/transform/bounce effects. Death currently defaults to the command zone and offers a destination choice through the lab before the commander is recast.
5. Deploy the authoritative host and implement rooms, reconnect, hidden state, server-owned timers and persistence.

See docs/VERIFICATION.md and docs/SIMULATOR-RESEARCH.md.
