# Enabled minion trigger audit

Audited 2026-10-16 against the pinned imported snapshot and Commander rules. Current coverage: **551 enabled trigger minion names / 606 printings**, including **542 Battlecry names / 595 printings**. The new expansion adds **506 Battlecry names**, measured against the frozen pre-expansion baseline.

The bulk suite checks every generated Battlecry printing for play execution, direct-summon timing, and positive conditional branches, plus independent expected outcomes for shared mechanics and deterministic replay. Whole-text compiler regression tests reject unmatched trailing clauses. These checks do not claim exhaustive correctness for every interaction or generated card's separate abilities. See [implementation and limits](BULK-BATTLECRIES.md) and [added-card inventory](BULK-BATTLECRY-MANIFEST.md).

The table below is the independently specified **legacy 45-name / 55-printing** audit retained alongside the bulk suite.

| Minion                | Audited printings     | Execution check                                                     |
| --------------------- | --------------------- | ------------------------------------------------------------------- |
| Abusive Sergeant      | CS2_188, CORE_CS2_188 | +2 Attack to a chosen minion until end of turn                      |
| Dark Iron Dwarf       | EX1_046               | +2 Attack to a chosen minion until end of turn                      |
| Shrinkmeister         | GVG_011, WON_314      | -3 Attack to a chosen minion until end of turn                      |
| Ruststeed Raider      | BT_720                | Self +4 Attack this turn, preserving Taunt/Rush                     |
| Militia Commander     | GIL_803               | Self +3 Attack this turn, preserving Rush                           |
| Cleansing Cleric      | CATA_216              | Stacking +2 healing for the rest of the game                        |
| The Mistcaller        | AT_054                | +1/+1 to existing hand and deck minions                             |
| Grimestreet Outfitter | CFM_753, CORE_CFM_753 | +1/+1 to existing hand minions                                      |
| Grimestreet Smuggler  | CFM_853               | +1/+1 to one seeded random hand minion                              |
| Don Han'Cho           | CFM_685, WON_137      | +5/+5 to one seeded random hand minion                              |
| Elven Archer          | CS2_189, CORE_CS2_189 | Exactly 1 damage to the chosen character                            |
| Ironforge Rifleman    | CS2_141               | Exactly 1 damage to the chosen character                            |
| Stormpike Commando    | CS2_150               | Exactly 2 damage to the chosen character                            |
| Voodoo Doctor         | EX1_011, CORE_EX1_011 | Restore 2; living heroes can exceed 40                              |
| Earthen Ring Farseer  | CS2_117               | Restore 3; living heroes can exceed 40                              |
| Novice Engineer       | EX1_015               | Draw exactly one card on play                                       |
| Gnomish Inventor      | CS2_147               | Draw exactly one card on play                                       |
| Shattered Sun Cleric  | EX1_019               | +1 Attack, +1 current/max Health to an existing friendly minion     |
| Nightblade            | EX1_593               | Deal 3 to every living enemy hero                                   |
| Darkscale Healer      | DS1_055               | Heal friendly hero and minions, using their distinct healing limits |
| Razorfen Hunter       | CS2_196               | Summon one 1/1 Boar at the correct position                         |
| Dragonling Mechanic   | EX1_025               | Summon one 2/1 Mechanical Dragonling at the correct position        |
| Loot Hoarder          | EX1_096, CORE_EX1_096 | Draw exactly one after death                                        |
| Leper Gnome           | EX1_029               | Deal 2 to all living enemy heroes after death                       |
| Abomination           | EX1_097               | Deal 2 to ALL characters after death                                |
| Unstable Ghoul        | FP1_024               | Deal 1 to all minions after death                                   |
| Explosive Sheep       | GVG_076               | Deal 2 to all minions after death                                   |
| Harvest Golem         | EX1_556               | Replace its slot with a 2/1 Damaged Golem                           |
| Haunted Creeper       | FP1_002               | Replace its slot with two 1/1 Spectral Spiders, space permitting    |
| Nerubian Egg          | FP1_007               | Replace its slot with a 4/4 Nerubian                                |
| Sludge Belcher        | FP1_012, WON_128      | Replace its slot with a 1/2 Slime with Taunt                        |

All rows pass. Each Battlecry printing additionally has a direct-summon test proving that summoning does not activate its Battlecry. Each Deathrattle printing has a play test proving that merely playing the minion does not activate its Deathrattle. Existing tests retain interruption, full-board, missing-target, chained-death, fatigue, commander, and replay coverage.

## Lasting changes

Shattered Sun Cleric grants a lasting battlefield stat modifier. The next tested batch adds four hand/deck buff minions whose card enchantments carry into play, plus Cleansing Cleric's game-wide healing bonus. All have explicit source records and visible duration information. See [batch checkpoints](MINION-BATCHES.md).

- A gold badge on the buffed minion shows the total Attack/maximum-Health change compared with its printed stats.
- The inspector lists each source separately, including stacked Cleric buffs, and shows current battlefield stats separately from the card's printed stats.
- The buff persists across turns, damage, healing, and the source minion dying. It is not an aura.
- The buff ends when the affected minion leaves the battlefield. A fresh summon uses printed stats and has no inherited buff.
- Exported scenarios/replays include the source records. Older units without those records remain compatible; their changed live stats still display, with source details explicitly unavailable.

Tests cover stacked +2/+2, full-round persistence, damage/healing to the enlarged health cap, source death, a fresh summon after death, replay serialization, and older units without modifier metadata. Browser verification shows a Yeti at 5 Attack and 6/6 Health with a +1/+1 badge; its inspector names Shattered Sun Cleric and explains the duration.

## Remaining unsupported effects

Cleansing Cleric now creates a supported game-wide healing bonus, listed in the player's effects panel. It remains active after the source dies. Hand/deck buffs are one-time enhancements to existing cards and do not automatically affect future cards.

Other ongoing rules still require their own implementation. For example, Aldor Attendant and Aldor Truthseeker need game-wide Libram cost tracking; they remain unplayable and show a persistent-tracking explanation in the inspector. Unimplemented auras also have a specific explanation. This classification is display-only; card text is never executed as a script.

Verification: **266 automated tests pass**, including the original audit, persistent/temporary-effect coverage, and 50 new Armor/self-damage cases. Production build passes. No cloud database or image-storage writes are needed.

Temporary effects have their own duration records and hourglass indicators. See [batch 3](MINION-BATCHES.md#batch-3-temporary-attack-buffs-and-reductions) for expiry, stacking, target restrictions, and browser verification. General temporary Health changes and auras are not claimed as supported.

## Armor / self-damage audit extension

The 14 names (16 printings) in [batch 4](MINION-BATCHES.md#batch-4-armor-self-damage-and-ordered-effects) have independent per-printing expectations in `src/armor-effects.test.ts`. All have play-versus-summon checks. Both-trigger minions also have isolated Deathrattle and same-instance play-then-death checks, plus sequence order, shields, fatigue, burns, elimination, interruption, and replay coverage. The aggregate audit guard now requires all 55 enabled printings and 45 names.

Run `npm run audit:minions` to regenerate [the full minion coverage inventory](../data/minion-coverage.json) from the collection snapshot and actual runtime registry. It includes every Battlecry/Deathrattle minion printing with printed text and separate trigger/support flags. Current inventory: 2,521 trigger records across 2,381 names; 55 records supported and 2,466 remaining. This inventory is local and adds no cloud rows or images.
