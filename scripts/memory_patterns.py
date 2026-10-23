"""Complete stored-identity, weapon and resource clauses."""
def compile_memory(t,card):
 def s(op,**kw):return dict(op=op,**kw)
 def chosen(op,kind='minion',**kw):return s(op,scope='target',target=kind,**kw)
 def undead(steps):return [s('if',condition={'zone':'deaths-since-last-turn','filter':{'type':'MINION','tribe':'UNDEAD'},'min':1},steps=steps)]
 plans={
  'Discard a random Undead':[s('remember-cards',zone='hand',filter={'tribe':'UNDEAD'},mode='summon',amount=1)],
  'Discard your highest Cost card':[s('remember-cards',zone='hand',order='highest Cost',mode='hand',amount=2)],
  'Destroy a friendly minion':[chosen('remember-cards','friendly-minion',mode='summon',amount=2 if card.get('name')=='Carnivorous Cube' else 1)],
  'Choose an enemy minion':[chosen('remember-cards','enemy-minion',mode='summon',amount=1,copy=True)],
  'Destroy a minion':[chosen('remember-cards',mode='summon',amount=1,destination='original-owner')],
  'Eat a minion in your deck and gain its stats':[s('remember-cards',zone='deck',filter={'type':'MINION'},mode='hand',amount=1,after='stats')],
  'Destroy all other friendly minions':[s('remember-cards',scope='friendly',other=True,mode='summon',amount=1,attack=1,health=1)],
  'Give a friendly minion "Deathrattle: Resummon this minion."':[chosen('grant-return','friendly-minion')],
  'Destroy a friendly minion, then return it to life with full Health':[chosen('reclaim','friendly-minion')],
  'Choose a minion':[chosen('remember-cards',mode='destroy',copy=True)],
  'Gain the Deathrattle of a random minion in your deck':[s('gain-zone-deathrattle')],
  "If you're holding a Dragon, equip a 2/2 Sword":[s('if',condition={'zone':'hand','filter':{'tribe':'DRAGON'},'min':1},steps=[s('equip',token='EDR_457t')])],
  'Give all minions and weapons in your hand +2 Attack':[s('zone-buff',zone='hand',filter={'any':[{'type':'MINION'},{'type':'WEAPON'}]},attack=2,health=0)],
  "Steal your opponent's weapon":[s('weapon-memory',mode='steal')],
  'Give all weapons in your hand, deck, and battlefield +1/+1':[s('zone-buff',zone='hand and deck',filter={'type':'WEAPON'},attack=1,health=1),s('buff',scope='weapon',attack=1,health=1)],
  "Dredge. If it's a minion or a weapon, give it +1/+1":[s('discover',zone='deck',mode='dredge',destination='top',after='fixed-buff-matching',filter={'any':[{'type':'MINION'},{'type':'WEAPON'}]},attack=1,health=1)],
  "Gain stats equal to your weapon's":[s('weapon-memory',mode='stats')],
  'Equip a random weapon from your deck':[s('weapon-memory',mode='equip-deck')],
  "Summon a random minion with Cost equal to your weapon's Attack":[s('weapon-memory',mode='summon')],
  'Set the Attack and Durability of your weapon to 3':[s('weapon-memory',mode='set',attack=3,health=3)],
  'Equip a 3/2 Sword':[s('equip',token='DMF_521t')],
  'If you control another Pirate, equip a random weapon from your deck':[s('if',condition={'zone':'friendly','filter':{'tribe':'PIRATE'},'min':1},steps=[s('weapon-memory',mode='equip-deck')])],
  'If you have a weapon equipped, give it +1/+1. Otherwise, draw a weapon':[s('if',condition={'stat':'weapon','min':1},steps=[s('buff',scope='weapon',attack=1,health=1)],elseSteps=[s('draw',filter={'type':'WEAPON'},amount=1)])],
  'Give your opponent a Mana Crystal':[s('enemy-mana',amount=1)],
  'Set your maximum Mana and hand size to 11':[s('mana-limits',amount=11)],
  'Your next Combo card this turn costs (2) less':[s('next-cost',filter={'keyword':'COMBO'},reduction=2,expires='turn')],
  'Your next Choose One card costs (2) less':[s('next-cost',filter={'keyword':'CHOOSE_ONE'},reduction=2)],
  'Your next Combo card costs (1) less':[s('next-cost',filter={'keyword':'COMBO'},reduction=1)],
  'Your next Temporary card costs (2) less':[s('next-cost',filter={'temporary':True},reduction=2)],
  'The next Draenei you play refreshes Mana Crystals equal to its Attack':[s('future-play',amount=1,filter={'tribe':'DRAENEI'},steps=[s('mana',mode='refresh',amount={'stat':'attack'})])],
  "Set the Cost of every card in both player's hands back to their original Costs":[s('reset-hand-costs')],
  'Your spells cost (1) this turn':[s('turn-cost',filter={'type':'SPELL'},setCost=1)],
  "For each Frost spell you've cast this game, summon a 3/4 Elemental that Freezes":[s('summon-token',token='AV_257t',amount={'count':'played','filter':{'type':'SPELL','school':'FROST'}})],
  "Deal 1 damage to all enemy minions. (Improved by each spell school you've cast this game!)":[s('damage',scope='enemy',amount={'count':'spell-schools-played','offset':1})],
  'If you played an Elemental last turn, summon two 3/3 Cows with Rush':[s('if',condition={'zone':'played-last-turn','filter':{'type':'MINION','tribe':'ELEMENTAL'},'min':1},steps=[s('summon-token',token='WW_024t',amount=2)])],
  'Gain +2/+2 for each other Pogo-Hopper you played this game':[s('buff',scope='self',attack=2,health=2,scale={'count':'played-other','filter':{'name':'Pogo-Hopper'}})],
  "Gain +1/+1 for each other SI:7 card you've played this game":[s('buff',scope='self',attack=1,health=1,scale={'count':'played-other','filter':{'namePrefix':'SI:7'}})],
  'Summon a random 1-Cost minion. (Upgraded for each other SI:7 card you have played this game.)':[s('history-sized-summon',filter={'namePrefix':'SI:7'})],
  "Get copies of every 1-Attack or 1-Health minion you've played this game":[s('history-cards',zone='played',mode='copy',filter={'type':'MINION','any':[{'attack':1},{'health':1}]},after='played-stats')],
  "Summon a 5/5 Lookout for each Watch Post you've summoned this game":[s('summon-token',token='BAR_077t',amount={'count':'summoned','filter':{'nameSuffix':'Watch Post'}})],
  'If a friendly Undead died after your last turn, deal 2 damage':undead([s('damage',scope='target',target='character',amount=2)]),
  'If a friendly Undead died after your last turn, summon a 2/2 Nerubian':undead([s('summon-token',token='RLK_956t',amount=1)]),
  'If a friendly Undead died after your last turn, deal 1 damage to a minion':undead([s('damage',scope='target',target='minion',amount=1)]),
  'If a friendly Undead died after your last turn, summon two 3/2 Zombies':undead([s('summon-token',token='RLK_909t',amount=2)]),
  'Discover a spell. If a friendly Undead died after your last turn, it costs (2) less':[s('if',condition={'zone':'deaths-since-last-turn','filter':{'type':'MINION','tribe':'UNDEAD'},'min':1},steps=[s('discover',filter={'type':'SPELL'},reduction=2)],elseSteps=[s('discover',filter={'type':'SPELL'})])],
  'Resurrect all friendly Undead that died after your last turn':[s('resurrect',filter={'type':'MINION','tribe':'UNDEAD'},mode='since-last-turn',amount=7)],
  'Choose a friendly minion. Discover a minion of the same minion type':[chosen('dynamic-discover','friendly-minion',mode='tribe')],
  "Discover any spell with Cost equal to this minion's Attack. It costs (0) this turn":[s('dynamic-discover',mode='attack',setCost=0,expires='turn')],
  'Discover a card with Cost equal to your remaining Mana Crystals':[s('dynamic-discover',mode='mana')],
  'Choose a friendly minion. Summon any copies of it in your deck':[chosen('recruit-copies','friendly-minion')],
 }
 # These shared short clauses require their printed context; other cards use ordinary destroy/discard rules.
 contextual={
  'Discard a random Undead':{'Amorphous Slime'},'Discard your highest Cost card':{'Expired Merchant'},
  'Destroy a friendly minion':{'Carnivorous Cube','Ravenous Kraken'},'Choose an enemy minion':{'Mindflayer Kaahrj'},
  'Destroy a minion':{'Moat Lurker'},'Destroy all other friendly minions':{'Teron Gorefiend'},'Choose a minion':{'Voodoo Doll'},
 }
 if t in contextual and card.get('name') not in contextual[t]:return None
 native={
  'Amorphous Slime':'Summon a copy of it','Expired Merchant':'Add 2 copies of it to your hand','Carnivorous Cube':'Summon 2 copies of it',
  'Ravenous Kraken':'Summon a copy of it','Mindflayer Kaahrj':'Summon a new copy of it','Moat Lurker':'Resummon it',
  'Gral, the Shark':'Add it to your hand','Teron Gorefiend':'Resummon them with +1/+1','Voodoo Doll':'Destroy the chosen minion',
 }
 if native.get(card.get('name'))==t:return [s('stored-deathrattle')]
 return plans.get(t)
