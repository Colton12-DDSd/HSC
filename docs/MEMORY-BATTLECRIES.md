# Memory Battlecries — 2026-10-22

**50 new distinct Battlecry names**, bringing support to **1,080 names / 1,157 collectible Battlecry printings** and **1,826 supported collection records**. **815 Battlecry names remain**. The frozen foundation list remains at 250/315. The exact fifty names are recorded in [the batch manifest](../data/memory-battlecry-batch.json), against baseline commit `cffe415`.

## Shared behavior

- Stored Deathrattles capture the selected card or unit identity. Cube, Kraken, Slime, Merchant, Gral, Kaahrj, Moat Lurker and Teron retain their specific rewards. Voodoo Doll tracks a unit ID across control changes. Silence clears captured grants; battlefield copies retain them, while ordinary card copies start fresh.
- Destroy-and-return resolves deaths before summoning a fresh full-Health minion. Summoned copies do not replay Battlecry. Board limits, eliminated owners and original-controller destinations are respected. Teron preserves captured order and adds +1/+1.
- Weapon effects use current Attack/Durability for rewards, preserve hand/deck enchantments when equipping, and distinguish stolen weapons from destroyed weapons. Replacement records the caster's old weapon in destruction history.
- Audio Amplifier raises Mana and hand limits to eleven without immediately filling Mana. Ysiel sets spell Costs for the current turn, including later arrivals. Temporary Discover discounts expire; original-Cost resets preserve stat modifiers.
- History records summons and stats at play time. SI:7 rewards, Pogo-Hopper, Jepetto, Watch Post counts, Frost/spell-school counts and Undead deaths since the previous own turn use explicit events. Untargeted enemy rewards follow the existing all-living-opponents Commander adaptation.
- Discover pools follow the chosen minion's tribes, live source Attack, or remaining regular Mana. Missing eligible targets/pools fizzle. Generated cards with separately unsupported abilities remain pending; Watch Post passive abilities are not added by this batch.

## Test decks

**Stored Secrets — Teron Gorefiend** opens with Loot Hoarder, Carnivorous Cube, Expired Merchant, Fireball and Voodoo Doll. Compare capture, discard and target-memory rewards. Iron Reserve gains weapon examples; Mana Workshop gains resource and cost examples; Spell Chronicle gains history and Discover examples.

Choose the preset in Play or Testing, then start a new game at http://127.0.0.1:5173/. Pause bots and set scenario Mana to ten for quick checks. There are thirteen themed presets plus Starter.

## Verification

- **3,818 game tests pass across 24 files**, including independent outcomes for the fifty names, serialized memory, silence/copy interaction, full boards, original owners, conditional negatives and deterministic replays.
- All thirteen themed decks complete bot matches and reproduce their results through replay.
- **19 compiler tests and 10 grouping tests pass**; production build passes with the existing bundle-size advisory.
- Browser: Loot Hoarder -> Cube -> captured name visible in preview -> Sanguine Reveler destroys Cube -> two fresh 2/1 Hoarders alongside the buffed 3/3 Reveler. No browser errors.
- Coverage and backlog reports regenerated. No database or image-storage changes.
