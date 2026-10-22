"""Complete clauses for the mirror/copy/Deathrattle fifty-name batch."""
def compile_mirrors(t,card):
    def s(op,**kw):return dict(op=op,**kw)
    def chosen(op,kind='minion',**kw):return s(op,scope='target',target=kind,**kw)
    def discover(classes):return [s('discover',filter={'classes':classes})]
    plans={
      'Transform minions in your hand into random Demons. (They keep their original stats and Cost.)':[s('transform-zone',zone='hand',filter={'type':'MINION'},resultFilter={'type':'MINION','tribe':'DEMON'},mode='keep-stats-cost')],
      'Replace your hand and deck with Legendary minions':[s('transform-zone',zone='hand and deck',resultFilter={'type':'MINION','rarity':'LEGENDARY'})],
      'Replace your minions in hand and deck with ones from other classes. They cost (2) less':[s('transform-zone',zone='hand and deck',filter={'type':'MINION'},resultFilter={'type':'MINION','otherClass':True},reduction=2)],
      'Transform all spells in your hand into ones that cost (3) more. (They keep their original Cost.)':[s('transform-zone',zone='hand',filter={'type':'SPELL'},resultFilter={'type':'SPELL'},costDelta=3,mode='keep-cost')],
      'Transform all Neutral cards in your deck into random Druid ones':[s('transform-zone',zone='deck',filter={'classes':['NEUTRAL']},resultFilter={'classes':['DRUID']})],
      'Transform minions in your deck into random Dragons. (They keep their original stats and Cost.)':[s('transform-zone',zone='deck',filter={'type':'MINION'},resultFilter={'type':'MINION','tribe':'DRAGON'},mode='keep-stats-cost')],
      "Replace spells in your hand with random spells (from your opponent's class)":[s('transform-zone',zone='hand',filter={'type':'SPELL'},resultFilter={'type':'SPELL'},mode='opponent-class')],
      'Transform all 1-Cost cards in your deck into Legendary minions':[s('transform-zone',zone='deck',filter={'cost':1},resultFilter={'type':'MINION','rarity':'LEGENDARY'})],
      'Transform all Neutral cards in your deck into random cards from your class':[s('transform-zone',zone='deck',filter={'classes':['NEUTRAL']},resultFilter={'ownClass':True})],
      'Give your opponent a Coin':[s('generate-token',token='GAME_005',amount=1,enemy=True)],
      'Swap stats with a friendly minion':[chosen('swap-source','friendly-minion',mode='both',other=True)],
      'Swap Health with another minion':[chosen('swap-source',mode='health',other=True)],
      'Swap stats with another minion':[chosen('swap-source',mode='both',other=True)],
      'Swap Attack with another minion':[chosen('swap-source',mode='attack',other=True)],
      "If you're holding a Dragon, swap this minion's Attack with another minion's":[s('if',condition={'zone':'hand','filter':{'tribe':'DRAGON'},'min':1},steps=[chosen('swap-source',mode='attack',other=True)])],
      'Transform a friendly minion into a 6/6 Elemental':[chosen('transform','friendly-minion',**{'from':'token'},token='LOOT_150t1')],
      'Transform another random minion into a 5/5 Devilsaur or a 1/1 Squirrel':[s('transform-random',scope='all',other=True,random=1,pool=['EX1_tk29','EX1_tk28'])],
      'Choose a friendly minion. Add a Temporary copy of it to your hand':[chosen('copy-target-hand','friendly-minion',expires='turn')],
      'Choose a friendly Dragon. Add a copy of it to your hand':[chosen('copy-target-hand','friendly-minion',filter={'tribe':'DRAGON'})],
      'Choose a minion and become a copy of it':[chosen('transform',**{'from':'target'})],
      'Choose a friendly Beast. Summon a copy of it':[chosen('summon-copy','friendly-minion',filter={'tribe':'BEAST'},amount=1)],
      'Choose a minion. Summon a 1/1 copy of it':[chosen('summon-copy',amount=1,attack=1,health=1)],
      'Choose a friendly Beast. Shuffle three 3/3 copies into your deck':[chosen('shuffle-copy','friendly-minion',filter={'tribe':'BEAST'},amount=3,attack=3,health=3)],
      'Choose a friendly minion. Add a copy of it to your hand, deck, and battlefield':[chosen('copy-target-hand','friendly-minion'),chosen('shuffle-copy','friendly-minion',amount=1,mode='plain'),chosen('summon-copy','friendly-minion',amount=1)],
      'Choose a friendly minion. Add a 1/1 copy to your hand that costs (1)':[chosen('copy-target-hand','friendly-minion',attack=1,health=1,setCost=1)],
      'Choose a friendly minion. Add a 10/10 copy to your hand that costs (10)':[chosen('copy-target-hand','friendly-minion',attack=10,health=10,setCost=10)],
      'Choose a friendly minion. Add a Golden copy of it to your hand':[chosen('copy-target-hand','friendly-minion')],
      'Choose a minion. Become a 4/4 copy of it, then Silence it':[chosen('transform',**{'from':'target'},attack=4,health=4),chosen('silence')],
      'Choose a friendly Mech. Summon a copy of it with Rush, Windfury, and Divine Shield':[chosen('summon-copy','friendly-minion',filter={'tribe':'MECHANICAL'},amount=1,pool=['RUSH','WINDFURY','DIVINE_SHIELD'])],
      'Discover a Hunter, Paladin, or Warrior card':discover(['HUNTER','PALADIN','WARRIOR']),
      'Discover a Mage, Priest, or Warlock card':discover(['MAGE','PRIEST','WARLOCK']),
      'Discover a Druid, Rogue, or Shaman card':discover(['DRUID','ROGUE','SHAMAN']),
      'Discover a spell from another class that costs (3) or less':[s('discover',filter={'type':'SPELL','otherClass':True,'maxCost':3})],
      "If you're Overloaded, Discover a spell from your deck":[s('if',condition={'stat':'overload','min':1},steps=[s('discover',zone='deck',filter={'type':'SPELL'})])],
      'Discover a 1/1 copy of a Battlecry minion. It costs (1)':[s('discover',filter={'type':'MINION','keyword':'BATTLECRY'},mode='set-stats',attack=1,health=1,setCost=1)],
      "Discover a card in your deck. If it's empty, gain +4/+4 instead":[s('if',condition={'zone':'deck','max':0},steps=[s('buff',scope='self',attack=4,health=4)],elseSteps=[s('discover',zone='deck')])],
      'Change each Deathrattle minion in your hand into a 1/1 that costs (1)':[s('zone-stats',zone='hand',filter={'type':'MINION','keyword':'DEATHRATTLE'},attack=1,health=1),s('cost',zone='hand',filter={'type':'MINION','keyword':'DEATHRATTLE'},setCost=1)],
      'Give all Draenei in your hand +2/+1':[s('zone-buff',zone='hand',filter={'tribe':'DRAENEI'},attack=2,health=1)],
      'Give another random friendly Undead +5/+5 and Taunt':[s('buff-keyword',scope='friendly',other=True,random=1,filter={'tribe':'UNDEAD'},attack=5,health=5,keyword='TAUNT')],
      'Set the Health of all other minions to 1':[s('set-minion-health',scope='all',other=True,amount=1)],
      'Deal 2 damage to all minions with Deathrattle':[s('damage',scope='all',filter={'keyword':'DEATHRATTLE'},amount=2)],
      'Gain +1/+1 for each minion that died this turn':[s('buff',scope='self',attack=1,health=1,scale={'count':'died-this-turn'})],
      'Summon a 5/5 Skeleton':[s('summon-token',token='ICC_025t',amount=1)],
      'Add a Coin to your hand':[s('generate-token',token='GAME_005',amount=1)],
      'Spend all your Mana. Gain +1/+1 for each Mana spent':[s('resource-payoff',mode='spend-buff')],
      'For each spell in your hand, summon a random minion of the same Cost':[s('hand-spell-summons')],
      "Fill your opponent's board with random 1-Cost minions":[s('summon-pool',filter={'type':'MINION','cost':1},amount=7,enemy=True)],
      'Reduce the Cost of a spell of each school in your hand by (2)':[s('school-discounts',reduction=2)],
    }
    if t == 'Summon one for your opponent' and card.get('name') == 'Rattling Rascal':return [s('summon-token',token='ICC_025t',amount=1,enemy=True)]
    if t == 'Give your opponent one' and card.get('name') == 'Mailbox Dancer':return [s('generate-token',token='GAME_005',amount=1,enemy=True)]
    if t == 'You get two' and card.get('name') == 'Loan Shark':return [s('generate-token',token='GAME_005',amount=2)]
    return plans.get(t)
