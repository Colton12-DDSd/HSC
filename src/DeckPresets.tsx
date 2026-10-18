import { useMemo } from 'react';
import type { Card } from './cards';
import { buildPremade, premades } from './premades';

export function DeckPresets({
  cards,
  selected,
  onSelect,
  guided,
  onGuided,
}: {
  cards: Card[];
  selected: string;
  onSelect: (id: string) => void;
  guided: boolean;
  onGuided: (guided: boolean) => void;
}) {
  const preset = premades.find((p) => p.id === selected);
  const preview = useMemo(
    () => (cards.length && selected !== 'starter' ? buildPremade(cards, selected) : undefined),
    [cards, selected],
  );
  return (
    <div className="deck-presets">
      <label>
        Test deck{' '}
        <select aria-label="Test deck" value={selected} onChange={(e) => onSelect(e.target.value)}>
          <option value="starter">Starter · mixed mechanics</option>
          {premades.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      {preset ? (
        <>
          <label className="guided-opening">
            <input type="checkbox" checked={guided} onChange={(e) => onGuided(e.target.checked)} />{' '}
            Guided opening
          </label>
          <details className="preset-preview">
            <summary>Deck & test goals</summary>
            <div className="preset-preview-panel">
              <h3>{preset.name}</h3>
              <p>{preset.description}</p>
              <small>
                100 singleton cards + King Krush · mixed-class local sandbox · {preset.class} hero
                power
              </small>
              <ol>
                {preset.objectives.map((goal) => (
                  <li key={goal}>{goal}</li>
                ))}
              </ol>
              <p>
                {guided
                  ? 'Guided opening puts the five listed cards first. Opponents also receive their own test openings. The remaining deck is shuffled.'
                  : 'All four decks are shuffled normally.'}
              </p>
              <strong>Guided opening</strong>
              <p>{preset.opening.join(' · ')}</p>
              {preview ? (
                <details>
                  <summary>View all {preview.cards.length} cards</summary>
                  <ul className="preset-card-list">
                    {[...preview.cards]
                      .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name))
                      .map((c) => (
                        <li key={c.id}>
                          <span>{c.cost} ◆</span> {c.name}
                        </li>
                      ))}
                  </ul>
                </details>
              ) : null}
            </div>
          </details>
        </>
      ) : null}
    </div>
  );
}
