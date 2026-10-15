# Battlecry and Deathrattle: first batch

The local engine supports 184 of the 6,470 collection records. The original trigger batch added 22 records to the previous 155; the tested healing and hand/deck batches add 7 more. See [additional batches](MINION-BATCHES.md). It implements the cards listed here; it does not make every Battlecry or Deathrattle card playable.

## Play and targeting

A resolved minion play inserts the minion, then performs its registered Battlecry once. Direct summons, debug summons, and Deathrattle tokens do not activate Battlecries. An interrupted play creates no minion and activates no Battlecry. Commander plays activate Battlecries on each successful play, with the existing commander tax.

Select or drag a targeted minion in hand, choose its board position, then click a blue-highlighted character when the Battlecry prompt appears. A previous spell/attack target is never silently reused. Mana and the card are committed only when a legal target is chosen. Cancel or Escape abandons the draft without costs. A friendly target click chooses the Battlecry target rather than an attacker. Spells retain their selected-target flow.

Shattered Sun Cleric requires an existing friendly minion. When none exists, it can enter play without buffing itself. A targeted Battlecry with no legal pre-play target is skipped. A target that disappears before delayed resolution causes only the effect to be skipped; the minion still resolves.

| Battlecry cards                     | Effect                                                      |
| ----------------------------------- | ----------------------------------------------------------- |
| Elven Archer, Ironforge Rifleman    | 1 damage to a chosen character                              |
| Stormpike Commando                  | 2 damage to a chosen character                              |
| Voodoo Doctor, Earthen Ring Farseer | Restore 2 or 3 Health to a chosen character                 |
| Novice Engineer, Gnomish Inventor   | Draw one card                                               |
| Shattered Sun Cleric                | Give an existing friendly minion +1/+1                      |
| Nightblade                          | Deal 3 damage to every living enemy hero                    |
| Darkscale Healer                    | Restore up to 2 Health to all friendly characters           |
| Razorfen Hunter                     | Summon a 1/1 Boar immediately to its right                  |
| Dragonling Mechanic                 | Summon a 2/1 Mechanical Dragonling immediately to its right |

## Death resolution

Lethal combat damage and an area effect complete before deaths are processed. All dead minions in a batch leave the board, freeing their slots, before their Deathrattles run. Triggers enter a FIFO queue in global summon order (`uid`), independent of current board position. New deaths are removed before the next queued effect; their triggers join the tail. This is the defined alpha ordering for the four-player variant, not a claim of full Hearthstone rules parity.

Tokens occupy the dead minion's position, preserve adjacent death slots across a batch, respect the seven-minion limit, and enter with summoning sickness. Each summon and any skipped summon are logged. Tokens have minimal local engine metadata and do not add database records or stored image files; artwork uses the existing URL mechanism.

| Deathrattle cards | Effect                                                        |
| ----------------- | ------------------------------------------------------------- |
| Loot Hoarder      | Draw one card, including hand-limit burn and fatigue handling |
| Leper Gnome       | Deal 2 damage to every living enemy hero                      |
| Harvest Golem     | Summon a 2/1 Damaged Golem                                    |
| Haunted Creeper   | Summon two 1/1 Spectral Spiders, space permitting             |
| Nerubian Egg      | Summon a 4/4 Nerubian                                         |
| Sludge Belcher    | Summon a 1/2 Slime with Taunt                                 |
| Unstable Ghoul    | Deal 1 damage to all minions                                  |
| Explosive Sheep   | Deal 2 damage to all minions                                  |
| Abomination       | Deal 2 damage to ALL characters, including its owner's hero   |

Untargeted enemy effects apply to all eligible opponents in Commander. Nightblade's Battlecry and Leper Gnome's Deathrattle each damage every living enemy hero; Hunter's hero power similarly deals 2 damage to every living enemy hero for one 2-mana activation. None asks for a selected target, and an old selection cannot restrict the effect. Enemy area effects such as Flamestrike already affect every opponent's minions. Explicitly targeted damage, such as Archer and Fireball, still hits only the chosen character. Friendly, self-only, minion-only, and ALL-character scopes retain their stated scope. This is the project's multiplayer rule.

A commander dying returns to the command zone by default and still triggers its registered Deathrattle; the existing destination choice remains available afterward. Eliminating a hero clears their board without activating its Deathrattles. Queued effects belonging to an eliminated player are skipped. The match ends when at most one hero survives. If the active player dies while multiple opponents survive, the turn advances automatically.

## Coverage and remaining work

The registry is explicit and shared by collection support labels, bots, and gameplay. Card text is display data. Cards with unimplemented extra effects, such as Bloodmage Thalnos's Spell Damage or Clockwork Gnome's Spare Parts, remain blocked. General trigger multipliers, silence, copied Deathrattles, Reborn, resurrection pools, and arbitrary card scripts are not implemented in this batch.

Automated coverage includes all effect families, direct summons versus plays, interruption, invalid/missing targets, healing caps, buffing, placement, full boards, simultaneous and chained deaths, Divine Shield, fatigue, commander replacement, elimination, bots, and deterministic replay. Browser verification covers a targeted Cleric buff and Haunted Creeper's two token summons.

Card text and stats are taken from the repository's imported metadata snapshot; the [official card library](https://hearthstone.blizzard.com/en-us/cards?set=wild&viewMode=table) is the reference for card identities and keyword text. Multiplayer choices and queue semantics above are documented project rules. Cloud implementation statuses remain the original import snapshot until a future metadata sync; runtime labels use the current local registry.

## Starter test decks

New Hunter starter games include 14 supported neutral Battlecry minions and all 9 supported Deathrattle minions by name before filling the remaining slots. All four players receive 100 singleton cards, excluding their commander, then their decks are shuffled normally. Opening hands are not fixed. Custom decks use only the supplied cards. Existing matches retain their current decks; use **New starter game** to get the updated mix.

## In-game inspection

Hand cards have a separate Inspect button and a right-click preview. Right-click any battlefield minion or commander to open its larger artwork and readable card text. Battlefield previews include current attack, current/max health, damage taken, and active Divine Shield. Use the preview's target button to select a minion for a spell/ability, or to confirm a waiting Battlecry target. Inspection does not play, attack, or spend mana. Local bots and the interruption timer pause until the preview closes. Escape, Back to game, the close button, or the backdrop close it. Keyboard focus stays inside the dialog and returns to its previous control afterward. Collection previews retain deckbuilding actions; in-game previews show game actions.

## Hero health and healing

Heroes start at 40 health and have no gameplay healing cap. Targeted healing, friendly group healing, Priest power, and both attacking and defending Lifesteal can increase a living hero above 40, including repeated gains beyond 1000. Minion healing still stops at that minion's current maximum health, including permanent health buffs. Divine Shield absorption grants no Lifesteal healing. Eliminated heroes cannot be healed back into play.

## Lasting effect visibility and audit

The [enabled-card audit](TRIGGER-AUDIT.md) covers every enabled Battlecry/Deathrattle printing. Buffed minions display a gold stat-change badge, and their inspectors list source effects and durations. Cleric's buff survives turns and source death, then ends when the affected minion leaves play. Cleansing Cleric's healing bonus is now a supported game-wide effect. Other unimplemented auras and persistent effects have explicit inspector explanations; they are not silently treated as one-time effects.
