"""Whole-text spell adapters using only existing engine operations.

Spell wording is distinct from Battlecry wording. Never remove a gameplay rider
or compile a partial clause. Templates below preserve targets and durations.
"""
import re

def compile_spell(card, compile, clean, target, filt, num, refs, choose):
    t = clean(card.get('text', '')).rstrip('.')
    # Cosmetic, explanatory reminders, not gameplay conditions/upgrades.
    t = re.sub(r'\. \(\+\d+ Attack/\+\d+ Health\)$', '', t)
    t = re.sub(r'\. \(chosen randomly\)$', '', t)
    t = re.sub(r'\(from another class\)', 'from another class', t)
    t = t.replace('ALL', 'all').replace('EVERY', 'every')
    t = re.sub(r'\bSpells\b', 'spells', t)
    t = t.replace('Give all Taunt minions in your hand', 'Give Taunt minions in your hand')
    def s(op, **kw): return dict(op=op, **kw)
    def chosen(op, kind='minion', **kw): return s(op, scope='target', target=kind, **kw)
    def text(q): return compile(q)
    def token(name, attack=None, health=None):
        options = [c for c in refs if c.get('name') == name and
                   (attack is None or c.get('attack') == attack) and
                   (health is None or c.get('health') == health)]
        return choose(options)
    def summon(name, amount=1, attack=None, health=None):
        c = token(name, attack, health)
        return [s('summon-token', token=c['id'], amount=amount)] if c else None
    plans = {
      "Swap a minion's Attack and Health": [chosen('swap')],
      "Change a minion's Health to 1": [chosen('set-minion-health', amount=1)],
      'Change the Health of all minions to 1': [s('set-minion-health', scope='all', amount=1)],
      'Set the Attack and Health of all minions to 1': [s('set-stats', scope='all', attack=1, health=1)],
      "Set your hero's Health to 40": [s('set-health', scope='hero', amount=40)],
      'Destroy an undamaged minion': [chosen('destroy', filter={'undamaged':True})],
      'Destroy a damaged enemy minion': [chosen('destroy', 'enemy-minion', filter={'damaged':True})],
      'Destroy a Frozen minion': [chosen('destroy', filter={'frozen':True})],
      'Destroy all Frozen minions': [s('destroy', scope='all', filter={'frozen':True})],
      'Destroy all minions except Demons': [s('destroy', scope='all', filter={'notTribe':'DEMON'})],
      'Deal 2 damage to an undamaged minion': [chosen('damage', amount=2, filter={'undamaged':True})],
      'Deal 5 damage to an undamaged character': [chosen('damage', 'character', amount=5, filter={'undamaged':True})],
      'Silence and destroy all minions': [s('silence', scope='all'), s('destroy', scope='all')],
      'Draw the rest of your deck': [s('draw', amount={'count':'deck'})],
      'Draw your two lowest Cost minions': [s('draw', amount=2, filter={'type':'MINION'}, order='lowest Cost')],
      'Draw your lowest and highest Cost Dragon': [s('draw', amount=1, filter={'tribe':'DRAGON'}, order='lowest Cost'),s('draw', amount=1, filter={'tribe':'DRAGON'}, order='highest Cost')],
      'Draw a Naga and a spell': [s('draw', amount=1, filter={'tribe':'NAGA'}),s('draw', amount=1, filter={'type':'SPELL'})],
      'Gain two empty Mana Crystals': [s('mana', amount=2, mode='empty')],
      'Each player gains 2 Mana Crystals': [s('mana', amount=2, mode='gain', allPlayers=True)],
      'Draw a card. That card costs (3) less': [s('draw', amount=1, reduction=3)],
      'Return an enemy minion to your opponent\'s hand': [chosen('bounce','enemy-minion')],
      'Return all friendly minions to your hand': [s('bounce',scope='friendly')],
      "Return all minions to their owner's hand": [s('bounce',scope='all')],
      'Return a friendly minion to your hand. It costs (2) less': [chosen('bounce','friendly-minion',reduction=2)],
      'Return all friendly minions to your hand. They cost (1) this turn': [s('bounce',scope='friendly',setCost=1,expires='turn')],
      'Choose a minion. Add a copy of it to your hand': [chosen('copy-target-hand')],
      'Put a copy of an enemy minion into your hand. It costs (1)': [chosen('copy-target-hand','enemy-minion',setCost=1)],
      'Put a copy of each friendly minion into your hand': [s('copy-board-hand',scope='friendly')],
      'Add a copy of each damaged friendly minion to your hand': [s('copy-board-hand',scope='friendly',filter={'damaged':True})],
      'Choose a friendly minion. Summon a copy of it': [chosen('summon-copy','friendly-minion',amount=1)],
      'Choose a friendly Demon. Summon a copy of it': [chosen('summon-copy','friendly-minion',amount=1,filter={'tribe':'DEMON'})],
      'Choose a friendly minion. Summon a 5/5 copy of it': [chosen('summon-copy','friendly-minion',amount=1,attack=5,health=5)],
      'Summon copies of your damaged minions': [s('summon-copy',scope='friendly',amount=1,filter={'damaged':True})],
      'Summon copies of all Demons you control': [s('summon-copy',scope='friendly',amount=1,filter={'tribe':'DEMON'})],
      'Summon a copy of a friendly minion. Give the copy Taunt': [chosen('summon-copy','friendly-minion',amount=1,keyword='TAUNT')],
      'Give a minion Divine Shield, then summon a 1/1 copy of it': [chosen('keyword',keyword='DIVINE_SHIELD'),chosen('summon-copy',amount=1,attack=1,health=1)],
      'Give a minion +1/+2. Summon a copy of it': [chosen('buff',attack=1,health=2),chosen('summon-copy',amount=1)],
      'Silence a friendly minion, then summon a copy of it': [chosen('silence','friendly-minion'),chosen('summon-copy','friendly-minion',amount=1)],
      'Freeze a minion. Add a copy of it to your hand': [chosen('freeze'),chosen('copy-target-hand')],
      'Choose a minion. Shuffle 3 copies of it into your deck': [chosen('shuffle-copy',amount=3,mode='plain')],
      'Summon a copy of a random minion from your hand': [s('recruit',zone='hand',filter={'type':'MINION'},copy=True,amount=1)],
      'Summon 2 copies of a minion in your deck': [s('recruit',zone='deck',filter={'type':'MINION'},copy=True,amount=2,mode='same-card')],
      'Summon copies of two Demons in your deck': [s('recruit',zone='deck',filter={'tribe':'DEMON'},copy=True,amount=2,mode='different-cards')],
      'Summon copies of two Beasts in your deck that cost (3) or less': [s('recruit',zone='deck',filter={'tribe':'BEAST','maxCost':3},copy=True,amount=2,mode='different-cards')],
      'Summon a random Beast from your hand and give it Rush': [s('recruit',zone='hand',filter={'tribe':'BEAST'},amount=1,keyword='RUSH')],
      'Summon 3 random minions from your hand. Give them Rush': [s('recruit',zone='hand',filter={'type':'MINION'},amount=3,keyword='RUSH')],
      'Summon 7 Murlocs that died this game': [s('resurrect',filter={'tribe':'MURLOC'},amount=7)],
      'Summon your Beasts that died this turn': [s('resurrect',filter={'tribe':'BEAST'},mode='this-turn',amount=7)],
      'Summon 3 friendly minions that died this game': [s('resurrect',amount=3)],
      'Summon a random friendly Beast that died this game': [s('resurrect',filter={'tribe':'BEAST'},amount=1)],
      'Resurrect all friendly minions that cost (2) or less': [s('resurrect',filter={'maxCost':2},amount=7)],
      'Summon the highest Cost friendly Undead that died this game': [s('resurrect',filter={'tribe':'UNDEAD'},order='highest Cost',amount=1)],
      'Resurrect a friendly 1-Cost, 2-Cost, and 3-Cost minion': [s('resurrect',filter={'cost':n},amount=1) for n in (1,2,3)],
      'Fill your board with random Naga': [s('summon-pool',filter={'type':'MINION','tribe':'NAGA'},amount=7)],
      'Fill your board with random Undead': [s('summon-pool',filter={'type':'MINION','tribe':'UNDEAD'},amount=7)],
      'Trigger all Deathrattles on your minions': [s('trigger-deathrattle',scope='friendly')],
      "Trigger a friendly minion's Deathrattle, then destroy it": [chosen('trigger-deathrattle','friendly-minion'),chosen('destroy','friendly-minion')],
      'Destroy a minion, then return it to life with full Health': [chosen('reclaim')],
      'Silence a minion, then give it +3 Health': [chosen('silence'),chosen('buff',attack=0,health=3)],
      'Silence a minion, then deal 1 damage to it': [chosen('silence'),chosen('damage',amount=1)],
      'Silence all friendly minions, then give them +1/+2': [s('silence',scope='friendly'),s('buff',scope='friendly',attack=1,health=2)],
      'Give a minion +2/+2, then give your Beasts +1/+1': [chosen('buff',attack=2,health=2),s('buff',scope='friendly',filter={'tribe':'BEAST'},attack=1,health=1)],
      'Give your minions +1/+1. Give your Murlocs an extra +1/+1': [s('buff',scope='friendly',attack=1,health=1),s('buff',scope='friendly',filter={'tribe':'MURLOC'},attack=1,health=1)],
      'Restore a minion to full Health and give it Taunt': [chosen('heal',amount=0,full=True),chosen('keyword',keyword='TAUNT')],
      'Destroy the top 3 cards of each deck': [s('destroy-zone',zone='deck',mode='top',amount=3,allPlayers=True)],
      'Destroy a minion and one of your Mana Crystals': [chosen('destroy'),s('mana',mode='lose',amount=1)],
      'Destroy a minion. Your opponent draws 2 cards': [chosen('destroy'),s('draw',enemy=True,amount=2)],
      'Destroy a minion. Add a random minion to your opponent\'s hand': [chosen('destroy'),s('generate',enemy=True,amount=1,filter={'type':'MINION'})],
      'Destroy a friendly minion to draw 3 cards': [chosen('destroy','friendly-minion'),s('draw',amount=3)],
      'Destroy a friendly minion to gain 8 Armor': [chosen('destroy','friendly-minion'),s('armor',amount=8)],
      'Destroy a friendly Wisp to draw 3 cards': [chosen('destroy','friendly-minion',filter={'name':'Wisp'}),s('draw',amount=3)],
      "Your hero can't take damage this turn": [s('immune',scope='hero',expires='turn')],
      'The next spell you cast this turn costs (2) less': [s('next-cost',filter={'type':'SPELL'},reduction=2,expires='turn')],
      'Your next Fire spell this turn costs (2) less': [s('next-cost',filter={'type':'SPELL','school':'FIRE'},reduction=2,expires='turn')],
      'The next Elemental you play this turn costs (2) less': [s('next-cost',filter={'tribe':'ELEMENTAL'},reduction=2,expires='turn')],
      'Change the Cost of minions in your deck to (1)': [s('cost',zone='deck',filter={'type':'MINION'},setCost=1)],
      'Discover a spell. It costs (2) less this turn': [s('discover',filter={'type':'SPELL'},reduction=2,expires='turn')],
      'Discover a Secret. Set its Cost to (1)': [s('discover',filter={'type':'SPELL','keyword':'SECRET'},setCost=1)],
      'Discover a Paladin minion. Give it +2/+2': [s('discover',filter={'type':'MINION','classes':['PALADIN']},after='fixed-buff-matching',attack=2,health=2)],
      'Discover a Taunt minion. Give it +1/+2': [s('discover',filter={'type':'MINION','keyword':'TAUNT'},after='fixed-buff-matching',attack=1,health=2)],
      'Discover a Mech from your deck. Give it +2/+1': [s('discover',zone='deck',filter={'tribe':'MECHANICAL'},after='fixed-buff-matching',attack=2,health=1)],
      'Add a random minion to your hand. It costs (3) less': [s('generate',filter={'type':'MINION'},amount=1,reduction=3)],
      'Get two random 4-Cost spells. Reduce their Costs by (2)': [s('generate',filter={'type':'SPELL','cost':4},amount=2,reduction=2)],
      'Get two random 1-Cost spells from other classes': [s('generate',filter={'type':'SPELL','cost':1,'otherClass':True},amount=2)],
      'Add a random 2-Cost and 3-Cost Beast to your hand': [s('generate',filter={'type':'MINION','tribe':'BEAST','cost':n},amount=1) for n in (2,3)],
      'Add a random Warrior minion, spell, and weapon to your hand': [s('generate',filter={'type':kind,'classes':['WARRIOR']},amount=1) for kind in ('MINION','SPELL','WEAPON')],
      'Draw a card. Gain 1 Armor for each card in your hand': [s('draw',amount=1),s('armor',amount={'count':'hand'})],
      'Draw a card. Repeat until you have at least 3 cards': [s('draw',until=3)],
      'Draw a minion. Give Beasts in your hand +2/+2': [s('draw',amount=1,filter={'type':'MINION'}),s('zone-buff',zone='hand',filter={'tribe':'BEAST'},attack=2,health=2)],
      'Deal 1 damage to all minions. If any die, cast this again': [s('repeat-death',steps=[s('damage',scope='all',amount=1)])],
      'Deal 5 damage to all minions, then deal 2 damage to all minions': [s('damage-then',scope='all',amount=5,steps=[]),s('damage',scope='all',amount=2)],
      'Draw 3 cards. Deal 3 damage to your hero': [s('draw',amount=3),s('damage',scope='hero',amount=3)],
      'Deal 4 damage to a minion and your hero': [chosen('damage',amount=4),s('damage',scope='hero',amount=4)],
      'Restore 5 Health to a minion and your hero': [chosen('heal',amount=5),s('heal',scope='hero',amount=5)],
      'Deal 3 damage to a minion and the enemy hero': [chosen('damage',amount=3),s('damage',scope='enemy-heroes',amount=3)],
      'Deal 3 damage. Your next spell this turn costs (2) less': [chosen('damage','character',amount=3),s('next-cost',filter={'type':'SPELL'},reduction=2,expires='turn')],
      'Deal 4 damage. Your next spell this turn costs (2) less': [chosen('damage','character',amount=4),s('next-cost',filter={'type':'SPELL'},reduction=2,expires='turn')],
      'Bracing Cold': None,
      'Restore 5 Health to your hero. Reduce the Cost of a random spell in your hand by (2)': [s('heal',scope='hero',amount=5),s('cost',zone='hand',filter={'type':'SPELL'},reduction=2,random=1)],
      'Deal 1 damage to all minions twice': [s('damage-then',scope='all',amount=1,steps=[]),s('damage',scope='all',amount=1)],
      'Draw a card. It costs (3) less': [s('draw',amount=1,reduction=3)],
      'Draw a minion. Give it +3/+3': [s('draw',amount=1,filter={'type':'MINION'},mode='buff',attack=3,health=3)],
      'Draw the lowest Cost minion from your deck. Give it +2/+2': [s('draw',amount=1,filter={'type':'MINION'},order='lowest Cost',mode='buff',attack=2,health=2)],
      'Draw a card, then add a copy of it to your hand': [s('draw-linked',amount=1,mode='copy')],
      'Draw a card. Add 2 extra copies of it to your hand': [s('draw-linked',amount=1,mode='copy-two')],
      'Shuffle a copy of your hand into your deck': [s('shuffle-hand-copy')],
      'Shuffle your hand into your deck. Draw that many cards': [s('shuffle-hand-draw')],
      'Draw a card for each damaged friendly character': [s('draw',amount={'count':'friendly-characters','filter':{'damaged':True}})],
      'Draw a card. Repeat for each Imp you control': [s('draw',amount={'count':'friendly','filter':{'nameSuffix':'Imp'},'offset':1})],
      'Give a minion +1/+1 for each of your Totems': [chosen('buff',attack=1,health=1,scale={'count':'friendly','filter':{'tribe':'TOTEM'}})],
      'Give a friendly minion +1/+1 for each minion you control': [chosen('buff','friendly-minion',attack=1,health=1,scale={'count':'friendly'})],
      'Destroy a friendly minion. Destroy a random enemy minion': [chosen('destroy','friendly-minion'),s('destroy',scope='enemy',random=1)],
      'Choose a friendly minion. Destroy it and a random enemy minion': [chosen('destroy','friendly-minion'),s('destroy',scope='enemy',random=1)],
      'Eternal Layover': None,
      'Give all minions Reborn, then destroy all minions': [s('keyword',scope='all',keyword='REBORN'),s('destroy',scope='all')],
      'Get a random Golden Pirate and Elemental from other classes': [s('generate',filter={'tribe':tribe,'otherClass':True},amount=1) for tribe in ('PIRATE','ELEMENTAL')],
      'Get a random Epic, Rare, and Common card from other classes': [s('generate',filter={'rarity':r,'otherClass':True},amount=1) for r in ('EPIC','RARE','COMMON')],
      'Get 3 random cards (from your opponent\'s class)': [s('generate',mode='opponent-class',amount=3)],
      'Add 5 random Beasts to your hand. They are Temporary': [s('generate',amount=5,filter={'tribe':'BEAST'},expires='turn')],
      'Fill your hand with random Mage spells. They are Temporary': [s('generate',amount=10,filter={'type':'SPELL','classes':['MAGE']},expires='turn')],
      'Copy 2 cards in your opponent\'s deck and add them to your hand': [s('copy-enemy-cards',amount=2)],
      'Copy 3 cards in your opponent\'s deck and add them to your hand': [s('copy-enemy-cards',amount=3)],
      'Copy a spell in your opponent\'s deck and add it to your hand': [s('copy-enemy-cards',amount=1,filter={'type':'SPELL'})],
    }
    # These rewards need additional linkage; keep them pending in this pass.
    for key in ('Draw a card, then add a copy of it to your hand','Draw a card. Add 2 extra copies of it to your hand',
                'Shuffle a copy of your hand into your deck','Draw a card for each damaged friendly character',
                'Draw a card. Repeat for each Imp you control',
                "Copy 2 cards in your opponent's deck and add them to your hand", "Copy 3 cards in your opponent's deck and add them to your hand", "Copy a spell in your opponent's deck and add it to your hand"):
        plans.pop(key)
    if t in plans: return plans[t]

    exact={
      'Draw two 1-Attack minions from your deck':[s('draw',amount=2,filter={'type':'MINION','attack':1})],
      'Draw a Secret from your deck. It costs (0)':[s('draw',amount=1,filter={'type':'SPELL','keyword':'SECRET'},setCost=0)],
      'Give the left-most minion in your hand +2/+2':[s('zone-buff',zone='hand',filter={'type':'MINION'},until=1,attack=2,health=2)],
      'Recruit 3 minions that cost (2) or less':[s('recruit',zone='deck',filter={'type':'MINION','maxCost':2},amount=3)],
      'Pilfered Power':None,
      'Gain an empty Mana Crystal for each friendly minion':[s('mana',mode='empty',amount={'count':'friendly'})],
      'Deal 2 damage to the lowest Health enemy, twice':[s('lowest-health-damage',amount=2),s('lowest-health-damage',amount=2)],
      'Shoot three missiles at random enemies that deal 3 damage each':[s('damage',scope='enemies',random=1,amount=3) for _ in range(3)],
      'Deal 4 damage. Give a random friendly minion +4/+4':[chosen('damage','character',amount=4),s('buff',scope='friendly',random=1,attack=4,health=4)],
      'Fill your hand with random Fire spells. They cost (1)':[s('generate',amount=10,filter={'type':'SPELL','school':'FIRE'},setCost=1)],
      'Discover a Dragon. Your next one costs (1) less':[s('discover',filter={'tribe':'DRAGON'}),s('next-cost',filter={'tribe':'DRAGON'},reduction=1)],
      'Discover a Demon. Your next one costs (1) less':[s('discover',filter={'tribe':'DEMON'}),s('next-cost',filter={'tribe':'DEMON'},reduction=1)],
      'Discover a spell. Your next one costs (1) less':[s('discover',filter={'type':'SPELL'}),s('next-cost',filter={'type':'SPELL'},reduction=1)],
      'Put a copy of each friendly minion into your hand':[s('copy-board-hand',scope='friendly')],
      'For each spell in your hand, summon a random minion of the same Cost':[s('hand-spell-summons')],
      'Discover a card from your opponent\'s class':[s('discover',mode='opponent-class')],
      'Draw three minions of different minion types':[s('menagerie',zone='deck',mode='draw',amount=3)],
      'Summon a random 3-Cost Beast, Dragon, Elemental, and Murloc':[s('summon-pool',amount=1,filter={'type':'MINION','tribe':k,'cost':3}) for k in ('BEAST','DRAGON','ELEMENTAL','MURLOC')],
    }
    # Menagerie draw isn't an existing reward mode; don't enable it accidentally.
    exact.pop('Draw three minions of different minion types')
    if t in exact:return exact[t]

    m=re.fullmatch(r'Restore (\d+) Health to all characters',t)
    if m:return [s('heal',scope='characters',amount=int(m[1]))]
    m=re.fullmatch(r'Draw a (\d+), (\d+), (\d+), and (\d+)-Cost minion from your deck',t)
    if m:return [s('draw',amount=1,filter={'type':'MINION','cost':int(n)}) for n in m.groups()]
    m=re.fullmatch(r'Discover (?:a |an )?(.+)\. (?:Give it ([+]\d+)/([+]\d+)|Set its Attack and Health to (\d+))',t)
    if m:
        f=filt(m[1])
        if f is not None:return [s('discover',filter=f,**({'mode':'set-stats','attack':int(m[4]),'health':int(m[4])} if m[4] else {'after':'fixed-buff-matching','attack':int(m[2]),'health':int(m[3])}))]
    m=re.fullmatch(r'Draw (two|three|\d+) (.+)\. Give them ([+]\d+)/([+]\d+)',t)
    if m:
        f=filt(m[2])
        if f is not None:return [s('draw',amount=num(m[1]),filter=f,mode='buff',attack=int(m[3]),health=int(m[4]))]
    m=re.fullmatch(r'Draw a (.+)\. Give it ([+]\d+)/([+]\d+)',t)
    if m:
        f=filt(m[1])
        if f is not None:return [s('draw',amount=1,filter=f,mode='buff',attack=int(m[2]),health=int(m[3]))]
    m=re.fullmatch(r'Summon (a|an|two|three|\d+) (\d+)/(\d+) (?:minions?|Demons?) with (Taunt|Lifesteal)',t)
    if m:
        expected=m[4].upper();opts=[c for c in refs if c.get('attack')==int(m[2]) and c.get('health')==int(m[3]) and not c.get('collectible') and set(c.get('mechanics',[]))=={expected} and clean(c.get('text',''))==m[4] and ('Demon' not in t or c.get('race')=='DEMON' or 'DEMON' in c.get('races',[]))]
        c=choose(opts)
        if c:return [s('summon-token',token=c['id'],amount=num(m[1]))]

    named_tokens={'Illidari':'BT_036t','Dryads':'DAL_733t','Turtles':'BAR_533t','Spiders':'ICC_051a','Ghoul':'ICC_085t','Cub':'SCH_617t','Hyena':'BAR_035t'}
    m=re.fullmatch(r'Summon (two|three|six) (1/1|1/2) (Illidari|Dryads|Turtles|Spiders) with (Rush|Lifesteal|Taunt|Poisonous)',t)
    if m:return [s('summon-token',token=named_tokens[m[3]],amount=num(m[1]))]
    m=re.fullmatch(r'Deal (\d+) damage to all characters',t)
    if m:return [s('damage',scope='characters',amount=int(m[1]))]
    if t=='Restore all characters to full Health':return [s('heal',scope='characters',full=True,amount=0)]
    m=re.fullmatch(r'Restore (\d+) Health to a friendly character(?:\. Draw a card)?',t)
    if m:return [chosen('heal','friendly-character',amount=int(m[1]))]+([s('draw',amount=1)] if t.endswith('Draw a card') else [])
    m=re.fullmatch(r'Give a minion (Taunt|Divine Shield|Rush) and ([+]\d+)/([+]\d+)',t)
    if m:return [chosen('buff',attack=int(m[2]),health=int(m[3])),chosen('keyword',keyword=m[1].upper().replace(' ','_'))]
    m=re.fullmatch(r'Give a minion with Divine Shield ([+]\d+)/([+]\d+)',t)
    if m:return [chosen('buff',filter={'keyword':'DIVINE_SHIELD'},attack=int(m[1]),health=int(m[2]))]
    m=re.fullmatch(r'Draw (?:a|an) (Overload|Outcast) card(?: from your deck)?',t)
    if m:return [s('draw',amount=1,filter={'keyword':m[1].upper()})]
    m=re.fullmatch(r'Discover a (Choose One|Overload) card',t)
    if m:return [s('discover',filter={'keyword':m[1].upper().replace(' ','_')})]
    m=re.fullmatch(r'Summon a random (\d+), (\d+), and (\d+)-Cost (Taunt minion|minion)',t)
    if m:return [s('summon-pool',amount=1,filter={'type':'MINION','cost':int(n),**({'keyword':'TAUNT'} if m[4]=='Taunt minion' else {})}) for n in m.groups()[:3]]
    m=re.fullmatch(r'Summon a random (\d+), (\d+), (\d+), and (\d+)-Cost minion',t)
    if m:return [s('summon-pool',amount=1,filter={'type':'MINION','cost':int(n)}) for n in m.groups()]
    m=re.fullmatch(r'Add a random (\d+), (\d+), and (\d+)-Cost Elemental to your hand',t)
    if m:return [s('generate',amount=1,filter={'type':'MINION','tribe':'ELEMENTAL','cost':int(n)}) for n in m.groups()]
    m=re.fullmatch(r'Summon (?:a|an) (\d+)/(\d+) (\w+) for each (card|spell) in your hand',t)
    if m:
        c=token(m[3],int(m[1]),int(m[2]))
        if c:return [s('summon-token',token=c['id'],amount={'count':'hand',**({'filter':{'type':'SPELL'}} if m[4]=='spell' else {})})]
    m=re.fullmatch(r'For each enemy minion, summon a (\d+)/(\d+) (\w+) with (Taunt|Charge)',t)
    if m:
        c=token(m[3],int(m[1]),int(m[2]))
        if c:return [s('summon-token',token=c['id'],amount={'count':'enemy'})]
    m=re.fullmatch(r'Summon a (\d+)/(\d+) (\w+)\. (Draw a card for each \w+ you control)',t)
    if m:
        c=token(m[3],int(m[1]),int(m[2])); q=re.fullmatch(r'Draw a card for each (Treant) you control',m[4])
        if c and q:return [s('summon-token',token=c['id'],amount=1),s('draw',amount={'count':'friendly','filter':{'name':q[1]}})]
    m=re.fullmatch(r'Deal (\d+) damage\. Summon that many (\d+)/(\d+) (\w+)',t)
    if m:
        name=m[4].removesuffix('s');c=token(name,int(m[2]),int(m[3]))
        if c:return [chosen('damage','character',amount=int(m[1])),s('summon-token',token=c['id'],amount=int(m[1]))]
    if t=='Summon a 1/1 Hyena with Rush':return [s('summon-token',token='BAR_035t',amount=1)]
    if t=='Summon a 1/1 Cub':return [s('summon-token',token='SCH_617t',amount=1)]
    if t=='Add a Cub to your hand':return [s('generate-token',token='SCH_617t',amount=1)]
    if t=='Summon a 5/5 Ghoul':return [s('summon-token',token='ICC_085t',amount=1)]
    if t=='Summon two 0/2 minions with Taunt':return [s('summon-token',token='CS2_mirror',amount=2)]
    if t=='Summon a 1/1 Candle, 2/2 Broom, and 3/3 Teapot':return [s('summon-token',token=k,amount=1) for k in ('KAR_025a','KAR_025b','KAR_025c')]

    m=re.fullmatch(r'Deal (\d+) damage to (a character|an enemy character|an enemy) and Freeze it',t)
    if m:
        kind='character' if m[2]=='a character' else 'enemy-character'
        return [chosen('damage',kind,amount=int(m[1])),chosen('freeze',kind)]
    m=re.fullmatch(r'Deal (\d+) damage to all enemy minions and Freeze them',t)
    if m:return [s('damage',scope='enemy',amount=int(m[1])),s('freeze',scope='enemy')]
    m=re.fullmatch(r'Deal (\d+) damage to (an enemy|all minions)(?:,)? (twice|three times)',t)
    if m:
        q=target(m[2]);return [s('damage',amount=int(m[1]),**q) for _ in range(2 if m[3]=='twice' else 3)]
    m=re.fullmatch(r'Deal (\d+) damage to (two|three) random enemies',t)
    if m:return [s('damage',scope='enemies',random=num(m[2]),amount=int(m[1]))]
    m=re.fullmatch(r'Deal (\d+)-(\d+) damage(?: to (.+))?(?:\. Overload: \((\d+)\))?',t)
    if m:
        q=target(m[3]) if m[3] else {'scope':'target','target':'character'}
        if q:return [s('random-damage',amount=int(m[1]),until=int(m[2]),**q)]+([s('overload',amount=int(m[4]))] if m[4] else [])
    m=re.fullmatch(r'Deal (\d+) damage to a random enemy minion, (five|six|seven|eight|\d+) times',t)
    if m:
        n={'five':5,'six':6,'seven':7,'eight':8}.get(m[2],int(m[2]) if m[2].isdigit() else 0)
        return [s('damage',scope='enemy',random=1,amount=int(m[1])) for _ in range(n)]
    m=re.fullmatch(r'Destroy all minions with (\d+) or (more|less) Attack',t)
    if m:return [s('destroy',scope='all',filter={'minAttack' if m[2]=='more' else 'maxAttack':int(m[1])})]
    m=re.fullmatch(r'Give (all minions|your minions|a minion) ([-+]\d+)/([-+]\d+), (Divine Shield|Reborn), and Taunt',t)
    if m:
        q=target(m[1]);return [s('buff',attack=int(m[2]),health=int(m[3]),**q),s('keyword',keyword={'Divine Shield':'DIVINE_SHIELD','Reborn':'REBORN'}[m[4]],**q),s('keyword',keyword='TAUNT',**q)]
    m=re.fullmatch(r'Give ([-+]\d+)/([-+]\d+) to all (minions|Beasts) in your hand, deck, and battlefield',t)
    if m:
        f={'type':'MINION',**({'tribe':'BEAST'} if m[3]=='Beasts' else {})}
        return [s('zone-buff',zone='hand and deck',filter=f,attack=int(m[1]),health=int(m[2])),s('buff',scope='friendly',filter=f,attack=int(m[1]),health=int(m[2]))]
    m=re.fullmatch(r'(?:Give|Set) (.+?) ([-+]\d+) Attack this turn(?: only)?',t)
    if m:
        q=target(m[1]);return [s('buff',attack=int(m[2]),health=0,expires='turn',**q)] if q and q['scope'] not in ('hero','friendly-characters') else None
    m=re.fullmatch(r'Draw (two|three|\d+) (.+?) from your deck',t)
    if m:
        f=filt(m[2]);return [s('draw',amount=num(m[1]),filter=f)] if f is not None else None
    m=re.fullmatch(r'Draw (two|three|\d+) (.+?)\. They cost \((\d+)\) less',t)
    if m:
        f=filt(m[2]);return [s('draw',amount=num(m[1]),filter=f,reduction=int(m[3]))] if f is not None else None
    m=re.fullmatch(r'Draw a (.+?) and a (.+)',t)
    if m:
        fs=[filt(x) for x in m.groups()]
        if all(f is not None for f in fs):return [s('draw',amount=1,filter=f) for f in fs]
    m=re.fullmatch(r'Discover (2|two) (.+)',t)
    if m:
        f=filt(m[2]);return [s('discover',filter=f),s('discover',filter=f)] if f is not None else None
    m=re.fullmatch(r'Transform (a minion|all minions) into (?:a |)(\d+)/(\d+) ([\w -]+?)(?: with (Taunt|Charge))?',t)
    if m:
        name=m[4];c=token(name.removesuffix('s') if name.endswith('Sheep') is False and name.endswith('s') else name,int(m[2]),int(m[3]))
        if c:return [s('transform',**target(m[1]),**{'from':'token'},token=c['id'])]
    m=re.fullmatch(r'Transform (your minions|all enemy minions|all minions|a minion) into (?:random minions|random ones|a random one) (?:with the same Cost|that costs? \((\d+)\) (more|less))',t)
    if m:return [s('transform',**target(m[1]),**{'from':'pool'},costDelta=int(m[2] or 0)*(-1 if m[3]=='less' else 1))]
    m=re.fullmatch(r'(?:Summon|Get) (a|an|two|three|four|five|six|seven|\d+) (\d+)/(\d+) ([\w -]+?)(?: with (Taunt|Rush|Lifesteal|Poisonous|Stealth|Charge|Reborn))?(?: to your hand)?',t)
    if m:
        count={'five':5,'six':6,'seven':7}.get(m[1],num(m[1]))
        name=m[4];names=[name,name.removesuffix('s'),name[:-3]+'y' if name.endswith('ies') else name]
        opts=[c for c in refs if c.get('name') in names and c.get('attack')==int(m[2]) and c.get('health')==int(m[3])]
        expected={m[5].upper().replace(' ','_')} if m[5] else set()
        opts=[c for c in opts if set(c.get('mechanics',[]))==expected and not re.sub(r'Taunt|Rush|Charge|Lifesteal|Poisonous|Stealth|Reborn|[., ]','',clean(c.get('text','')))]
        c=choose(opts)
        if c:return [s('summon-token' if t.startswith('Summon') else 'generate-token',token=c['id'],amount=count)]
    m=re.fullmatch(r'(.+)\. Overload: \((\d+)\)',t)
    if m:
        e=compile_spell(dict(card,text=m[1]),compile,clean,target,filt,num,refs,choose)
        if e is not None:return e+[s('overload',amount=int(m[2]))]
    # Carefully consume a full sequential clause; no pronoun linkage is guessed.
    parts=re.split(r'\. (?:Then |then )?',t)
    if len(parts)>1:
        out=[]
        for part in parts:
            e=compile_spell(dict(card,text=part),compile,clean,target,filt,num,refs,choose)
            if e is None:return None
            out+=e
        return out
    return text(t)
