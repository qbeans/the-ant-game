// The UI's view of the game: the current state plus a few viewer preferences.

export const store = {
  state: null,
  /** Bumped whenever the state object is replaced (load, Nuptial Flight, wipe) so views can reset caches. */
  generation: 0,
  speed: 1,
  buyAmount: 1, // 1, 10 or 'max'
  /** Re-renders after a player action. Set by main.js. */
  refresh: () => {},
};

export function replaceState(next) {
  store.state = next;
  store.generation++;
}
