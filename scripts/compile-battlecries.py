"""Build-time, whole-text compiler. Unmatched text stays unsupported; no runtime text parsing."""
import json, re, hashlib
from battlecry_patterns import compile_more
from foundation_patterns import compile_foundation
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
cards=json.loads((ROOT/'public/data/cards.json').read_text(encoding='utf8'))
tribes={'Beast':'BEAST','Demon':'DEMON','Dragon':'DRAGON','Elemental':'ELEMENTAL','Mech':'MECHANICAL','Murloc':'MURLOC','Pirate':'PIRATE','Totem':'TOTEM','Undead':'UNDEAD','Draenei':'DRAENEI','Quilboar':'QUILBOAR','Naga':'NAGA'}
keywords={'Taunt':'TAUNT','Rush':'RUSH','Charge':'CHARGE','Divine Shield':'DIVINE_SHIELD','Lifesteal':'LIFESTEAL','Windfury':'WINDFURY','Poisonous':'POISONOUS','Stealth':'STEALTH','Reborn':'REBORN'}
schools=['Arcane','Fire','Frost','Nature','Holy','Shadow','Fel']
classes=['Death Knight','Demon Hunter','Druid','Hunter','Mage','Paladin','Priest','Rogue','Shaman','Warlock','Warrior']
def choose_token(opts):
 opts=[c for c in opts if c.get('type') in ('MINION','SPELL','WEAPON') and c.get('set') not in ('BATTLEGROUNDS','LETTUCE','MISSIONS','TUTORIAL','VANILLA') and not c['id'].startswith(('BOM_','Story_','TB_','BG_','LETL_','TUTR_','VAN_'))]
 return sorted(opts,key=lambda c:(not c['id'].startswith(current_card['id']+'_'),c.get('set')!=current_card.get('set'),len(c['id']),c['id']))[0] if opts else None

def clean(t):return ' '.join(re.sub(r'<[^>]*>|\[x\]|[$#&]','',re.sub(r'\s*\(\{\d+\} left!?\)\s*$','',t.split('@')[0])).replace('\xa0',' ').split()).strip()
def num(s):return {'a':1,'an':1,'one':1,'two':2,'three':3,'four':4,'five':5,'six':6}.get(s,int(s) if s.isdigit() else None)
def filt(t):
 t=re.sub(r'^(?:a |an |any |random |the )','',t.strip()).rstrip('.')
 t=re.sub(r'^(?:a |an |random )','',t)
 t=re.sub(r' from (?:your )?deck$','',t)
 t=t.replace('Stealthed minion','Stealth minion').replace('that has ','with ')
 if t in ('Lackey','Lackeys'):return {'type':'MINION','nameSuffix':'Lackey'}
 if t in ('Silver Hand Recruits','Silver Hand Recruit','Treant','Treants'):return {'type':'MINION','name':t.removesuffix('s')}
 if t in ('minion with Spell Damage','Spell Damage minion'):return {'type':'MINION','keyword':'SPELLPOWER'}
 m=re.fullmatch(r'minions? with (\d+) Health',t)
 if m:return {'type':'MINION','health':int(m[1])}
 f={}
 if t.endswith(' from any class'):f['anyClass']=True;t=t[:-15]
 if t.endswith(' from another class'):f['otherClass']=True;t=t[:-19]
 if t=='card from another class':return {'otherClass':True}
 if t=='any cards from another class':return {'otherClass':True}
 if t.endswith(' from your class'):f['ownClass']=True;t=t[:-16]
 m=re.fullmatch(r'(.+) that costs? \((\d+)\) or (less|more)',t)
 if m:t=m[1];f['maxCost' if m[3]=='less' else 'minCost']=int(m[2])
 m=re.fullmatch(r'(\d+)-Cost (.+)',t)
 if m:f['cost']=int(m[1]);t=m[2]
 m=re.fullmatch(r'(.+) with (\d+) or (more|less) Attack',t)
 if m:t=m[1];f['minAttack' if m[3]=='more' else 'maxAttack']=int(m[2])
 m=re.fullmatch(r'(\d+)-Attack minion',t)
 if m:f['attack']=int(m[1]);t='minion'
 for cl in classes:
  if t.startswith(cl+' '):f['classes']=[cl.upper().replace(' ','')];t=t[len(cl)+1:]
 if t.startswith('Legendary '):f['rarity']='LEGENDARY';t=t[10:]
 for s in schools:
  if t.startswith(s+' '):f['school']=s.upper();t=t[len(s)+1:]
 for k,v in keywords.items():
  if t.startswith(k+' '):f['keyword']=v;t=t[len(k)+1:]
 if t=='minion with Deathrattle':return dict(f,type='MINION',keyword='DEATHRATTLE')
 if t=='minion with Taunt':return dict(f,type='MINION',keyword='TAUNT')
 if t.startswith('damaged '):f['damaged']=True;t=t[8:]
 if t.startswith('undamaged '):f['undamaged']=True;t=t[10:]
 if t.startswith('Deathrattle '):f['keyword']='DEATHRATTLE';t=t[12:]
 if t.startswith('Battlecry '):f['keyword']='BATTLECRY';t=t[10:]
 if t in tribes:f.update(type='MINION',tribe=tribes[t]);return f
 if t in [x+'s' for x in tribes]:f.update(type='MINION',tribe=tribes[t[:-1]]);return f
 if t in ('minion','minions','spell','spells','weapon','weapons','card','cards'):
  if t not in ('card','cards'):f['type']=t.rstrip('s').upper()
  return f
 if t in ('Secret','Secrets'):f.update(type='SPELL',keyword='SECRET');return f
 if t=='damaged minion':f.update(type='MINION',damaged=True);return f
 return None
