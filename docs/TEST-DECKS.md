# Themed test decks — 2026-10-22

Open **Play** or **Testing**, choose **Test deck**, then press **New game**. Starter remains available with King Krush. Each themed list contains 100 supported cards, singleton by name, with its own separate supported legendary commander. These are mixed-class local tests, not verified Wild decks. Each has at least 50 cards costing four or less.

| Deck | Commander | Commander test |
| --- | --- | --- |
| Token Workshop | Onyxia | Fill remaining board slots with Whelps |
| Hungry Board | Natalie Seline | Destroy a minion and absorb its current Health |
| Deck Laboratory | Balinda Stonehearth | Draw two spells and swap their Costs with her stats |
| Ember & Ice | Varden Dawngrasp | Freeze enemies; damage already Frozen minions |
| Last Rites | N'Zoth, the Corruptor | Resurrect fallen Deathrattle minions |
| Iron Reserve | Captain Greenskin | Add weapon Attack and Durability |
| Life Garden | Wickerflame Burnbristle | Lifesteal, Taunt and Divine Shield |
| Dragon School | Frizz Kindleroost | Discount Dragons still in the deck |
| Curiosity Cabinet | Brightwing | Generate a random legendary |

Commander names appear in the selector, and **Deck & test goals** includes a commander-specific test. Commanders are excluded from their own 100-card main decks. All four seats use different commanders in themed matches. Their costs, command tax and destination choices use the normal commander rules.

| Deck | Theme | Repeatable test |
| --- | --- | --- |
| **Token Workshop — new** | Token placement, board cap, Shields | Alleycat/Desert Hare, Giggling Inventor → Blood Knight, Argent Braggart |
| **Hungry Board — new** | Sacrifices, current stats, Deathrattle ordering | Alleycat → Sanguine Reveler/Ratcatcher; place Void Terror between neighbors |
| **Deck Laboratory — new** | Dredge, temporary Costs, linked draws | Excavation Specialist → Novice Engineer; Sharp-Eyed Lookout; Deepwater Evoker |
| Ember & Ice | Damage, Freeze, Silence | Targeted Archer, Freeze/cleanse, one target versus every opponent; now includes Varden |
| Last Rites | Deathrattles, tokens, resurrection | Copy Loot Hoarder with Mok'Nathal Lion, trigger or kill the Lion |
| Iron Reserve | Armor and weapon interactions | Axe → Air Guitarist → Raider; break/recover weapons; Harrison draws by Durability |
| Life Garden | Healing, Lifesteal, buffs | Cleansing Cleric, Health above 40, current versus maximum Health |
| Dragon School | Dragon prerequisites, placement | Hold Twilight Whelp, conditional Battlecries, adjacent effects |
| Curiosity Cabinet | Discover, hand choices, deck order | Copy Chaos Strike with Grave Defiler; arrange the next draw with Sightless Watcher |

**Guided opening** gives you five named opening cards, with matching four-card openings for opponents; the rest is shuffled. Normal mana costs still apply. For quick tests, open Testing, pause bots, and use Scenario controls → mana → 10 → Apply value. **Deck & test goals** shows all 100 cards and three specific goals. Disable Guided opening for shuffled games. Opponents use different themes rather than mirroring the selected list.

Cards shown in hand have their **current payable mana cost** over the artwork. Temporary discounts expire at the end of the turn without removing earlier permanent discounts. **Active effects** shows future-play buffs and remaining counts, expanded hand limits, Overload and lasting effects. Inspectors distinguish temporary keyword grants from grants lasting until the minion leaves play. Hero Divine Shield and permanent minion Immunity have visible labels.

The [weapon batch](WEAPON-BATTLECRIES.md) adds twelve examples to Iron Reserve. Its guided hand is Fiery War Axe, Air Guitarist, Bloodsail Raider, Hoard Pillager, and Harrison Jones.

The [precision batch](PRECISION-BATTLECRIES.md) adds guided targeting/copy tests to Ember & Ice, linked Dragon draws to Dragon School, and Aessina to Token Workshop.

## Coverage and rules

Current support: **920 Battlecry names / 991 collection printings** and **1,656 supported collection records**. The latest pass implements **250 of the original 315 foundation candidates** and 22 additional names. **65 of that batch remain blocked**; the [complete report](FOUNDATION-BATTLECRIES.md) lists each one and its next dependency. Across the whole collection, **975 Battlecry names remain unsupported**. No approximate effect substitutes for unrecognized rules.

New shared families include consuming live stats, linked draws, Dredge rewards, temporary costs, Menagerie selection, future-play buffs, deck ordering, burn/draw replacement, expanded hand limits, hero Divine Shield and permanent Immunity. Boom Bot Deathrattles and Ice Shard/Water Elemental freezing are implemented. Generated cards can have separately unsupported abilities, labeled effects pending; those cards cannot be played. Named pools and special summoned passives require exact definitions.

Commander adaptations: untargeted effects involving the enemy or both/each players apply to all living opponents/players as appropriate. Twin Tyrant selects two distinct minions across all enemy boards. Joust must beat every opponent, with ties losing. Combined-hero Health means the total across living heroes. Taunt protects only its controller. Hero healing can exceed 40. Revival and direct summons do not trigger Battlecries, and consumed minions settle Deathrattles after the consuming transaction.

## Verification

All nine decks are checked for supported cards, singleton names, distinct themes, curve quotas, reproducible openings and full bot matches with identical replays. Independent outcome tests cover draws, cost expiry, Dredge movement, consumption, Shields, Freeze, queued buffs, hand limits and special tokens. The compiler rejects unknown riders and misleading token descriptions. The 315-card progress report is checked against every original printing in the live registry.

Browser verification traced Deck Laboratory → guided hand → Scenario mana → Excavation Specialist → bottom-three choice → Novice Engineer → selected card at its discounted cost. The board, hand and action history agreed, with no browser errors. The database and image storage were not changed. Run `npm test`, `npm run test:compiler`, `npm run test:battlecry-groups`, `npm run build`, `npm run audit:foundation` and `npm run group:battlecries` to reproduce the checks and reports.
