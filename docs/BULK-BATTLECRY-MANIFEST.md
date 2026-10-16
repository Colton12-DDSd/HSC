# Bulk Battlecry expansion manifest

**506 additional unique minion names.** Printings with the same name count once. Baseline: 36 supported Battlecry names at commit `cb9837a`.

Each row is enabled by a complete build-time template, with its exact full source text pinned in `src/generated/battlecries.json`. Gameplay executes the generated structured effects; it never parses display text. See [coverage and limitations](BULK-BATTLECRIES.md).

| Minion                    | Enabled printings              | Printed effect                                                                                           |
| ------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Abyssal Enforcer          | CFM_751                        | Battlecry: Deal 3 damage to all other characters.                                                        |
| Acherus Veteran           | ICC_092                        | Battlecry: Give a friendly minion +1 Attack.                                                             |
| Aeon Reaver               | YOD_014                        | Battlecry: Deal damage to a minion equal to its Attack.                                                  |
| Aerosoilizer              | YOG_403                        | Battlecry and Deathrattle: Summon a 2/2 Treant.                                                          |
| Aldor Peacekeeper         | EX1_382                        | Battlecry: Change an enemy minion's Attack to 1.                                                         |
| Alexstrasza               | EX1_561                        | Battlecry: Set a hero's remaining Health to 15.                                                          |
| Alexstrasza's Champion    | AT_071                         | Battlecry: If you're holding a Dragon, gain +1 Attack and Charge.                                        |
| Alliance Bannerman        | SW_315                         | Battlecry: Draw a minion. Give minions in your hand +1/+1.                                               |
| Amber Priestess           | TIME_431                       | Taunt Battlecry: Restore Health to a character equal to this minion's Health.                            |
| Amber Watcher             | DRG_226                        | Battlecry: Restore #8 Health.                                                                            |
| Amber Whelp               | RLK_915                        | Battlecry: If you're holding a Dragon, deal 3 damage.                                                    |
| Ancient Brewmaster        | EX1_057                        | Battlecry: Return a friendly minion from the battlefield to your hand.                                   |
| Animated Avalanche        | YOD_007                        | Battlecry: If you played an Elemental last turn, summon a copy of this.                                  |
| Animated Broomstick       | SCH_311                        | Rush Battlecry: Give your other minions Rush.                                                            |
| Antique Healbot           | GVG_069                        | Battlecry: Restore #8 Health to your hero.                                                               |
| Arcane Dynamo             | BOT_539                        | Battlecry: Discover a spell that costs (5) or more.                                                      |
| Arcane Wyrm               | RLK_548                        | Battlecry: Add an Arcane Bolt to your hand.                                                              |
| Arcanologist              | UNG_020                        | Battlecry: Draw a Secret.                                                                                |
| Arcanosaur                | TRL_311                        | Battlecry: If you played an Elemental last turn, deal 3 damage to all other minions.                     |
| Archbishop Benedictus     | ICC_215                        | Battlecry: Shuffle a copy of your opponent's deck into your deck.                                        |
| Arena Fanatic             | TRL_517                        | Battlecry: Give all minions in your hand +1/+1.                                                          |
| Argent Protector          | CORE_EX1_362, EX1_362          | Battlecry: Give a friendly minion Divine Shield.                                                         |
| Arid Stormer              | BAR_045                        | Battlecry: If you played an Elemental last turn, gain Rush and Windfury.                                 |
| Arrow Retriever           | TIME_601                       | Battlecry:& Draw until you have 3 cards.                                                                 |
| Ashleaf Pixie             | FIR_961                        | Battlecry: If you're holding a spell that costs (5) or more,& gain Divine Shield and Lifesteal.          |
| Avian Watcher             | KAR_037                        | Battlecry: If you control a Secret, gain +1/+1 and Taunt.                                                |
| Baba Naga                 | TSC_017                        | Battlecry: If you've cast a spell while holding this, deal 3 damage.                                     |
| Babbling Book             | KAR_009                        | Battlecry: Add a random Mage spell to your hand.                                                         |
| Babbling Bookcase         | CORE_EDR_001                   | Battlecry:& Add 2 random Mage spells to your hand.                                                       |
| Backstage Bouncer         | JAM_014                        | Taunt Battlecry: Transform a friendly minion into a copy of this.                                        |
| Baleful Banker            | GIL_815                        | Battlecry: Choose a friendly minion. Shuffle a copy into your deck.                                      |
| Banana Buffoon            | TRL_509                        | Battlecry: Add 2 Bananas to your hand.                                                                   |
| Banana Vendor             | DMF_065                        | Battlecry: Add 2 Bananas to each player's hand.                                                          |
| Barak Kodobane            | BAR_551                        | Battlecry:& Draw a 1, 2, and 3-Cost spell.                                                               |
| Barrens Stablehand        | EX1_188                        | Battlecry: Summon a random Beast.                                                                        |
| Battle Vicar              | CORE_ONY_022, ONY_022          | Battlecry:& Discover a Holy spell.                                                                       |
| Battleworn Faceless       | YOG_501                        | Battlecry: Transform into a copy of a damaged minion.                                                    |
| Bazaar Mugger             | ULD_327                        | Rush Battlecry: Add a random minion from another class to your hand.                                     |
| Beached Whale             | VAC_934                        | Taunt Battlecry: Deal 10 damage to this minion.                                                          |
| Beaming Sidekick          | CORE_ULD_191, ULD_191          | Battlecry: Give a friendly minion +2 Health.                                                             |
| Beastmaster Leoroxx       | BT_214                         | Battlecry: Summon 3 Beasts from your hand.                                                               |
| Belligerent Gnome         | TRL_514                        | Taunt Battlecry: If your opponent has 2 or more minions, gain +1 Attack.                                 |
| Bewitched Guardian        | GIL_507                        | Taunt Battlecry: Gain +1 Health for each card in your hand.                                              |
| Big Ol' Whelp             | DRG_054                        | Battlecry: Draw a card.                                                                                  |
| Bilefin Tidehunter        | OG_156                         | Battlecry: Summon a 1/1 Ooze with Taunt.                                                                 |
| Blackwing Corruptor       | BRM_034, WON_329               | Battlecry: If you're holding a Dragon, deal 5 damage.                                                    |
| Blackwing Technician      | BRM_033                        | Battlecry: If you're holding a Dragon, gain +1/+1.                                                       |
| Blast Tortoise            | WW_346                         | Taunt Battlecry: Deal damage to all enemy minions equal to this minion's Attack.                         |
| Blasteroid                | GDB_303                        | Battlecry: Shuffle 5 random Fire spells into your deck. They cost (2) less.                              |
| Blazecaller               | UNG_847                        | Battlecry: If you played an Elemental last turn, deal 5 damage.                                          |
| Blood Shard Bristleback   | BAR_916                        | Lifesteal. Battlecry: If your deck contains 10 or fewer cards, deal 6 damage to a minion.                |
| Bloodsail Cultist         | OG_315                         | Battlecry: If you control another Pirate, give your weapon +1/+1.                                        |
| Bloodsail Recruiter       | VAC_430                        | Battlecry: Discover a Pirate.                                                                            |
| Bloodscalp Strategist     | TRL_349                        | Battlecry: If you have a weapon equipped, Discover a spell.                                              |
| Blowgill Sniper           | CFM_647                        | Battlecry: Deal 1 damage.                                                                                |
| Bog Slosher               | TRL_059                        | Battlecry: Return a friendly minion to your hand and give it +2/+2.                                      |
| Bogstrok Clacker          | BT_106                         | Battlecry: Transform adjacent minions into random minions that cost (1) more.                            |
| Boisterous Bard           | LOOT_152                       | Battlecry: Give your other minions +1 Health.                                                            |
| Bomb Lobber               | GVG_099                        | Battlecry: Deal 4 damage to a random enemy minion.                                                       |
| Bonechewer Raider         | BT_140                         | Battlecry: If there is a damaged minion, gain +1/+1 and Rush.                                            |
| Bonemare                  | ICC_705                        | Battlecry: Give a friendly minion +4/+4 and Taunt.                                                       |
| Bonfire Elemental         | GIL_645                        | Battlecry: If you played an Elemental last turn, draw a card.                                            |
| Book Wyrm                 | KAR_033                        | Battlecry: If you're holding a Dragon, destroy an enemy minion with 3 or less Attack.                    |
| Brainstormer              | BOT_413                        | Battlecry: Gain +1 Health for each spell in your hand.                                                   |
| Brassknuckle Brawler      | BE_560                         | Charge Battlecry: If you have 10 or more Armor, gain +4/+4.                                              |
| Brightwing                | CORE_EX1_189, EX1_189          | Battlecry: Add a random Legendary minion to your hand.                                                   |
| Brittlebone Destroyer     | SCH_513                        | Battlecry: If your hero's Health changed this turn, destroy a minion.                                    |
| Bronze Explorer           | DRG_229                        | Lifesteal Battlecry: Discover a Dragon.                                                                  |
| Brrrloc                   | ICC_058                        | Battlecry: Freeze an enemy.                                                                              |
| Bubblebot                 | TSC_059                        | Battlecry: Give your other Mechs Divine Shield and Taunt.                                                |
| Bug Collector             | ULD_712                        | Battlecry: Summon a 1/1 Locust with Rush.                                                                |
| Bumbling Bellhop          | VAC_521                        | Taunt Battlecry: If you're holding a spell that costs (5) or more, summon a copy of this.                |
| Bunker Sergeant           | AV_126                         | Battlecry: If your opponent has 2 or more minions, deal 1 damage to all enemy minions.                   |
| Caged Cranium             | JAIL_513                       | Taunt Battlecry:& Gain +1 Health for each card in your hand.                                             |
| Cagematch Custodian       | DMF_704                        | Battlecry: Draw a weapon.                                                                                |
| Captain Greenskin         | NEW1_024                       | Battlecry: Give your weapon +1/+1.                                                                       |
| Captain's Parrot          | NEW1_016                       | Battlecry: Draw a Pirate from your deck.                                                                 |
| Card Grader               | TOY_054                        | Battlecry: If you've cast a spell while holding this, Discover a card from your deck.                    |
| Caria Felsoul             | AV_267                         | Battlecry: Transform into a 6/6 copy of a Demon in your deck.                                            |
| Carrier Whelp             | CATA_556                       | Battlecry:& Get a random Dragon that costs (3) or less.                                                  |
| Carrion Drake             | GIL_905                        | Battlecry: If a minion died this turn, gain Poisonous.                                                   |
| Catacomb Guard            | SW_317                         | Lifesteal Battlecry: Deal damage equal to this minion's Attack to an enemy minion.                       |
| Cathedral Gargoyle        | GIL_635                        | Battlecry: If you're holding a Dragon, gain Taunt and Divine Shield.                                     |
| Cattle Rustler            | WW_351                         | Battlecry: Draw a Beast. It costs (3) less.                                                              |
| Cavern Shinyfinder        | LOOT_033                       | Battlecry: Draw a weapon from your deck.                                                                 |
| Celestial Dreamer         | CFM_617                        | Battlecry: If you control a minion with 5 or more Attack, gain +2/+2.                                    |
| Charred Chameleon         | FIR_908                        | Battlecry: If you've used your Hero Power this turn, give a friendly minion +1/+2 and Rush.              |
| Cheaty Anklebiter         | TRL_512                        | Lifesteal Battlecry: Deal 1 damage.                                                                      |
| Chillfallen Baron         | RLK_708                        | Battlecry and Deathrattle:& Draw a card.                                                                 |
| Chittering Tunneler       | UNG_835                        | Battlecry: Discover a spell. Deal damage to your hero equal to its Cost.                                 |
| Chronicle Keeper          | TIME_062                       | Battlecry: If you're holding a Dragon,& gain Taunt and Divine Shield.                                    |
| City Architect            | SW_076                         | Battlecry: Summon two 0/5 Castle Walls with Taunt.                                                       |
| Class Action Lawyer       | MAW_017                        | Battlecry: If your deck has no Neutral cards, set a minion's stats to 1/1.                               |
| Clawfury Adept            | AV_294                         | Battlecry: Give all other friendly characters +1 Attack this turn.                                       |
| Cleansing Lightspawn      | TIME_427                       | Lifesteal Battlecry: Deal damage to an enemy minion equal to this minion's Health.                       |
| Cleric of An'she          | WC_803                         | Battlecry: If you've restored Health this turn, Discover a spell from your deck.                         |
| Cleric of Scales          | YOD_013                        | Battlecry: If you're holding a Dragon, Discover a spell from your deck.                                  |
| Click-Clocker             | TSC_632                        | Divine Shield. Battlecry: Give a random Mech in your hand +1/+1.                                         |
| Clockwork Knight          | AT_096                         | Battlecry: Give a friendly Mech +1/+1.                                                                   |
| Cloud Prince              | ULD_293                        | Battlecry: If you control a Secret, deal 6 damage.                                                       |
| Coldlight Seer            | CORE_EX1_103, EX1_103          | Battlecry: Give your other Murlocs +2 Health.                                                            |
| Confection Cyclone        | DMF_100                        | Battlecry: Add two 1/2 Sugar Elementals to your hand.                                                    |
| Core Rager                | BRM_014                        | Battlecry: If your hand is empty, gain +3/+3.                                                            |
| Cornered Sentry           | UNG_926                        | Taunt. Battlecry: Summon three 1/1 Raptors for your opponent.                                            |
| Cosmonaut                 | GDB_443                        | Battlecry: Discover a spell from your deck. Reduce its Cost by (5).                                      |
| Costumed Entertainer      | DMF_189                        | Battlecry: Give a random minion in your hand +2/+2.                                                      |
| Cover Artist              | ETC_110                        | Battlecry: Transform into a 3/3 copy of a minion.                                                        |
| Cowbell Soloist           | ETC_101                        | Battlecry: If you control no other minions, deal 2 damage.                                               |
| Crazed Alchemist          | CORE_EX1_059, EX1_059          | Battlecry: Swap the Attack and Health of a minion.                                                       |
| Crazed Netherwing         | DRG_201                        | Battlecry: If you're holding a Dragon, deal 3 damage to all other characters.                            |
| Crowd Roaster             | TRL_569                        | Battlecry: If you're holding a Dragon, deal 7 damage to an enemy minion.                                 |
| Crushclaw Enforcer        | TSC_826                        | Battlecry: If you've cast a spell while holding this, draw a Naga.                                       |
| Crystalsmith Cultist      | CORE_RLK_814, RLK_814          | Battlecry: If you're holding a Shadow spell,& gain +1/+1.                                                |
| Cult Apothecary           | OG_295, WON_330                | Battlecry: For each enemy minion, restore #2 Health to your hero.                                        |
| Cyclopian Horror          | OG_337                         | Taunt. Battlecry: Gain +1 Health for each enemy minion.                                                  |
| Dalaran Librarian         | DAL_735                        | Battlecry: Silence adjacent minions.                                                                     |
| Damaged Stegotron         | BOT_448                        | Taunt Battlecry: Deal 6 damage to this minion.                                                           |
| Daring Drake              | RLK_916                        | Rush Battlecry: If you're holding a Dragon, gain +1/+1.                                                  |
| Dark Iron Skulker         | BRM_008, WON_073               | Battlecry: Deal 2 damage to all undamaged enemy minions.                                                 |
| Dark Peddler              | CORE_WON_096, LOE_023, WON_096 | Battlecry:& Discover a 1-Cost card.                                                                      |
| Darkglare                 | BT_307                         | Battlecry: If your hero took damage this turn, refresh 3 Mana Crystals.                                  |
| Darkscale Broodmother     | CATA_111                       | Battlecry: If you're holding a Dragon, refresh 2 Mana Crystals.                                          |
| Darkshire Alchemist       | OG_234, WON_315                | Battlecry: Restore #5 Health.                                                                            |
| Death Revenant            | ICC_450                        | Battlecry: Gain +1/+1 for each damaged minion.                                                           |
| Death Speaker Blackthorn  | BAR_329                        | Battlecry: Summon 3 Deathrattle minions that cost (5) or less from your deck.                            |
| Deathaxe Punisher         | ICC_810                        | Battlecry: Give a random Lifesteal minion in your hand +2/+2.                                            |
| Deathspeaker              | ICC_467                        | Battlecry: Give a friendly minion Immune this turn.                                                      |
| Deathweb Spider           | GIL_565                        | Battlecry: If your hero took damage this turn, gain Lifesteal.                                           |
| Deeprun Engineer          | SW_059                         | Battlecry: Discover a Mech. It costs (1) less.                                                           |
| Defias Cleaner            | CFM_855                        | Battlecry: Silence a minion with Deathrattle.                                                            |
| Defias Leper              | DED_513                        | Battlecry: If you're holding a Shadow spell, deal 2 damage.                                              |
| Desert Nestmatron         | WW_826                         | Taunt. Battlecry: If you're holding a Dragon, refresh 4 Mana Crystals.                                   |
| Detonation Juggernaut     | CORE_WW_329, WW_329            | Taunt. Battlecry:& Give Taunt minions in your hand +2/+2.                                                |
| Dinotamer Brann           | ULD_156                        | Battlecry: If your deck has no duplicates, summon King Krush.                                            |
| Disciple of the Dove      | TIME_037                       | Battlecry: Draw a minion.& Give minions in your hand +2 Health.                                          |
| Diving Gryphon            | DRG_010                        | Rush Battlecry: Draw a Rush minion from your deck.                                                       |
| Doomguard                 | CORE_EX1_310, EX1_310          | Charge. Battlecry:& Discard two random cards.                                                            |
| Doppelgangster            | CFM_668                        | Battlecry: Summon 2 copies of this minion.                                                               |
| Double Agent              | AV_711                         | Battlecry: If you're holding a card from another class, summon a copy of this.                           |
| Doubling Imp              | BOT_224                        | Battlecry: Summon a copy of this minion.                                                                 |
| Draenei Totemcarver       | AT_047                         | Battlecry: Gain +1/+1 for each friendly Totem.                                                           |
| Dragon Golem              | WW_822                         | Taunt Battlecry: Summon a copy of this for each Dragon in your hand.                                     |
| Dragon Speaker            | DAL_147                        | Battlecry: Give all Dragons in your hand +3/+3.                                                          |
| Dragonmaw Scorcher        | TRL_526                        | Battlecry: Deal 1 damage to all other minions.                                                           |
| Dragonslayer              | LOOT_132                       | Battlecry: Deal 6 damage to a Dragon.                                                                    |
| Dredger Staff             | REV_338                        | Battlecry: Give minions in your hand +1 Health.                                                          |
| Drum Soloist              | ETC_035                        | Taunt Battlecry: If you control no other minions, gain +2/+2 and Rush.                                   |
| Drywhisker Armorer        | LOOT_367                       | Battlecry: For each enemy minion, gain 2 Armor.                                                          |
| Duskbat                   | GIL_508                        | Battlecry: If your hero took damage this turn, summon two 1/1 Bats.                                      |
| Duskbreaker               | LOOT_410                       | Battlecry: If you're holding a Dragon, deal 3 damage to all other minions.                               |
| Dwarven Archaeologist     | ULD_309                        | Battlecry: Discover a card. Reduce its Cost by (1).                                                      |
| E.M.P. Operative          | BOT_540                        | Battlecry: Destroy a Mech.                                                                               |
| Eadric the Pure           | AT_081                         | Battlecry: Change all enemy minions' Attack to 1.                                                        |
| Earth Revenant            | BAR_750                        | Taunt Battlecry: Deal 1 damage to all enemy minions.                                                     |
| Ebon Dragonsmith          | LOOT_118                       | Battlecry: Reduce the Cost of a random weapon in your hand by (2).                                       |
| Electrowright             | BOT_550                        | Battlecry: If you're holding a spell that costs (5) or more, gain +1/+1.                                 |
| Emberscale Drake          | TRL_323                        | Battlecry: If you're holding a Dragon, gain 5 Armor.                                                     |
| Emerald Explorer          | DRG_313                        | Taunt Battlecry: Discover a Dragon.                                                                      |
| Emerald Reaver            | UNG_803                        | Battlecry: Deal 1 damage to each hero.                                                                   |
| Emeriss                   | GIL_128                        | Battlecry: Double the Attack and Health of all minions in your hand.                                     |
| Endtime Survivor          | END_019                        | Taunt. Battlecry: If your hero took damage this turn,& gain +3/+3.                                       |
| Entitled Customer         | SW_089                         | Battlecry: Deal damage equal to your hand size to all other minions.                                     |
| Ethereal Conjurer         | LOE_003                        | Battlecry: Discover a spell.                                                                             |
| Fable Stablehand          | TTN_080                        | Rush Battlecry: If you control a minion with 4 or more Attack, gain +2/+2.                               |
| Faceless Corruptor        | DRG_076                        | Rush. Battlecry: Transform one of your minions into a copy of this.                                      |
| Faceless Lurker           | ULD_189                        | Taunt Battlecry: Double this minion's Health.                                                            |
| Faceless Rager            | DAL_744                        | Battlecry: Copy a friendly minion's Health.                                                              |
| Faceless Shambler         | OG_174                         | Taunt Battlecry: Copy a friendly minion's Attack and Health.                                             |
| Faceless Summoner         | OG_207                         | Battlecry: Summon a random 3-Cost minion.                                                                |
| Faithful Lumi             | BOT_079                        | Battlecry: Give a friendly Mech +1/+1.                                                                   |
| Fallen Sun Cleric         | ICC_094                        | Battlecry: Give a friendly minion +1/+1.                                                                 |
| Felfin Navigator          | BT_010                         | Battlecry: Give your other Murlocs +1/+1.                                                                |
| Felstalker                | EX1_306                        | Battlecry: Discard a random card.                                                                        |
| Filletfighter             | TSC_963                        | Battlecry: Deal 1 damage.                                                                                |
| Fire Elemental            | CORE_CS2_042, CS2_042          | Battlecry: Deal 4 damage.                                                                                |
| Fire Hawk                 | DRG_060                        | Battlecry: Gain +1 Attack for each card in your opponent's hand.                                         |
| Fire Plume Harbinger      | UNG_202                        | Battlecry: Reduce the Cost of Elementals in your hand by (1).                                            |
| Fire Plume Phoenix        | CORE_UNG_084, UNG_084          | Battlecry: Deal 3 damage.                                                                                |
| Firetree Witchdoctor      | TRL_523                        | Battlecry: If you're holding a Dragon, Discover a spell.                                                 |
| Fishflinger               | ULD_289                        | Battlecry: Add a random Murloc to each player's hand.                                                    |
| Flame Juggler             | AT_094                         | Battlecry: Deal 1 damage to a random enemy.                                                              |
| Fleshshaper               | NX2_027                        | Taunt. Battlecry: If you have 5 or more Armor, summon a copy of this.                                    |
| Fogsail Freebooter        | CS3_022                        | Battlecry: If you have a weapon equipped, deal 2 damage.                                                 |
| Forlorn Stalker           | OG_292                         | Battlecry: Give all Deathrattle minions in your hand +1/+1.                                              |
| Former Champ              | TRL_151                        | Battlecry: Summon a 5/5 Hotshot.                                                                         |
| Fortune Teller            | DMF_121                        | Taunt Battlecry: Gain +1/+1 for each spell in your hand.                                                 |
| Fossilized Devilsaur      | LOE_073                        | Battlecry: If you control another Beast, gain Taunt.                                                     |
| Freya, Emerald Architect  | BE_856                         | Battlecry: Double the stats of all Beasts in your hand and deck.                                         |
| Frightened Flunky         | ULD_195                        | Taunt Battlecry: Discover a Taunt minion.                                                                |
| Frizz Kindleroost         | DRG_257                        | Battlecry: Reduce the Cost of Dragons in your deck by (2).                                               |
| Frost Elemental           | EX1_283                        | Battlecry: Freeze a character.                                                                           |
| Frostbitten Imp           | CATA_612                       | Battlecry: Freeze this.                                                                                  |
| Frostfin Chomper          | NX2_007                        | Battlecry: If you played an Elemental last turn, summon three 1/1 Murlocs.                               |
| Frostwolf Warlord         | CS2_226                        | Battlecry: Gain +1/+1 for each other friendly minion on the battlefield.                                 |
| Frozen Shadoweaver        | BT_714                         | Battlecry: Freeze an enemy.                                                                              |
| Fungal Enchanter          | LOOT_388                       | Battlecry: Restore #2 Health to all friendly characters.                                                 |
| Fungalmancer              | LOOT_167                       | Battlecry: Give adjacent minions +2/+2.                                                                  |
| Furious Felfin            | BT_496                         | Battlecry: If your hero attacked this turn, gain +1 Attack and Rush.                                     |
| Gadgetzan Socialite       | CFM_659                        | Battlecry: Restore #2 Health.                                                                            |
| Galvanizer                | BOT_907                        | Battlecry: Reduce the Cost of Mechs in your hand by (1).                                                 |
| Garden Gnome              | ULD_137                        | Battlecry: If you're holding a spell that costs (5) or more, summon two 2/2 Treants.                     |
| Glacial Shard             | CORE_UNG_205, UNG_205          | Battlecry: Freeze an enemy.                                                                              |
| Glaivebound Adept         | BT_495                         | Battlecry: If your hero attacked this turn, deal 4 damage.                                               |
| Glaiveshark               | TSC_610                        | Battlecry: If your hero attacked this turn, deal 2 damage to all enemies.                                |
| Glowstone Technician      | BOT_910                        | Battlecry: Give all minions in your hand +2/+2.                                                          |
| Gnawing Greenfin          | EDR_999                        | Battlecry: Get a random Murloc.                                                                          |
| Goblin Auto-Barber        | GVG_023                        | Battlecry: Give your weapon +1 Attack.                                                                   |
| Goblin Blastmage          | GVG_004, WON_035               | Battlecry: If you control a Mech, deal 6 damage randomly split among all enemies.                        |
| Goboglide Tech            | DRG_059                        | Battlecry: If you control a Mech, gain +1/+1 and Rush.                                                   |
| Golden Scarab             | ULD_188                        | Battlecry: Discover a 4-Cost card.                                                                       |
| Goldwing                  | NX2_022                        | Rush Battlecry: If you're holding a Mech, gain Windfury.                                                 |
| Gorillabot A-3            | CORE_LOE_039, LOE_039          | Battlecry: If you control another Mech,& Discover a Mech.                                                |
| Gorloc Ravager            | TSC_034                        | Battlecry: Draw 3 Murlocs.                                                                               |
| Gormok the Impaler        | AT_122                         | Battlecry: If you have at least 4 other minions, deal 4 damage.                                          |
| Grand Crusader            | AT_118                         | Battlecry: Add a random Paladin card to your hand.                                                       |
| Granite Forgeborn         | SW_032                         | Battlecry: Reduce the Cost of Elementals in your hand and deck by (1).                                   |
| Gravelsnout Knight        | LOOT_154                       | Battlecry: Summon a random 1-Cost minion for your opponent.                                              |
| Grim Necromancer          | ICC_026                        | Battlecry: Summon two 1/1 Skeletons.                                                                     |
| Grimestreet Pawnbroker    | CFM_755                        | Battlecry: Give a random weapon in your hand +1/+1.                                                      |
| Grimestreet Protector     | CFM_062                        | Taunt Battlecry: Give adjacent minions Divine Shield.                                                    |
| Grimscale Chum            | CFM_650                        | Battlecry: Give a random Murloc in your hand +1/+1.                                                      |
| Grimtotem Bounty Hunter   | AV_138                         | Battlecry: Destroy an enemy Legendary minion.                                                            |
| Groundskeeper             | SCH_613                        | Taunt Battlecry: If you're holding a spell that costs (5) or more, restore #5 Health.                    |
| Grumble, Worldshaker      | LOOT_358                       | Battlecry: Return your other minions to your hand. They cost (1).                                        |
| Guardian of Kings         | CS2_088                        | Taunt Battlecry: Restore #6 Health to your hero.                                                         |
| Guitar Soloist            | ETC_026                        | Battlecry: If you control no other minions, draw a spell, a minion, and a weapon.                        |
| Gyreworm                  | DMF_062                        | Battlecry: If you played an Elemental last turn, deal 3 damage.                                          |
| Harbor Scamp              | SW_029                         | Battlecry: Draw a Pirate.                                                                                |
| Hatchery Helper           | TLC_233                        | Battlecry:& Give your other minions with 2 or less Attack +1/+1 and Taunt.                               |
| Heir of Hereafter         | TIME_871                       | Taunt Battlecry:& Gain +2/+2 for each damaged minion.                                                    |
| Hemet Nesingwary          | GVG_120                        | Battlecry: Destroy a Beast.                                                                              |
| Hemet, Jungle Hunter      | UNG_840                        | Battlecry: Destroy all cards in your deck that cost (3) or less.                                         |
| Hench-Clan Burglar        | DAL_416                        | Battlecry: Discover a spell from another class.                                                          |
| Herald of Chaos           | TID_706                        | Lifesteal Battlecry: If you've cast a Fel spell while holding this, gain Rush.                           |
| Herald of Light           | TID_085                        | Battlecry: If you've cast a Holy spell while holding this, restore #6 Health to all friendly characters. |
| Herald of Lokholar        | AV_101                         | Battlecry: Draw a Frost spell.                                                                           |
| Herald of Nature          | TID_002                        | Battlecry: If you've cast a Nature spell while holding this, give your other minions +1/+1.              |
| Herbivore Assistant       | DINO_419                       | Battlecry: Give a friendly Beast +2/+2 and Rush.                                                         |
| Heroic Innkeeper          | DAL_560                        | Taunt. Battlecry: Gain +2/+2 for each other friendly minion.                                             |
| Hobart Grapplehammer      | CFM_643, WON_117               | Battlecry: If you have a weapon equipped, give all minions in your hand and deck +2/+2.                  |
| Hog Rancher               | BAR_060                        | Battlecry: Summon a 2/1 Hog with Rush.                                                                   |
| Holy Eggbearer            | DINO_411                       | Battlecry: Draw a 0-Attack minion.                                                                       |
| Hooked Reaver             | LOOT_018                       | Battlecry: If you have 15 or less Health, gain +3/+3 and Taunt.                                          |
| Hot Spring Guardian       | UNG_938                        | Taunt Battlecry: Restore #3 Health.                                                                      |
| Houndmaster               | DS1_070                        | Battlecry: Give a friendly Beast +2/+2 and Taunt.                                                        |
| Howling Commander         | ICC_801                        | Battlecry: Draw a Divine Shield minion from your deck.                                                   |
| Hozen Healer              | CFM_067                        | Battlecry: Restore a minion to full Health.                                                              |
| Hungry Dragon             | BRM_026                        | Battlecry: Summon a random 1-Cost minion for your opponent.                                              |
| Hungry Ettin              | LOOT_383                       | Taunt Battlecry: Summon a random 2-Cost minion for your opponent.                                        |
| Hyena Alpha               | ULD_154                        | Battlecry: If you control a Secret, summon two 2/2 Hyenas.                                               |
| Hyldnir Frostrider        | ICC_855                        | Battlecry: Freeze your other minions.                                                                    |
| INFERNAL!                 | MIS_703                        | Taunt Battlecry: Set your hero's remaining Health to 15.                                                 |
| Imployee of the Month     | WORK_009                       | Battlecry: Give a friendly minion Lifesteal.                                                             |
| Injured Attendant         | CATA_304                       | Lifesteal Battlecry:& Deal 4 damage to this minion.                                                      |
| Injured Kvaldir           | AT_105                         | Battlecry: Deal 3 damage to this minion.                                                                 |
| Injured Marauder          | BAR_069                        | Taunt Battlecry: Deal 6 damage to this minion.                                                           |
| Injured Tol'vir           | CORE_ULD_271, ULD_271          | Taunt Battlecry: Deal 3 damage to this minion.                                                           |
| Instrument Tech           | ETC_418                        | Battlecry: Draw a weapon.                                                                                |
| Ironbeak Owl              | CS2_203                        | Battlecry: Silence a minion.                                                                             |
| Ironclad                  | YOP_014                        | Battlecry: If your hero has Armor, gain +2/+2.                                                           |
| Ivory Knight              | CORE_KAR_057, KAR_057, WON_045 | Battlecry: Discover a spell. Restore Health to your hero equal to its Cost.                              |
| Ivory Rook                | WON_116                        | Battlecry: Discover a Taunt minion. Gain Armor equal to its Cost.                                        |
| Jeweled Macaw             | CORE_UNG_912, UNG_912          | Battlecry:& Add a random Beast to your hand.                                                             |
| Jeweled Scarab            | LOE_029                        | Battlecry: Discover a 3-Cost card.                                                                       |
| Job Shadower              | WORK_032                       | Battlecry: If your hero took damage this turn, summon a copy of this.                                    |
| Kabal Songstealer         | CFM_657                        | Battlecry: Silence a minion.                                                                             |
| Kabal Talonpriest         | CFM_626                        | Battlecry: Give a friendly minion +3 Health.                                                             |
| Keeper of Uldaman         | LOE_017, WON_311               | Battlecry: Set a minion's Attack and Health to 3.                                                        |
| King Mosh                 | UNG_933                        | Battlecry: Destroy all damaged minions.                                                                  |
| King Mukla                | CORE_EX1_014, EX1_014          | Battlecry: Give your opponent 2 Bananas.                                                                 |
| Knife Vendor              | DMF_066                        | Battlecry: Deal 4 damage to each hero.                                                                   |
| Knight of Anointment      | BAR_873                        | Battlecry: Draw a Holy spell.                                                                            |
| Kobold Apprentice         | LOOT_347                       | Battlecry: Deal 3 damage randomly split among all enemies.                                               |
| Kobold Librarian          | LOOT_014                       | Battlecry: Draw a card. Deal 2 damage to your hero.                                                      |
| Kooky Chemist             | CFM_063                        | Battlecry: Swap the Attack and Health of a minion.                                                       |
| Kul Tiran Chaplain        | EX1_195                        | Battlecry: Give a friendly minion +2 Health.                                                             |
| Lab Recruiter             | BOT_288                        | Battlecry: Shuffle 3 copies of a friendly minion into your deck.                                         |
| Lakkari Felhound          | UNG_833                        | Taunt Battlecry: Discard your two lowest-Cost cards.                                                     |
| Lance Carrier             | AT_084                         | Battlecry: Give a friendly minion +2 Attack.                                                             |
| Lawful Longarm            | WW_342                         | Rush, Lifesteal Battlecry: Gain +1 Attack for each card in your hand.                                    |
| Leeroy Jenkins            | EX1_116                        | Charge. Battlecry: Summon two 1/1 Whelps for your opponent.                                              |
| Lifedrinker               | CORE_GIL_622, GIL_622          | Battlecry: Deal 3 damage to the enemy hero. Restore #3 Health to your hero.                              |
| Liferender                | TIME_614                       | Battlecry: If your hero's Health changed this turn, deal 6 damage to an enemy minion.                    |
| Light's Champion          | AT_106                         | Battlecry: Silence a Demon.                                                                              |
| Lightforged Crusader      | DRG_231                        | Battlecry: If your deck has no Neutral cards, add 5 random Paladin cards to your hand.                   |
| Lil' Exorcist             | GVG_097                        | Taunt Battlecry: Gain +1/+1 for each enemy Deathrattle minion.                                           |
| Lilypad Lurker            | BAR_848                        | Battlecry: If you played an Elemental last turn, transform an enemy minion into a 0/1 Frog with Taunt.   |
| Lion's Guard              | SW_071                         | Battlecry: If you have 15 or less Health, gain +2/+4 and Taunt.                                          |
| Lone Champion             | LOOT_124                       | Battlecry: If you control no other minions, gain Taunt and Divine Shield.                                |
| Lor'themar Theron         | RLK_593                        | Battlecry: Double the stats of all minions in your deck.                                                 |
| Lushwater Murcenary       | BAR_062                        | Battlecry: If you control a Murloc, gain +1/+1.                                                          |
| Mad Bomber                | CORE_EX1_082, EX1_082          | Battlecry: Deal 3 damage randomly split between all other characters.                                    |
| Madder Bomber             | GVG_090                        | Battlecry: Deal 6 damage randomly split between all other characters.                                    |
| Maddest Bomber            | DED_521                        | Battlecry: Deal 12 damage randomly split among all other characters.                                     |
| Man-at-Arms               | WC_024                         | Battlecry: If you have a weapon equipped, gain +1/+1.                                                    |
| Manafeeder Panthara       | SCH_283                        | Battlecry: If you've used your Hero Power this turn, draw a card.                                        |
| Manic Soulcaster          | CFM_660                        | Battlecry: Choose a friendly minion. Shuffle a copy into your deck.                                      |
| Mantid Precursor          | BE_169                         | Battlecry: If you have a weapon equipped, gain +1/+1 and Rush.                                           |
| Marshspawn                | BT_115                         | Battlecry: If you cast a spell last turn, Discover a spell.                                              |
| Master of Evolution       | OG_328                         | Battlecry: Transform a friendly minion into a random one that costs (1) more.                            |
| Mawsworn Bailiff          | MAW_028                        | Taunt. Battlecry: If you have 4 or more Armor, gain +4/+4.                                               |
| Maze Guide                | CORE_REV_308, REV_308          | Battlecry:& Summon a random 2-Cost minion.                                                               |
| Medivh's Valet            | KAR_092                        | Battlecry: If you control a Secret, deal 3 damage.                                                       |
| Menacing Nimbus           | BOT_533                        | Battlecry: Add a random Elemental to your hand.                                                          |
| Messenger Raven           | DAL_163                        | Battlecry: Discover a Mage minion.                                                                       |
| Metaltooth Leaper         | GVG_048                        | Battlecry: Give your other Mechs +2 Attack.                                                              |
| Meteorologist             | BOT_601                        | Battlecry: For each card in your hand, deal 1 damage to a random enemy.                                  |
| Microtech Controller      | BOT_535                        | Battlecry: Summon two 1/1 Microbots.                                                                     |
| Midnight Drake            | OG_320                         | Battlecry: Gain +1 Attack for each other card in your hand.                                              |
| Mindrot Subjugator        | BE_093                         | Battlecry: Transform adjacent minions into a copy of this.                                               |
| Mojomaster Zihi           | TRL_564                        | Battlecry: Set each player to 5 Mana Crystals.                                                           |
| Mor'shan Elite            | BAR_846                        | Taunt. Battlecry: If your hero attacked this turn, summon a copy of this.                                |
| Mother Duck               | EDR_492                        | Battlecry:& Summon three 1/1 Ducklings with Rush.                                                        |
| Muck Hunter               | GIL_682                        | Rush Battlecry: Summon two 2/1 Mucklings for your opponent.                                              |
| Muckborn Servant          | REV_947                        | Taunt Battlecry: Discover a Paladin card.                                                                |
| Mukla, Tyrant of the Vale | OG_122                         | Battlecry: Add 2 Bananas to your hand.                                                                   |
| Murloc Tidehunter         | CORE_EX1_506                   | Battlecry: Summon a 1/1 Murloc Scout.                                                                    |
| Museum Curator            | LOE_006, WON_056               | Battlecry: Discover a Deathrattle card. It costs (1) less.                                               |
| Mystery Winner            | DMF_122                        | Battlecry: Discover a Secret.                                                                            |
| Naga Corsair              | CFM_651                        | Battlecry: Give your weapon +1 Attack.                                                                   |
| Neferset Ritualist        | ULD_196                        | Battlecry: Restore adjacent minions to full Health.                                                      |
| Nerubian Swarmguard       | CORE_RLK_062, RLK_062          | Taunt Battlecry: Summon two copies of this minion.                                                       |
| Nesting Roc               | UNG_801                        | Battlecry: If you control at least 2 other minions, gain Taunt.                                          |
| Netherspite Historian     | CORE_KAR_062, KAR_062          | Battlecry: If you're holding a Dragon, Discover a Dragon.                                                |
| Netherwalker              | BT_321, CORE_BT_321            | Battlecry:& Discover a Demon.                                                                            |
| Night Prowler             | GIL_624                        | Battlecry: If this is the only minion on the battlefield, gain +3/+3.                                    |
| Nightbane Templar         | KAR_010                        | Battlecry: If you're holding a Dragon, summon two 1/1 Whelps.                                            |
| North Sea Kraken          | AT_103                         | Battlecry: Deal 4 damage.                                                                                |
| Northwatch Commander      | BAR_876                        | Battlecry: If you control a Secret, draw a minion.                                                       |
| Nozari                    | DAL_581                        | Battlecry: Restore both heroes to full Health.                                                           |
| Nozdormu the Timeless     | DRG_309                        | Battlecry: Set each player to 10 Mana Crystals.                                                          |
| Occult Conjurer           | DMF_106                        | Battlecry: If you control a Secret, summon a copy of this.                                               |
| Omega Agent               | BOT_536                        | Battlecry: If you have 10 Mana Crystals, summon 2 copies of this minion.                                 |
| Omega Defender            | BOT_296                        | Taunt Battlecry: If you have 10 Mana Crystals, gain +10 Attack.                                          |
| Omega Devastator          | DAL_770                        | Battlecry: If you have 10 Mana Crystals, deal 10 damage to a minion.                                     |
| Omega Medic               | BOT_216                        | Battlecry: If you have 10 Mana Crystals, restore #10 Health to your hero.                                |
| Onyxian Drake             | ONY_024                        | Taunt Battlecry: Deal damage equal to your Armor to an enemy minion.                                     |
| Opera Soloist             | ETC_034                        | Battlecry: If you control no other minions, deal 3 damage to all enemy minions.                          |
| Paparazzi                 | ETC_326                        | Battlecry: Discover a Legendary minion.                                                                  |
| Parched Desperado         | WW_407                         | Battlecry: If you've cast a spell while holding this, give your hero +3 Attack this turn.                |
| Party Fiend               | VAC_940                        | Battlecry: Summon two 1/1 Felbeasts. Deal 3 damage to your hero.                                         |
| Pharaoh Cat               | ULD_186                        | Battlecry: Add a random Reborn minion to your hand.                                                      |
| Pip the Potent            | WW_394                         | Battlecry: Copy each 1-Cost card in your hand.                                                           |
| Pit Crocolisk             | ULD_190                        | Battlecry: Deal 5 damage.                                                                                |
| Plaguebringer             | EX1_191                        | Battlecry: Give a friendly minion Poisonous.                                                             |
| Plucky Paintfin           | TOY_517                        | Poisonous Battlecry: Draw a Rush minion.                                                                 |
| Potion Vendor             | DAL_544                        | Battlecry: Restore #2 Health to all friendly characters.                                                 |
| Priest of An'she          | BAR_313, CORE_BAR_313          | Taunt. Battlecry: If you've restored Health this turn,& gain +3/+3.                                      |
| Priestess of Elune        | EX1_583                        | Battlecry: Restore #4 Health to your hero.                                                               |
| Primalfin Lookout         | UNG_937                        | Battlecry: If you control another Murloc, Discover a Murloc.                                             |
| Primordial Bear           | BE_855                         | Battlecry:& Give your hero this minion's Attack this turn.                                               |
| Primordial Drake          | CORE_UNG_848, UNG_848          | Taunt Battlecry:& Deal 2 damage to all other minions.                                                    |
| Primordial Explorer       | DRG_254                        | Poisonous Battlecry:& Discover a Dragon.                                                                 |
| Prince Keleseth           | ICC_851                        | Battlecry: If your deck has no 2-Cost cards, give all minions in your deck +1/+1.                        |
| Prince Taldaram           | ICC_852                        | Battlecry: If your deck has no 3-Cost cards, transform into a 3/3 copy of a minion.                      |
| Prince Valanar            | ICC_853                        | Battlecry: If your deck has no 4-Cost cards, gain Lifesteal and Taunt.                                   |
| Prismatic Elemental       | RLK_547                        | Battlecry: Discover a spell from any class. It costs (1) less.                                           |
| Quicksand Elemental       | ULD_197                        | Battlecry: Give all enemy minions -2 Attack this turn.                                                   |
| Ram Wrangler              | AT_010                         | Battlecry: If you have a Beast, summon a random Beast.                                                   |
| Ramkahen Wildtamer        | ULD_151                        | Battlecry: Copy a random Beast in your hand.                                                             |
| Ratchet Privateer         | BAR_061                        | Battlecry: Give your weapon +1 Attack.                                                                   |
| Ravaging Ghoul            | CORE_OG_149, OG_149            | Battlecry: Deal 1 damage to all other minions.                                                           |
| Ravencaller               | GIL_212                        | Battlecry: Add two random 1-Cost minions to your hand.                                                   |
| Recombobulator            | GVG_108                        | Battlecry: Transform a friendly minion into a random minion with the same Cost.                          |
| Refreshment Vendor        | AT_111                         | Battlecry: Restore #4 Health to each hero.                                                               |
| Reliquary Seeker          | LOE_116                        | Battlecry: If you have 6 other minions, gain +4/+4.                                                      |
| Rend Blackhand            | BRM_029                        | Battlecry: If you're holding a Dragon, destroy a Legendary minion.                                       |
| Reno the Relicologist     | ULD_238                        | Battlecry: If your deck has no duplicates, deal 10 damage randomly split among all enemy minions.        |
| Ringmaster Whatley        | DMF_525                        | Battlecry: Draw a Mech, Dragon, and Pirate.                                                              |
| Rockpool Hunter           | UNG_073                        | Battlecry: Give a friendly Murloc +1/+1.                                                                 |
| Roosting Gargoyle         | REV_351                        | Battlecry: Give a friendly Beast +2 Attack.                                                              |
| Rotnest Drake             | YOD_036                        | Battlecry: If you're holding a Dragon, destroy a random enemy minion.                                    |
| Rotten Rodent             | RLK_216                        | Battlecry: Reduce the Cost of all Deathrattle cards in your deck by (1).                                 |
| Runefueled Golem          | TTN_714                        | Battlecry: Discover a weapon from any class.                                                             |
| Sailboat Captain          | VAC_937                        | Battlecry: Give a friendly Pirate Windfury.                                                              |
| Sandbinder                | GIL_581                        | Battlecry: Draw an Elemental from your deck.                                                             |
| Sandwasp Queen            | ULD_439                        | Battlecry: Add two 2/1 Sandwasps to your hand.                                                           |
| Saxophone Soloist         | ETC_358                        | Battlecry: If you control no other minions, add a Saxophone Soloist to your hand.                        |
| Scalelord                 | YOD_043                        | Battlecry: Give your Murlocs Divine Shield.                                                              |
| Scalerider                | DRG_081                        | Battlecry: If you're holding a Dragon, deal 2 damage.                                                    |
| Scaleworm                 | GIL_601                        | Battlecry: If you're holding a Dragon, gain +1 Attack and Rush.                                          |
| Scarab Keychain           | TOY_006                        | Battlecry: Discover a 2-Cost card.                                                                       |
| Scarlet Webweaver         | ULD_410                        | Battlecry: Reduce the Cost of a random Beast in your hand by (5).                                        |
| Scorchreaver              | FIR_952                        | Battlecry: Discover a Fel spell.& Reduce the Cost of Fel spells in your hand by (1).                     |
| Scorp-o-matic             | LOOT_111                       | Battlecry: Destroy a minion with 1 or less Attack.                                                       |
| Scuttlebutt Ghoul         | REV_900                        | Taunt Battlecry: If you control a Secret, summon a copy of this.                                         |
| Seascout Operator         | TSC_646                        | Battlecry: If you control a Mech, summon two 2/1 Mechafish.                                              |
| Selective Breeder         | LEG_CS3_015                    | Battlecry: Discover a copy of a Beast in your deck.                                                      |
| Servant of Kalimos        | UNG_816                        | Battlecry: If you played an Elemental last turn, Discover an Elemental.                                  |
| Servant of Zuramat        | BE_228                         | Battlecry: Silence a minion.                                                                             |
| Sewer Crawler             | LOOT_069                       | Battlecry: Summon a 2/3 Giant Rat.                                                                       |
| Shadowbomber              | GVG_009, WON_062               | Battlecry: Deal 3 damage to each hero.                                                                   |
| Shadowhoof Slayer         | BT_142                         | Battlecry: Give your hero +1 Attack this turn.                                                           |
| Shadowy Figure            | DAL_030                        | Battlecry: Transform into a 2/2 copy of a friendly Deathrattle minion.                                   |
| Shady Dealer              | AT_032                         | Battlecry: If you have a Pirate, gain +1/+1.                                                             |
| Shale Spider              | DEEP_034                       | Battlecry: If you played an Elemental last turn, draw a card.                                            |
| Shattered Rumbler         | BT_114                         | Battlecry: If you cast a spell last turn, deal 2 damage to all other minions.                            |
| Shieldbreaker             | TRL_524                        | Battlecry: Silence an enemy minion with Taunt.                                                           |
| Shimmering Sunfish        | TSC_060                        | Battlecry: If you're holding a Holy spell, gain Taunt and Divine Shield.                                 |
| Shimmering Tempest        | UNG_846                        | Battlecry: Add a random Mage spell to your hand.                                                         |
| Shroom Brewer             | LOOT_291                       | Battlecry: Restore #4 Health.                                                                            |
| Shrubadier                | DRG_312                        | Battlecry: Summon a 2/2 Treant.                                                                          |
| Silver Hand Knight        | CS2_151                        | Battlecry: Summon a 2/2 Squire.                                                                          |
| Skeletal Sidekick         | RLK_958                        | Battlecry: Give a friendly Undead +2 Attack.                                                             |
| Sketchy Stranger          | REV_945                        | Battlecry: Discover a Secret from another class.                                                         |
| Sky Mother Aviana         | TOY_806                        | Battlecry: Shuffle 10 random Legendary minions into your deck. They cost (1).                            |
| Sky Raider                | CORE_DRG_024, DRG_024          | Battlecry:& Add a random Pirate to your hand.                                                            |
| Skydiving Instructor      | YOD_028                        | Battlecry: Summon a 1-Cost minion from your deck.                                                        |
| Skyfin                    | DRG_072                        | Battlecry: If you're holding a Dragon, summon 2 random Murlocs.                                          |
| Sleetbreaker              | AV_260                         | Battlecry: Add a Windchill to your hand.                                                                 |
| Smothering Starfish       | TSC_926                        | Battlecry: Silence ALL other minions.                                                                    |
| Snowblind Harpy           | AV_112                         | Battlecry: If you're holding a Frost spell, gain 5 Armor.                                                |
| Snowfall Guardian         | AV_255                         | Battlecry: Freeze all other minions.                                                                     |
| Soldier of the Bronze     | TIME_720                       | Taunt Battlecry:& Double this minion's Health.                                                           |
| Soldier of the Infinite   | TIME_051                       | Rush Battlecry:& Double this minion's Attack.                                                            |
| South Coast Chieftain     | BAR_040                        | Battlecry: If you control another Murloc, deal 2 damage.                                                 |
| Spark Engine              | BOT_538                        | Battlecry: Add a 1/1 Spark with Rush to your hand.                                                       |
| Sparring Partner          | AT_069                         | Taunt Battlecry: Give a minion Taunt.                                                                    |
| Spawn of Deathwing        | ONY_035                        | Battlecry: Destroy a random enemy minion. Discard a random card.                                         |
| Spellbreaker              | EX1_048                        | Battlecry: Silence a minion.                                                                             |
| Spellcoiler               | TSC_643                        | Battlecry: If you've cast a spell while holding this, Discover a spell.                                  |
| Spice Bread Baker         | SW_056                         | Battlecry: Restore Health to your hero equal to your hand size.                                          |
| Spinetail Drake           | WW_820                         | Battlecry: If you're holding a Dragon, deal 5 damage to an enemy minion.                                 |
| Splish-Splash Whelp       | WW_819                         | Battlecry: If you're holding a Dragon, gain an empty Mana Crystal.                                       |
| Spring Rocket             | BOT_308                        | Battlecry: Deal 2 damage.                                                                                |
| Springpaw                 | TRL_348                        | Rush Battlecry: Add a 1/1 Lynx with Rush to your hand.                                                   |
| Stablemaster              | AT_057                         | Battlecry: Give a friendly Beast Immune this turn.                                                       |
| Stage Hand                | DMF_531                        | Battlecry: Give a random minion in your hand +1/+1.                                                      |
| Stampeding Kodo           | NEW1_041                       | Battlecry: Destroy a random enemy minion with 2 or less Attack.                                          |
| Steam Guardian            | TTN_468                        | Battlecry: Draw a spell. Reduce the Cost of a random Fire spell in your hand by (1).                     |
| Steam Surger              | UNG_021                        | Battlecry: If you played an Elemental last turn, add a 'Flame Geyser' to your hand.                      |
| Steel Beetle              | YOD_040                        | Battlecry: If you're holding a spell that costs (5) or more, gain 5 Armor.                               |
| Stitched Tracker          | ICC_415                        | Battlecry: Discover a copy of a minion in your deck.                                                     |
| Stockades Guard           | SW_067                         | Battlecry: Give a friendly minion Taunt.                                                                 |
| Stonehill Defender        | Core_UNG_072, UNG_072          | Taunt Battlecry: Discover a Taunt minion.                                                                |
| Stoneskin Armorer         | TTN_469                        | Battlecry: If your Armor changed this turn, draw 2 cards.                                                |
| Storm Chaser              | BOT_291                        | Battlecry: Draw a spell from your deck that costs (5) or more.                                           |
| Stormwind Freebooter      | SW_093                         | Battlecry: Give your hero +2 Attack this turn.                                                           |
| Stormwind Guard           | SW_054                         | Taunt Battlecry: Give adjacent minions +1/+1.                                                            |
| Street Sweeper            | RLK_104                        | Battlecry: Deal 2 damage to all other minions.                                                           |
| Strongshell Scavenger     | ICC_807                        | Battlecry: Give your Taunt minions +2/+2.                                                                |
| Subject 9                 | BOT_573                        | Battlecry: Draw 5 different Secrets from your deck.                                                      |
| Sunborne Val'kyr          | ICC_028                        | Battlecry: Give adjacent minions +2 Health.                                                              |
| Sunfury Protector         | CORE_EX1_058, EX1_058          | Battlecry: Give adjacent minions Taunt.                                                                  |
| Sunkeeper Tarim           | UNG_015                        | Taunt Battlecry: Set all other minions' Attack and Health to 3.                                          |
| Sunreaver Spy             | DAL_086                        | Battlecry: If you control a Secret, gain +1/+1.                                                          |
| Sunreaver Warmage         | DAL_539                        | Battlecry: If you're holding a spell that costs (5) or more, deal 4 damage.                              |
| Swashburglar              | CORE_KAR_069, KAR_069          | Battlecry:& Add a random card from another class to your hand.                                           |
| Tainted Remnant           | YOG_519                        | Battlecry: If you played an Elemental last turn, deal 7 damage randomly split between all enemies.       |
| Tanglefur Mystic          | GIL_213                        | Battlecry: Add a random 2-Cost minion to each player's hand.                                             |
| Temple Enforcer           | EX1_623                        | Battlecry: Give a friendly minion +3 Health.                                                             |
| Tending Dragonkin         | FIR_960                        | Battlecry:& Copy the lowest Cost Beast in your hand.                                                     |
| Thassarian                | RLK_223                        | Reborn Battlecry and Deathrattle:& Deal 2 damage to a random enemy.                                      |
| The Boom Reaver           | DAL_070                        | Battlecry: Summon a copy of a minion in your deck. Give it Rush.                                         |
| The Countess              | REV_951                        | Battlecry: If your deck has no Neutral cards, add 3 Legendary Invitations to your hand.                  |
| The Curator               | CORE_KAR_061, KAR_061          | Taunt Battlecry:& Draw a Beast, Dragon, and Murloc.                                                      |
| Thornveil Tentacle        | TTN_456                        | Lifesteal Battlecry: Deal 2 damage to a random enemy minion.                                             |
| Timeline Accelerator      | WON_139                        | Battlecry: Draw a Mech. It costs (2) less.                                                               |
| Tiny Worldbreaker         | YOG_527                        | Battlecry: If you control another Mech, deal 4 damage.                                                   |
| Toad of the Wilds         | BAR_743                        | Taunt Battlecry: If you're holding a Nature spell, gain +2 Health.                                       |
| Tol'vir Stoneshaper       | UNG_070                        | Battlecry: If you played an Elemental last turn, gain Taunt and Divine Shield.                           |
| Tol'vir Warden            | UNG_913                        | Battlecry: Draw two 1-Cost minions from your deck.                                                       |
| Tomb Spider               | LOE_047                        | Battlecry: Discover a Beast.                                                                             |
| Tomb Warden               | ULD_253                        | Taunt Battlecry: Summon a copy of this minion.                                                           |
| Tortollan Forager         | UNG_078                        | Battlecry: Add a random minion with 5 or more Attack to your hand.                                       |
| Tower Sergeant            | AV_125                         | Battlecry: If you control at least 2 other minions, gain +2/+2.                                          |
| Town Crier                | GIL_580                        | Battlecry: Draw a Rush minion from your deck.                                                            |
| Toxfin                    | DAL_077                        | Battlecry: Give a friendly Murloc Poisonous.                                                             |
| Toxicologist              | BOT_083                        | Battlecry: Give your weapon +1 Attack.                                                                   |
| Traveling Healer          | DAL_078                        | Divine Shield Battlecry: Restore #3 Health.                                                              |
| Trinket Tracker           | NX2_014                        | Battlecry: Draw a 1-Cost spell.                                                                          |
| Triplewick Trickster      | TOY_370                        | Battlecry: Deal 2 damage to a random enemy, three times.                                                 |
| Trogg Beastrager          | CFM_338                        | Battlecry: Give a random Beast in your hand +1/+1.                                                       |
| Troll Batrider            | DRG_067                        | Battlecry: Deal 3 damage to a random enemy minion.                                                       |
| Twilight Drake            | CORE_EX1_043, EX1_043          | Battlecry: Gain +1 Health for each card in your hand.                                                    |
| Twilight Flamecaller      | OG_083                         | Battlecry: Deal 1 damage to all enemy minions.                                                           |
| Twilight Guardian         | AT_017                         | Battlecry: If you're holding a Dragon, gain +1 Attack and Taunt.                                         |
| Twilight Mistress         | CATA_201                       | Battlecry: Return all enemy minions to their owner's hand.                                               |
| Twilight Whelp            | BRM_004                        | Battlecry: If you're holding a Dragon, gain +2 Health.                                                   |
| Twin-fin Fin Twin         | TSC_960                        | Rush. Battlecry: Summon a copy of this.                                                                  |
| Underbelly Fence          | DAL_714                        | Battlecry: If you're holding a card from another class, gain +1/+1 and Rush.                             |
| Upgraded Repair Bot       | GVG_083                        | Battlecry: Give a friendly Mech +4 Health.                                                               |
| Vaultkeeper               | BE_151                         | Battlecry and Deathrattle:& Give adjacent minions +2/+2.                                                 |
| Venomous Scorpid          | BAR_065                        | Poisonous Battlecry: Discover a spell.                                                                   |
| Violet Spellsword         | DAL_095                        | Battlecry: Gain +1 Attack for each spell in your hand.                                                   |
| Virmen Sensei             | WON_300                        | Battlecry: Give a friendly Beast +3/+3.                                                                  |
| Void Flayer               | BAR_307                        | Battlecry: For each spell in your hand, deal 1 damage to a random enemy minion.                          |
| Void Ripper               | LOOT_529                       | Battlecry: Swap the Attack and Health of all other minions.                                              |
| Wailing Soul              | FP1_016                        | Battlecry: Silence your other minions.                                                                   |
| War Master Voone          | TRL_328                        | Battlecry: Copy all Dragons in your hand.                                                                |
| Warden of Chains          | AV_262                         | Taunt Battlecry: If you're holding a Demon that costs (5) or more, gain +1/+2.                           |
| Wartbringer               | TRL_522                        | Battlecry: If you played 2 spells this turn, deal 2 damage.                                              |
| Weaver of the Cycle       | EDR_472                        | Battlecry: If you're holding a spell that costs (5) or more, deal 3 damage.                              |
| Whirlweaver               | NX2_003                        | Battlecry: If you've cast a spell last turn, Discover an Elemental.                                      |
| Widowbloom Seedsman       | REV_318                        | Battlecry: Draw a Nature spell. Gain an empty Mana Crystal.                                              |
| Wildwalker                | AT_040                         | Battlecry: Give a friendly Beast +3 Health.                                                              |
| Windspeaker               | EX1_587                        | Battlecry: Give a friendly minion Windfury.                                                              |
| Winterspring Whelp        | CATA_484                       | Battlecry:& Discover a 1-Cost spell from any class.                                                      |
| Witch's Apprentice        | CORE_GIL_531, GIL_531          | Taunt Battlecry: Add a random Shaman spell to your hand.                                                 |
| Wolpertinger              | SCH_133                        | Battlecry: Summon a copy of this.                                                                        |
| Wriggling Horror          | DMF_091                        | Battlecry: Give adjacent minions +1/+1.                                                                  |
| Wyrmguard                 | GIL_526                        | Battlecry: If you're holding a Dragon, gain +1 Attack and Taunt.                                         |
| Wyrmrest Agent            | AT_116                         | Battlecry: If you're holding a Dragon, gain +1 Attack and Taunt.                                         |
| Ymirjar Frostbreaker      | RLK_110                        | Battlecry: Gain +1 Attack for each Frost spell in your hand.                                             |
| Youthful Brewmaster       | EX1_049                        | Battlecry: Return a friendly minion from the battlefield to your hand.                                   |
| Zul'Drak Ritualist        | DRG_064                        | Taunt Battlecry: Summon three random 1-Cost minions for your opponent.                                   |
