"""Complete clauses built on the existing engine. Never discard an unknown rider."""
import re
from progression_patterns import compile_progression
from mirror_patterns import compile_mirrors
from memory_patterns import compile_memory

def compile_foundation(t, compile, target, filt, num, keywords, refs, card, choose):
    memory=compile_memory(t,card)
    if memory is not None:return memory
    mirrors=compile_mirrors(t,card)
    if mirrors is not None:return mirrors
    progression=compile_progression(t)
    if progression is not None:return progression
    if t == "Choose a character. If it's friendly, restore 8 Health. If it's an enemy, deal 8 damage":return [dict(op='allegiance-effect',scope='target',target='character',amount=8)]
    if t == "Destroy an enemy minion with Attack less than or equal to this minion's":return [dict(op='attack-threshold-destroy',scope='target',target='enemy-minion')]
    if t == "Return all minions with less Attack than this to their owner's decks":return [dict(op='shuffle-weaker')]
    if t == 'Deal 3 damage to an enemy minion. If it dies, repeat on one of its neighbors':return [dict(op='neighbor-damage',scope='target',target='enemy-minion',amount=3)]
    if t == 'Deal 3 damage to the lowest Health enemy':return [dict(op='lowest-health-damage',amount=3)]
    if t == "Both players draw a card. If it's a Dragon, summon it":return [dict(op='draw-summon-matching',filter={'type':'MINION','tribe':'DRAGON'})]
    if t == 'Choose a damaged friendly minion. Summon a copy of it':return [dict(op='summon-copy',scope='target',target='friendly-minion',filter={'damaged':True},amount=1)]
    if t == 'Draw a Rush, Lifesteal, and Deathrattle card from your deck':return [dict(op='draw',amount=1,filter={'keyword':k}) for k in ('RUSH','LIFESTEAL','DEATHRATTLE')]
    if t == "Draw a card for each different spell school you've cast this game":return [dict(op='draw',amount={'count':'spell-schools-played'})]
    if t == 'If 20 friendly minions have died this game, deal 20 damage split among all enemies':return [dict(op='if',condition={'zone':'friendly-deaths','min':20},steps=[dict(op='missiles',scope='enemies',amount=20)])]
    if t == 'Copy each minion of a different type in your hand':return [dict(op='menagerie',zone='hand',amount=20,mode='copy')]
    if t == "Gain +1/+1 for each minion of a different type you've played this game":return [dict(op='menagerie',zone='played',amount=100,mode='self',attack=1,health=1)]
    if t == "If you've cast three spells while holding this, summon a different Demon from your deck":return [dict(op='held-spells',amount=3,steps=[dict(op='recruit',zone='deck',filter={'type':'MINION','tribe':'DEMON','notName':card['name']},amount=1)])]
    if t == "If you've played two different spell schools while holding this, summon a copy of this":return [dict(op='held-spells',amount=2,distinct=True,steps=[dict(op='summon-self',amount=1)])]
    if t == "If you've played two different spell schools while holding this, deal 4 damage to all enemies":return [dict(op='held-spells',amount=2,distinct=True,steps=[dict(op='damage',scope='enemies',amount=4)])]
    if t == 'Draw a Deathrattle minion and gain its Deathrattle':return [dict(op='draw-linked',amount=1,filter={'type':'MINION','keyword':'DEATHRATTLE'},mode='deathrattle')]
    if t == 'Draw a spell. Your hero takes damage equal to its Cost':return [dict(op='draw-linked',amount=1,filter={'type':'SPELL'},mode='self-damage')]
    if t == 'Discard all weapons from your hand and gain their stats':return [dict(op='discard-weapons-stats')]
    if t == 'Transform into a 4/4 copy of a different minion in your deck':return [dict(op='deck-copy',attack=4,health=4)]
    if t == 'Resurrect all different friendly minions that cost (8) or more':return [dict(op='resurrect',filter={'type':'MINION','minCost':8},amount=7,distinct=True)]
    m=re.fullmatch(r'Give your weapon \+(\d+) (Attack|Durability)',t)
    if m:return [dict(op='buff',attack=int(m[1]) if m[2]=='Attack' else 0,health=int(m[1]) if m[2]=='Durability' else 0,scope='weapon')]
    m=re.fullmatch(r'Remove (\d+) Durability from your opponent\x27s weapon',t)
    if m:return [dict(op='weapon-durability',amount=int(m[1]))]
    if t == 'Gain Attack equal to the Attack of your weapon':return [dict(op='buff',scope='self',attack=1,health=0,scale={'stat':'weapon-attack'})]
    m=re.fullmatch(r'If your weapon has at least (\d+) Attack, (.+)',t)
    if m:
        e=compile(m[2])
        if e is not None:return [dict(op='if',condition={'stat':'weapon-attack','min':int(m[1])},steps=e)]
    if t == "Destroy your opponent's weapon and draw cards equal to its Durability":return [dict(op='destroy-weapon',after='draw-durability')]
    if t == "Destroy your opponent's weapon and gain Armor equal to its Attack":return [dict(op='destroy-weapon',after='armor')]
    if t == 'Equip one of your destroyed weapons':return [dict(op='weapon-recover',mode='equip')]
    if t == 'Return one of your destroyed weapons to your hand':return [dict(op='weapon-recover',mode='hand')]
    m=re.fullmatch(r'Discard a weapon to draw (\d+) cards',t)
    if m:return [dict(op='if',condition={'zone':'hand','filter':{'type':'WEAPON'},'min':1},steps=[dict(op='discard',amount=1,filter={'type':'WEAPON'}),dict(op='draw',amount=int(m[1]))])]
    if t == 'Equip a 2/2 weapon':return [dict(op='equip',token='EX1_398t')]
    if t == 'Summon a 5/6 Naga with Rush':return [dict(op='summon-token',token='TSC_917t',amount=1)]
    lackeys=['DAL_613','DAL_614','DAL_615','DAL_739','DAL_741','DRG_052','ULD_616']
    if t == 'Add a Lackey to your hand':return [dict(op='generate',amount=1,pool=lackeys)]
    if t == 'Destroy a friendly minion to add 2 random Lackeys to your hand':return [dict(op='destroy',scope='target',target='friendly-minion'),dict(op='generate',amount=2,pool=lackeys)]
    if t == 'Deal 1-4 damage to a random enemy':return [dict(op='random-damage',scope='enemies',random=1,amount=1,until=4)]
    if t == 'Summon two 1/1 Boom Bots. WARNING: Bots may explode':return [dict(op='summon-token',token='GVG_110t',amount=2)]
    if t == 'Summon a 6/6 Ogre':return [dict(op='summon-token',token='CFM_648t',amount=1)]
    if t == 'Summon a 2/1 Poisonous Drakeslayer for your opponent':return [dict(op='summon-token',token='GIL_683t',amount=1,enemy=True)]
    if t == 'Summon three 1/1 Huntresses for your opponent':return [dict(op='summon-token',token='BT_159t',amount=3,enemy=True)]
    if t == 'Summon two 1/1 Amalgams with all minion types':return [dict(op='summon-token',token='DAL_087t',amount=2)]
    if t == 'Summon a 1/3 Spider':return [dict(op='summon-token',token='KAR_030',amount=1)]
    if t == 'Summon two 1/1 Fighters with Rush and Reborn':return [dict(op='summon-token',token='RLK_077t',amount=2)]
    if t == 'Get a 1-Cost Rock that deals 3 damage':return [dict(op='generate-token',token='WW_001t',amount=1)]
    if t == 'Destroy a friendly Lackey to summon a 5/5 Demon':return [dict(op='destroy',scope='target',target='friendly-minion',filter={'nameSuffix':'Lackey'}),dict(op='summon-token',token='ULD_162t',amount=1)]
    if t == 'Destroy all non-Paladin minions':return [dict(op='destroy',scope='all',filter={'notClass':'PALADIN'})]
    if t == 'Deal 6 damage to a minion. If it survives, gain +6 Health and Taunt. ~GAMEPLAY ASPROXY BE 994':return [dict(op='damage-then',scope='target',target='minion',amount=6,mode='survives',steps=[dict(op='buff',scope='self',attack=0,health=6),dict(op='keyword',scope='self',keyword='TAUNT')])]
    if t == 'Deal 3 damage split among all enemies. If any die, deal 3 more':return [dict(op='missiles-then',amount=3,scope='enemies',steps=[dict(op='missiles',scope='enemies',amount=3)])]
    if t == 'Swap the Attack of the highest and lowest Attack minion':return [dict(op='swap-extreme-attack')]
    if t == 'Summon a Beast from your deck and give it Rush':return [dict(op='recruit',zone='deck',filter={'type':'MINION','tribe':'BEAST'},amount=1,keyword='RUSH')]
    if t == 'Fill each player\x27s board with 1/1 Imps':return [dict(op='summon-token',token='BRM_006t',amount=7,allPlayers=True)]
    if t == 'Summon a 1/3 Voidwalker with Taunt. If your opponent has more minions, repeat':return [dict(op='summon-until',token='CS2_065',mode='enemy-board')]
    if t == 'Draw a Divine Shield minion and an Aura':return [dict(op='draw',amount=1,filter={'type':'MINION','keyword':'DIVINE_SHIELD'}),dict(op='draw',amount=1,filter={'type':'SPELL','nameSuffix':' Aura'})]
    if t == 'Restore 3 Health to your hero and give them Divine Shield':return [dict(op='heal',scope='hero',amount=3),dict(op='keyword',scope='hero',keyword='DIVINE_SHIELD')]
    if t == 'Destroy your deck. This minion gains Immune':return [dict(op='destroy-zone',zone='deck'),dict(op='immune',scope='self',permanent=True)]
    if t == 'Summon two 1/1 Ice Shards that Freeze':return [dict(op='summon-token',token='YOD_029t',amount=2)]
    if t == 'Draw a spell. If it\x27s a Frost spell, summon two 1/1 Elementals that Freeze':return [dict(op='draw-linked',amount=1,filter={'type':'SPELL'},mode='frost-shards',token='YOD_029t')]
    if t == 'Draw two cards. For each that isn\x27t a minion, summon a 3/6 Water Elemental':return [dict(op='draw-linked',amount=2,mode='non-minion-elemental',token='VAC_509t')]
    if t == 'Summon a {0}/{1} Beast with Rush. (It has the opposite stats of this minion!)':return [dict(op='summon-sized',token='BE_850',mode='opposite')]
    if t == 'Summon a 1/1 Rider with Rush for each minion in your hand':return [dict(op='summon-token',token='DMF_523t',amount={'count':'hand','filter':{'type':'MINION'}})]
    if t == 'Add a random Outcast card to the left and right sides of your hand. They cost (2) less':return [dict(op='generate',amount=1,filter={'keyword':'OUTCAST'},reduction=2,destination=d) for d in ('left','right')]
    if t == 'Destroy the top 3 cards of your deck. Any Fire spells or Elementals are drawn instead':return [dict(op='burn-or-draw',amount=3,filter={'any':[{'type':'SPELL','school':'FIRE'},{'type':'MINION','tribe':'ELEMENTAL'}]})]
    if t == 'Draw a minion. Transform it into a random Legendary one (keeping its original stats and Cost)':return [dict(op='draw-linked',amount=1,filter={'type':'MINION'},mode='legendary')]
    if t == 'Draw a minion. Transform all other friendly minions into copies of it':return [dict(op='draw-linked',amount=1,filter={'type':'MINION'},mode='transform-board')]
    if t == 'Draw a card and reduce its Cost by (10). Repeat this with excess Cost reduction':return [dict(op='draw-linked',amount=1,mode='excess-discount')]
    if t == 'Draw a Shadow spell. Get a Temporary copy of it':return [dict(op='draw-linked',amount=1,filter={'type':'SPELL','school':'SHADOW'},mode='temporary-copy')]
    if t == 'Summon a 0, 1, and 2-Attack minion from your deck. Gain their stats':return [dict(op='recruit-gain',amount=1,filter={'type':'MINION','attack':a}) for a in range(3)]
    if t == 'If your deck has no Neutral cards, draw a minion of each minion type':return [dict(op='if',condition={'zone':'deck','filter':{'classes':['NEUTRAL']},'max':0},steps=[dict(op='draw',amount=1,filter={'type':'MINION','tribe':tr}) for tr in ('BEAST','DEMON','DRAGON','ELEMENTAL','MECHANICAL','MURLOC','PIRATE','TOTEM','UNDEAD','DRAENEI','QUILBOAR','NAGA')])]
    if t == 'Shuffle both players\x27 hands together':return [dict(op='shuffle-hands')]
    if t == 'If the combined Health of both heroes is exactly 42, set your hero\x27s Health to 42':return [dict(op='if',condition={'special':'combined-health-42'},steps=[dict(op='set-health',scope='hero',amount=42)])]
    if t == 'If this costs more than every minion in your deck, summon one of those minions':return [dict(op='if',condition={'special':'source-more-expensive'},steps=[dict(op='recruit',zone='deck',filter={'type':'MINION'},amount=1)])]
    plans = {
        'Set the stats of the next three minions you play to 8/8': [dict(op='future-play',amount=3,filter={'type':'MINION'},steps=[dict(op='set-stats',scope='target',target='minion',attack=8,health=8)])],
        'The next Draenei you play gains +2/+1': [dict(op='future-play',amount=1,filter={'tribe':'DRAENEI'},steps=[dict(op='buff',scope='target',target='minion',attack=2,health=1)])],
        'The next Draenei you play gains +2 Health and Rush': [dict(op='future-play',amount=1,filter={'tribe':'DRAENEI'},steps=[dict(op='buff',scope='target',target='minion',attack=0,health=2),dict(op='keyword',scope='target',target='minion',keyword='RUSH')])],
        'The next Draenei you play gives your hero its Attack for that turn': [dict(op='future-play',amount=1,filter={'tribe':'DRAENEI'},steps=[dict(op='hero-attack',amount={'stat':'attack'})])],
        'Give 3 random friendly minions of different minion types +2/+2': [dict(op='menagerie',zone='board',amount=3,attack=2,health=2)],
        'Give 3 random friendly minions of different minion types +1/+1': [dict(op='menagerie',zone='board',amount=3,attack=1,health=1)],
        'Give +1/+1 to each minion of a different type in your hand': [dict(op='menagerie',zone='hand',amount=10,attack=1,health=1)],
        'Summon three minions from your deck that are from different expansions': [dict(op='recruit',zone='deck',filter={'type':'MINION'},amount=3,distinct=True)],
        'Dredge. Reduce its Cost by (1)': [dict(op='discover',zone='deck',mode='dredge',destination='top',reduction=1)],
        'Dredge. Gain Armor equal to its Cost': [dict(op='discover',zone='deck',mode='dredge',destination='top',after='armor')],
        'Dredge. If it\x27s a Mech, draw it': [dict(op='discover',zone='deck',mode='dredge',destination='top',after='draw-matching',filter={'tribe':'MECHANICAL'})],
        'Dredge. If it\x27s a 1-Cost minion, summon it': [dict(op='discover',zone='deck',mode='dredge',destination='top',after='summon-matching',filter={'type':'MINION','cost':1})],
        'Dredge. If it\x27s a Murloc, summon a 2/2 copy of it': [dict(op='discover',zone='deck',mode='dredge',destination='top',after='copy-matching',filter={'tribe':'MURLOC'},attack=2,health=2)],
        'Dredge. If it\x27s a minion, give it this minion\x27s Attack and Health': [dict(op='discover',zone='deck',mode='dredge',destination='top',after='buff-matching',filter={'type':'MINION'})],
        'Dredge. If it\x27s an Undead, deal 5 damage to the enemy hero': [dict(op='discover',zone='deck',mode='dredge',destination='top',after='damage-matching',filter={'tribe':'UNDEAD'},amount=5)],
        'Draw a card. It costs (1) less this turn. (I know its name!)': [dict(op='draw',mode='top',amount=1,reduction=1,expires='turn')],
        'Draw a spell that costs (3) or less. It costs (0) this turn': [dict(op='draw',amount=1,filter={'type':'SPELL','maxCost':3},setCost=0,expires='turn')],
        'Return a friendly minion to your hand. It costs (1) this turn': [dict(op='bounce',scope='target',target='friendly-minion',setCost=1,expires='turn')],
        'Take Fatigue damage. Gain that much Attack and Health': [dict(op='fatigue-payoff',mode='buff')],
        'Draw two cards that cost (6) or more. Finale: They cost (1) less': [dict(op='draw',filter={'minCost':6},amount=2,reduction=0),],
        'Set this minion\x27s Attack and Health to the highest in the battlefield': [dict(op='battlefield-stats',mode='highest')],
        'All minions lose Divine Shield. Gain +3/+3 for each Shield lost': [dict(op='shield-harvest',attack=3,health=3)],
        'Draw 2 spells. Swap their Costs with this minion\x27s stats': [dict(op='draw-linked',amount=2,filter={'type':'SPELL'},mode='swap-cost-stats')],
        'Draw a spell. Gain Armor equal to its Cost': [dict(op='draw-linked',amount=1,filter={'type':'SPELL'},mode='armor')],
        'Draw a spell. If it\x27s a Holy spell, reduce its Cost by (2)': [dict(op='draw-linked',amount=1,filter={'type':'SPELL'},mode='holy-discount')],
        'Draw a spell. If it\x27s a Nature spell, also draw an Elemental': [dict(op='draw-linked',amount=1,filter={'type':'SPELL'},mode='nature-elemental')],
        'Draw 2 cards. If they\x27re both minions, gain Charge': [dict(op='draw-linked',amount=2,mode='minions-charge')],
        'Draw 2 spells. If they\x27re both Frost spells, deal 2 damage to all enemies': [dict(op='draw-linked',amount=2,filter={'type':'SPELL'},mode='frost-damage')],
        'Draw your highest Cost spell. Summon a random minion with the same Cost': [dict(op='draw-linked',amount=1,filter={'type':'SPELL'},order='highest Cost',mode='summon-cost')],
        'Draw a card. If it\x27s a minion, transform it into a Chicken': [dict(op='draw-linked',amount=1,mode='chicken',token='GVG_092t')],
        'Draw cards until you draw one that isn\x27t a Dragon': [dict(op='draw-linked',amount=101,mode='until-not-dragon')],
        'Draw 5 cards. Give any spells drawn to your opponent': [dict(op='draw-linked',amount=5,mode='give-spells')],
        'Draw an Outcast card and slide it to the left side of your hand': [dict(op='draw-linked',amount=1,filter={'keyword':'OUTCAST'},mode='left')],
        'Give +4/+4 to the top 3 minions in your deck': [dict(op='zone-buff',zone='deck',filter={'type':'MINION'},until=3,attack=4,health=4)],
        'Shuffle your hand into your deck, then draw that many cards': [dict(op='shuffle-hand-draw')],
        'If your deck has no duplicates, duplicate your hand': [dict(op='if',condition={'special':'no-duplicates'},steps=[dict(op='copy-zone',zone='hand')])],
        'All your minions deal damage equal to their Attack to a random enemy': [dict(op='board-shots')],
        'Randomly toss 3 hats to other minions. Each hat gives +1/+1': [dict(op='repeat',amount=3,steps=[dict(op='buff',scope='all',other=True,random=1,attack=1,health=1)])],
        'Give your other minions Windfury, Taunt, or Divine Shield (at random)': [dict(op='random-keyword',scope='friendly',other=True,pool=['WINDFURY','TAUNT','DIVINE_SHIELD'])],
        'For each enemy minion, randomly gain Rush, Divine Shield, or Windfury': [dict(op='repeat',amount={'count':'enemy'},steps=[dict(op='random-keyword',scope='self',pool=['RUSH','DIVINE_SHIELD','WINDFURY'])])],
        'For each Paladin card in your hand, randomly gain Divine Shield, Lifesteal, Rush, or Taunt': [dict(op='repeat',amount={'count':'hand','filter':{'classes':['PALADIN']}},steps=[dict(op='random-keyword',scope='self',pool=['DIVINE_SHIELD','LIFESTEAL','RUSH','TAUNT'])])],
        'Gain Taunt if your deck has a Taunt minion. Repeat for Divine Shield, Lifesteal, Windfury': [dict(op='if',condition={'zone':'deck','filter':{'type':'MINION','keyword':k},'min':1},steps=[dict(op='keyword',scope='self',keyword=k)]) for k in ('TAUNT','DIVINE_SHIELD','LIFESTEAL','WINDFURY')],
        'Draw a Rush minion to gain Rush. Repeat for Taunt and Divine Shield': [dict(op='draw-linked',amount=1,filter={'type':'MINION','keyword':k},mode='gain-keyword',keyword=k) for k in ('RUSH','TAUNT','DIVINE_SHIELD')],
        'Destroy a minion and gain its Health': [dict(op='consume',scope='target',target='minion',mode='health')],
        'Destroy a friendly minion and gain its Attack and Health': [dict(op='consume',scope='target',target='friendly-minion',mode='stats')],
        'Destroy both adjacent minions and gain their Attack and Health': [dict(op='consume',scope='adjacent',mode='stats')],
        'Destroy a friendly Undead. Your minions gain its Attack': [dict(op='consume',scope='target',target='friendly-minion',filter={'tribe':'UNDEAD'},mode='board-attack')],
        'Destroy a minion. Your hero takes damage equal to its Health': [dict(op='consume',scope='target',target='minion',mode='hero-damage')],
        'Destroy your Totems. Gain +2/+2 for each destroyed': [dict(op='consume',scope='friendly',other=True,filter={'tribe':'TOTEM'},attack=2,health=2)],
        'Give a friendly minion Attack and Health equal to this minion\x27s': [dict(op='source-stats',scope='target',target='friendly-minion')],
        'Give a minion in your hand Attack equal to this minion\x27s Attack': [dict(op='choose-hand',zone='hand',filter={'type':'MINION'},after='source-attack')],
        'Set the Attack and Health of every minion in your hand to the higher of the two stats': [dict(op='zone-stats',zone='hand',filter={'type':'MINION'},mode='higher')],
        'Cast \'Inner Fire\' on every minion in your deck (set Attack equal to Health)': [dict(op='zone-stats',zone='deck',filter={'type':'MINION'},mode='inner-fire')],
        'Set the Attack and Health of all Combo minions in your hand to 6': [dict(op='zone-stats',zone='hand',filter={'type':'MINION','keyword':'COMBO'},attack=6,health=6)],
        'Convert all but 1 of your Hero\x27s Health into Armor': [dict(op='convert-health')],
        'Increase your maximum hand size to 12. Draw 4 cards': [dict(op='hand-limit',amount=12),dict(op='draw',amount=4)],
        'Freeze all enemy minions. If any are already Frozen, deal 4 damage to them instead': [dict(op='freeze-or-damage',scope='enemy',amount=4)],
        'Give a friendly minion Reborn. If it already has Reborn, summon a copy of it': [dict(op='reborn-or-copy',scope='target',target='friendly-minion')],
        'Restore 3 Health to all other friendly minions. Gain +1/+1 for each one Overhealed': [dict(op='overheal-buff',amount=3)],
        'Destroy all 1-Cost spells in both hands and decks': [dict(op='destroy-zone',zone='hand and deck',allPlayers=True,filter={'type':'SPELL','cost':1})],
        'Destroy all cards that cost (2) or less in both players\x27 decks': [dict(op='destroy-zone',zone='deck',allPlayers=True,filter={'maxCost':2})],
        'Destroy both players\x27 decks EXCEPT the 8 highest Cost cards in each': [dict(op='destroy-zone',zone='deck',allPlayers=True,mode='keep-highest',until=8)],
        'Remove the top card of your opponent\x27s deck': [dict(op='destroy-zone',zone='deck',enemy=True,mode='top',amount=1)],
        'If your deck is empty, destroy the top 5 cards of the enemy deck': [dict(op='if',condition={'zone':'deck','max':0},steps=[dict(op='destroy-zone',zone='deck',enemy=True,mode='top',amount=5)])],
        'Deal 5 damage to an enemy minion. Draw cards equal to the excess damage': [dict(op='damage-then',scope='target',target='enemy-minion',amount=5,mode='excess-draw',steps=[])],
        'Deal 3 damage to a minion and all others of the same minion type': [dict(op='tribe-damage',scope='target',target='minion',amount=3)],
        'Destroy a minion and all copies of it (wherever they are)': [dict(op='destroy-copies',scope='target',target='minion')],
        'Destroy all other minions. Discard a card for each destroyed': [dict(op='consume',scope='all',other=True,mode='discard')],
        'Destroy a random minion in your opponent\x27s hand, deck, and battlefield': [dict(op='destroy-zone',zone='hand and deck',enemy=True,filter={'type':'MINION'},random=1),dict(op='destroy',scope='enemy',random=1)],
        'Eat a minion in your opponent\x27s hand. Gain its stats': [dict(op='eat-hand')],
        'Shuffle the lowest-Cost card from your hand into your deck. Draw a card': [dict(op='hand-to-deck',order='lowest Cost',destination='shuffle'),dict(op='draw',amount=1)],
        'Put the highest Cost card in your hand on top of your deck': [dict(op='hand-to-deck',order='highest Cost',destination='top')],
        'Set the Costs of the bottom 5 cards of your deck to (1)': [dict(op='deck-cost',until=5,setCost=1)],
        'If the last card you played costs (1), gain +1/+1': [dict(op='if',condition={'special':'last-cost-one'},steps=[dict(op='buff',scope='self',attack=1,health=1)])],
        'If any hero took damage this turn, draw a Shadow spell': [dict(op='if',condition={'special':'any-hero-damage'},steps=[dict(op='draw',amount=1,filter={'type':'SPELL','school':'SHADOW'})])],
        'If you\x27re holding a Holy and a Shadow spell, deal 3 damage to all other minions': [dict(op='if',condition={'zone':'hand','filter':{'school':'HOLY'},'min':1},steps=[dict(op='if',condition={'zone':'hand','filter':{'school':'SHADOW'},'min':1},steps=[dict(op='damage',scope='all',other=True,amount=3)])])],
        'Deal 2 damage. If this entered your hand this turn, deal 4 instead': [dict(op='held-damage',scope='target',target='character',amount=2)],
        'Deal 1 damage. (Improved by your hero attacks this game!)': [dict(op='hero-history-damage',scope='target',target='character',amount=1)],
    }
    if t == 'Draw two cards that cost (6) or more. Finale: They cost (1) less':return [dict(op='if',condition={'stat':'remaining-mana','max':0},steps=[dict(op='draw',amount=2,filter={'minCost':6},reduction=1)],elseSteps=[dict(op='draw',amount=2,filter={'minCost':6})])]
    if t == 'Deal 2 damage. Finale: To all enemies':return [dict(op='if',condition={'stat':'remaining-mana','max':0},steps=[dict(op='damage',scope='enemies',amount=2)],elseSteps=[dict(op='damage',scope='target',target='character',amount=2)])]
    if t in plans:return plans[t]
    if t == 'Summon two 1/1 Desert Hares' or t == 'Summon a 1/1 Zergling' or t == 'Summon a Saronite Chain Gang':return [dict(op='summon-token',token=card['id'],amount=2 if 'two' in t else 1)]
    if t == 'If your deck has no Neutral cards, summon two Vigilant Sentries':return [dict(op='if',condition={'zone':'deck','filter':{'classes':['NEUTRAL']},'max':0},steps=[dict(op='summon-token',token=card['id'],amount=2)])]
    if t == 'Give your 1-Attack minions +1/+1':return [dict(op='buff',scope='friendly',filter={'attack':1},attack=1,health=1)]
    if t == 'Deal 6 damage to an enemy minion with a minion type':return [dict(op='damage',scope='target',target='enemy-minion',filter={'hasTribe':True},amount=6)]
    if t == 'Double the stats of all friendly Silver Hand Recruits and give them Taunt':return [dict(op='double',scope='friendly',filter={'name':'Silver Hand Recruit'},stat=stat) for stat in ('attack','health')]+[dict(op='keyword',scope='friendly',filter={'name':'Silver Hand Recruit'},keyword='TAUNT')]
    if t == 'Summon a 2-Cost Taunt minion. If you have 10 or more Mana, summon a 6-Cost instead':return [dict(op='if',condition={'stat':'mana','min':10},steps=[dict(op='summon-pool',amount=1,filter={'cost':6,'type':'MINION','keyword':'TAUNT'})],elseSteps=[dict(op='summon-pool',amount=1,filter={'cost':2,'type':'MINION','keyword':'TAUNT'})])]
    if t == 'If this costs (0), gain +2/+2':return [dict(op='if',condition={'stat':'source-cost','max':0},steps=[dict(op='buff',scope='self',attack=2,health=2)])]
    if t == 'Get two random Magnetic Mechs. They cost (2) less':return [dict(op='generate',amount=2,filter={'type':'MINION','tribe':'MECHANICAL','keyword':'MAGNETIC'},reduction=2)]
    if t == 'Add a random 4-Cost minion to your opponent\x27s hand':return [dict(op='generate',amount=1,filter={'type':'MINION','cost':4},enemy=True)]
    if t == 'If your deck has no duplicates, add 2 other random Dragons to your hand. They cost (0)':return [dict(op='if',condition={'special':'no-duplicates'},steps=[dict(op='generate',amount=2,filter={'type':'MINION','tribe':'DRAGON','notName':card['name']},setCost=0)])]
    if t == 'Give a Stealthed minion +3 Attack and Immune this turn':return [dict(op='buff',scope='target',target='minion',filter={'keyword':'STEALTH'},attack=3,health=0,expires='turn'),dict(op='immune',scope='target',target='minion',expires='turn')]
    if t == 'Dredge for your opponent. Set its Cost to (6)':return [dict(op='discover',zone='enemy-deck',mode='dredge',destination='top',setCost=6)]
    if t == 'Randomly destroy another minion. Repeat for each Dragon you\x27re holding':return [dict(op='destroy',scope='all',other=True,random=1),dict(op='repeat',amount={'count':'hand','filter':{'tribe':'DRAGON'}},steps=[dict(op='destroy',scope='all',other=True,random=1)])]
    if t == 'Summon copies of your damaged minions. Give the copies Rush':return [dict(op='summon-copy',scope='friendly',other=True,filter={'damaged':True},keyword='RUSH')]
    if t == 'If you\x27re holding a Dragon, give it and this minion +1/+1':return [dict(op='if',condition={'zone':'hand','filter':{'tribe':'DRAGON'},'min':1},steps=[dict(op='zone-buff',zone='hand',filter={'tribe':'DRAGON'},random=1,attack=1,health=1),dict(op='buff',scope='self',attack=1,health=1)])]
    if t == 'Get 3 random Temporary Draenei':return [dict(op='generate',amount=3,filter={'type':'MINION','tribe':'DRAENEI'},expires='turn')]
    if t == 'Get a random playable spell. It is Temporary':return [dict(op='generate',amount=1,filter={'type':'SPELL'},mode='affordable',expires='turn')]
    if t == 'Add a Solar Eclipse and Lunar Eclipse to your hand':
        ts=[choose([c for c in refs if c.get('name')==n]) for n in ('Solar Eclipse','Lunar Eclipse')]
        if all(ts):return [dict(op='generate-token',token=c['id'],amount=1) for c in ts]
    if t == 'Fill your hand with 1/1 Lynxes that have Rush':
        tok=choose([c for c in refs if c.get('name')=='Lynx' and c.get('attack')==1 and c.get('health')==1])
        if tok:return [dict(op='generate-token',token=tok['id'],until=10)]
    if t == 'Fill your opponent\x27s hand with Bananas':
        tok=choose([c for c in refs if c.get('name')=='Bananas'])
        if tok:return [dict(op='generate-token',token=tok['id'],until=10,enemy=True)]
    if t == 'Summon a Demon with Taunt and stats equal to your hand size':return [dict(op='summon-sized',token='DRG_207t',mode='hand')]
    if t == 'Summon a random minion with Cost equal to your hand size':return [dict(op='summon-sized',mode='cost-hand')]
    if t == 'Summon a random minion from your deck that you can afford to play':return [dict(op='recruit',zone='deck',filter={'type':'MINION'},amount=1,mode='affordable')]
    if t == 'Summon a {0}/{1} Beast with Rush. (It has the opposite stats of this minion!)':
        tok=choose([c for c in refs if c['id'].startswith(card['id']) and c['id']!=card['id'] and c.get('type')=='MINION'])
        if tok:return [dict(op='summon-sized',token=tok['id'],mode='opposite')]
    if t == 'Take Fatigue damage. Summon that many 3/3 Imps':
        tok=choose([c for c in refs if c['id'].startswith(card['id']) and c.get('attack')==3 and c.get('health')==3 and c['id']!=card['id']])
        if tok:return [dict(op='fatigue-payoff',mode='summon',token=tok['id'])]
    if t == 'Summon a 1/1 Rider with Rush for each minion in your hand':
        e=compile('Summon a 1/1 Rider with Rush')
        if e:return [dict(op='repeat',amount={'count':'hand','filter':{'type':'MINION'}},steps=e)]
    # Exact token records resolve descriptive nouns such as Cat (Tabbycat) and
    # Mech (Annoy-o-Tron); only a source's own tokens with complete basic text qualify.
    m=re.fullmatch(r'(Summon|Add|Get) (a|an|two|three|six|\d+) (\d+)/(\d+) (.+?)(?: (?:with|that (?:have|has)) (.+?))?( to your hand| for your opponent| for each player)?',t)
    if m:
        basic=set(keywords.values())
        parent=card.get('id','!').removeprefix('CORE_')
        noun=m[5].removesuffix('s')
        tribe={'Beast':'BEAST','Demon':'DEMON','Dragon':'DRAGON','Elemental':'ELEMENTAL','Mech':'MECHANICAL','Murloc':'MURLOC','Pirate':'PIRATE','Totem':'TOTEM','Undead':'UNDEAD'}.get(noun)
        def fits(c):
            identity=noun=='minion' or c.get('name','').lower().endswith(noun.lower()) or (noun=='Cat' and c.get('name')=='Tabbycat') or (tribe and tribe in c.get('races',[c.get('race')]))
            declared=m[6].split(' and ') if m[6] else []
            abilities=all(k in keywords and keywords[k] in c.get('mechanics',[]) for k in declared)
            if m[6]=='all minion types':abilities=c.get('race')=='ALL'
            return identity and abilities
        opts=[c for c in refs if c['id'].startswith(parent) and c['id']!=parent and c.get('type')=='MINION' and c.get('attack')==int(m[3]) and c.get('health')==int(m[4]) and set(c.get('mechanics',[]))<=basic and not re.sub(r'Taunt|Rush|Charge|Divine Shield|Lifesteal|Windfury|Poisonous|Stealth|Reborn|<[^>]*>|[.,\s\[x\]]','',c.get('text','')) and fits(c)]
        tok=choose(opts)
        if tok:return [dict(op='summon-token' if m[1]=='Summon' else 'generate-token',token=tok['id'],amount=num(m[2]),enemy=m[7]==' for your opponent',allPlayers=m[7]==' for each player')]
    aliases = {
        'Deal 4 damage to HIMSELF': 'Deal 4 damage to this minion',
        'Deal 1 damage to ALL other characters': 'Deal 1 damage to all other characters',
        'Die': 'Destroy this minion',
        'Destroy one of your Mana Crystals': 'Lose 1 Mana Crystal',
        'Discard 2 cards': 'Discard two random cards',
        'Destroy a Mana Crystal for each player': None,
        'Draw the lowest Cost minion from your deck': 'Draw lowest Cost minion',
        'Give a friendly minion Reborn': None,
        'Destroy all other minions and discard your hand': 'Destroy all other minions. Discard your hand',
        'Return a friendly minion to your hand. Give it +2/+2': 'Return a friendly minion to your hand and give it +2/+2',
        'Add a 1-Cost spell from your class to your hand': 'Add a random 1-Cost spell from your class to your hand',
        'Summon 1/1 Whelps until your side of the battlefield is full': 'Summon 7 1/1 Whelps',
        'Fill your board with copies of this minion': 'Summon 7 copies of this minion',
        'If your deck has no duplicates, fully heal your hero': 'If your deck has no duplicates, restore your hero to full Health',
        'Give all Battlecry minions in your deck +1/+1': 'Give minions in your deck +1/+1',
    }
    # Snapdragon needs the Battlecry filter, not the alias's unfiltered minions.
    if t == 'Give all Battlecry minions in your deck +1/+1':
        return [dict(op='zone-buff',zone='deck',filter={'type':'MINION','keyword':'BATTLECRY'},attack=1,health=1)]
    if t in aliases and aliases[t] is not None:return compile(aliases[t])
    if t == 'Destroy a Mana Crystal for each player':return [dict(op='mana',mode='lose',amount=1,allPlayers=True)]
    if t == 'Get a Coin' or t == 'Give your opponent a Coin':
        tok=choose([c for c in refs if c.get('name')=='The Coin'])
        if tok:return [dict(op='generate-token',token=tok['id'],amount=1,enemy='opponent' in t)]
    if t == 'Add a \'Mirror Image\' spell to your hand':return compile('Add Mirror Image to your hand')
    if t == 'Lose 1 Health for each card in your opponent\x27s hand':return [dict(op='buff',scope='self',attack=0,health=-1,scale={'count':'enemy-hand'})]
    if t == 'Gain +1/+1 for each other Pirate you control':return [dict(op='buff',scope='self',attack=1,health=1,scale={'count':'friendly','filter':{'tribe':'PIRATE'}})]
    if t == 'Draw a Shadow spell':return [dict(op='draw',amount=1,filter={'type':'SPELL','school':'SHADOW'})]
    if t == 'If you\x27re holding a Dragon, destroy a damaged enemy minion':return [dict(op='if',condition={'zone':'hand','filter':{'tribe':'DRAGON'},'min':1},steps=[dict(op='destroy',scope='target',target='enemy-minion',filter={'damaged':True})])]
    if t == 'Double the Health of your other minions':return [dict(op='double',scope='friendly',other=True,stat='health')]
    if t == 'Gain +5/+5 and summon a copy of this':return [dict(op='buff',scope='self',attack=5,health=5),dict(op='summon-self',amount=1)]
    if t == 'Reveal a spell in each deck. If yours costs more, draw it':return [dict(op='joust',filter={'type':'SPELL'},after='draw',steps=[])]
    if t == 'Summon a Beast from your deck that costs (5) or less':return [dict(op='recruit',zone='deck',amount=1,filter={'type':'MINION','tribe':'BEAST','maxCost':5})]
    if t == 'Summon two minions from your deck that cost (2) or less. Give them Rush':return [dict(op='recruit',zone='deck',amount=2,filter={'type':'MINION','maxCost':2},keyword='RUSH')]
    if t == 'Get a random Overload card':return [dict(op='generate',amount=1,filter={'keyword':'OVERLOAD'})]
    if t == 'Deal 2 damage to all other minions. If any die, repeat this Battlecry':return [dict(op='repeat-death',steps=[dict(op='damage',scope='all',other=True,amount=2)])]
    if t == 'Your opponent summons a random minion from their hand':return [dict(op='recruit',zone='hand',filter={'type':'MINION'},amount=1,enemy=True)]
    if t == 'Your opponent summons a minion from their deck':return [dict(op='recruit',zone='deck',filter={'type':'MINION'},amount=1,enemy=True)]
    if t == 'Put a 1-Cost minion from each deck into the battlefield':return [dict(op='recruit',zone='deck',filter={'type':'MINION','cost':1},amount=1,allPlayers=True)]
    if t == 'Summon a random Demon from your hand and deck':return [dict(op='recruit',zone=z,filter={'type':'MINION','tribe':'DEMON'},amount=1) for z in ('hand','deck')]
    if t == 'Draw 1-Cost minions from your deck until your hand is full':return [dict(op='draw',filter={'type':'MINION','cost':1},until=10,mode='fill-hand')]
    if t == 'Draw spells until your hand is full':return [dict(op='draw',filter={'type':'SPELL'},until=10,mode='fill-hand')]
    m=re.fullmatch(r'(?:Each player draws|Both players draw) (a card|\d+ cards)',t)
    if m:return [dict(op='draw',amount=1 if m[1]=='a card' else int(m[1].split()[0]),allPlayers=True)]
    m=re.fullmatch(r'Both players draw until they have (\d+) cards',t)
    if m:return [dict(op='draw',until=int(m[1]),allPlayers=True)]
    m=re.fullmatch(r'Recruit (.+)',t)
    if m:
        f=filt(m[1])
        if f is not None:return [dict(op='recruit',zone='deck',filter=f,amount=1)]
    m=re.fullmatch(r'Recruit a (\d+), (\d+), and (\d+)-Attack minion',t)
    if m:return [dict(op='recruit',zone='deck',filter={'type':'MINION','attack':int(a)},amount=1) for a in m.groups()]
    m=re.fullmatch(r'Summon (\d+) (.+) from your deck\. Give them Rush',t)
    if m:
        f=filt(m[2])
        if f is not None:return [dict(op='recruit',zone='deck',filter=f,amount=int(m[1]),keyword='RUSH')]
    m=re.fullmatch(r'Summon a (\d+)/(\d+) copy of a random minion in your deck',t)
    if m:return [dict(op='recruit',zone='deck',filter={'type':'MINION'},amount=1,copy=True,attack=int(m[1]),health=int(m[2]))]
    m=re.fullmatch(r'Summon a (\d+)/(\d+) copy of each of your other minions',t)
    if m:return [dict(op='summon-copy',scope='friendly',other=True,attack=int(m[1]),health=int(m[2]))]
    m=re.fullmatch(r'(?:Give|Get|Add) (?:a |an |two |2 )?(Coin|Armor Scraps|Razorpetal|Rock)(?: to (your hand|your opponent))?(?: that (?:give \+2 Health to a minion|deals \d+ damage))?',t)
    if m:
        name={'Coin':'The Coin','Armor Scraps':'Armor Scrap'}.get(m[1],m[1])
        token=choose([c for c in refs if c.get('name')==name])
        if token:return [dict(op='generate-token',token=token['id'],amount=2 if ' 2 ' in t or ' two ' in t else 1,enemy='opponent' in t)]
    m=re.fullmatch(r"Put a '(.+)' on the bottom of your deck",t)
    if m:
        token=choose([c for c in refs if c.get('name')==m[1]])
        if token:return [dict(op='deck-token',token=token['id'],destination='bottom')]
    m=re.fullmatch(r'Give (.+) (Reborn|Stealth)',t)
    if m:
        q=target(m[1])
        if q:return [dict(op='keyword',keyword=keywords[m[2]],**q)]
    m=re.fullmatch(r'Give (.+) ([+-]\d+) Attack and (Immune|Lifesteal) this turn',t)
    if m:
        q=target(m[1])
        if q:return [dict(op='buff',attack=int(m[2]),health=0,expires='turn',**q),dict(op='immune' if m[3]=='Immune' else 'keyword',keyword=keywords.get(m[3]),expires='turn',**q)]
    m=re.fullmatch(r'Give a minion ([+-]\d+)/([+-]\d+) and Freeze it',t)
    if m:return [dict(op='buff',scope='target',target='minion',attack=int(m[1]),health=int(m[2])),dict(op='freeze',scope='target',target='minion')]
    m=re.fullmatch(r'Deal (\d+) damage to (two|three) random enemy minions',t)
    if m:return [dict(op='damage',scope='enemy',random=num(m[2]),amount=int(m[1]))]
    m=re.fullmatch(r'Deal damage equal to this minion\x27s Attack(?: randomly split among all enemies)?',t)
    if m:return [dict(op='missiles' if 'randomly' in t else 'damage',scope='enemies' if 'randomly' in t else 'target',target=None if 'randomly' in t else 'character',amount={'stat':'attack'})]
    if t == "Deal damage to an enemy minion equal to your hero's Attack":return [dict(op='damage',scope='target',target='enemy-minion',amount={'stat':'hero-attack'})]
    m=re.fullmatch(r'Deal (\d+) damage to all (?:non-(\w+) minions|minions except (\w+)s)',t)
    if m:
        f=filt(m[2] or m[3])
        if f and 'tribe' in f:return [dict(op='damage',scope='all',filter={'notTribe':f['tribe']},amount=int(m[1]))]
    m=re.fullmatch(r'Deal (\d+) damage to an enemy and your hero',t)
    if m:return [dict(op='damage',scope='target',target='enemy-character',amount=int(m[1])),dict(op='damage',scope='hero',amount=int(m[1]))]
    m=re.fullmatch(r'Destroy (a Pirate|a Beast|a Murloc|a friendly minion) and gain ([+-]\d+)/([+-]\d+)',t)
    if m:return [dict(op='consume',attack=int(m[2]),health=int(m[3]),**target(m[1]))]
    if t == 'Change the Health of all enemy minions to 1':return [dict(op='set-minion-health',scope='enemy',amount=1)]
    if t == 'Destroy all other minions with 2 or less Attack':return [dict(op='destroy',scope='all',other=True,filter={'maxAttack':2})]
    if t == 'Deal 2 damage to the left and right-most enemy minions':return [dict(op='edge-damage',amount=2)]
    if t == 'Enemy minions lose Stealth':return [dict(op='remove-keyword',scope='enemy',keyword='STEALTH')]
    if t == 'Reorder your deck from the highest Cost card to the lowest Cost card':return [dict(op='deck-order',mode='cost')]
    if t == 'Reverse the order of your deck':return [dict(op='deck-order',mode='reverse')]
    m=re.fullmatch(r'Draw (a card|a Fel spell|a spell that costs \(3\) or less)\. (?:Change its Cost to \((\d+)\)|Reduce its Cost by \((\d+)\))',t)
    if m:return [dict(op='draw',amount=1,filter={} if m[1]=='a card' else {'type':'SPELL','school':'FEL'} if 'Fel' in m[1] else {'type':'SPELL','maxCost':3},mode='top' if m[1]=='a card' else None,**({'setCost':int(m[2])} if m[2] else {'reduction':int(m[3])}))]
    m=re.fullmatch(r'Add (two|2) (1-Cost spells from your class) to your hand',t)
    if m:return [dict(op='generate',amount=2,filter={'type':'SPELL','cost':1,'ownClass':True})]
    m=re.fullmatch(r'(?:Add|Get) (a |two |2 )?random (.+) to your hand \(from your opponent\x27s class\)',t)
    if m:
        f=filt(m[2])
        if f is not None:return [dict(op='generate',amount=2 if m[1] in ('two ','2 ') else 1,filter=f,mode='opponent-class')]
    if t == 'Add a random Fire Mage and Fire Warlock spell to your hand':return [dict(op='generate',amount=1,filter={'type':'SPELL','school':'FIRE','classes':[cl]}) for cl in ('MAGE','WARLOCK')]
    m=re.fullmatch(r'If this has (\d+) or more Attack, (.+)',t)
    if not m:m=re.fullmatch(r'Gain (Rush) if this has at least (\d+) Attack',t);m2=m
    else:m2=None
    if m:
        e=compile('Gain Rush' if m2 else m[2])
        if e is not None:return [dict(op='if',condition={'stat':'source-attack','min':int(m[2] if m2 else m[1])},steps=e)]
    m=re.fullmatch(r'If you\x27re holding another (\d+)-Cost card, (.+)',t)
    if m:
        e=compile(m[2])
        if e is not None:return [dict(op='if',condition={'zone':'hand','filter':{'cost':int(m[1])},'min':1},steps=e)]
    m=re.fullmatch(r'If your deck has only (odd|even)-Cost cards, (.+)',t)
    if m:
        e=compile(m[2])
        if e is not None:return [dict(op='if',condition={'special':m[1]+'-deck'},steps=e)]
    m=re.fullmatch(r'If (an enemy is Frozen|you control a Frozen minion|you have Overloaded Mana Crystals|your opponent controls a Dragon|you control a minion with 6 or more Health|your deck has 25 or more cards), (.+)',t)
    if m:
        c={'an enemy is Frozen':{'zone':'enemy-frozen','min':1},'you control a Frozen minion':{'zone':'friendly','filter':{'frozen':True},'min':1},'you have Overloaded Mana Crystals':{'stat':'overload','min':1},'your opponent controls a Dragon':{'zone':'enemy','filter':{'tribe':'DRAGON'},'min':1},'you control a minion with 6 or more Health':{'zone':'friendly-including-self','filter':{'minHealth':6},'min':1},'your deck has 25 or more cards':{'zone':'deck','min':25}}[m[1]]
        e=compile(m[2])
        if e is not None:return [dict(op='if',condition=c,steps=e)]
    if t == 'If your deck has no Neutral cards, gain Rush, Lifesteal, Taunt, and Divine Shield':return [dict(op='if',condition={'zone':'deck','filter':{'classes':['NEUTRAL']},'max':0},steps=[dict(op='keyword',scope='self',keyword=keywords[k]) for k in ('Rush','Lifesteal','Taunt','Divine Shield')])]
    m=re.fullmatch(r'Draw (?:a |an )?(.+?)\. Give it a funny mustache!',t)
    if m:return compile('Draw '+m[1]) # Cosmetic rider has no gameplay effect.
    return None
