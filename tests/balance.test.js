// Pacing guardrails: a bot plays the first run. Bots play near-perfectly; people take about 1.5-2x as long.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { playGame } from '../tools/bot.js';

const minuteOf = (run, id) => Number(run.milestones.find(m => m.startsWith(id + '@'))?.split('@')[1]);

test('a fast-clicking bot reaches the first Nuptial Flight in 20-35 minutes with 5-10 jelly at the Picnic', () => {
  const { runs } = playGame({ clicksPerSecond: 2, stopAfterRuns: 1 });
  const picnicAt = minuteOf(runs[0], 'picnic');
  assert.ok(picnicAt >= 20 && picnicAt <= 35, `Raid the Picnic at ${picnicAt} min`);
  assert.ok(minuteOf(runs[0], 'garden') <= 15, 'Claim the Garden within 15 min');
});
