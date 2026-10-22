# Five Battlecry groups — 2026-10-22

Ten new unique names, implemented together and verified with one combined suite after correcting failures. Current support: **930 Battlecry names, 1,001 collectible Battlecry printings, and 1,666 collection records**. **965 Battlecry names remain unsupported**. The frozen original foundation list remains at 250/315; these ten names extend shared families outside that list.

| Group | Cards | Behavior |
| --- | --- | --- |
| Tribal variety | Rock Master Voone; Power Slider | One-to-one tribe assignment handles dual types and ALL. Voone copies representatives from hand, preserving enchantments and respecting hand limits. Slider uses only your played minions; untyped minions and summons do not count. |
| Spells while held | Felscale Evoker; Primus of Power; Scorchfist Scholar | Own spell-play history starts when the card entered hand. Repeated schools count once for the two-school condition; Evoker counts three spells and recruits a differently named Demon. Copies/recruits do not repeat Battlecries. Scholar hits all living enemies under Commander rules. |
| Linked draws | Death Blossom Whomper; Hullbreaker | Whomper captures the exact drawn Deathrattle; Hullbreaker pays the actual drawn spell Cost on both Battlecry and Deathrattle. A burned draw still supplies its linked reward/penalty. No matching card means no reward/penalty. Silence removes copied Deathrattles. |
| Weapon discard | Furnacefire Colossus | Discards every hand weapon and gains their total Attack and Durability, including hand enchantments. Equipped weapons remain equipped. Discard does not create destroyed-weapon history. The pinned data sometimes stores Durability as Health with a zero durability field. |
| Deck copies and resurrection | Muckmorpher; Merithra | Muckmorpher copies a different named deck minion as a 4/4 without removing the deck card or repeating Battlecry. Merithra resurrects distinct friendly names costing at least eight, across duplicate printings, within available board space. Neither operation replays Battlecries. |

Primus of Power's pinned record lacks the Taunt mechanic printed in its text. A reviewed `cardMechanics` correction supplies Taunt for game objects and keyword filtering, including direct summons and copies; silence still removes it. The raw source snapshot remains intact.

## Testing in the app

Open [the local game](http://127.0.0.1:5173/), choose a Test deck and start a **new game** so its updated list is used. Themed tests mix classes intentionally.

- **Token Workshop:** Power Slider and Rock Master Voone, alongside several tribes.
- **Deck Laboratory:** Primus in the guided opening; Fireball, Frostbolt, Shadow Bolt, Felscale Evoker, Scorchfist Scholar and Muckmorpher in the list. For a fast held-spell test, pause bots and add Fireball/Frostbolt through Scenario controls while holding Primus, cast both, then play Primus.
- **Last Rites:** Whomper in the guided opening; Hullbreaker and Merithra in the list, with existing Deathrattle and resurrection fixtures.
- **Iron Reserve:** Furnacefire Colossus joins the weapon test cards. Add hand weapons through Scenario controls to compare exact stat gains.

## Validation

- 3,119 game tests across 21 files pass, including 28 focused tests for this batch and complete deterministic bot matches/replays for all nine premades.
- 16 compiler tests and 10 backlog grouping tests pass.
- Production TypeScript/Vite build passes. The existing large-bundle advisory remains.
- Coverage, frozen-foundation progress, generated registries and remaining-card grouping reports refreshed.
