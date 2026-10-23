// Things the player (or the simulator) can do. Each returns true if it happened.

import { UPGRADE_BY_ID } from './data/upgrades.js';
import { MILESTONES, FINAL_MILESTONE } from './data/milestones.js';
import { EXPEDITION_BY_ID } from './data/expeditions.js';
import { PANTRY_BUFF_BY_ID } from './data/buffs.js';
import { SPELL_BY_ID } from './data/spells.js';
import { emit } from './events.js';
import { random } from './random.js';
import { formatNumber } from './format.js';
import { modifiers } from './effects.js';
import { addDust, addMilk, addSugar } from './resources.js';
import { isBuffActive, isFeastActive, workersHome } from './queries.js';
import {
  chamberCost, clickValue, dustPerSecond, expeditionAvailable, expeditionDuration, expeditionRisk, feastCost,
  feastDuration, manaCap, milkPerSecond, producerCost, producerUnlocked, rawSugarPerSecond, spellCooldown, spellCost, sugarPerSecond,
} from './economy.js';
import { EXPEDITION_LOSS_FRACTION, POPSICLE_SECONDS, SPELL_TUNING } from './constants.js';

export function click(s) {
  const value = clickValue(s);
  addSugar(s, value);
  s.clicks++;
  return value;
}

export function buyProducer(s, id, count = 1) {
  if (!producerUnlocked(s, id) || count < 1) return false;
  const cost = producerCost(s, id, count);
  if (s.sugar < cost) return false;
  s.sugar -= cost;
  s.owned[id] += count;
  return true;
}

export const upgradeAvailable = (s, u) => !s.upgrades[u.id] && u.unlock(s) && (!u.tier || producerUnlocked(s, u.tier));

export function buyUpgrade(s, id) {
  const u = UPGRADE_BY_ID[id];
  if (!u || !upgradeAvailable(s, u) || s[u.cur] < u.cost) return false;
  s[u.cur] -= u.cost;
  s.upgrades[id] = 1;
  return true;
}

export function digChamber(s) {
  const cost = chamberCost(s);
  if (s.sugar < cost) return false;
  s.sugar -= cost;
  s.chambers++;
  return true;
}

export function royalFeast(s) {
  const cost = feastCost(s);
  if (s.milk < cost || isFeastActive(s) || s.owned.queen < 1) return false;
  s.milk -= cost;
  s.feastEnd = s.clock + feastDuration(s);
  s.feasts++;
  return true;
}

/** Whether a spell has anything to act on right now (Pheromone Shortcut needs an expedition out). */
export const spellUsable = (s, id) => !SPELL_BY_ID[id]?.needsExpedition || Object.keys(s.exp).length > 0;

/** Seconds until a spell can be cast again (0 when ready). */
export const spellCooldownLeft = (s, id) => Math.max(0, (s.cooldowns[id] || 0) - s.clock);

export function castSpell(s, id) {
  const spell = SPELL_BY_ID[id];
  if (!spell || !s.owned.wizard || !spellUsable(s, id)) return false;
  const cost = spellCost(s, id);
  if (s.mana < cost || spellCooldownLeft(s, id) > 0 || (spell.duration && isBuffActive(s, id))) return false;
  s.mana -= cost;
  s.spells++;
  s.cooldowns[id] = s.clock + spellCooldown(s, id);
  if (id === 'conjure') {
    const sugar = SPELL_TUNING.conjureSeconds * rawSugarPerSecond(s);
    addSugar(s, sugar);
    emit({ kind: 'spell', text: `Conjure Crumbs made <b>${formatNumber(sugar)}</b> sugar.` });
  } else if (id === 'shortcut') {
    const trips = Object.values(s.exp);
    for (const run of trips) run.end = Math.max(s.clock, run.end - SPELL_TUNING.shortcutSeconds);
    emit({ kind: 'spell', text: `${trips.length === 1 ? 'Your expedition is' : `All ${trips.length} expeditions are`} <b>5 minutes</b> closer to home.` });
  } else if (id === 'summon') {
    s.pantry.popsicle++;
    emit({ kind: 'spell', text: 'A <b>Popsicle Chunk</b> appeared in the Pantry.' });
  } else if (id === 'hex' && random() < SPELL_TUNING.hexBackfireChance) {
    const burned = s.sugar * SPELL_TUNING.hexBurnFraction;
    s.sugar -= burned;
    s.backfires++;
    emit({ kind: 'spell', bad: true, text: `The Hex backfired and burned <b>${formatNumber(burned)}</b> sugar.` });
  } else {
    s.buffs[id] = s.clock + spell.duration;
  }
  return true;
}

