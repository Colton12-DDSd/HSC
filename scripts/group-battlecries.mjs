import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { classify, groups, lanes, normalize } from './battlecry-groups.mjs';

const root = new URL('../', import.meta.url);
const read = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
export async function buildGrouping(coverage, cards) {
  const byId = new Map(cards.map((c) => [c.id, c]));
  const pending = coverage.minions.filter(
    (m) =>
      !m.printings.some((p) => p.supported && p.battlecry) &&
      m.printings.some((p) => byId.get(p.id)?.mechanics?.includes('BATTLECRY')),
  );
  const entries = pending.map((m) => {
    const printings = m.printings
      .filter((p) => byId.get(p.id)?.mechanics?.includes('BATTLECRY'))
      .map((p) => ({
        id: p.id,
        text: p.text,
        normalizedText: normalize(p.text),
        mechanics: byId.get(p.id).mechanics ?? [],
      }));
    return { ...classify(m.name, printings), printings };
  });
  if (new Set(entries.map((e) => e.name)).size !== entries.length)
    throw Error('Duplicate name in grouping');
  if (entries.length !== coverage.summary.remainingBattlecryNames)
    throw Error('Grouping does not cover the full remaining-name inventory');
  const summary = groups.map((group) => ({
    ...group,
    count: entries.filter((e) => e.primary === group.id).length,
  }));
  const laneSummary = Object.entries(lanes).map(([id, label]) => ({
    id,
    label,
    count: entries.filter((e) => e.lane === id).length,
  }));
  const tagSummary = groups.map((group) => ({
    id: group.id,
    label: group.label,
    count: entries.filter((e) => e.dependencies.includes(group.id)).length,
  }));
  const bucket = (key) =>
    [...new Set(entries.flatMap((e) => e[key]))].sort().map((label) => ({
      label,
      count: entries.filter((e) => e[key].includes(label)).length,
      names: entries.filter((e) => e[key].includes(label)).map((e) => e.name),
    }));
  const keywordFamilies = bucket('keywordTags').map((f) => ({
    ...f,
    attachedCount: entries.filter((e) => e.attachedKeywords.includes(f.label)).length,
    referenceOnlyCount: entries.filter((e) => e.referencedKeywords.includes(f.label)).length,
  }));
  const replacementCharacterPrintings = entries
    .flatMap((e) => e.printings)
    .filter((p) => p.text?.includes('\uFFFD')).length;
  return {
    snapshot: '2026-10-22',
    basis: 'Pinned local collection; exact remaining-name membership from the support audit',
    supportedBattlecryNames: coverage.summary.supportedBattlecryNames,
    totalRemaining: entries.length,
    replacementCharacterPrintings,
    lanes: laneSummary,
    groups: summary,
    dependencyCounts: tagSummary,
    keywordFamilies,
    namedFamilies: bucket('familyTags'),
    entries,
  };
}

