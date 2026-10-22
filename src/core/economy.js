// Derived numbers: production rates, multipliers, costs and capacities. Pure functions of the state.

import { PRODUCERS, PRODUCER_BY_ID } from './data/producers.js';
import { MILESTONES } from './data/milestones.js';
import { PANTRY_BUFFS } from './data/buffs.js';
import { SPELLS, SPELL_BY_ID } from './data/spells.js';
import { modifiers } from './effects.js';
import { achievementCount, era, isBuffActive, isFeastActive, workersHome } from './queries.js';
import {
  JELLY, MANA, NEST, PHEROMONE_PER_ACHIEVEMENT, PRODUCER_COST_GROWTH, QUEEN_SECONDS_PER_WORKER, ROYAL_FEAST,
} from './constants.js';

const TIMED_BUFFS = [...PANTRY_BUFFS.filter(b => !b.instant), ...SPELLS.filter(sp => sp.duration)];

/** Product of `field` over every timed buff (Pantry or spell) that is running. */
function activeBuffMultiplier(s, field) {
  let mult = 1;
  for (const b of TIMED_BUFFS) if (b[field] && isBuffActive(s, b.id)) mult *= b[field];
  return mult;
}

// ---- Sugar ----

export const pheromonePerAchievement = s => PHEROMONE_PER_ACHIEVEMENT * modifiers(s).pheromone;
export const pheromoneBonus = s => pheromonePerAchievement(s) * achievementCount(s);

export function milestoneMultiplier(s) {
  let mult = 1;
  for (const m of MILESTONES) if (s.milestones[m.id]) mult *= m.sugarMultiplier;
  return mult;
}

/** Multiplier applied to every producer: achievements, unspent jelly, milestones and global upgrades. */
/** Bonuses that grow with how many of some producer you own, e.g. "+1% per Ant Queen". */
function perUnitMultiplier(s, list) {
  let mult = 1;
  for (const e of list) mult *= 1 + e.perUnit * s.owned[e.source];
  return mult;
}

export function baseMultiplier(s) {
  const mods = modifiers(s);
  return (1 + pheromoneBonus(s)) * (1 + JELLY.bonusPerUnspent * s.jelly) * milestoneMultiplier(s) * mods.sugar
    * perUnitMultiplier(s, mods.sugarPerUnit);
}

export const buffSugarMultiplier = s => activeBuffMultiplier(s, 'sugarMultiplier');

/** Upgrade multiplier for one producer, including synergies with other producers. */
export function producerMultiplier(s, id, mods = modifiers(s)) {
  let mult = mods.producer[id] || 1;
  for (const syn of mods.synergies) if (syn.producer === id) mult *= 1 + syn.perUnit * s.owned[syn.source];
  return mult;
}

/** Sugar per second from one unit of a producer, before temporary buffs. */
export const unitSugarPerSecond = (s, id, base = baseMultiplier(s), mods = modifiers(s)) =>
  PRODUCER_BY_ID[id].sps * producerMultiplier(s, id, mods) * base;

/** Sugar per second from all units of a producer. Workers on an expedition don't count. */
export const producerSugarPerSecond = (s, id, base = baseMultiplier(s), mods = modifiers(s)) =>
  (id === 'worker' ? workersHome(s) : s.owned[id]) * unitSugarPerSecond(s, id, base, mods);

/** Total sugar per second without temporary buffs. */
export function rawSugarPerSecond(s) {
  const base = baseMultiplier(s), mods = modifiers(s);
  let total = 0;
  for (const p of PRODUCERS) total += producerSugarPerSecond(s, p.id, base, mods);
  return total;
}

/** Total sugar per second including active buffs. */
export const sugarPerSecond = s => rawSugarPerSecond(s) * buffSugarMultiplier(s);

export function clickValue(s) {
  const mods = modifiers(s);
  return (mods.click * baseMultiplier(s) + mods.clickShareOfSps * sugarPerSecond(s)) * activeBuffMultiplier(s, 'clickMultiplier');
}

