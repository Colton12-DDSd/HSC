# Battlecry implementation backlog
Progress: 14 of the original 65 foundation candidates and 2 of the 712 reusable-mechanic candidates are now supported. The original lists below are retained for tracking; the current remaining names are in [BATTLECRY-GROUPS.md](BATTLECRY-GROUPS.md).

Completed foundation cards: Elise, Badlands Savior; Eye of Chaos; Hexmarshal; Hopeful Dryad; Relic Miner; Starlight Whelp; Time Adm'ral Hooktail; Tinkertown Technician; Ysera the Dreamer. Completed shared card: Soulwarden.

Starting-deck tracking adds Dreamwarden, Sharp-Eyed Seeker, Stowaway, Steamcleaner, and Princess Talanji from the foundation queue, plus Archimonde from the shared queue and the spell Dragonscale Armaments. An original card retains its starting owner when moved; a generated copy does not inherit it.

Next prerequisites: shared Kindred detection for Chillspine Stegodon, Ravenous Devilsaur, Razidir, Scalehide Kodo, and Windpeak Wyrm; multi-target and cross-zone choices for Night Elf Huntress, Grunty, and Gruesome Nightmare. Named pools use exact token lists, but generated cards with unsupported effects remain unplayable.


Based on the pinned audit: 815 unsupported names, 1080 supported. Every pending name appears once. This is a work queue; no cards are banned by this document.

Start with damage/stats, draw/zones, and summons/tokens (52 names). Follow with generation and named pools (13). Review full card text before implementation; move any card with an unresolved prerequisite into its dependency group.

Next, build linked effects and prove them with at least one spell or Deathrattle alongside the Battlecry tests. Then prioritize delayed triggers, choices, and auras. Review match-wide rules early in parallel with implementation planning.

## 1. Start with existing foundations (65)

### Damage, healing, Armor and board stats (17)

Extend numeric expressions, target-dependent branches, tribal filters and compound stat effects.

Chillspine Stegodon, City Chief Esho, Dissolving Ooze, Gruesome Nightmare, Hydralisk, Malefic Rook, Manifested Timeways, Night Elf Huntress, Ravenous Devilsaur, Scalehide Kodo, Shadowtouched Kvaldir, Sheriff Barrelbrim, Steamcleaner, Tinkertown Technician, Tomb Traitor, Trenchstalker, Windpeak Wyrm.

### Draw, discard and hand/deck movement (21)

Extend existing zone operations: draws, burns, ordering, bottom-of-deck placement and hand replacement.

Chaos Gazer, Chromie, Timehopper, Corrupt Constable, Doommaiden, Dreamwarden, Elise Starseeker, Elise the Trailblazer, Entomologist Toru, Gunslinger Kurtrus, Jerry Rig Carpenter, King Maluk, Mes'Adune the Fractured, Pebbly Page, Photographer Fizzle, Rainbow Seamstress, Razidir, Relic Miner, Shadowcloaked Assailant, Sharp-Eyed Seeker, Stowaway, Torga.

### Summons, recruits and token definitions (14)

Add exact token definitions, variable summon stats, filtered recruitment and placement rules. Generated minion abilities need their own coverage.

Elise, Badlands Savior, Gelbin Mekkatorque, Grunty, Isiset, Marin the Fox, Mogu Cultist, Nethrandamus, Princess Talanji, Rheastrasza, Talya Earthstrider, Time Adm'ral Hooktail, Tuskarr Totemic, Windshear Stormcaller, Wing Commander Ichman.

### Generated cards and named card pools (13)

Define precise named/tribal/class/school pools and generated-card metadata; implement any required token abilities.

Broodchamber Tunneler, Carry-On Grub, Concoctor, Drone Deconstructor, Elite Tauren Chieftain, Eye of Chaos, Hexmarshal, Hopeful Dryad, Kabal Chemist, Primordial Lord, Starlight Whelp, Toki, Time-Tinker, Ysera the Dreamer.

## 2. Build reusable mechanics (712)

### Card costs, mana and ordinary discounts (15)

Extend cost-setting, discount duration/counts, mana caps and multi-card cost relationships.

