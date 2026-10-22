# Precision and linked Battlecries — 2026-10-22

Ten additional Battlecry names are enabled: **920 names / 991 collectible printings**, **1,656 supported collection records**, and **975 Battlecry names remaining**. The frozen foundation list is now **250/315 complete, 65 pending**.

| Card | Implemented behavior |
| --- | --- |
| Alexstrasza the Life-Binder | Heal a chosen friendly character for 8, or deal 8 to one chosen enemy |
| Undercooked Calamari | Destroy a chosen enemy minion whose current Attack is at most the source's current Attack |
| King Plush | Return weaker minions on living players' boards to their controllers' decks; reset their battlefield buffs and damage |
| The Lurker Below | Deal 3 to the chosen enemy minion; on a kill, continue to a random living neighbor on that board until a survivor or the edge stops it |
| Ball Hog | Deal 3 to a random tied lowest-Health enemy on Battlecry and Deathrattle, with its Lifesteal |
| Bloodsworn Mercenary | Copy a damaged friendly minion, preserving current stats, damage, and effects without repeating its Battlecry |
| Utgarde Grapplesniper | Each living player draws; a successfully drawn Dragon enters that player's board without its Battlecry |
| Countess Ashmore | Draw a Rush card, then a Lifesteal card, then a Deathrattle card if available |
| Multicaster | Draw once for each distinct spell school the caster has played this game |
| Aessina | After at least 20 friendly minion deaths, distribute 20 damage randomly among living enemies |

Chosen targets stay chosen: Alexstrasza does not spread targeted damage across heroes. Calamari previews incoming summon/play stat buffs on a cloned state, preserving real RNG and queued effects, and rechecks Attack when resolving. Neighbor damage stays on the selected board, stops at Divine Shield or another survivor, and settles Deathrattles after the chain. King Plush does not kill shuffled minions or trigger their Deathrattles; commanders use the normal default command-zone replacement rather than being duplicated into decks.

Ball Hog's copied Deathrattle uses the host's keywords: copying the Deathrattle alone does not grant Lifesteal. Lowest-Health selection includes enemy heroes and minions across living opponents; it can select an immune or Shielded character, whose protections still apply. Countess cannot draw the same deck entry twice. Grapplesniper leaves a drawn Dragon in hand when the board is full and does not summon burned cards. A drawn duplicate retains its own buffs, independently of older copies in hand.

## Browser tests

Choose **Ember & Ice → New game** for a guided hand of Elven Archer, Chillwind Yeti, Bloodsworn Mercenary, Undercooked Calamari, and Alexstrasza the Life-Binder. Play the Yeti, damage it with Archer, then copy the damaged Yeti with Mercenary. Other new damage and targeting examples are in that main deck.

**Dragon School** now opens with Utgarde Grapplesniper and Countess Ashmore alongside its Dragon prerequisites. **Token Workshop** includes Aessina for death-count payoff testing. Normal mana costs still apply; Testing's Scenario controls can set mana to 10.

Verification: 3,070 game tests, 15 compiler tests, 10 grouping tests, and the production build passed. Outcome checks include target validation, queued stat buffs, priority-time target growth, damage copies, Shield, Lifesteal, multiple opponents, commander replacement, hand/board limits, draw identity, and death/spell-school history. No database or image storage changed.

Browser verification: Ember & Ice → Yeti → Archer targeting that Yeti → Mercenary targeting the damaged Yeti. Both the original and copy displayed 4/5 Health and a one-damage badge, with no browser errors.
