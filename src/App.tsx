import { loadCollection } from './collection';
import {
  Fragment,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ButtonHTMLAttributes,
} from 'react';
import {
  BookOpen,
  Swords,
  FlaskConical,
  Crown,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Download,
  Upload,
  Save,
  Shield,
  Gem,
  Settings,
  ScrollText,
  Check,
  RotateCcw,
  ArrowRight,
  Layers,
} from 'lucide-react';
import {
  type Card,
  type Deck,
  classes,
  clean,
  image,
  eligibleClass,
  validateDeck,
  parseDeck,
} from './cards';
import {
  type Game,
  type Action,
  type DebugAction,
  type Target,
  type Replay,
  createGame,
  applyAction,
  debugAction,
  botAction,
  supported,
  commandCost,
  replay,
  effectFor,
  attackError,
  attackReadinessError,
} from './engine';
import { db, saveCloud, loadCloud, download } from './storage';
const empty: Deck = {
  version: 1,
  name: 'Untitled expedition',
  class: 'MAGE',
  commander: null,
  cards: [],
};
const pretty = (s: string) =>
  s
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
type Placement = { card: Card; index?: number; command?: boolean };
type DragSession = { source: Placement; x: number; y: number; moved: boolean };
type PointerHandlers = Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel'
>;
function CardArt({
  card,
  onClick,
  selected = false,
  pointerHandlers,
}: {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
  pointerHandlers?: PointerHandlers;
}) {
  return (
    <button
      className={`card-art ${selected ? 'chosen' : ''}`}
      onClick={onClick}
      {...pointerHandlers}
      style={pointerHandlers ? { touchAction: 'none', cursor: 'grab' } : undefined}
      title={`${card.name} · ${clean(card.text)} · ${supported(card) ? 'Supported' : 'Effects not implemented'}`}
    >
      <img
        loading="lazy"
        src={image(card)}
        alt={card.name}
        draggable={false}
        onError={(e) => {
          e.currentTarget.style.opacity = '.12';
        }}
      />
      <span className="card-fallback">
        {card.cost} ◈<br />
        {card.name}
      </span>
      <span className={`support ${supported(card) ? 'yes' : ''}`}>
        {supported(card) ? '● Supported' : '○ Metadata only'}
      </span>
    </button>
  );
}
export default function App() {
  const [cards, setCards] = useState<Card[]>([]),
    [loadError, setLoadError] = useState(''),
    [tab, setTab] = useState('collection'),
    [toast, setToast] = useState(''),
    [inspect, setInspect] = useState<Card | null>(null),
    [search, setSearch] = useState(''),
    [filters, setFilters] = useState<Record<string, string>>({}),
    [page, setPage] = useState(0),
    [onlySupported, setOnlySupported] = useState(false),
    [deck, setDeck] = useState<Deck>(() => {
      try {
        return JSON.parse(localStorage.getItem('hc:deck:v1') ?? 'null') ?? empty;
      } catch {
        return empty;
      }
    }),
    [saved, setSaved] = useState<Deck[]>(() => {
      try {
        return JSON.parse(localStorage.getItem('hc:saved:v1') ?? '[]');
      } catch {
        return [];
      }
    }),
    [showSaved, setShowSaved] = useState(false),
    [showSettings, setShowSettings] = useState(false),
    [email, setEmail] = useState(''),
    [session, setSession] = useState(false),
    [game, setGame] = useState<Game | null>(null),
    [paused, setPaused] = useState(false),
    [selected, setSelected] = useState<number | undefined>(),
    [placing, setPlacing] = useState<Placement | null>(null),
    [dragPreview, setDragPreview] = useState<{ card: Card; x: number; y: number } | null>(null),
    [hoverPosition, setHoverPosition] = useState<number | null>(null),
    [target, setTarget] = useState<Target>({ p: 1 }),
    [timer, setTimer] = useState(15),
    [remaining, setRemaining] = useState(15),
    [devPlayer, setDevPlayer] = useState(0),
    [devCard, setDevCard] = useState(''),
    [devValue, setDevValue] = useState(3),
    [devField, setDevField] = useState<
      'mana' | 'reserve' | 'health' | 'casts' | 'reduction' | 'handReduction'
    >('reserve');
  const record = useRef<Replay | null>(null),
    upload = useRef<HTMLInputElement>(null),
    replayUpload = useRef<HTMLInputElement>(null);
  const dragSession = useRef<DragSession | null>(null);
  const suppressCardClick = useRef(false);
  function cancelPlacement() {
    dragSession.current = null;
    setPlacing(null);
    setDragPreview(null);
    setHoverPosition(null);
  }
  useEffect(() => {
    if (!placing && selected === undefined) return;
    const cancel = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cancelPlacement();
        setSelected(undefined);
      }
    };
    window.addEventListener('keydown', cancel);
    return () => window.removeEventListener('keydown', cancel);
  }, [placing, selected]);
  function placementError(source: Placement) {
    if (!game || game.winner !== null || game.players[0].health <= 0) return 'No active match';
    if (game.active !== 0 || game.pending) return 'Wait for your turn and finish priority first';
    const p = game.players[0];
    if (p.board.length >= 7) return 'Your battlefield is full';
    if (!supported(source.card)) return 'This card effect is not implemented';
    if (source.command && p.zone !== 'command') return 'Commander is not in the command zone';
    const cost = source.command
      ? commandCost(p)
      : Math.max(0, source.card.cost - p.reduction - p.handReduction);
    return p.mana < cost ? 'Not enough regular mana' : '';
  }
  function choosePlacement(source: Placement) {
    if (suppressCardClick.current) return;
    const error = placementError(source);
    if (error) {
      setToast(error);
      return;
    }
    setPlacing(source);
    setSelected(undefined);
  }
  function commitPlacement(source: Placement, position: number) {
    dispatch({
      type: 'cast',
      p: 0,
      index: source.index,
      command: source.command,
      position,
      target,
    });
    cancelPlacement();
  }
  function positionAt(x: number, y: number): number | null {
    const element = document.elementFromPoint(x, y);
    const zone = element?.closest<HTMLElement>('[data-placement-index]');
    if (zone) return Number(zone.dataset.placementIndex);
    const board = element?.closest<HTMLElement>('[data-local-board]');
    if (!board) return null;
    const units = [...board.querySelectorAll<HTMLElement>('.unit')];
    const index = units.findIndex((unit) => {
      const bounds = unit.getBoundingClientRect();
      return x < bounds.left + bounds.width / 2;
    });
    return index < 0 ? units.length : index;
  }
  function placementHandlers(source: Placement): PointerHandlers {
    return {
      onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
        if (event.button !== 0 || placementError(source)) return;
        dragSession.current = { source, x: event.clientX, y: event.clientY, moved: false };
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
        const session = dragSession.current;
        if (!session) return;
        if (!session.moved && Math.hypot(event.clientX - session.x, event.clientY - session.y) < 6)
          return;
        session.moved = true;
        event.preventDefault();
        setPlacing(session.source);
        setDragPreview({ card: session.source.card, x: event.clientX, y: event.clientY });
        setHoverPosition(positionAt(event.clientX, event.clientY));
      },
      onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
        const session = dragSession.current;
        dragSession.current = null;
        if (!session?.moved) return;
        suppressCardClick.current = true;
        window.setTimeout(() => {
          suppressCardClick.current = false;
        }, 0);
        const position = positionAt(event.clientX, event.clientY);
        if (position !== null) commitPlacement(session.source, position);
        else cancelPlacement();
      },
      onPointerCancel: cancelPlacement,
    };
  }
  useEffect(() => {
    loadCollection()
      .then(setCards)
      .catch((e) => setLoadError(String(e)));
    if (db) {
      db.auth.getSession().then(({ data }) => setSession(!!data.session));
      const { data } = db.auth.onAuthStateChange((_e, s) => setSession(!!s));
      return () => data.subscription.unsubscribe();
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('hc:deck:v1', JSON.stringify(deck));
  }, [deck]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const query = useDeferredValue(search);
  const map = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  // An absent override follows the deck; an empty string explicitly shows all classes.
  const classFilter = filters.class ?? deck.class;
  const filtered = useMemo(
    () =>
      cards.filter(
        (c) =>
          (!query || `${c.name} ${clean(c.text)}`.toLowerCase().includes(query.toLowerCase())) &&
          (!onlySupported || supported(c)) &&
          Object.entries({ ...filters, class: classFilter }).every(
            ([k, v]) =>
              !v ||
              (k === 'class'
                ? eligibleClass(c, v)
                : k === 'cost'
                  ? v === '7+'
                    ? c.cost >= 7
                    : c.cost === Number(v)
                  : k === 'tribe'
                    ? (c.races ?? [c.race]).includes(v)
                    : k === 'mechanic'
                      ? c.mechanics?.includes(v)
                      : String(c[k as keyof Card]) === v),
          ),
      ),
    [cards, query, filters, classFilter, onlySupported],
  );
  const errors = useMemo(() => validateDeck(deck, cards), [deck, cards]);
  const deckCards = deck.cards.map((id) => map.get(id)).filter((c): c is Card => !!c);
  const commander = map.get(deck.commander ?? '');
  const attackingUnit = game?.players[0].board.find((unit) => unit.uid === selected);
  const targetUnit =
    target.uid === undefined
      ? undefined
      : game?.players[target.p].board.find((unit) => unit.uid === target.uid);
  const targetLabel = targetUnit
    ? `${game?.players[target.p].name}'s ${targetUnit.card.name} (${targetUnit.health}/${targetUnit.maxHealth} HP)`
    : `${game?.players[target.p].name ?? 'Opponent'}'s hero`;
  const selectedAttackError =
    game && selected !== undefined
      ? attackError(game, 0, selected, target)
      : 'Select a ready friendly minion first';
  function chooseAttacker(uid: number) {
    if (!game) return;
    const unit = game.players[0].board.find((u) => u.uid === uid);
    const reason = attackReadinessError(game, 0, uid);
    if (reason) {
      setToast(`${unit?.card.name ?? 'This minion'} cannot attack: ${reason}`);
      return;
    }
    cancelPlacement();
    setSelected((current) => (current === uid ? undefined : uid));
  }
  function chooseTargetOrAttack(next: Target) {
    if (!game || selected === undefined || next.p === 0) {
      setTarget(next);
      return;
    }
    const error = attackError(game, 0, selected, next);
    if (error) {
      setToast(error);
      return;
    }
    const resolved = dispatch({ type: 'attack', p: 0, uid: selected, target: next });
    if (resolved)
      setTarget(
        next.uid !== undefined && !resolved.players[next.p].board.some((u) => u.uid === next.uid)
          ? { p: next.p }
          : next,
      );
  }
  const selectedNames = new Set(
    [...deckCards, ...(commander ? [commander] : [])].map((card) => card.name),
  );
  const unique = (k: 'set' | 'rarity' | 'type') => [...new Set(cards.map((c) => c[k]))].sort();
  const filter = (k: string, v: string) => {
    setFilters((f) => {
      const next = { ...f, [k]: v };
      if (k === 'class' && v === deck.class) delete next.class;
      return next;
    });
    setPage(0);
  };
  function add(c: Card, command = false) {
    if (!eligibleClass(c, deck.class)) {
      setToast('This card does not match your chosen class.');
      return;
    }
    if (c.wildLegal === false) {
      setToast('This card is not Wild legal.');
      return;
    }
    if (command) {
      if (c.type !== 'MINION' || c.rarity !== 'LEGENDARY') {
        setToast('Choose a legendary minion.');
        return;
      }
      setDeck((d) => ({
        ...d,
        commander: c.id,
        cards: d.cards.filter((id) => map.get(id)?.name !== c.name),
      }));
    } else {
      if (deck.cards.length >= 100) {
        setToast('Your deck is full.');
        return;
      }
      if (
        [...deck.cards, ...(deck.commander ? [deck.commander] : [])].some(
          (id) => map.get(id)?.name === c.name,
        )
      ) {
        setToast('Singleton: this card is already in your deck.');
        return;
      }
      setDeck((d) => ({ ...d, cards: [...d.cards, c.id] }));
    }
    setInspect(null);
  }
  async function save() {
    try {
      let d = deck;
      if (session) d = await saveCloud(d);
      setDeck(d);
      const next = [...saved.filter((x) => x.name !== d.name), d];
      setSaved(next);
      localStorage.setItem('hc:saved:v1', JSON.stringify(next));
      setToast(session ? 'Saved to Supabase and this browser.' : 'Draft saved in this browser.');
    } catch (e) {
      setToast(String(e));
    }
  }
  function start(useDeck = false) {
    try {
      if (
        useDeck &&
        (errors.length ||
          deckCards.some((c) => !supported(c)) ||
          !commander ||
          !supported(commander))
      )
        throw Error(
          'A verified 100-card deck with supported effects is required. Use the starter sandbox while building.',
        );
      const s = createGame(
        cards,
        42,
        useDeck ? deckCards : undefined,
        useDeck ? commander : undefined,
        useDeck ? deck.class : 'HUNTER',
      );
      setGame(s);
      record.current = { version: 1, initial: structuredClone(s), actions: [] };
      setTab('table');
      setSelected(undefined);
      cancelPlacement();
    } catch (e) {
      setToast(String(e));
    }
  }
  function dispatch(a: Action | DebugAction) {
    if (!game) return;
    try {
      const n = ['edit', 'add', 'summon', 'advance'].includes(a.type)
        ? debugAction(game, a as DebugAction)
        : applyAction(game, a as Action);
      record.current?.actions.push(a);
      setGame(n);
      if (
        target.uid !== undefined &&
        !n.players[target.p].board.some((unit) => unit.uid === target.uid)
      )
        setTarget({ p: target.p });
      setSelected(undefined);
      cancelPlacement();
      return n;
    } catch (e) {
      setToast((e as Error).message);
    }
  }
  useEffect(() => {
    if (!game || game.winner !== null || paused) return;
    const actor = game.pending?.queue[0] ?? game.active;
    if (actor === 0) return;
    const t = setTimeout(() => {
      const action = botAction(game);
      if (action) {
        try {
          const n = applyAction(game, action);
          record.current?.actions.push(action);
          setGame(n);
        } catch {
          const fallback: Action = game.pending
            ? { type: 'pass', p: actor }
            : { type: 'end', p: actor };
          record.current?.actions.push(fallback);
          setGame(applyAction(game, fallback));
        }
      }
    }, 850);
    return () => clearTimeout(t);
  }, [game, paused]);
  useEffect(() => {
    if (!game?.pending) {
      setRemaining(timer);
      return;
    }
    setRemaining(timer);
    if (paused) return;
    const t = setInterval(() => setRemaining((v) => Math.max(0, v - 1)), 1000);
    const end = setTimeout(
      () => dispatch({ type: 'pass', p: game.pending!.queue[0] }),
      timer * 1000,
    );
    return () => {
      clearInterval(t);
      clearTimeout(end);
    };
  }, [game?.pending, timer, paused]);
  const menu = [
    { id: 'collection', icon: BookOpen, label: 'Collection' },
    { id: 'table', icon: Swords, label: 'Play table' },
    { id: 'lab', icon: FlaskConical, label: 'Testing lab' },
  ];
  return (
    <div className="app">
      <aside className="rail">
        <a
          className="brand-mark"
          href="#"
          aria-label="Hearthstone Commander home"
          onClick={() => setTab('collection')}
        >
          ✺
        </a>
        <div className="rail-nav">
          {menu.map((m) => (
            <button
              key={m.id}
              className={tab === m.id ? 'active' : ''}
              onClick={() => setTab(m.id)}
              title={m.label}
            >
              <m.icon size={21} />
              <span>{m.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
        <button
          className="settings"
          onClick={() => setShowSettings(true)}
          title="Connection settings"
        >
          <Settings size={21} />
        </button>
        <span className="rail-version">0.1</span>
      </aside>
      <div className="workspace">
        <header>
          <div className="wordmark">
            HEARTHSTONE <span>COMMANDER</span>
            <b>ALPHA 0.1</b>
          </div>
          <div className="header-right">
            <span className="connection">
              <i />
              {session ? 'HSC · signed in' : db ? 'HSC · guest' : 'Local workspace'}
            </span>
            <button className="avatar" onClick={() => setShowSettings(true)}>
              HC
            </button>
          </div>
        </header>
        <div className="topline">
          <span>THE COMMANDER’S TAVERN</span>
          <span>FOUR PLAYERS. ONE VICTOR.</span>
        </div>
        {tab === 'collection' ? (
          <>
            <section className="intro">
              <div>
                <div className="eyebrow">YOUR NEXT GREAT DECK STARTS HERE</div>
                <h1>
                  A whole world of <em>Wild.</em>
                </h1>
                <p>Find your commander. Forge a hundred-card story. Claim the table.</p>
              </div>
              <div className="collection-stat">
                <span>{cards.length.toLocaleString()}</span>
                <small>COLLECTIBLE RECORDS</small>
                <div>✦ All eras, endless possibilities</div>
              </div>
            </section>
            <main className="builder">
              <section className="collection">
                <div className="section-heading">
                  <h2>
                    Card collection <span>WILD CANDIDATES</span>
                  </h2>
                  <button
                    className="text-button"
                    onClick={() => {
                      setFilters({});
                      setSearch('');
                      setOnlySupported(false);
                      setPage(0);
                    }}
                  >
                    Reset filters
                  </button>
                </div>
                <div className="search-wrap">
                  <Search size={18} />
                  <input
                    placeholder="Search cards by name or rules text…"
                    aria-label="Search cards"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(0);
                    }}
                  />
                  <kbd>⌕</kbd>
                </div>
                <div className="filter-row">
                  {[
                    ['class', 'All classes', classes],
                    ['set', 'All sets', unique('set')],
                    ['rarity', 'Any rarity', unique('rarity')],
                    ['type', 'Card type', unique('type')],
                    [
                      'tribe',
                      'All tribes',
                      [
                        ...new Set(cards.flatMap((c) => c.races ?? (c.race ? [c.race] : []))),
                      ].sort(),
                    ],
                    [
                      'mechanic',
                      'Mechanics',
                      [...new Set(cards.flatMap((c) => c.mechanics ?? []))].sort(),
                    ],
                  ].map(([k, label, values]) => (
                    <select
                      key={k as string}
                      aria-label={label as string}
                      value={k === 'class' ? classFilter : (filters[k as string] ?? '')}
                      onChange={(e) => filter(k as string, e.target.value)}
                    >
                      <option value="">{label as string}</option>
                      {(values as string[]).map((v) => (
                        <option key={v} value={v}>
                          {pretty(v)}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
                <div className="class-filter-hint">
                  <span>
                    {classFilter ? `${pretty(classFilter)} + Neutral cards` : 'Showing all classes'}
                  </span>
                  {classFilter ? (
                    <button onClick={() => filter('class', '')} aria-label="Clear class filter">
                      <X size={12} /> Clear class filter
                    </button>
                  ) : null}
                  {filters.class !== undefined ? (
                    <button onClick={() => filter('class', deck.class)}>Follow deck class</button>
                  ) : null}
                </div>
                <div className="cost-row">
                  <span>MANA COST</span>
                  <button
                    className={!filters.cost ? 'active' : ''}
                    onClick={() => filter('cost', '')}
                  >
                    All
                  </button>
                  {['0', '1', '2', '3', '4', '5', '6', '7+'].map((v) => (
                    <button
                      className={filters.cost === v ? 'active' : ''}
                      key={v}
                      onClick={() => filter('cost', filters.cost === v ? '' : v)}
                    >
                      {v}
                    </button>
                  ))}
                  <label>
                    <input
                      type="checkbox"
                      checked={onlySupported}
                      onChange={(e) => {
                        setOnlySupported(e.target.checked);
                        setPage(0);
                      }}
                    />{' '}
                    Supported effects
                  </label>
                </div>
                <div className="results-bar">
                  <span>
                    {filtered.length.toLocaleString()} cards{' '}
                    <i>· Click artwork to inspect · + to add</i>
                  </span>
                  <span>
                    Sorted by <b>Mana cost ↑</b>
                  </span>
                </div>
                <div className="legality-note">
                  <Shield size={14} /> Wild legality pending authoritative Blizzard verification.
                  Draft building is available.
                </div>
                {loadError ? (
                  <p role="alert">{loadError}</p>
                ) : !cards.length ? (
                  <div className="empty-state">Opening the archives…</div>
                ) : (
                  <div className="card-grid">
                    {[...filtered]
                      .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name))
                      .slice(page * 18, page * 18 + 18)
                      .map((c) => {
                        const added = selectedNames.has(c.name);
                        const unavailable = !eligibleClass(c, deck.class)
                          ? 'Other class'
                          : c.wildLegal === false
                            ? 'Not Wild legal'
                            : deck.cards.length >= 100
                              ? 'Deck full'
                              : '';
                        return (
                          <div className="collection-card" key={c.id}>
                            <CardArt card={c} selected={added} onClick={() => setInspect(c)} />
                            <button
                              className={`quick-add ${added ? 'added' : ''}`}
                              aria-label={
                                added ? `${c.name} already in deck` : `Add ${c.name} to deck`
                              }
                              disabled={added || !!unavailable}
                              title={
                                added
                                  ? 'Singleton: already in deck or command zone'
                                  : unavailable || `Add ${c.name} without inspecting`
                              }
                              onClick={() => add(c)}
                            >
                              {added ? <Check size={13} /> : <Plus size={13} />}
                              {added ? 'Added' : unavailable || 'Add to deck'}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
                {!filtered.length && cards.length > 0 ? (
                  <div className="empty-state">
                    No cards found. Try another search or reset the filters.
                  </div>
                ) : null}
                <div className="pagination">
                  <span>
                    Page {page + 1} of {Math.max(1, Math.ceil(filtered.length / 18))}
                  </span>
                  <div>
                    <button
                      disabled={!page}
                      onClick={() => setPage((p) => p - 1)}
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      disabled={(page + 1) * 18 >= filtered.length}
                      onClick={() => setPage((p) => p + 1)}
                      aria-label="Next page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </section>
              <aside className="deck-panel">
                <div className="deck-top">
                  <div className="eyebrow">THE WAR ROOM</div>
                  <h2>
                    Your deck <Layers size={19} />
                  </h2>
                  <input
                    className="deck-name"
                    aria-label="Deck name"
                    maxLength={100}
                    value={deck.name}
                    onChange={(e) => setDeck((d) => ({ ...d, name: e.target.value }))}
                  />
                  <div className="class-choice">
                    <span>DECK CLASS</span>
                    <select
                      aria-label="Deck class"
                      value={deck.class}
                      onChange={(e) => {
                        setDeck((d) => ({ ...d, class: e.target.value }));
                        setPage(0);
                      }}
                    >
                      {classes.map((c) => (
                        <option key={c} value={c}>
                          {pretty(c)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="commander-box">
                  <Crown size={20} />
                  {commander ? (
                    <>
                      <button onClick={() => setInspect(commander)}>
                        <strong>{commander.name}</strong>
                        <small>Your commander · {commander.cost} mana</small>
                      </button>
                      <button
                        className="icon-button"
                        title="Remove commander"
                        onClick={() => setDeck((d) => ({ ...d, commander: null }))}
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <div>
                      <strong>Choose your commander</strong>
                      <small>Any eligible legendary minion</small>
                    </div>
                  )}
                  <button
                    className="commander-find"
                    title="Find legendary minions"
                    onClick={() => {
                      setFilters({ rarity: 'LEGENDARY', type: 'MINION' });
                      setPage(0);
                    }}
                  >
                    +
                  </button>
                </div>
                <div className="deck-count">
                  <span>MAIN DECK</span>
                  <strong>
                    {deck.cards.length}
                    <small> / 100</small>
                  </strong>
                </div>
                <div className="progress">
                  <div style={{ width: `${deck.cards.length}%` }} />
                </div>
                <div className="deck-list">
                  {deckCards.length ? (
                    deckCards
                      .sort((a, b) => a.cost - b.cost)
                      .map((c) => (
                        <div className="deck-row" key={c.id}>
                          <b>{c.cost}</b>
                          <button onClick={() => setInspect(c)}>{c.name}</button>
                          <button
                            title={`Remove ${c.name}`}
                            onClick={() =>
                              setDeck((d) => ({ ...d, cards: d.cards.filter((id) => id !== c.id) }))
                            }
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))
                  ) : (
                    <div className="deck-empty">
                      <div>✧</div>
                      <strong>Every legend starts somewhere.</strong>
                      <p>
                        Add cards from the collection
                        <br />
                        to begin your expedition.
                      </p>
                    </div>
                  )}
                </div>
                <div className="curve">
                  <span>MANA CURVE</span>
                  <div className="bars">
                    {Array.from({ length: 8 }, (_, i) => {
                      const count = deckCards.filter((c) => Math.min(c.cost, 7) === i).length;
                      return (
                        <div key={i} title={`${i}: ${count} cards`}>
                          <b>{count || ''}</b>
                          <i style={{ height: `${Math.max(3, Math.min(50, count * 4))}px` }} />
                          <small>{i === 7 ? '7+' : i}</small>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="distribution">
                  {['MINION', 'SPELL', 'WEAPON'].map((t) => (
                    <span key={t}>
                      {pretty(t)}s <b>{deckCards.filter((c) => c.type === t).length}</b>
                    </span>
                  ))}
                  <span>
                    Neutral <b>{deckCards.filter((c) => c.cardClass === 'NEUTRAL').length}</b>
                  </span>
                </div>
                <details className="validation">
                  <summary>
                    {errors.length ? (
                      <>
                        <Shield size={14} /> Draft · {errors.length} validation notes
                      </>
                    ) : (
                      <>
                        <Check size={14} /> Deck is valid
                      </>
                    )}
                  </summary>
                  {errors.map((e) => (
                    <p key={e}>{e}</p>
                  ))}
                  <p>
                    {deckCards.filter((c) => !supported(c)).length} cards have unsupported gameplay
                    effects.
                  </p>
                </details>
                <div className="deck-actions">
                  <button className="gold-button" onClick={save}>
                    <Save size={16} /> Save deck
                  </button>
                  <button
                    title="Load saved deck"
                    onClick={async () => {
                      try {
                        if (session) setSaved(await loadCloud());
                        setShowSaved(true);
                      } catch (e) {
                        setToast(String(e));
                      }
                    }}
                  >
                    <BookOpen size={16} />
                  </button>
                  <button title="Export deck" onClick={() => download('commander-deck.json', deck)}>
                    <Download size={16} />
                  </button>
                  <button title="Import deck" onClick={() => upload.current?.click()}>
                    <Upload size={16} />
                  </button>
                </div>
                <button className="play-deck" onClick={() => start(true)}>
                  Take this deck to the table <ArrowRight size={15} />
                </button>
                <small className="draft-foot">100 singleton cards + 1 commander</small>
              </aside>
            </main>
          </>
        ) : null}
        {tab === 'table' || tab === 'lab' ? (
          <>
            <section className="play-intro">
              <div>
                <div className="eyebrow">
                  {tab === 'lab' ? 'DEVELOPER SANDBOX' : 'PULL UP A CHAIR'}
                </div>
                <h1>{tab === 'lab' ? 'The testing lab.' : 'The command table.'}</h1>
                <p>Clockwise turns · 40 health · 3 reserve · last player standing</p>
              </div>
              <div className="play-controls">
                <button onClick={() => setPaused((p) => !p)}>
                  {paused ? 'Resume bots' : 'Pause bots'}
                </button>
                <button className="gold-button" onClick={() => start()}>
                  <RotateCcw size={15} /> New starter game
                </button>
              </div>
            </section>
            {!game ? (
              <div className="start-panel">
                <Swords size={44} />
                <h2>Four heroes. A fresh battlefield.</h2>
                <p>
                  Start a local test match against three scripted opponents.
                  <br />
                  The starter pool uses cards with supported effects.
                </p>
                <button className="gold-button" disabled={!cards.length} onClick={() => start()}>
                  Start a match <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="game-layout">
                <section className="table">
                  <div className="turn-strip">
                    {[0, 1, 2, 3].map((i) => (
                      <span className={game.active === i ? 'current' : ''} key={i}>
                        {i + 1}. {game.players[i].name}
                        {game.players[i].health <= 0 ? ' †' : ''} <ArrowRight size={11} />
                      </span>
                    ))}
                    <b>TURN {game.turn}</b>
                  </div>
                  <div className="battlefield">
                    {[2, 1, 3, 0].map((i) => {
                      const p = game.players[i];
                      return (
                        <section
                          key={i}
                          className={`player player-${i} ${game.active === i ? 'on-turn' : ''} ${p.health <= 0 ? 'eliminated' : ''}`}
                        >
                          <div className="player-heading">
                            <button
                              className={`hero ${target.p === i && target.uid === undefined ? 'targeted' : ''} ${selected !== undefined && i !== 0 ? (attackError(game, 0, selected, { p: i }) ? 'attack-blocked' : 'attackable') : ''}`}
                              aria-label={`${p.name}'s hero, ${p.health} health`}
                              title={
                                selected !== undefined && i !== 0
                                  ? (attackError(game, 0, selected, { p: i }) ??
                                    `Attack ${p.name}'s hero`)
                                  : `Select ${p.name}'s hero as target`
                              }
                              onClick={() => chooseTargetOrAttack({ p: i })}
                              onContextMenu={(event) => {
                                event.preventDefault();
                                setTarget({ p: i });
                              }}
                            >
                              <span>{['✦', '♜', '❖', '☽'][i]}</span>
                              <b>
                                {p.health}
                                <small>♥</small>
                              </b>
                            </button>
                            <div>
                              <h3>
                                {p.name} <small>{i === 0 ? 'YOU' : 'BOT'}</small>
                              </h3>
                              <p>
                                {pretty(p.class)} · {p.hand.length} in hand · {p.deck.length} in
                                deck
                              </p>
                              <div className="resources">
                                <span>
                                  ◆ {p.mana}/{p.maxMana}
                                </span>
                                <span className="reserve">◈ {p.reserve}/3</span>
                                {p.armor > 0 ? <span>🛡 {p.armor}</span> : null}
                              </div>
                            </div>
                            <button
                              className="zone"
                              {...(i === 0
                                ? placementHandlers({ card: p.commander, command: true })
                                : {})}
                              style={i === 0 ? { touchAction: 'none' } : undefined}
                              title={`${p.commander.name} · ${p.zone} · ${p.casts} successful command casts`}
                              onClick={() =>
                                i === 0
                                  ? choosePlacement({ card: p.commander, command: true })
                                  : setInspect(p.commander)
                              }
                            >
                              <Crown size={15} />
                              <span>
                                {p.commander.name}
                                <small>
                                  {p.zone === 'command'
                                    ? `${commandCost(p)} mana · command zone`
                                    : p.zone}
                                </small>
                              </span>
                            </button>
                          </div>
                          <div
                            data-local-board={i === 0 ? '' : undefined}
                            className={`board-slots ${p.board.length ? 'occupied' : ''} ${i === 0 && placing && !game.pending ? 'choosing-placement' : ''}`}
                          >
                            {Array.from({ length: 7 }, (_, j) => {
                              const u = p.board[j];
                              const readiness =
                                u && i === 0 ? attackReadinessError(game, i, u.uid) : null;
                              const canAttack =
                                !!u &&
                                i === 0 &&
                                !readiness &&
                                game.players.some(
                                  (enemy, opponent) =>
                                    opponent !== i &&
                                    enemy.health > 0 &&
                                    [
                                      { p: opponent },
                                      ...enemy.board.map((unit) => ({
                                        p: opponent,
                                        uid: unit.uid,
                                      })),
                                    ].some((candidate) => !attackError(game, i, u.uid, candidate)),
                                );
                              const attackStatus =
                                readiness ??
                                (canAttack
                                  ? `${u?.rushOnly ? 'Rush: minions only' : 'Ready to attack'} · ${u?.attacksRemaining} attack${u?.attacksRemaining === 1 ? '' : 's'} left`
                                  : 'No legal attack targets');
                              const attackLabel = canAttack
                                ? u?.rushOnly
                                  ? 'Rush'
                                  : 'Ready'
                                : readiness === 'Summoning sickness'
                                  ? 'Sleep'
                                  : readiness === 'No attacks left this turn'
                                    ? 'Spent'
                                    : readiness === 'This character has no attack'
                                      ? '0 ATK'
                                      : readiness === 'Not your turn'
                                        ? 'Wait'
                                        : game.pending
                                          ? 'Priority'
                                          : game.winner !== null
                                            ? 'Over'
                                            : 'No target';
                              return (
                                <Fragment key={u?.uid ?? `empty-${j}`}>
                                  {i === 0 &&
                                  placing &&
                                  game.active === 0 &&
                                  !game.pending &&
                                  p.board.length < 7 &&
                                  j <= p.board.length ? (
                                    <button
                                      className={`placement-gap ${hoverPosition === j ? 'hovered' : ''}`}
                                      data-placement-index={j}
                                      aria-label={`Place ${placing.card.name} at position ${j + 1}`}
                                      title={
                                        j === p.board.length
                                          ? 'Place at the end'
                                          : `Place before ${p.board[j].card.name}`
                                      }
                                      onClick={() => commitPlacement(placing, j)}
                                    >
                                      <Plus size={14} />
                                    </button>
                                  ) : null}
                                  {u ? (
                                    <button
                                      key={u.uid}
                                      className={`unit ${selected === u.uid ? 'selected' : ''} ${i === 0 ? (canAttack ? 'can-attack' : 'cannot-attack') : ''} ${target.uid === u.uid ? 'targeted' : ''} ${u.health < u.maxHealth ? 'damaged' : ''} ${u.card.mechanics?.includes('TAUNT') ? 'taunt' : ''} ${selected !== undefined && i !== 0 ? (attackError(game, 0, selected, { p: i, uid: u.uid }) ? 'attack-blocked' : 'attackable') : ''}`}
                                      aria-label={`${p.name}'s ${u.card.name}, minion ${j + 1}, ${u.attack} attack, ${u.health} of ${u.maxHealth} health${u.card.mechanics?.includes('TAUNT') ? ', Taunt' : ''}${i === 0 ? `, ${attackStatus}` : ''}`}
                                      title={`${u.card.name} · ${i === 0 ? `${attackStatus} · ` : ''}${u.health}/${u.maxHealth} health · ${Math.max(0, u.maxHealth - u.health)} damage taken · ${clean(u.card.text)}${selected !== undefined && i !== 0 ? ` · ${attackError(game, 0, selected, { p: i, uid: u.uid }) ?? 'Click to attack this minion'}` : ''}`}
                                      onClick={() =>
                                        i === 0
                                          ? chooseAttacker(u.uid)
                                          : chooseTargetOrAttack({ p: i, uid: u.uid })
                                      }
                                      onContextMenu={(e) => {
                                        e.preventDefault();
                                        setTarget({ p: i, uid: u.uid });
                                      }}
                                    >
                                      <img
                                        src={image(u.card)}
                                        alt={u.card.name}
                                        draggable={false}
                                      />
                                      {i === 0 ? (
                                        <small className="attack-status" title={attackStatus}>
                                          {canAttack ? '⚔ ' : ''}
                                          {attackLabel}
                                        </small>
                                      ) : null}
                                      <span>
                                        <span>{u.attack} ⚔</span>{' '}
                                        <span className="minion-health">
                                          {u.health}/{u.maxHealth} ♥
                                        </span>
                                        {u.shield ? ' ◇' : ''}
                                      </span>
                                      {u.card.mechanics?.includes('TAUNT') ? (
                                        <small className="taunt-label">Taunt</small>
                                      ) : null}
                                      {u.health < u.maxHealth ? (
                                        <small
                                          className="damage-badge"
                                          title={`${u.maxHealth - u.health} damage taken`}
                                        >
                                          −{u.maxHealth - u.health}
                                        </small>
                                      ) : null}
                                    </button>
                                  ) : (
                                    <div className="slot" key={j}>
                                      {j + 1}
                                    </div>
                                  )}
                                </Fragment>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                    <div className="table-center">
                      <span>✺</span>
                      <small>
                        HEARTHSTONE
                        <br />
                        COMMANDER
                      </small>
                    </div>
                  </div>
                  {placing && !game.pending ? (
                    <div className="placement-instructions" role="status">
                      <span>
                        Place <b>{placing.card.name}</b>: release or click a + between minions.
                      </span>
                      <button onClick={cancelPlacement}>
                        Cancel <small>Esc</small>
                      </button>
                    </div>
                  ) : null}
                  {attackingUnit ? (
                    <div className="placement-instructions combat-instructions" role="status">
                      <span>
                        <b>{attackingUnit.card.name}</b> selected. Click a highlighted enemy minion
                        or hero to attack. Taunt protects only its owner's board.
                      </span>
                      <button onClick={() => setSelected(undefined)}>
                        Cancel <small>Esc</small>
                      </button>
                    </div>
                  ) : null}
                  <div className="battle-controls">
                    <span>
                      Target: <b>{targetLabel}</b>
                    </span>
                    <button
                      disabled={!!selectedAttackError}
                      title={selectedAttackError ?? `Attack ${targetLabel}`}
                      onClick={() => dispatch({ type: 'attack', p: 0, uid: selected, target })}
                    >
                      Attack selected target
                    </button>
                    <button
                      disabled={game.active !== 0 || !!game.pending}
                      onClick={() => dispatch({ type: 'power', p: 0, target })}
                    >
                      Hero power · 2 ◆
                    </button>
                    <button
                      className="gold-button"
                      disabled={game.active !== 0 || !!game.pending || game.winner !== null}
                      onClick={() => dispatch({ type: 'end', p: 0 })}
                    >
                      End turn <ArrowRight size={15} />
                    </button>
                  </div>
                  {game.pending ? (
                    <div className="priority">
                      <Shield size={22} />
                      <div>
                        <b>
                          {game.players[game.pending.caster].name} is casting{' '}
                          {game.pending.card.name}
                        </b>
                        <p>
                          Clockwise priority → {game.players[game.pending.queue[0]].name} ·{' '}
                          {remaining}s
                        </p>
                      </div>
                      <button
                        className="gold-button"
                        disabled={game.pending.queue[0] !== 0 && tab !== 'lab'}
                        onClick={() => dispatch({ type: 'interrupt', p: game.pending!.queue[0] })}
                      >
                        Interrupt · 3 ◈
                      </button>
                      <button
                        disabled={game.pending.queue[0] !== 0 && tab !== 'lab'}
                        onClick={() => dispatch({ type: 'pass', p: game.pending!.queue[0] })}
                      >
                        Pass
                      </button>
                    </div>
                  ) : null}
                  {game.winner !== null ? (
                    <div className="priority">
                      <Crown />
                      {game.winner === -1
                        ? 'Draw'
                        : `${game.players[game.winner].name} wins the match!`}
                    </div>
                  ) : null}
                  <div className="hand">
                    <div className="hand-title">
                      YOUR HAND{' '}
                      <span>
                        Drag minions onto your board, or click one then a + position. Spells use
                        your selected target.
                      </span>
                    </div>
                    <div>
                      {game.players[0].hand.map((c, i) => (
                        <CardArt
                          key={`${c.id}-${i}`}
                          card={c}
                          selected={!!placing && !placing.command && placing.index === i}
                          pointerHandlers={
                            c.type === 'MINION'
                              ? placementHandlers({ card: c, index: i })
                              : undefined
                          }
                          onClick={() =>
                            c.type === 'MINION'
                              ? choosePlacement({ card: c, index: i })
                              : dispatch({ type: 'cast', p: 0, index: i, target })
                          }
                        />
                      ))}
                    </div>
                  </div>
                </section>
                <aside className="history">
                  <h3>
                    <ScrollText size={17} /> Action history
                  </h3>
                  <p>Deterministic local session · seed 42</p>
                  <div>
                    {game.log
                      .slice()
                      .reverse()
                      .map((l, i) => (
                        <p key={i}>{l}</p>
                      ))}
                  </div>
                  <button onClick={() => download('commander-scenario.json', record.current)}>
                    Export replay
                  </button>
                  <button onClick={() => replayUpload.current?.click()}>
                    Load deterministic replay
                  </button>
                </aside>
              </div>
            )}
            {tab === 'lab' && game ? (
              <section className="lab-panel">
                <h2>
                  <FlaskConical size={20} /> Scenario controls
                </h2>
                <p>
                  Debug actions are local only and are included in scenario replays. Right-click any
                  minion to target it.
                </p>
                <div className="lab-controls">
                  <select
                    aria-label="Debug player"
                    value={devPlayer}
                    onChange={(e) => setDevPlayer(Number(e.target.value))}
                  >
                    {game.players.map((p, i) => (
                      <option key={i} value={i}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Debug field"
                    value={devField}
                    onChange={(e) => setDevField(e.target.value as typeof devField)}
                  >
                    {['health', 'mana', 'reserve', 'casts', 'reduction', 'handReduction'].map(
                      (f) => (
                        <option key={f}>{f}</option>
                      ),
                    )}
                  </select>
                  <input
                    aria-label="Debug value"
                    type="number"
                    value={devValue}
                    onChange={(e) => setDevValue(Number(e.target.value))}
                  />
                  <button
                    onClick={() =>
                      dispatch({ type: 'edit', p: devPlayer, field: devField, value: devValue })
                    }
                  >
                    Apply value
                  </button>
                  <button
                    onClick={() =>
                      dispatch({ type: 'edit', p: devPlayer, field: 'health', value: 0 })
                    }
                  >
                    Eliminate player
                  </button>
                  <button onClick={() => dispatch({ type: 'advance' })}>Advance turn</button>
                  <select
                    aria-label="Commander destination"
                    value={
                      game.players[devPlayer].zone === 'board'
                        ? 'command'
                        : game.players[devPlayer].zone
                    }
                    onChange={(e) =>
                      dispatch({
                        type: 'commander-destination',
                        p: devPlayer,
                        destination: e.target.value as 'hand' | 'command' | 'grave',
                      })
                    }
                  >
                    {['command', 'hand', 'grave'].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="lab-controls">
                  <input
                    placeholder="Search any imported card…"
                    aria-label="Debug card search"
                    value={devCard}
                    onChange={(e) => setDevCard(e.target.value)}
                  />
                  <select aria-label="Debug card" id="debug-card">
                    {cards
                      .filter((c) => c.name.toLowerCase().includes(devCard.toLowerCase()))
                      .slice(0, 150)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.id})
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => {
                      const c = map.get(
                        (document.getElementById('debug-card') as HTMLSelectElement).value,
                      );
                      if (c) dispatch({ type: 'add', p: devPlayer, card: c });
                    }}
                  >
                    Add to hand
                  </button>
                  <button
                    onClick={() => {
                      const c = map.get(
                        (document.getElementById('debug-card') as HTMLSelectElement).value,
                      );
                      if (c) dispatch({ type: 'summon', p: devPlayer, card: c });
                    }}
                  >
                    Put on battlefield
                  </button>
                  <label>
                    Priority timer{' '}
                    <input
                      aria-label="Decision timer seconds"
                      type="number"
                      min={1}
                      max={120}
                      value={timer}
                      onChange={(e) => setTimer(Math.max(1, Math.min(120, Number(e.target.value))))}
                    />{' '}
                    s
                  </label>
                </div>
                <p>
                  To trigger priority: pause bots, give an opponent 3 reserve, then cast a supported
                  card. Use the visible Pass or Interrupt controls.
                </p>
              </section>
            ) : null}
          </>
        ) : null}
        <footer>
          <span>✦ A noncommercial fan prototype. Card content © Blizzard Entertainment.</span>
          <span>BUILT FOR THE TABLE · ALPHA 0.1</span>
        </footer>
      </div>
      {inspect ? (
        <div className="overlay" onClick={() => setInspect(null)}>
          <section className="inspect-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" title="Close card preview" onClick={() => setInspect(null)}>
              <X />
            </button>
            <img src={image(inspect)} alt={inspect.name} />
            <div>
              <div className="eyebrow">
                {pretty(inspect.set)} · {pretty(inspect.rarity)}
              </div>
              <h2>{inspect.name}</h2>
              <p>{clean(inspect.text) || 'A minion with no additional abilities.'}</p>
              <div className="stat-pills">
                <span>{inspect.cost} mana</span>
                {inspect.attack !== undefined ? (
                  <span>
                    {inspect.attack} attack / {inspect.health} health
                  </span>
                ) : null}
                <span>{pretty(inspect.type)}</span>
              </div>
              <p className="muted">
                {inspect.classes?.join(' / ') ?? inspect.cardClass} · {inspect.id} · DBF{' '}
                {inspect.dbfId}
              </p>
              <div className="status-card">
                <Shield size={18} />
                <span>
                  {supported(inspect)
                    ? 'Gameplay supported in the local engine.'
                    : 'Metadata only. This card’s gameplay effects are not implemented.'}
                  <small>
                    {inspect.wildLegal === null
                      ? 'Wild legality pending verification.'
                      : inspect.wildLegal
                        ? 'Verified Wild legal.'
                        : 'Not Wild legal.'}
                  </small>
                </span>
              </div>
              <button className="gold-button" onClick={() => add(inspect)}>
                <Plus size={16} /> Add to deck
              </button>
              {inspect.type === 'MINION' && inspect.rarity === 'LEGENDARY' ? (
                <button onClick={() => add(inspect, true)}>
                  <Crown size={16} /> Choose as commander
                </button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
      {showSaved ? (
        <div className="overlay" onClick={() => setShowSaved(false)}>
          <section className="small-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setShowSaved(false)} title="Close saved decks">
              <X />
            </button>
            <h2>Saved expeditions</h2>
            {saved.length ? (
              saved.map((d, i) => (
                <button
                  className="saved-row"
                  key={i}
                  onClick={() => {
                    setDeck(d);
                    setShowSaved(false);
                  }}
                >
                  <Crown size={18} />
                  <span>
                    {d.name}
                    <small>
                      {pretty(d.class)} · {d.cards.length}/100
                    </small>
                  </span>
                  <ArrowRight size={16} />
                </button>
              ))
            ) : (
              <p>No saved decks yet. Build and save a draft first.</p>
            )}
          </section>
        </div>
      ) : null}
      {showSettings ? (
        <div className="overlay" onClick={() => setShowSettings(false)}>
          <section className="small-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setShowSettings(false)} title="Close settings">
              <X />
            </button>
            <div className="eyebrow">YOUR WORKSPACE</div>
            <h2>Database connection</h2>
            <p>
              {db
                ? 'Supabase project configured. Sign in to save private decks.'
                : 'Running locally. Add the HC / HSC project URL and publishable key to .env.local, then restart Vite.'}
            </p>
            <p>Artwork is loaded by URL. No image files are stored in the database.</p>
            {db ? (
              <>
                <input
                  type="email"
                  aria-label="Email address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  className="gold-button"
                  onClick={async () => {
                    const { error } = await db!.auth.signInWithOtp({
                      email,
                      options: { emailRedirectTo: window.location.origin },
                    });
                    setToast(error ? error.message : 'Check your email for the sign-in link.');
                  }}
                >
                  Email sign-in link
                </button>
                {session ? <button onClick={() => db!.auth.signOut()}>Sign out</button> : null}
              </>
            ) : null}
            <button
              onClick={() => {
                setShowSettings(false);
                setTab('lab');
              }}
            >
              Open testing lab <ArrowRight size={15} />
            </button>
          </section>
        </div>
      ) : null}
      <input
        hidden
        type="file"
        accept="application/json,.json"
        ref={upload}
        onChange={async (e) => {
          try {
            const f = e.target.files?.[0];
            if (f) {
              if (f.size > 1000000) throw Error('Deck file too large');
              setDeck(parseDeck(JSON.parse(await f.text()), cards));
              setToast('Deck imported as a draft. Review validation notes.');
            }
          } catch (e) {
            setToast(String(e));
          }
          e.target.value = '';
        }}
      />
      <input
        hidden
        type="file"
        accept="application/json,.json"
        ref={replayUpload}
        onChange={async (e) => {
          try {
            const f = e.target.files?.[0];
            if (f) {
              if (f.size > 10000000) throw Error('Replay too large');
              const r = JSON.parse(await f.text()) as Replay;
              setGame(replay(r));
              record.current = r;
              setPaused(true);
              setToast('Replay restored. Bots are paused.');
            }
          } catch (e) {
            setToast(String(e));
          }
          e.target.value = '';
        }}
      />
      {dragPreview ? (
        <div
          className="dragged-card"
          aria-hidden="true"
          style={{ left: dragPreview.x + 12, top: dragPreview.y - 100 }}
        >
          <img src={image(dragPreview.card)} alt="" draggable={false} />
          <span>{dragPreview.card.name}</span>
        </div>
      ) : null}
      {toast ? (
        <div className="toast" role="status">
          <Gem size={18} />
          {toast}
          <button title="Dismiss notification" onClick={() => setToast('')}>
            <X size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