def value(t):
 if t.isdigit():return int(t)
 if t in ('your hand size','the number of cards in your hand'):return {'count':'hand'}
 if t in ("this minion's Attack",'its Attack'):return {'stat':'attack'}
 if t in ("this minion's Health",'its Health'):return {'stat':'health'}
 if t=='your Armor':return {'stat':'armor'}
 return None
def count_expr(t):
 t=t.replace('other friendly','friendly').replace('other card','card').replace('on the battlefield','').strip()
 if t in ('card in your hand','cards in your hand'):return {'count':'hand'}
 if t in ('card in your opponent\'s hand',):return {'count':'enemy-hand'}
 for suffix,zone in [(' in your hand','hand'),(' in your deck','deck')]:
  if t.endswith(suffix):
   f=filt(t[:-len(suffix)]);return {'count':zone,'filter':f} if f is not None else None
 for prefix,zone in [('friendly ','friendly'),('enemy ','enemy')]:
  if t.startswith(prefix):
   f=filt(t[len(prefix):]);return {'count':zone,'filter':f} if f is not None else None
 if t=='damaged minion':return {'count':'all','filter':{'damaged':True}}
 return None
def target(t):
 t=t.strip()
 if t in ('this minion','this'):return {'scope':'self'}
 if t=='your weapon':return {'scope':'weapon'}
 if t=='your hero':return {'scope':'hero'}
 if t in ('each hero','both heroes','all heroes'):return {'scope':'heroes'}
 if t in ('the enemy hero',"your opponent"):return {'scope':'enemy-heroes'}
 if t=='a character':return {'scope':'target','target':'character'}
 if t=='an enemy':return {'scope':'target','target':'enemy-character'}
 if t=='another random friendly minion':return {'scope':'friendly','other':True,'random':1}
 if t=='all damaged minions':return {'scope':'all','filter':{'damaged':True}}
 if t=='all undamaged enemy minions':return {'scope':'enemy','filter':{'undamaged':True}}
 if t.startswith('a random enemy'):
  f=filt(t[len('a random enemy '):]) if t!='a random enemy' else None
  if t=='a random enemy':return {'scope':'enemies','random':1}
  if f is not None and f.get('type')=='MINION':return {'scope':'enemy','random':1,'filter':f}
  return None
 m=re.fullmatch(r'(a friendly|an enemy|a) (.+)',t)
 if m:
  f=filt(m[2])
  if f is not None and f.get('type')=='MINION':return {'scope':'target','target':'friendly-minion' if m[1]=='a friendly' else 'enemy-minion' if m[1]=='an enemy' else 'minion','filter':f}
 if t=='a minion':return {'scope':'target','target':'minion'}
 if t=='all other characters':return {'scope':'characters','other':True}
 if t=='a friendly minion':return {'scope':'target','target':'friendly-minion'}
 if t=='an enemy minion':return {'scope':'target','target':'enemy-minion'}
 if t in ('all friendly characters','all other friendly characters'):return {'scope':'friendly-characters','other':'other' in t}
 if t in ('all enemies','all enemy characters'):return {'scope':'enemies'}
 if t in ('all other minions','ALL other minions','all minions','ALL minions'):return {'scope':'all','other':'other' in t}
 if t=='adjacent minions':return {'scope':'adjacent'}
 if t in ('your other minions','all other friendly minions'):return {'scope':'friendly','other':True}
 if t in ('all enemy minions','enemy minions'):return {'scope':'enemy'}
 if t in ('your minions','all friendly minions'):return {'scope':'friendly'}
 if t.startswith('a friendly '):
  f=filt(t[11:]);return {'scope':'target','target':'friendly-minion','filter':f} if f is not None else None
 if t.startswith('an enemy '):
  f=filt(t[9:]);return {'scope':'target','target':'enemy-minion','filter':f} if f is not None else None
 if t.startswith('a '):
  f=filt(t[2:]);return {'scope':'target','target':'minion','filter':f} if f is not None else None
 if t.startswith('your other '):
  f=filt(t[11:]);return {'scope':'friendly','other':True,'filter':f} if f is not None else None
 if t.startswith('your '):
  f=filt(t[5:]);return {'scope':'friendly','filter':f} if f is not None else None
 return None
