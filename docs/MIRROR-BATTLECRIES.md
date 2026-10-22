# Mirror Battlecries — 2026-10-22

**50 new distinct Battlecry names** across four existing broad groups: 19 choices, 17 copies/transformations, 10 Deathrattle/history effects, and 4 cost/mana effects. Total support is **1,030 Battlecry names / 1,106 collectible printings**, with **1,774 supported collection records**. **865 Battlecry names remain in 26 nonempty broad groups**. The original frozen foundation list stays at 250/315.

## Shared behavior

- Zone transformations have separate source and result filters. Alara'shi and Lady Prestor preserve enchanted stats and current Costs. Energy Shaper selects a spell with printed Cost three higher while retaining the old payable Cost. Other replacements use their stated class, rarity, type and reduction rules. A missing eligible result leaves the original intact.
- Live swaps exchange current stats. Health swaps set both current and maximum Health; they do not create healing history. Silence removes stat enchantments while preserving the amount of damage, including lethal damage when a Health buff disappears.
- Targeted hand copies are ordinary printed copies unless a stat/Cost override is specified. Celestial Projectionist's copy is Temporary. Shadowcaster, Splintergraft and Gurubashi Hypemon carry their stated stats and Cost. Golden treatment is cosmetic.
- Battlefield copies preserve live damage, keywords and granted Deathrattles, receive a fresh unit ID and do not replay Battlecry. Ini Stormcoil grants Rush, Windfury and Divine Shield to the new Mech only. The Nameless One copies first, then silences the original.
- Sathrovarr makes ordinary hand/deck copies and a live battlefield copy; hand or board limits do not stop the remaining destinations. Northshire Farmer shuffles exactly three 3/3 Beast copies.
- Exact faction Discover pools are separate from generic class pools. Kabal, Grimy Goons and Jade Lotus tags are faction metadata, not extra triggered mechanics. Flowrider moves a chosen deck spell only when Overloaded; Hellraiser buffs itself when the deck is empty.
- Invincible applies its buff and Taunt to the same randomly chosen Undead. Lord Barov's Deathrattle respects Divine Shield. Reborn happens after the Deathrattle. Mailbox Dancer, Loan Shark and Rattling Rascal extend untargeted enemy rewards to all living opponents under Commander rules.
- Forbidden Ancient spends remaining regular Mana without using reserve. Cabaret Headliner discounts one spell per present school. King Phaoris and Undefeated Champion respect seven-slot boards and never replay summoned Battlecries.

Randomly generated cards can have separately unsupported abilities and remain labeled pending, as in prior batches. No unknown source-card rider is ignored to enable a printing. Raw source snapshots are preserved; exact transformation/Skeleton/Coin token references are pinned in the compact catalog.

## Test decks

**Mirror Menagerie — Sathrovarr** opens with River Crocolisk, Northshire Farmer, Shadowcaster, Faceless Manipulator and Zola the Gorgon. Play the Crocolisk, then compare its original stats against a Shadowcaster hand copy (1/1, Cost 1), a Farmer deck copy (3/3), and a Faceless live copy. The full list includes the new swaps, zone replacements, targeted copies and Discover pools.

**Last Rites** adds Anka, Crimson Commander, Invincible, Lord Barov, Scarlet Purifier, Snakebite, Wicked Skeleton, Rattling Rascal, Mailbox Dancer and Loan Shark.

Start a new game at [the local app](http://127.0.0.1:5173/) after selecting the preset. For quick tests, pause bots in Testing and set scenario Mana to ten. These are intentionally mixed-class, supported singleton test decks, with 100 cards and a separate unique legendary commander each.

## Verification

- **3,584 game tests pass across 23 files**, including independent outcomes for all fifty names, damage/silence, Temporary expiry, full hands/boards, Reborn, and deterministic replacements.
- Every one of the twelve premades completes a bot match and reproduces the exact result from its action replay.
- 18 compiler tests and 10 grouping tests pass. Production TypeScript/Vite build passes; the pre-existing bundle-size advisory remains.
- Browser: Mirror Menagerie, paused bots, ten Mana, River Crocolisk -> Shadowcaster -> Crocolisk target. The board retained the original 2/3 and the hand showed a Cost-1 1/1 copy, with no browser errors.
- Coverage, generated registries and backlog groups regenerated. No database or image-storage changes.

## Added names

### choices

Celestial Projectionist, Dragon Breeder, Faceless Manipulator, Flowrider, Grimestreet Informant, Gurubashi Hypemon, Hellraiser, Ini Stormcoil, Kabal Courier, Kaja'mite Creation, Lotus Agents, Menagerie Warden, Mirage Caller, Northshire Farmer, Sathrovarr, Shadowcaster, Splintergraft, The Nameless One, Zola the Gorgon.

### copy-transform

Alara'shi, Arch-Villain Rafaam, Cera'thine Fleetrunner, Darkspeaker, Energy Shaper, Envoy of the Glade, Furbolg Mossbinder, Lady Prestor, Lilian Voss, Origami Crane, Origami Dragon, Origami Frog, Prince Liam, Tinkmaster Overspark, Twilight Acolyte, Vol'jin, Wyrmrest Purifier.

### cost-mana

Cabaret Headliner, Forbidden Ancient, King Phaoris, Undefeated Champion.

### death-memory

Anka, the Buried, Crimson Commander, Invincible, Loan Shark, Lord Barov, Mailbox Dancer, Rattling Rascal, Scarlet Purifier, Snakebite, Wicked Skeleton.

