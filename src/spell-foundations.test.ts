import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import type {Card} from './cards';
import {supported} from './effects';
import {createGame,debugAction,applyAction,effectTargets} from './engine';
const cards=JSON.parse(readFileSync('public/data/cards.json','utf8')) as Card[];
const names=JSON.parse(readFileSync('data/spell-foundation-batch.json','utf8')).names as string[];
const card=(n:string)=>structuredClone(cards.find(c=>c.name===n)!);
function setup(){const s=createGame(cards);s.events=[];for(const p of s.players)Object.assign(p,{board:[],hand:[],deck:[card('Chillwind Yeti'),card('Fireball'),card('Wisp')],health:200,mana:100,maxMana:10,reserve:0,armor:0});return s;}
it.each(names)('%s resolves through public actions deterministically',name=>{
 let s=setup();s=debugAction(s,{type:'summon',p:0,card:card('Wisp')});s=debugAction(s,{type:'summon',p:1,card:card('Chillwind Yeti')});s.players[1].board[0].health=3;s.players[1].board[0].frozen=true;s=debugAction(s,{type:'summon',p:0,card:card('Flame Imp')});s.players[0].board[0].shield=true;s.players[0].board[0].keywords=['DIVINE_SHIELD'];s.players[0].hand=[card(name)];expect(supported(card(name))).toBe(true);
 const run=()=>{let n=applyAction(s,{type:'cast',p:0,index:0,target:effectTargets(s,0,card(name))[0]});for(let i=0;n.choice&&i<10;i++)n=applyAction(n,{type:'choose',p:0,index:0});expect(n.choice).toBeUndefined();expect(n.events?.some(e=>e.type==='play'&&e.card?.name===name)).toBe(true);return n;};expect(run()).toEqual(run());
});
it('Frostbolt damages and freezes the selected hero only',()=>{const s=setup();s.players[0].hand=[card('Frostbolt')];const n=applyAction(s,{type:'cast',p:0,index:0,target:{p:1}});expect(n.players[1].health).toBe(197);expect(n.players[2].health).toBe(200);expect(n.players[1].frozen).toBe(true);});
it('Far Sight draws the top card and discounts it',()=>{const s=setup();s.players[0].hand=[card('Far Sight')];const n=applyAction(s,{type:'cast',p:0,index:0});expect(n.players[0].hand[0].name).toBe('Chillwind Yeti');expect(n.players[0].hand[0].cost).toBe(1);});
it('Bracing Cold discounts exactly one spell',()=>{const s=setup();s.players[0].hand=[card('Bracing Cold'),card('Fireball'),card('Frostbolt')];const n=applyAction(s,{type:'cast',p:0,index:0});expect(n.players[0].hand.filter(c=>c.printedCost!==undefined)).toHaveLength(1);expect(n.players[0].health).toBe(205);});


