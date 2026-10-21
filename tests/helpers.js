import * as game from '../src/core/index.js';

/** A fresh state with a fixed random source, so tests don't depend on luck. */
export function newGame({ randomValue = 0.5 } = {}) {
  game.setRandomSource(() => randomValue);
  game.drainEvents();
  return game.createState();
}

/** Claims milestones directly (skipping their costs) to reach a later era. */
export function claimMilestones(s, ...ids) {
  for (const id of ids) s.milestones[id] = 1;
}