export function markdown(report) {
  const esc = (s) => String(s).replaceAll('|', '\\|').replaceAll('\n', ' ');
  const link = (g) => `[${g.label}](#${g.id})`;
  const rows = report.groups
    .filter((g) => g.count)
    .map((g) => `| ${link(g)} | ${g.count} | ${lanes[g.lane]} |`)
    .join('\n');
  const dependencyRows = report.dependencyCounts
    .filter((g) => g.count)
    .sort((a, b) => b.count - a.count)
    .map((g) => `| ${esc(g.label)} | ${g.count} |`)
    .join('\n');
  const familyRows = (values) =>
    values
      .map((v) => `| ${esc(v.label)} | ${v.count} | ${v.names.map(esc).join('; ')} |`)
      .join('\n');
  return `# Remaining Battlecries grouped for implementation

Audit date: **2026-10-22**. Reviewed the complete pinned backlog: **${report.totalRemaining.toLocaleString('en-US')} unique minion names** across **${report.entries.reduce((n, e) => n + e.printings.length, 0).toLocaleString('en-US')} printings**. **${report.supportedBattlecryNames} names are already supported** and excluded here. Matching Core printings do not count as extra names.

Every remaining name has **one primary group**, so the primary counts add up to ${report.totalRemaining.toLocaleString('en-US')}. Extra dependencies, keywords and named families can overlap: their counts must not be added together. Group membership is a planning judgment based on the complete printed card, including passives, separate Deathrattles and attached keywords. It does not enable a card or prove that a whole group shares one identical script.

## Implementation lanes

| Lane | Names |
| --- | --- |
${report.lanes.map((l) => `| ${esc(l.label)} | ${l.count} |`).join('\n')}

“Existing foundations” means a candidate for extending current scripts, selectors, values or sequencing. It is **not** a promise that the card needs only a number change. Each card still needs full-clause review and tests. Shared-family work extends an existing engine family; system work adds a missing rules system; bespoke work needs a card-specific design decision.

## Primary groups — no double counting

| Group | Names | Implementation lane |
| --- | --- | --- |
${rows}

## Recommended implementation order

1. Take the existing-foundation groups first: board stats/damage, zone operations, exact tokens, and generated pools. Audit the complete generated token ability before claiming source-card completion.
2. Extend costs, choices, history queries, transformations and linked Deathrattles. Use the themed test decks to reproduce each family, with independent expected outcomes.
3. Add shared foundational systems: Spell Damage, auras/listeners, hero powers, spell replay and cast-when-drawn processing. These unlock cards across several primary groups.
4. Implement expansion families in explicit batches, such as Tradeable, Rewind, Infuse, Corpses, Jade Golems, C'Thun and Excavation; then handle custom constructors and match-changing cards individually.

This order is a dependency plan, not a claim that all unimplemented cards are equally easy or unique. Many combine multiple groups, and the last missing clause still blocks the entire printing.

## Examples of why these groups help

| Card | What can be shared / what still blocks it |
| --- | --- |
| Coldlight Oracle | Extend the existing draw operation to the full player group. |
| Air Guitarist | Extend the existing weapon modifier to the printed Durability wording. |
| Lord Godfrey | The engine already has repeat-until-no-deaths behavior; it does not need the entire general Battlecry-replay system. |
| Siamat | All four offered keywords already exist; the missing piece is choosing two distinct grants. |
| Big Game Hunter | Its destroy selector looks straightforward, but the same printings also have Tradeable. |
| Azure Drake | Drawing is already supported; the attached Spell Damage must work too. |
| Kazakus | A custom spell builder needs an explicit choice tree and generated effects. |

## Cross-cutting dependencies — overlapping counts

These counts answer “how many remaining names mention or require this kind of behavior?” They include the primary group and secondary dependencies, so one card can appear in several rows.

| Dependency | Names touching it |
| --- | --- |
${dependencyRows}

## Attached keyword families — overlapping counts

A Battlecry that looks simple can still require an attached keyword. For example, Big Game Hunter needs Tradeable, and Azure Drake needs Spell Damage. A card that only generates or filters for a keyword is marked as a **reference**, not automatically treated as having the keyword itself. Generated-card abilities still need separate coverage. Conditional references may still require that system's history or state.

| Keyword | Attached/action | Reference only | Total names | Cards |
| --- | --- | --- | --- | --- |
${report.keywordFamilies.map((f) => `| ${esc(f.label)} | ${f.attachedCount} | ${f.referenceOnlyCount} | ${f.count} | ${f.names.map(esc).join('; ')} |`).join('\n')}

## Named resource, reward and token families — overlapping counts

| Family | Names | Cards |
| --- | --- | --- |
${familyRows(report.namedFamilies)}

## Complete inventory by primary group

${report.groups
  .filter((g) => g.count)
  .map(
    (g) => `<a id="${g.id}"></a>

### ${g.label} — ${g.count}

${g.work}

| Minion | Candidate IDs | Other dependencies | Complete printed rules |
| --- | --- | --- | --- |
${report.entries
  .filter((e) => e.primary === g.id)
  .map(
    (e) =>
      `| ${esc(e.name)} | ${e.printings.map((p) => p.id).join(', ')} | ${e.dependencies
        .filter((id) => id !== g.id)
        .map((id) => esc(groups.find((g) => g.id === id).label))
        .join(
          '; ',
        )}${e.attachedKeywords.length ? ' · Attached/action: ' + e.attachedKeywords.map(esc).join(', ') : ''}${e.referencedKeywords.length ? ' · References: ' + e.referencedKeywords.map(esc).join(', ') : ''} | ${[...new Set(e.printings.map((p) => p.normalizedText))].map(esc).join(' / ')} |`,
  )
  .join('\n')}`,
  )
  .join('\n\n')}

## Reproduction and limits

Run \`npm run group:battlecries\` to refresh the underlying support audit and this grouping. Machine-readable output is \`data/battlecry-groups.json\`; taxonomy rules are in \`scripts/battlecry-groups.mjs\`. Full raw printed text is preserved per printing in the JSON; UI-only variants after \`@\` are normalized for this report. Raw printings containing a replacement character: **${report.replacementCharacterPrintings}**. Nonbreaking spaces are normalized only for analysis.

No gameplay scripts, card support flags, databases or images are changed by grouping. Any support/collection updates require regeneration. [Ungrouped backlog](BATTLECRY-REMAINING.md) · [Test decks and current rules](TEST-DECKS.md)
`;
}

export async function main() {
  const [coverage, cards] = await Promise.all([
    read('data/minion-coverage.json'),
    read('public/data/cards.json'),
  ]);
  const report = await buildGrouping(coverage, cards);
  await writeFile(
    new URL('data/battlecry-groups.json', root),
    JSON.stringify(report, null, 2) + '\n',
  );
  await writeFile(new URL('docs/BATTLECRY-GROUPS.md', root), markdown(report));
  console.log(
    JSON.stringify(
      {
        total: report.totalRemaining,
        lanes: report.lanes,
        groups: report.groups.map((g) => ({ group: g.id, count: g.count })),
      },
      null,
      2,
    ),
  );
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