def condition(t):
 for p in ["you're holding ",'you are holding ']:
  if t.startswith(p):
   f=filt(t[len(p):]);return {'zone':'hand','filter':f,'min':1} if f is not None else None
 for p in ['you control another ','you control ','you have ']:
  if t.startswith(p):
   tail=t[len(p):]
   m=re.fullmatch(r'(?:at least )?(\d+) (?:other )?minions',tail)
   if m:return {'zone':'friendly','min':int(m[1])}
   f=filt(tail)
   if f is not None:return {'zone':'friendly','filter':f,'min':1}
 m=re.fullmatch(r'you control (?:a |an )?(Stealthed minion|Secret|Treant)',t)
 if m:return {'zone':'friendly','filter':{'type':'MINION','keyword':'STEALTH'} if m[1]=='Stealthed minion' else {'keyword':'SECRET'} if m[1]=='Secret' else {'name':'Treant'},'min':1}
 m=re.fullmatch(r'your opponent has (\d+) or (less|more) Health',t)
 if m:return {'stat':'enemy-health','max' if m[2]=='less' else 'min':int(m[1])}
 m=re.fullmatch(r'you control (\d+) minions with (\d+) Health',t)
 if m:return {'zone':'friendly','filter':{'type':'MINION','health':int(m[2])},'min':int(m[1])}
 if t=='your deck is empty':return {'zone':'deck','max':0}
 if t=='your hand is empty':return {'zone':'hand','max':0}
 if t=='you have no other minions':return {'zone':'friendly','max':0}
 m=re.fullmatch(r'your deck has no (.+)',t)
 if m:
  f=filt(m[1])
  if f is not None:return {'zone':'deck','filter':f,'max':0}
 m=re.fullmatch(r'your deck contains (\d+) or fewer cards',t)
 if m:return {'zone':'deck','max':int(m[1])}
 m=re.fullmatch(r'your opponent has (\d+) or more minions',t)
 if m:return {'zone':'enemy','min':int(m[1])}
 m=re.fullmatch(r'you have (\d+) or (more|less) (Health|Armor|Mana)',t)
 if m:return {'stat':m[3].lower(),'min' if m[2]=='more' else 'max':int(m[1])}
 if t=='you control no other minions':return {'zone':'friendly','max':0}
 if t=="your opponent's hand is empty":return {'zone':'enemy-hand','max':0}
 m=re.fullmatch(r'your opponent has (\d+) or more cards in hand',t)
 if m:return {'zone':'enemy-hand','min':int(m[1])}
 if t=='an enemy minion has Taunt':return {'zone':'enemy','filter':{'keyword':'TAUNT'},'min':1}
 if t=='your deck has no duplicates':return {'special':'no-duplicates'}
 if t=='your deck has no Neutral cards':return {'zone':'deck','filter':{'classes':['NEUTRAL']},'max':0}
 if t=="your hero has Armor":return {'stat':'armor','min':1}
 if t in ('you have 10 Mana Crystals',):return {'stat':'mana','min':10}
 if t=='this is the only minion on the battlefield':return {'zone':'all','max':0}
 if t=='there is a damaged minion':return {'zone':'all','filter':{'damaged':True},'min':1}
 if t=='you played an Elemental last turn':return {'zone':'played-last-turn','filter':{'tribe':'ELEMENTAL'},'min':1}
 if t in ('you cast a spell last turn',"you've cast a spell last turn"):return {'zone':'played-last-turn','filter':{'type':'SPELL'},'min':1}
 if t in ("you've cast a spell while holding this","you've cast three spells while holding this"):
  return {'zone':'played-while-held','filter':{'type':'SPELL'},'min':3 if 'three' in t else 1}
 m=re.fullmatch(r"you've cast (?:a |an )(Nature|Shadow|Holy|Fire|Frost|Arcane|Fel) spell while holding this",t)
 if m:return {'zone':'played-while-held','filter':{'type':'SPELL','school':m[1].upper()},'min':1}
 if t in ("you've used your Hero Power this turn",):return {'zone':'power-this-turn','min':1}
 if t in ('your hero took damage this turn',"you've taken damage this turn"):return {'zone':'hero-damage-this-turn','min':1}
 if t=="your hero attacked this turn":return {'zone':'hero-attack-this-turn','min':1}
 if t=="you've restored Health this turn":return {'zone':'healed-this-turn','min':1}
 if t=="a minion died this turn":return {'zone':'died-this-turn','min':1}
 if t=="your hero's Health changed this turn":return {'zone':'health-changed-this-turn','min':1}
 if t=="your Armor changed this turn":return {'zone':'armor-changed-this-turn','min':1}
 m=re.fullmatch(r'you played (\d+) spells this turn',t)
 if m:return {'zone':'played-this-turn','filter':{'type':'SPELL'},'min':int(m[1])}
 m=re.fullmatch(r"you've cast (\d+) or more spells this game",t)
 if m:return {'zone':'played','filter':{'type':'SPELL'},'min':int(m[1])}
 if t=='you have a weapon equipped':return {'stat':'weapon','min':1}
 if t=='your hero is damaged':return {'stat':'health','max':39}
 return None
