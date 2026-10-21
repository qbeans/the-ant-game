// A greedy bot that plays the game with no UI, prestiges when progress stalls, and buys Heritage.
// It plays close to optimally, so real players take roughly 1.5-2x as long as it does.

import * as game from '../src/core/index.js';

const HERITAGE_ORDER = ['lineage', 'deep', 'scouts', 'sweet', 'milkmem', 'deed', 'wizline', 'deed2', 'carto', 'ancestors', 'deed3', 'spaceborn', 'deed4'];
const FLY_AFTER_STALL_SECONDS = 600;
const MAX_RUN_SECONDS = 5400;
const PURCHASE_EVERY_SECONDS = 4;

/**
 * Plays until the game is won or `hours` of game time pass.
 * @returns {{runs: object[], state: object}}
 */
export function playGame({ clicksPerSecond = 2, hours = 12, seed = 7, stopAfterRuns = Infinity } = {}) {
  game.setRandomSource(game.seededRandom(seed));
  game.drainEvents();
  let s = game.createState();
  let t = 0, runTime = 0, lastMilestoneAt = 0, clickCarry = 0, jellyEarned = 0;
  let current = { milestones: [] };
  const runs = [];

  const value = () => game.rawSugarPerSecond(s) + clicksPerSecond * game.clickValue(s);
  const gainFrom = (apply, undo) => { const before = value(); apply(); const after = value(); undo(); return after - before; };

  const endRun = () => {
    runs.push({ ...current, minutes: runTime / 60, era: game.era(s), jelly: game.jellyGain(s), sugarPerSecond: game.rawSugarPerSecond(s), dustAll: s.dustAll });
  };

  while (t < hours * 3600) {
    clickCarry += clicksPerSecond;
    while (clickCarry >= 1) { game.click(s); clickCarry--; }

    const next = game.nextMilestone(s);
    if (game.canBuyMilestone(s, next)) {
      game.buyMilestone(s, next.id);
      current.milestones.push(`${next.id}@${(runTime / 60).toFixed(0)}`);
      lastMilestoneAt = runTime;
      if (next.id === game.FINAL_MILESTONE) current.won = true;
    }
    for (const u of game.UPGRADES) if (u.cur !== 'sugar' && game.upgradeAvailable(s, u) && s[u.cur] >= u.cost) game.buyUpgrade(s, u.id);
    if (s.owned.worker < game.nestRoom(s) * 0.6) game.royalFeast(s);
    for (const e of game.EXPEDITIONS) game.sendExpedition(s, e.id);
    for (const b of ['rush', 'basket', 'flood']) if (s.pantry[b]) game.useBuff(s, b);
    if (s.pantry.popsicle && game.isBuffActive(s, 'basket')) game.useBuff(s, 'popsicle');
    if (s.owned.wizard) {
      if (game.isBuffActive(s, 'basket') && s.mana >= game.spellCost(s, 'conjure')) game.castSpell(s, 'conjure');
      else if (s.mana >= game.spellCost(s, 'hex') + 5 && !game.isBuffActive(s, 'hex')) game.castSpell(s, 'hex');
    }
    if (t % PURCHASE_EVERY_SECONDS === 0) buyBest(s, next, gainFrom);

    game.tick(s, 1);
    t += 1; runTime += 1;
    game.drainEvents();

    // Fly when progress has stalled and the flight is worth it, or when a run drags on.
    const gain = game.jellyGain(s);
    const stalled = runTime - lastMilestoneAt > FLY_AFTER_STALL_SECONDS && gain >= Math.max(5, jellyEarned * 0.6);
    if (game.canFly(s) && (stalled || runTime > MAX_RUN_SECONDS) && !current.won) {
      endRun();
      if (runs.length >= stopAfterRuns) return { runs, state: s };
      jellyEarned += gain;
      s = game.nuptialFlight(s);
      runTime = 0; lastMilestoneAt = 0; current = { milestones: [] };
      for (const id of HERITAGE_ORDER) game.buyHeritage(s, id);
    }
    if (current.won) break;
  }
  endRun();
  return { runs, state: s };
}

/** Spends sugar on whatever adds the most sugar/s per sugar, saving up for a milestone once it's in reach. */
function buyBest(s, milestone, gainFrom) {
  for (let guard = 0; guard < 60; guard++) {
    const options = [];
    for (const p of game.PRODUCERS) {
      if (!game.producerUnlocked(s, p.id)) continue;
      const gain = p.id === 'queen' ? queenValue(s) : gainFrom(() => s.owned[p.id]++, () => s.owned[p.id]--);
      options.push({ cost: game.producerCost(s, p.id), gain, buy: () => game.buyProducer(s, p.id) });
    }
    for (const u of game.UPGRADES) {
      if (u.cur !== 'sugar' || !game.upgradeAvailable(s, u)) continue;
      const gain = gainFrom(() => { s.upgrades[u.id] = 1; }, () => { delete s.upgrades[u.id]; });
      options.push({ cost: u.cost, gain: gain || (u.id.startsWith('queen') ? 1e-9 : 0), buy: () => game.buyUpgrade(s, u.id) });
    }
    if (s.owned.worker >= game.nestRoom(s) - 3 && s.owned.queen) {
      options.push({ cost: game.chamberCost(s), gain: 25 * game.unitSugarPerSecond(s, 'worker') * 0.8, buy: () => game.digChamber(s) });
    }
    if (milestone && milestone.req(s)) options.push({ cost: milestone.cost, gain: Infinity, buy: () => false });

    let best = null;
    for (const o of options) { o.score = o.gain / o.cost; if (!best || o.score > best.score) best = o; }
    if (!best || s.sugar < best.cost || !best.buy()) return;
  }
}

/** Queens make no sugar themselves; value one by the workers it adds over the next 90 seconds. */
function queenValue(s) {
  if (s.owned.worker >= game.nestRoom(s) - 2) return 0;
  s.owned.queen++;
  const withExtra = game.workerBirthRate(s);
  s.owned.queen--;
  return (withExtra - game.workerBirthRate(s)) * 90 * game.unitSugarPerSecond(s, 'worker') + 1e-9;
}
