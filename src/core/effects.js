import { UPGRADE_BY_ID } from './data/upgrades.js';
import { HERITAGE_BY_ID } from './data/heritage.js';
import { OFFLINE } from './constants.js';

/**
 * Folds the effects of every owned upgrade and Heritage upgrade into one modifiers object.
 * Results are cached per upgrades/heritage object and recomputed when either changes size.
 */
const cache = new WeakMap();

export function modifiers(s) {
  const upgrades = countKeys(s.upgrades), heritage = countKeys(s.heritage);
  const hit = cache.get(s.upgrades);
  if (hit && hit.upgrades === upgrades && hit.heritage === heritage && hit.heritageRef === s.heritage) return hit.mods;
  const mods = buildModifiers(s);
  cache.set(s.upgrades, { upgrades, heritage, heritageRef: s.heritage, mods });
  return mods;
}

function countKeys(obj) {
  let n = 0;
  for (const _ in obj) n++;
  return n;
}

function emptyModifiers() {
  return {
    producer: {},          // producer id -> sugar multiplier
    synergies: [],         // { producer, source, perUnit }: +perUnit per owned source
    sugar: 1,              // all sugar/s
    sugarPerUnit: [],      // { source, perUnit }: all sugar/s +perUnit per owned source
    milkPerUnit: [],       // { source, perUnit }: all Bug Milk +perUnit per owned source
    sugarPerMilk: 0,       // all sugar/s +this much per 1 Bug Milk/s
    click: 1, clickShareOfSps: 0,
    lay: 1, room: 1,
    milk: 1, producerMilk: {},
    dust: 1, producerDust: {},
    feastDuration: 1, feastCost: 1, chamberCost: 1, chamberGrowth: null,
    loot: 1, expeditionTime: 1, riskCap: Infinity, expeditionBonusBuffs: [],
    pheromone: 1,
    manaRate: 1, manaCap: 1, spellCost: 1,
    startingQueens: 0, startingMilestones: [],
    offline: { rate: OFFLINE.rate, maxSeconds: OFFLINE.maxSeconds },
  };
}

function apply(m, effect) {
  switch (effect.type) {
    case 'producerMultiplier': for (const id of effect.producers) m.producer[id] = (m.producer[id] || 1) * effect.mult; break;
    case 'synergy': m.synergies.push(effect); break;
    case 'sugarMultiplier': m.sugar *= effect.mult; break;
    case 'sugarPerUnit': m.sugarPerUnit.push(effect); break;
    case 'milkPerUnit': m.milkPerUnit.push(effect); break;
    case 'sugarPerMilk': m.sugarPerMilk += effect.bonusPerMilkPerSecond; break;
    case 'clickMultiplier': m.click *= effect.mult; break;
    case 'clickShareOfSps': m.clickShareOfSps += effect.share; break;
    case 'layMultiplier': m.lay *= effect.mult; break;
    case 'roomMultiplier': m.room *= effect.mult; break;
    case 'milkMultiplier': m.milk *= effect.mult; break;
    case 'producerMilkMultiplier': m.producerMilk[effect.producer] = (m.producerMilk[effect.producer] || 1) * effect.mult; break;
    case 'dustMultiplier': m.dust *= effect.mult; break;
    case 'producerDustMultiplier': m.producerDust[effect.producer] = (m.producerDust[effect.producer] || 1) * effect.mult; break;
    case 'feastDurationMultiplier': m.feastDuration *= effect.mult; break;
    case 'feastCostMultiplier': m.feastCost *= effect.mult; break;
    case 'chamberCostMultiplier': m.chamberCost *= effect.mult; break;
    case 'chamberCostGrowth': m.chamberGrowth = Math.min(m.chamberGrowth ?? Infinity, effect.growth); break;
    case 'lootMultiplier': m.loot *= effect.mult; break;
    case 'expeditionTimeMultiplier': m.expeditionTime *= effect.mult; break;
    case 'riskCap': m.riskCap = Math.min(m.riskCap, effect.max); break;
    case 'expeditionBonusBuff': m.expeditionBonusBuffs.push(effect.buff); break;
    case 'pheromoneMultiplier': m.pheromone *= effect.mult; break;
    case 'manaRateMultiplier': m.manaRate *= effect.mult; break;
    case 'manaCapMultiplier': m.manaCap *= effect.mult; break;
    case 'spellCostMultiplier': m.spellCost *= effect.mult; break;
    case 'startingQueens': m.startingQueens = Math.max(m.startingQueens, effect.count); break;
    case 'startingMilestone': m.startingMilestones.push(effect.milestone); break;
    case 'offline': m.offline = { rate: effect.rate, maxSeconds: effect.maxSeconds }; break;
    default: throw new Error(`Unknown effect type: ${effect.type}`);
  }
}

function buildModifiers(s) {
  const m = emptyModifiers();
  for (const id in s.upgrades) for (const e of UPGRADE_BY_ID[id]?.effects || []) apply(m, e);
  for (const id in s.heritage) for (const e of HERITAGE_BY_ID[id]?.effects || []) apply(m, e);
  return m;
}

/** Effects of a single Heritage upgrade, for applying start-of-run bonuses the moment it's bought. */
export function heritageEffects(id) {
  return HERITAGE_BY_ID[id]?.effects || [];
}
