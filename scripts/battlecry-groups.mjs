// Planning taxonomy only. This module never changes the gameplay support registry.
export const lanes = {
  foundation: 'Existing foundations: pattern, value, filter or sequencing extensions',
  shared: 'Extend a shared engine family',
  system: 'Add or complete a game subsystem',
  bespoke: 'Card-specific design or manual rules review',
};

export const groups = [
  [
    'damage-stats',
    'Damage, healing, Armor and board stats',
    'foundation',
    'Extend numeric expressions, target-dependent branches, tribal filters and compound stat effects.',
  ],
  [
    'draw-zones',
    'Draw, discard and hand/deck movement',
    'foundation',
    'Extend existing zone operations: draws, burns, ordering, bottom-of-deck placement and hand replacement.',
  ],
  [
    'summon-tokens',
    'Summons, recruits and token definitions',
    'foundation',
    'Add exact token definitions, variable summon stats, filtered recruitment and placement rules. Generated minion abilities need their own coverage.',
  ],
  [
    'generate-pools',
    'Generated cards and named card pools',
    'foundation',
    'Define precise named/tribal/class/school pools and generated-card metadata; implement any required token abilities.',
  ],
  [
    'cost-mana',
    'Card costs, mana and ordinary discounts',
    'shared',
    'Extend cost-setting, discount duration/counts, mana caps and multi-card cost relationships.',
  ],
  [
    'choices',
    'Discover and other player choices',
    'shared',
    'Extend existing choices with multiple selections, target/choice relationships, hidden selections and result-dependent riders.',
  ],
  [
    'copy-transform',
    'Copies, transformations, swaps and control',
    'shared',
    'Extend physical-card copying, stat preservation, owner/controller identity and linked swaps or transformations.',
  ],
  [
    'death-memory',
    'Deathrattles, resurrection and remembered victims',
    'shared',
    'Track the exact destroyed/discarded/chosen minion and carry that identity into later Deathrattles or resurrection.',
  ],
  [
    'weapons-combat',
    'Weapons, forced attacks and combat restrictions',
    'shared',
    'Extend weapon effects, durability, forced combat, repeated attacks and special attack restrictions.',
  ],
  [
    'history',
    'History, thresholds and scaling conditions',
    'shared',
    'Extend public history, while-held counters, distinct schools/types, spent mana, starting decks and previous-turn queries.',
  ],
  [
    'scheduling',
    'Delayed effects and start/end-of-turn triggers',
    'shared',
    'Extend scheduler timing, duration, expiry, ownership and source survival checks; some cases need persistent event listeners too.',
  ],
  [
    'ongoing',
    'Auras, listeners and ongoing board effects',
    'system',
    'Add recomputed auras or event listeners with source binding, Silence, zone changes and cleanup.',
  ],
  [
    'lasting',
    'Lasting rules and game-wide replacements',
    'system',
    'Add persistent rules that modify future cards, draws, summons, damage, healing or other actions.',
  ],
  [
    'spell-power',
    'Spell Damage and spell-only modifiers',
    'system',
    'Apply Spell Damage, next-spell bonuses, spell Lifesteal and other spell modifiers consistently across all damage paths.',
  ],
  [
    'spell-casting',
    'Automatic casting and replaying spells/Battlecries',
    'system',
    'Resolve nested casts, legal random targets, replay history, repeats, choices and recursion limits.',
  ],
  [
    'hero-powers',
    'Hero powers, upgrades and replacements',
    'system',
    'Support additional powers, power copying/upgrades, refreshes, damage history, discounts and power-specific triggers.',
  ],
  [
    'secrets-counters',
    'Secrets, traps and Counter effects',
    'system',
    'Implement hidden zones, trigger windows, ownership/privacy and Counter resolution.',
  ],
  [
    'cast-when-drawn',
    'Cast-when-drawn cards and deck hazards',
    'system',
    'Implement draw replacement and injected Bombs, Portals, Fragments, Curses and other self-casting tokens.',
  ],
  [
    'corpses-runes',
    'Corpses and Death Knight rune resources',
    'system',
    'Track Corpse creation/spending and rune-dependent card behavior.',
  ],
  [
    'alternate-payments',
    'Health/Armor costs and alternate payment rules',
    'system',
    'Extend payment validation, spending order, duration, safety and reductions when cards cost something other than mana.',
  ],
  [
    'named-progression',
    'Named progression families',
    'system',
    'Shared progression for C’Thun, Jade Golems, Galakrond, Librams, Relics, curses and other named families; each family is separately tagged.',
  ],
  [
    'quests-upgrades',
    'Quests, Excavation and expansion objectives',
    'system',
    'Implement objective counters, reward pools and action systems such as Excavate, Herald, Imbue and Ritual.',
  ],
  [
    'keyword-packages',
    'Extra keywords and attached mechanics',
    'system',
    'A simple Battlecry is still blocked when the same printing also needs Tradeable, Combo, Rewind, Infuse, Forge or another unsupported mechanic. See exact keyword tags.',
  ],
  [
    'dormant-board',
    'Dormant, locations and board-state systems',
    'system',
    'Implement Dormant/wake timers, location rules, Starships, Colossal appendages and other nonstandard board objects.',
  ],
  [
    'custom-build',
    'Custom cards, construction and minigames',
    'bespoke',
    'Define custom choice trees, constructed cards, puzzles, auctions, trials and special minigames rather than substituting a generic random card.',
  ],
  [
    'match-rules',
    'Turns, starting decks and match-wide changes',
    'bespoke',
    'Review extra turns, starting-game effects, turn control, hero/deck swaps, alternate wins and Commander-specific interactions.',
  ],
  [
    'special-review',
    'Special scripts and unresolved rules',
    'bespoke',
    'Named or ambiguous effects without a safely identified shared implementation. Requires an explicit per-card rules decision.',
  ],
].map(([id, label, lane, work]) => ({ id, label, lane, work }));

