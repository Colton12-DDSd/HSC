# Fifty-card Battlecry batch — 2026-10-22

**50 distinct new Battlecry names** across three broad groups: 26 history, 18 cost/mana, and 6 copy/transform. Matching printings are supported without counting them as additional names. Total support is **980 Battlecry names / 1,052 collectible printings**, with **1,720 supported collection records**. **915 Battlecry names remain across 26 nonempty broad groups**. These additions do not finish any entire broad group; the original frozen foundation batch stays at 250/315.

## Shared rules

- Spell history distinguishes your own plays, your previous turn, this turn, and the time after a card entered hand. Different-school effects deduplicate schools; repeated spell effects count each play. Commander Sivara returns the first three qualifying spells and Hedra summons by each qualifying spell's Cost.
- Lifetime Armor gains and actual healing sum positive events. Armor loss does not erase prior gains. Attempted healing beyond a minion's maximum does not inflate healing history. Hero damage includes damage absorbed by Armor, matching the engine's damage accounting.
- Next-card cost rules retain a remaining cast count and optional end-of-turn expiry or exact set Cost. Nonmatching casts do not consume them. Matching casts consume one use when paid, including interrupted casts. The Active effects panel and action history expose these values.
- Mana refresh respects available empty crystals. Unlocking clears both locked and pending Overload; Thorim draws for the total unlocked. Immortal spends four remaining Mana only when available. Vanndar compares strictly against every deck minion.
- Reveal effects leave the revealed spell in the deck. Spire's missiles target enemy minions across living opponents and never enemy heroes. Generated summons respect seven slots and do not replay Battlecries.
- Hand copies preserve their hand enchantments. Barista adds ordinary card copies of other friendly Battlecry minions; Nobleman's golden treatment is cosmetic. Druid of the Fang uses its exact pinned 7/7 transformation token. Shapeless Constellation keeps the hand card and becomes an 8/8 copy without firing the copied Battlecry.

Random generation can still produce cards with separately unsupported abilities; the app labels those cards and blocks unsupported plays, as in earlier batches. No unknown source-card clause is ignored to enable a card.

## Test decks

**Spell Chronicle** uses Dragoncaller Alanna as commander. Its guided opening is Commander Sivara, Fireball, Frost Nova, Queensguard and Coral Keeper. Cast the two schools while Sivara is held, add/cast a third spell through Scenario controls, then play Sivara. The list also includes held-spell, Elemental previous-turn, healing and damage-history examples.

**Mana Workshop** uses Captain Galvangar as commander. Its guided opening is Clownfish, Murloc Raider, Murloc Tidehunter, Swiftscale Trickster and Fireball. Clownfish makes the next two Murlocs cost two less; the next matching cast decrements the displayed count. Trickster makes one spell free this turn. Additional cards test reveal, refresh, unlocking, strict cost comparisons, and hand copies.

Open [the local game](http://127.0.0.1:5173/), choose a Test deck and start a new game. Pause bots in Testing and set scenario mana to 10 for quick checks. These intentionally mixed-class test lists are supported singleton decks with 100 cards and separate unique legendary commanders.

## Validation

- **3,353 game tests pass across 22 files**, including 109 focused tests in the fifty-card test file, full games for all eleven premades, and identical deterministic replays.
- **17 compiler tests and 10 grouping tests pass.** Unknown riders remain rejected.
- Production TypeScript/Vite build passes; the existing large-bundle advisory remains.
- Coverage, generated registries, remaining groups, and foundation progress refreshed. Raw source snapshots are preserved; four exact tokens are added to the compact token reference.
- Browser: paused Mana Workshop, set mana to ten, placed Clownfish, verified both Murlocs at zero and the two-cast counter in Active effects, then verified one cast remained after playing Murloc Raider. No database/image-storage changes.

## Added names

### copy-transform

Astral Vigilant, Barista Lynchen, Cloud Serpent, Druid of the Fang, Nobleman, Shapeless Constellation.

### cost-mana

Clownfish, Dragoncaster, Eternal Sentinel, Ethereal Peddler, Future Emissary, Green-Thumb Gardener, Immortal, Lunar Trailblazer, Naga Sand Witch, Sea Shill, Spire Security, Spiteful Summoner, Swiftscale Trickster, Thorim, Stormlord, Twilight Medium, Vanndar Stormpike, Wizened Wildspeaker, Zaqali Flamemancer.

### history

Baleful Blazer, Captain Galvangar, Commander Sivara, Coral Keeper, Crystal Stag, Dragoncaller Alanna, Fearless Flamejuggler, Freebird, Hedra the Heretic, Inkmaster Solia, Krag'wa, the Frog, Mana Cyclone, Metamorfin, Nethersoul Buster, Nordrassil Druid, Ozruk, Priestess Valishj, Primordial Overseer, Queensguard, Razzle-Dazzler, Rimescale Siren, Shadowblade Slinger, Stone Sentinel, Unchained Gladiator, Xyrella, Zandalari Templar.

