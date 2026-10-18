# Bulk Battlecry expansion — 2026-10-16

This batch adds **506 unique Battlecry minion names** beyond the frozen pre-expansion baseline of 36. Current coverage is **542 Battlecry names / 595 printings**, leaving **1,353 Battlecry names** unsupported in the imported snapshot. Across all effects, 1,022 of 6,470 collection records are supported. Battlecry/Deathrattle coverage together is 551 names / 606 printings.

The [506-name manifest](BULK-BATTLECRY-MANIFEST.md) lists each added minion, enabled IDs and complete printed text. Matching Core versions are printings, not extra names toward the 500-card goal. `data/battlecry-expansion-baseline.json` pins the comparison to commit cb9837a.

## Implementation

`scripts/compile-battlecries.py` matches complete card clauses and emits structured JSON scripts. Runtime code only executes the defined operations; it does not interpret display text. Unknown trailing clauses, upgrade text and unsupported mechanisms reject the entire source card. Existing hand-written scripts retain priority.

Shared families include numeric and repeated damage, missiles, healing, Armor, stats and keywords, hand/deck enchantments, discounts, filtered draws, Discover, card generation, summons, recruitment, discard, copying, shuffling, transformations, bouncing, destroying, Silence, Freeze, temporary immunity, Stealth and Reborn. Conditions can inspect board/hand/deck contents, duplicates, previous turns and public play history. Weapon support covers basic equipment, Attack, durability and supported buffs; additional weapon passives still require implementation.

Discover presents three readable choices and suspends continuation until the owning player chooses. The server adapter hides options and continuation from other seats and rejects their selection attempts. Default Discover uses the local snapshot and the actual hero class plus neutral cards, including valid dual-class matches. Other explicit filters override this default. Random generation uses the script's explicit pool. Pools are versioned for deterministic replay; a changed catalog rejects versioned scenarios instead of silently changing their outcome. Legacy unversioned scenarios remain accepted.

The Commander variant applies untargeted opponent effects to every living opponent. Opponent-count conditions aggregate living opponents. Targeted effects retain an explicit legal target. Hero healing remains uncapped; a full-health restoration raises a hero to at least the starting 40 without reducing existing overhealing.

Inspectors show live keyword grants and their source, Frozen/Silenced/Immune status, damage, lasting stat changes, and modified versus printed mana costs. Consumed shields and expired effects disappear from live mechanics. Starter decks preserve the previous 45 trigger names and sample new effect families; seeded rotation supplies other examples within the 100-card singleton limit.

## Scope and limits

A supported source Battlecry can generate or Discover a card whose separate ability is unsupported. Those cards retain their unsupported label and cannot silently execute missing effects. Supporting the source's generation does not implement every possible generated card. Complex auras, unknown upgrades, Overload, secret triggers, special hero powers and other unmatched mechanics remain blocked. This expansion is not a claim of full Hearthstone compatibility or verified Wild legality.

The compact catalog and generated scripts are local static assets. No database rows, images or Storage objects were added. The production JavaScript bundle is approximately 2.57 MB before gzip / 468 KB gzipped; Vite reports its chunk-size warning. Splitting the catalog is a later loading optimization.

## Sources and reproduction

Collectible metadata comes from the existing `public/data/cards.json` snapshot. Noncollectible token metadata is pinned in `data/battlecry-token-reference.json`, with source URL and source hash. The upstream [HearthstoneJSON schema](https://hearthstonejson.com/docs/cards.html) documents the complete card feed, including tokens. Generated metadata contains no image binaries.

Run `npm run compile:battlecries`, `npm run test:compiler`, `npm run audit:minions`, `npm test`, and `npm run build`. Compilation reproduces the four committed JSON files byte for byte; `data/battlecry-generated-hashes.json` records their SHA-256 hashes. The compiler itself updates the hashes. Coverage and the added-name threshold are independently checked against the frozen baseline.

Validation: **1,804 tests passed** across 13 files, **7 compiler regression tests passed**, and the production build passed. Per-printing smoke checks exercise scripts and trigger timing; independent cases check targeting, conditional prerequisites, choices, replay, token identity, stat persistence, damage/healing, keyword consumption, freeze expiry, silence, full hands, lethal sequences, transforms, weapon durability and the seven-minion limit. Smoke execution alone is not proof of every possible interaction.

Subsequent expansion: see the [2026-10-18 deck and rules guide](TEST-DECKS.md) for the current 648-name Battlecry count and six selectable test decks. Counts and validation above document the original 506-name expansion checkpoint.
