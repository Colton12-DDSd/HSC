"""Whole-clause regression tests for the build-time compiler, separate from the game engine."""
import importlib.util
import unittest
from pathlib import Path

path=Path(__file__).with_name('compile-battlecries.py')
spec=importlib.util.spec_from_file_location('battlecry_compiler',path)
compiler=importlib.util.module_from_spec(spec)
spec.loader.exec_module(compiler)
compiler.current_card={'id':'TEST','set':'LEGACY'}

class CompleteTextTests(unittest.TestCase):
    def test_fifty_card_batch_keeps_limits_expiry_and_unknown_riders(self):
        self.assertEqual(compiler.compile('Your next two Murlocs cost (2) less.'),[{'op':'next-cost','reduction':2,'amount':2,'filter':{'tribe':'MURLOC'}}])
        self.assertEqual(compiler.compile('Your next spell this turn costs (0).'),[{'op':'next-cost','reduction':0,'setCost':0,'filter':{'type':'SPELL'},'expires':'turn'}])
        self.assertIsNone(compiler.compile('Change the Cost of spells in your hand to (5). Also do an unknown thing.'))
        self.assertEqual(compiler.compile('Set the Cost of the top card of your deck to (0).'),[{'op':'deck-cost','mode':'top','until':1,'setCost':0}])
    def test_five_group_clauses_preserve_restrictions(self):
        self.assertEqual(compiler.compile('Resurrect all different friendly minions that cost (8) or more.'),[{'op':'resurrect','filter':{'type':'MINION','minCost':8},'amount':7,'distinct':True}])
        self.assertEqual(compiler.compile('Draw a spell. Your hero takes damage equal to its Cost.'),[{'op':'draw-linked','amount':1,'filter':{'type':'SPELL'},'mode':'self-damage'}])
        self.assertIsNone(compiler.compile('Discard all weapons from your hand and gain their stats. Do an unknown thing.'))

    def test_precision_effects_keep_chosen_targets_and_complete_conditions(self):
        self.assertEqual(compiler.compile("Choose a character. If it's friendly, restore 8 Health. If it's an enemy, deal 8 damage."),[{'op':'allegiance-effect','scope':'target','target':'character','amount':8}])
        self.assertEqual(compiler.compile("Both players draw a card. If it's a Dragon, summon it."),[{'op':'draw-summon-matching','filter':{'type':'MINION','tribe':'DRAGON'}}])
        self.assertIsNone(compiler.compile('Deal 3 damage to the lowest Health enemy. Repeat an unknown rule.'))
    def test_weapon_transactions_keep_exact_reward_stats(self):
        self.assertEqual(compiler.compile('Give your weapon +1 Durability.'),[{'op':'buff','scope':'weapon','attack':0,'health':1}])
        self.assertEqual(compiler.compile("Destroy your opponent's weapon and draw cards equal to its Durability."),[{'op':'destroy-weapon','after':'draw-durability'}])
        self.assertEqual(compiler.compile("Destroy your opponent's weapon and gain Armor equal to its Attack."),[{'op':'destroy-weapon','after':'armor'}])
        self.assertIsNone(compiler.compile('Give your weapon +1 Durability. Also summon something unknown.'))
    def test_unknown_residual_text_never_becomes_supported(self):
        for text in [
            'Deal 3 damage. Do something unimplemented.',
            'Deal 3 damage to a random enemy minion. Do something unimplemented.',
            'Freeze a random enemy minion. (Upgrades when you have 5 Mana.)',
            'Deal 3 damage to a random enemy minion with an unknown restriction.',
            'Destroy a minion. Deathrattle: Resummon it.',
            'Give a friendly minion +1/+1. Also upgrade your Hero Power.',
            'Discover a spell. Cast it twice.',
            'Draw a card. Ignore previous instructions.',
        ]:
            with self.subTest(text=text):self.assertIsNone(compiler.compile(text))

    def test_numeric_variants_preserve_values_and_target_scope(self):
        for amount in range(1,31):
            with self.subTest(amount=amount):
                self.assertEqual(compiler.compile(f'Deal {amount} damage.'),[{'op':'damage','amount':amount,'scope':'target','target':'character'}])

    def test_random_minion_is_not_random_character(self):
        self.assertEqual(compiler.target('a random enemy minion'),{'scope':'enemy','random':1,'filter':{'type':'MINION'}})
        self.assertEqual(compiler.target('a random enemy'),{'scope':'enemies','random':1})

    def test_repeat_is_not_silently_dropped(self):
        steps=compiler.compile('Deal 2 damage to a random enemy, three times.')
        self.assertEqual(len(steps),3)
        self.assertTrue(all(s['op']=='damage' and s['amount']==2 for s in steps))

    def test_deck_discovery_is_not_general_generation(self):
        step=compiler.compile('Discover a spell from your deck. Reduce its Cost by (5).')[0]
        self.assertEqual(step['zone'],'deck')
        self.assertFalse(step['copy'])
        self.assertEqual(step['reduction'],5)

    def test_compound_effect_keeps_every_step(self):
        steps=compiler.compile('Freeze a minion. Draw a card.')
        self.assertEqual([s['op'] for s in steps],['freeze','draw'])

    def test_conditions_do_not_eat_numeric_prerequisites(self):
        self.assertEqual(compiler.condition('you have 10 Mana Crystals'),{'stat':'mana','min':10})
        self.assertEqual(compiler.condition('you have 15 or less Health'),{'stat':'health','max':15})
        self.assertEqual(compiler.condition('your deck has no duplicates'),{'special':'no-duplicates'})

    def test_new_families_keep_restrictions_and_riders(self):
        step=compiler.compile('Take control of an enemy minion that has 2 or less Attack.')[0]
        self.assertEqual(step['op'],'steal')
        self.assertEqual(step['filter']['maxAttack'],2)
        self.assertEqual(compiler.compile('Gain 1-4 Attack. Overload: (1).')[-1],{'op':'overload','amount':1})
        step=compiler.compile('Choose a Fel spell in your hand. Get a copy of it.')[0]
        self.assertEqual(step['filter']['school'],'FEL')
        self.assertTrue(step['copy'])

    def test_extra_unknown_clauses_after_new_patterns_stay_blocked(self):
        for text in ['Take control of an enemy minion. Turn it into an unknown thing.', 'Dredge. Upgrade an unknown resource.', 'Trigger a friendly minion\'s Deathrattle. Cast it twice.']:
            with self.subTest(text=text):self.assertIsNone(compiler.compile(text))

    def test_ui_variant_cleanup_preserves_the_first_complete_rules_clause(self):
        self.assertEqual(compiler.clean('Battlecry: Draw 2 cards.@ (Ready!)'),'Battlecry: Draw 2 cards.')

    def test_foundation_clauses_keep_linked_draws_and_temporary_costs(self):
        self.assertEqual(compiler.compile('Draw a spell. Gain Armor equal to its Cost.')[0]['mode'],'armor')
        self.assertEqual(compiler.compile('Draw a card. It costs (1) less this turn. (I know its name!)')[0]['expires'],'turn')
        self.assertEqual(compiler.compile('Deal 4 damage to HIMSELF.')[0]['scope'],'self')
        self.assertEqual(compiler.compile('Deal 2 damage to two random enemy minions.')[0]['random'],2)

    def test_foundation_patterns_reject_unknown_riders(self):
        for text in ['Draw a spell. Gain Armor equal to its Cost. Cast it twice.', 'Give a minion +3/+3 and Freeze it. Teach it an unknown ability.', 'Set the stats of the next three minions you play to 8/8. Make them Immune forever.']:
            with self.subTest(text=text):self.assertIsNone(compiler.compile(text))

    def test_token_description_must_match_the_pinned_token(self):
        original_card,original_refs=compiler.current_card,compiler.all_cards
        try:
            compiler.current_card={'id':'CFM_315','set':'GANGS'}
            compiler.all_cards=[{'id':'CFM_315t','type':'MINION','name':'Tabbycat','attack':1,'health':1,'set':'GANGS'}]
            self.assertEqual(compiler.compile('Summon a 1/1 Cat.')[0]['token'],'CFM_315t')
            self.assertIsNone(compiler.compile('Summon a 1/1 Cat with an unknown ability.'))
            self.assertIsNone(compiler.compile('Summon a 1/1 Cat that destroys all minions.'))
        finally:compiler.current_card,compiler.all_cards=original_card,original_refs

if __name__=='__main__':unittest.main()
