// Progressive reveal: each feature appears the first time it becomes relevant, then stays (tracked in state.seen).

import { UPGRADES, achievementCount, canFly, population, upgradeAvailable } from '../core/index.js';
import { byId } from './dom.js';
import { store } from './store.js';
import { toast } from './toast.js';
import { flagPanel, showPanel } from './tabs.js';

/** `panel` is the phone tab to flag when the feature appears; omit it for always-visible parts like the HUD. */
const REVEALS = [
  { key: 'ants', el: 'stAnts', test: s => s.owned.worker >= 1 },
  { key: 'colony', el: 'colonyView', test: s => s.owned.worker >= 1,
    msg: 'Your first ant moved in. Watch the colony grow below the cube.' },
  { key: 'upgrades', el: 'upgCard', panel: 'p-shop', test: s => UPGRADES.some(u => upgradeAvailable(s, u)),
    msg: '<b>Upgrades</b> are open in the shop.' },
  { key: 'nest', el: 'nestCard', panel: 'p-nest', test: s => s.owned.queen >= 1,
    msg: '<b>The Nest</b>: your queen is making free Worker Ants.' },
  { key: 'milestone', el: 'msCard', panel: 'p-nest', test: s => population(s) >= 15,
    msg: 'A <b>milestone</b> is in sight: Claim the Garden.' },
  { key: 'exp', el: 'expCard', panel: 'p-nest', test: s => s.owned.worker >= 10,
    msg: '<b>Foraging Expeditions</b>: send scouts out for loot.' },
  { key: 'milk', el: 'stMilk', test: s => s.milkAll > 0,
    msg: 'Your aphids make <b>Bug Milk</b>. Some upgrades cost milk.' },
  { key: 'feast', el: 'feastBtn', panel: 'p-nest', test: s => s.milkAll > 0 && s.owned.queen >= 1,
    msg: '<b>Royal Feast</b>: spend milk so queens make workers faster.' },
  { key: 'pantry', el: 'pantryCard', panel: 'p-nest', test: s => Object.values(s.pantry).some(n => n > 0),
    msg: 'Loot goes to the <b>Buff Pantry</b>. Use it whenever you like.' },
  { key: 'wizards', el: 'wizCard', panel: 'p-nest', test: s => s.owned.wizard >= 1,
    msg: '<b>Ant Wizards</b>: they brew Mana from Bug Milk. Cast spells in the Nest panel.' },
  { key: 'dust', el: 'stDust', test: s => s.dustAll > 0,
    msg: '<b>Stardust</b>: space producers bring it home. Some upgrades cost Stardust.' },
  { key: 'records', el: 'records', test: s => achievementCount(s) >= 3,
    msg: '<b>Records</b> track your achievements.' },
];

const hasHeritageCard = s => s.flights > 0 || s.jelly > 0;

let lastGeneration = -1;

/** Reveals anything newly relevant and lays out the panels. Returns true if the colony view just appeared. */
export function applyReveals() {
  const s = store.state;
  // After a load or wipe, reveal silently: those features aren't news.
  const quiet = lastGeneration !== store.generation;
  lastGeneration = store.generation;
  let colonyAppeared = false;

  for (const r of REVEALS) {
    if (!s.seen[r.key] && r.test(s)) {
      s.seen[r.key] = 1;
      if (r.key === 'colony') colonyAppeared = true;
      if (!quiet) {
        byId(r.el).classList.add('reveal');
        if (r.msg) toast(r.msg);
        if (r.panel) flagPanel(r.panel);
      }
    }
    byId(r.el).hidden = !s.seen[r.key];
  }

  // The middle panel exists once anything in it has been revealed.
  const nestPanelHasContent = REVEALS.some(r => r.panel === 'p-nest' && s.seen[r.key]) || canFly(s) || hasHeritageCard(s);
  byId('p-nest').hidden = !nestPanelHasContent;
  byId('tabNest').hidden = !nestPanelHasContent;
  const grid = document.querySelector('.grid');
  grid.style.setProperty('--cols', nestPanelHasContent ? 3 : 2);
  grid.style.setProperty('--gridmax', nestPanelHasContent ? 'none' : '940px');
  if (!nestPanelHasContent && byId('p-nest').classList.contains('on')) showPanel('p-colony');
  return colonyAppeared;
}
