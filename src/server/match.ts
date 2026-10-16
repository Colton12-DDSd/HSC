import { applyAction, type Action, type Game } from '../engine';
export interface Command {
  revision: number;
  action: Action;
}
/** Run this adapter only on a trusted server when rooms are introduced. */
export class AuthoritativeMatch {
  private state: Game;
  private revision = 0;
  constructor(
    initial: Game,
    private readonly seats: ReadonlyMap<string, number>,
  ) {
    this.state = structuredClone(initial);
  }
  submit(authenticatedUserId: string, command: Command) {
    const seat = this.seats.get(authenticatedUserId);
    if (seat === undefined || command.action.p !== seat) throw Error('Seat authorization failed');
    if (command.revision !== this.revision) throw Error('Stale revision; resynchronize');
    // Debug commands are deliberately absent from the server action interface.
    if (
      ![
        'cast',
        'choose',
        'pass',
        'interrupt',
        'end',
        'attack',
        'power',
        'commander-destination',
      ].includes(command.action.type)
    )
      throw Error('Unknown match action');
    this.state = applyAction(this.state, command.action);
    this.revision++;
    return this.view(authenticatedUserId);
  }
  view(authenticatedUserId: string) {
    const seat = this.seats.get(authenticatedUserId);
    if (seat === undefined) throw Error('Not a member');
    return {
      revision: this.revision,
      state: {
        ...structuredClone(this.state),
        seed: undefined,
        choice: this.state.choice?.player === seat ? structuredClone(this.state.choice) : undefined,
        players: this.state.players.map((p, i) => ({
          ...structuredClone(p),
          deckCount: p.deck.length,
          deck: undefined,
          handCount: p.hand.length,
          hand: i === seat ? structuredClone(p.hand) : undefined,
        })),
      },
    };
  }
}
