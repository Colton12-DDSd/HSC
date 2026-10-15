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

Current totals: **184 supported collection records**, including **32 Battlecry/Deathrattle printings across 26 minion names**. No database rows or image files were added. At the batch-2 checkpoint, auras, temporary effects, Libram cost tracking, and other unimplemented card scripts remained blocked; batch 3 below adds temporary Attack effects.

## Batch 3: temporary Attack buffs and reductions

| Minion            | Supported printings   | Battlecry                                       |
| ----------------- | --------------------- | ----------------------------------------------- |
| Abusive Sergeant  | CS2_188, CORE_CS2_188 | Give a chosen minion +2 Attack this turn        |
| Dark Iron Dwarf   | EX1_046               | Give a chosen minion +2 Attack this turn        |
| Shrinkmeister     | GVG_011, WON_314      | Give a chosen minion -3 Attack this turn        |
| Ruststeed Raider  | BT_720                | Gain +4 Attack this turn; retain Taunt and Rush |
| Militia Commander | GIL_803               | Gain +3 Attack this turn; retain Rush           |

Temporary Attack modifiers have an explicit casting-turn expiry. Ending that turn removes them from every board before the next player starts, including effects applied to an enemy minion. They survive source death but cannot grant extra attacks, reset damage, remove keywords, or erase permanent buffs. Effective Attack is clamped at zero while the signed underlying modifiers remain tracked, so stacked reductions recover correctly on expiry. Bots direct negative changes toward enemies.

The battlefield badge includes an hourglass for temporary effects; the inspector's Active effects panel lists each source and its own duration. Temporary modifiers remain visible even when their net stat change is zero. Targeted buffs use the existing explicit minion-target prompt; the self-buff cards resolve without a target. As with the existing alpha targeting flow, chosen targets come from the pre-play board; choosing the newly played source as its own target is not yet supported.

Checkpoint: **215 tests** and production build pass, including **16 dedicated temporary-effect tests** and per-printing audit cases. Browser verification: Ruststeed Raider entered at 5 Attack/8 Health (printed 1/8 plus +4), displayed the hourglass and end-of-turn duration, then returned to 1 Attack/8 Health with Taunt intact on End turn. History recorded the expiry; no browser console errors were observed.

Current totals: **191 supported collection records**, including **39 Battlecry/Deathrattle printings across 31 minion names**. This batch supports temporary Attack changes; temporary Health changes, hero-Attack Battlecries, ongoing auras, and other unimplemented scripts remain blocked.

## Starter test coverage

The mixed-class starter sandbox now includes all 31 supported Battlecry/Deathrattle minion names plus examples of all seven supported combat keywords in each 100-card singleton deck. Class-specific implementations are available in regular starter testing rather than only through debug card insertion. Remaining filler is Hunter/neutral; custom user decks remain unchanged. Automated coverage checks every enabled trigger name and every keyword, and simulates the mixed-class match to completion. Start a new starter game to use this deck composition.