def compile(t):
 t=t.strip().rstrip('.')
 t=t[:1].upper()+t[1:]
 extra=compile_foundation(t,compile,target,filt,num,keywords,all_cards,current_card,choose_token)
 if extra is not None:return extra
 extra=compile_more(t,compile,target,filt,num,keywords,all_cards,current_card,choose_token)
 if extra is not None:return extra

 m=re.fullmatch(r'(.+) this turn',t)
 if m:
  e=compile(m[1])
  if e and all(x['op'] in ('buff','hero-attack','immune') for x in e):return [dict(x,expires='turn') for x in e]
 m=re.fullmatch(r'Give your hero \+(\d+) Attack',t)
 if m:return [{'op':'hero-attack','amount':int(m[1])}]
 m=re.fullmatch(r'Give your hero (?:this minion\'s Attack|Attack equal to this minion\'s Attack)',t)
 if m:return [{'op':'hero-attack','amount':{'stat':'attack'}}]
 m=re.fullmatch(r'(?:Gain|Give this minion) (Taunt|Rush|Charge|Divine Shield|Lifesteal|Windfury|Poisonous)(?: and (Taunt|Rush|Charge|Divine Shield|Lifesteal|Windfury|Poisonous))?',t)
 if m:return [{'op':'keyword','scope':'self','keyword':keywords[k]} for k in m.groups() if k]
 m=re.fullmatch(r'Gain (\+\d+)/(\+\d+) and (Taunt|Rush|Charge|Divine Shield|Lifesteal)',t)
 if m:return [{'op':'buff','scope':'self','attack':int(m[1]),'health':int(m[2])},{'op':'keyword','scope':'self','keyword':keywords[m[3]]}]
 m=re.fullmatch(r'For each (.+?), (.+)',t)
 if m:
  v=count_expr(m[1]);e=compile(m[2])
  if v is not None and e:return [{'op':'repeat','amount':v,'steps':e}]
 m=re.fullmatch(r'(?:Refresh|Gain) (\d+) Mana Crystals?',t)
 if m:return [{'op':'mana','amount':int(m[1]),'mode':'refresh' if t.startswith('Refresh') else 'gain'}]
 if t=='Gain an empty Mana Crystal':return [{'op':'mana','amount':1,'mode':'empty'}]
 m=re.fullmatch(r'Discard (a random card|two random cards|your hand|your two lowest-Cost cards)',t)
 if m:return [{'op':'discard','amount':10 if m[1]=='your hand' else 2 if 'two' in m[1] else 1,'order':'lowest Cost' if 'lowest' in m[1] else ''}]
 m=re.fullmatch(r'Destroy (all cards|all minions) in your deck that cost \((\d+)\) or less',t)
 if m:return [{'op':'destroy-zone','zone':'deck','filter':dict({'maxCost':int(m[2])},**({'type':'MINION'} if m[1]=='all minions' else {}))}]
 m=re.fullmatch(r'(?:Reduce the Cost of|Give) (?:all )?(.+?) in your (hand|deck|hand and deck) (?:by )?\((\d+)\)(?: less)?',t)
 if m:
  f=filt(m[1])
  if f is not None:return [{'op':'cost','zone':m[2],'filter':f,'reduction':int(m[3])}]
 m=re.fullmatch(r'Draw (.+?)\. It costs \((\d+)\) less',t)
 if m:
  f=filt(m[1])
  if f is not None:return [{'op':'draw','amount':1,'filter':f,'reduction':int(m[2])}]
 m=re.fullmatch(r'Draw (?:a |an )?(.+) from your deck that costs \((\d+)\) or more',t)
 if m:
  f=filt(m[1])
  if f is not None:return [{'op':'draw','amount':1,'filter':dict(f,minCost=int(m[2]))}]
 m=re.fullmatch(r'Draw (?:a |an )?(.+), (.+), and (.+)',t)
 if m:
  fs=[filt(x) for x in m.groups()]
  if all(f is not None for f in fs):return [{'op':'draw','amount':1,'filter':f} for f in fs]
 m=re.fullmatch(r'Draw (?:a |an )?(\d+), (\d+), and (\d+)-Cost (spell|card)',t)
 if m:return [{'op':'draw','amount':1,'filter':dict(cost=int(k),**({'type':'SPELL'} if m[4]=='spell' else {}))} for k in m.groups()[:3]]
 m=re.fullmatch(r'(?:Give|Gain) (.+?) (?:Immune)(?: this turn)?',t)
 if m:
  q=target(m[1])
  if q:return [dict(op='immune',expires='turn',**q)]
 m=re.fullmatch(r'Give (.+) (Taunt|Divine Shield|Rush) and (Taunt|Divine Shield|Rush)',t)
 if m:
  q=target(m[1])
  if q:return [dict(op='keyword',keyword=keywords[k],**q) for k in m.groups()[1:]]
 m=re.fullmatch(r'(?:Set|Change) (.+?)\'s (Attack and Health|stats) to (\d+)/(\d+)',t)
 if m:
  q=target(m[1])
  if q:return [dict(op='set-stats',attack=int(m[3]),health=int(m[4]),**q)]
 m=re.fullmatch(r'Set (.+?)\' (?:Attack and Health|stats) to (\d+)',t)
 if m:
  q=target(m[1])
  if q:return [dict(op='set-stats',attack=int(m[2]),health=int(m[2]),**q)]
 m=re.fullmatch(r'Summon (?:a |an )?(.+?) from your (hand|deck)',t)
 if m:
  f=filt(m[1])
  if f is not None:return [{'op':'recruit','zone':m[2],'filter':f,'amount':1}]
 m=re.fullmatch(r'Summon (two|three|\d+) (.+?) from your (hand|deck)',t)
 if m:
  f=filt(m[2])
  if f is not None:return [{'op':'recruit','zone':m[3],'filter':f,'amount':num(m[1])}]
 m=re.fullmatch(r'Summon (?:a |an )?(?:copy of )?(.+?) in your deck(?:\. Give it (Rush|Taunt))?',t)
 if m:
  f=filt(m[1])
  if f is not None:return [{'op':'recruit','zone':'deck','filter':f,'amount':1,'copy':True,'keyword':keywords.get(m[2])}]
 m=re.fullmatch(r'Summon a copy of this(?: minion)? for each (.+)',t)
 if m:
  v=count_expr(m[1])
  if v:return [{'op':'summon-self','amount':v}]
 m=re.fullmatch(r'(?:Add|Get) (?:a |an |two |three |four |\d+ )?(\d+)/(\d+) ([\w -]+?)(?: with (Rush|Taunt|Divine Shield))? to your hand',t)
 if m:
  name=m[3].removesuffix('s');opts=[c for c in all_cards if c.get('name') in (m[3],name) and c.get('attack')==int(m[1]) and c.get('health')==int(m[2]) and set(c.get('mechanics',[]))<=set(keywords.values())]
  if choose_token(opts):
   lead=t.split()[1];return [{'op':'generate-token','token':choose_token(opts)['id'],'amount':num(lead) or 1}]
 m=re.fullmatch(r'(?:Add|Get) (?:a |an )?(.+) to your hand',t)
 if m:
  name=m[1].strip("'\"");opts=[c for c in all_cards if c.get('name')==name]
  if choose_token(opts):return [{'op':'generate-token','token':choose_token(opts)['id'],'amount':1}]
 m=re.fullmatch(r'Summon (.+)',t)
 if m:
  opts=[c for c in all_cards if c.get('name')==m[1]]
  if choose_token(opts):return [{'op':'summon-token','token':choose_token(opts)['id'],'amount':1}]
 m=re.fullmatch(r'Discover (.+?)\. (?:Gain Armor equal to its Cost|Restore Health to your hero equal to its Cost|Deal damage to your hero equal to its Cost)',t)
 if m:
  f=filt(m[1])
  if f is not None:return [{'op':'discover','filter':f,'after': 'armor' if 'Gain Armor' in t else 'heal' if 'Restore' in t else 'damage'}]
 m=re.fullmatch(r'(?:Add|Get) (a|an|two|\d+) random (.+) to (?:each player\'s|both players\') hands?',t)
 if m:
  f=filt(m[2])
  if f is not None:return [{'op':'generate','filter':f,'amount':num(m[1]),'allPlayers':True}]


 m=re.fullmatch(r'Set (a minion|a friendly minion|this minion)\'s Attack and Health to (\d+)',t)
 if m:
  q=target(m[1]);return [dict(op='set-stats',attack=int(m[2]),health=int(m[2]),**q)]
 m=re.fullmatch(r'Set (a hero|your hero)\'s remaining Health to (\d+)',t)
 if m:return [{'op':'set-health','scope':'hero' if m[1]=='your hero' else 'target','target':'character' if m[1]=='a hero' else None,'filterHeroes':True,'amount':int(m[2])}]
 m=re.fullmatch(r'Set each player to (\d+) Mana Crystals',t)
 if m:return [{'op':'mana','mode':'set','allPlayers':True,'amount':int(m[1])}]
 m=re.fullmatch(r'Double (this minion|a minion|a friendly minion)\'s (Attack|Health)',t)
 if m:
  q=target(m[1]);return [dict(op='double',stat=m[2].lower(),**q)]
 m=re.fullmatch(r'Double the (?:stats|Attack and Health) of (all )?(.+) in your (hand|deck|hand and deck)',t)
 if m:
  f=filt(m[2])
  if f is not None:return [{'op':'zone-double','filter':f,'zone':m[3]}]
 m=re.fullmatch(r'Copy (all |each |a random |the lowest Cost )?(.+) in your hand',t)
 if m:
  f=filt(m[2])
  if f is not None:return [{'op':'copy-zone','filter':f,'zone':'hand','random':1 if m[1]=='a random ' else None,'order':'lowest Cost' if m[1]=='the lowest Cost ' else ''}]
 m=re.fullmatch(r'Copy a friendly minion\'s (Attack and Health|Health)',t)
 if m:return [{'op':'copy-stats','scope':'target','target':'friendly-minion','stat':'both' if m[1]=='Attack and Health' else 'health'}]
 m=re.fullmatch(r'Shuffle (\d+) copies of a friendly minion into your deck',t)
 if m:return [{'op':'shuffle-copy','scope':'target','target':'friendly-minion','amount':int(m[1])}]
 m=re.fullmatch(r'Choose a friendly minion\. Shuffle a copy into your deck',t)
 if m:return [{'op':'shuffle-copy','scope':'target','target':'friendly-minion','amount':1}]
 if t=="Shuffle a copy of your opponent's deck into your deck":return [{'op':'copy-enemy-decks'}]
 m=re.fullmatch(r'Shuffle (\d+) random (.+) into your deck\. They cost \((\d+)\)(?: less)?',t)
 if m:
  f=filt(m[2])
  if f is not None:return [{'op':'shuffle-pool','filter':f,'amount':int(m[1]),'reduction':int(m[3]) if t.endswith('less') else 0,'setCost':None if t.endswith('less') else int(m[3])}]
 m=re.fullmatch(r'Transform (?:a friendly minion|one of your minions) into a copy of this',t)
 if m:return [{'op':'transform','scope':'target','target':'friendly-minion','from':'self'}]
 if t=='Transform adjacent minions into a copy of this':return [{'op':'transform','scope':'adjacent','from':'self'}]
 m=re.fullmatch(r'Transform into a (?:(\d+)/(\d+) )?copy of (?:a |an )?(.+?)(?: in your (deck|hand))?',t)
 if m:
  noun=m[3];q=target('a '+noun)
  if m[4]:
   f=filt(noun.replace('random ',''))
   if f is not None:return [{'op':'transform','scope':'self','from':m[4],'filter':f,'attack':int(m[1]) if m[1] else None,'health':int(m[2]) if m[2] else None}]
  elif q:return [{'op':'transform','from':'target','attack':int(m[1]) if m[1] else None,'health':int(m[2]) if m[2] else None,**q}]
 m=re.fullmatch(r'Transform (a friendly minion|adjacent minions) into (?:a random (?:minion|one)|random minions) (?:with the same Cost|that costs? \((\d+)\) more)',t)
 if m:
  q=target(m[1]);return [{'op':'transform','from':'pool','costDelta':int(m[2] or 0),**q}]
 m=re.fullmatch(r'Transform (a friendly minion|a friendly Treant|your Treants|an enemy minion) into (?:a |an |)(\d+)/(\d+) (\w+?)(?: with (Taunt|Rush))?',t)
 if m:
  q=target(m[1]);opts=[c for c in all_cards if c.get('attack')==int(m[2]) and c.get('health')==int(m[3]) and c.get('name') in (m[4],m[4].removesuffix('s')) and set(c.get('mechanics',[]))<=set(keywords.values())]
  if q and choose_token(opts):return [{'op':'transform','from':'token','token':choose_token(opts)['id'],**q}]
 m=re.fullmatch(r'Return (your other minions|all enemy minions) to (?:your hand|their owner\'s hand)(?:\. They cost \((\d+)\))?',t)
 if m:
  q=target(m[1]);return [dict(op='bounce',setCost=int(m[2]) if m[2] else None,**q)]
 m=re.fullmatch(r'Draw (\d+) different (.+) from your deck',t)
 if m:
  f=filt(m[2])
  if f is not None:return [{'op':'draw','amount':int(m[1]),'filter':f,'distinct':True}]
 m=re.fullmatch(r'(?:Add|Give|Get) (a |an |two |three |\d+ )?(.+?) to (your|each player\'s|your opponent\'s) hand',t)
 if m:
  name=m[2].strip("'\"").removesuffix('s');opts=[c for c in all_cards if c.get('name') in [m[2].strip("'\""),name]]
  if choose_token(opts):return [{'op':'generate-token','token':choose_token(opts)['id'],'amount':num((m[1] or 'a').strip()),'allPlayers':m[3]=="each player's",'enemy':m[3]=="your opponent's"}]
 if t=='Give your opponent 2 Bananas':
  opts=[c for c in all_cards if c.get('name')=='Bananas']
  if choose_token(opts):return [{'op':'generate-token','token':choose_token(opts)['id'],'amount':2,'enemy':True}]

 # Every recursive branch must consume its entire clause.
 m=re.fullmatch(r'If (.+?), (.+)',t)
 if m:
  c=condition(m[1]);e=compile(m[2]);return [{'op':'if','condition':c,'steps':e}] if c is not None and e is not None else None
 m=re.fullmatch(r'Deal (\d+) damage(?: to (.+))?',t)
 if m:
  q=target(m[2]) if m[2] else {'scope':'target','target':'character'}
  if q:return [dict(op='damage',amount=int(m[1]),**q)]
 m=re.fullmatch(r'Deal damage (?:equal to (.+) to (.+)|to (.+) equal to (.+))',t)
 if m:
  v=value(m[1] or m[4]);q=target(m[2] or m[3]);return [dict(op='damage',amount=v,**q)] if v is not None and q else None
 m=re.fullmatch(r'Deal (\d+) damage to a random (enemy minion|enemy)',t)
 if m:return [{'op':'damage','amount':int(m[1]),'scope':'enemy' if m[2]=='enemy minion' else 'enemies','random':1}]
 m=re.fullmatch(r'Deal (\d+) damage randomly split (?:between|among) (all enemies|all other characters|all enemy minions)',t)
 if m:return [{'op':'missiles','amount':int(m[1]),'scope':{'all enemies':'enemies','all other characters':'characters','all enemy minions':'enemy'}[m[2]],'other':True}]
 m=re.fullmatch(r'Deal (\d+) damage to a random enemy, (two|three|four) times',t)
 if m:return [{'op':'damage','amount':int(m[1]),'scope':'enemies','random':1}]*num(m[2])
 m=re.fullmatch(r'Restore (\d+) Health(?: to (.+))?',t)
 if m:
  q=target(m[2]) if m[2] else {'scope':'target','target':'character'}
  return [dict(op='heal',amount=int(m[1]),**q)] if q else None
 m=re.fullmatch(r'Restore (.+) to full Health',t)
 if m:
  q=target(m[1]);return [dict(op='heal',amount=0,full=True,**q)] if q else None
 m=re.fullmatch(r'Restore Health to (.+) equal to (.+)',t)
 if m:
  q=target(m[1]);v=value(m[2]);return [dict(op='heal',amount=v,**q)] if q and v is not None else None
 m=re.fullmatch(r'Gain (\d+) Armor',t)
 if m:return [{'op':'armor','amount':int(m[1])}]
 m=re.fullmatch(r'Give (.+) ([+-]\d+)/([+-]\d+)(?: and (.+))?',t)
 if not m:m=re.fullmatch(r'Give (.+) ([+-]\d+) (Attack|Health)(?: and (.+))?',t);single=bool(m)
 else:single=False
 if m:
  q=target(m[1]);kw=keywords.get(m[4]) if m[4] else None
  if m[4] and not kw:return None
  if q:return [dict(op='buff',attack=int(m[2]) if not single or m[3]=='Attack' else 0,health=int(m[3]) if not single else int(m[2]) if m[3]=='Health' else 0,**q)]+([dict(op='keyword',keyword=kw,**q)] if kw else [])
 m=re.fullmatch(r'Give (.+) (Taunt|Rush|Charge|Divine Shield|Lifesteal|Windfury|Poisonous)',t)
 if m:
  q=target(m[1]);return [dict(op='keyword',keyword=keywords[m[2]],**q)] if q else None
 m=re.fullmatch(r'Gain ([+-]\d+)/([+-]\d+)(?: for each (.+))?',t)
 if m:
  v=count_expr(m[3]) if m[3] else 1
  return [{'op':'buff','scope':'self','attack':int(m[1]),'health':int(m[2]),'scale':v}] if v is not None else None
 m=re.fullmatch(r'Gain ([+-]\d+) (Attack|Health)(?: for each (.+))?',t)
 if m:
  v=count_expr(m[3]) if m[3] else 1
  return [{'op':'buff','scope':'self','attack':int(m[1]) if m[2]=='Attack' else 0,'health':int(m[1]) if m[2]=='Health' else 0,'scale':v}] if v is not None else None
 m=re.fullmatch(r'Gain ([+-]\d+) Attack and (Taunt|Charge|Rush)',t)
 if m:return [{'op':'buff','scope':'self','attack':int(m[1]),'health':0},{'op':'keyword','scope':'self','keyword':keywords[m[2]]}]
 m=re.fullmatch(r'Give (all minions|minions|all Dragons|all Deathrattle minions|Taunt minions) in your (hand|deck|hand and deck) ([+-]\d+)/([+-]\d+)',t)
 if m:
  f=filt(m[1].removeprefix('all '));return [{'op':'zone-buff','zone':m[2],'filter':f,'attack':int(m[3]),'health':int(m[4])}] if f is not None else None
 m=re.fullmatch(r'Give a random (.+) in your hand ([+-]\d+)/([+-]\d+)',t)
 if m:
  f=filt(m[1]);return [{'op':'zone-buff','zone':'hand','filter':f,'random':1,'attack':int(m[2]),'health':int(m[3])}] if f is not None else None
 m=re.fullmatch(r'Give minions in your hand ([+-]\d+) Health',t)
 if m:return [{'op':'zone-buff','zone':'hand','filter':{'type':'MINION'},'attack':0,'health':int(m[1])}]
 m=re.fullmatch(r'Draw (a card|two cards|\d+ cards)',t)
 if m:return [{'op':'draw','amount':1 if m[1]=='a card' else num(m[1].split()[0])}]
 m=re.fullmatch(r'Draw (?:a |an |your )?(lowest Cost |highest Cost )?(.+?)(?: from your deck)?',t)
 if m:
  f=filt(m[2])
  if f is not None:return [{'op':'draw','amount':1,'filter':f,'order':(m[1] or '').strip()}]
 m=re.fullmatch(r'Draw (two|\d+) (.+)',t)
 if m:
  f=filt(m[2]);return [{'op':'draw','amount':num(m[1]),'filter':f}] if f is not None else None
 m=re.fullmatch(r'Draw until you have (\d+) cards',t)
 if m:return [{'op':'draw','until':int(m[1])}]
 m=re.fullmatch(r'Discover (.+?)(?:\. (?:It costs \((\d+)\) less|Reduce its Cost by \((\d+)\)))?',t)
 if m:
  f=filt(m[1])
  if f is not None and not any(z in m[1] for z in ('from your deck','in your deck')):return [{'op':'discover','filter':f,'reduction':int(m[2] or m[3] or 0)}]
 m=re.fullmatch(r'Discover (?:a copy of )?(?:a |an )?(.+?) (?:in|from) your deck(?:\. Reduce its Cost by \((\d+)\))?',t)
 if m:
  f=filt(m[1]);return [{'op':'discover','filter':f,'zone':'deck','reduction':int(m[2] or 0),'copy':'copy of' in t}] if f is not None else None
 m=re.fullmatch(r'(?:Add|Get) (?:(a|an|two|\d+) )?random (.+?)(?: to your hand)?',t)
 if m:
  f=filt(m[2]);return [{'op':'generate','filter':f,'amount':num(m[1] or 'a')}] if f is not None else None
 m=re.fullmatch(r'(?:Freeze|Silence|Destroy) (.+)',t)
 if m:
  q=target(m[1])
  if q:return [dict(op=t.split()[0].lower(),**q)]
 m=re.fullmatch(r'Return (?:a friendly minion from the battlefield|a friendly minion) to your hand(?: and give it ([+-]\d+)/([+-]\d+))?',t)
 if m:return [{'op':'bounce','scope':'target','target':'friendly-minion','attack':int(m[1] or 0),'health':int(m[2] or 0)}]
 m=re.fullmatch(r'Swap the Attack and Health of (.+)',t)
 if m:
  q=target(m[1]);return [dict(op='swap',**q)] if q else None
 m=re.fullmatch(r'(?:Change|Set) (.+?)(?:\x27)?(?:s)? Attack to (\d+)',t)
 if m:
  q=target(m[1]);return [dict(op='set',attack=int(m[2]),**q)] if q else None
 m=re.fullmatch(r'Summon (?:a |an |)(random )?(\d+)-Cost minion(?: for your opponent)?',t)
 if m:return [{'op':'summon-pool','filter':{'type':'MINION','cost':int(m[2])},'amount':1,'enemy':t.endswith('opponent')}]
 m=re.fullmatch(r'Summon (a|two|three|\d+) random (.+?)(?: for your opponent)?',t)
 if m:
  f=filt(m[2]);return [{'op':'summon-pool','filter':f,'amount':num(m[1]),'enemy':t.endswith('opponent')}] if f is not None and f.get('type')=='MINION' else None
 m=re.fullmatch(r'Summon (?:(a|an|two|three|four|\d+) )?(?:copy|copies) of this(?: minion)?',t)
 if m:return [{'op':'summon-self','amount':num(m[1] or 'a')}]
 # Token scripts only if their exact metadata is known and contains no extra text.
 m=re.fullmatch(r'Summon (a|an|two|three|four|\d+) (\d+)/(\d+) ([\w -]+?)(?: with (Taunt|Rush|Divine Shield))?(?: for your opponent)?',t)
 if m:
  token_candidates=[c for c in all_cards if c.get('name') in [m[4],m[4].removesuffix('s')] and c.get('attack')==int(m[2]) and c.get('health')==int(m[3])]
  if token_candidates:
   tok=choose_token(token_candidates)
   if not tok:return None
   allowed=set(keywords.values())
   if (set(tok.get('mechanics',[]))<=allowed and not re.sub(r'Taunt|Rush|Charge|Divine Shield|Lifesteal|Windfury|Poisonous|Stealth|Reborn|[., ]','',clean(tok.get('text','')))) or (set(tok.get('mechanics',[]))<=(allowed|{'DEATHRATTLE'}) and re.fullmatch(r'Deathrattle: .+',clean(tok.get('text',''))) and compile(clean(tok['text'])[12:]) is not None):
    return [{'op':'summon-token','token':tok['id'],'amount':num(m[1]),'enemy':t.endswith('opponent')}]
 # Strict complete sequential clauses, after all single-clause matching.
 parts=re.split(r'\. (?:Then |then )?',t)
 if len(parts)>1:
  steps=[]
  for part in parts:
   e=compile(part)
   if e is None:return None
   steps+=e
  return steps
 return None
