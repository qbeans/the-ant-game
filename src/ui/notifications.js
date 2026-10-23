// Turns core events into toasts and dialogs.

import {
  ACHIEVEMENTS, ERA_NAMES, EXPEDITION_BY_ID, FINAL_MILESTONE, MILESTONES, drainEvents, era,
  formatNumber as fmt, formatTime, pheromonePerAchievement,
} from '../core/index.js';
import { markColonyDirty } from './colony/canvas.js';
import { closeModal, openModal } from './modal.js';
import { rotateNews } from './news.js';
import { store } from './store.js';
import { flagPanel, showPanel } from './tabs.js';
import { byId } from './dom.js';
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
    else if (canFlyForFirstTime(s)) announceFlight(s);
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

// The Nuptial Flight is the game's biggest new idea, so the first time it unlocks gets a dialog, not just a toast.
const canFlyForFirstTime = s => !!s.milestones.picnic && !s.seen.flightIntro && s.flights === 0;

function announceFlight(s) {
  s.seen.flightIntro = 1;
  openModal('The Nuptial Flight is ready',
    `<p>You raided the picnic! Your colony is now strong enough to send out winged queens.</p>
     <p>A <b>Nuptial Flight</b> starts a new run from the Anthill. You keep your achievements and earn
     <b>Royal Jelly</b>: each one adds +2% sugar/s, or you can spend it on permanent Heritage upgrades.
     The longer you wait, the more jelly you earn.</p>
     <p>There's no rush. The flight card stays in the Nest panel until you're ready.</p>`,
    [
      { label: 'Keep playing', style: 'ghost', onClick: closeModal },
      { label: 'Show me', onClick: showFlightCard },
    ]);
  flagPanel('p-nest');
}

function showFlightCard() {
  closeModal();
  showPanel('p-nest');
  const card = byId('flightCard');
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.classList.remove('spotlight');
  void card.offsetWidth; // restart the animation
  card.classList.add('spotlight');
}

function showVictory(s) {
  openModal('You reached Andromeda',
    `<p>From one sugar cube to another galaxy. The colony is complete.</p>
     <p class="num">${formatTime(s.clock)} of play · ${fmt(s.flights)} Nuptial Flights · ${fmt(s.sugarAll)} sugar collected.</p>
     <p>You can keep playing: Nuptial Flights still earn Royal Jelly, and every run can go faster.</p>`,
    [{ label: 'Keep playing', onClick: closeModal }]);
}