export function normalize(text = '') {
  return text
    .split('@')[0]
    .replace(/<[^>]*>|\[x\]|[$#&]/g, '')
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

const keywordRules = [
  ['Tradeable', /\bTradeable\b/i, ['TRADEABLE']],
  ['Combo', /\bCombo\b/i, ['COMBO']],
  ['Outcast', /\bOutcast\b/i, ['OUTCAST']],
  ['Inspire', /\bInspire\b/i, ['INSPIRE']],
  ['Frenzy', /\bFrenzy\b/i, ['FRENZY']],
  ['Spellburst', /\bSpellburst\b/i, ['SPELLBURST']],
  ['Honorable Kill', /\bHonorable Kill\b/i, ['HONORABLE_KILL']],
  ['Overheal', /\bOverheal\b/i, ['OVERHEAL']],
  ['Elusive', /\bElusive\b/i, ['ELUSIVE']],
  ['Adapt / bonus effects', /\bAdapt\b|\bBonus Effects?\b|\bDark Gift\b/i, []],
  ['Magnetic', /\bMagnetic\b/i, ['MAGNETIC']],
  ['Echo', /\bEcho\b/i, ['ECHO']],
  ['Corrupt', /\bCorrupt(?:ed)?\b/i, ['CORRUPT']],
  ['Infuse', /\bInfuse(?:d)?\b/i, ['INFUSE']],
  ['Manathirst', /\bManathirst\b/i, ['MANATHIRST']],
  ['Forge', /\bForge(?:d)?\b/i, ['FORGE']],
  ['Quickdraw', /\bQuickdraw\b/i, ['QUICKDRAW']],
  ['Finale', /\bFinale\b/i, ['FINALE']],
  ['Miniaturize / Gigantify', /\bMiniaturize\b|\bGigantify\b/i, ['MINIATURIZE', 'GIGANTIFY']],
  ['Rewind', /\bRewind\b/i, []],
  ['Kindred', /\bKindred\b/i, []],
  ['Prepare', /\bPrepare\b/i, []],
  ['Tourist', /\bTourist\b/i, []],
  ['Fabled', /\bFabled\b/i, []],
  ['Titan', /\bTitan\b/i, ['TITAN']],
  ['Choose One', /\bChoose One\b/i, ['CHOOSE_ONE']],
  ['Colossal', /\bColossal\b/i, ['COLOSSAL']],
  ['Starship', /\bStarship\b/i, ['STARSHIP_PIECE']],
];

const dependencies = [
  [
    'custom-build',
    /\bAssemble\b|\b(?:build|craft|create|plot) (?:a |an )?(?:custom|sham trial)|\bCarve\b|\bBattlegrounds\b|\bRafaam's|\bGuess\b|\bWish\b|\bWheel of|\bauction\b|\bRock-Paper-Scissors\b|\bwhile building your deck\b|\bOpen a .*Pack\b/i,
  ],
  [
    'match-rules',
    /\bStart of Game\b|\bstarting Health\b|\bextra turn\b|\btakes? (?:an extra|your|two|three|2|3) turns?\b|\bwin the game\b|\bwin this game\b|\b(?:swap|switch) (?:decks|your deck|heroes)|\bgo second\b|\bdeck is \d+ cards\b/i,
  ],
  ['hero-powers', /\bHero Powers?\b|\bImbue\b/i],
  [
    'quests-upgrades',
    /\bExcavat\w*\b|\bHerald\b|\bImbue\b|\bRitual\b|\bQuest\b|\bSidequest\b|\bInvok(?:e|ed)\b/i,
  ],
  [
    'alternate-payments',
    /costs? (?:your |the |an? |\d+ |\(\d+\) )?(?:OPPONENT'S |opponent's )?(?:Health|Armor|Corpses)(?:\b| instead)|\bcost Armor\b|\bcost Health\b|\binstead of Mana\b|\bspend (?:all )?(?:your )?Armor\b/i,
  ],
  ['corpses-runes', /\bCorpses?\b|\bBlood Runes?\b|\bFrost Rune\b|\bUnholy Rune\b/i],
  ['secrets-counters', /\bSecrets?\b|\bCounter\b/i],
  [
    'cast-when-drawn',
    /\b(?:Cast|Casts|Cast when|Casts when|When) (?:when )?[Dd]rawn\b|\bwhen (?:you |it is |they are )?drawn\b|\bwhen you draw (?:it|them|one)\b|\bBombs?\b.*\bdeck\b|\bSoul Fragments?\b|\bPortals?\b.*\bdeck\b|\bAsteroids?\b/i,
  ],
  [
    'named-progression',
    /\bC'Thun\b|\bJade Golem\b|\bGalakrond\b|\bLibrams?\b|\bRelics?\b|\bAbyssal Curse\b|\bChaotic Tendril\b|\bAbyssal Curses\b|\bDeathwing's\b|\bLeylines?\b/i,
  ],
  [
    'spell-power',
    /\bSpell Damage\b|\bspells? (?:have|gain) Lifesteal\b|\bhealing effects deal damage\b|\bspells? deal (?:\d+ |twice|double|that much|more)/i,
  ],
  ['dormant-board', /\bDormant\b|\bawaken\b|\bLocations?\b|\bColossal\b|\bStarship\b|\bLaunch\b/i],
  [
    'spell-casting',
    /\b(?:Cast|casts|casting|recast|replay)\b|\bRepeat (?:the|your|all|a|each|every) (?:last |other |friendly |random )?(?:Battlecr|spell|card)|\bBattlecries (?:trigger|twice|again)|\bBattlecry (?:triggers|twice|again)/i,
  ],
  ['lasting', /\b(?:rest of (?:the|this) game|this game|all game)\b|\bpermanently\b/i],
  [
    'scheduling',
    /\b(?:at|after|until|during|for) (?:the )?(?:end|start|beginning)\b|\bnext turn\b|\bthis turn, next\b|\bin \d+ turns?\b|\b(?:future|later)\b|\beach turn\b|\b(?:2|two|3|three) turns?\b/i,
  ],
  [
    'ongoing',
    /\bWhenever\b|\bWhile (?:this|you|your)\b|\bwhile this is alive\b|\bWhen (?:you|your|this|a|an|it|they|one|that|the)\b|\bAfter (?:you|a|an|this|another) (?:play|cast|summon|attack|draw|take|gain|die|dies|kill|restore)\b|\bPlay another [^.]* to \b|\bwhile in hand[^.]*play\b|\bIf you (?:play|cast) (?:it|one|them) this turn\b/i,
  ],
  ['death-memory', /\bDeathrattles?\b|\bResurrect\b|\bResummon\b|\b(?:died|dead|killed)\b/i],
  [
    'weapons-combat',
    /\bweapons?\b|\bDurability\b|\bEquip\b|\b(?:Attack|attacks?|battle) (?:a |an |ALL |two |the |random |it\b)|\battack heroes\b|\bMega-Windfury\b/i,
  ],
  [
    'history',
    /\b(?:played|cast|spent|drawn|discarded|summoned|gained|restored|taken|dealt)\b|\bwhile holding\b|\blast turn\b|\bprevious turn\b|\bstarting\b|\bdifferent (?:minion|spell|school|type)|\b(?:left!|Ready!)\b/i,
  ],
  ['choices', /\bDiscover\b|\bChoose (?!One\b)|\bchoice\b|\bsecretly\b|\bPick\b/i],
  ['copy-transform', /\b(?:copy|copies|transform|swap|steal|take control|switch|replace)\b/i],
  ['cost-mana', /\bCost\b|\bMana\b|\bdiscount\b|\bcosts? \(/i],
  [
    'summon-tokens',
    /\bSummon\b|\bRecruit\b|\bFill .*board\b|\binto (?:the |your )?(?:battlefield|board)\b/i,
  ],
  [
    'generate-pools',
    /\b(?:Add|Get|Give your opponent)\b.*\b(?:hand|cards?|spell|coin)\b|\b(?:Add|Get)\b/i,
  ],
  ['draw-zones', /\bdraws?\b|\bDiscard\b|\bShuffle\b|\bDredge\b|\bdeck\b|\bhand\b/i],
  [
    'damage-stats',
    /\b(?:damage|Health|Attack|Armor|stats|Taunt|Rush|Lifesteal|Freeze|Frozen|Immune|Stealth|Shield|Destroy|Silence|Poisonous|Windfury|Reborn|Elusive)\b|\+\d+/i,
  ],
];

const namedFamilies = [
  ['C’Thun', /\bC'Thun\b/i],
  ['Jade Golems', /\bJade Golem\b/i],
  ['Galakrond / Invoke', /\bGalakrond\b|\bInvoke\b/i],
  ['Librams', /\bLibram\w*\b/i],
  ['Relics', /\bRelics?\b/i],
  ['Abyssal Curses', /\bAbyssal Curses?\b/i],
  ['Chaotic Tendrils', /\bChaotic Tendrils?\b/i],
  ['Excavate', /\bExcavat\w*\b/i],
  ['Herald', /\bHerald\b/i],
  ['Imbue', /\bImbue\b/i],
  ['Rituals', /\bRitual\b/i],
  ['Corpses', /\bCorpses?\b/i],
  ['Rune-dependent cards', /\b(?:Blood|Frost|Unholy) Rune/i],
  ['Concoctions', /\bConcoction\w*\b/i],
  ['Potions / Poisons', /\bPotion\w*\b|\bPoison\b/i],
  ['Dark Gifts', /\bDark Gift\b/i],
  ['Dream cards', /\bDream cards?\b/i],
  ['Spare Parts', /\bSpare Parts?\b/i],
  ['Bombs / T.N.T.', /\bBombs?\b|\bT\.N\.T\./i],
  ['Soul Fragments', /\bSoul Fragments?\b/i],
  ['Asteroids', /\bAsteroids?\b/i],
  ['Portals', /\bPortals?\b/i],
  ['Wildseeds', /\bWildseed\w*\b/i],
  ['Pack / collectible-pack simulation', /\b(?:Standard|card|Classic) [Pp]ack\b/i],
  ['Leylines', /\bLeylines?\b/i],
];

// Explicit choices override broad text signals. For example “you've cast” is history,
// not an instruction to cast a spell, and an ordinary “this game” threshold is not a lasting rule.
export function classify(name, printings) {
  const texts = printings.map((p) => normalize(p.text));
  const text = texts.join(' || ');
  const mechanics = new Set(printings.flatMap((p) => p.mechanics ?? []));
  const tags = dependencies.filter(([, pattern]) => pattern.test(text)).map(([id]) => id);
  const keywordTags = keywordRules
    .filter(([, pattern, keys]) => pattern.test(text) || keys.some((k) => mechanics.has(k)))
    .map(([label]) => label);
  const attachedKeywords = keywordRules
    .filter(
      ([label, pattern, keys]) =>
        keys.some((k) => mechanics.has(k)) ||
        texts.some((t) => pattern.test(t.split(/\bBattlecry\b/i)[0])) ||
        (label === 'Adapt / bonus effects' &&
          /\b(?:Adapt|gain [^.]*Bonus Effects?|give [^.]*Bonus Effects?|with a Dark Gift)\b/i.test(
            text,
          )),
    )
    .map(([label]) => label);
  const referencedKeywords = keywordTags.filter((label) => !attachedKeywords.includes(label));
  if (attachedKeywords.length) tags.push('keyword-packages');
  if (mechanics.has('SPELLPOWER') && !tags.includes('spell-power')) tags.push('spell-power');
  if (mechanics.has('AURA') && !tags.includes('ongoing')) tags.push('ongoing');
  if (
    texts.some((t) =>
      /\b(?:have|has|costs?|deal|fire|steal|whenever|immune|numbers)\b/i.test(
        t.split(/\bBattlecry\b/i)[0],
      ),
    ) &&
    !tags.includes('ongoing')
  )
    tags.push('ongoing');
  if (/\bCan be played on either side\b/i.test(text) && !tags.includes('dormant-board'))
    tags.push('dormant-board');
  const familyTags = namedFamilies
    .filter(([, pattern]) => pattern.test(text))
    .map(([label]) => label);

  // Only explicit instructions count as nested casts; past-tense conditions alone do not.
  const castInstruction =
    /(?:^|:|\. |, | and | then | to )\s*(?:Cast|Recast|Replay) (?:['"]|a |an |the |it\b|them\b|all |each |every |your |those |another |both |any |two |three |\d)/i.test(
      text,
    ) ||
    /(?:^|:|\. |, | and | then )\s*Play (?:all|the last|each|every|both|a copy)\b/i.test(text) ||
    /\b(?:casts? twice|casts? it|casts? them|that casts? |spells?[^.]{0,40} casts|Battlecries (?:trigger|twice)|(?:next|your|this) Battlecry[^.:]*triggers twice|Repeat (?:the last|all other|each card|every card|all cards)[^.]* (?:Battlecry|Battlecries|spell|spells|card))\b/i.test(
      text,
    );
  if (!castInstruction) {
    const i = tags.indexOf('spell-casting');
    if (i >= 0) tags.splice(i, 1);
  } else if (!tags.includes('spell-casting')) tags.push('spell-casting');
  const actionText = normalize(texts[0]?.split(/Battlecry(?: and [\w ,]+)?:/i).at(-1)).replace(
    /^If .+?, /i,
    '',
  );
  const lastingRule =
    /\b(?:rest of (?:the|this) game|permanently)\b/i.test(text) ||
    (/\bthis game\b/i.test(actionText) &&
      /^(?:Your .* (?:have|cost|deal|are)|Whenever |Reduce the Cost|Increase .*damage|Give your .* (?:have|Rush|Charge|Taunt))/i.test(
        actionText,
      ));
  if (!lastingRule) {
    const i = tags.indexOf('lasting');
    if (i >= 0) tags.splice(i, 1);
  }
  const historyCondition =
    /\bwhile (?:holding|in hand|in your hand|in hand or deck)\b|\b(?:played|cast|spent|drawn|discarded|summoned|gained|restored|taken|dealt|started|starting)[^.]*\b(?:this game|last turn|this turn|your turns|your last turn|your deck|your hand)\b|\bfor each turn you've taken\b/i.test(
      text,
    );

  const priority = [
    'custom-build',
    'match-rules',
    'hero-powers',
    'quests-upgrades',
    'alternate-payments',
    'corpses-runes',
    'secrets-counters',
    'cast-when-drawn',
    'named-progression',
    'spell-power',
    'dormant-board',
    'spell-casting',
    'lasting',
    'keyword-packages',
    'ongoing',
    'scheduling',
    'death-memory',
    'weapons-combat',
  ];
  let primary = priority.find((id) => tags.includes(id));
  if (!primary && historyCondition && tags.includes('history')) primary = 'history';
  if (!primary) {
    const head = actionText;
    if (
      /^Destroy (?:ALL|all|both players'|the top|all cards|both)/i.test(head) &&
      /\b(?:deck|hands?)\b/i.test(head)
    )
      primary = 'draw-zones';
    else if (
      /^(?:Reduce|Increase|Set the Cost|Change the Cost|Your next)/i.test(head) &&
      tags.includes('cost-mana')
    )
      primary = 'cost-mana';
    else if (
      /^(?:Deal|Restore|Gain|Give|Set|Double|Freeze|Destroy|Silence|Swap the Attack)/i.test(head) &&
      tags.includes('damage-stats')
    )
      primary = 'damage-stats';
    else if (/^(?:Draw|Discard|Shuffle|Dredge|Return|Put|Remove)/i.test(head))
      primary = 'draw-zones';
    else if (/^(?:Summon|Recruit|Fill your board)/i.test(head)) primary = 'summon-tokens';
    else if (tags.includes('choices')) primary = 'choices';
    else if (tags.includes('copy-transform')) primary = 'copy-transform';
    else if (/^(?:Add|Get|Fill your hand)/i.test(head)) primary = 'generate-pools';
    else if (tags.includes('cost-mana')) primary = 'cost-mana';
    else if (tags.includes('history')) primary = 'history';
    else
      primary =
        ['summon-tokens', 'generate-pools', 'draw-zones', 'damage-stats'].find((id) =>
          tags.includes(id),
        ) ?? 'special-review';
  }
  const overrides = {
    'Alexandros Mograine': [
      'scheduling',
      'The lasting end-of-own-turn damage hook already has an engine foundation; extend and test the complete wrapper.',
    ],
    'Elite Tauren Chieftain': [
      'generate-pools',
      'Define the exact Power Chord pool and each generated spell.',
    ],
    'Pirate Admiral Hooktusk': [
      'custom-build',
      'The plunder choice and options need explicit card rules in addition to the Pirate history threshold.',
    ],
    'Primordial Lord': [
      'generate-pools',
      'The source gets a card from a defined historical Colossal pool. Colossal behavior belongs to the generated card, not this generation step.',
    ],
    'Broodchamber Tunneler': [
      'generate-pools',
      'The source generates a specific Larva. Track its separate Combo/hero-power ability as a generated-card dependency.',
    ],
    'Cardboard Golem': [
      'lasting',
      'Aura spell duration is a missing system; this is not ordinary hand/deck movement.',
    ],
    'Swampqueen Hagatha': [
      'custom-build',
      'Construct and teach a custom Horror rather than merely generating an ordinary token.',
    ],
    'Harth Stonebrew': [
      'custom-build',
      'The iconic-hand replacement needs an explicit predefined recipe pool, not a generic hand refill.',
    ],
    Mankrik: [
      'cast-when-drawn',
      'Shuffle the exact Olgra draw-trigger card and implement its draw behavior.',
    ],
    Helya: [
      'cast-when-drawn',
      'Plague generation and the repeating cast-when-drawn rule must agree.',
    ],
    'Lady in White': [
      'damage-stats',
      'Printed text explicitly defines Inner Fire as setting deck-minion Attack equal to Health; no generic spell resolver is needed for that operation.',
    ],
    'Reno Jackson': [
      'damage-stats',
      'This is a no-duplicates conditional heal; verify the existing Commander full-heal variant.',
    ],
    Siamat: [
      'choices',
      'Choose two distinct grants from Rush, Taunt, Divine Shield and Windfury; those keywords already have engine support.',
    ],
    'Enhance-o Mechano': [
      'damage-stats',
      'Randomly assign existing Windfury, Divine Shield or Taunt grants; no new combat keyword is required.',
    ],
    'Arch-Villain Rafaam': [
      'copy-transform',
      'Replace zone contents from a Legendary pool; no new deck-draw primitive is needed.',
    ],
    "Cera'thine Fleetrunner": [
      'copy-transform',
      'Replacement minions and their reductions belong to one zone-transformation family.',
    ],
    'Lorekeeper Polkelt': [
      'draw-zones',
      'Order the physical deck by Cost; mentioning Cost does not create a discount rule.',
    ],
    'Sacrificial Summoner': [
      'death-memory',
      "Remember the destroyed minion's Cost before recruiting its replacement.",
    ],
    'Wretched Reclaimer': [
      'death-memory',
      'Remember and resummon the destroyed minion while preserving trigger ordering.',
    ],
    'Unseen Saboteur': [
      'spell-casting',
      'The discarded enemy spell must actually resolve with legal targets.',
    ],
    'Spirit of the Badlands': [
      'copy-transform',
      'The generated Mirage has a persistent linked-copy ability; the source needs its exact card definition.',
    ],
    'The Jailer': [
      'damage-stats',
      'The pinned text destroys the deck and grants this minion Immune; implement its actual duration, not an older printed version.',
    ],
    'Lord Godfrey': [
      'damage-stats',
      'Existing repeat-until-no-deaths scripting is a closer foundation than a general Battlecry replay engine.',
    ],
    'Razzle-Dazzler': [
      'history',
      'Repeat the summon operation for counted spell schools; this does not replay the spells themselves.',
    ],
    'Disciple of Eonar': [
      'choices',
      'Combining Choose One branches extends choice resolution; retain its power interaction as an additional dependency.',
    ],
    'Primalfin Challenger': [
      'keyword-packages',
      'Repeating the next Kindred effect needs the Kindred trigger system even though this source only references it.',
    ],
  };
  const override = overrides[name];
  if (override) primary = override[0];
  const group = groups.find((g) => g.id === primary);
  return {
    name,
    primary,
    lane: group.lane,
    dependencies: [...new Set([primary, ...tags])],
    keywordTags,
    attachedKeywords,
    referencedKeywords,
    familyTags,
    multiPrinting: printings.length > 1,
    note:
      override?.[1] ??
      (primary === 'special-review'
        ? 'Needs manual interpretation of the complete printed effect.'
        : 'Planning classification; every additional clause must work before enabling the card.'),
  };
}
