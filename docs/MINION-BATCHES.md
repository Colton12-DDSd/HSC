# Additional minion batches

## Batch 1: persistent healing

Cleansing Cleric (CATA_216) grants a stacking +2 bonus to its controller's healing effects for the rest of the game. Source records remain after the Cleric dies and through turns/replay. The bonus applies once per healing recipient, including healing Battlecries, Priest power, and attacking/defending Lifesteal. Divine Shield absorption cannot create a zero-damage Lifesteal heal. Heroes remain uncapped; minions keep their maximum-health cap. Player panels list the total and individual sources.

Checkpoint: 161 tests and the production build passed before work began on batch 2. Browser play of Cleric followed by Darkscale Healer healed the hero from 40 to 44, and the expandable effects panel showed the source and duration.

## Batch 2: hand and deck buffs

| Minion                | Supported printings   | Effect                                                    |
| --------------------- | --------------------- | --------------------------------------------------------- |
| The Mistcaller        | AT_054                | Give each current minion card in your hand and deck +1/+1 |
| Grimestreet Outfitter | CFM_753, CORE_CFM_753 | Give every current hand minion +1/+1                      |
| Grimestreet Smuggler  | CFM_853               | Give one seeded random hand minion +1/+1                  |
| Don Han'Cho           | CFM_685, WON_137      | Give one seeded random hand minion +5/+5                  |

These are one-time enhancements to the physical cards already present, not permanent rules for future cards. Spells, existing board minions, opponents' cards, and command-zone commanders are unaffected. A commander already in hand can receive a hand buff. Buffs stack with source records, survive drawing and interrupted play, and carry into the summoned minion exactly once. The printed metadata stays unchanged. The buffs clear when that minion leaves play, or when an enhanced card burns into the graveyard. Empty random pools do nothing without consuming randomness. Random choices replay identically.

Hand cards display enhanced Attack/Health badges. Their inspectors show enhanced and printed stats separately and name each buff source. Once played, they use the existing battlefield buff badges and duration display.

Checkpoint: **185 tests** and production build pass after the second batch. Tests include exact per-printing behavior, spells and ownership exclusions, source death, stacking, alias-safe physical card copies, drawing, playing without double application, death/reset, hand-limit burn, interruption, empty pools, and deterministic random selection. Browser verification: Mistcaller enhanced Spider Tank from printed 3/4 to 4/5 in hand; its preview named the source; normal play produced a 4/5 minion with exactly one +1/+1 source record and no console errors.

Current totals: **184 supported collection records**, including **32 Battlecry/Deathrattle printings across 26 minion names**. No database rows or image files were added. Further auras, temporary effects, Libram cost tracking, and other unimplemented card scripts remain blocked.
