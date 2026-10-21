#!/usr/bin/env node
// Plays the whole game with a bot and prints how long each Nuptial Flight run took.
// Usage: npm run simulate -- [clicksPerSecond=2] [hours=12]

import { playGame } from './bot.js';

const clicksPerSecond = Number(process.argv[2] ?? 2);
const hours = Number(process.argv[3] ?? 12);

const { runs, state } = playGame({ clicksPerSecond, hours });
let elapsed = 0;
runs.forEach((r, i) => {
  elapsed += r.minutes;
  console.log(
    `run ${i + 1}: ${r.minutes.toFixed(0)}m (total ${(elapsed / 60).toFixed(1)}h) era ${r.era} jelly +${r.jelly}` +
    ` sps ${r.sugarPerSecond.toExponential(1)} dustAll ${Math.round(r.dustAll)} ${r.milestones.join(' ')}${r.won ? ' WON' : ''}`,
  );
});
console.log('heritage:', Object.keys(state.heritage).join(','), 'jelly left', state.jelly);
