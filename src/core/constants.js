// Tunable numbers for the economy. Change these here, then re-run `npm run simulate` to check pacing.

export const PRODUCER_COST_GROWTH = 1.15;

/** Owned counts that unlock each producer's five ×2 upgrades, and their price as a multiple of the producer's base cost. */
export const TIER_THRESHOLDS = [1, 10, 25, 50, 100];
export const TIER_COST_MULTIPLIERS = [10, 100, 1000, 10000, 100000];

export const NEST = {
  baseRoom: 20,
  roomPerChamber: 25,
  chamberBaseCost: 50,
  chamberCostGrowth: 1.25,
};

export const QUEEN_SECONDS_PER_WORKER = 30;

export const ROYAL_FEAST = { cost: 15, duration: 60, layMultiplier: 5 };

export const PHEROMONE_PER_ACHIEVEMENT = 0.03;

export const JELLY = {
  bonusPerUnspent: 0.02,
  // Fourth-root curve: about 6 jelly for a first run, growing slowly enough that later eras stay a climb.
  scale: 1.6,
  exponent: 0.25,
  sugarUnit: 1e6,
};

export const MANA = { baseCap: 30, capPerTower: 2, ratePerTower: 0.05, milkPerMana: 4 };

export const SPELL_TUNING = { conjureSeconds: 600, hexBackfireChance: 0.05, hexBurnFraction: 0.1 };

export const POPSICLE_SECONDS = 900;

export const EXPEDITION_LOSS_FRACTION = 0.25;

export const OFFLINE = { rate: 0.5, maxSeconds: 86400 };
