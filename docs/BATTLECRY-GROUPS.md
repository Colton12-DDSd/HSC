# Remaining Battlecries grouped for implementation

Audit date: **2026-10-22**. Reviewed the complete pinned backlog: **815 unique minion names** across **854 printings**. **1080 names are already supported** and excluded here. Matching Core printings do not count as extra names.

Every remaining name has **one primary group**, so the primary counts add up to 815. Extra dependencies, keywords and named families can overlap: their counts must not be added together. Group membership is a planning judgment based on the complete printed card, including passives, separate Deathrattles and attached keywords. It does not enable a card or prove that a whole group shares one identical script.

## Implementation lanes

| Lane | Names |
| --- | --- |
| Existing foundations: pattern, value, filter or sequencing extensions | 65 |
| Extend a shared engine family | 246 |
| Add or complete a game subsystem | 466 |
| Card-specific design or manual rules review | 38 |

“Existing foundations” means a candidate for extending current scripts, selectors, values or sequencing. It is **not** a promise that the card needs only a number change. Each card still needs full-clause review and tests. Shared-family work extends an existing engine family; system work adds a missing rules system; bespoke work needs a card-specific design decision.

## Primary groups — no double counting

| Group | Names | Implementation lane |
| --- | --- | --- |
| [Damage, healing, Armor and board stats](#damage-stats) | 17 | Existing foundations: pattern, value, filter or sequencing extensions |
| [Draw, discard and hand/deck movement](#draw-zones) | 21 | Existing foundations: pattern, value, filter or sequencing extensions |
| [Summons, recruits and token definitions](#summon-tokens) | 14 | Existing foundations: pattern, value, filter or sequencing extensions |
| [Generated cards and named card pools](#generate-pools) | 13 | Existing foundations: pattern, value, filter or sequencing extensions |
| [Card costs, mana and ordinary discounts](#cost-mana) | 15 | Extend a shared engine family |
| [Discover and other player choices](#choices) | 55 | Extend a shared engine family |
| [Copies, transformations, swaps and control](#copy-transform) | 23 | Extend a shared engine family |
| [Deathrattles, resurrection and remembered victims](#death-memory) | 56 | Extend a shared engine family |
| [Weapons, forced attacks and combat restrictions](#weapons-combat) | 22 | Extend a shared engine family |
| [History, thresholds and scaling conditions](#history) | 23 | Extend a shared engine family |
| [Delayed effects and start/end-of-turn triggers](#scheduling) | 52 | Extend a shared engine family |
| [Auras, listeners and ongoing board effects](#ongoing) | 35 | Add or complete a game subsystem |
| [Lasting rules and game-wide replacements](#lasting) | 14 | Add or complete a game subsystem |
| [Spell Damage and spell-only modifiers](#spell-power) | 24 | Add or complete a game subsystem |
| [Automatic casting and replaying spells/Battlecries](#spell-casting) | 49 | Add or complete a game subsystem |
| [Hero powers, upgrades and replacements](#hero-powers) | 37 | Add or complete a game subsystem |
| [Secrets, traps and Counter effects](#secrets-counters) | 26 | Add or complete a game subsystem |
| [Cast-when-drawn cards and deck hazards](#cast-when-drawn) | 30 | Add or complete a game subsystem |
| [Corpses and Death Knight rune resources](#corpses-runes) | 19 | Add or complete a game subsystem |
| [Health/Armor costs and alternate payment rules](#alternate-payments) | 10 | Add or complete a game subsystem |
| [Named progression families](#named-progression) | 31 | Add or complete a game subsystem |
| [Quests, Excavation and expansion objectives](#quests-upgrades) | 35 | Add or complete a game subsystem |
| [Extra keywords and attached mechanics](#keyword-packages) | 121 | Add or complete a game subsystem |
| [Dormant, locations and board-state systems](#dormant-board) | 35 | Add or complete a game subsystem |
| [Custom cards, construction and minigames](#custom-build) | 29 | Card-specific design or manual rules review |
| [Turns, starting decks and match-wide changes](#match-rules) | 9 | Card-specific design or manual rules review |

## Recommended implementation order

1. Take the existing-foundation groups first: board stats/damage, zone operations, exact tokens, and generated pools. Audit the complete generated token ability before claiming source-card completion.
2. Extend costs, choices, history queries, transformations and linked Deathrattles. Use the themed test decks to reproduce each family, with independent expected outcomes.
3. Add shared foundational systems: Spell Damage, auras/listeners, hero powers, spell replay and cast-when-drawn processing. These unlock cards across several primary groups.
4. Implement expansion families in explicit batches, such as Tradeable, Rewind, Infuse, Corpses, Jade Golems, C'Thun and Excavation; then handle custom constructors and match-changing cards individually.

This order is a dependency plan, not a claim that all unimplemented cards are equally easy or unique. Many combine multiple groups, and the last missing clause still blocks the entire printing.

## Examples of why these groups help

| Card | What can be shared / what still blocks it |
| --- | --- |
| Coldlight Oracle | Extend the existing draw operation to the full player group. |
| Air Guitarist | Extend the existing weapon modifier to the printed Durability wording. |
| Lord Godfrey | The engine already has repeat-until-no-deaths behavior; it does not need the entire general Battlecry-replay system. |
| Siamat | All four offered keywords already exist; the missing piece is choosing two distinct grants. |
| Big Game Hunter | Its destroy selector looks straightforward, but the same printings also have Tradeable. |
| Azure Drake | Drawing is already supported; the attached Spell Damage must work too. |
| Kazakus | A custom spell builder needs an explicit choice tree and generated effects. |

## Cross-cutting dependencies — overlapping counts

These counts answer “how many remaining names mention or require this kind of behavior?” They include the primary group and secondary dependencies, so one card can appear in several rows.

| Dependency | Names touching it |
| --- | --- |
| Damage, healing, Armor and board stats | 353 |
| Draw, discard and hand/deck movement | 277 |
| Card costs, mana and ordinary discounts | 157 |
| Discover and other player choices | 143 |
| Extra keywords and attached mechanics | 143 |
| History, thresholds and scaling conditions | 131 |
| Summons, recruits and token definitions | 114 |
| Copies, transformations, swaps and control | 103 |
| Deathrattles, resurrection and remembered victims | 88 |
| Generated cards and named card pools | 87 |
| Delayed effects and start/end-of-turn triggers | 72 |
| Automatic casting and replaying spells/Battlecries | 61 |
| Auras, listeners and ongoing board effects | 51 |
| Quests, Excavation and expansion objectives | 44 |
| Hero powers, upgrades and replacements | 39 |
| Dormant, locations and board-state systems | 38 |
| Named progression families | 37 |
| Weapons, forced attacks and combat restrictions | 36 |
| Cast-when-drawn cards and deck hazards | 30 |
| Custom cards, construction and minigames | 29 |
| Secrets, traps and Counter effects | 27 |
| Spell Damage and spell-only modifiers | 24 |
| Lasting rules and game-wide replacements | 23 |
| Corpses and Death Knight rune resources | 21 |
| Health/Armor costs and alternate payment rules | 11 |
| Turns, starting decks and match-wide changes | 9 |

## Attached keyword families — overlapping counts

A Battlecry that looks simple can still require an attached keyword. For example, Big Game Hunter needs Tradeable, and Azure Drake needs Spell Damage. A card that only generates or filters for a keyword is marked as a **reference**, not automatically treated as having the keyword itself. Generated-card abilities still need separate coverage. Conditional references may still require that system's history or state.

| Keyword | Attached/action | Reference only | Total names | Cards |
| --- | --- | --- | --- | --- |
| Adapt / bonus effects | 24 | 3 | 27 | Ace Wayfinder; Brutish Endmaw; Crackling Razormaw; Creature of Madness; Darkrider; Dragon Turtle; Drone Deconstructor; Elder Longneck; Fossilized Kaleidosaur; Frostburn Matriarch; Gentle Megasaur; Lightfused Stegodon; Nightmare Lord Xavius; Ornery Direhorn; Painted Canvasaur; Pterrordax Hatchling; Raptor Herald; Ravasaur Runt; Ravenous Pterrordax; Shadowflame Stalker; The One-Amalgam Band; Thunder Lizard; Time-Lost Raptor; Treacherous Tormentor; Verdant Longneck; Violet Punisher; Volcanosaur |
| Choose One | 0 | 7 | 7 | Ancient Augur; Coilfang Constrictor; Disciple of Eonar; Jerry Rig Carpenter; Pathmaker; Raid Negotiator; Spawn of C'Thun |
| Colossal | 4 | 2 | 6 | Al'Akir, Lord of Storms; Ambassador Faelin; Gigafin; Hydralodon; Nellie, the Great Thresher; Primordial Lord |
| Combo | 6 | 1 | 7 | Aqir Goliath; Broodchamber Tunneler; Costume Merchant; Neferset Weaponsmith; Opu the Unseen; Private Eye; The Scarab Lord |
| Corrupt | 6 | 2 | 8 | Carnival Clown; Circus Medic; Dark Inquisitor Xanesh; Firework Elemental; Luckysoul Hoarder; Pit Master; Tickatus; Y'Shaarj, the Defiler |
| Echo | 3 | 0 | 3 | Face Collector; Squashling; Time-Lost Raptor |
| Elusive | 5 | 2 | 7 | Ancient Pterrordax; Epoch Stalker; Living Paradox; Mystic Runesaber; Shining Sentinel; Spellward Jeweler; Toyrantus |
| Fabled | 7 | 0 | 7 | Garona Halforcen; Gelbin of Tomorrow; Medivh the Hallowed; Muradin, High King; Ranger General Sylvanas; Talanji of the Graves; Timethief Rafaam |
| Finale | 0 | 2 | 2 | Ghost Writer; Tony, King of Piracy |
| Forge | 6 | 1 | 7 | Disciple of Sargeras; Eulogizer; Ignis, the Eternal Flame; Mechagnome Guide; Muscle-o-Tron; Watcher of the Sun; XB-488 Disposalbot |
| Frenzy | 1 | 1 | 2 | Overlord Saurfang; Whirling Combatant |
| Honorable Kill | 2 | 0 | 2 | Hollow Abomination; Knight-Captain |
| Infuse | 9 | 0 | 9 | Artificer Xy'mox; Buffet Biggun; Famished Fool; Huntsman Altimor; Imp King Rafaam; Insatiable Devourer; Mischievous Imp; Sire Denathrius; Sylvanas, the Accused |
| Inspire | 3 | 0 | 3 | Confessor Paletress; Spawn of Shadows; Thunder Bluff Valiant |
| Kindred | 0 | 12 | 12 | Chillspine Stegodon; Dread Raptor; Hot Spring Glider; Primalfin Challenger; Raptor Herald; Ravenous Devilsaur; Razidir; Scalehide Kodo; Slagclaw; Torga; Volcanic Thrasher; Windpeak Wyrm |
| Magnetic | 0 | 1 | 1 | Drone Deconstructor |
| Manathirst | 4 | 0 | 4 | Astalor Bloodsworn; Coroner; Knight of the Dead; Sunfury Clergy |
| Miniaturize / Gigantify | 11 | 0 | 11 | Murloc Growfin; Nostalgic Clown; Sand Art Elemental; Sandbox Scoundrel; Shudderblock; Sleet Skater; Sweetened Snowflurry; Tabletop Roleplayer; Toy Captain Tarim; Toysnatching Geist; Window Shopper |
| Outcast | 2 | 0 | 2 | Ci'Cigi; Kurtrus Ashfallen |
| Overheal | 2 | 0 | 2 | Heartbreaker Hedanis; Injured Hauler |
| Prepare | 7 | 0 | 7 | Commissary Crook; Defias Smuggler; Hijacked Securitybot; Rampaging Hound; Sawbones; Sewer Swimmer; Tricksy Improviser |
| Quickdraw | 5 | 1 | 6 | Azerite Chain Gang; Benevolent Banker; Drilly the Kid; Farm Hand; Flint Firearm; Horseshoe Slinger |
| Rewind | 8 | 1 | 9 | Aeon Wizard; Bygone Doomspeaker; Conflux Crasher; Druid of Regrowth; Mister Clocksworth; Morchie; Portal Vanguard; Raptor Herald; Stadium Announcer |
| Spellburst | 5 | 0 | 5 | Bolide Behemoth; Hostile Invader; Interstellar Researcher; Keywarden Ivory; Pen Flinger |
| Starship | 3 | 9 | 12 | Crystal Welder; Exarch Othaar; Ghost; Missile Pod; Scrounging Shipwright; SCV; Siege Tank; Star Vulpera; The Exodar; Thor; Ultra-Capacitor; Yamato Cannon |
| Titan | 2 | 0 | 2 | Aggramar, the Avenger; Sargeras, the Destroyer |
| Tourist | 6 | 0 | 6 | Buttons; Chillin' Vol'jin; Maestra, Mask Merchant; Mistah Vistah; Portalmancer Skyla; Turbulus |
| Tradeable | 13 | 0 | 13 | Big Game Hunter; Crystal Tender; Demolition Renovator; Royal Librarian; Rustrot Viper; Shady Bartender; Speaker Stomper; Star Vulpera; The Black Knight; Traveling Merchant; Wind-Up Enforcer; Wind-Up Musician; Wind-Up Sapling |

## Named resource, reward and token families — overlapping counts

| Family | Names | Cards |
| --- | --- | --- |
| Abyssal Curses | 2 | Sira'kess Cultist; Za'qul |
| Asteroids | 3 | Bolide Behemoth; Moonstone Mauler; Ultraviolet Breaker |
| Bombs / T.N.T. | 4 | Blastmaster Boom; Boomboss Tho'grun; Clockwork Goblin; Seaforium Bomber |
| Chaotic Tendrils | 2 | Chaotic Tendril; Eye of Chaos |
| Concoctions | 2 | Concoctor; Ghoulish Alchemist |
| Corpses | 19 | Blood Doctor Thal'ena; Bloodfiend; Body Bagger; Bonedigger Geist; Boneguard Commander; Boneshredder; Corpse Bride; Darkfallen Neophyte; Eulogizer; Exarch Maladaar; Falric; Hematurge; Husk, Eternal Reaper; Lord Marrowgar; Marrow Manipulator; Meat Grinder; Shambling Zombietank; Soulstealer; Volcoross |
| C’Thun | 15 | Ancient Shieldbearer; Beckoner of Evil; Blade of C'Thun; C'Thun's Chosen; Dark Arakkoa; Dark Deacon; Disciple of C'Thun; Doomcaller; Gargantuan Slitherer; Klaxxi Amber-Weaver; Skeram Cultist; Spawn of C'Thun; Twilight Darkmender; Twilight Geomancer; Twin Emperor Vek'lor |
| Dark Gifts | 9 | Brutish Endmaw; Creature of Madness; Darkrider; Dragon Turtle; Frostburn Matriarch; Nightmare Lord Xavius; Raptor Herald; Shadowflame Stalker; Treacherous Tormentor |
| Dream cards | 2 | Hopeful Dryad; Ysera the Dreamer |
| Excavate | 12 | Antique Flinger; Badlands Brawler; Blastmage Miner; Burrow Buster; Drilly the Kid; Fossilized Kaleidosaur; Harrowing Ox; Kobold Miner; Reliquary Researcher; Sir Finley, the Intrepid; Skeleton Crew; Tram Conductor Gerry |
| Galakrond / Invoke | 6 | Corrupt Elementalist; Devoted Maniac; Disciple of Galakrond; Dragonblight Cultist; Kronx Dragonhoof; Shield of Galakrond |
| Herald | 7 | Armored Bloodletter; Envoy of the End; Obsessive Technician; Scorching Ravager; Shadowsworn Disciple; Skywall Sentinel; Ultraxion |
| Imbue | 9 | Bitterbloom Knight; Exotic Houndmaster; Flutterwing Guardian; Goldpetal Drake; Kaldorei Priestess; Living Garden; Lunarwing Messenger; Spirit Gatherer; Wisprider |
| Jade Golems | 4 | Aya Blackpaw; Jade Behemoth; Jade Chieftain; Jade Spirit |
| Leylines | 3 | Ley Walker; Mystic Runesaber; Surge Needle |
| Librams | 4 | Aldor Attendant; Aldor Truthseeker; Interstellar Researcher; Interstellar Wayfarer |
| Pack / collectible-pack simulation | 1 | Avatar of Hearthstone |
| Portals | 6 | Kil'jaeden; Neeru Fireblade; Portal Keeper; Portal Overfiend; Sargeras, the Destroyer; Ysera, Unleashed |
| Potions / Poisons | 3 | Apothecary Helbrim; Kabal Chemist; Mixologist |
| Relics | 2 | Artificer Xy'mox; Queen Azshara |
| Rituals | 1 | Kith'ix |
| Rune-dependent cards | 3 | G'huun; Hematurge; Necrotic Mortician |
| Soul Fragments | 7 | Luckysoul Hoarder; Shadowlight Scholar; Shardshatter Mystic; Soulciologist Malicia; Soulshard Lapidary; Spirit Jailer; Void Drinker |
| Spare Parts | 2 | Tinkertown Technician; Toshley |
| Wildseeds | 2 | Ara'lon; Spirit Poacher |

## Complete inventory by primary group

<a id="damage-stats"></a>

### Damage, healing, Armor and board stats — 17

Extend numeric expressions, target-dependent branches, tribal filters and compound stat effects.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Chillspine Stegodon | DINO_413 |  · References: Kindred | Battlecry: Deal 2 damage to two random enemy minions. Kindred: And Freeze them. |
| City Chief Esho | TLC_110 | Draw, discard and hand/deck movement | Battlecry: If every minion in your deck shares a minion type, give your other minions +2/+2 (wherever they are). |
| Dissolving Ooze | TLC_252 | Draw, discard and hand/deck movement | Battlecry: Destroy a friendly minion. Spit out the Bones of its Attack and Health into your hand. |
| Gruesome Nightmare | CATA_161 | Draw, discard and hand/deck movement | Battlecry: Give a minion in your hand or battlefield Attack equal to this minion's Attack. |
| Hydralisk | SC_008 |  | Battlecry: Deal 2 damage to a random enemy. Repeat for each other Zerg minion you control. |
| Malefic Rook | TOY_526 |  | Battlecry: Attack YOUR hero. |
| Manifested Timeways | TIME_019 |  | Battlecry: If you control an Aura, deal 3 damage to all enemies. |
| Night Elf Huntress | TOY_101 | Discover and other player choices | Battlecry: Deal 3 damage to three different enemies. (You pick the targets!) |
| Ravenous Devilsaur | TLC_829 |  · References: Kindred | Battlecry: Destroy a minion. Kindred: Gain its stats. |
| Scalehide Kodo | TLC_454 |  · References: Kindred | Battlecry: Destroy the lowest Attack enemy minion. Kindred: The highest Attack instead. |
| Shadowtouched Kvaldir | YOG_300 |  | Battlecry: Your next healing effect deals damage instead. |
| Sheriff Barrelbrim | WW_359 |  | Battlecry: If you have 20 or less Health, open the Badlands Jail. |
| Steamcleaner | CORE_REV_946, REV_946 |  | Battlecry: Destroy ALL cards in both players' decks that didn't start there. |
| Tinkertown Technician | GVG_102 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: If you have a Mech, gain +1/+1 and add a Spare Part to your hand. |
| Tomb Traitor | TTN_455 | Draw, discard and hand/deck movement | Battlecry: Destroy a Plague in your opponent's deck to deal 3 damage to all enemy minions. |
| Trenchstalker | TSC_659 |  | Battlecry: Attack three different random enemies. |
| Windpeak Wyrm | TLC_600 | Card costs, mana and ordinary discounts · References: Kindred | Battlecry: Deal 5 damage and gain 5 Armor. Kindred: Costs (2) less. |

<a id="draw-zones"></a>

### Draw, discard and hand/deck movement — 21

Extend existing zone operations: draws, burns, ordering, bottom-of-deck placement and hand replacement.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Chaos Gazer | YOD_027 |  | Battlecry: Curse a playable card in your opponent's hand. They have 1 turn to play it! |
| Chromie, Timehopper | WON_041 |  | Battlecry: Visit a Historical Epoch. Shuffle the others into your deck. |
| Corrupt Constable | CAP_401 | Damage, healing, Armor and board stats | Battlecry: If the enemy deck has any Imp-formants, move one to the top and give it +2/+2. |
| Doommaiden | GDB_129 |  | Battlecry: Draw a card from your opponent's deck. If you don't play it this turn, put it back. |
| Dreamwarden | EDR_256 | Damage, healing, Armor and board stats | Taunt. Battlecry: If there is a card in your deck that didn't start there, draw it and gain +2/+2. |
| Elise Starseeker | LOE_079 |  | Battlecry: Shuffle the 'Map to the Golden Monkey' into your deck. |
| Elise the Trailblazer | UNG_851 |  | Battlecry: Shuffle a sealed Un'Goro pack into your deck. If your deck has no duplicates, draw it. |
| Entomologist Toru | TLC_841 | Card costs, mana and ordinary discounts | Battlecry: Put each minion in your hand into 0/1 Jars that cost (1). Break them to release the minions! |
| Gunslinger Kurtrus | WW_401 | Damage, healing, Armor and board stats | Battlecry: If your deck started with no duplicates, fire six 2 damage shots at minions in the enemy's hand. |
| Jerry Rig Carpenter | DED_003 |  · References: Choose One | Battlecry: Draw a Choose One spell and split it. |
| King Maluk | TIME_042 | Generated cards and named card pools | Battlecry: Discard your hand. Get an Infinite Banana. |
| Mes'Adune the Fractured | WW_429 |  | Battlecry: Draw an Elemental. Split it into two halves. |
| Pebbly Page | WON_090 |  | Battlecry: Draw an Overload card. You can't be Overloaded this turn. |
| Photographer Fizzle | ETC_113 |  | Battlecry: Take a Snapshot of your current hand and shuffle it into your deck. (Once per game) |
| Rainbow Seamstress | TOY_823 | Damage, healing, Armor and board stats | Battlecry: If your deck started with a Blood, Frost, or Unholy card, gain Lifesteal, Reborn, or Rush respectively. |
| Razidir | TLC_463 |  · References: Kindred | Battlecry: Discard a random card from your hand. Kindred: Your opponent's hand instead. |
| Relic Miner | TLC_109 | Discover and other player choices; Damage, healing, Armor and board stats | Battlecry: Destroy the top card of your deck. Discover a card of the same Rarity. |
| Shadowcloaked Assailant | EDR_524 |  | Battlecry: If you're holding one of the same cards as your opponent, shuffle theirs into their deck. |
| Sharp-Eyed Seeker | TTN_712 |  | Battlecry: If there is a card in your deck that didn't start there, draw it. |
| Stowaway | DRG_034 |  | Battlecry: If there are cards in your deck that didn't start there, draw 2 of them. |
| Torga | TLC_102 |  · References: Kindred | Battlecry: Draw a Kindred card and another card that activates it. |

<a id="summon-tokens"></a>

### Summons, recruits and token definitions — 14

Add exact token definitions, variable summon stats, filtered recruitment and placement rules. Generated minion abilities need their own coverage.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Elise, Badlands Savior | WW_392 | Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: If your deck started with no duplicates, summon 5/5 copies of 4 random minions in your deck. |
| Gelbin Mekkatorque | EX1_112 |  | Battlecry: Summon an AWESOME invention. |
| Grunty | SC_013 | Discover and other player choices | Battlecry: Summon four random Murlocs, then shoot them at enemy minions. (You pick the targets!) |
| Isiset | BE_259 | Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Battlecry: Summon two 10/10 Constructs. They are Frozen until you spend 15 Mana on spells. |
| Marin the Fox | LOOT_357 |  | Battlecry: Summon a 0/8 Treasure Chest for your opponent. (Break it for awesome loot!) |
| Mogu Cultist | ULD_705 |  | Battlecry: If your board is full of Mogu Cultists, sacrifice them all and summon Highkeeper Ra. |
| Nethrandamus | BT_481 | Card costs, mana and ordinary discounts | Battlecry: Summon two random 0-Cost minions. (Upgrades each time a friendly minion dies!) |
| Princess Talanji | TRL_259 | Draw, discard and hand/deck movement | Battlecry: Summon all minions from your hand that didn't start in your deck. |
| Rheastrasza | WW_824 | Draw, discard and hand/deck movement | Battlecry: If your deck started with no duplicates, summon the Purified Dragon Nest. |
| Talya Earthstrider | MEND_304 |  | Battlecry: Your cards that summon Animal Companions summon 1 more this game. |
| Time Adm'ral Hooktail | TIME_713 |  | Battlecry: Summon a 0/8 Chest for your opponent. It's FULL of Coins! |
| Tuskarr Totemic | AT_046, WON_081 |  | Battlecry: Summon a random basic Totem. |
| Windshear Stormcaller | LOOT_518 |  | Battlecry: If you control all 4 basic Totems, summon Al'Akir the Windlord. |
| Wing Commander Ichman | AV_336 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Summon a Beast from your deck and give it Rush. If it kills a minion this turn, repeat. |

<a id="generate-pools"></a>

### Generated cards and named card pools — 13

Define precise named/tribal/class/school pools and generated-card metadata; implement any required token abilities.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Broodchamber Tunneler | BE_720 | Hero powers, upgrades and replacements; Card costs, mana and ordinary discounts · References: Combo | Battlecry: Get a 1-Cost Larva with a Combo that triggers a Hero Power from another class. |
| Carry-On Grub | VAC_935 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Get a 1-Cost Suitcase. Pack the top 2 cards of your deck into it. |
| Concoctor | RLK_568 | Draw, discard and hand/deck movement | Battlecry: Add a random Concoction to your hand. |
| Drone Deconstructor | TTN_860 |  · References: Adapt / bonus effects, Magnetic | Battlecry: Get a 1/1 Magnetic Sparkbot with a random Bonus Effect. |
| Elite Tauren Chieftain | PRO_001 |  | Battlecry: Give both players the power to ROCK! (with a Power Chord card) |
| Eye of Chaos | YOG_515 |  | Battlecry: Get two 1/1 Chaotic Tendrils. |
| Hexmarshal | JAIL_806 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Get a random spell that costs (5) or more. If your deck started with no spells, it costs (5) less. |
| Hopeful Dryad | EDR_001 |  | Battlecry: Get a random Dream card. |
| Kabal Chemist | CFM_619 | Draw, discard and hand/deck movement | Battlecry: Add a random Potion to your hand. |
| Primordial Lord | CATA_EVENT_000 | Dormant, locations and board-state systems · References: Colossal | Battlecry: Get a random Colossal minion from the past. |
| Starlight Whelp | TTN_718 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement | Battlecry: Get a random card from your starting hand. |
| Toki, Time-Tinker | GIL_549 | Draw, discard and hand/deck movement | Battlecry: Add a random Legendary minion from the past to your hand. |
| Ysera the Dreamer | LEG_CS3_033 | Draw, discard and hand/deck movement | Battlecry: Add one of each Dream card to your hand. |

<a id="cost-mana"></a>

### Card costs, mana and ordinary discounts — 15

Extend cost-setting, discount duration/counts, mana caps and multi-card cost relationships.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Chronogor | TIME_032 | Draw, discard and hand/deck movement | Battlecry: You draw your 2 highest Cost cards. Your opponent draws your 2 lowest Cost cards. |
| Dark Inquisitor Xanesh | YOP_007 | Draw, discard and hand/deck movement · References: Corrupt | Battlecry: Reduce the Cost of all Corrupt and Corrupted cards in your hand and deck by (2). |
| Doomkin | JAM_029 |  | Battlecry: Take one of your opponent's empty Mana Crystals. |
| Foreboding Flame | GDB_121 | Draw, discard and hand/deck movement | Battlecry: Demons that didn't start in your deck cost (1) less this game. |
| Ghoulish Alchemist | RLK_570 |  | Battlecry: Your next Concoction costs (0). |
| Hot Spring Glider | TLC_428 | Damage, healing, Armor and board stats · References: Kindred | Battlecry: Your next Murloc costs (1) less. Kindred: And gains Divine Shield. |
| Ivus, the Forest Lord | AV_142t | Damage, healing, Armor and board stats | Battlecry: Spend the rest of your Mana and gain +2/+2, Rush, Divine Shield, or Taunt at random for each. |
| Leyline Manipulator | LOOT_537 | Draw, discard and hand/deck movement | Battlecry: If you're holding any cards that didn't start in your deck, reduce their Cost by (2). |
| M.O.T.H.E.R. | BE_036 | Draw, discard and hand/deck movement | Battlecry: Reduce the Cost of a card in your hand by (5). This continues to the left and right with (1) less reduction. |
| Mysterious Visitor | REV_246 |  | Battlecry: Reduce the Cost of cards copied from your opponent by (3). |
| Overgrown Horror | EDR_654 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Taunt Battlecry: Reduce the Cost of minions in your hand with Dark Gifts by (2). |
| Planetary Navigator | GDB_444 |  | Battlecry: The next Draenei you play costs (2) less, but has Overload: (2). |
| SI:7 Skulker | SW_418 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Stealth Battlecry: The next card you draw costs (1) less. |
| Skittish Saucier | DINO_137 | Draw, discard and hand/deck movement | Battlecry: Reduce the Cost of adjacent cards in your hand by (1). |
| Stickybomb Saboteur | CATA_186 | Generated cards and named card pools | Battlecry: Give your opponent a 2-Cost Sabotage. Cards next to it cost (1) more. |

<a id="choices"></a>

### Discover and other player choices — 55

Extend existing choices with multiple selections, target/choice relationships, hidden selections and result-dependent riders.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Agent of the Old Ones | CATA_200 | Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: Choose a card in your hand to transform into a Coin. |
| Ancient Stegodon | TLC_242 | Damage, healing, Armor and board stats | Battlecry: Choose to gain Taunt, Poisonous, or +1/+1. |
| Arch-Thief Rafaam | LOE_092 |  | Battlecry: Discover a powerful Artifact. |
| Archivist Elysiana | DAL_736 | Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: Discover 5 cards. Replace your deck with 2 copies of each. |
| Bootleg Alchemist | JAIL_313 | Copies, transformations, swaps and control; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Choose a card in your hand. Transform it into a spell that costs (5) more (keeps its original Cost). |
| Conjuration Specialist | CATA_979 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Choose a spell in your hand. Split it into two random spells of the same Cost. |
| Disciple of Eonar | TTN_503 |  · References: Choose One | Battlecry: Your next Choose One card or power has both effects combined. |
| Dread Leviathan | CATA_699 | Copies, transformations, swaps and control; Damage, healing, Armor and board stats | Taunt. Battlecry: Choose an enemy minion to steal 3 Health from, three times. |
| Dreamplanner Zephrys | WORK_027 | Generated cards and named card pools | Battlecry: Choose a Travel Tour to get two potentially perfect cards from it. |
| Eyes in the Sky | TLC_521 | Draw, discard and hand/deck movement | Battlecry: Look at 3 cards in your enemy's deck. Pick one to put on top. |
| False Disciple | TTN_484 |  | Battlecry: Discover a Legendary Priest minion from the past. |
| Ghost Writer | ETC_088 |  · References: Finale | Battlecry: Discover a spell. Finale: Discover another. |
| Goliath, Sneed's Masterpiece | DED_525 | Damage, healing, Armor and board stats | Battlecry: Fire five rockets at enemy minions that deal 2 damage each. (You pick the targets!) |
| Grand Empress Shek'zara | DMF_516 | Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: Discover a card in your deck and draw all copies of it. |
| Griftah | TRL_096 |  | Battlecry: Discover two cards. Give one to your opponent at random. |
| Griftah, Trusted Vendor | VAC_959 |  | Battlecry: Discover an amazing Amulet to give to both players. (The enemy's is a phony version!) |
| Heistbaron Togwaggle | DAL_417 |  | Battlecry: If you control a Lackey, choose a fantastic treasure. |
| Highborne Mentor | TIME_704 | Card costs, mana and ordinary discounts; Generated cards and named card pools | Battlecry: Get a 2/2 Pupil. Discover a spell that costs (7) or more from the past to teach it. |
| Hipster | ETC_103 | Draw, discard and hand/deck movement | Battlecry: Discover a spell from your opponent's class that isn't in their deck. |
| Imp-oster | MAW_000 | Copies, transformations, swaps and control | Battlecry: Choose a friendly Imp. Transform into a copy of it. |
| Kaldorei Cultivator | TIME_730 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Discover 2 Beasts. Put them on the bottom of your deck with +5/+5. |
| Kobold Hermit | LOOT_062 | Summons, recruits and token definitions | Battlecry: Choose a basic Totem. Summon it. |
| Loken, Jailer of Yogg-Saron | TTN_487 | Summons, recruits and token definitions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Discover a minion from your deck. Summon a Tentacle with its stats and Taunt. |
| Madame Lazul | DAL_729 | Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: Discover a copy of a card in your opponent's hand. |
| Malygos, Aspect of Magic | DRG_270 |  | Battlecry: If you're holding a Dragon, Discover an upgraded Mage spell. |
| Marin the Manager | VAC_702 | Draw, discard and hand/deck movement | Battlecry: Choose a fantastic treasure. Shuffle the other 3 into your deck. |
| Maruut Stonebinder | DEEP_037 | Summons, recruits and token definitions; Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: If your deck started with no duplicates, Discover an Elemental to summon. Add the others to your hand. |
| Merchant of Legend | TLC_514 | Draw, discard and hand/deck movement | Battlecry: Discover a Legendary minion. Shuffle the other two into your deck. |
| Mimiron | BE_588 |  | Battlecry: If you control a Mech, Discover the perfect tech card. |
| Murozond, Thief of Time | WON_066 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: If your deck has no duplicates, Discover a Dragon. Deal damage equal to its Cost to all other minions. |
| Nightmare Lord Xavius | EDR_856 | Draw, discard and hand/deck movement · References: Adapt / bonus effects | Battlecry: Discover a minion from your deck. Give it a Dark Gift. |
| Ocular Occultist | CATA_490 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Taunt Battlecry: Choose a card in your hand to discard. |
| Overplanner | VAC_444 | Draw, discard and hand/deck movement | Battlecry: Choose three cards from your deck to put on top in that order. |
| Pandaren Importer | SW_065 | Draw, discard and hand/deck movement | Battlecry: Discover a spell that didn't start in your deck. |
| Party Crasher | REV_370 | Draw, discard and hand/deck movement | Battlecry: Choose an enemy minion. Throw a random minion from your hand at it. |
| Q'onzu | EDR_517 | Draw, discard and hand/deck movement | Battlecry: Discover a spell. Choose to keep it or put it on top of your opponent's deck. |
| Raid Negotiator | ONY_019 |  · References: Choose One | Battlecry: Discover a Choose One card. It has both effects combined. |
| Resort Valet | VAC_432 |  | Battlecry: Discover a card from the newest expansion. |
| School Teacher | TSC_052 | Card costs, mana and ordinary discounts; Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Add a 1/1 Nagaling to your hand. Discover a spell that costs (3) or less to teach it. |
| Scion of Insight | BE_298 | Damage, healing, Armor and board stats | Battlecry: Discover a Blood, Frost or Unholy card. Gain Lifesteal, Reborn or Rush based on your choice. |
| Serena Bloodfeather | BAR_315 | Copies, transformations, swaps and control; Damage, healing, Armor and board stats | Battlecry: Choose an enemy minion. Steal Attack and Health from it until this has more. |
| Shadow Hunter Vol'jin | BAR_080 | Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: Choose a minion. Swap it with a random one in its owner's hand. |
| Siamat | CORE_ULD_178, ULD_178 | Damage, healing, Armor and board stats | Battlecry: Gain 2 of Rush, Taunt, Divine Shield, or Windfury (your choice). |
| Silas Darkmoon | DMF_074 |  | Battlecry: Choose a direction to rotate all minions. |
| Snake Eyes | WW_400 | Generated cards and named card pools | Battlecry: Roll two dice, then Discover two cards of those Costs. (Doubles get an extra Discover!) |
| Spiritspeaker | MEND_301 | Summons, recruits and token definitions | Battlecry: Choose an Animal Companion to summon. |
| Suspicious Alchemist | REV_000 | Copies, transformations, swaps and control; Generated cards and named card pools | Battlecry: Discover a spell. If your opponent guesses your choice, they get a copy. |
| Suspicious Peddler | NX2_044 | Copies, transformations, swaps and control; Card costs, mana and ordinary discounts; Generated cards and named card pools | Battlecry: Discover a 1-Cost card. If your opponent guesses your choice, they get a copy. |
| Suspicious Usher | REV_002 | Copies, transformations, swaps and control; Generated cards and named card pools | Battlecry: Discover a Legendary minion. If your opponent guesses your choice, they get a copy. |
| Theotar, the Mad Duke | REV_238 | Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: Discover a card in each player's hand and swap them. |
| Translocation Instructor | RLK_950 | Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: Choose an enemy minion. Swap it with a random one in their deck. |
| Violet Punisher | JAIL_101 | Copies, transformations, swaps and control; Damage, healing, Armor and board stats · References: Adapt / bonus effects | Battlecry: Choose an enemy minion. Steal its Bonus Effects and gain +1/+1 for each stolen. |
| Vulpera Scoundrel | ULD_209 |  | Battlecry: Discover a spell or pick a mystery choice. |
| Warsong Wrangler | BAR_037 | Copies, transformations, swaps and control; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Discover a Beast from your deck. Give all copies of it +2/+1 (wherever they are). |
| Watfin | JAIL_EVENT_100 | Damage, healing, Armor and board stats | Battlecry: Discover a minion. Pick the suspicious one to gain +1/+1. |

<a id="copy-transform"></a>

### Copies, transformations, swaps and control — 23

Extend physical-card copying, stat preservation, owner/controller identity and linked swaps or transformations.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Ashamane | EDR_527 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Fill your hand with copies of cards from your opponent's deck. They cost (3) less. |
| Askara | GDB_455 | Summons, recruits and token definitions | Battlecry: The next two Draenei you play summon a copy of themselves. |
| Azalina Soulthief | GIL_198 | Draw, discard and hand/deck movement | Battlecry: Replace your hand with a copy of your opponent's. |
| Barbaric Sorceress | TSC_020 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Taunt. Battlecry: Swap the Cost of a random spell in each player's hand. |
| Copycat | DED_514 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Add a copy of the next card your opponent plays to your hand. |
| Drakkari Trickster | TRL_527 | Draw, discard and hand/deck movement | Battlecry: Give each player a copy of a random card from their opponent's deck. |
| Dryscale Deputy | WW_383 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: The next time you draw a spell, get a copy of it. |
| Eternus | TIME_435 | Damage, healing, Armor and board stats | Battlecry: Take control of an enemy minion with this minion's Health or less. |
| Hex Lord Malacrass | TRL_318 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Add a copy of your opening hand to your hand (except this card). |
| Mind Control Tech | EX1_085 |  | Battlecry: If your opponent has 4 or more minions, take control of one. |
| Mischief Maker | ULD_229 | Draw, discard and hand/deck movement | Battlecry: Swap the top card of your deck with your opponent's. |
| Murloc Holmes | REV_022 | Generated cards and named card pools | Battlecry: Solve 3 Clues about your opponent's cards to get copies of them. |
| Narain Soothfancy | VAC_420 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Get two Fortunes that are copies of the top card of your deck. |
| Plagiarizarrr | JAM_023 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Get a copy of the top card of your opponent's deck. |
| Psychic Conjurer | CORE_EX1_193, EX1_193 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Copy a card in your opponent's deck and add it to your hand. |
| Royal Informant | TIME_036 | Card costs, mana and ordinary discounts; Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Look at the right- most card in your opponent's hand. Either get a copy of it or increase its Cost by (2). |
| Sir Finley, Sea Guide | TSC_908 | Draw, discard and hand/deck movement | Battlecry: Swap your hand with the bottom of your deck. |
| Soul Seeker | MAW_004 | Draw, discard and hand/deck movement | Battlecry: Swap this with a random minion from your opponent's deck. |
| Spirit of the Badlands | WW_337 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: If your deck started with no duplicates, get a permanent Mirage. |
| Tentacled Menace | DRG_084 | Draw, discard and hand/deck movement | Battlecry: Each player draws a card. Swap their Costs. |
| Tony, King of Piracy | ETC_541 | Draw, discard and hand/deck movement · References: Finale | Battlecry: Replace your deck with a copy of your opponent's. Finale: Draw a card. |
| Tricky Satyr | EDR_521 | Card costs, mana and ordinary discounts; Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Get a copy of the lowest Cost card in your opponent's hand. |
| Zai, the Incredible | DMF_231 | Draw, discard and hand/deck movement | Battlecry: Copy the left- and right-most cards in your hand. |

<a id="death-memory"></a>

### Deathrattles, resurrection and remembered victims — 56

Track the exact destroyed/discarded/chosen minion and carry that identity into later Deathrattles or resurrection.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Acolyte of Infinity | END_018 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Set the Cost of a random card in your hand to INFINITY! Deathrattle: Change it back. |
| Ancient Augur | JAIL_303 | Discover and other player choices; Draw, discard and hand/deck movement · References: Choose One | Battlecry: Look at 3 cards in your opponent's hand and secretly choose one. Deathrattle: Discard it. |
| Ancient Raptor | TLC_245 | Discover and other player choices; Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: Choose to gain +3 Attack, Divine Shield, or "Deathrattle: Summon two 1/1 Plants." |
| Apothecary Helbrim | BAR_324 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry and Deathrattle: Add a random Poison to your hand. |
| Archdruid of Thorns | EDR_491 |  | Battlecry: Gain the Deathrattles of your minions that died this turn. |
| Beast Speaker Taka | DINO_430 | Discover and other player choices; Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: Discover a Legendary Beast from any class to gain its stats. Deathrattle: Summon it. |
| Body Wrapper | ULD_727 | Discover and other player choices; Draw, discard and hand/deck movement | Battlecry: Discover a friendly minion that died this game. Shuffle it into your deck. |
| Chromatic Egg | DRG_086 | Discover and other player choices | Battlecry: Secretly Discover a Dragon to hatch into. Deathrattle: Hatch! |
| Corpse Raiser | ICC_257 |  | Battlecry: Give a friendly minion "Deathrattle: Resummon this minion." |
| Da Undatakah | TRL_537 |  | Battlecry: Gain the Deathrattle effects of 3 friendly minions that died this game. |
| Defense Attorney Nathanos | MAW_011 | Discover and other player choices | Battlecry: Discover a friendly Deathrattle minion that died this game. Gain its Deathrattle and then trigger it. |
| Dirdra, Rebel Captain | GDB_117 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Rush. Battlecry: Shuffle all 8 Crewmates into your deck. Deathrattle: Draw two Crewmates. |
| Disposal Assistant | WW_041 | Draw, discard and hand/deck movement | Battlecry and Deathrattle: Put a Barrel of Sludge on the bottom of your deck. |
| Dr. Stitchensew | TOY_830 | Discover and other player choices; Card costs, mana and ordinary discounts; Summons, recruits and token definitions | Battlecry: Discover a 5, 3, and 1-Cost minion to stitch to this. Deathrattle: Summon the 5-Cost minion. |
| Dread Raptor | TLC_432 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement · References: Kindred | Battlecry: Draw a Deathrattle minion that costs (3) or less. Kindred: It costs (0). |
| Dust Bunny | MIS_706 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry and Deathrattle: Add a random piece of junk to your hand (a Coin, Rock, Banana, or Knife). |
| Endbringer Umbra | TLC_106 |  | Battlecry: Trigger the Deathrattles of 5 friendly minions that died this game. |
| Felsoul Jailer | CS3_003 |  | Battlecry: Your opponent discards a minion. Deathrattle: Return it. |
| Fireworks Tech | BOT_038 | Damage, healing, Armor and board stats | Battlecry: Give a friendly Mech +1/+1. If it has Deathrattle, trigger it. |
| Game Master Nemsy | TOY_524 | Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: Draw a Demon. Deathrattle: Swap places with it. |
| Gemstone Hoarder | CATA_897 | Discover and other player choices; Card costs, mana and ordinary discounts; Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Choose a card in your hand to discard. Deathrattle: Get it back. It costs (1) less. |
| General Vezax | YOG_500 | Damage, healing, Armor and board stats | Rush Battlecry: Gain 4 Armor. Deathrattle: Lose 4 Armor to resummon this. |
| High Cultist Herenn | TLC_810 | Summons, recruits and token definitions; Draw, discard and hand/deck movement | Battlecry: Summon two Deathrattle minions from your deck. They fight! |
| Inventor Boom | TOY_607 | Weapons, forced attacks and combat restrictions; Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Battlecry: Resurrect two different friendly Mechs that cost (5) or more. They attack random enemies. |
| Kel'Thuzad, the Inevitable | REV_514 |  | Battlecry: Resurrect your Volatile Skeletons. Any that can't fit on the battlefield instantly explode! 0 |
| Kingpin Pud | WW_421 | Damage, healing, Armor and board stats | Battlecry: Resurrect your Ogre-Gang. Give them Windfury. |
| Monstrous Parrot | DED_008 | Copies, transformations, swaps and control; Generated cards and named card pools | Battlecry: Get a copy of the last friendly Deathrattle minion that died. |
| Mothership | SC_762 | Generated cards and named card pools; Damage, healing, Armor and board stats | Taunt Battlecry and Deathrattle: Get two random Protoss minions. |
| Myra Rotspring | BOT_243 | Discover and other player choices | Battlecry: Discover a Deathrattle minion. Also gain its Deathrattle. |
| N'Zoth, God of the Deep | DMF_002 |  | Battlecry: Resurrect a friendly minion of each minion type. |
| Najak Hexxen | AV_331 | Copies, transformations, swaps and control | Battlecry: Take control of an enemy minion. Deathrattle: Give the minion back. |
| Overlord Saurfang | BAR_334 | Damage, healing, Armor and board stats · References: Frenzy | Battlecry: Resurrect 2 friendly Frenzy minions. Deal 1 damage to all other minions. |
| Platysaur | TLC_603 | Draw, discard and hand/deck movement | Battlecry: Draw a card. Deathrattle: Discard it. |
| Pozzik, Audio Engineer | ETC_425 | Summons, recruits and token definitions; Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Add two 3/3 Bots to your opponent's hand. Deathrattle: Summon them for yourself. |
| R4T-C4TCH3R | JAIL_882 | Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: Copy all spells in your deck. Deathrattle: Draw one. |
| Raith Van Geist | CAP_806 | Weapons, forced attacks and combat restrictions; Damage, healing, Armor and board stats | Battlecry: Resurrect your minions that were Reborn this game. They attack random enemy minions. |
| Rat Sensei | WON_013 | Generated cards and named card pools; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry and Deathrattle: Add two 1/1 Turtles with Taunt to your hand. |
| Raza the Resealed | TOY_383 | Copies, transformations, swaps and control; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Shuffle copies of 5 random friendly minions that died this game into your deck. They cost (0). |
| Reefwalker | TSC_640 | Summons, recruits and token definitions | Battlecry and Deathrattle: Summon a 1/1 Piranha Swarmer. |
| Rime Sculptor | LEG_RLK_752 | Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: Summon two 2/1 Rime Elementals with "Deathrattle: Deal 2 damage to a random enemy." |
| Rustsworn Cultist | BT_160 | Summons, recruits and token definitions | Battlecry: Give your other minions "Deathrattle: Summon a 1/1 Demon." |
| Sacrificial Summoner | AV_312 | Card costs, mana and ordinary discounts; Summons, recruits and token definitions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Destroy a friendly minion. Summon a minion from your deck that costs (1) more. |
| Shadestone Skulker | DEEP_012 | Weapons, forced attacks and combat restrictions; Damage, healing, Armor and board stats | Rush. Battlecry: Take your weapon and gain its stats. Deathrattle: Give it back. |
| Shattershambler | TID_078 | History, thresholds and scaling conditions; Card costs, mana and ordinary discounts | Battlecry: Your next Deathrattle minion costs (1) less, but immediately dies when played. |
| Slagclaw | TLC_482 | Summons, recruits and token definitions · References: Kindred | Battlecry: Summon two 2/1 Sizzling Cinders. Kindred: Trigger your Sizzling Cinders' Deathrattles. |
| Spurfang | WW_814 | Card costs, mana and ordinary discounts; Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry and Deathrattle: Summon a random Beast with Cost equal to this minion's Attack. |
| Terrible Chef | VAC_946 | Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: Summon a 0/2 Nerubian Egg. Deathrattle: Destroy it. |
| Terror of the Wastes | BE_564 | Weapons, forced attacks and combat restrictions; Damage, healing, Armor and board stats | Battlecry: If a friendly minion died this turn, attack a random enemy. |
| Tomb Lurker | ICC_098 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Add a random Deathrattle minion that died this game to your hand. |
| Toshley | GVG_115 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry and Deathrattle: Add a Spare Part card to your hand. |
| Tyr | TTN_857 | Damage, healing, Armor and board stats | Battlecry: Resurrect a 2, 3, and 4-Attack minion from your class. |
| Ulfar | CORE_CATA_006 | Card costs, mana and ordinary discounts; Summons, recruits and token definitions | Battlecry: Give your other minions "Deathrattle: Summon a minion with this minion's Cost." |
| Ursoc | EDR_819 | Weapons, forced attacks and combat restrictions; Damage, healing, Armor and board stats | Battlecry: Attack ALL other minions. Deathrattle: Resurrect any this killed. |
| Vectus | SCH_162 | Summons, recruits and token definitions | Battlecry: Summon two 1/1 Whelps. Each gains a Deathrattle from your minions that died this game. |
| Vrykul Necrolyte | RLK_867 | Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: Give a friendly minion "Deathrattle: Summon a 2/2 Zombie with Rush." |
| Xaril, Poisoned Mind | OG_080 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry and Deathrattle: Add a random Toxin card to your hand. |

<a id="weapons-combat"></a>

### Weapons, forced attacks and combat restrictions — 22

Extend weapon effects, durability, forced combat, repeated attacks and special attack restrictions.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Air Support | CATA_564 | Damage, healing, Armor and board stats | Battlecry: Give a friendly minion Mega-Windfury. It can't attack heroes. |
| Charged Devilsaur | UNG_099 | Damage, healing, Armor and board stats | Charge Battlecry: Can't attack heroes this turn. |
| Deathwing, Mad Aspect | DRG_026 | Damage, healing, Armor and board stats | Battlecry: Attack ALL other minions. |
| Decimator Olgra | REV_934 | Damage, healing, Armor and board stats | Battlecry: Gain +1/+1 for each damaged minion, then attack all enemies. |
| Doctor Holli'dae | WW_010 | Draw, discard and hand/deck movement | Battlecry: If your deck started with no duplicates, equip the Staff of the Nine Frogs. |
| Expedition Sergeant | GDB_229 |  | Battlecry: The next Draenei you play immediately attacks a random enemy. |
| Lightforged Zealot | DRG_232 | Draw, discard and hand/deck movement | Battlecry: If your deck has no Neutral cards, equip a 4/2 Truesilver Champion. |
| Malkorok | OG_220 |  | Battlecry: Equip a random weapon. |
| Maxima Blastenheimer | DMF_089 | Summons, recruits and token definitions; Draw, discard and hand/deck movement | Battlecry: Summon a minion from your deck. It attacks the enemy hero, then dies. |
| MC Blingtron | ETC_078 | Damage, healing, Armor and board stats | Battlecry: Both players equip 1/2 Microphones. Your opponent's increases all damage they take by 1! |
| Medivh, the Guardian | KAR_097 |  | Battlecry: Equip Atiesh, Greatstaff of the Guardian. |
| Necrolord Draka | REV_940 | History, thresholds and scaling conditions; Damage, healing, Armor and board stats | Battlecry: Equip a 1/3 Dagger. (+1 Attack for each other card you played this turn, up to 10!) |
| PMM Infinitizer | TIME_043 | Damage, healing, Armor and board stats | Battlecry: Set a friendly minion's Attack and Health to 8. It can't attack heroes this turn. |
| Snoozin' Zookeeper | VAC_421 | Summons, recruits and token definitions | Battlecry: Summon an 8/8 Beast for your opponent. It attacks all of their minions. |
| Suspicious Pirate | REV_006 | Discover and other player choices; Copies, transformations, swaps and control; Generated cards and named card pools | Battlecry: Discover a weapon. If your opponent guesses your choice, they get a copy. |
| Theldurin the Lost | WW_815 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: If your deck started with no duplicates, gain Immune this turn and attack all enemies. |
| Verdant Dreamsaber | EDR_014 | Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Battlecry: If this costs (3) or less, attack two random enemy minions. |
| Vereesa Windrunner | DAL_379 |  | Battlecry: Equip Thori'dal, the Stars' Fury. |
| Viper | SC_018 | Summons, recruits and token definitions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Summon a minion from your opponent's hand. Your other Zerg minions gain Reborn and attack it. |
| Warmaul Challenger | BT_120, CORE_BT_120 | Discover and other player choices | Battlecry: Choose an enemy minion. Battle it to the death! |
| Wild Bloodstinger | ULD_212 | Summons, recruits and token definitions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Summon a minion from your opponent's hand. Attack it. |
| Worgen Roadie | ETC_098 | Summons, recruits and token definitions | Battlecry: Summon a 0/3 Instrument Case for your opponent. (Break it for a random weapon!) |

<a id="history"></a>

### History, thresholds and scaling conditions — 23

Extend public history, while-held counters, distinct schools/types, spent mana, starting decks and previous-turn queries.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Archimonde | GDB_128 | Summons, recruits and token definitions; Draw, discard and hand/deck movement | Battlecry: Summon every Demon you played this game that didn't start in your deck. |
| Broodwatcher | CATA_132 | Card costs, mana and ordinary discounts; Summons, recruits and token definitions; Generated cards and named card pools; Damage, healing, Armor and board stats | Battlecry: Get two 3/3 Whelps with Taunt. If you spent 8 Mana while holding this, summon them. ({0} left!) |
| Chrono-Lord Epoch | TIME_714 | Damage, healing, Armor and board stats | Battlecry: Destroy all minions that your opponent played last turn. |
| Colossus | SC_758 | Damage, healing, Armor and board stats | Battlecry: Deal 1 damage to all enemies, twice. (Improved by Protoss spells you cast this game!) |
| Eroded Sediment | WW_428 | Discover and other player choices | Battlecry: If you played an Elemental last turn, Discover any Elemental from the past. |
| Felwood Treant | CATA_131 | Card costs, mana and ordinary discounts | Battlecry: Gain a temporary Mana Crystal. If you spent 4 Mana while holding this, it's permanent. ({0} left!) |
| Herald of Shadows | TID_717 | Copies, transformations, swaps and control; Damage, healing, Armor and board stats | Battlecry: If you've cast a Shadow spell while holding this, steal 2 Health from a minion. |
| Keli'dan the Breaker | BT_196 | Damage, healing, Armor and board stats | Battlecry: Destroy a minion. If drawn this turn, instead destroy all minions except this one. |
| Lady Liadrin | BT_334 | Copies, transformations, swaps and control; Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Add a copy of each spell you cast on friendly characters this game to your hand. |
| Lifeguard | VAC_919 | Damage, healing, Armor and board stats | Taunt Battlecry: The next spell you cast has Lifesteal. |
| Merithra of the Dream | CATA_140 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Fill your hand with random Dragons. If you spent 25 Mana while holding this, they cost (1). ({0} left!) |
| Mind Sweeper | JAIL_432 | Copies, transformations, swaps and control; Damage, healing, Armor and board stats | Battlecry: If you played a copy of an opponent's card while holding this, deal 2 damage to all enemy minions. |
| Mindbender | YOG_402 | Damage, healing, Armor and board stats | Battlecry: Deal 1 damage for each card you have drawn this turn. |
| Minecart Cruiser | WW_326 | Damage, healing, Armor and board stats | Rush, Overload: (2) Battlecry: If you played an Elemental last turn, don't Overload. |
| Party Planner Vona | VAC_945 | Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: If you've taken 8 damage on your turns, summon Ourobos. |
| Renferal, the Malignant | EDR_526 | Draw, discard and hand/deck movement | Battlecry: Trap 1 random card in your opponent's hand for a turn. (Improved for each time you've played this.) |
| Sasquawk | VAC_415 |  | Battlecry: Repeat each card you played last turn. |
| Soulwarden | TRL_247 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Add 3 random cards you discarded this game to your hand. |
| Tidepool Pupil | VAC_304 | Discover and other player choices | Battlecry: If you've cast 3 spells while holding this, Discover one of them. |
| Vyranoth | CATA_213 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: If the total Cost of your starting minions was 100, split 100 stats among minions in your deck. |
| Y'Shaarj, the Defiler | DMF_188 | Copies, transformations, swaps and control; Card costs, mana and ordinary discounts; Generated cards and named card pools; Draw, discard and hand/deck movement · References: Corrupt | Battlecry: Add a copy of each Corrupted card you've played this game to your hand. They cost (0) this turn. |
| Y'Shaarj, Titan Bane | BE_784 | Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Old God. Battlecry: If you've spent 30 Mana on minions this game, gain Immune for 1 turn. ({0} left!) |
| Zok Fogsnout | ETC_386 | Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: Summon two {0}/{1} Quilboar with Taunt. (Improved by your hero Attack \ Armor gained this turn!) |

<a id="scheduling"></a>

### Delayed effects and start/end-of-turn triggers — 52

Extend scheduler timing, duration, expiry, ownership and source survival checks; some cases need persistent event listeners too.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Alexandros Mograine | CORE_RLK_706, RLK_706 | Lasting rules and game-wide replacements; Damage, healing, Armor and board stats | Battlecry: For the rest of the game, deal 3 damage to your opponent at the end of your turns. |
| Anachronos | RLK_919 |  | Battlecry: Send all other minions 2 turns into the future. |
| Ancient Pterrordax | TLC_246 | Discover and other player choices; Damage, healing, Armor and board stats · References: Elusive | Battlecry: Choose to gain Stealth until your next turn, Elusive, or Windfury. |
| Astrobiologist | GDB_874 | Discover and other player choices | Battlecry: At the start of your next turn, Discover a spell. |
| Boompistol Bully | YOD_033 | Card costs, mana and ordinary discounts | Battlecry: Enemy Battlecry cards cost (5) more next turn. |
| Camouflaged Dirigible | DRG_074 | Damage, healing, Armor and board stats | Battlecry: Give your other Mechs Stealth until your next turn. |
| Cannonmaster | CAP_107 | Generated cards and named card pools; Damage, healing, Armor and board stats | Battlecry: Get a 1/1 Cannoneer that deals 1 damage to a random enemy at end of turn. |
| Carnivorous Cubicle | WORK_042 | Copies, transformations, swaps and control; Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: Destroy a friendly minion. Summon a copy of it at the end of your turns. |
| Chronikar | END_006 | Damage, healing, Armor and board stats | Battlecry: Give your hero +3 Attack this turn, next turn, and the turn after. |
| Circadiamancer | TIME_102 | Card costs, mana and ordinary discounts; Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Add a random 8-Cost minion to your hand. At the start of your turns, reduce its Cost by (1). |
| Clockwork Rager | TIME_048 | History, thresholds and scaling conditions; Damage, healing, Armor and board stats | Battlecry: Gain +1 Health for each turn you've taken this game. |
| Coilfang Constrictor | TID_744 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement · References: Choose One | Battlecry: Look at 3 cards in your opponent's hand and choose one. It can't be played next turn. |
| Commander Geddon | CATA_591 | Discover and other player choices; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Instead of drawing each turn, Discover a card from your deck. It costs (3) less. Destroy the others. |
| Coppertail Imposter | BOT_562 | Damage, healing, Armor and board stats | Battlecry: Gain Stealth until your next turn. |
| Crater Gator | TLC_250 |  | Battlecry: Until the start of your next turn, the enemy hero can't be healed. |
| Cult Neophyte | CORE_SCH_713, SCH_713 | Card costs, mana and ordinary discounts | Battlecry: Your opponent's spells cost (1) more next turn. |
| Destructive Phoenix | CATA_EVENT_001 | Discover and other player choices; Copies, transformations, swaps and control; Summons, recruits and token definitions; Draw, discard and hand/deck movement | Battlecry: Choose a card in your hand to set on fire. In 3 turns, discard it and summon a copy of this. |
| Echoing Ooze | FP1_003 | Copies, transformations, swaps and control; Summons, recruits and token definitions | Battlecry: Summon an exact copy of this minion at the end of the turn. |
| Emberscarred Whelp | FIR_927 | Discover and other player choices; Card costs, mana and ordinary discounts | Battlecry: Discover a 5-Cost card. Gain 1 Mana Crystal next turn only.~GAMEPLAY ASPROXY FIR 927 |
| Endtime Murozond | END_037 | Summons, recruits and token definitions | Battlecry: Fill your board with random Dragons. Fully heal your hero. Skip your next turn. |
| Forensic Duster | REV_378 | Card costs, mana and ordinary discounts | Battlecry: Your opponent's minions cost (1) more next turn. |
| Gorgonzormu | VAC_955 | Card costs, mana and ordinary discounts; Generated cards and named card pools | Battlecry: Get a 2-Cost Cheese that summons three 1-Cost minions. It upgrades each turn. |
| Incindius | VAC_321 | Draw, discard and hand/deck movement | At the end of your turn, upgrade your Eruptions. Battlecry: Shuffle 5 of them into your deck. |
| Inspector Murloc Holmes | JAIL_851 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Investigate a card in the enemy hand. If they play a card with that name next turn, get 3 Coins. |
| Irida Sinseeker | JAIL_719 | Generated cards and named card pools; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Lifesteal. Battlecry: Send your deck to the Void, except 1 card. At the start of your turns, get two cards from the Void. |
| Keeper of Flame | FIR_928 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Give all minions in your hand +3/+3. They are destroyed in 3 turns. |
| Kil'jaeden | GDB_145 | Copies, transformations, swaps and control; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Replace your deck with an endless portal of Demons. Each turn, they gain an additional +2/+2. |
| King Tide | VAC_524 | Card costs, mana and ordinary discounts | Battlecry: Both players' spells cost (5) until the end of your next turn. |
| Lamplighter | VAC_442 | History, thresholds and scaling conditions; Damage, healing, Armor and board stats | Battlecry: Deal 1 damage (Improved by each turn in a row you've played an Elemental). |
| Loatheb | FP1_030 | Card costs, mana and ordinary discounts | Battlecry: Enemy spells cost (5) more next turn. |
| Master of Disguise | NEW1_014 | Damage, healing, Armor and board stats | Battlecry: Give a friendly minion Stealth until your next turn. |
| Migrating Elekk | MEND_303 | Copies, transformations, swaps and control; Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Taunt. Battlecry: Replace your future Animal Companions with random Beasts that cost (1) more. |
| Millhouse Manastorm | NEW1_029 | Card costs, mana and ordinary discounts | Battlecry: Enemy spells cost (0) next turn. |
| Mindrender Illucia | SCH_159 | Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: Replace your hand with a copy of your opponent's until end of turn. |
| Murozond, Unbounded | TIME_024 | Damage, healing, Armor and board stats | Battlecry: At the start of your next turn, set this minion's Attack to INFINITY! |
| Neeru Fireblade | BAR_919 | Draw, discard and hand/deck movement | Battlecry: If your deck is empty, open a portal that fills your board with 3/2 Imps each turn. |
| Nithogg | DRG_224 | Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: Summon two 0/3 Eggs. Next turn they hatch into 4/4 Drakes with Rush. |
| Overflow Surger | WW_424 | History, thresholds and scaling conditions; Copies, transformations, swaps and control; Summons, recruits and token definitions | Battlecry: Summon a copy of this for each turn in a row you've played an Elemental. |
| Partner in Crime | REV_247 | Copies, transformations, swaps and control; Summons, recruits and token definitions | Battlecry: Summon a copy of this minion at the end of your turn. |
| Prosecutor Mel'tranix | MAW_014 |  | Battlecry: Your opponent can only play their left- and right-most cards on their next turn. |
| Robocaller | WORK_006 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Draw an {0}, {1}, and {2}-Cost card. (Numbers dialed randomly each turn!) |
| Runi, Temporal Guardian | TIME_EVENT_998 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Send all minions in your hand 2 turns into the future. They return with +5/+5. |
| Scarlet Subjugator | EX1_196 | Damage, healing, Armor and board stats | Battlecry: Give an enemy minion -2 Attack until your next turn. |
| Setesh | BE_557 | Damage, healing, Armor and board stats | Battlecry: Gain 20 Armor. In 2 turns, convert your Armor into a Golem with that many stats and Taunt. |
| Shadowed Informant | CATA_614 | Discover and other player choices | Battlecry: Discover a spell from your class. (Swaps class each turn!) |
| Skarr, the Catastrophe | WW_026 | History, thresholds and scaling conditions; Damage, healing, Armor and board stats | Battlecry: Deal 1 damage to all enemies (improved by each turn in a row you've played an Elemental). |
| Spellward Jeweler | DAL_081 | Damage, healing, Armor and board stats · References: Elusive | Battlecry: Your hero is Elusive until next turn. |
| The Fins Beyond Time | TIME_706 | History, thresholds and scaling conditions; Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: Replace your hand with your starting hand. Swap back at the end of your turn. |
| Timewarden | RLK_527 | Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: Until the end of your next turn, Dragons you summon gain Taunt and Divine Shield. |
| Tol'vir Carver | CATA_566 | Discover and other player choices; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Choose a card in your hand. At the start of your turns, reduce its Cost by (1). |
| Tome Translator | BE_327 |  | Battlecry: ??? (Deciphers in 2 turns.) |
| Watercolor Artist | TOY_376 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Draw a Frost spell. At the start of your turns, reduce its Cost by (1). |

<a id="ongoing"></a>

### Auras, listeners and ongoing board effects — 35

Add recomputed auras or event listeners with source binding, Silence, zone changes and cleanup.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Alexstrasza, Guardian of Life | CATA_307 | Damage, healing, Armor and board stats | Battlecry: Set your remaining Health to 15. When you reach full Health, deal 15 damage to your opponent. |
| Annoying Fan | ETC_109 | Discover and other player choices; Damage, healing, Armor and board stats | Battlecry: Choose a minion. It can't attack while this is alive. |
| Ashen Elemental | REV_960 | Delayed effects and start/end-of-turn triggers; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Whenever your opponent draws a card next turn, they take 2 damage. |
| Aviana, Elune's Chosen | EDR_895 | Delayed effects and start/end-of-turn triggers; Card costs, mana and ordinary discounts | Battlecry: Start a three turn lunar cycle. When the Full Moon rises, your cards cost (1) this game. |
| Blightfang | RLK_225 | Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: Infect all enemy minions. When they die, you summon a 2/2 Zombie with Taunt. |
| Bloodthistle Illusionist | EDR_780 | Discover and other player choices; Copies, transformations, swaps and control; Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: Summon a copy of this. One secretly dies when it takes damage. |
| Captain Crowley | CAP_106 | Summons, recruits and token definitions | Your Cannoneers fire an additional shot. Battlecry: Summon two 1/1 Cannoneers. |
| Dark Templar | SC_752 | Damage, healing, Armor and board stats | Stealth. Battlecry: Destroy an enemy minion. Play another Templar to merge into an Archon! |
| DJ Manastorm | ETC_395 | History, thresholds and scaling conditions; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Set the Cost of spells in your hand to (0). After you cast one, the others cost (1) more. |
| Ebonscale Scout | CATA_552 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Deal damage equal to this minion's Attack. (While in hand, play a Dragon to become an 8/8 Dragon!) |
| Edwin, Defias Kingpin | DED_510 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Draw a card. If you play it this turn, gain +2/+2 and repeat this effect. |
| Exarch Hataaru | GDB_136 | Discover and other player choices; Card costs, mana and ordinary discounts | Battlecry: Discover a spell and reduce its Cost by (1). If you play it this turn, repeat this effect. |
| Flint Firearm | WW_379 | Generated cards and named card pools · References: Quickdraw | Battlecry: Get a random Quickdraw card. If you play it this turn, repeat this. |
| Hideous Husk | EDR_810 | Copies, transformations, swaps and control; Summons, recruits and token definitions; Damage, healing, Armor and board stats | Your Leeches steal 1 more Health from their victims. Battlecry: Summon two 0/2 Leeches. |
| High Templar | SC_765 | Damage, healing, Armor and board stats | Battlecry: Deal 2 damage to all enemies. Play another Templar to merge into an Archon! |
| Instructor Fireheart | SCH_507 | Discover and other player choices; Card costs, mana and ordinary discounts | Battlecry: Discover a spell that costs (1) or more. If you play it this turn, repeat this effect. |
| Jailhouse Manastorm | JAIL_122 | History, thresholds and scaling conditions; Card costs, mana and ordinary discounts; Summons, recruits and token definitions | Battlecry: After you cast a spell this game, summon a random minion of the same Cost. |
| Jandice Barov | SCH_351 | Discover and other player choices; Card costs, mana and ordinary discounts; Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: Summon two random 5-Cost minions. Secretly pick one that dies when it takes damage. |
| Kalecgos | DAL_609 | Delayed effects and start/end-of-turn triggers; Discover and other player choices; Card costs, mana and ordinary discounts | Your first spell each turn costs (0). Battlecry: Discover a spell. |
| Lotus Troublemaker | JAIL_470 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Deal 1 damage to a random enemy. Shoot 1 time! (While in hand or deck play cards for 2 Mana to shoot more!) |
| Morchie | END_036 | Discover and other player choices · References: Rewind | Your Rewinds keep BOTH potential outcomes. Battlecry: Discover a Rewind card from any class. |
| Obsessive Fan | ETC_108 | Discover and other player choices; Damage, healing, Armor and board stats | Battlecry: Choose a minion. It has Stealth while this is alive. |
| Picklock | JAIL_501 | Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | All numbers on this card equal your remaining Mana. Battlecry: Deal 1 damage to an enemy minion. |
| Pop'gar the Putrid | WW_091 | Card costs, mana and ordinary discounts; Generated cards and named card pools; Damage, healing, Armor and board stats | Your Fel spells cost (2) less and have Lifesteal. Battlecry: Get two Barrels of Sludge. |
| Raid Boss Onyxia | ONY_004 | Summons, recruits and token definitions; Damage, healing, Armor and board stats | Rush. Immune while you control a Whelp. Battlecry: Summon six 2/1 Whelps with Rush. |
| Remnant of Rage | END_004 | Deathrattles, resurrection and remembered victims; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Costs (1) less for each minion that died this turn. Battlecry: Draw 2 cards. |
| Roach | SC_012 | Copies, transformations, swaps and control; Generated cards and named card pools; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | When you draw this, get a copy of it. Battlecry: If you control another Zerg minion, gain +1/+2. |
| Rowdy Fan | ETC_107 | Discover and other player choices; Damage, healing, Armor and board stats | Battlecry: Choose a minion. It has +4 Attack while this is alive. |
| Sky Claw | DRG_225 | Summons, recruits and token definitions; Damage, healing, Armor and board stats | Your other Mechs have +1 Attack. Battlecry: Summon two 1/1 Microcopters. |
| Stiltstepper | DMF_229 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Draw a card. If you play it this turn, give your hero +4 Attack this turn. |
| The Ceaseless Expanse | GDB_142 | History, thresholds and scaling conditions; Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Costs (1) less for each time a card was drawn, played, or destroyed. Battlecry: Destroy all other minions. |
| Tichondrius | CORE_CATA_001 | Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Your hero is Immune. Battlecry: Your next Demon this turn costs (0). |
| Timelooper Toki | TIME_861 | Generated cards and named card pools | Battlecry: Get 3 random spells from the past. When you play ALL 3, get another Timelooper Toki. |
| Treasure Fiend | BE_EVENT_103 | Draw, discard and hand/deck movement | Battlecry: Draw two cards. After you play one, discard the other. |
| Xor'toth, Breaker of Stars | GDB_118 | Generated cards and named card pools; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Add two Stars to both sides of your hand. When they collide, deal 5 damage to all enemies. |

<a id="lasting"></a>

### Lasting rules and game-wide replacements — 14

Add persistent rules that modify future cards, draws, summons, damage, healing or other actions.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Ammunae | BE_852 | Auras, listeners and ongoing board effects; Deathrattles, resurrection and remembered victims; Copies, transformations, swaps and control; Summons, recruits and token definitions | Battlecry: For the rest of the game, after you play a Deathrattle minion, summon a copy of it. |
| Broodqueen Sha'kar | BE_565 | Deathrattles, resurrection and remembered victims; Damage, healing, Armor and board stats | Battlecry: If 5 friendly minions died this turn, your Rush minions have Charge this game. ({0} left!) |
| Cardboard Golem | TOY_809 | Draw, discard and hand/deck movement | Battlecry: Increase the duration of Auras in your hand, deck, and battlefield by 1. |
| Dark Pharaoh Tekahn | ULD_168 |  | Battlecry: For the rest of the game, your Lackeys are 4/4. |
| Ebyssian | CATA_553 | Auras, listeners and ongoing board effects; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Your Dragons have Rush this game. (While in hand, play a Dragon to become a 12/12 Dragon!) |
| Goru the Mightree | DRG_319 | Damage, healing, Armor and board stats | Taunt Battlecry: For the rest of the game, your Treants have +1/+1. |
| Inzah | ETC_371 | Card costs, mana and ordinary discounts | Battlecry: For the rest of the game, your Overload cards cost (1) less. |
| Kabal Mastermind | CAP_406 | Auras, listeners and ongoing board effects; Summons, recruits and token definitions; Damage, healing, Armor and board stats | Taunt. Battlecry: Whenever you summon an Imp-formant this game, give it +2/+2. |
| Loh, the Living Legend | TLC_257 | Card costs, mana and ordinary discounts | Battlecry: Your minions cost (5) this game. |
| Lothraxion the Redeemed | DMF_240 | Auras, listeners and ongoing board effects; Summons, recruits and token definitions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: For the rest of the game, after you summon a Silver Hand Recruit, give it Divine Shield. |
| Odyn, Prime Designate | TTN_811 | Damage, healing, Armor and board stats | Battlecry: For the rest of the game, after your hero gains Armor, they gain that much Attack for that turn. |
| Sister Svalna | RLK_816 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Permanently add a Vision of Darkness to your hand. |
| The Stonewright | REV_921 | Damage, healing, Armor and board stats | Battlecry: For the rest of the game, your Totems have +2 Attack. |
| Topior the Shrubbagazzor | REV_314 | Auras, listeners and ongoing board effects; History, thresholds and scaling conditions; Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: For the rest of the game, after you cast a Nature spell, summon a 3/3 Whelp with Rush. |

<a id="spell-power"></a>

### Spell Damage and spell-only modifiers — 24

Apply Spell Damage, next-spell bonuses, spell Lifesteal and other spell modifiers consistently across all damage paths.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Ancient Mage | EX1_584 | Damage, healing, Armor and board stats | Battlecry: Give adjacent minions Spell Damage +1. |
| Archmage Kalec | CATA_458 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Give all spells in your hand and deck Spell Damage +1. |
| Auchenai Phantasm | TRL_501 | Damage, healing, Armor and board stats | Battlecry: This turn, your healing effects deal damage instead. |
| Azure Drake | EX1_284 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Spell Damage +1 Battlecry: Draw a card. |
| Azure Explorer | DRG_102 | Discover and other player choices; Damage, healing, Armor and board stats | Spell Damage +2 Battlecry: Discover a Dragon. |
| Battlefield Blaster | CATA_209 | Discover and other player choices; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Choose a spell in your hand to give Spell Damage +1. |
| Black Cat | GIL_838 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Spell Damage +1 Battlecry: If your deck has only odd-Cost cards, draw a card. |
| Celestial Emissary | BOT_531 | Damage, healing, Armor and board stats | Battlecry: Your next spell this turn has Spell Damage +2. |
| Ethereal Augmerchant | BT_724 | Damage, healing, Armor and board stats | Battlecry: Deal 1 damage to a minion and give it Spell Damage +1. |
| Halduron Brightwing | RLK_820 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Give all Arcane spells in your hand and deck Spell Damage +1. |
| Keyboard Soloist | ETC_029 | Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: If you control no other minions, summon two 1/2 Amps with Spell Damage +1. |
| Omega Mind | BOT_543 | Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Battlecry: If you have 10 Mana Crystals, your spells have Lifesteal this turn. |
| Prestor's Pyromancer | SW_112 | Damage, healing, Armor and board stats | Battlecry: Your next Fire spell has Spell Damage +2. |
| Saruun | GDB_304 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Give all Elementals in your deck Fire Spell Damage +1. |
| Silvermoon Arcanist | RLK_218 | Damage, healing, Armor and board stats | Spell Damage +2 Battlecry: Your spells can't target heroes this turn. |
| Silvermoon Farstrider | RLK_826 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Give all Arcane spells in your hand Spell Damage +1. |
| Soot Spewer | GVG_123, WON_033 | Generated cards and named card pools; Damage, healing, Armor and board stats | Spell Damage +1 Battlecry: If you control another Mech, get a random Fire spell. |
| Sorcerous Substitute | SCH_530 | Copies, transformations, swaps and control; Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: If you have Spell Damage, summon a copy of this. |
| Spellbook Binder | DAL_089 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: If you have Spell Damage, draw a card. |
| Steward of Scrolls | SCH_245 | Discover and other player choices; Damage, healing, Armor and board stats | Spell Damage +1 Battlecry: Discover a spell. |
| Talented Arcanist | BAR_064 | Damage, healing, Armor and board stats | Battlecry: Your next spell this turn has Spell Damage +2. |
| Tuskarr Fisherman | ICC_093 | Damage, healing, Armor and board stats | Battlecry: Give a friendly minion Spell Damage +1. |
| Unstable Spellcaster | CATA_483 | History, thresholds and scaling conditions; Copies, transformations, swaps and control; Summons, recruits and token definitions; Damage, healing, Armor and board stats | Spell Damage +1 Battlecry: If you dealt damage with a spell this turn, summon a copy of this. |
| Volcanic Thrasher | TLC_223 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats · References: Kindred | Battlecry: Draw a Fire spell. Kindred: Give it Spell Damage +2. |

<a id="spell-casting"></a>

### Automatic casting and replaying spells/Battlecries — 49

Resolve nested casts, legal random targets, replay history, repeats, choices and recursion limits.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Archaedas | BE_055 | Weapons, forced attacks and combat restrictions; Discover and other player choices; Copies, transformations, swaps and control; Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Battlecry: Discover a spell. Transform it into a 3/3 weapon of the same cost that casts it each attack. |
| Astral Mediator | BE_256 | Deathrattles, resurrection and remembered victims; History, thresholds and scaling conditions; Card costs, mana and ordinary discounts | Battlecry and Deathrattle: Cast a random 3-Cost spell. |
| Asvedon, the Grandshield | RLK_608 | History, thresholds and scaling conditions; Copies, transformations, swaps and control; Damage, healing, Armor and board stats | Taunt Battlecry: Cast a copy of the last spell your opponent played. |
| Breakout Architect | JAIL_123 | History, thresholds and scaling conditions; Discover and other player choices; Card costs, mana and ordinary discounts | Battlecry: Discover a spell that costs (5) or more. It casts twice when played. |
| Brilliant Macaw | DED_509 | History, thresholds and scaling conditions | Battlecry: Repeat the last Battlecry you played. |
| Cactus Cutter | WW_327 | Auras, listeners and ongoing board effects; History, thresholds and scaling conditions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Draw a spell. If you cast it this turn, gain +1/+2 and Taunt. |
| Chaotic Tendril | YOG_514 | Delayed effects and start/end-of-turn triggers; History, thresholds and scaling conditions; Card costs, mana and ordinary discounts | Battlecry: Cast a random 1-Cost spell. Improve your future Chaotic Tendrils. |
| Chatty Macaw | VAC_407 | History, thresholds and scaling conditions | Battlecry: Repeat the last spell you cast at an enemy (at a random enemy if possible). |
| Clumsy Courier | SW_109 | History, thresholds and scaling conditions; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Cast the highest Cost spell from your hand. |
| Conniving Conman | VAC_333 | History, thresholds and scaling conditions | Battlecry: Replay the last card you played from another class. |
| Crackling Cloudstrider | CATA_563 | Deathrattles, resurrection and remembered victims; History, thresholds and scaling conditions; Discover and other player choices; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Choose a spell in your hand that costs (4) or less to absorb. Deathrattle: Cast it. |
| Cultivating Sprite | MEND_100 | Delayed effects and start/end-of-turn triggers; Card costs, mana and ordinary discounts; Generated cards and named card pools | Battlecry: Get a 3-Cost Bulb that casts three random 1-Cost spells. It upgrades each turn. |
| Deepminer Brann | DEEP_020 | Lasting rules and game-wide replacements; Draw, discard and hand/deck movement | Battlecry: If your deck started with no duplicates, your Battlecries trigger twice for the rest of the game. |
| Druid of Regrowth | TIME_033 | History, thresholds and scaling conditions; Extra keywords and attached mechanics · Attached/action: Rewind | Rewind Battlecry: Cast 2 random Nature spells. |
| Electra Stormsurge | BOT_411 |  | Battlecry: Your next spell this turn casts twice. |
| Fatebreaker | TIME_028 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Lifesteal Battlecry: Cast a Shred of Time from your deck to gain +3/+3. |
| Felwalker | AV_286 | History, thresholds and scaling conditions; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Taunt. Battlecry: Cast the highest Cost Fel spell from your hand. |
| Fyrakk the Blazing | FIR_959 | History, thresholds and scaling conditions; Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats; Auras, listeners and ongoing board effects | Immune to Fire spells. Battlecry: Cast 15 Mana worth of Fire spells at random enemies. |
| Grand Magister Rommath | RLK_803 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement | Battlecry: Recast each spell you've cast this game that didn't start in your deck. (Once per game) |
| Grand Magus Antonidas | SW_113 | Delayed effects and start/end-of-turn triggers; History, thresholds and scaling conditions | Battlecry: If you've cast a Fire spell on each of your last three turns, cast 3 Fireballs at random enemies. |
| Grey Sage Parrot | DED_515 | History, thresholds and scaling conditions; Card costs, mana and ordinary discounts | Battlecry: Repeat the last spell you've cast that costs (6) or more. |
| Hagatha the Fabled | TOY_504 | History, thresholds and scaling conditions; Copies, transformations, swaps and control; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Draw 2 spells that cost (5) or more. Transform them into Slimes that cast the spells. |
| Jace Darkweaver | SW_044 | History, thresholds and scaling conditions | Battlecry: Cast all Fel spells you've played this game (targets enemies if possible). |
| Jotun, the Eternal | TTN_842 | Lasting rules and game-wide replacements; Delayed effects and start/end-of-turn triggers; History, thresholds and scaling conditions; Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: For the rest of the game, cast a copy of the first spell you draw each turn at enemies. |
| Kalimos, Primal Lord | UNG_211 | History, thresholds and scaling conditions | Battlecry: If you played an Elemental last turn, cast an Elemental Invocation. |
| Lady Darkvein | REV_373 | Deathrattles, resurrection and remembered victims; History, thresholds and scaling conditions; Summons, recruits and token definitions | Battlecry: Summon two 2/1 Shades. Each gains a Deathrattle to cast your last Shadow spell. |
| Lynessa Sunsorrow | LOOT_216 | History, thresholds and scaling conditions | Battlecry: Cast each spell you cast on your minions this game on this one. |
| Mistah Vistah | VAC_519 | Delayed effects and start/end-of-turn triggers; History, thresholds and scaling conditions; Extra keywords and attached mechanics · Attached/action: Tourist | Mage Tourist Battlecry: In 3 turns, replay every spell you've cast between now and then. |
| Murmuring Elemental | LOOT_517 |  | Battlecry: Your next Battlecry this turn triggers twice. |
| Murozond the Infinite | DRG_090 | History, thresholds and scaling conditions | Battlecry: Play all cards your opponent played last turn. |
| Opu the Unseen | TLC_522 | Deathrattles, resurrection and remembered victims; History, thresholds and scaling conditions; Damage, healing, Armor and board stats; Extra keywords and attached mechanics · Attached/action: Combo | Stealth. Battlecry, Combo, and Deathrattle: Cast 'Fan of Knives'. |
| Pathmaker | AV_210 | History, thresholds and scaling conditions; Discover and other player choices · References: Choose One | Battlecry: Cast the other choice from the last Choose One spell you've cast. |
| Pet Parrot | VAC_961 | History, thresholds and scaling conditions; Card costs, mana and ordinary discounts | Battlecry: Repeat the last 1-Cost card you played. |
| Puzzlemaster Khadgar | TOY_373 | Weapons, forced attacks and combat restrictions | Battlecry: Equip a 0/6 Wisdomball that casts helpful Mage spells! |
| Ruinous Velocidrake | TIME_029 | History, thresholds and scaling conditions; Copies, transformations, swaps and control; Summons, recruits and token definitions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Rush Battlecry: Cast a Shred of Time from your deck to summon a copy of this. |
| Servant of Yogg-Saron | OG_087, WON_036 | History, thresholds and scaling conditions; Card costs, mana and ordinary discounts | Battlecry: Cast a random spell that costs (5) or MORE (targets chosen randomly). |
| Shudderwock | GIL_820 | History, thresholds and scaling conditions | Battlecry: Repeat all other Battlecries from cards you played this game (targets chosen randomly). |
| Sunwing Squawker | DED_501 | History, thresholds and scaling conditions | Battlecry: Repeat the last spell you've cast on a friendly minion on this. |
| Tess Greymane | GIL_598 | History, thresholds and scaling conditions | Battlecry: Replay every card from another class you've played this game (targets chosen randomly). |
| Therazane the Earthmother | BE_337 |  | Battlecry: Your next spell of each school casts twice. |
| Tortollan Pilgrim | ULD_236 | History, thresholds and scaling conditions; Discover and other player choices; Draw, discard and hand/deck movement | Battlecry: Discover a spell in your deck and cast it with random targets. |
| Tortollan Primalist | UNG_088 | History, thresholds and scaling conditions; Discover and other player choices | Battlecry: Discover a spell and cast it with random targets. |
| Twinbow Terrorcoil | TSC_071 | History, thresholds and scaling conditions | Battlecry: If you've cast a spell while holding this, your next spell casts twice. |
| Tyrande | EDR_464 | History, thresholds and scaling conditions | Battlecry: The next 3 spells you play cast twice. |
| Unseen Saboteur | DAL_538 | Draw, discard and hand/deck movement | Battlecry: Your opponent casts a random spell from their hand (targets chosen randomly). |
| Ursol | EDR_259 | Delayed effects and start/end-of-turn triggers; History, thresholds and scaling conditions; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Cast the highest Cost spell from your hand as an Aura that lasts 3 turns. |
| Violet Treasuregill | TLC_438 | History, thresholds and scaling conditions; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Cast a random spell from your deck that costs (2) or less (targets this if possible). |
| Wrathspine Enchanter | TSC_630 | History, thresholds and scaling conditions; Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: Cast a copy of a Fire, Frost, and Nature spell in your hand (targets chosen randomly). |
| Yogg-Saron, Hope's End | OG_134 | History, thresholds and scaling conditions | Battlecry: Cast a random spell for each spell you've cast this game (targets chosen randomly). |

<a id="hero-powers"></a>

### Hero powers, upgrades and replacements — 37

Support additional powers, power copying/upgrades, refreshes, damage history, discounts and power-specific triggers.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Algalon the Observer | TTN_717 | Copies, transformations, swaps and control | Battlecry: Replace your Hero Power with Algalon's Vision. |
| Amplified Snowflurry | AV_115 | Card costs, mana and ordinary discounts | Battlecry: Your next Hero Power costs (0) and Freezes the target. |
| Bitterbloom Knight | EDR_852 | Quests, Excavation and expansion objectives | Battlecry: Imbue your Hero Power. |
| Blackwald Pixie | GIL_561 |  | Battlecry: Refresh your Hero Power. |
| Blood Doctor Thal'ena | JAIL_446 | Health/Armor costs and alternate payment rules; Corpses and Death Knight rune resources; Generated cards and named card pools | Battlecry: Get a second Hero Power that costs Corpses. |
| Blowtorch Saboteur | CORE_DRG_403, DRG_403 | Card costs, mana and ordinary discounts | Battlecry: Your opponent's next Hero Power costs (2) more. |
| Daring Fire-Eater | TRL_390 | Damage, healing, Armor and board stats | Battlecry: Your next Hero Power this turn deals 2 more damage. |
| Dreambound Disciple | EDR_847 | Deathrattles, resurrection and remembered victims; Card costs, mana and ordinary discounts | Battlecry and Deathrattle: Your next Hero Power costs (0). |
| Exarch Naielle | GDB_846 | Discover and other player choices; Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: Replace your Hero Power with Tracking (Discover a card from your deck). |
| Exotic Houndmaster | EDR_226 | Quests, Excavation and expansion objectives; Draw, discard and hand/deck movement | Battlecry: Draw a Beast. Imbue your Hero Power. |
| Fencing Coach | AT_115 | Card costs, mana and ordinary discounts | Battlecry: The next time you use your Hero Power, it costs (2) less. |
| Flutterwing Guardian | EDR_800 | Quests, Excavation and expansion objectives; Damage, healing, Armor and board stats | Taunt, Divine Shield Battlecry: Imbue your Hero Power. |
| Free Spirit | ETC_382 | Deathrattles, resurrection and remembered victims; Damage, healing, Armor and board stats | Battlecry and Deathrattle: Your Hero Power gains 1 more Armor this game. |
| Goldpetal Drake | EDR_451 | Quests, Excavation and expansion objectives; Deathrattles, resurrection and remembered victims | Battlecry and Deathrattle: Imbue your Hero Power. |
| Grizzled Wizard | DRG_401 | Delayed effects and start/end-of-turn triggers; Copies, transformations, swaps and control | Battlecry: Swap Hero Powers with your opponent until your next turn. |
| Groovy Cat | ETC_385 | Deathrattles, resurrection and remembered victims; Damage, healing, Armor and board stats | Battlecry and Deathrattle: Your Hero Power gives your hero 1 more Attack this game. |
| Jan'alai, the Dragonhawk | TRL_316 | History, thresholds and scaling conditions; Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: If your Hero Power dealt 8 damage this game, summon Ragnaros the Firelord. |
| Justicar Trueheart | AT_132 | History, thresholds and scaling conditions; Copies, transformations, swaps and control | Battlecry: Replace your starting Hero Power with a better one. |
| Kaldorei Priestess | EDR_970 | Quests, Excavation and expansion objectives; Delayed effects and start/end-of-turn triggers; Damage, healing, Armor and board stats | Battlecry: Give all enemy minions -2 Attack until your next turn. Imbue your Hero Power. |
| Living Garden | EDR_518 | Quests, Excavation and expansion objectives; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: Imbue your Hero Power. Reduce the Cost of a minion in your hand by (1). |
| Lunarwing Messenger | EDR_449 | Quests, Excavation and expansion objectives; Damage, healing, Armor and board stats | Lifesteal Battlecry: Imbue your Hero Power. |
| Malorne the Waywatcher | EDR_888 | Discover and other player choices; Card costs, mana and ordinary discounts | Battlecry: Discover a Legendary Wild God. If you've Imbued your Hero Power 4 times, set its Cost to (1). |
| Mordresh Fire Eye | BAR_547 | History, thresholds and scaling conditions; Damage, healing, Armor and board stats | Battlecry: If you've dealt 10 damage with your Hero Power this game, deal 10 damage to all enemies. |
| Petal Picker | FIR_921 | Draw, discard and hand/deck movement | Battlecry: If you've Imbued your Hero Power twice, draw 2 cards. |
| Raza the Chained | CFM_020 | Lasting rules and game-wide replacements; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: If your deck has no duplicates, your Hero Power costs (0) this game. |
| Reckless Apprentice | BAR_544 |  | Battlecry: Fire your Hero Power at all enemies. |
| Resplendent Dreamweaver | EDR_860 | Damage, healing, Armor and board stats | Lifesteal Battlecry: If you've Imbued your Hero Power twice, deal 4 damage to a minion. |
| Saboteur | AT_086 | Delayed effects and start/end-of-turn triggers; Card costs, mana and ordinary discounts | Battlecry: Your opponent's Hero Power costs (5) more next turn. |
| Sideshow Spelleater | AT_098 | Copies, transformations, swaps and control | Battlecry: Copy your opponent's Hero Power. |
| Sir Finley Mrrgglton | LOE_076 | Discover and other player choices | Battlecry: Discover a new basic Hero Power. |
| Sir Finley of the Sands | ULD_500 | Discover and other player choices; Draw, discard and hand/deck movement | Battlecry: If your deck has no duplicates, Discover an upgraded Hero Power. |
| Spirit Gatherer | EDR_871 | Quests, Excavation and expansion objectives; Generated cards and named card pools | Battlecry: Get a Wisp. Imbue your Hero Power. |
| Spirit of the Kaldorei | FIR_777 | Damage, healing, Armor and board stats | Taunt, Lifesteal Battlecry: If you used your Hero Power this turn, gain +3/+3. |
| Tour Guide | SCH_312 | Card costs, mana and ordinary discounts | Battlecry: Your next Hero Power costs (0). |
| Vilefin Inquisitor | OG_006 | Summons, recruits and token definitions | Battlecry: Your Hero Power becomes 'Summon a 1/1 Murloc.' |
| Waterboy | TRL_407 | Card costs, mana and ordinary discounts | Battlecry: Your next Hero Power this turn costs (0). |
| Wisprider | EDR_519 | Quests, Excavation and expansion objectives | Battlecry: Imbue your Hero Power, then trigger it. |

<a id="secrets-counters"></a>

### Secrets, traps and Counter effects — 26

Implement hidden zones, trigger windows, ownership/privacy and Counter resolution.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Anonymous Informant | REV_841 | Card costs, mana and ordinary discounts | Battlecry: The next Secret you play costs (0). |
| Arcane Keysmith | GIL_116 | Discover and other player choices; Summons, recruits and token definitions | Battlecry: Discover a Secret. Put it into the battlefield. |
| Bellringer Sentry | GIL_634 | Deathrattles, resurrection and remembered victims; Summons, recruits and token definitions; Draw, discard and hand/deck movement | Battlecry and Deathrattle: Put a Secret from your deck into the battlefield. |
| Blademaster Okani | TSC_032 | Auras, listeners and ongoing board effects; Discover and other player choices | Battlecry: Secretly choose to Counter the next minion or spell your opponent plays while this is alive. |
| Cannonmaster Smythe | BAR_879 | Auras, listeners and ongoing board effects; Copies, transformations, swaps and control | Battlecry: Transform your Secrets into 3/3 Soldiers. They transform back when they die. |
| Chief Inspector | GIL_648 | Damage, healing, Armor and board stats | Battlecry: Destroy all enemy Secrets. |
| Eater of Secrets | OG_254 | Damage, healing, Armor and board stats | Battlecry: Destroy all enemy Secrets. Gain +1/+1 for each. |
| Faceless Enigma | TIME_860 | History, thresholds and scaling conditions; Discover and other player choices | Battlecry: Look at 2 random Secrets. Pick one to cast for yourself. The other casts for your opponent. |
| Ghastly Gravedigger | REV_959 | Discover and other player choices; Draw, discard and hand/deck movement | Battlecry: If you control a Secret, choose a card in your opponent's hand to shuffle into their deck. |
| Harmonica Soloist | ETC_028 | Automatic casting and replaying spells/Battlecries; History, thresholds and scaling conditions; Discover and other player choices | Battlecry: If you control no other minions, Discover and cast a Secret. |
| Horde Operative | BAR_430 | Copies, transformations, swaps and control | Battlecry: Copy your opponent's Secrets and put them into play. |
| Hydrologist | UNG_011 | Automatic casting and replaying spells/Battlecries; History, thresholds and scaling conditions; Discover and other player choices | Battlecry: Discover and cast a Secret. |
| Inconspicuous Rider | DMF_079 | Automatic casting and replaying spells/Battlecries; History, thresholds and scaling conditions; Draw, discard and hand/deck movement | Battlecry: Cast a Secret from your deck. |
| Kabal Lackey | CFM_066 | Card costs, mana and ordinary discounts | Battlecry: The next Secret you play this turn costs (1). |
| Kezan Mystic | GVG_074 | Copies, transformations, swaps and control | Battlecry: Take control of a random enemy Secret. |
| Kirin Tor Mage | EX1_612 | Card costs, mana and ordinary discounts | Battlecry: The next Secret you play this turn costs (0). |
| Masked Contender | TRL_530 | Automatic casting and replaying spells/Battlecries; History, thresholds and scaling conditions; Draw, discard and hand/deck movement | Battlecry: If you control a Secret, cast a Secret from your deck. |
| Mysterious Challenger | AT_079, WON_334 | Summons, recruits and token definitions; Draw, discard and hand/deck movement | Battlecry: Put one of each Secret from your deck into the battlefield. |
| Observer of Mysteries | TOY_520 | Automatic casting and replaying spells/Battlecries; Delayed effects and start/end-of-turn triggers; History, thresholds and scaling conditions; Damage, healing, Armor and board stats | Battlecry: Cast 2 random Secrets. At the start of your turn, destroy them. |
| Private Eye | REV_826 | Automatic casting and replaying spells/Battlecries; History, thresholds and scaling conditions; Draw, discard and hand/deck movement; Extra keywords and attached mechanics · Attached/action: Combo | Battlecry: Cast a Secret from your deck. Combo: Cast 2 instead. |
| Product 9 | MIS_914 | Automatic casting and replaying spells/Battlecries | Battlecry: Recast every friendly Secret that triggered this game. |
| Ram Tamer | AV_335 | Damage, healing, Armor and board stats | Battlecry: If you control a Secret, gain +1/+1 and Stealth. |
| Sayge, Seer of Darkmoon | DMF_109 | Draw, discard and hand/deck movement | Battlecry: Draw 1 card. (Upgraded for each friendly Secret that has triggered this game!) |
| SI:7 Infiltrator | EX1_186 | Damage, healing, Armor and board stats | Battlecry: Destroy a random enemy Secret. |
| Sparkjoy Cheat | YOP_016 | Automatic casting and replaying spells/Battlecries; History, thresholds and scaling conditions; Draw, discard and hand/deck movement | Battlecry: If you're holding a Secret, cast it and draw a card. |
| Tricksy Improviser | JAIL_321 | Automatic casting and replaying spells/Battlecries; History, thresholds and scaling conditions; Extra keywords and attached mechanics · Attached/action: Prepare | Prepare Battlecry: If you've cast a spell this turn, cast two random Mage Secrets. |

<a id="cast-when-drawn"></a>

### Cast-when-drawn cards and deck hazards — 30

Implement draw replacement and injected Bombs, Portals, Fragments, Curses and other self-casting tokens.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Amitut, Keeper of Amitus | BE_143 | History, thresholds and scaling conditions; Copies, transformations, swaps and control; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Taunt. Battlecry: For each Holy spell in your deck, shuffle in a copy with Cast when Drawn. |
| Ancient Shade | LOE_110 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Shuffle an 'Ancient Curse' into your deck that deals 7 damage to you when drawn. |
| Blastmaster Boom | DAL_064 | Summons, recruits and token definitions; Draw, discard and hand/deck movement | Battlecry: Summon two 1/1 Boom Bots for each Bomb in your opponent's deck. |
| Bolide Behemoth | GDB_434 | Lasting rules and game-wide replacements; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats; Extra keywords and attached mechanics · Attached/action: Spellburst | Battlecry: Your Asteroids deal 1 more damage this game. Spellburst: Shuffle 3 of them into your deck. |
| Boomboss Tho'grun | WW_372 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement | Battlecry: Shuffle 3 T.N.T. into your opponent's deck. When drawn, blow up a card in their hand, deck, and board. |
| Clockwork Goblin | DAL_060 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Shuffle a Bomb into your opponent's deck. When drawn, it explodes for 5 damage. |
| Fal'dorei Strider | LOOT_026 | History, thresholds and scaling conditions; Summons, recruits and token definitions; Draw, discard and hand/deck movement | Battlecry: Shuffle 3 Ambushes into your deck. When drawn, summon a 4/4 Spider. |
| Framester | MAW_005 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement | Battlecry: Shuffle 3 'Framed' cards into the opponent's deck. When drawn, they Overload for (2). |
| Helya | TTN_850 | Draw, discard and hand/deck movement | Battlecry: Shuffle all three Plagues into your opponent's deck. Plagues they draw this game are unending. |
| Iron Juggernaut | GVG_056, WON_114 | Deathrattles, resurrection and remembered victims; History, thresholds and scaling conditions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry and Deathrattle: Shuffle a Mine into your opponent's deck. When drawn, explode for 10 damage! |
| Luckysoul Hoarder | YOP_003 | Draw, discard and hand/deck movement; Extra keywords and attached mechanics · Attached/action: Corrupt | Battlecry: Shuffle 2 Soul Fragments into your deck. Corrupt: Draw a card. |
| Mankrik | BAR_721 | Draw, discard and hand/deck movement | Battlecry: Help Mankrik find his wife! She was last seen somewhere in your deck. |
| Moonstone Mauler | GDB_435 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Shuffle 3 Asteroids into your deck that deal 2 damage to a random enemy when drawn. |
| Patches the Pilot | VAC_933 | History, thresholds and scaling conditions; Summons, recruits and token definitions; Draw, discard and hand/deck movement | Battlecry: Shuffle six Parachutes into your deck that summon a 1/1 Pirate with Charge when drawn. |
| Portal Keeper | DAL_582 | History, thresholds and scaling conditions; Summons, recruits and token definitions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Shuffle 3 Portals into your deck. When drawn, summon a 2/2 Demon with Rush. |
| Portal Overfiend | DAL_565 | History, thresholds and scaling conditions; Summons, recruits and token definitions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Shuffle 3 Portals into your deck. When drawn, summon a 2/2 Demon with Rush. |
| Seaforium Bomber | BOT_511 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Shuffle a Bomb into your opponent's deck. When drawn, it explodes for 5 damage. |
| Shadowlight Scholar | SCH_517 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Destroy a Soul Fragment in your deck to deal 3 damage. |
| Shardshatter Mystic | SCH_355 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Destroy a Soul Fragment in your deck to deal 3 damage to all other minions. |
| Sheldras Moontree | SW_447 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement | Battlecry: The next 3 spells you draw are Cast When Drawn. |
| Son of Hodir | TTN_083 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement | Battlecry: Shuffle four 8/8 Giants into your deck that are summoned when drawn. |
| Soulciologist Malicia | SCH_703 | Summons, recruits and token definitions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: For each Soul Fragment in your deck, summon a 3/3 Soul with Rush. |
| Soulshard Lapidary | SCH_704 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Destroy a Soul Fragment in your deck to give your hero +5 Attack this turn. |
| Spirit Jailer | SCH_700 | Draw, discard and hand/deck movement | Battlecry: Shuffle 2 Soul Fragments into your deck. |
| Surfalopod | VAC_443 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement | Battlecry: The next spell you draw is Cast When Drawn. |
| The Darkness | LOOT_526 | Dormant, locations and board-state systems; History, thresholds and scaling conditions; Draw, discard and hand/deck movement | Starts Dormant. Battlecry: Shuffle 3 Candles into the enemy deck. When drawn, this awakens. |
| Twilight Timehopper | TIME_025 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Shuffle 2 Shreds of Time into your deck. When drawn, deal 3 damage to your hero. |
| Ultraviolet Breaker | GDB_901 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Deal 3 damage to an enemy minion. Shuffle 3 Asteroids into your deck. |
| Void Drinker | SCH_343 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Taunt. Battlecry: Destroy a Soul Fragment in your deck to gain +3/+3. |
| Ysera, Unleashed | DRG_320 | History, thresholds and scaling conditions; Summons, recruits and token definitions; Draw, discard and hand/deck movement | Battlecry: Shuffle 7 Dream Portals into your deck. When drawn, summon a random Dragon. |

<a id="corpses-runes"></a>

### Corpses and Death Knight rune resources — 19

Track Corpse creation/spending and rune-dependent card behavior.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Bloodfiend | BE_283 | Damage, healing, Armor and board stats | Battlecry: Spend up to 4 Corpses. Deal 1 damage to all other minions for each. |
| Body Bagger | RLK_503 |  | Battlecry: Gain a Corpse. |
| Bonedigger Geist | LEG_RLK_753 | Damage, healing, Armor and board stats | Battlecry: Spend a Corpse to gain +1/+2. |
| Boneguard Commander | CORE_RLK_506, RLK_506 | Damage, healing, Armor and board stats | Taunt Battlecry: Raise up to 6 Corpses as 1/3 Risen Footmen with Taunt. |
| Boneshredder | ETC_428 | Deathrattles, resurrection and remembered victims | Battlecry: Spend 5 Corpses to trigger and gain the Deathrattle of a random friendly minion that died this game. |
| Corpse Bride | RLK_504 | Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: Spend up to 10 Corpses to summon a Risen Groom with Taunt and that much Attack and Health. |
| Darkfallen Neophyte | RLK_731 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Spend 2 Corpses to give all minions in your hand +2 Attack. |
| Eulogizer | TTN_457 | Damage, healing, Armor and board stats; Extra keywords and attached mechanics · Attached/action: Forge | Battlecry: Spend 3 Corpses to deal 3 damage. Forge: Gain them instead. |
| Falric | CORE_EDR_003 | Draw, discard and hand/deck movement; Auras, listeners and ongoing board effects | You gain twice as many Corpses as normal. Battlecry: Draw a card that spends Corpses. |
| G'huun | BE_287 | History, thresholds and scaling conditions; Copies, transformations, swaps and control; Damage, healing, Armor and board stats | Battlecry: Steal 6 Health split among the lowest Health enemies. Improved by Blood Runes you've played. |
| Hematurge | CORE_RLK_066, RLK_066 | Discover and other player choices | Battlecry: Spend a Corpse to Discover a Blood Rune card.~GAMEPLAY ASPROXY CORE RLK 066 / Battlecry: Spend a Corpse to Discover a Blood Rune card.~GAMEPLAY ASPROXY RLK 066 |
| Husk, Eternal Reaper | TIME_618 | Deathrattles, resurrection and remembered victims; Damage, healing, Armor and board stats | Battlecry: Give your hero "Deathrattle: Spend up to 20 Corpses to resurrect with that much Health." |
| Lord Marrowgar | LEG_RLK_085 | Damage, healing, Armor and board stats | Battlecry: Raise ALL of your Corpses as 1/1 Risen Golems with Rush. For each that can't fit, give one +2/+2. |
| Marrow Manipulator | CORE_RLK_505, RLK_505 | Damage, healing, Armor and board stats | Battlecry: Spend up to 5 Corpses. Deal 2 damage to a random enemy for each. |
| Meat Grinder | RLK_120 | Draw, discard and hand/deck movement | Battlecry: Shred a random minion in your deck to gain 4 Corpses. |
| Necrotic Mortician | CORE_RLK_116, RLK_116 | Deathrattles, resurrection and remembered victims; History, thresholds and scaling conditions; Discover and other player choices | Battlecry: If a friendly Undead died after your last turn, Discover an Unholy Rune card. |
| Shambling Zombietank | TOY_827 | Copies, transformations, swaps and control; Summons, recruits and token definitions; Damage, healing, Armor and board stats | Taunt Battlecry: Spend 5 Corpses to summon a copy of this. |
| Soulstealer | RLK_741 | Damage, healing, Armor and board stats | Battlecry: Destroy all other minions. Gain 1 Corpse for each enemy destroyed. |
| Volcoross | FIR_951 | Discover and other player choices; Damage, healing, Armor and board stats | Rush, Taunt Battlecry: Choose to spend 10, 20, or 30 Corpses to gain that many stats. |

<a id="alternate-payments"></a>

### Health/Armor costs and alternate payment rules — 10

Extend payment validation, spending order, duration, safety and reductions when cards cost something other than mana.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Agamaggan | EDR_489 | Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Battlecry: The next card you play costs your OPPONENT'S Health instead of Mana (up to 10). |
| Anub'Rekhan | RLK_659 | Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Battlecry: Gain 5 Armor. Your next 3 minions this turn cost Armor instead of Mana. |
| Blood Crusader | RLK_927 | Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Battlecry: Your next Paladin minion this turn costs Health instead of Mana. |
| Bloodscent Vilefin | TSC_753 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Dredge. If it's a Murloc, change its Cost to Health instead of Mana. |
| Cho'gall | OG_121, WON_105 | History, thresholds and scaling conditions; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Return all cards you discarded this game to your hand. They cost Health instead of Mana. |
| Commander Ulthok | TID_719 | Delayed effects and start/end-of-turn triggers; Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Battlecry: Your opponent's cards cost Health instead of Mana next turn. |
| Exarch Maladaar | GDB_470 | Corpses and Death Knight rune resources; Card costs, mana and ordinary discounts | Battlecry: The next card you play this turn costs Corpses instead of Mana. |
| G'huun the Blood God | DMF_056 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Draw 2 cards. They cost Health instead of Mana. |
| Seadevil Stinger | CFM_699 | Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Battlecry: The next Murloc you play this turn costs Health instead of Mana. |
| War'loc | CATA_180 | Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Battlecry: Your next Murloc that costs (3) or less costs Health instead of Mana. |

<a id="named-progression"></a>

### Named progression families — 31

Shared progression for C’Thun, Jade Golems, Galakrond, Librams, Relics, curses and other named families; each family is separately tagged.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Aldor Attendant | BT_020 | Lasting rules and game-wide replacements; Card costs, mana and ordinary discounts | Battlecry: Reduce the Cost of your Librams by (1) this game. |
| Aldor Truthseeker | BT_026 | Lasting rules and game-wide replacements; Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Taunt. Battlecry: Reduce the Cost of your Librams by (2) this game. |
| Ancient Shieldbearer | OG_301, WON_111 | Damage, healing, Armor and board stats | Battlecry: If your C'Thun has at least 10 Attack, gain 10 Armor. |
| Artificer Xy'mox | REV_937 | Automatic casting and replaying spells/Battlecries; History, thresholds and scaling conditions; Discover and other player choices; Extra keywords and attached mechanics · Attached/action: Infuse | Battlecry: Discover and cast a Relic. Infuse (5): Cast all three instead. |
| Aya Blackpaw | CFM_902, WON_136 | Deathrattles, resurrection and remembered victims; Summons, recruits and token definitions | Battlecry and Deathrattle: Summon a{1} {0} Jade Golem. |
| Beckoner of Evil | OG_281 | Damage, healing, Armor and board stats | Battlecry: Give your C'Thun +2/+2 (wherever it is). |
| Blade of C'Thun | OG_282, WON_075 | Generated cards and named card pools; Damage, healing, Armor and board stats | Battlecry: Destroy a minion. Add its Attack and Health to your C'Thun's (wherever it is). |
| C'Thun's Chosen | OG_283, WON_125 | Damage, healing, Armor and board stats | Divine Shield Battlecry: Give your C'Thun +3/+3 (wherever it is). |
| Dark Arakkoa | OG_293, WON_304 | Damage, healing, Armor and board stats | Taunt Battlecry: Give your C'Thun +4/+4 (wherever it is). |
| Dark Deacon | BE_012 | History, thresholds and scaling conditions; Discover and other player choices | Battlecry: If you've cast 2 Shadow spells while holding this, choose a C'Thun ability to trigger. ({0} left!) |
| Disciple of C'Thun | OG_162, WON_127 | Damage, healing, Armor and board stats | Battlecry: Deal 2 damage. Give your C'Thun +2/+2 (wherever it is). |
| Doomcaller | OG_255 | Deathrattles, resurrection and remembered victims; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Give your C'Thun +2/+2 (wherever it is). If it's dead, shuffle it into your deck. |
| Gargantuan Slitherer | BE_204 | Discover and other player choices; Damage, healing, Armor and board stats | Taunt Battlecry: Choose a C'Thun ability to trigger. |
| Interstellar Researcher | GDB_728 | Draw, discard and hand/deck movement; Extra keywords and attached mechanics · Attached/action: Spellburst | Battlecry and Spellburst: Draw a Libram. |
| Interstellar Wayfarer | GDB_721 | Lasting rules and game-wide replacements; Deathrattles, resurrection and remembered victims; Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Divine Shield. Battlecry and Deathrattle: Reduce the Cost of your Librams by (1) this game. |
| Jade Behemoth | CFM_343, WON_303 | Summons, recruits and token definitions; Damage, healing, Armor and board stats | Taunt Battlecry: Summon a{1} {0} Jade Golem. |
| Jade Chieftain | CFM_312, WON_084 | Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: Summon a{1} {0} Jade Golem. Give it Taunt. |
| Jade Spirit | CFM_715, WON_118 | Summons, recruits and token definitions | Battlecry: Summon a{1} {0} Jade Golem. |
| Klaxxi Amber-Weaver | OG_188, WON_010 | Damage, healing, Armor and board stats | Taunt Battlecry: If your C'Thun has at least 10 Attack, gain +5 Health. |
| Kronx Dragonhoof | DRG_099 | Draw, discard and hand/deck movement | Battlecry: Draw Galakrond. If you're already Galakrond, unleash a Devastation. |
| Ley Walker | MEND_501 | Lasting rules and game-wide replacements; Deathrattles, resurrection and remembered victims; Card costs, mana and ordinary discounts; Generated cards and named card pools | Battlecry: Your Leylines cost (1) less this game. Deathrattle: Get a random Leyline. |
| Mystic Runesaber | MEND_506 | Damage, healing, Armor and board stats; Extra keywords and attached mechanics · Attached/action: Elusive | Elusive Battlecry: Increase the effects of your Leylines by 1 this game. |
| Queen Azshara | TSC_641 | History, thresholds and scaling conditions; Discover and other player choices | Battlecry: If you've cast three spells while holding this, choose an Ancient Relic. |
| Sira'kess Cultist | TSC_955 |  | Battlecry: Give your opponent an Abyssal Curse. |
| Skeram Cultist | OG_339 | Damage, healing, Armor and board stats | Battlecry: Give your C'Thun +2/+2 (wherever it is). |
| Spawn of C'Thun | BE_014 | Draw, discard and hand/deck movement · References: Choose One | Battlecry: If C'Thun started in your deck, choose one of its abilities to trigger. |
| Surge Needle | MEND_503 |  | Battlecry: Your Leylines trigger an additional time this game. |
| Twilight Darkmender | OG_096 | Damage, healing, Armor and board stats | Battlecry: If your C'Thun has at least 10 Attack, restore 10 Health to your hero. |
| Twilight Geomancer | OG_284, WON_124 | Damage, healing, Armor and board stats | Taunt Battlecry: Give your C'Thun +1/+1 and Taunt (wherever it is). |
| Twin Emperor Vek'lor | OG_131, WON_134 | Summons, recruits and token definitions; Damage, healing, Armor and board stats | Taunt Battlecry: If your C'Thun has at least 10 Attack, summon another Emperor. |
| Za'qul | TSC_959 | Damage, healing, Armor and board stats; Auras, listeners and ongoing board effects | Your Abyssal Curses heal you for the damage they deal. Battlecry: Give your opponent an Abyssal Curse. |

<a id="quests-upgrades"></a>

### Quests, Excavation and expansion objectives — 35

Implement objective counters, reward pools and action systems such as Excavate, Herald, Imbue and Ritual.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Antique Flinger | WW_413 | Damage, healing, Armor and board stats | Battlecry: If you've Excavated twice, destroy an enemy minion. |
| Armored Bloodletter | CATA_525 | Damage, healing, Armor and board stats | Rush Battlecry: Herald {0}. |
| Badlands Brawler | WW_349 |  | Battlecry: Start a Brawl! If you've Excavated twice, this always wins. |
| Blastmage Miner | WW_426 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Battlecry: Excavate a treasure. For each card in your hand, deal 1 damage to a random enemy. |
| Burrow Buster | WW_002 | Damage, healing, Armor and board stats | Rush Battlecry: Excavate a treasure. |
| Corrupt Elementalist | DRG_218 | Named progression families | Battlecry: Invoke Galakrond twice. |
| Devoted Maniac | DRG_050 | Named progression families; Damage, healing, Armor and board stats | Rush Battlecry: Invoke Galakrond. |
| Disciple of Galakrond | DRG_303 | Named progression families | Battlecry: Invoke Galakrond. |
| Dragonblight Cultist | DRG_202 | Named progression families; Damage, healing, Armor and board stats | Battlecry: Invoke Galakrond. Gain +1 Attack for each other friendly minion. |
| Drilly the Kid | WW_417 | Deathrattles, resurrection and remembered victims; Extra keywords and attached mechanics · Attached/action: Quickdraw | Battlecry, Quickdraw, and Deathrattle: Excavate a treasure. |
| Entrapped Sorceress | SW_400 | Discover and other player choices | Battlecry: If you control a Quest, Discover a spell. |
| Envoy of the End | CATA_722 | Damage, healing, Armor and board stats | Taunt Battlecry: Herald {0}. |
| Fate Weaver | DRG_300 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: If you've Invoked twice, reduce the Cost of cards in your hand by (1). |
| Fossilized Kaleidosaur | DEEP_033 | Extra keywords and attached mechanics · Attached/action: Adapt / bonus effects | Battlecry: Gain two random Bonus Effects. Excavate a treasure. |
| Harrowing Ox | WW_356 | Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Taunt Battlecry: If you've Excavated twice, your next card this turn costs (7) less. |
| Kith'ix | BE_090 | Discover and other player choices | Battlecry: If you've completed a Ritual this game, choose a Sinister Ritual to begin. |
| Kobold Miner | WW_001 |  | Battlecry: Excavate a treasure. |
| Licensed Adventurer | YOD_030 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: If you control a Quest, add a Coin to your hand. |
| Obsessive Technician | CATA_780 | Damage, healing, Armor and board stats | Lifesteal Battlecry: Herald {0}. |
| Questing Assistant | TLC_987 | History, thresholds and scaling conditions; Damage, healing, Armor and board stats | Battlecry: If you played a Quest this game, deal 3 damage to an enemy minion. |
| Questing Explorer | ULD_157 | Draw, discard and hand/deck movement | Battlecry: If you control a Quest, draw a card. |
| Reliquary Researcher | WW_432 | Secrets, traps and Counter effects; Automatic casting and replaying spells/Battlecries; History, thresholds and scaling conditions | Battlecry: If you've Excavated twice, cast two random Mage Secrets. |
| Scion of Ruin | DRG_019 | Copies, transformations, swaps and control; Summons, recruits and token definitions; Damage, healing, Armor and board stats | Rush. Battlecry: If you've Invoked twice, summon 2 copies of this. |
| Scorching Ravager | CATA_160 | Damage, healing, Armor and board stats | Battlecry: Herald {0}. Give the Soldier Rush. |
| Shadowsworn Disciple | CATA_725 | Deathrattles, resurrection and remembered victims; Damage, healing, Armor and board stats | Battlecry: Herald {0}. Deathrattle: Restore 3 Health to your hero. |
| Shield of Galakrond | DRG_242 | Named progression families; Damage, healing, Armor and board stats | Taunt Battlecry: Invoke Galakrond. |
| Sir Finley, the Intrepid | DEEP_007 | Copies, transformations, swaps and control | Battlecry: If you've Excavated twice, transform all enemy minions into 1/1 Murlocs. |
| Skeleton Crew | WW_322 | Card costs, mana and ordinary discounts | Battlecry: Excavate a treasure. It costs (0). |
| Sky Gen'ral Kragg | YOD_038 | History, thresholds and scaling conditions; Summons, recruits and token definitions; Damage, healing, Armor and board stats | Taunt Battlecry: If you've played a Quest this game, summon a 4/2 Parrot with Rush. |
| Skywall Sentinel | CATA_565 | Damage, healing, Armor and board stats | Taunt Battlecry: Herald {0}. |
| Tram Conductor Gerry | WW_437 | Summons, recruits and token definitions; Damage, healing, Armor and board stats | Battlecry: If you've Excavated twice, summon six 3/3 Tram Cars with Rush. |
| Treasure Hunter Eudora | VAC_464 | Discover and other player choices | Battlecry: Go on a Sidequest to Discover amazing loot! Play 3 cards from other classes to complete it. |
| Ultraxion | CATA_497 | Named progression families; Card costs, mana and ordinary discounts | Battlecry: Herald {0}. Reduce Deathwing's Cost by ({1}). (Herald to improve!) |
| Umbral Skulker | DRG_027 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: If you've Invoked twice, add 3 Coins to your hand. |
| Veiled Worshipper | DRG_203 | Draw, discard and hand/deck movement | Battlecry: If you've Invoked twice, draw 3 cards. |

<a id="keyword-packages"></a>

### Extra keywords and attached mechanics — 121

A simple Battlecry is still blocked when the same printing also needs Tradeable, Combo, Rewind, Infuse, Forge or another unsupported mechanic. See exact keyword tags.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Ace Wayfinder | GDB_450 |  · Attached/action: Adapt / bonus effects | Battlecry: Gain two random Bonus Effects. The next Draenei you play gains them as well. |
| Aeon Wizard | TIME_002 | Generated cards and named card pools · Attached/action: Rewind | Rewind Battlecry: Get 2 random spells from your class. |
| Aggramar, the Avenger | TTN_092 | Weapons, forced attacks and combat restrictions · Attached/action: Titan | Titan Battlecry: Equip a 3/3 Taeshalach. |
| Aqir Goliath | BE_721 | History, thresholds and scaling conditions; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement; Auras, listeners and ongoing board effects · Attached/action: Combo | Costs (2) less for each Combo card played this turn. Battlecry: Draw a card. |
| Astalor Bloodsworn | RLK_222 | Generated cards and named card pools; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats · Attached/action: Manathirst | Battlecry: Add Astalor, the Protector to your hand. Manathirst (5): Deal 2 damage. |
| Azerite Chain Gang | WW_360 | Copies, transformations, swaps and control; Summons, recruits and token definitions; Damage, healing, Armor and board stats · Attached/action: Quickdraw | Taunt Battlecry and Quickdraw: Summon a copy of this. |
| Benevolent Banker | WW_384 | Discover and other player choices; Draw, discard and hand/deck movement · Attached/action: Quickdraw | Battlecry: Discover a spell from your deck. Quickdraw: Enemy deck instead. |
| Big Game Hunter | CORE_EX1_005, EX1_005 | Damage, healing, Armor and board stats · Attached/action: Tradeable | Tradeable Battlecry: Destroy a minion with 7 or more Attack. |
| Brutish Endmaw | END_013 | Discover and other player choices; Card costs, mana and ordinary discounts · Attached/action: Adapt / bonus effects | Battlecry: Discover a 1-Cost minion with a Dark Gift. |
| Buffet Biggun | REV_958 | Summons, recruits and token definitions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats · Attached/action: Infuse | Battlecry: Summon two Silver Hand Recruits. Infuse (3): Give them +2 Attack and Divine Shield. |
| Buttons | VAC_437 | Draw, discard and hand/deck movement · Attached/action: Tourist | Shaman Tourist Battlecry: Draw a spell of each spell school. |
| Bygone Doomspeaker | TIME_008 | Draw, discard and hand/deck movement · Attached/action: Rewind | Rewind Battlecry: Both players discard a random card. |
| Carnival Clown | DMF_163 | Copies, transformations, swaps and control; Summons, recruits and token definitions; Damage, healing, Armor and board stats · Attached/action: Corrupt | Taunt Battlecry: Summon 2 copies of this. Corrupt: Fill your board with copies. |
| Chillin' Vol'jin | VAC_957 | Discover and other player choices; Copies, transformations, swaps and control; Damage, healing, Armor and board stats · Attached/action: Tourist | Hunter Tourist Battlecry: Choose 2 minions. Swap their stats. |
| Ci'Cigi | TOY_913 | Deathrattles, resurrection and remembered victims; Generated cards and named card pools · Attached/action: Outcast | Battlecry, Outcast, and Deathrattle: Get a random first-edition Demon Hunter card (in mint condition). |
| Circus Medic | DMF_174 | Damage, healing, Armor and board stats · Attached/action: Corrupt | Battlecry: Restore 4 Health. Corrupt: Deal 4 damage instead. |
| Commissary Crook | CATA_EVENT_400 | Card costs, mana and ordinary discounts; Summons, recruits and token definitions · Attached/action: Prepare | Prepare Battlecry: Spend all your Mana. Summon a random minion of that Cost. |
| Confessor Paletress | AT_018, WON_063 | Summons, recruits and token definitions · Attached/action: Inspire | Battlecry and Inspire: Summon a random Legendary minion. |
| Conflux Crasher | TIME_004 | Damage, healing, Armor and board stats · Attached/action: Rewind | Rewind Battlecry: Deal 7 damage to a random enemy. |
| Coroner | RLK_951 | Damage, healing, Armor and board stats · Attached/action: Manathirst | Battlecry: Freeze an enemy minion. Manathirst (6): Silence it first. |
| Costume Merchant | DINO_427 | Card costs, mana and ordinary discounts; Generated cards and named card pools · Attached/action: Combo | Battlecry: Get a random Mask from another class. Combo: It costs (2) less. |
| Crackling Razormaw | UNG_915 |  · Attached/action: Adapt / bonus effects | Battlecry: Adapt a friendly Beast. |
| Creature of Madness | EDR_105 | Discover and other player choices; Card costs, mana and ordinary discounts · Attached/action: Adapt / bonus effects | Battlecry: Discover a 3-Cost minion with a Dark Gift. |
| Crystal Tender | TLC_255 | Card costs, mana and ordinary discounts · Attached/action: Tradeable | Tradeable Battlecry: Gain empty Mana Crystals until both players have the same Mana. |
| Darkrider | EDR_456 | Discover and other player choices · Attached/action: Adapt / bonus effects | Battlecry: If you're holding a Dragon, Discover a Dragon with a Dark Gift. |
| Defias Smuggler | JAIL_998 | Damage, healing, Armor and board stats · Attached/action: Prepare | Prepare. Battlecry: Give a friendly minion +2 Attack and Rush. |
| Disciple of Sargeras | TTN_490 | Summons, recruits and token definitions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats · Attached/action: Forge | Battlecry: Discard a spell to summon two 3/2 Imps. Forge: Give them +2 Health and Taunt. |
| Dragon Turtle | FIR_956 | Damage, healing, Armor and board stats · Attached/action: Adapt / bonus effects | Battlecry: If you're holding a minion with a Dark Gift, give your hero +3 Attack this turn and 6 Armor. |
| Elder Longneck | UNG_109 | Damage, healing, Armor and board stats · Attached/action: Adapt / bonus effects | Battlecry: If you're holding a minion with 5 or more Attack, Adapt. |
| Epoch Stalker | TIME_605 | Copies, transformations, swaps and control; Summons, recruits and token definitions; Damage, healing, Armor and board stats · Attached/action: Elusive | Rush, Elusive Battlecry: Summon a copy of this. |
| Face Collector | GIL_677 | Generated cards and named card pools; Draw, discard and hand/deck movement · Attached/action: Echo | Echo Battlecry: Add a random Legendary minion to your hand. |
| Famished Fool | REV_019 | Draw, discard and hand/deck movement · Attached/action: Infuse | Battlecry: Draw a card. Infuse (4): Draw 3 instead. |
| Farm Hand | WW_358 | Discover and other player choices; Card costs, mana and ordinary discounts · Attached/action: Quickdraw | Battlecry: Discover an Undead. Quickdraw: It costs (2) less. |
| Firework Elemental | DMF_101 | Damage, healing, Armor and board stats · Attached/action: Corrupt | Battlecry: Deal 3 damage to a minion. Corrupt: Deal 12 instead. |
| Frostburn Matriarch | FIR_901 | Summons, recruits and token definitions; Damage, healing, Armor and board stats · Attached/action: Adapt / bonus effects | Battlecry: If you're holding a minion with a Dark Gift, summon two 4/4 Dragons with Taunt. |
| Garona Halforcen | TIME_875 | Damage, healing, Armor and board stats · Attached/action: Fabled | Fabled. Battlecry: If your opponent is holding King Llane, destroy him and cut their Health in half. |
| Gelbin of Tomorrow | TIME_009 | Summons, recruits and token definitions; Draw, discard and hand/deck movement · Attached/action: Fabled | Fabled Battlecry: Put one of each Aura from your deck into the battlefield. |
| Gentle Megasaur | UNG_089 |  · Attached/action: Adapt / bonus effects | Battlecry: Adapt your Murlocs. |
| Heartbreaker Hedanis | ETC_334 | Damage, healing, Armor and board stats · Attached/action: Overheal | Battlecry: Deal 4 damage to this minion. Overheal: Deal 5 damage to a random enemy. |
| Hijacked Securitybot | JAIL_457 | Damage, healing, Armor and board stats · Attached/action: Prepare | Prepare Battlecry: Give your other minions +1/+1. |
| Hollow Abomination | AV_313 | Damage, healing, Armor and board stats · Attached/action: Honorable Kill | Battlecry: Deal 1 damage to all enemy minions. Honorable Kill: Gain the minion's Attack. |
| Horseshoe Slinger | WW_900 | Damage, healing, Armor and board stats · Attached/action: Quickdraw | Battlecry: Deal 2 damage to a random enemy minion. Quickdraw: And one of its neighbors. |
| Hostile Invader | GDB_226 | Deathrattles, resurrection and remembered victims; Damage, healing, Armor and board stats · Attached/action: Spellburst | Battlecry, Spellburst, and Deathrattle: Deal 2 damage to all other minions. |
| Huntsman Altimor | REV_353 | Summons, recruits and token definitions · Attached/action: Infuse | Battlecry: Summon a Gargon Companion. Infuse ({0}): Summon another. Infuse ({1}): And another! |
| Imp King Rafaam | REV_835 | Deathrattles, resurrection and remembered victims; Damage, healing, Armor and board stats · Attached/action: Infuse | Battlecry: Resurrect four friendly Imps. Infuse (5): Give your Imps +2/+2. |
| Injured Hauler | WW_381 | Damage, healing, Armor and board stats · Attached/action: Overheal | Battlecry: Deal 4 damage to this minion. Overheal: Deal 2 damage to all enemy minions. |
| Insatiable Devourer | REV_017 | Damage, healing, Armor and board stats · Attached/action: Infuse | Battlecry: Devour an enemy minion and gain its stats. Infuse (5): And its neighbors. |
| Keywarden Ivory | YOP_018 | Discover and other player choices; Copies, transformations, swaps and control; Generated cards and named card pools · Attached/action: Spellburst | Battlecry: Discover a Dual Class spell from any class. Spellburst: Get another copy. |
| Knight of the Dead | NX2_021 | Damage, healing, Armor and board stats · Attached/action: Manathirst | Battlecry: Deal 5 damage to your hero. Manathirst (7): Restore 5 Health to your hero instead. |
| Knight-Captain | AV_131 | Damage, healing, Armor and board stats · Attached/action: Honorable Kill | Battlecry: Deal 3 damage. Honorable Kill: Gain +3/+3. |
| Kurtrus Ashfallen | BAR_333 | Weapons, forced attacks and combat restrictions; Damage, healing, Armor and board stats · Attached/action: Outcast | Battlecry: Attack the left and right-most enemy minions. Outcast: Immune this turn. |
| Lightfused Stegodon | UNG_962 | Draw, discard and hand/deck movement · Attached/action: Adapt / bonus effects | Battlecry: Adapt your Silver Hand Recruits. |
| Living Paradox | TIME_059 | Summons, recruits and token definitions; Damage, healing, Armor and board stats · Attached/action: Elusive | Elusive Battlecry: Summon two 2/1 Living Paradoxes with Elusive. |
| Maestra, Mask Merchant | VAC_336 | Discover and other player choices · Attached/action: Tourist | Warlock Tourist Battlecry: Discover a Hero card from the past (from another class). |
| Mechagnome Guide | TTN_076 | Discover and other player choices; Card costs, mana and ordinary discounts · Attached/action: Forge | Battlecry: Discover a spell. Forge: It costs (3) less. |
| Medivh the Hallowed | TIME_890 | Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats; Auras, listeners and ongoing board effects · Attached/action: Fabled | Fabled. Costs (0) if you control Karazhan. Battlecry: Silence and destroy all other minions. |
| Mischievous Imp | REV_244 | Copies, transformations, swaps and control; Summons, recruits and token definitions · Attached/action: Infuse | Battlecry: Summon a copy of this. Infuse (3): Summon two copies instead. |
| Mister Clocksworth | TIME_038 | Summons, recruits and token definitions · Attached/action: Rewind | Rewind, Rewind, Rewind Battlecry: Summon 2 random Legendary minions. |
| Muradin, High King | TIME_209 | Deathrattles, resurrection and remembered victims; Generated cards and named card pools; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats · Attached/action: Fabled | Fabled, Rush. Battlecry: Bring the High King's Hammer to ME! Deathrattle: Add it to your hand. |
| Murloc Growfin | MIS_307 | Summons, recruits and token definitions; Damage, healing, Armor and board stats · Attached/action: Miniaturize / Gigantify | Gigantify Battlecry: Summon a Tinyfin with Rush and stats equal to this minion's. |
| Muscle-o-Tron | YOG_525 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats · Attached/action: Forge | Battlecry: Give all minions in your hand +1/+1. Forge: +2/+2 instead. |
| Neferset Weaponsmith | TLC_516 | Weapons, forced attacks and combat restrictions; Generated cards and named card pools; Damage, healing, Armor and board stats · Attached/action: Combo | Battlecry: Get a random weapon from another class. Combo: Give it +2 Attack. |
| Nostalgic Clown | TOY_341 | History, thresholds and scaling conditions; Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats · Attached/action: Miniaturize / Gigantify | Miniaturize Battlecry: If you've played a higher Cost card while holding this, deal 4 damage. |
| Ornery Direhorn | UNG_925 | Damage, healing, Armor and board stats · Attached/action: Adapt / bonus effects | Taunt Battlecry: Adapt. |
| Painted Canvasaur | TOY_350 |  · Attached/action: Adapt / bonus effects | Battlecry: Give each other friendly Beast a random Bonus Effect. |
| Pen Flinger | SCH_248 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats · Attached/action: Spellburst | Battlecry: Deal 1 damage to a minion. Spellburst: Return this to your hand. |
| Pit Master | DMF_703 | Summons, recruits and token definitions · Attached/action: Corrupt | Battlecry: Summon a 3/2 Duelist. Corrupt: Summon two. |
| Portal Vanguard | TIME_003 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats · Attached/action: Rewind | Rewind Battlecry: Draw a random minion. Give it +2/+2. |
| Portalmancer Skyla | WORK_063 | Copies, transformations, swaps and control; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement · Attached/action: Tourist | Rogue Tourist Battlecry: Swap the Costs of the lowest and highest Cost spells in your hand. |
| Primalfin Challenger | TLC_251 |  · References: Kindred | Battlecry: Your next Kindred triggers twice. |
| Pterrordax Hatchling | UNG_001 |  · Attached/action: Adapt / bonus effects | Battlecry: Adapt. |
| Rampaging Hound | JAIL_435 | Damage, healing, Armor and board stats · Attached/action: Prepare | Prepare Battlecry: Force all enemy minions to attack this. |
| Ranger General Sylvanas | TIME_609 | History, thresholds and scaling conditions; Damage, healing, Armor and board stats · Attached/action: Fabled | Fabled. Battlecry: Deal 2 damage to all enemies. If you've played Alleria or Vereesa, repeat for each. |
| Raptor Herald | CORE_EDR_004, CORE_EDR_004_2026 | Discover and other player choices; Card costs, mana and ordinary discounts · Attached/action: Adapt / bonus effects, Rewind · References: Kindred | Rewind Battlecry: Discover a Beast with a Dark Gift. Kindred: It costs (1) less. |
| Ravasaur Runt | UNG_009 |  · Attached/action: Adapt / bonus effects | Battlecry: If you control at least 2 other minions, Adapt. |
| Ravenous Pterrordax | UNG_047 | Damage, healing, Armor and board stats · Attached/action: Adapt / bonus effects | Battlecry: Destroy a friendly minion to Adapt twice. |
| Royal Librarian | CORE_SW_066, SW_066 | Damage, healing, Armor and board stats · Attached/action: Tradeable | Tradeable Battlecry: Silence a minion. |
| Rustrot Viper | CORE_SW_072, SW_072 | Weapons, forced attacks and combat restrictions; Damage, healing, Armor and board stats · Attached/action: Tradeable | Tradeable Battlecry: Destroy your opponent's weapon. |
| Sand Art Elemental | TOY_513 | Damage, healing, Armor and board stats · Attached/action: Miniaturize / Gigantify | Miniaturize Battlecry: Give your hero +1 Attack and Windfury this turn. |
| Sandbox Scoundrel | TOY_521 | Card costs, mana and ordinary discounts · Attached/action: Miniaturize / Gigantify | Miniaturize Battlecry: Your next card this turn costs (2) less. |
| Sargeras, the Destroyer | TTN_960 | Delayed effects and start/end-of-turn triggers · Attached/action: Titan | Titan Battlecry: Open a portal that summons two 3/2 Imps each turn. |
| Sawbones | JAIL_444 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats · Attached/action: Prepare | Prepare. Battlecry: Destroy all your other minions. Draw a card and refresh a Mana for each one destroyed. |
| Sewer Swimmer | JAIL_395 | Deathrattles, resurrection and remembered victims · Attached/action: Prepare | Prepare Battlecry: Trigger a friendly minion's Deathrattle. |
| Shadowflame Stalker | FIR_924 | Discover and other player choices; Copies, transformations, swaps and control; Generated cards and named card pools · Attached/action: Adapt / bonus effects | Battlecry: Discover a Demon with a Dark Gift. Get a copy of it. |
| Shady Bartender | SW_086 | Damage, healing, Armor and board stats · Attached/action: Tradeable | Tradeable Battlecry: Give your Demons +2/+2. |
| Shining Sentinel | TOY_503 | Copies, transformations, swaps and control; Summons, recruits and token definitions; Damage, healing, Armor and board stats · Attached/action: Elusive | Taunt, Elusive Battlecry: Summon a copy of this. |
| Shudderblock | TOY_501 | Damage, healing, Armor and board stats · Attached/action: Miniaturize / Gigantify | Miniaturize Battlecry: Your next Battlecry triggers 3 times, but can't damage the enemy hero. |
| Sire Denathrius | REV_906 | Damage, healing, Armor and board stats · Attached/action: Infuse | Lifesteal. Battlecry: Deal 5 damage amongst enemies. Endlessly Infuse (2): Deal 1 more. |
| Sleet Skater | TOY_375 | Damage, healing, Armor and board stats · Attached/action: Miniaturize / Gigantify | Miniaturize Battlecry: Freeze an enemy minion. Gain Armor equal to its Attack. |
| Spawn of Shadows | AT_012, WON_058 | Damage, healing, Armor and board stats · Attached/action: Inspire | Battlecry and Inspire: Deal 4 damage to each hero. |
| Speaker Stomper | JAM_034 | Delayed effects and start/end-of-turn triggers; Card costs, mana and ordinary discounts · Attached/action: Tradeable | Tradeable Battlecry: Enemy spells cost (2) more next turn. |
| Squashling | GIL_835 | Damage, healing, Armor and board stats · Attached/action: Echo | Echo Battlecry: Restore 2 Health. |
| Stadium Announcer | TIME_034 | Weapons, forced attacks and combat restrictions; Damage, healing, Armor and board stats · Attached/action: Rewind | Rewind Battlecry: Both players equip a random weapon. Give yours +1/+1. |
| Sunfury Clergy | RLK_219 | Damage, healing, Armor and board stats · Attached/action: Manathirst | Battlecry: Restore 3 Health to all friendly characters. Manathirst (6): Restore 6 Health instead. |
| Sweetened Snowflurry | TOY_307 | Generated cards and named card pools · Attached/action: Miniaturize / Gigantify | Miniaturize Battlecry: Get 2 random Temporary Frost spells. |
| Sylvanas, the Accused | MAW_033 | Copies, transformations, swaps and control; Damage, healing, Armor and board stats · Attached/action: Infuse | Battlecry: Destroy an enemy minion. Infuse (7): Take control of it instead. |
| Tabletop Roleplayer | TOY_915 | Damage, healing, Armor and board stats · Attached/action: Miniaturize / Gigantify | Miniaturize Battlecry: Give a friendly Demon +2 Attack and Immune this turn. |
| Talanji of the Graves | TIME_619 | Deathrattles, resurrection and remembered victims; Discover and other player choices; Draw, discard and hand/deck movement · Attached/action: Fabled | Fabled. Battlecry: Draw Bwonsamdi (or resurrect him if he has died). Choose a Boon to give him. |
| The Black Knight | CORE_EX1_002, EX1_002 | Damage, healing, Armor and board stats · Attached/action: Tradeable | Tradeable Battlecry: Destroy an enemy minion with Taunt. |
| The One-Amalgam Band | ETC_409 | History, thresholds and scaling conditions · Attached/action: Adapt / bonus effects | Battlecry: Gain a random Bonus Effect for each minion of a different type you've played this game. |
| The Scarab Lord | WON_079 | Summons, recruits and token definitions; Damage, healing, Armor and board stats · Attached/action: Combo | Battlecry: Summon a 0/1 Gong for your opponent. Combo: Gain Rush. |
| Thunder Bluff Valiant | AT_049, WON_085 | Damage, healing, Armor and board stats · Attached/action: Inspire | Battlecry and Inspire: Give your Totems +2 Attack. |
| Thunder Lizard | UNG_082 | History, thresholds and scaling conditions · Attached/action: Adapt / bonus effects | Battlecry: If you played an Elemental last turn, Adapt. |
| Tickatus | DMF_118 | Draw, discard and hand/deck movement · Attached/action: Corrupt | Battlecry: Remove the top 5 cards from your deck. Corrupt: Your opponent's deck instead. |
| Time-Lost Raptor | WON_027 |  · Attached/action: Adapt / bonus effects, Echo | Echo Battlecry: Adapt your Time-Lost Raptors. |
| Timethief Rafaam | TIME_005 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats; Auras, listeners and ongoing board effects · Attached/action: Fabled | Fabled+. Your deck size is 40, but has 10 Rafaams! Battlecry: If you played the rest, destroy the enemy hero. |
| Toy Captain Tarim | TOY_813 | Damage, healing, Armor and board stats · Attached/action: Miniaturize / Gigantify | Miniaturize Taunt. Battlecry: Set a minion's Attack and Health to this minion's. |
| Toyrantus | MIS_712 | Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats · Attached/action: Elusive | Taunt, Elusive Battlecry: If you have 10 Mana Crystals, gain +7/+7. |
| Toysnatching Geist | MIS_006 | Discover and other player choices; Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats · Attached/action: Miniaturize / Gigantify | Gigantify Battlecry: Discover an Undead. Reduce its Cost by this minion's Attack. |
| Traveling Merchant | SW_307 | Damage, healing, Armor and board stats · Attached/action: Tradeable | Tradeable Battlecry: Gain +1/+1 for each other friendly minion you control. |
| Treacherous Tormentor | EDR_102 | Discover and other player choices · Attached/action: Adapt / bonus effects | Battlecry: Discover a Legendary minion with a Dark Gift. |
| Turbulus | WORK_013 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats · Attached/action: Tourist | Hunter Tourist. Battlecry: Give +1/+1 to all other Battlecry minions in your hand, deck, and battlefield. |
| Verdant Longneck | UNG_100 |  · Attached/action: Adapt / bonus effects | Battlecry: Adapt. |
| Volcanosaur | UNG_002 |  · Attached/action: Adapt / bonus effects | Battlecry: Adapt, then Adapt. |
| Watcher of the Sun | TTN_039 | Generated cards and named card pools; Damage, healing, Armor and board stats · Attached/action: Forge | Battlecry: Get a random Holy spell. Forge: Also restore 6 Health to your hero. |
| Whirling Combatant | BAR_840 | Damage, healing, Armor and board stats · Attached/action: Frenzy | Battlecry and Frenzy: Deal 1 damage to all other minions. |
| Wind-Up Enforcer | TOY_880 | Copies, transformations, swaps and control; Summons, recruits and token definitions · Attached/action: Tradeable | Tradeable Battlecry: Summon 1 copy of this minion. (Trade to upgrade!) |
| Wind-Up Musician | TOY_509 | Damage, healing, Armor and board stats · Attached/action: Tradeable | Tradeable Battlecry: Deal 1 damage to all enemy minions. (Trade to upgrade!) |
| Wind-Up Sapling | TOY_802 | Card costs, mana and ordinary discounts · Attached/action: Tradeable | Tradeable Battlecry: Refresh 1 Mana Crystal. (Trade to upgrade!) |
| Window Shopper | TOY_652 | Discover and other player choices; Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats · Attached/action: Miniaturize / Gigantify | Miniaturize Battlecry: Discover a Demon. Set its stats and Cost to this minion's. |
| XB-488 Disposalbot | TTN_458 | Damage, healing, Armor and board stats · Attached/action: Forge | Battlecry: Deal 5 damage randomly split among all enemy minions. Forge: Gain Lifesteal. |

<a id="dormant-board"></a>

### Dormant, locations and board-state systems — 35

Implement Dormant/wake timers, location rules, Starships, Colossal appendages and other nonstandard board objects.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Al'Akir, Lord of Storms | CATA_153 | Card costs, mana and ordinary discounts; Generated cards and named card pools; Damage, healing, Armor and board stats; Extra keywords and attached mechanics · Attached/action: Colossal | Colossal +2, Rush, Windfury Battlecry: Get 2 minions with Cost equal to this minion's Attack. They cost (1). |
| Ambassador Faelin | TSC_067 | Draw, discard and hand/deck movement · References: Colossal | Battlecry: Put 3 Colossal minions on the bottom of your deck. |
| Ara'lon | REV_363 | Summons, recruits and token definitions | Battlecry: Summon one of each Dormant Wildseed. |
| Cruise Captain Lora | VAC_506 | Summons, recruits and token definitions | Battlecry: Summon 2 random locations. |
| Crumblecrusher | END_034 | Weapons, forced attacks and combat restrictions; Damage, healing, Armor and board stats | Battlecry: Destroy a random enemy minion, location, and weapon. |
| Crystal Welder | GDB_130 | Damage, healing, Armor and board stats · References: Starship | Taunt Battlecry: If you're building a Starship, gain +2/+2. |
| Demolition Renovator | CORE_REV_023, REV_023 | Damage, healing, Armor and board stats; Extra keywords and attached mechanics · Attached/action: Tradeable | Tradeable Battlecry: Destroy an enemy location. |
| Disguised Executioner | JAIL_461 | History, thresholds and scaling conditions; Damage, healing, Armor and board stats | Can be played on either side. Battlecry: Destroy a random adjacent minion. |
| Disguised Watchman | JAIL_455 | History, thresholds and scaling conditions; Damage, healing, Armor and board stats | Can be played on either side. Battlecry: Deal 1 damage to all other friendly minions, twice. |
| Dispossessed Soul | REV_901 | Discover and other player choices; Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: If you control a location, Discover a copy of a card in your deck. |
| Dreadsoul Corrupter | EDR_841 | Deathrattles, resurrection and remembered victims; Summons, recruits and token definitions | Battlecry and Deathrattle: Summon a random Dormant Dreadseed. |
| Exarch Othaar | GDB_856 | Generated cards and named card pools · References: Starship | Battlecry: If you're building a Starship, get 3 different Arcane spells and reduce their Costs by (2). |
| Flightmaster Dungar | SW_079 | Auras, listeners and ongoing board effects; Discover and other player choices | Battlecry: Choose a flightpath and go Dormant. Awaken with a bonus when you complete it! |
| Ghost | SC_408 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats · References: Starship | Stealth. Battlecry: If you're building a Starship, destroy the lowest-Cost card in your opponent's hand. |
| Gigafin | TSC_962 | Deathrattles, resurrection and remembered victims; Damage, healing, Armor and board stats; Extra keywords and attached mechanics · Attached/action: Colossal | Colossal +1. Battlecry: Devour all enemy minions. Deathrattle: Spit them back out. |
| Hydralodon | TSC_950 | Damage, healing, Armor and board stats; Extra keywords and attached mechanics · Attached/action: Colossal | Colossal +2 Battlecry: Give your Hydralodon Heads Rush. |
| Iso'rath | CATA_481 | Delayed effects and start/end-of-turn triggers; Deathrattles, resurrection and remembered victims; Draw, discard and hand/deck movement | Battlecry: Devour 2 random cards from the opponent's hand, then go Dormant for 2 turns. Deathrattle: Return them. |
| Magtheridon | BT_850 | Auras, listeners and ongoing board effects; Summons, recruits and token definitions; Damage, healing, Armor and board stats | Dormant. Battlecry: Summon three 1/3 enemy Warders. When they die, destroy all minions and awaken. |
| Maiev Shadowsong | BT_737 | Delayed effects and start/end-of-turn triggers; Discover and other player choices | Battlecry: Choose a minion. It goes Dormant for 2 turns. |
| Missile Pod | SC_409 | Damage, healing, Armor and board stats; Extra keywords and attached mechanics · Attached/action: Starship | Starship Piece Battlecry: Deal 1 damage to all enemies. Also triggers on launch. |
| Nellie, the Great Thresher | TSC_660 | Discover and other player choices; Damage, healing, Armor and board stats; Extra keywords and attached mechanics · Attached/action: Colossal | Colossal +1 Battlecry: Discover 3 Pirates to crew Nellie's Ship! |
| Runi, Time Explorer | WON_053 | Delayed effects and start/end-of-turn triggers; Discover and other player choices | Battlecry: Discover a location from the FUTURE! |
| Scrapbooking Student | VAC_529 | Copies, transformations, swaps and control; Summons, recruits and token definitions | Battlecry: Summon a copy of a friendly location. |
| Scrounging Shipwright | GDB_876 | Generated cards and named card pools · References: Starship | Battlecry: Get a random Starship Piece from another class. |
| SCV | SC_401 | Card costs, mana and ordinary discounts · References: Starship | Battlecry: Your next Starship launch costs (2) less. |
| Siege Tank | SC_413 | Damage, healing, Armor and board stats · References: Starship | Battlecry: Deal 10 damage to a random enemy minion. (Transforms if you launched a Starship this game.) |
| Spirit Poacher | REV_360 | Summons, recruits and token definitions | Battlecry: Summon a random Dormant Wildseed. |
| Star Vulpera | GDB_340 | Damage, healing, Armor and board stats; Extra keywords and attached mechanics · Attached/action: Tradeable · References: Starship | Tradeable Battlecry: Destroy an enemy Starship or Starship Piece. |
| The Exodar | GDB_120 | Discover and other player choices · References: Starship | Battlecry: If you're building a Starship, launch it and choose a Protocol! |
| Thor | SC_414 | Damage, healing, Armor and board stats · References: Starship | Battlecry: Deal 5 damage. (Transforms if you launched a Starship this game.) |
| Timeway Warden | TIME_442 | Deathrattles, resurrection and remembered victims | Battlecry: Imprison an enemy minion. It goes Dormant for 10,000 turns. Deathrattle: Awaken it. |
| Travel Agent | VAC_438 | Discover and other player choices | Battlecry: Discover a location from any class. |
| Ultra-Capacitor | SC_405 | Damage, healing, Armor and board stats; Extra keywords and attached mechanics · Attached/action: Starship | Starship Piece Battlecry: Gain +1/+1 for each other friendly minion. Also triggers on launch. |
| Workshop Janitor | TOY_891 | Draw, discard and hand/deck movement | Battlecry: If you control a location, draw 2 cards. |
| Yamato Cannon | SC_406 | Damage, healing, Armor and board stats; Extra keywords and attached mechanics · Attached/action: Starship | Starship Piece Battlecry: Destroy a random enemy minion. Also triggers on launch. |

<a id="custom-build"></a>

### Custom cards, construction and minigames — 29

Define custom choice trees, constructed cards, puzzles, auctions, trials and special minigames rather than substituting a generic random card.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Attentive Tender | BE_262 | Card costs, mana and ordinary discounts | Battlecry: Assemble a 1-Cost minion. |
| Avatar of Hearthstone | CORE_WON_145, WON_145 | Automatic casting and replaying spells/Battlecries | Battlecry: Open a Standard Pack. Play all cards from it. |
| Bashana Runetotem | MEND_046 | Card costs, mana and ordinary discounts; Generated cards and named card pools | Battlecry: Get three 2/2 Treants. Carve 12 Mana worth of Nature spells into them. |
| Bob the Bartender | BG31_BOB | Discover and other player choices | Battlecry: Choose an action from the Battlegrounds! |
| Curious Glimmerroot | UNG_035 | Copies, transformations, swaps and control; Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Look at 3 cards. Guess which one started in your opponent's deck to get a copy of it. |
| E.T.C., Band Manager | ETC_080 | Discover and other player choices; Draw, discard and hand/deck movement | While building your deck, assemble a band of 3 cards. Battlecry: Discover one! |
| Elise the Navigator | TLC_100 | Dormant, locations and board-state systems; Draw, discard and hand/deck movement | Battlecry: If your deck started with 10 cards of different Costs, craft a custom location. |
| Envoy of Lazul | DRG_306 | Copies, transformations, swaps and control; Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Look at 3 cards. Guess which one is in your opponent's hand to get a copy of it. |
| F3TCH3R | BE_044 | Card costs, mana and ordinary discounts | Battlecry: Assemble a 4-Cost minion. |
| Futuristic Forefather | TIME_041 | Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Taunt. Battlecry: Look at 3 cards. Guess which one is in your opponent's hand to gain +4 Health. |
| Godfather Kazakus | CAP_405 | Discover and other player choices | Battlecry: Plot a custom sham trial! Then choose the trial's length. |
| Harth Stonebrew | GIFT_01 | Copies, transformations, swaps and control; Draw, discard and hand/deck movement | Battlecry: Replace your hand with an iconic one from Hearthstone's past. (Once per game) |
| Ignis, the Eternal Flame | TTN_751 | Weapons, forced attacks and combat restrictions · References: Forge | Battlecry: If you've Forged a card this game, craft a custom weapon. |
| Kazakus | CFM_621 | Draw, discard and hand/deck movement | Battlecry: If your deck has no duplicates, create a custom spell. |
| Kazakus, Golem Shaper | BAR_079 | Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | Battlecry: If your deck has no 4-Cost cards, build a custom Golem. |
| Kazakusan | ONY_005 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement | Battlecry: If you played 4 other Dragons this game, craft a custom deck of Treasures. |
| King of the Underbelly | JAIL_831 | Discover and other player choices; Card costs, mana and ordinary discounts; Draw, discard and hand/deck movement | While building your deck, pick 3 contraband Beasts. Battlecry: Discover one. It costs (3) less. |
| Mismatcher | BE_045 | Card costs, mana and ordinary discounts; Damage, healing, Armor and board stats | Taunt. Battlecry: Assemble a minion that costs (3) or less with cards that cost (5) or more. |
| Mixologist | VAC_523 | Card costs, mana and ordinary discounts | Battlecry: Craft a custom 1-Cost Potion. |
| Pirate Admiral Hooktusk | TSC_934 | History, thresholds and scaling conditions | Battlecry: If you've summoned 7 other Pirates this game, plunder the enemy!0 ({0} left!)0 (Ready!) |
| Pro Gamer | MIS_916 | Draw, discard and hand/deck movement | Battlecry: Challenge your opponent to a game of Rock-Paper-Scissors! The winner draws 2 cards. |
| Rajh | BE_004 | Hero powers, upgrades and replacements; Copies, transformations, swaps and control | Battlecry: Assemble a minion from any class. Transform it into a Passive Hero Power. |
| Sandcrafter | BE_229 |  | Battlecry: Assemble a minion with an end of your turn effect. |
| Scourge Tamer | RLK_821 |  | Battlecry: Craft a custom Zombeast. |
| Steward of the Vale | BE_851 |  | Battlecry: Assemble a Beast. |
| Swampqueen Hagatha | DAL_431 | Generated cards and named card pools; Draw, discard and hand/deck movement | Battlecry: Add a 5/5 Horror to your hand. Teach it two Shaman spells. |
| Victor Nefarius | CATA_470 | Card costs, mana and ordinary discounts | Battlecry: Craft a custom Undead Dragon. If you're holding a Dragon, reduce the Creation's Cost by (3). |
| Yogg-Saron, Master of Fate | DMF_004 | History, thresholds and scaling conditions | Battlecry: If you've cast 10 spells this game, spin the Wheel of Yogg-Saron. |
| Zephrys the Great | ULD_003 | Draw, discard and hand/deck movement | Battlecry: If your deck has no duplicates, wish for the perfect card. |

<a id="match-rules"></a>

### Turns, starting decks and match-wide changes — 9

Review extra turns, starting-game effects, turn control, hero/deck swaps, alternate wins and Commander-specific interactions.

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
| Aya, Lotus Kingpin | JAIL_504 | Discover and other player choices; Copies, transformations, swaps and control; Generated cards and named card pools | You always go second. Battlecry: Pick an upgraded counterfeit to replace your Coins this game. Get 3. |
| Azalina Soulsever | JAIL_430 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement; Damage, healing, Armor and board stats | Your starting Health is 40. Your deck is 20 cards, plus 20 copied from your enemy. Battlecry: Draw until your hand is full. |
| C'Thun, the Shattered | DMF_254 | Damage, healing, Armor and board stats | Start of Game: Break into pieces. Battlecry: Deal 30 damage randomly split among all enemies. |
| King Togwaggle | LOOT_541 | Copies, transformations, swaps and control | Battlecry: Swap decks with your opponent. Give them a Ransom spell to swap back. |
| Mastermind Yogg-Saron | BE_009 |  | Old God. Battlecry: End your turn. Yogg-saron takes an extra turn for you. (Once per game) |
| Spore Empress Moldara | GDB_234 | History, thresholds and scaling conditions; Draw, discard and hand/deck movement | Start of Game: Shuffle 7 Replicating Spores into your deck. Battlecry: Cast one. |
| Temporus | LOOT_538 | Delayed effects and start/end-of-turn triggers | Battlecry: Your opponent takes two turns. Then you take two turns. |
| Timewinder Zarimi | TOY_385 | History, thresholds and scaling conditions | Battlecry: Once per game, if you've played 8 other Dragons, take an extra turn. |
| Ysera, Emerald Aspect | EDR_000 | Card costs, mana and ordinary discounts | Start of Game: Increase both players'maximum Mana by 5. Battlecry: Gain 3 Mana Crystals. |

## Reproduction and limits

Run `npm run group:battlecries` to refresh the underlying support audit and this grouping. Machine-readable output is `data/battlecry-groups.json`; taxonomy rules are in `scripts/battlecry-groups.mjs`. Full raw printed text is preserved per printing in the JSON; UI-only variants after `@` are normalized for this report. Raw printings containing a replacement character: **0**. Nonbreaking spaces are normalized only for analysis.

No gameplay scripts, card support flags, databases or images are changed by grouping. Any support/collection updates require regeneration. [Ungrouped backlog](BATTLECRY-REMAINING.md) · [Test decks and current rules](TEST-DECKS.md)
