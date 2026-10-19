import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import type { Card } from './cards';
import { supported, battlecryFor } from './effects';

const frozen = JSON.parse(readFileSync('data/foundation-battlecry-targets.json', 'utf8')) as {
  names: string[];
  baselineSupportedNames: string[];
  entries: { name: string; printings: { id: string }[] }[];
};
const progress = JSON.parse(readFileSync('data/foundation-battlecry-progress.json', 'utf8')) as {
  target: number;
  completed: number;
  remaining: number;
  entries: { name: string; complete: boolean; ids: string[] }[];
};
const cards = JSON.parse(readFileSync('public/data/cards.json', 'utf8')) as Card[];

it('retains all 315 original candidates without counting printings as separate names', () => {
  expect(frozen.names).toHaveLength(315);
  expect(new Set(frozen.names).size).toBe(315);
  expect(frozen.baselineSupportedNames).toHaveLength(648);
  expect(progress.entries.map((e) => e.name)).toEqual(frozen.entries.map((e) => e.name));
  expect(progress.completed + progress.remaining).toBe(315);
  expect(progress.entries.filter((e) => e.complete)).toHaveLength(progress.completed);
});
it('the progress report matches every original printing in the real support registry', () => {
  for (const original of frozen.entries) {
    const report = progress.entries.find((e) => e.name === original.name)!;
    const ids = original.printings.map((p) => p.id);
    expect(report.ids).toEqual(ids);
    const actual = ids.every((id) => {
      const c = cards.find((c) => c.id === id);
      return !!c && supported(c) && !!battlecryFor(c);
    });
    expect(report.complete, original.name).toBe(actual);
  }
});
