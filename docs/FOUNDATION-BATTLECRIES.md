# Foundation Battlecry implementation pass

The original candidate list is frozen at commit 667d3f0: **315 unique names**. **250 are implemented across every listed printing; 65 remain blocked.** The initial grouping was a planning estimate. It was too optimistic about custom tokens, named pools, identity/history, Kindred and target choices. This pass does not claim all 315 are finished.

Total supported Battlecry names: **1080**, up from **648**. Shared patterns also added 182 names outside the frozen list: Aessina; Air Guitarist; Alara'shi; Alexstrasza the Life-Binder; Amalgam of the Deep; Amorphous Slime; Anka, the Buried; Arathi Weaponsmith; Arcane Golem; Arch-Villain Rafaam; Astral Vigilant; Audio Amplifier; Baleful Blazer; Ball Hog; Barista Lynchen; Bearon Gla'shear; Blackscale Brute; Bloodsail Corsair; Bloodsail Raider; Bloodsworn Mercenary; Bone Flinger; Brood Keeper; Cabaret Headliner; Captain Galvangar; Carnivorous Cube; Celestial Projectionist; Cera'thine Fleetrunner; Cloud Serpent; Clownfish; Commander Sivara; Conservator Nymph; Coral Keeper; Countess Ashmore; Crimson Commander; Crystal Stag; Darkspeaker; Death Blossom Whomper; Dimensional Weaponsmith; Dragon Breeder; Dragoncaller Alanna; Dragoncaster; Druid of the Fang; Elemental of Madness; Energy Shaper; Envoy of the Glade; Eternal Sentinel; Ethereal Peddler; Expired Merchant; Faceless Manipulator; Fearless Flamejuggler; Felscale Evoker; Flowrider; Forbidden Ancient; Foxy Fraud; Freebird; Furbolg Mossbinder; Furnacefire Colossus; Future Emissary; Gluttonous Ooze; Gral, the Shark; Green-Thumb Gardener; Grimestreet Informant; Grimtotem Buzzkill; Gurubashi Hypemon; Harrison Jones; Hedra the Heretic; Hellraiser; High Cultist Basaleph; Hoard Pillager; Hullbreaker; Immortal; Ingenious Artificer; Ini Stormcoil; Inkmaster Solia; Inquisitive Creation; Invincible; Joymancer Jepetto; Kabal Courier; Kaja'mite Creation; Kargal Battlescar; Kathrena Winterwisp; King Phaoris; Kobold Stickyfinger; Krag'wa, the Frog; Lady Ashvane; Lady Prestor; Lilian Voss; Living Prairie; Loan Shark; Lord Barov; Lotus Agents; Luckydo Buccaneer; Lunar Trailblazer; Madam Goya; Mailbox Dancer; Mana Cyclone; Menagerie Warden; Merithra; Metamorfin; Mindflayer Kaahrj; Mirage Caller; Moat Lurker; Muckmorpher; Multicaster; Naga Sand Witch; Nerubian Flyer; Nerubian Vizier; Nethersoul Buster; Nobleman; Nordrassil Druid; Northshire Farmer; Noxious Infiltrator; Obsidiansmith; Origami Crane; Origami Dragon; Origami Frog; Ozruk; Phantom Freebooter; Pogo-Hopper; Power Slider; Pride Seeker; Priestess Valishj; Primordial Overseer; Primus of Power; Prince Liam; Prize Vendor; Queensguard; Rattling Rascal; Ravenous Kraken; Razzle-Dazzler; Rimescale Siren; Rock Master Voone; Rummaging Kobold; Sathrovarr; Scarlet Purifier; Scorchfist Scholar; Scrappy Scavenger; Sea Shill; Seeping Oozeling; Selfless Sidekick; Shadowblade Slinger; Shadowcaster; Shapeless Constellation; SI:7 Informant; SI:7 Smuggler; Snakebite; Spacerock Collector; Spelunker; Spire Security; Spiteful Summoner; Splintergraft; Steeldancer; Stone Sentinel; Swarthy Swordshiner; Swiftscale Trickster; Sword Eater; Teron Gorefiend; The Nameless One; Thorim, Stormlord; Tinkmaster Overspark; Toxic Sewer Ooze; Treespeaker; Twilight Acolyte; Twilight Medium; Unchained Gladiator; Undefeated Champion; Unliving Champion; Vanndar Stormpike; Vol'jin; Voodoo Doll; Weapons Attendant; Weapons Expert; Wicked Skeleton; Wizened Truthseeker; Wizened Wildspeaker; Wretched Reclaimer; Wyrmrest Purifier; Xyrella; Ysiel Windsinger; Zandalari Templar; Zaqali Flamemancer; Zola the Gorgon. Counts come from the actual support registry. Alternate printings do not inflate name counts.

The new shared transactions cover linked draws, temporary Costs, Dredge rewards, consumed live stats, random keyword grants, tribal selection, future-play buffs, full-hand/board limits, deck ordering, burn/draw replacement, hero Divine Shield and permanent minion Immunity. Boom Bots have their Deathrattles; Ice Shards and Water Elementals freeze on damage, including retaliation, and respect Shield and Silence. Unrecognized clauses still block the whole source card. Generation can produce cards with separately unimplemented abilities; these stay explicitly labeled and cannot be played. Summoned special passives are enabled only when their behavior is handled.

Three new [test decks](TEST-DECKS.md) provide guided openings: Token Workshop, Hungry Board and Deck Laboratory. Current hand Costs are visible, queued buffs and expanded hand limits appear in Active effects, and hero Divine Shield is displayed. No database/schema, Storage, image upload or cloud deployment changes are required.

## Implemented candidates

