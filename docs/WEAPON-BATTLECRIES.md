# Weapon Battlecry batch — 2026-10-22

Twelve newly enabled names (13 collectible printings) bring coverage to **910 Battlecry names**, **981 Battlecry printings**, and **1,646 supported collection records**. The backlog is **985 names**. These cards are outside the frozen foundation list: that list remains **246/315 complete, 69 pending**.

| Card | Implemented behavior |
| --- | --- |
| Air Guitarist | Give your equipped weapon +1 Durability |
| Arathi Weaponsmith | Equip the exact 2/2 Battle Axe token |
| Blackscale Brute | With a weapon equipped, summon the 5/6 Firescale Berserker with Rush |
| Bloodsail Corsair | Remove 1 Durability from enemy weapons; destroy weapons reduced to zero |
| Bloodsail Raider | Gain Attack equal to your weapon's current Attack |
| Gluttonous Ooze | Destroy enemy weapons and gain Armor equal to their current Attack |
| Grimtotem Buzzkill | Randomly discard a weapon from hand to draw three; no weapon means no draw |
| Harrison Jones | Destroy enemy weapons and draw cards equal to their remaining Durability |
| Hoard Pillager | Randomly re-equip one of your destroyed weapons, with its printed stats |
| Luckydo Buccaneer | Gain +4/+4 if your equipped weapon currently has at least 3 Attack |
| Rummaging Kobold | Return a copy of a random destroyed weapon to your hand |
| Toxic Sewer Ooze | Remove 1 Durability from enemy weapons |

Enemy-weapon effects apply to every living opponent under Commander rules. Your weapon and eliminated players' weapons are untouched. Durability depletion, weapon replacement, and explicit destruction enter the owning player's weapon history. Discarding, burning, or interrupting a weapon does not. Interrupt normally returns the original card to hand; it does not create a destroyed-weapon record. Recovering a weapon does not consume its history or graveyard entry. Hand limits, burns, and fatigue still apply.

## Testing in the browser

Choose **Iron Reserve · Captain Greenskin**, then **New game**. Its guided opening is Fiery War Axe, Air Guitarist, Bloodsail Raider, Hoard Pillager, and Harrison Jones. The main deck includes all twelve new names; its commander remains separate from the 100 singleton cards.

Equip the Axe, extend its Durability, then play Raider to compare its Attack with the weapon. Break or replace the Axe and test Pillager/Kobold. Use Harrison against a weapon with different Attack and Durability to verify the draw reward; Gluttonous Ooze uses Attack instead. For immediate tests, pause bots in Testing and set mana to 10 using Scenario controls.

Exact Battle Axe and Firescale Berserker definitions come from the existing pinned card snapshot. No new card data was fetched, and no database or image storage changed. Compiler tests reject unknown extra clauses. Outcome tests cover all printings, absent weapons, live stat thresholds, multiple opponents, eliminated players, destruction history, interruption, discard, burns, fatigue, and full hands.

Verification: 3,016 game tests, 14 compiler tests, 10 grouping tests, and the production build passed. In the browser, Iron Reserve's guided hand equipped a 3/2 Fiery War Axe, Air Guitarist extended it to 3/3, and Bloodsail Raider entered as 5/3 with a visible +3 Attack modifier. No browser errors were reported.