export const nextMilestone = s => MILESTONES.find(m => !s.milestones[m.id]) || null;

export function canBuyMilestone(s, m) {
  return !!m && nextMilestone(s) === m && m.req(s) && s.sugar >= m.cost && s.dust >= (m.dust || 0);
}

export function buyMilestone(s, id) {
  const m = MILESTONES.find(x => x.id === id);
  if (!canBuyMilestone(s, m)) return false;
  s.sugar -= m.cost;
  s.dust -= m.dust || 0;
  s.milestones[id] = s.clock - s.runStart || 0.001;
  if (id === FINAL_MILESTONE) s.won = true;
  emit({ kind: 'milestone', id });
  return true;
}

export function sendExpedition(s, id) {
  const e = EXPEDITION_BY_ID[id];
  if (!e || s.exp[id] || !expeditionAvailable(s, e) || workersHome(s) < e.squad) return false;
  s.exp[id] = { start: s.clock, end: s.clock + expeditionDuration(s, e), squad: e.squad };
  return true;
}

const BUFF_ARTICLE_NAME = { rush: 'Sugar Rush', basket: 'Picnic Basket', flood: 'Honey Flood', popsicle: 'Popsicle Chunk' };

/** Brings a returned squad home, hands out loot, and maybe loses some ants to the hazard. */
export function resolveExpedition(s, id) {
  const run = s.exp[id];
  delete s.exp[id];
  const e = EXPEDITION_BY_ID[id];
  const mods = modifiers(s);
  const labels = [], given = {};
  const giveBuff = (buff, suffix = '') => {
    s.pantry[buff]++;
    labels.push(`${given[buff] ? 'another' : 'a'} ${BUFF_ARTICLE_NAME[buff]}${suffix}`);
    given[buff] = true;
  };
  const sugarRate = rawSugarPerSecond(s);
  e.rollLoot({
    sugarSeconds(seconds, minimum = 0) {
      const sugar = Math.max(minimum, seconds * sugarRate) * mods.loot;
      addSugar(s, sugar);
      labels.push(`${formatNumber(sugar)} sugar`);
    },
    milkSeconds(seconds, base = 0) {
      const milk = (base + seconds * milkPerSecond(s)) * mods.loot;
      addMilk(s, milk);
      labels.push(`${formatNumber(milk)} Bug Milk`);
    },
    dustSeconds(seconds, base = 0) {
      const dust = (base + seconds * dustPerSecond(s)) * mods.loot;
      addDust(s, dust);
      labels.push(`${formatNumber(dust)} Stardust`);
    },
    mana(amount) {
      const added = Math.min(amount, manaCap(s) - s.mana);
      if (added > 0) { s.mana += added; labels.push(`${formatNumber(added)} Mana`); }
    },
    buff(buff, chance) {
      if (chance === undefined || random() < chance) giveBuff(buff);
    },
  });

  let lost = 0;
  if (e.risk && random() < expeditionRisk(s, e)) {
    lost = Math.floor(run.squad * EXPEDITION_LOSS_FRACTION);
    s.owned.worker = Math.max(0, s.owned.worker - lost);
    s.anteaters++;
  }
  for (const buff of mods.expeditionBonusBuffs) {
    s.pantry[buff]++;
    labels.push(`a ${BUFF_ARTICLE_NAME[buff]} (Veteran Scouts)`);
  }
  s.expDone++;
  emit({ kind: 'expedition', id, loot: labels, lost });
}

export function useBuff(s, id) {
  if (!s.pantry[id]) return false;
  s.pantry[id]--;
  const buff = PANTRY_BUFF_BY_ID[id];
  if (buff.instant) {
    const sugar = POPSICLE_SECONDS * sugarPerSecond(s);
    addSugar(s, sugar);
    emit({ kind: 'popsicle', sugar });
  } else {
    s.buffs[id] = Math.max(s.clock, s.buffs[id] || 0) + buff.duration;
  }
  return true;
}