Chronogor, Dark Inquisitor Xanesh, Doomkin, Foreboding Flame, Ghoulish Alchemist, Hot Spring Glider, Ivus, the Forest Lord, Leyline Manipulator, M.O.T.H.E.R., Mysterious Visitor, Overgrown Horror, Planetary Navigator, SI:7 Skulker, Skittish Saucier, Stickybomb Saboteur.

### Discover and other player choices (55)

Extend existing choices with multiple selections, target/choice relationships, hidden selections and result-dependent riders.

Agent of the Old Ones, Ancient Stegodon, Arch-Thief Rafaam, Archivist Elysiana, Bootleg Alchemist, Conjuration Specialist, Disciple of Eonar, Dread Leviathan, Dreamplanner Zephrys, Eyes in the Sky, False Disciple, Ghost Writer, Goliath, Sneed's Masterpiece, Grand Empress Shek'zara, Griftah, Griftah, Trusted Vendor, Heistbaron Togwaggle, Highborne Mentor, Hipster, Imp-oster, Kaldorei Cultivator, Kobold Hermit, Loken, Jailer of Yogg-Saron, Madame Lazul, Malygos, Aspect of Magic, Marin the Manager, Maruut Stonebinder, Merchant of Legend, Mimiron, Murozond, Thief of Time, Nightmare Lord Xavius, Ocular Occultist, Overplanner, Pandaren Importer, Party Crasher, Q'onzu, Raid Negotiator, Resort Valet, School Teacher, Scion of Insight, Serena Bloodfeather, Shadow Hunter Vol'jin, Siamat, Silas Darkmoon, Snake Eyes, Spiritspeaker, Suspicious Alchemist, Suspicious Peddler, Suspicious Usher, Theotar, the Mad Duke, Translocation Instructor, Violet Punisher, Vulpera Scoundrel, Warsong Wrangler, Watfin.

### Copies, transformations, swaps and control (23)

Extend physical-card copying, stat preservation, owner/controller identity and linked swaps or transformations.

Ashamane, Askara, Azalina Soulthief, Barbaric Sorceress, Copycat, Drakkari Trickster, Dryscale Deputy, Eternus, Hex Lord Malacrass, Mind Control Tech, Mischief Maker, Murloc Holmes, Narain Soothfancy, Plagiarizarrr, Psychic Conjurer, Royal Informant, Sir Finley, Sea Guide, Soul Seeker, Spirit of the Badlands, Tentacled Menace, Tony, King of Piracy, Tricky Satyr, Zai, the Incredible.

### Deathrattles, resurrection and remembered victims (56)

Track the exact destroyed/discarded/chosen minion and carry that identity into later Deathrattles or resurrection.

Acolyte of Infinity, Ancient Augur, Ancient Raptor, Apothecary Helbrim, Archdruid of Thorns, Beast Speaker Taka, Body Wrapper, Chromatic Egg, Corpse Raiser, Da Undatakah, Defense Attorney Nathanos, Dirdra, Rebel Captain, Disposal Assistant, Dr. Stitchensew, Dread Raptor, Dust Bunny, Endbringer Umbra, Felsoul Jailer, Fireworks Tech, Game Master Nemsy, Gemstone Hoarder, General Vezax, High Cultist Herenn, Inventor Boom, Kel'Thuzad, the Inevitable, Kingpin Pud, Monstrous Parrot, Mothership, Myra Rotspring, N'Zoth, God of the Deep, Najak Hexxen, Overlord Saurfang, Platysaur, Pozzik, Audio Engineer, R4T-C4TCH3R, Raith Van Geist, Rat Sensei, Raza the Resealed, Reefwalker, Rime Sculptor, Rustsworn Cultist, Sacrificial Summoner, Shadestone Skulker, Shattershambler, Slagclaw, Spurfang, Terrible Chef, Terror of the Wastes, Tomb Lurker, Toshley, Tyr, Ulfar, Ursoc, Vectus, Vrykul Necrolyte, Xaril, Poisoned Mind.

### Weapons, forced attacks and combat restrictions (22)

Extend weapon effects, durability, forced combat, repeated attacks and special attack restrictions.

