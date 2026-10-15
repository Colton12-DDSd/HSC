# Simulator research

Primary projects inspected for possible future reuse:

- Fireplace (Python): https://github.com/jleclanche/fireplace — license file https://github.com/jleclanche/fireplace/blob/master/LICENSE
- SabberStone (C#): https://github.com/HearthSim/SabberStone — license file https://github.com/HearthSim/SabberStone/blob/master/LICENSE
- HearthDb format helper: https://github.com/HearthSim/HearthDb/blob/master/HearthDb/Helper.cs
- HearthstoneJSON field documentation: https://hearthstonejson.com/docs/cards.html

Fireplace and SabberStone's inspected license files identify AGPL v3. No simulator code has been copied into this project. Confirm license requirements and project distribution plans before integrating or translating their code. Their usual two-player assumptions also need review for four-player opponent selection, clockwise reactions, simultaneous deaths and commander replacements. This alpha uses an original TypeScript transition engine and an explicit, deliberately small effect registry.

The inspected HearthDb WildSets list excludes some newer expansions and should not be used as an automatically current complete Wild legality authority. The importer keeps uncertain eligibility pending rather than hardcoding that list or guessing set legality.
