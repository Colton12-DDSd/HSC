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

if __name__=='__main__':unittest.main()
