// Simple read-only questions about a game state, shared by the data tables and the economy.

export const hasUpgrade = (s, id) => !!s.upgrades[id];
export const hasHeritage = (s, id) => !!s.heritage[id];
export const achievementCount = s => Object.keys(s.achievements).length;
export const isBuffActive = (s, id) => (s.buffs[id] || 0) > s.clock;
export const isFeastActive = s => s.feastEnd > s.clock;

/** Era 1 to 6: one more for each of the first five milestones claimed. */
export function era(s) {
  let e = 1;
  for (const id of ['garden', 'picnic', 'market', 'core', 'sun']) if (s.milestones[id]) e++;
  return e;
}

export function awayCount(s) {
  let away = 0;
  for (const id in s.exp) away += s.exp[id].squad;
  return away;
}
export const workersHome = s => Math.max(0, s.owned.worker - awayCount(s));
export const population = s => s.owned.worker + s.owned.queen;