all_cards=[]
current_card={}
def main():
 global all_cards,current_card
 all_cards=json.loads((ROOT/'data/battlecry-token-reference.json').read_text(encoding='utf8'))['cards']
 if isinstance(all_cards,dict):all_cards=all_cards.get('cards',[])
 catalog={c['id']:{k:v for k,v in c.items() if k in ['id','name','type','cost','attack','health','cardClass','classes','mechanics','race','races','rarity','set','text','spellSchool','collectible','dbfId','durability']} for c in all_cards}
 registry={};death_registry={};rejected=[]
 allowed=set(keywords.values())|{'BATTLECRY','DISCOVER','SILENCE','FREEZE','DEATHRATTLE','OVERLOAD','DREDGE'}
 for c in [*cards,*[c for c in all_cards if not c.get('collectible')]]:
  if c['type']!='MINION' or 'BATTLECRY' not in c.get('mechanics',[]):continue
  current_card=c
  t=clean(c.get('text',''));prefix=re.match(r'^(?:(?:Taunt|Rush|Charge|Lifesteal|Windfury|Poisonous|Divine Shield|Stealth|Reborn)[.,]? )*Battlecry(?: and Deathrattle)?: (.+)$',t)
  body=prefix[1] if prefix else ''
  deathpart=None
  if '. Deathrattle: ' in body:body,deathpart=body.split('. Deathrattle: ',1)
  e=compile(body) if prefix and not(set(c.get('mechanics',[]))-allowed) else None
  if e is not None:
   registry[c['id']]={'text':c.get('text',''),'steps':e}
   if 'Battlecry and Deathrattle:' in t:death_registry[c['id']]=registry[c['id']]
   elif deathpart and compile(deathpart) is not None:death_registry[c['id']]={'text':c.get('text',''),'steps':compile(deathpart)}
   elif 'DEATHRATTLE' in c.get('mechanics',[]):
    registry.pop(c['id']);rejected.append({'id':c['id'],'name':c['name'],'text':t})
  else:rejected.append({'id':c['id'],'name':c['name'],'text':t})
 for c in [*all_cards,*cards]:
  if c.get('type')!='MINION' or c['id'] in death_registry:continue
  current_card=c
  t=clean(c.get('text',''))
  match=re.fullmatch(r'(?:(?:Taunt|Rush|Charge|Lifesteal|Windfury|Poisonous|Divine Shield|Stealth|Reborn)[.,]? )*Deathrattle: (.+)',t)
  if match and not(set(c.get('mechanics',[]))-allowed):
   e=compile(match[1])
   if e is not None:death_registry[c['id']]={'text':c.get('text',''),'steps':e}
 (ROOT/'src/generated/deathrattles.json').write_text(json.dumps(death_registry,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
 (ROOT/'src/generated/battlecries.json').write_text(json.dumps(registry,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
 def tokens(steps):
  for step in steps:
   if 'token' in step:yield step['token']
   if 'pool' in step and step['op'] in ('generate','discover','shuffle-pool','summon-pool'):yield from step['pool']
   if 'steps' in step:yield from tokens(step['steps'])
   if 'elseSteps' in step:yield from tokens(step['elseSteps'])
 used={tid for e in [*registry.values(),*death_registry.values()] for tid in tokens(e['steps'])}
 compact={c['id']:{k:v for k,v in c.items() if k in ['id','name','type','cost','attack','health','cardClass','classes','mechanics','race','races','rarity','set','text','spellSchool','collectible','dbfId','durability']} for c in cards}
 for tid in sorted(used):compact.setdefault(tid,catalog[tid])
 for c in compact.values():c.setdefault('wildLegal',None)
 spells={}
 for tid,tok in compact.items():
  if tok.get('type')!='SPELL':continue
  current_card=tok
  text=clean(tok.get('text',''))
  e=compile(text)
  if tid=='RLK_843':e=[{'op':'if','condition':{'stat':'mana','min':8},'steps':[{'op':'damage','scope':'target','target':'character','amount':3}]},{'op':'if','condition':{'stat':'mana','max':7},'steps':[{'op':'damage','scope':'target','target':'character','amount':2}]}]
  def needs_unit(steps):return any(x.get('scope')=='self' or x['op']=='summon-self' or x.get('from')=='self' or needs_unit(x.get('steps',[])) for x in steps)
  if e is not None and not needs_unit(e):spells[tid]={'text':tok.get('text',''),'steps':e}
 (ROOT/'src/generated/spells.json').write_text(json.dumps(spells,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
 for e in spells.values():
  for tid in tokens(e['steps']):
   if tid not in compact:compact[tid]=dict(catalog[tid],wildLegal=None)
 (ROOT/'src/generated/catalog.json').write_text(json.dumps(list(compact.values()),ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
 (ROOT/'data/battlecry-unmatched.json').write_text(json.dumps(rejected,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
 death_registry={k:v for k,v in death_registry.items() if k in compact}
 (ROOT/'src/generated/deathrattles.json').write_text(json.dumps(death_registry,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
 hashes={str(p.relative_to(ROOT)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((ROOT/'src/generated').glob('*.json'))}
 (ROOT/'data/battlecry-generated-hashes.json').write_text(json.dumps(hashes,indent=2)+'\n',encoding='utf8')
 print('compiled',len(registry),'records',len({c['name'] for c in cards if c['id'] in registry}),'names')

if __name__=='__main__':main()
