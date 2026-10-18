# Themed test decks — 2026-10-18

Open **Play** or **Testing**, choose **Test deck**, then press **New game**. The existing Starter remains available. Changing the selector does not replace an active match until New game is pressed. Collection drafts and saved decks are unchanged.

Each premade has 100 supported cards, singleton by name, with King Krush as a separate test commander. These are explicitly mixed-class local sandbox decks, not claims of legal Wild decks. Each hero uses an implemented class power. The other three seats receive themed opponents rather than copies of the selected deck. All lists have a curve that includes at least 50 cards costing four or less.

| Deck              | Theme                              | Repeatable test                                                              |
| ----------------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| Ember & Ice       | Damage, Freeze, Silence            | Choose an Archer target, Freeze a defender, remove Freeze with Silence       |
| Last Rites        | Deathrattles, tokens, resurrection | Copy Loot Hoarder with Mok'Nathal Lion, then trigger or kill the Lion        |
| Iron Reserve      | Armor, self-damage, weapons        | Crystallizer's ordered damage/Armor, weapon durability, enemy weapon removal |
| Life Garden       | Healing, Lifesteal, buffs          | Cleansing Cleric bonuses, Health above 40, damage versus current/max Health  |
| Dragon School     | Dragon prerequisites, placement    | Hold Twilight Whelp, compare conditional Battlecries and adjacent effects    |
| Curiosity Cabinet | Discover, hand choices, deck order | Grave Defiler copies Chaos Strike; Sightless Watcher arranges the next draw  |

**Guided opening** puts the five listed cards first for you and the appropriate four opening cards in each opponent's hand. The remaining cards are shuffled. Turn one still starts at one mana; normal costs and rules apply. Turn this off to shuffle the whole deck. In Testing, Pause bots and Scenario controls can speed up a particular combination. **Deck & test goals** displays the three goals, exact opening and full 100-card list.

Lists use authored core cards, theme affinity and fixed mana-curve quotas. Alternate printings are deduplicated by name. Opening prerequisites are mandatory and fail validation if unavailable; unsupported optional examples are excluded. Every card actually selected is checked with the live support registry. Changing implementation coverage may change filler cards; exported scenarios retain their actual deck contents.

## Battlecry progress and rules

This expansion adds **106 more unique Battlecry minion names**, raising coverage from 542 to **648 names / 705 printings**. Total supported collection records: **1,337**. Combined Battlecry/Deathrattle coverage: **791 names / 858 printings**. See the [106-name manifest](BATTLECRY-WAVE2-MANIFEST.md).

Added families include Joust, Overload, next-card discounts, weapon/Armor removal, copied/granted/triggered Deathrattles, resurrection, stat/cost replacement on draws, hand choices, deck ordering, filtered control changes and selected lasting effects. Inspectors display copied Deathrattle sources; each seat's **Active effects** panel shows discounts, lasting summon/turn effects and locked mana. Printed and current stats continue to use the existing sword/drop display.

Resurrection uses death events, excluding discarded or burned cards. It summons without Battlecries, respects the seven-minion cap and restores printed stats unless the effect specifies otherwise. Copied Deathrattles do not trigger immediately, survive the donor's death, and disappear when the recipient is Silenced or leaves play. A stolen commander's death returns it to the original owner's command zone. Overload locks crystals on the next own turn; discounts are consumed only by matching casts. End-of-turn self-copy effects require their source still in play and unsilenced; game-wide summon changes survive the source leaving play.

Commander variants: Joust reveals one minion in each living player's deck and requires a strict win over every opponent, including ties as losses. Untargeted enemy weapon/Armor effects affect all living opponents. Enemy-deck Discover resolves a separate choice for each living opponent, and any draw rider moves that opponent's chosen original card. Generated card abilities remain independently labeled and may still be unsupported.

**The full Battlecry list is not finished.** The [remaining backlog](BATTLECRY-REMAINING.md) contains **1,247 unique names**. Additional whole-clause patterns can cover some; many require new systems such as auras, Secrets, spell repetition, custom cards, expansion resources and delayed triggers. Unknown clauses remain blocked. Full text, including separate Deathrattles and Overload, must compile before a source is enabled. UI-only variants after `@` are normalized without dropping unrecognized gameplay clauses.

## Verification

The production build passes with the existing large-bundle warning (approximately 2.65 MB JavaScript / 485 KB gzip). No database, image-storage or cloud schema changes were made. Ten compiler regressions pass, including new restriction/rider checks and rejection of unknown suffixes. Engine suites cover each generated printing plus independent family outcomes. All six premades complete full bot matches and replay identically.

Browser checks verified the 100-card preview, selected-deck hand, copied Deathrattle inspector and a filtered Fel-spell hand choice that added exactly one copy. The complete board and hand fit at 1280×720, and no console errors were recorded. Run `npm test`, `npm run test:compiler`, `npm run build` and `npm run audit:battlecries` to reproduce the checks and inventories. Generated JSON reproduces byte for byte from the pinned metadata.