// ---- Bug Milk, Stardust, Mana ----

export const milkMultiplier = s =>
  modifiers(s).milk * perUnitMultiplier(s, modifiers(s).milkPerUnit) * activeBuffMultiplier(s, 'milkMultiplier');
export const unitMilkPerSecond = (s, id) => (PRODUCER_BY_ID[id].milk || 0) * (modifiers(s).producerMilk[id] || 1) * milkMultiplier(s);

export function milkPerSecond(s) {
  let total = 0;
  for (const p of PRODUCERS) if (p.milk) total += s.owned[p.id] * unitMilkPerSecond(s, p.id);
  return total;
}

export const unitDustPerSecond = (s, id) => (PRODUCER_BY_ID[id].dust || 0) * (modifiers(s).producerDust[id] || 1) * modifiers(s).dust;

export function dustPerSecond(s) {
  let total = 0;
  for (const p of PRODUCERS) if (p.dust) total += s.owned[p.id] * unitDustPerSecond(s, p.id);
  return total;
}

export const manaCap = s => (MANA.baseCap + MANA.capPerTower * s.owned.wizard) * modifiers(s).manaCap;
export const manaPerSecond = s => s.owned.wizard * MANA.ratePerTower * modifiers(s).manaRate;
export const spellCost = (s, id) => Math.ceil(SPELL_BY_ID[id].cost * modifiers(s).spellCost);

// ---- Nest ----

export const nestRoom = s => Math.floor((NEST.baseRoom + NEST.roomPerChamber * s.chambers) * modifiers(s).room);
export const roomPerChamber = s => Math.floor(NEST.roomPerChamber * modifiers(s).room);
export const chamberCost = s =>
  Math.ceil(NEST.chamberBaseCost * Math.pow(NEST.chamberCostGrowth, s.chambers) * modifiers(s).chamberCost);

/** Workers one queen makes per second from upgrades alone (no Royal Feast or spells). */
export const workersPerQueenPerSecond = s => modifiers(s).lay / QUEEN_SECONDS_PER_WORKER;

/** Workers per second from all queens, including Royal Feast and Pheromone Haste. */
export function workerBirthRate(s) {
  const feast = isFeastActive(s) ? ROYAL_FEAST.layMultiplier : 1;
  return s.owned.queen * workersPerQueenPerSecond(s) * feast * activeBuffMultiplier(s, 'layMultiplier');
}

export const feastCost = s => Math.ceil(ROYAL_FEAST.cost * modifiers(s).feastCost);
export const feastDuration = s => ROYAL_FEAST.duration * modifiers(s).feastDuration;

// ---- Expeditions ----

export const expeditionDuration = (s, e) => e.duration * modifiers(s).expeditionTime;
export const expeditionRisk = (s, e) => (e.risk ? Math.min(e.risk, modifiers(s).riskCap) : 0);
export const expeditionAvailable = (s, e) => e.era <= era(s) && (!e.needs || e.needs(s));

// ---- Shop ----

export function producerCost(s, id, count = 1) {
  const first = PRODUCER_BY_ID[id].cost * Math.pow(PRODUCER_COST_GROWTH, s.owned[id]);
  return Math.ceil(first * (Math.pow(PRODUCER_COST_GROWTH, count) - 1) / (PRODUCER_COST_GROWTH - 1));
}

export function maxAffordable(s, id) {
  const first = PRODUCER_BY_ID[id].cost * Math.pow(PRODUCER_COST_GROWTH, s.owned[id]);
  return Math.max(0, Math.floor(Math.log(s.sugar * (PRODUCER_COST_GROWTH - 1) / first + 1) / Math.log(PRODUCER_COST_GROWTH)));
}

export const producerUnlocked = (s, id) => PRODUCER_BY_ID[id].era <= era(s);