Air Support, Charged Devilsaur, Deathwing, Mad Aspect, Decimator Olgra, Doctor Holli'dae, Expedition Sergeant, Lightforged Zealot, Malkorok, Maxima Blastenheimer, MC Blingtron, Medivh, the Guardian, Necrolord Draka, PMM Infinitizer, Snoozin' Zookeeper, Suspicious Pirate, Theldurin the Lost, Verdant Dreamsaber, Vereesa Windrunner, Viper, Warmaul Challenger, Wild Bloodstinger, Worgen Roadie.

### History, thresholds and scaling conditions (23)

Extend public history, while-held counters, distinct schools/types, spent mana, starting decks and previous-turn queries.

Archimonde, Broodwatcher, Chrono-Lord Epoch, Colossus, Eroded Sediment, Felwood Treant, Herald of Shadows, Keli'dan the Breaker, Lady Liadrin, Lifeguard, Merithra of the Dream, Mind Sweeper, Mindbender, Minecart Cruiser, Party Planner Vona, Renferal, the Malignant, Sasquawk, Soulwarden, Tidepool Pupil, Vyranoth, Y'Shaarj, the Defiler, Y'Shaarj, Titan Bane, Zok Fogsnout.

### Delayed effects and start/end-of-turn triggers (52)

Extend scheduler timing, duration, expiry, ownership and source survival checks; some cases need persistent event listeners too.

Alexandros Mograine, Anachronos, Ancient Pterrordax, Astrobiologist, Boompistol Bully, Camouflaged Dirigible, Cannonmaster, Carnivorous Cubicle, Chronikar, Circadiamancer, Clockwork Rager, Coilfang Constrictor, Commander Geddon, Coppertail Imposter, Crater Gator, Cult Neophyte, Destructive Phoenix, Echoing Ooze, Emberscarred Whelp, Endtime Murozond, Forensic Duster, Gorgonzormu, Incindius, Inspector Murloc Holmes, Irida Sinseeker, Keeper of Flame, Kil'jaeden, King Tide, Lamplighter, Loatheb, Master of Disguise, Migrating Elekk, Millhouse Manastorm, Mindrender Illucia, Murozond, Unbounded, Neeru Fireblade, Nithogg, Overflow Surger, Partner in Crime, Prosecutor Mel'tranix, Robocaller, Runi, Temporal Guardian, Scarlet Subjugator, Setesh, Shadowed Informant, Skarr, the Catastrophe, Spellward Jeweler, The Fins Beyond Time, Timewarden, Tol'vir Carver, Tome Translator, Watercolor Artist.

### Auras, listeners and ongoing board effects (35)

Add recomputed auras or event listeners with source binding, Silence, zone changes and cleanup.

Alexstrasza, Guardian of Life, Annoying Fan, Ashen Elemental, Aviana, Elune's Chosen, Blightfang, Bloodthistle Illusionist, Captain Crowley, Dark Templar, DJ Manastorm, Ebonscale Scout, Edwin, Defias Kingpin, Exarch Hataaru, Flint Firearm, Hideous Husk, High Templar, Instructor Fireheart, Jailhouse Manastorm, Jandice Barov, Kalecgos, Lotus Troublemaker, Morchie, Obsessive Fan, Picklock, Pop'gar the Putrid, Raid Boss Onyxia, Remnant of Rage, Roach, Rowdy Fan, Sky Claw, Stiltstepper, The Ceaseless Expanse, Tichondrius, Timelooper Toki, Treasure Fiend, Xor'toth, Breaker of Stars.

### Lasting rules and game-wide replacements (14)

Add persistent rules that modify future cards, draws, summons, damage, healing or other actions.

Ammunae, Broodqueen Sha'kar, Cardboard Golem, Dark Pharaoh Tekahn, Ebyssian, Goru the Mightree, Inzah, Kabal Mastermind, Loh, the Living Legend, Lothraxion the Redeemed, Odyn, Prime Designate, Sister Svalna, The Stonewright, Topior the Shrubbagazzor.

### Spell Damage and spell-only modifiers (24)

Apply Spell Damage, next-spell bonuses, spell Lifesteal and other spell modifiers consistently across all damage paths.

