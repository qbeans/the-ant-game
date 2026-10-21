import { PRODUCERS } from './data/producers.js';
import { PANTRY_BUFFS } from './data/buffs.js';

export const STATE_VERSION = 2;

/** A brand-new game. The whole state is plain JSON so it can be saved as-is. */
export function createState() {
  return {
    v: STATE_VERSION,
    sugar: 0, sugarRun: 0, sugarAll: 0,
    milk: 0, milkAll: 0,
    dust: 0, dustAll: 0,
    mana: 0,
    clicks: 0,
    owned: Object.fromEntries(PRODUCERS.map(p => [p.id, 0])),
    layProgress: 0,
    chambers: 0,
    upgrades: {},
    milestones: {},       // id -> seconds into the run when claimed
    achievements: {},
    exp: {},              // expedition id -> { start, end, squad }
    pantry: Object.fromEntries(PANTRY_BUFFS.map(b => [b.id, 0])),
    buffs: {},            // timed buff or spell id -> clock time it ends
    feastEnd: 0, feasts: 0,
    expDone: 0, anteaters: 0, spells: 0, backfires: 0,
    clock: 0,             // game seconds since the save was created
    runStart: 0,
    won: false,
    seen: {},             // UI features already revealed
    jelly: 0, heritage: {}, flights: 0,
    lastFlight: null, bestFlight: null,
    lastSave: Date.now(),
  };
}

/** Fields that survive a Nuptial Flight. Everything else starts over. */
export const KEPT_ON_FLIGHT = [
  'seen', 'clicks', 'sugarAll', 'milkAll', 'dustAll', 'achievements', 'feasts', 'expDone', 'anteaters',
  'spells', 'backfires', 'clock', 'heritage', 'bestFlight', 'won',
];

/** Fills in fields a save from an older version is missing. */
export function migrateState(saved) {
  const fresh = createState();
  const s = Object.assign(fresh, saved);
  s.owned = Object.assign(createState().owned, saved.owned || {});
  s.pantry = Object.assign(createState().pantry, saved.pantry || {});
  // Early prototypes tracked queen-made workers separately as "brood".
  if (saved.brood) { s.owned.worker += saved.brood; delete s.brood; }
  return s;
}