| Minion | Printings | Full printed rules |
| --- | --- | --- |
| Abyssal Summoner | DRG_207 | Battlecry: Summon a Demon with Taunt and stats equal to your hand size. |
| Alleycat | CFM_315 | Battlecry: Summon a 1/1 Cat. |
| Arator the Redeemer | MEND_804 | Battlecry: Double the stats of all friendly Silver Hand Recruits and give them Taunt. |
| Arcanosmith | KAR_710 | Battlecry: Summon a 0/5 minion with Taunt. |
| Archwitch Willow | CORE_SCH_181, SCH_181 | Battlecry: Summon a random Demon from your hand and deck. |
| Argent Braggart | SCH_149 | Battlecry: Set this minion's Attack and Health to the highest in the battlefield. |
| Ashtongue Slayer | BT_702 | Battlecry: Give a Stealthed minion +3 Attack and Immune this turn. |
| Astromancer | BOT_256, CORE_BOT_256 | Battlecry: Summon a random minion with Cost equal to your hand size. |
| Azsharan Mooncatcher | TSC_644 | Divine Shield. Battlecry: Put a 'Sunken Mooncatcher' on the bottom of your deck. |
| Azsharan Scavenger | TSC_039 | Battlecry: Put a 'Sunken Scavenger' on the bottom of your deck. |
| Azsharan Sweeper | TSC_776 | Battlecry: Put a 'Sunken Sweeper' on the bottom of your deck. |
| Balinda Stonehearth | AV_284 | Battlecry: Draw 2 spells. Swap their Costs with this minion's stats. |
| Balloon Merchant | DMF_235 | Battlecry: Give your Silver Hand Recruits +1 Attack and Divine Shield. |
| Baritone Imp | ETC_068 | Battlecry: Take Fatigue damage. Gain that much Attack and Health. |
| Barnes | KAR_114 | Battlecry: Summon a 1/1 copy of a random minion in your deck. |
| Bartend-O-Bot | WW_408 | Battlecry: Draw an Outcast card and slide it to the left side of your hand. |
| Beanstalk Brute | EDR_230 | Battlecry: Give +4/+4 to the top 3 minions in your deck. |
| Big-Time Racketeer | CFM_648 | Battlecry: Summon a 6/6 Ogre. |
| Blazing Accretion | GDB_302 | Battlecry: Destroy the top 3 cards of your deck. Any Fire spells or Elementals are drawn instead. |
| Blink Fox | GIL_827 | Battlecry: Add a random card to your hand (from your opponent's class). |
| Blood Knight | EX1_590 | Battlecry: All minions lose Divine Shield. Gain +3/+3 for each Shield lost. |
| Bloodsail Flybooter | DRG_035 | Battlecry: Add two 1/1 Pirates to your hand. |
| Bloodsail Howler | TRL_071 | Rush Battlecry: Gain +1/+1 for each other Pirate you control. |
| Booty Bay Bookie | TRL_504 | Battlecry: Give your opponent a Coin. |
| Bright-Eyed Scout | UNG_113 | Battlecry: Draw a card. Change its Cost to (5). |
| Bronze Dragonknight | WON_052 | Taunt. Battlecry: If this has 5 or more Attack, summon a copy of this. |
| Bugsquasher | TLC_633 | Battlecry: Deal 6 damage to an enemy minion with a minion type. |
| Busy-Bot | WORK_002 | Battlecry: Give your 1-Attack minions +1/+1. |
| Bwonsamdi, the Dead | TRL_260 | Battlecry: Draw 1-Cost minions from your deck until your hand is full. |
| C'Thun | OG_280, WON_135 | Battlecry: Deal damage equal to this minion's Attack randomly split among all enemies. |
| Captain Hooktusk | TRL_126 | Battlecry: Summon 3 Pirates from your deck. Give them Rush. |
| Caricature Artist | TOY_391 | Battlecry: Draw a minion that costs (5) or more. Give it a funny mustache! |
| Catch of the Day | VAC_412 | Rush Battlecry: Summon a 2/1 Worm for your opponent. |
| Chalk Artist | TOY_388 | Battlecry: Draw a minion. Transform it into a random Legendary one (keeping its original stats and Cost). |
| Chef Nomi | DAL_554 | Battlecry: If your deck is empty, summon six 6/6 Greasefire Elementals. |
| Cobalt Spellkin | DRG_075 | Battlecry: Add two 1-Cost spells from your class to your hand. |
| Coldlight Oracle | EX1_050 | Battlecry: Each player draws 2 cards. |
| Coldwraith | ICC_252 | Battlecry: If an enemy is Frozen, draw a card. |
| Colifero the Artist | TOY_703 | Battlecry: Draw a minion. Transform all other friendly minions into copies of it. |
| Corpsetaker | ICC_912 | Battlecry: Gain Taunt if your deck has a Taunt minion. Repeat for Divine Shield, Lifesteal, Windfury. |
| Corrupted Seer | OG_161 | Battlecry: Deal 2 damage to all non-Murloc minions. |
| Crazed Conductor | ETC_070 | Battlecry: Take Fatigue damage. Summon that many 3/3 Imps. |
| Crow's Nest Lookout | DED_507 | Battlecry: Deal 2 damage to the left and right-most enemy minions. |
| Crud Caretaker | REV_936 | Battlecry: Summon a 3/5 Elemental with Taunt. |
| Cryomancer | CFM_671 | Battlecry: If an enemy is Frozen, gain +2/+2. |
| Cryopractor | VAC_327 | Battlecry: Give a minion +3/+3 and Freeze it. |
| Cumulo-Maximus | DRG_223 | Battlecry: If you have Overloaded Mana Crystals, deal 5 damage. |
| Curious Grimlynx | BE_850t | Taunt. Battlecry: Summon a {0}/{1} Beast with Rush. (It has the opposite stats of this minion!) |
| Deathwing | NEW1_030 | Battlecry: Destroy all other minions and discard your hand. |
| Deathwing the Destroyer | LEG_CS3_036 | Battlecry: Destroy all other minions. Discard a card for each destroyed. |
| Deepwater Evoker | DED_516 | Battlecry: Draw a spell. Gain Armor equal to its Cost. |
| Derailed Coaster | DMF_202 | Battlecry: Summon a 1/1 Rider with Rush for each minion in your hand. |
| Desert Camel | LOE_020 | Battlecry: Put a 1-Cost minion from each deck into the battlefield. |
| Desert Hare | ULD_719 | Battlecry: Summon two 1/1 Desert Hares. |
| Devout Dungeoneer | WC_013 | Battlecry: Draw a spell. If it's a Holy spell, reduce its Cost by (2). |
| Dinner Performer | REV_020 | Battlecry: Summon a random minion from your deck that you can afford to play. |
| Dirty Rat | CFM_790, CORE_CFM_790 | Taunt Battlecry: Your opponent summons a random minion from their hand. |
| Disarming Elemental | TID_700 | Battlecry: Dredge for your opponent. Set its Cost to (6). |
| Disciple of Demise | TIME_EVENT_301 | Battlecry: Randomly destroy another minion. Repeat for each Dragon you're holding. |
| Dispatch Kodo | CFM_335 | Battlecry: Deal damage equal to this minion's Attack. |
| Divine Augur | TIME_429 | Battlecry: Set the Attack and Health of every minion in your hand to the higher of the two stats. |
| Dr. Boom | GVG_110 | Battlecry: Summon two 1/1 Boom Bots. WARNING: Bots may explode. |
| Dragonmaw Poacher | DRG_063 | Battlecry: If your opponent controls a Dragon, gain +4/+4 and Rush. |
| Dragonqueen Alexstrasza | DRG_089 | Battlecry: If your deck has no duplicates, add 2 other random Dragons to your hand. They cost (0). |
| Drakkari Embalmer | RLK_119 | Battlecry: Give a friendly Undead Reborn. |
| Dread Infernal | CS2_064 | Battlecry: Deal 1 damage to ALL other characters. |
| Dreamboat | ETC_332 | Battlecry: Restore 3 Health to all other friendly minions. Gain +1/+1 for each one Overhealed. |
| Drek'Thar | AV_100 | Battlecry: If this costs more than every minion in your deck, summon one of those minions. |
| Elder Nadox | RLK_658 | Battlecry: Destroy a friendly Undead. Your minions gain its Attack. |
| Elise the Enlightened | ULD_139 | Battlecry: If your deck has no duplicates, duplicate your hand. |
| Elitist Snob | REV_961 | Battlecry: For each Paladin card in your hand, randomly gain Divine Shield, Lifesteal, Rush, or Taunt. |
| Endangered Dodo | TIME_703 | Taunt Battlecry: If you have 10 or less Health, gain +5/+5 and summon a copy of this. |
| Enhance-o Mechano | GVG_107 | Battlecry: Give your other minions Windfury, Taunt, or Divine Shield (at random). |
| Envoy of Prosperity | WORK_031 | Battlecry: Put the highest Cost card in your hand on top of your deck. |
| EVIL Cable Rat | DAL_400 | Battlecry: Add a Lackey to your hand. |
| EVIL Genius | DAL_606 | Battlecry: Destroy a friendly minion to add 2 random Lackeys to your hand. |
| EVIL Quartermaster | DRG_020 | Battlecry: Add a Lackey to your hand. Gain 3 Armor. |
| EVIL Recruiter | ULD_162 | Battlecry: Destroy a friendly Lackey to summon a 5/5 Demon. |
| Excavation Specialist | TSC_911 | Battlecry: Dredge. Reduce its Cost by (1). |
| Felerin, the Forgotten | RLK_215 | Battlecry: Add a random Outcast card to the left and right sides of your hand. They cost (2) less. |
| Felgorger | SW_043 | Battlecry: Draw a Fel spell. Reduce its Cost by (2). |
| Felguard | EX1_301 | Taunt Battlecry: Destroy one of your Mana Crystals. |
| Fiddlefire Imp | JAM_032 | Battlecry: Add a random Fire Mage and Fire Warlock spell to your hand. |
| Fight Promoter | CFM_328 | Battlecry: If you control a minion with 6 or more Health, draw two cards. |
| Fire Breather | DMF_110 | Battlecry: Deal 2 damage to all minions except Demons. |
| Fire Fly | CORE_UNG_809, UNG_809 | Battlecry: Add a 1/2 Elemental to your hand. |
| First Blade of Wrynn | SW_305 | Divine Shield Battlecry: Gain Rush if this has at least 4 Attack. |
| Flame Behemoth | TTN_716 | Battlecry: Get two random Magnetic Mechs. They cost (2) less. |
| Flight Master | DAL_747 | Battlecry: Summon a 2/2 Gryphon for each player. |
| Flik Skyshiv | DRG_037 | Battlecry: Destroy a minion and all copies of it (wherever they are). |
| Frantic Forger | JAIL_986 | Battlecry: Get a random playable spell. It is Temporary. |
| Frostweave Dungeoneer | WC_805 | Battlecry: Draw a spell. If it's a Frost spell, summon two 1/1 Elementals that Freeze. |
| Gaslight Gatekeeper | WW_398 | Battlecry: Shuffle your hand into your deck, then draw that many cards. |
| Getaway Hogdriver | JAIL_462 | Battlecry: Draw 2 cards. If they're both minions, gain Charge. |
| Ghastly Conjurer | ICC_069 | Battlecry: Add a 'Mirror Image' spell to your hand. |
| Giftwrapped Whelp | TOY_386 | Battlecry: If you're holding a Dragon, give it and this minion +1/+1. |
| Giggling Inventor | BOT_270 | Battlecry: Summon two 1/2 Mechs with Taunt and Divine Shield. |
| Glitter Moth | GIL_837 | Battlecry: If your deck has only odd-Cost cards, double the Health of your other minions. |
| Gloom Stag | GIL_130 | Taunt Battlecry: If your deck has only odd-Cost cards, gain +2/+2. |
| Gnomeferatu | CORE_ICC_407, ICC_407 | Battlecry: Remove the top card of your opponent's deck. |
| Gnomish Experimenter | GVG_092 | Battlecry: Draw a card. If it's a minion, transform it into a Chicken. |
| Golakka Crawler | UNG_807 | Battlecry: Destroy a Pirate and gain +1/+1. |
| Golakka Glutton | DED_523 | Battlecry: Destroy a Beast and gain +1/+1. |
| Greedy Partner | WW_901 | Battlecry: If you're holding another 2-Cost card, get a Coin. |
| Guild Recruiter | LOOT_375 | Battlecry: Recruit a minion that costs (4) or less. |
| Hailbringer | YOD_029 | Battlecry: Summon two 1/1 Ice Shards that Freeze. |
| Halazzi, the Lynx | CORE_TRL_900, TRL_900 | Rush. Battlecry: Fill your hand with 1/1 Lynxes that have Rush. |
| Hardcore Cultist | ETC_209 | Battlecry: Deal 2 damage. Finale: To all enemies. |
| Hardlight Protector | TIME_015 | Divine Shield Battlecry: Restore 3 Health to your hero and give them Divine Shield. |
| Hecklebot | DAL_058 | Taunt Battlecry: Your opponent summons a minion from their deck. |
| Hench-Clan Hag | DAL_087 | Battlecry: Summon two 1/1 Amalgams with all minion types. |
| Herald Volazj | OG_316 | Battlecry: Summon a 1/1 copy of each of your other minions. |
| High Exarch Yrel | DMF_241 | Battlecry: If your deck has no Neutral cards, gain Rush, Lifesteal, Taunt, and Divine Shield. |
| High Priest Thekal | TRL_308 | Battlecry: Convert all but 1 of your Hero's Health into Armor. |
| Hir'eek, the Bat | TRL_253 | Battlecry: Fill your board with copies of this minion. |
| Hodir, Father of Giants | TTN_752 | Battlecry: Set the stats of the next three minions you play to 8/8. |
| Hologram Operator | GDB_723 | Battlecry: Get 3 random Temporary Draenei. |
| Hungry Crab | NEW1_017 | Battlecry: Destroy a Murloc and gain +2/+2. |
| Ice Cream Peddler | TRL_533 | Battlecry: If you control a Frozen minion, gain 8 Armor. |
| Icebelt Magi | BE_270 | Battlecry: Draw two cards. For each that isn't a minion, summon a 3/6 Water Elemental. |
| Igneous Lavagorger | TID_714 | Taunt Battlecry: Dredge. Gain Armor equal to its Cost. |
| Injured Blademaster | CS2_181 | Battlecry: Deal 4 damage to HIMSELF. |
| K'thir Ritualist | DMF_081 | Taunt Battlecry: Add a random 4-Cost minion to your opponent's hand. |
| K9-0tron | TID_099 | Battlecry: Dredge. If it's a 1-Cost minion, summon it. |
| King Plush | TOY_357 | Charge Battlecry: Return all minions with less Attack than this to their owner's decks. |
| Kiri, Chosen of Elune | DMF_733 | Battlecry: Add a Solar Eclipse and Lunar Eclipse to your hand. |
| Kobold Taskmaster | AV_136 | Battlecry: Add 2 Armor Scraps to your hand that give +2 Health to a minion. |
| Krona, Keeper of Eons | TIME_705 | Taunt Battlecry: Set the Costs of the bottom 5 cards of your deck to (1). |
| Kronn the Impaler | BE_732 | Battlecry: All your minions deal damage equal to their Attack to a random enemy. |
| Lady in White | GIL_840 | Battlecry: Cast 'Inner Fire' on every minion in your deck (set Attack equal to Health). |
| Lightmaw Netherdrake | ONY_026 | Battlecry: If you're holding a Holy and a Shadow spell, deal 3 damage to all other minions. |
| Linedance Partner | WW_433 | Battlecry: If you're holding another 3-Cost card, summon a random 3-Cost minion. |
| Lord Godfrey | GIL_825 | Battlecry: Deal 2 damage to all other minions. If any die, repeat this Battlecry. |
| Lorekeeper Polkelt | SCH_428 | Battlecry: Reorder your deck from the highest Cost card to the lowest Cost card. |
| Mad Hatter | GIL_125 | Battlecry: Randomly toss 3 hats to other minions. Each hat gives +1/+1. |
| Mad Summoner | DAL_751 | Battlecry: Fill each player's board with 1/1 Imps. |
| Magatha, Bane of Music | JAM_036 | Battlecry: Draw 5 cards. Give any spells drawn to your opponent. |
| Malygos the Spellweaver | LEG_CS3_034 | Battlecry: Draw spells until your hand is full. |
| Man'ari Mosher | DMF_111 | Battlecry: Give a friendly Demon +3 Attack and Lifesteal this turn. |
| Marsh Drake | GIL_683 | Battlecry: Summon a 2/1 Poisonous Drakeslayer for your opponent. |
| Master Oakheart | LOOT_521 | Battlecry: Recruit a 1, 2, and 3-Attack minion. |
| Menagerie Jug | WON_142 | Battlecry: Give 3 random friendly minions of different minion types +2/+2. |
| Menagerie Mug | CORE_WON_141, WON_141 | Battlecry: Give 3 random friendly minions of different minion types +1/+1. |
| Mister Mukla | ETC_836 | Rush. Battlecry: Fill your opponent's hand with Bananas. |
| Morchok | CATA_570 | Battlecry: Draw a card and reduce its Cost by (10). Repeat this with excess Cost reduction. |
| Mossy Horror | GIL_124 | Battlecry: Destroy all other minions with 2 or less Attack. |
| Murkspark Eel | GIL_530 | Battlecry: If your deck has only even-Cost cards, deal 2 damage. |
| Mutanus the Devourer | WC_030 | Battlecry: Eat a minion in your opponent's hand. Gain its stats. |
| Mystified To'cha | GDB_440 | Battlecry: If the combined Health of both heroes is exactly 42, set your hero's Health to 42. |
| Mythical Runebear | EDR_481 | Taunt. Battlecry: If this has 4 or more Attack, summon a copy of this. |
| Nablya, the Watcher | TLC_624 | Battlecry: Summon copies of your damaged minions. Give the copies Rush. |
| Natalie Seline | CORE_EX1_198, EX1_198 | Battlecry: Destroy a minion and gain its Health. |
| Nefarian | BRM_030 | Battlecry: Add 2 random spells to your hand (from your opponent's class). |
| Noxious Cadaver | LEG_RLK_079 | Battlecry: Deal 2 damage to an enemy and your hero. |
| Oil Rig Ambusher | BAR_316 | Battlecry: Deal 2 damage. If this entered your hand this turn, deal 4 instead. |
| Omen of the End | END_035 | Battlecry: If your deck is empty, destroy the top 5 cards of the enemy deck. |
| Onyxia | EX1_562 | Battlecry: Summon 1/1 Whelps until your side of the battlefield is full. |
| Onyxian Warder | ONY_001 | Battlecry: If you're holding a Dragon, summon two 2/1 Whelps with Rush. |
| Outfit Tailor | ETC_420 | Battlecry: Give a friendly minion Attack and Health equal to this minion's. |
| Overseer Frigidara | LEG_RLK_224 | Battlecry: Draw 2 spells. If they're both Frost spells, deal 2 damage to all enemies. |
| P1CK-P0K3T | JAIL_456 | Battlecry: If your deck has 25 or more cards, draw a card. |
| Pantry Spider | KAR_030a | Battlecry: Summon a 1/3 Spider. |
| Party Animal | ETC_350 | Battlecry: Give +1/+1 to each minion of a different type in your hand. |
| Patchwerk | LEG_RLK_071 | Battlecry: Destroy a random minion in your opponent's hand, deck, and battlefield. |
| Pet Collector | ONY_009 | Battlecry: Summon a Beast from your deck that costs (5) or less. |
| Possessifier | LEG_RLK_077 | Battlecry: Summon two 1/1 Fighters with Rush and Reborn. |
| Primal Dungeoneer | WC_005 | Battlecry: Draw a spell. If it's a Nature spell, also draw an Elemental. |
| Primordial Protector | BAR_042 | Battlecry: Draw your highest Cost spell. Summon a random minion with the same Cost. |
| Quartermaster | GVG_060 | Battlecry: Give your Silver Hand Recruits +2/+2. |
| Ram Commander | AV_219 | Battlecry: Add two 1/1 Rams with Rush to your hand. |
| Ratcatcher | GIL_515 | Rush Battlecry: Destroy a friendly minion and gain its Attack and Health. |
| Raven Familiar | LOOT_170 | Battlecry: Reveal a spell in each deck. If yours costs more, draw it. |
| Razorpetal Lasher | UNG_058 | Battlecry: Add a Razorpetal to your hand that deals 2 damage. |
| Reno Jackson | LOE_011 | Battlecry: If your deck has no duplicates, fully heal your hero. |
| Revenant Rascal | DMF_115 | Battlecry: Destroy a Mana Crystal for each player. |
| Riftcleaver | CORE_ULD_165, ULD_165 | Battlecry: Destroy a minion. Your hero takes damage equal to its Health. |
| Rockskipper | TLC_427 | Battlecry: Get a 1-Cost Rock that deals 3 damage. |
| Rolling Stone | ETC_742 | Rush Battlecry: If the last card you played costs (1), gain +1/+1. |
| Rotting Necromancer | NX2_018 | Battlecry: Dredge. If it's an Undead, deal 5 damage to the enemy hero. |
| Rowdy Partner | WW_906 | Battlecry: If you're holding another 4-Cost card, deal 4 damage. |
| Safety Inspector | DMF_125 | Battlecry: Shuffle the lowest-Cost card from your hand into your deck. Draw a card. |
| Saloon Brewmaster | WW_423 | Battlecry: Return a friendly minion to your hand. Give it +2/+2. |
| Sanguine Reveler | ICC_903 | Battlecry: Destroy a friendly minion and gain +2/+2. |
| Saronite Chain Gang | ICC_466 | Taunt Battlecry: Summon a Saronite Chain Gang. |
| Savage Striker | CORE_TRL_240, TRL_240 | Battlecry: Deal damage to an enemy minion equal to your hero's Attack. |
| Savage Ymirjar | RLK_535 | Rush Battlecry: Discard 2 cards. |
| Scarlet Recruiter | JAIL_516 | Battlecry: Summon two minions from your deck that cost (2) or less. Give them Rush. |
| Scourge Rager | RLK_900 | Reborn Battlecry: Die. |
| Scrapsmith | AV_323 | Taunt Battlecry: Add two 2/4 Grunts with Taunt to your hand. |
| Seafloor Savior | TSC_083 | Battlecry: Dredge. If it's a minion, give it this minion's Attack and Health. |
| Sharp-Eyed Lookout | EDR_950 | Battlecry: Draw a card. It costs (1) less this turn. (I know its name!) |
| Shock Hopper | YOG_524 | Battlecry: Get a random Overload card. |
| Shockspitter | RLK_825 | Battlecry: Deal 1 damage. (Improved by your hero attacks this game!) |
| Sightless Magistrate | MAW_008 | Battlecry: Both players draw until they have 5 cards. |
| Sketch Artist | TOY_916 | Battlecry: Draw a Shadow spell. Get a Temporary copy of it. |
| Skulking Geist | ICC_701 | Battlecry: Destroy all 1-Cost spells in both hands and decks. |
| Sludge Slurper | DAL_433 | Battlecry: Add a Lackey to your hand. Overload: (1) |
| Smolderthorn Lancer | TRL_326 | Battlecry: If you're holding a Dragon, destroy a damaged enemy minion. |
| Snapdragon | TID_710 | Battlecry: Give all Battlecry minions in your deck +1/+1. |
| Specter Specialist | CAP_804 | Battlecry: Give a friendly minion Reborn. If it already has Reborn, summon a copy of it. |
| Spiteful Chef | JAIL_507 | Battlecry: Summon a 2-Cost Taunt minion. If you have 10 or more Mana, summon a 6-Cost instead. |
| Starlight Wanderer | GDB_720 | Battlecry: The next Draenei you play gains +2/+1. |
| Stone Trogg | BE_994 | Battlecry: Deal 6 damage to a minion. If it survives, gain +6 Health and Taunt. ~GAMEPLAY ASPROXY BE 994 |
| Stonehearth Vindicator | AV_343 | Battlecry: Draw a spell that costs (3) or less. It costs (0) this turn. |
| Stranded Spaceman | GDB_861 | Battlecry: The next Draenei you play gains +2 Health and Rush. |
| Streetwise Investigator | CFM_656 | Battlecry: Enemy minions lose Stealth. |
| Summer Flowerchild | ETC_376 | Battlecry: Draw two cards that cost (6) or more. Finale: They cost (1) less. |
| Temporal Construct | TIME_858 | Battlecry: Deal 5 damage to an enemy minion. Draw cards equal to the excess damage. |
| Tenwu of the Red Smoke | DMF_071 | Battlecry: Return a friendly minion to your hand. It costs (1) this turn. |
| Terrorguard Escapee | BT_159 | Battlecry: Summon three 1/1 Huntresses for your opponent. |
| The 8 Hands From Beyond | GDB_477 | Battlecry: Destroy both players' decks EXCEPT the 8 highest Cost cards in each. |
| The Jailer | MAW_034 | Battlecry: Destroy your deck. This minion gains Immune. |
| The Lurker Below | BT_230 | Battlecry: Deal 3 damage to an enemy minion. If it dies, repeat on one of its neighbors. |
| The Purator | NX2_023 | Taunt Battlecry: If your deck has no Neutral cards, draw a minion of each minion type. |
| The Unknowable One | BE_725 | Battlecry: Set the Attack and Health of all Combo minions in your hand to 6. |
| Tidelost Burrower | TID_003 | Battlecry: Dredge. If it's a Murloc, summon a 2/2 copy of it. |
| Timeless Causality | TIME_061 | Battlecry: Reverse the order of your deck. |
| Togwaggle, Smuggler King | JAIL_852 | Battlecry: Shuffle both players' hands together. |
| Torghast Custodian | MAW_030 | Battlecry: For each enemy minion, randomly gain Rush, Divine Shield, or Windfury. |
| Totem Cruncher | GIL_583 | Taunt Battlecry: Destroy your Totems. Gain +2/+2 for each destroyed. |
| Travelmaster Dungar | WORK_043 | Battlecry: Summon three minions from your deck that are from different expansions. |
| Trench Surveyor | TSC_642 | Battlecry: Dredge. If it's a Mech, draw it. |
| Trinket Artist | TOY_882 | Battlecry: Draw a Divine Shield minion and an Aura. |
| Tuskarrrr Trawler | TSC_909 | Battlecry: Dredge. |
| Twilight Deceptor | SW_444 | Battlecry: If any hero took damage this turn, draw a Shadow spell. |
| Twin Tyrant | DRG_213 | Battlecry: Deal 4 damage to two random enemy minions. |
| Undercooked Calamari | VAC_341 | Battlecry: Destroy an enemy minion with Attack less than or equal to this minion's. |
| Unyielding Vindicator | GDB_232 | Battlecry: The next Draenei you play gives your hero its Attack for that turn. |
| Utgarde Grapplesniper | DRG_077 | Battlecry: Both players draw a card. If it's a Dragon, summon it. |
| V'ama, Looming Death | JAIL_118 | Battlecry: Destroy all non-Paladin minions. |
| Valdris Felgorge | DRG_208 | Battlecry: Increase your maximum hand size to 12. Draw 4 cards. |
| Varden Dawngrasp | BAR_748 | Battlecry: Freeze all enemy minions. If any are already Frozen, deal 4 damage to them instead. |
| Varian, King of Stormwind | SW_081 | Battlecry: Draw a Rush minion to gain Rush. Repeat for Taunt and Divine Shield. |
| Veranus | DRG_095 | Battlecry: Change the Health of all enemy minions to 1. |
| Vicious Bloodworm | RLK_711 | Battlecry: Give a minion in your hand Attack equal to this minion's Attack. |
| Vigilant Sentry | JAIL_035 | Taunt Battlecry: If your deck has no Neutral cards, summon two Vigilant Sentries. |
| Void Ray | SC_783 | Rush, Divine Shield Battlecry: If this costs (0), gain +2/+2. |
| Void Terror | EX1_304 | Battlecry: Destroy both adjacent minions and gain their Attack and Health. |
| Wandmaker | SCH_160 | Battlecry: Add a 1-Cost spell from your class to your hand. |
| Warmaster Blackhorn | CATA_720 | Battlecry: Destroy all cards that cost (2) or less in both players' decks. |
| Waste Warden | BT_729 | Battlecry: Deal 3 damage to a minion and all others of the same minion type. |
| Wasteland Vanguard | MEND_302 | Battlecry: Deal 3 damage split among all enemies. If any die, deal 3 more. |
| Wealth Redistributor | DED_500 | Taunt. Battlecry: Swap the Attack of the highest and lowest Attack minion. |
| Weaponized Wasp | ULD_170 | Battlecry: If you control a Lackey, deal 3 damage. |
| Witch of the Arch-Thief | WON_104 | Battlecry: Summon a 1/3 Voidwalker with Taunt. If your opponent has more minions, repeat. |
| Witchwood Grizzly | CORE_GIL_623, GIL_623 | Taunt Battlecry: Lose 1 Health for each card in your opponent's hand. |
| Witchwood Piper | GIL_584 | Battlecry: Draw the lowest Cost minion from your deck. |
| Wrathion | CFM_806 | Taunt. Battlecry: Draw cards until you draw one that isn't a Dragon. |
| Zer'Ontu | BE_790 | Taunt. Battlecry: Summon a 0, 1, and 2-Attack minion from your deck. Gain their stats. |
| Zergling | SC_010 | Battlecry: Summon a 1/1 Zergling. |

## Remaining candidates — not enabled

These are still work items, not approximate implementations. Some need an authored rule or verified pool; others require a new subsystem. The dependency notes describe the next work needed, not an automatic promise of support.

| Minion | Next dependency | Full printed rules |
| --- | --- | --- |
| Broodchamber Tunneler | Generated-card keyword/subsystem and its complete lifecycle | Battlecry: Get a 1-Cost Larva with a Combo that triggers a Hero Power from another class. |
| Carry-On Grub | Generated cards that carry stored cards or victim-specific values | Battlecry: Get a 1-Cost Suitcase. Pack the top 2 cards of your deck into it. |
| Chaos Gazer | Authored complete transaction, target relationship and independent outcome tests | Battlecry: Curse a playable card in your opponent's hand. They have 1 turn to play it! |
| Chillspine Stegodon | Kindred activation, history and dependent targeting/costs | Battlecry: Deal 2 damage to two random enemy minions. Kindred: And Freeze them. |
| Chromie, Timehopper | Special token, passive, start/end trigger or Aura lifecycle | Battlecry: Visit a Historical Epoch. Shuffle the others into your deck. |
| City Chief Esho | Authored complete transaction, target relationship and independent outcome tests | Battlecry: If every minion in your deck shares a minion type, give your other minions +2/+2 (wherever they are). |
| Concoctor | Verified named pool and complete generated-card behavior | Battlecry: Add a random Concoction to your hand. |
| Corrupt Constable | Authored complete transaction, target relationship and independent outcome tests | Battlecry: If the enemy deck has any Imp-formants, move one to the top and give it +2/+2. |
| Dissolving Ooze | Generated cards that carry stored cards or victim-specific values | Battlecry: Destroy a friendly minion. Spit out the Bones of its Attack and Health into your hand. |
| Doommaiden | Authored complete transaction, target relationship and independent outcome tests | Battlecry: Draw a card from your opponent's deck. If you don't play it this turn, put it back. |
| Dreamwarden | Original-card identity, starting snapshots or while-held progression | Taunt. Battlecry: If there is a card in your deck that didn't start there, draw it and gain +2/+2. |
| Drone Deconstructor | Generated-card keyword/subsystem and its complete lifecycle | Battlecry: Get a 1/1 Magnetic Sparkbot with a random Bonus Effect. |
| Elise Starseeker | Authored complete transaction, target relationship and independent outcome tests | Battlecry: Shuffle the 'Map to the Golden Monkey' into your deck. |
| Elise the Trailblazer | Authored complete transaction, target relationship and independent outcome tests | Battlecry: Shuffle a sealed Un'Goro pack into your deck. If your deck has no duplicates, draw it. |
| Elise, Badlands Savior | Original-card identity, starting snapshots or while-held progression | Battlecry: If your deck started with no duplicates, summon 5/5 copies of 4 random minions in your deck. |
| Elite Tauren Chieftain | Verified named pool and complete generated-card behavior | Battlecry: Give both players the power to ROCK! (with a Power Chord card) |
| Entomologist Toru | Generated cards that carry stored cards or victim-specific values | Battlecry: Put each minion in your hand into 0/1 Jars that cost (1). Break them to release the minions! |
| Eye of Chaos | Generated-card keyword/subsystem and its complete lifecycle | Battlecry: Get two 1/1 Chaotic Tendrils. |
| Gelbin Mekkatorque | Special token, passive, start/end trigger or Aura lifecycle | Battlecry: Summon an AWESOME invention. |
| Gruesome Nightmare | Multiple selections or a choice spanning hand and battlefield | Battlecry: Give a minion in your hand or battlefield Attack equal to this minion's Attack. |
| Grunty | Multiple selections or a choice spanning hand and battlefield | Battlecry: Summon four random Murlocs, then shoot them at enemy minions. (You pick the targets!) |
| Gunslinger Kurtrus | Original-card identity, starting snapshots or while-held progression | Battlecry: If your deck started with no duplicates, fire six 2 damage shots at minions in the enemy's hand. |
| Hexmarshal | Original-card identity, starting snapshots or while-held progression | Battlecry: Get a random spell that costs (5) or more. If your deck started with no spells, it costs (5) less. |
| Hopeful Dryad | Verified named pool and complete generated-card behavior | Battlecry: Get a random Dream card. |
| Hydralisk | Authored complete transaction, target relationship and independent outcome tests | Battlecry: Deal 2 damage to a random enemy. Repeat for each other Zerg minion you control. |
| Isiset | Persistent rule, resource threshold or effect replacement | Battlecry: Summon two 10/10 Constructs. They are Frozen until you spend 15 Mana on spells. |
| Jerry Rig Carpenter | Generated-card keyword/subsystem and its complete lifecycle | Battlecry: Draw a Choose One spell and split it. |
| Kabal Chemist | Verified named pool and complete generated-card behavior | Battlecry: Add a random Potion to your hand. |
| King Maluk | Verified named pool and complete generated-card behavior | Battlecry: Discard your hand. Get an Infinite Banana. |
| Malefic Rook | Forced attacks or a combat-result listener | Battlecry: Attack YOUR hero. |
| Manifested Timeways | Special token, passive, start/end trigger or Aura lifecycle | Battlecry: If you control an Aura, deal 3 damage to all enemies. |
| Marin the Fox | Special token, passive, start/end trigger or Aura lifecycle | Battlecry: Summon a 0/8 Treasure Chest for your opponent. (Break it for awesome loot!) |
| Mes'Adune the Fractured | Authored complete transaction, target relationship and independent outcome tests | Battlecry: Draw an Elemental. Split it into two halves. |
| Mogu Cultist | Special token, passive, start/end trigger or Aura lifecycle | Battlecry: If your board is full of Mogu Cultists, sacrifice them all and summon Highkeeper Ra. |
| Nethrandamus | Original-card identity, starting snapshots or while-held progression | Battlecry: Summon two random 0-Cost minions. (Upgrades each time a friendly minion dies!) |
| Night Elf Huntress | Multiple selections or a choice spanning hand and battlefield | Battlecry: Deal 3 damage to three different enemies. (You pick the targets!) |
| Pebbly Page | Persistent rule, resource threshold or effect replacement | Battlecry: Draw an Overload card. You can't be Overloaded this turn. |
| Photographer Fizzle | Generated cards that carry stored cards or victim-specific values | Battlecry: Take a Snapshot of your current hand and shuffle it into your deck. (Once per game) |
| Primordial Lord | Verified named pool and complete generated-card behavior | Battlecry: Get a random Colossal minion from the past. |
| Princess Talanji | Original-card identity, starting snapshots or while-held progression | Battlecry: Summon all minions from your hand that didn't start in your deck. |
| Rainbow Seamstress | Original-card identity, starting snapshots or while-held progression | Battlecry: If your deck started with a Blood, Frost, or Unholy card, gain Lifesteal, Reborn, or Rush respectively. |
| Ravenous Devilsaur | Kindred activation, history and dependent targeting/costs | Battlecry: Destroy a minion. Kindred: Gain its stats. |
| Razidir | Kindred activation, history and dependent targeting/costs | Battlecry: Discard a random card from your hand. Kindred: Your opponent's hand instead. |
| Relic Miner | Authored complete transaction, target relationship and independent outcome tests | Battlecry: Destroy the top card of your deck. Discover a card of the same Rarity. |
| Rheastrasza | Original-card identity, starting snapshots or while-held progression | Battlecry: If your deck started with no duplicates, summon the Purified Dragon Nest. |
| Scalehide Kodo | Kindred activation, history and dependent targeting/costs | Battlecry: Destroy the lowest Attack enemy minion. Kindred: The highest Attack instead. |
| Shadowcloaked Assailant | Authored complete transaction, target relationship and independent outcome tests | Battlecry: If you're holding one of the same cards as your opponent, shuffle theirs into their deck. |
| Shadowtouched Kvaldir | Persistent rule, resource threshold or effect replacement | Battlecry: Your next healing effect deals damage instead. |
| Sharp-Eyed Seeker | Original-card identity, starting snapshots or while-held progression | Battlecry: If there is a card in your deck that didn't start there, draw it. |
| Sheriff Barrelbrim | Generated-card keyword/subsystem and its complete lifecycle | Battlecry: If you have 20 or less Health, open the Badlands Jail. |
| Starlight Whelp | Original-card identity, starting snapshots or while-held progression | Battlecry: Get a random card from your starting hand. |
| Steamcleaner | Original-card identity, starting snapshots or while-held progression | Battlecry: Destroy ALL cards in both players' decks that didn't start there. |
| Stowaway | Original-card identity, starting snapshots or while-held progression | Battlecry: If there are cards in your deck that didn't start there, draw 2 of them. |
| Talya Earthstrider | Persistent rule, resource threshold or effect replacement | Battlecry: Your cards that summon Animal Companions summon 1 more this game. |
| Time Adm'ral Hooktail | Special token, passive, start/end trigger or Aura lifecycle | Battlecry: Summon a 0/8 Chest for your opponent. It's FULL of Coins! |
| Tinkertown Technician | Verified named pool and complete generated-card behavior | Battlecry: If you have a Mech, gain +1/+1 and add a Spare Part to your hand. |
| Toki, Time-Tinker | Verified named pool and complete generated-card behavior | Battlecry: Add a random Legendary minion from the past to your hand. |
| Tomb Traitor | Authored complete transaction, target relationship and independent outcome tests | Battlecry: Destroy a Plague in your opponent's deck to deal 3 damage to all enemy minions. |
| Torga | Kindred activation, history and dependent targeting/costs | Battlecry: Draw a Kindred card and another card that activates it. |
| Trenchstalker | Forced attacks or a combat-result listener | Battlecry: Attack three different random enemies. |
| Tuskarr Totemic | Special token, passive, start/end trigger or Aura lifecycle | Battlecry: Summon a random basic Totem. |
| Windpeak Wyrm | Kindred activation, history and dependent targeting/costs | Battlecry: Deal 5 damage and gain 5 Armor. Kindred: Costs (2) less. |
| Windshear Stormcaller | Special token, passive, start/end trigger or Aura lifecycle | Battlecry: If you control all 4 basic Totems, summon Al'Akir the Windlord. |
| Wing Commander Ichman | Forced attacks or a combat-result listener | Battlecry: Summon a Beast from your deck and give it Rush. If it kills a minion this turn, repeat. |
| Ysera the Dreamer | Verified named pool and complete generated-card behavior | Battlecry: Add one of each Dream card to your hand. |

Run `npm run audit:foundation` to refresh this report after changing support. The frozen list never shrinks as cards are completed. Run `npm test`, `npm run test:compiler`, `npm run test:battlecry-groups` and `npm run build` for verification.