Ancient Mage, Archmage Kalec, Auchenai Phantasm, Azure Drake, Azure Explorer, Battlefield Blaster, Black Cat, Celestial Emissary, Ethereal Augmerchant, Halduron Brightwing, Keyboard Soloist, Omega Mind, Prestor's Pyromancer, Saruun, Silvermoon Arcanist, Silvermoon Farstrider, Soot Spewer, Sorcerous Substitute, Spellbook Binder, Steward of Scrolls, Talented Arcanist, Tuskarr Fisherman, Unstable Spellcaster, Volcanic Thrasher.

### Automatic casting and replaying spells/Battlecries (49)

Resolve nested casts, legal random targets, replay history, repeats, choices and recursion limits.

Archaedas, Astral Mediator, Asvedon, the Grandshield, Breakout Architect, Brilliant Macaw, Cactus Cutter, Chaotic Tendril, Chatty Macaw, Clumsy Courier, Conniving Conman, Crackling Cloudstrider, Cultivating Sprite, Deepminer Brann, Druid of Regrowth, Electra Stormsurge, Fatebreaker, Felwalker, Fyrakk the Blazing, Grand Magister Rommath, Grand Magus Antonidas, Grey Sage Parrot, Hagatha the Fabled, Jace Darkweaver, Jotun, the Eternal, Kalimos, Primal Lord, Lady Darkvein, Lynessa Sunsorrow, Mistah Vistah, Murmuring Elemental, Murozond the Infinite, Opu the Unseen, Pathmaker, Pet Parrot, Puzzlemaster Khadgar, Ruinous Velocidrake, Servant of Yogg-Saron, Shudderwock, Sunwing Squawker, Tess Greymane, Therazane the Earthmother, Tortollan Pilgrim, Tortollan Primalist, Twinbow Terrorcoil, Tyrande, Unseen Saboteur, Ursol, Violet Treasuregill, Wrathspine Enchanter, Yogg-Saron, Hope's End.

### Hero powers, upgrades and replacements (37)

Support additional powers, power copying/upgrades, refreshes, damage history, discounts and power-specific triggers.

Algalon the Observer, Amplified Snowflurry, Bitterbloom Knight, Blackwald Pixie, Blood Doctor Thal'ena, Blowtorch Saboteur, Daring Fire-Eater, Dreambound Disciple, Exarch Naielle, Exotic Houndmaster, Fencing Coach, Flutterwing Guardian, Free Spirit, Goldpetal Drake, Grizzled Wizard, Groovy Cat, Jan'alai, the Dragonhawk, Justicar Trueheart, Kaldorei Priestess, Living Garden, Lunarwing Messenger, Malorne the Waywatcher, Mordresh Fire Eye, Petal Picker, Raza the Chained, Reckless Apprentice, Resplendent Dreamweaver, Saboteur, Sideshow Spelleater, Sir Finley Mrrgglton, Sir Finley of the Sands, Spirit Gatherer, Spirit of the Kaldorei, Tour Guide, Vilefin Inquisitor, Waterboy, Wisprider.

### Secrets, traps and Counter effects (26)

Implement hidden zones, trigger windows, ownership/privacy and Counter resolution.

Anonymous Informant, Arcane Keysmith, Bellringer Sentry, Blademaster Okani, Cannonmaster Smythe, Chief Inspector, Eater of Secrets, Faceless Enigma, Ghastly Gravedigger, Harmonica Soloist, Horde Operative, Hydrologist, Inconspicuous Rider, Kabal Lackey, Kezan Mystic, Kirin Tor Mage, Masked Contender, Mysterious Challenger, Observer of Mysteries, Private Eye, Product 9, Ram Tamer, Sayge, Seer of Darkmoon, SI:7 Infiltrator, Sparkjoy Cheat, Tricksy Improviser.

### Cast-when-drawn cards and deck hazards (30)

Implement draw replacement and injected Bombs, Portals, Fragments, Curses and other self-casting tokens.

Amitut, Keeper of Amitus, Ancient Shade, Blastmaster Boom, Bolide Behemoth, Boomboss Tho'grun, Clockwork Goblin, Fal'dorei Strider, Framester, Helya, Iron Juggernaut, Luckysoul Hoarder, Mankrik, Moonstone Mauler, Patches the Pilot, Portal Keeper, Portal Overfiend, Seaforium Bomber, Shadowlight Scholar, Shardshatter Mystic, Sheldras Moontree, Son of Hodir, Soulciologist Malicia, Soulshard Lapidary, Spirit Jailer, Surfalopod, The Darkness, Twilight Timehopper, Ultraviolet Breaker, Void Drinker, Ysera, Unleashed.

