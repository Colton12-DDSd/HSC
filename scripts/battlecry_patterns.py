"""Additional whole-clause patterns. No unmatched suffixes are accepted."""
import re

def compile_more(t, compile, target, filt, num, keywords, all_cards, current_card, choose_token):
    m=re.fullmatch(r'(.+)\. Overload: \((\d+)\)',t)
    if m:
        e=compile(m[1])
        if e is not None:return [*e,{'op':'overload','amount':int(m[2])}]
    m=re.fullmatch(r'Gain (\d+)-(\d+) Attack',t)
    if m:return [{'op':'random-attack','attack':int(m[1]),'health':int(m[2])}]
    m=re.fullmatch(r'Lose (a|an|\d+) Mana Crystal',t)
    if m:return [{'op':'mana','mode':'lose','amount':num(m[1])}]
    m=re.fullmatch(r'(?:Summon|Resurrect) (?:a random |a |an )?friendly (minion|Undead) that died this game(?:\. Give it (Reborn|Taunt))?',t)
    if m:return [{'op':'resurrect','amount':1,'filter':{'type':'MINION',**({'tribe':'UNDEAD'} if m[1]=='Undead' else {})},'keyword':keywords.get(m[2])}]
    m=re.fullmatch(r'Resurrect a friendly (Undead|Beast|Mech)(?:\. Give it (Reborn|Taunt))?',t)
    if m:return [{'op':'resurrect','amount':1,'filter':{'type':'MINION','tribe':{'Undead':'UNDEAD','Beast':'BEAST','Mech':'MECHANICAL'}[m[1]]},'keyword':keywords.get(m[2])}]
    if t=='Resurrect your highest-Cost minion that died this game':return [{'op':'resurrect','amount':1,'filter':{'type':'MINION'},'order':'highest Cost'}]
    if t=='Summon your Deathrattle minions that died this game':return [{'op':'resurrect','until':7,'filter':{'type':'MINION','keyword':'DEATHRATTLE'}}]
    if t=='Summon all friendly minions that died this turn':return [{'op':'resurrect','until':7,'filter':{'type':'MINION'},'mode':'this-turn'}]
    m=re.fullmatch(r'Choose (?:a |an )?(.+?) in your hand\. (?:Get|Add) a copy of it(?: to your hand)?',t)
    if m:
        f=filt(m[1])
        if f is not None:return [{'op':'choose-hand','zone':'hand','filter':f,'copy':True}]
    m=re.fullmatch(r'Choose a card in your hand to shuffle into your deck(?:\. (Draw a card|It costs \((\d+)\) less))?',t)
    if m:return [{'op':'choose-hand','zone':'hand','destination':'shuffle','reduction':int(m[2] or 0)},*([{'op':'draw','amount':1}] if m[1]=='Draw a card' else [])]
    m=re.fullmatch(r'Look at 3 cards in your deck\. Choose one to put on top',t)
    if m:return [{'op':'discover','zone':'deck','destination':'top'}]
    if t=='Dredge':return [{'op':'discover','zone':'deck','mode':'dredge','destination':'top'}]
    m=re.fullmatch(r'Return (a minion|an enemy minion) to its owner\x27s hand(?:\. It costs \((\d+)\) more)?',t)
    if m:return [dict(op='bounce',reduction=-int(m[2] or 0),**target(m[1]))]
    m=re.fullmatch(r'Summon all (.+?) from your hand',t)
    if m:
        f=filt(m[1])
        if f is not None:return [{'op':'recruit','zone':'hand','filter':f,'amount':10}]
    m=re.fullmatch(r'Discard your hand(?:\. Destroy all enemy minions)?',t)
    if m and 'Destroy' in t:return [{'op':'discard','amount':10},{'op':'destroy','scope':'enemy'}]
    m=re.fullmatch(r'Discover (?:a |an )?(Hunter|Mage|Paladin|Priest|Warrior|Druid|Rogue|Shaman), (Hunter|Mage|Paladin|Priest|Warrior|Druid|Rogue|Shaman), or (Hunter|Mage|Paladin|Priest|Warrior|Druid|Rogue|Shaman) card',t)
    if m:return [{'op':'discover','filter':{'classes':[x.upper() for x in m.groups()]}}]
    m = re.fullmatch(r"Destroy your opponent's (weapon|Armor)(?:\. (Draw cards|Gain Armor) equal to its Attack)?", t)
    if m:
        return [{'op': 'destroy-'+m[1].lower(), 'after': 'draw' if m[2]=='Draw cards' else 'armor' if m[2] else None}]
    m = re.fullmatch(r'The next (.+?) you play costs \((\d+)\) less', t)
    if m:
        f=filt(m[1])
        if f is not None:return [{'op':'next-cost','filter':f,'reduction':int(m[2])}]
    m = re.fullmatch(r'Your next (.+?) costs \((\d+)\) less', t)
    if m:
        f=filt(m[1])
        if f is not None:return [{'op':'next-cost','filter':f,'reduction':int(m[2])}]
    m = re.fullmatch(r'Reveal a minion in each deck\. If yours costs more, (.+)', t)
    if m:
        if m[1]=='draw it':return [{'op':'joust','after':'draw','steps':[]}]
        e=compile(m[1])
        if e is not None:return [{'op':'joust','steps':e}]
    m=re.fullmatch(r'(?:Take control of|Steal) (.+)',t)
    if m:
        q=target(m[1])
        if q:return [dict(op='steal',**q)]
    m=re.fullmatch(r'Trigger (?:a friendly minion|a minion)\x27s Deathrattle(?: (twice))?',t)
    if m:return [{'op':'trigger-deathrattle','scope':'target','target':'friendly-minion' if 'friendly' in t else 'minion','amount':2 if m[1] else 1}]
    if t=="Trigger your other minions' Deathrattles":return [{'op':'trigger-deathrattle','scope':'friendly','other':True,'amount':1}]
    m=re.fullmatch(r'Choose a friendly minion\. Gain a copy of its Deathrattle',t)
    if m:return [{'op':'gain-deathrattle','scope':'target','target':'friendly-minion'}]
    if t=='Gain the Deathrattles of adjacent minions':return [{'op':'gain-deathrattle','scope':'adjacent'}]
    m=re.fullmatch(r'Give (.+?) "Deathrattle: (.+)"',t)
    if m:
        q=target(m[1]);e=compile(m[2])
        if q and e:return [dict(op='grant-deathrattle',steps=e,**q)]
    m=re.fullmatch(r'Summon a copy of (each adjacent minion|a friendly minion)(?:\. Give (?:it|them) (Taunt|Rush))?',t)
    if m and not m[2]:return [dict(op='summon-copy',**({'scope':'adjacent'} if m[1]=='each adjacent minion' else {'scope':'target','target':'friendly-minion'}))]
    m=re.fullmatch(r'Resurrect (a|two|three|\d+) (?:random )?(friendly )?(.+?)(?: that died this game)?',t)
    if m:
        f=filt(m[3])
        if f is not None and f.get('type')=='MINION':return [{'op':'resurrect','amount':num(m[1]),'filter':f}]
    m=re.fullmatch(r'Deal (\d+) damage(?: to (a minion|an enemy minion|a character))?\. If (?:that kills (?:the target|it)|it dies), (.+)',t)
    if m:
        e=compile(m[3]);q=target(m[2] or 'a character')
        if e and q:return [dict(op='damage-then',amount=int(m[1]),mode='killed',steps=e,**q)]
    m=re.fullmatch(r'Deal (\d+) damage(?: to (a minion|an enemy minion|a character))?\. If it survives, (.+)',t)
    if m:
        e=compile(m[3]);q=target(m[2] or 'a character')
        if e and q:return [dict(op='damage-then',amount=int(m[1]),mode='survives',steps=e,**q)]
    m=re.fullmatch(r'Deal (\d+) damage to (a minion|an enemy minion) and give it (.+)',t)
    if m:
        e=compile('Give '+m[2]+' '+m[3]);q=target(m[2])
        if e:return [dict(op='damage',amount=int(m[1]),**q),*e]
    m=re.fullmatch(r'(Deal \d+ damage to all other minions)\. If any die, repeat this',t)
    if m:return [{'op':'repeat-death','steps':compile(m[1])}]
    m=re.fullmatch(r'Deal (\d+) damage to a random enemy\. Repeat for each of your (.+)',t)
    if m:
        f=filt(m[2])
        if f is not None:
            e={'op':'damage','amount':int(m[1]),'scope':'enemies','random':1}
            return [e,{'op':'repeat','amount':{'count':'friendly','filter':f},'steps':[e]}]
    m=re.fullmatch(r'Deal (\d+) damage randomly split among (all other minions|other friendly minions|all minions except Mechs)',t)
    if m:return [{'op':'missiles','amount':int(m[1]),'scope':'friendly' if m[2]=='other friendly minions' else 'all','other':m[2]!='all minions except Mechs',**({'filter':{'notTribe':'MECHANICAL'}} if m[2]=='all minions except Mechs' else {})}]
    m=re.fullmatch(r'Gain (\+\d+) Attack and (Lifesteal|Divine Shield|Windfury|Poisonous|Stealth|Reborn)',t)
    if m:return [{'op':'buff','scope':'self','attack':int(m[1]),'health':0},{'op':'keyword','scope':'self','keyword':keywords[m[2]]}]
    m=re.fullmatch(r'Gain (Stealth|Reborn)',t)
    if m:return [{'op':'keyword','scope':'self','keyword':keywords[m[1]]}]
    m=re.fullmatch(r'Swap the Attack and Health of all minions in both players\x27 hands',t)
    if m:return [{'op':'zone-swap','zone':'hand','filter':{'type':'MINION'},'allPlayers':True}]
    m=re.fullmatch(r'(?:Reduce the Cost of (.+?) by \((\d+)\) and increase the Cost of (.+?) by \((\d+)\))',t)
    if m:
        first=compile('Reduce the Cost of '+m[1]+' by ('+m[2]+')')
        zone='hand and deck' if 'hand and deck' in m[1] else 'hand'
        f=filt(m[3])
        if first and f is not None:return [*first,{'op':'cost','zone':zone,'filter':f,'reduction':-int(m[4])}]
    m=re.fullmatch(r'Reduce the Cost of (?:the )?(highest Cost|lowest Cost) (.+?) in your hand by \((\d+)\)',t)
    if m:
        f=filt(m[2])
        if f is not None:return [{'op':'cost','zone':'hand','filter':f,'order':m[1],'reduction':int(m[3])}]
    m=re.fullmatch(r'(?:Discard) your (highest|lowest) Cost card',t)
    if m:return [{'op':'discard','amount':1,'order':m[1]+' Cost'}]
    m=re.fullmatch(r'Both players (?:draw (a card|two cards|\d+ cards)|get a random spell\. Yours costs \((\d+)\) less)',t)
    if m:return [{'op':'draw','amount':1 if m[1]=='a card' else num(m[1].split()[0]),'allPlayers':True}] if m[1] else [{'op':'generate','filter':{'type':'SPELL'},'amount':1,'allPlayers':True,'reduction':int(m[2])}]
    m=re.fullmatch(r'(?:Summon a copy of this(?: minion)?) at the end of this turn',t)
    if m:return [{'op':'end-effect','steps':[{'op':'summon-self','amount':1}]}]
    m=re.fullmatch(r'For the rest of the game, (.+)',t)
    if m:
        m2=re.fullmatch(r'(Deal \d+ damage to your opponent) at the end of your turns',m[1])
        if m2:return [{'op':'end-effect','permanent':True,'steps':compile(m2[1])}]
        m2=re.fullmatch(r'(.+?) you summon have their stats set to (\d+)/(\d+)',m[1])
        if m2 and m2[2]==m2[3]:
            f=filt(m2[1])
            if f is not None:return [{'op':'summon-effect','filter':f,'setCost':int(m2[2])}]
    m=re.fullmatch(r'Equip (?:a |an )?(\d+)/(\d+) (?:weapon|(.+?))',t)
    if m:
        opts=[c for c in all_cards if c.get('type')=='WEAPON' and c.get('attack')==int(m[1]) and (c.get('durability') or c.get('health'))==int(m[2]) and (not m[3] or c.get('name')==m[3]) and not c.get('text')]
        tok=choose_token(opts)
        if tok:return [{'op':'equip','token':tok['id']}]
    if t=='Equip a random weapon for each player':return [{'op':'equip','allPlayers':True}]
    m=re.fullmatch(r'Equip a random (\d+)-Cost weapon',t)
    if m:return [{'op':'equip','filter':{'cost':int(m[1])}}]
    m=re.fullmatch(r'(?:Add|Get) (a|an|two|three|four|\d+) (?:random )?(.+) to your hand',t)
    if m:
        name=m[2];matches=[c for c in all_cards if c.get('name') in (name,name.removesuffix('s'),name.removesuffix('es'))]
        tok=choose_token(matches)
        if tok:return [{'op':'generate-token','token':tok['id'],'amount':num(m[1])}]
    m=re.fullmatch(r'Discover (?:a |an )?(.+?), (.+?), or (.+)',t)
    if m:
        fs=[filt(x) for x in m.groups()]
        if all(f is not None for f in fs):return [{'op':'discover','filter':{'any':fs}}]
    m=re.fullmatch(r'Discover a (.+?) to put on top of your deck(?:\. It costs \((\d+)\) less)?',t)
    if m:
        f=filt(m[1])
        if f is not None:return [{'op':'discover','filter':f,'destination':'top','reduction':int(m[2] or 0)}]
    m=re.fullmatch(r'(?:Discover|Choose) a copy of a card in your opponent\x27s deck',t)
    if m:return [{'op':'discover','zone':'enemy-deck','copy':True}]
    m=re.fullmatch(r'Discover a card in your opponent\x27s deck\. They draw theirs as well',t)
    if m:return [{'op':'discover','zone':'enemy-deck','copy':True,'after':'enemy-draw'}]
    m=re.fullmatch(r'Draw (a |an |two |\d+ )?(.+?)\. (?:Give (?:it|them) (\+\d+)/(\+\d+)|Set (?:its|their) Attack, Health, and Cost to (\d+))',t)
    if m:
        f=filt(m[2])
        if f is not None:return [{'op':'draw','filter':f,'amount':num((m[1] or 'a').strip()),'attack':int(m[3]) if m[3] else int(m[5]),'health':int(m[4]) if m[4] else int(m[5]),'mode':'set' if m[5] else 'buff','setCost':int(m[5]) if m[5] else None}]
    if t=='Draw 3 cards. Put any minions you drew directly into the battlefield':return [{'op':'draw','amount':3,'summon':True}]
    return None
