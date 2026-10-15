# Enabled minion trigger audit

Audited 2026-10-15 against the repository's imported card snapshot and explicit Commander rules. Scope: **21 distinct enabled minions, 25 card records**. This is not an implementation audit of every unimplemented minion in the collection.

Every enabled record has its own execution test against independent expected outcomes. The audit also checks that every minion labeled Supported with Battlecry or Deathrattle is covered, so another supported trigger cannot silently bypass this list.

| Minion               | Audited printings     | Execution check                                                     |
| -------------------- | --------------------- | ------------------------------------------------------------------- |
| Elven Archer         | CS2_189, CORE_CS2_189 | Exactly 1 damage to the chosen character                            |
| Ironforge Rifleman   | CS2_141               | Exactly 1 damage to the chosen character                            |
| Stormpike Commando   | CS2_150               | Exactly 2 damage to the chosen character                            |
| Voodoo Doctor        | EX1_011, CORE_EX1_011 | Restore 2; living heroes can exceed 40                              |
| Earthen Ring Farseer | CS2_117               | Restore 3; living heroes can exceed 40                              |
| Novice Engineer      | EX1_015               | Draw exactly one card on play                                       |
| Gnomish Inventor     | CS2_147               | Draw exactly one card on play                                       |
| Shattered Sun Cleric | EX1_019               | +1 Attack, +1 current/max Health to an existing friendly minion     |
| Nightblade           | EX1_593               | Deal 3 to every living enemy hero                                   |
| Darkscale Healer     | DS1_055               | Heal friendly hero and minions, using their distinct healing limits |
| Razorfen Hunter      | CS2_196               | Summon one 1/1 Boar at the correct position                         |
| Dragonling Mechanic  | EX1_025               | Summon one 2/1 Mechanical Dragonling at the correct position        |
| Loot Hoarder         | EX1_096, CORE_EX1_096 | Draw exactly one after death                                        |
| Leper Gnome          | EX1_029               | Deal 2 to all living enemy heroes after death                       |
| Abomination          | EX1_097               | Deal 2 to ALL characters after death                                |
| Unstable Ghoul       | FP1_024               | Deal 1 to all minions after death                                   |
| Explosive Sheep      | GVG_076               | Deal 2 to all minions after death                                   |
| Harvest Golem        | EX1_556               | Replace its slot with a 2/1 Damaged Golem                           |
| Haunted Creeper      | FP1_002               | Replace its slot with two 1/1 Spectral Spiders, space permitting    |
| Nerubian Egg         | FP1_007               | Replace its slot with a 4/4 Nerubian                                |
| Sludge Belcher       | FP1_012, WON_128      | Replace its slot with a 1/2 Slime with Taunt                        |

All rows pass. Each Battlecry printing additionally has a direct-summon test proving that summoning does not activate its Battlecry. Each Deathrattle printing has a play test proving that merely playing the minion does not activate its Deathrattle. Existing tests retain interruption, full-board, missing-target, chained-death, fatigue, commander, and replay coverage.

## Lasting changes

Shattered Sun Cleric is the only currently enabled trigger minion that grants a lasting stat modifier. Its buff already changed the live stats; the audit work adds explicit source records and visible duration information.

- A gold badge on the buffed minion shows the total Attack/maximum-Health change compared with its printed stats.
- The inspector lists each source separately, including stacked Cleric buffs, and shows current battlefield stats separately from the card's printed stats.
- The buff persists across turns, damage, healing, and the source minion dying. It is not an aura.
- The buff ends when the affected minion leaves the battlefield. A fresh summon uses printed stats and has no inherited buff.
- Exported scenarios/replays include the source records. Older units without those records remain compatible; their changed live stats still display, with source details explicitly unavailable.

Tests cover stacked +2/+2, full-round persistence, damage/healing to the enlarged health cap, source death, a fresh summon after death, replay serialization, and older units without modifier metadata. Browser verification shows a Yeti at 5 Attack and 6/6 Health with a +1/+1 badge; its inspector names Shattered Sun Cleric and explains the duration.

## Game-wide effects remain unsupported

No currently enabled Battlecry or Deathrattle creates an ongoing game-wide rule, permanent deck-wide enhancement, cost-changing aura, or future-card counter. Those effects must be modeled separately before their cards can be enabled. They are not approximated by a one-time stat change.

For example, Aldor Attendant and Aldor Truthseeker require game-wide Libram cost tracking; Cleansing Cleric requires a persistent healing bonus. These remain unplayable and now show an explicit persistent-tracking explanation in the inspector. Auras also have a specific unsupported explanation. This classification is display-only; card text is never executed as a script.

Verification: **152 automated tests pass**, including **56 new audit/persistence cases**. Production build passes. No cloud database or image-storage writes are needed.