### Corpses and Death Knight rune resources (19)

Track Corpse creation/spending and rune-dependent card behavior.

Bloodfiend, Body Bagger, Bonedigger Geist, Boneguard Commander, Boneshredder, Corpse Bride, Darkfallen Neophyte, Eulogizer, Falric, G'huun, Hematurge, Husk, Eternal Reaper, Lord Marrowgar, Marrow Manipulator, Meat Grinder, Necrotic Mortician, Shambling Zombietank, Soulstealer, Volcoross.

### Health/Armor costs and alternate payment rules (10)

Extend payment validation, spending order, duration, safety and reductions when cards cost something other than mana.

Agamaggan, Anub'Rekhan, Blood Crusader, Bloodscent Vilefin, Cho'gall, Commander Ulthok, Exarch Maladaar, G'huun the Blood God, Seadevil Stinger, War'loc.

### Named progression families (31)

Shared progression for C’Thun, Jade Golems, Galakrond, Librams, Relics, curses and other named families; each family is separately tagged.

Aldor Attendant, Aldor Truthseeker, Ancient Shieldbearer, Artificer Xy'mox, Aya Blackpaw, Beckoner of Evil, Blade of C'Thun, C'Thun's Chosen, Dark Arakkoa, Dark Deacon, Disciple of C'Thun, Doomcaller, Gargantuan Slitherer, Interstellar Researcher, Interstellar Wayfarer, Jade Behemoth, Jade Chieftain, Jade Spirit, Klaxxi Amber-Weaver, Kronx Dragonhoof, Ley Walker, Mystic Runesaber, Queen Azshara, Sira'kess Cultist, Skeram Cultist, Spawn of C'Thun, Surge Needle, Twilight Darkmender, Twilight Geomancer, Twin Emperor Vek'lor, Za'qul.

### Quests, Excavation and expansion objectives (35)

Implement objective counters, reward pools and action systems such as Excavate, Herald, Imbue and Ritual.

Antique Flinger, Armored Bloodletter, Badlands Brawler, Blastmage Miner, Burrow Buster, Corrupt Elementalist, Devoted Maniac, Disciple of Galakrond, Dragonblight Cultist, Drilly the Kid, Entrapped Sorceress, Envoy of the End, Fate Weaver, Fossilized Kaleidosaur, Harrowing Ox, Kith'ix, Kobold Miner, Licensed Adventurer, Obsessive Technician, Questing Assistant, Questing Explorer, Reliquary Researcher, Scion of Ruin, Scorching Ravager, Shadowsworn Disciple, Shield of Galakrond, Sir Finley, the Intrepid, Skeleton Crew, Sky Gen'ral Kragg, Skywall Sentinel, Tram Conductor Gerry, Treasure Hunter Eudora, Ultraxion, Umbral Skulker, Veiled Worshipper.

### Extra keywords and attached mechanics (121)

A simple Battlecry is still blocked when the same printing also needs Tradeable, Combo, Rewind, Infuse, Forge or another unsupported mechanic. See exact keyword tags.

