// The Nuptial Flight (prestige): Royal Jelly, Heritage, and starting a new run.

import { HERITAGE_BY_ID } from './data/heritage.js';
import { MILESTONES } from './data/milestones.js';
import { heritageEffects } from './effects.js';
import { era } from './queries.js';
import { createState, KEPT_ON_FLIGHT } from './state.js';
import { JELLY } from './constants.js';

/** Royal Jelly a flight would earn right now. */
export const jellyGain = s => Math.floor(JELLY.scale * Math.pow(s.sugarRun / JELLY.sugarUnit, JELLY.exponent));

/** Sugar this run needed for the next whole jelly. */
export function nextJellyAt(s) {
  const target = jellyGain(s) + 1;
  return Math.pow(target / JELLY.scale, 1 / JELLY.exponent) * JELLY.sugarUnit;
}

export const canFly = s => !!s.milestones.picnic;

export const heritageUnlocked = (s, h) => !h.needs || !!s.heritage[h.needs];

export function buyHeritage(s, id) {
  const h = HERITAGE_BY_ID[id];
  if (!h || s.heritage[id] || !heritageUnlocked(s, h) || s.jelly < h.cost) return false;
  s.jelly -= h.cost;
  s.heritage[id] = 1;
  // Start-of-run bonuses also apply right away, so the purchase feels immediate.
  applyStartingBonuses(s, heritageEffects(id));
  return true;
}

/** Applies "start every run with..." effects: free queens and pre-claimed milestones. */
function applyStartingBonuses(s, effects) {
  for (const e of effects) {
    if (e.type === 'startingQueens') s.owned.queen = Math.max(s.owned.queen, e.count);
    if (e.type === 'startingMilestone') {
      // A deed claims its milestone and every one before it.
      for (const m of MILESTONES) {
        if (!s.milestones[m.id]) s.milestones[m.id] = 0.001;
        if (m.id === e.milestone) break;
      }
    }
  }
}

/** Ends the run: returns a fresh state that keeps achievements, Heritage and lifetime stats, plus the new jelly. */
export function nuptialFlight(s) {
  if (!canFly(s)) return null;
  const gained = jellyGain(s), runTime = s.clock - s.runStart;
  const next = Object.assign(createState(), Object.fromEntries(KEPT_ON_FLIGHT.map(k => [k, s[k]])));
  next.jelly = s.jelly + gained;
  next.flights = s.flights + 1;
  next.lastFlight = { time: runTime, jelly: gained, sugar: s.sugarRun, era: era(s) };
  next.bestFlight = s.bestFlight == null ? runTime : Math.min(s.bestFlight, runTime);
  next.runStart = s.clock;
  for (const id in next.heritage) applyStartingBonuses(next, heritageEffects(id));
  return next;
}
