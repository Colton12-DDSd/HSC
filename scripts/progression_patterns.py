"""Complete cost/history/copy clauses for the fifty-name batch."""

def compile_progression(t):
    def step(op, **kw): return dict(op=op, **kw)
    def count(zone, **f): return dict(count=zone, **({'filter':f} if f else {}))
    def buff(a=1,h=1,scale=1):return step('buff',scope='self',attack=a,health=h,scale=scale)
    def cond(zone,minimum,steps,**f):return [step('if',condition=dict(zone=zone,min=minimum,**({'filter':f} if f else {})),steps=steps)]
    def nxt(n=0,**kw):return step('next-cost',reduction=n,**kw)
    spell={'type':'SPELL'}
    elemental={'type':'MINION','tribe':'ELEMENTAL'}
    plans={
      'Your next two Murlocs cost (2) less':[nxt(2,amount=2,filter={'tribe':'MURLOC'})],
      "If you're holding a Dragon, your next spell this turn costs (0)":cond('hand',1,[nxt(setCost=0,filter=spell,expires='turn')],tribe='DRAGON'),
      'Unlock your Overloaded Mana Crystals':[step('unlock-mana')],
      "If you're holding any cards from another class, reduce their Cost by (2)":[step('cost',zone='hand',filter={'otherClass':True},reduction=2)],
      'Reduce the Cost of all Dragons in your hand by (1). Give them +1/+1':[step('cost',zone='hand',filter={'tribe':'DRAGON'},reduction=1),step('zone-buff',zone='hand',filter={'tribe':'DRAGON'},attack=1,health=1)],
      'Refresh empty Mana Crystals equal to the Cost of the highest Cost spell in your hand':[step('resource-payoff',mode='highest-spell')],
      "Spend 4 Mana to double this minion's stats":[step('resource-payoff',mode='spend-double',amount=4)],
      "Set the Cost of a random spell in your hand to this minion's Cost":[step('resource-payoff',mode='spell-cost')],
      'Change the Cost of spells in your hand to (5)':[step('cost',zone='hand',filter=spell,setCost=5)],
      'The next card you play from another class costs (2) less':[nxt(2,filter={'otherClass':True})],
      'Reveal a spell in your deck. If it costs (5) or more, deal 5 damage split among enemy minions':[step('reveal-spell',mode='missiles',amount=5)],
      'Reveal a spell from your deck. Summon a random minion with the same Cost':[step('reveal-spell',mode='summon')],
      'Your next spell this turn costs (0)':[nxt(setCost=0,filter=spell,expires='turn')],
      'Unlock your Overloaded Mana Crystals. Draw that many cards':[step('unlock-mana',after='draw')],
      'Set the Cost of the top card of your deck to (0)':[step('deck-cost',mode='top',until=1,setCost=0)],
      'If this costs less than every minion in your deck, reduce their Cost by (3)':[step('if',condition={'special':'source-less-expensive'},steps=[step('cost',zone='deck',filter={'type':'MINION'},reduction=3)])],
      "If you didn't play a minion last turn, refresh 3 Mana Crystals":[step('if',condition={'zone':'played-last-turn','filter':{'type':'MINION'},'max':0},steps=[step('mana',mode='refresh',amount=3)])],
      'If every card in your hand is of a different Cost, reduce their Costs by (2)':[step('resource-payoff',mode='distinct-costs',reduction=2)],
      "If you've played a Fire spell this turn, destroy a minion":cond('played-this-turn',1,[step('destroy',scope='target',target='minion')],type='SPELL',school='FIRE'),
      'If you have gained 15 or more Armor this game, gain +3/+3 and Charge':cond('armor-gained',15,[buff(3,3),step('keyword',scope='self',keyword='CHARGE')]),
      "If you've cast three spells while holding this, add those spells back to your hand":[step('history-cards',zone='held',mode='copy',amount=3,filter=spell)],
      "Summon a 3/3 Elemental for each spell school you've cast this game":[step('summon-token',token='TSC_648t',amount=count('spell-schools-played'))],
      "If you've restored 5 Health this game, summon a copy of this":cond('healed-game',5,[step('summon-self',amount=1)]),
      'Summon a 5/5 Dragon for each spell you cast this game that costs (5) or more':[step('summon-token',token='LOOT_535t',amount=count('played',type='SPELL',minCost=5))],
      'Gain stats equal to the damage your hero has taken this turn':[buff(scale=count('hero-damage-this-turn'))],
      "Gain +1/+1 for each other Freebird you've played this game":[buff(scale=count('played-other',name='Freebird'))],
      "For each spell you've cast while holding this, summon a minion of that spell's Cost":[step('history-cards',zone='held',mode='summon-cost',filter=spell)],
      'If your deck has no duplicates, the next spell you cast this turn costs (0)':[step('if',condition={'special':'no-duplicates'},steps=[nxt(setCost=0,filter=spell,expires='turn')])],
      'Get a copy of the last Draenei you played':[step('history-cards',zone='played',mode='last-copy',filter={'type':'MINION','tribe':'DRAENEI'})],
      'Return all spells you played last turn to your hand':[step('history-cards',zone='previous',mode='copy',filter=spell)],
      "For each spell you've cast this turn, add a random Mage spell to your hand":[step('generate',filter={'type':'SPELL','classes':['MAGE']},amount=count('played-this-turn',type='SPELL'))],
      "If you've cast a Fel spell this turn, gain +2/+2":cond('played-this-turn',1,[buff(2,2)],type='SPELL',school='FEL'),
      'Gain +1 Attack for each damage your hero has taken this turn':[buff(1,0,count('hero-damage-this-turn'))],
      'The next spell you cast this turn costs (3) less':[nxt(3,filter=spell,expires='turn')],
      'Gain +5 Health for each Elemental you played last turn':[buff(0,5,count('played-last-turn',**elemental))],
      "Refresh an empty Mana Crystal for each spell you've cast this turn":[step('mana',mode='refresh',amount=count('played-this-turn',type='SPELL'))],
      "If you've cast a Nature spell while holding this, gain +1/+1 and draw a card":cond('played-while-held',1,[buff(),step('draw',amount=1)],type='SPELL',school='NATURE'),
      "Gain +1/+1 for each spell you've cast this turn":[buff(scale=count('played-this-turn',type='SPELL'))],
      "Summon a random 5-Cost minion. Repeat for each spell school you've cast this game":[step('summon-pool',filter={'type':'MINION','cost':5},amount=1),step('summon-pool',filter={'type':'MINION','cost':5},amount=count('spell-schools-played'))],
      "If you've cast three spells while holding this, Freeze 3 random enemy minions":[step('held-spells',amount=3,steps=[step('freeze',scope='enemy',random=3)])],
      "If you've taken damage this turn, deal that much to an enemy minion":cond('hero-damage-this-turn',1,[step('damage',scope='target',target='enemy-minion',amount=count('hero-damage-this-turn'))]),
      'If you played an Elemental last turn, summon two 2/3 Elementals with Taunt':cond('played-last-turn',1,[step('summon-token',token='UNG_208t',amount=2)],**elemental),
      'Draw a card. Repeat for each Elemental you played last turn':[step('draw',amount=1),step('draw',amount=count('played-last-turn',**elemental))],
      "If you've restored Health this turn, deal that much damage to all enemy minions":cond('healed-this-turn',1,[step('damage',scope='enemy',amount=count('healed-this-turn'))]),
      "If you've restored 10 Health this game, gain +4/+4 and Taunt":cond('healed-game',10,[buff(4,4),step('keyword',scope='self',keyword='TAUNT')]),
      'Get a copy of another Elemental or Dragon in your hand':[step('copy-zone',filter={'any':[{'tribe':'ELEMENTAL'},{'tribe':'DRAGON'}]},random=1)],
      'Create a Golden copy of a random card in your hand':[step('copy-zone',random=1)],
      'Add a copy of each of your other Battlecry minions to your hand':[step('copy-board-hand',scope='friendly',other=True,filter={'keyword':'BATTLECRY'})],
      'Transform into an 8/8 copy of a random minion in your hand':[step('deck-copy',zone='hand',attack=8,health=8)],
      'If you have a Beast, transform this minion into a 7/7':cond('friendly',1,[step('transform',scope='self',**{'from':'token'},token='GVG_080t')],tribe='BEAST'),
    }
    return plans.get(t)