Ace Wayfinder, Aeon Wizard, Aggramar, the Avenger, Aqir Goliath, Astalor Bloodsworn, Azerite Chain Gang, Benevolent Banker, Big Game Hunter, Brutish Endmaw, Buffet Biggun, Buttons, Bygone Doomspeaker, Carnival Clown, Chillin' Vol'jin, Ci'Cigi, Circus Medic, Commissary Crook, Confessor Paletress, Conflux Crasher, Coroner, Costume Merchant, Crackling Razormaw, Creature of Madness, Crystal Tender, Darkrider, Defias Smuggler, Disciple of Sargeras, Dragon Turtle, Elder Longneck, Epoch Stalker, Face Collector, Famished Fool, Farm Hand, Firework Elemental, Frostburn Matriarch, Garona Halforcen, Gelbin of Tomorrow, Gentle Megasaur, Heartbreaker Hedanis, Hijacked Securitybot, Hollow Abomination, Horseshoe Slinger, Hostile Invader, Huntsman Altimor, Imp King Rafaam, Injured Hauler, Insatiable Devourer, Keywarden Ivory, Knight of the Dead, Knight-Captain, Kurtrus Ashfallen, Lightfused Stegodon, Living Paradox, Maestra, Mask Merchant, Mechagnome Guide, Medivh the Hallowed, Mischievous Imp, Mister Clocksworth, Muradin, High King, Murloc Growfin, Muscle-o-Tron, Neferset Weaponsmith, Nostalgic Clown, Ornery Direhorn, Painted Canvasaur, Pen Flinger, Pit Master, Portal Vanguard, Portalmancer Skyla, Primalfin Challenger, Pterrordax Hatchling, Rampaging Hound, Ranger General Sylvanas, Raptor Herald, Ravasaur Runt, Ravenous Pterrordax, Royal Librarian, Rustrot Viper, Sand Art Elemental, Sandbox Scoundrel, Sargeras, the Destroyer, Sawbones, Sewer Swimmer, Shadowflame Stalker, Shady Bartender, Shining Sentinel, Shudderblock, Sire Denathrius, Sleet Skater, Spawn of Shadows, Speaker Stomper, Squashling, Stadium Announcer, Sunfury Clergy, Sweetened Snowflurry, Sylvanas, the Accused, Tabletop Roleplayer, Talanji of the Graves, The Black Knight, The One-Amalgam Band, The Scarab Lord, Thunder Bluff Valiant, Thunder Lizard, Tickatus, Time-Lost Raptor, Timethief Rafaam, Toy Captain Tarim, Toyrantus, Toysnatching Geist, Traveling Merchant, Treacherous Tormentor, Turbulus, Verdant Longneck, Volcanosaur, Watcher of the Sun, Whirling Combatant, Wind-Up Enforcer, Wind-Up Musician, Wind-Up Sapling, Window Shopper, XB-488 Disposalbot.

### Dormant, locations and board-state systems (35)

Implement Dormant/wake timers, location rules, Starships, Colossal appendages and other nonstandard board objects.

Al'Akir, Lord of Storms, Ambassador Faelin, Ara'lon, Cruise Captain Lora, Crumblecrusher, Crystal Welder, Demolition Renovator, Disguised Executioner, Disguised Watchman, Dispossessed Soul, Dreadsoul Corrupter, Exarch Othaar, Flightmaster Dungar, Ghost, Gigafin, Hydralodon, Iso'rath, Magtheridon, Maiev Shadowsong, Missile Pod, Nellie, the Great Thresher, Runi, Time Explorer, Scrapbooking Student, Scrounging Shipwright, SCV, Siege Tank, Spirit Poacher, Star Vulpera, The Exodar, Thor, Timeway Warden, Travel Agent, Ultra-Capacitor, Workshop Janitor, Yamato Cannon.

## 3. Review Commander rules (38)

### Custom cards, construction and minigames (29)

Define custom choice trees, constructed cards, puzzles, auctions, trials and special minigames rather than substituting a generic random card.

Attentive Tender, Avatar of Hearthstone, Bashana Runetotem, Bob the Bartender, Curious Glimmerroot, E.T.C., Band Manager, Elise the Navigator, Envoy of Lazul, F3TCH3R, Futuristic Forefather, Godfather Kazakus, Harth Stonebrew, Ignis, the Eternal Flame, Kazakus, Kazakus, Golem Shaper, Kazakusan, King of the Underbelly, Mismatcher, Mixologist, Pirate Admiral Hooktusk, Pro Gamer, Rajh, Sandcrafter, Scourge Tamer, Steward of the Vale, Swampqueen Hagatha, Victor Nefarius, Yogg-Saron, Master of Fate, Zephrys the Great.

### Turns, starting decks and match-wide changes (9)

Review extra turns, starting-game effects, turn control, hero/deck swaps, alternate wins and Commander-specific interactions.

Aya, Lotus Kingpin, Azalina Soulsever, C'Thun, the Shattered, King Togwaggle, Mastermind Yogg-Saron, Spore Empress Moldara, Temporus, Timewinder Zarimi, Ysera, Emerald Aspect.

Review outcomes: implement as written, document a multiplayer adaptation, or propose a ban with a concrete interaction and test case. Keep deferred implementation distinct from a ban.
