// Turns core events into toasts and dialogs.

import {
  ACHIEVEMENTS, ERA_NAMES, EXPEDITION_BY_ID, FINAL_MILESTONE, MILESTONES, drainEvents, era,
  formatNumber as fmt, formatTime, pheromonePerAchievement,
} from '../core/index.js';
import { markColonyDirty } from './colony/canvas.js';
import { closeModal, openModal } from './modal.js';
import { rotateNews } from './news.js';
import { store } from './store.js';
import { flagPanel } from './tabs.js';
import { toast } from './toast.js';

const withArticle = noun => `${/^[aeiou]/.test(noun) ? 'An' : 'A'} ${noun}`;

const HANDLERS = {
  achievement(e, s) {
    const a = ACHIEVEMENTS.find(x => x.id === e.id);
    toast(`Achievement: <b>${a.name}</b>. Pheromone Trail +${Math.round(pheromonePerAchievement(s) * 100)}%.`);
  },
  expedition(e) {
    const trip = EXPEDITION_BY_ID[e.id];
    const losses = e.lost ? ` ${withArticle(trip.hazard)} got ${fmt(e.lost)} ants.` : '';
    toast(`<b>${trip.name}</b> is back with ${e.loot.join(', ')}.${losses}`, { bad: e.lost > 0 });
    flagPanel('p-nest');
  },
  milestone(e, s) {
    markColonyDirty();
    rotateNews();
    if (e.id === FINAL_MILESTONE) showVictory(s);
    else toast(`Milestone: <b>${MILESTONES.find(m => m.id === e.id).name}</b>! Now entering ${ERA_NAMES[era(s) - 1]}.`);
  },
  spell(e) {
    toast(e.text, { bad: e.bad });
  },
  popsicle(e) {
    toast(`Popsicle Chunk melted into <b>${fmt(e.sugar)}</b> sugar.`);
  },
};

export function handleEvents() {
  for (const event of drainEvents()) HANDLERS[event.kind]?.(event, store.state);
}

function showVictory(s) {
  openModal('You reached Andromeda',
    `<p>From one sugar cube to another galaxy. The colony is complete.</p>
     <p class="num">${formatTime(s.clock)} of play · ${fmt(s.flights)} Nuptial Flights · ${fmt(s.sugarAll)} sugar collected.</p>
     <p>You can keep playing: Nuptial Flights still earn Royal Jelly, and every run can go faster.</p>`,
    [{ label: 'Keep playing', onClick: closeModal }]);
}
