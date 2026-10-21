import { ACHIEVEMENTS } from './data/achievements.js';
import { emit } from './events.js';
import { resolveExpedition } from './actions.js';
import { addDust, addMilk, addSugar } from './resources.js';
import {
  dustPerSecond, manaCap, manaPerSecond, milkPerSecond, nestRoom, rawSugarPerSecond, sugarPerSecond, workerBirthRate,
} from './economy.js';
import { modifiers } from './effects.js';
import { MANA } from './constants.js';

/** Advances the game by `dt` seconds. Keep `dt` small (≤ 0.5s) so expeditions and buffs end on time. */
export function tick(s, dt) {
  s.clock += dt;
  addSugar(s, sugarPerSecond(s) * dt);
  addMilk(s, milkPerSecond(s) * dt);
  addDust(s, dustPerSecond(s) * dt);
  brewMana(s, dt);
  growWorkers(s, dt);
  for (const id in s.exp) if (s.clock >= s.exp[id].end) resolveExpedition(s, id);
  checkAchievements(s);
}

/** Wizards turn Bug Milk into Mana until Mana is full. */
function brewMana(s, dt) {
  if (!s.owned.wizard) return;
  const cap = manaCap(s);
  if (s.mana >= cap) return;
  const wanted = Math.min(manaPerSecond(s) * dt, cap - s.mana);
  const milkUsed = Math.min(s.milk, wanted * MANA.milkPerMana);
  s.milk -= milkUsed;
  s.mana += milkUsed / MANA.milkPerMana;
}

/** Queens add whole Worker Ants while the nest has room. */
function growWorkers(s, dt) {
  const room = nestRoom(s);
  if (s.owned.worker >= room) { s.layProgress = 0; return; }
  s.layProgress += workerBirthRate(s) * dt;
  const born = Math.floor(s.layProgress);
  if (born > 0) {
    s.layProgress -= born;
    s.owned.worker = Math.min(room, s.owned.worker + born);
  }
}

function checkAchievements(s) {
  for (const a of ACHIEVEMENTS) {
    if (!s.achievements[a.id] && a.test(s)) {
      s.achievements[a.id] = 1;
      emit({ kind: 'achievement', id: a.id });
    }
  }
}

/** Credits time spent away from the game, at the offline rate. Returns the sugar gained and seconds counted. */
export function applyOfflineTime(s, secondsAway) {
  const { offline } = modifiers(s);
  const seconds = Math.min(offline.maxSeconds, secondsAway);
  const sugar = rawSugarPerSecond(s) * seconds * offline.rate; // offline gains ignore temporary buffs
  addSugar(s, sugar);
  addMilk(s, milkPerSecond(s) * seconds * offline.rate);
  addDust(s, dustPerSecond(s) * seconds * offline.rate);
  s.clock += seconds;
  tick(s, 0); // finishes any expeditions that came back while away
  return { sugar, seconds };
}

