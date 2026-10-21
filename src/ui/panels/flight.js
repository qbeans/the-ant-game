// The Nuptial Flight (prestige) card and its confirmation.

import { canFly, formatNumber as fmt, formatTime, jellyGain, nextJellyAt, nuptialFlight } from '../../core/index.js';
import { byId, setText } from '../dom.js';
import { closeModal, openModal } from '../modal.js';
import { replaceState, store } from '../store.js';
import { saveGame } from '../save.js';

export function initFlight() {
  byId('flBtn').addEventListener('click', confirmFlight);
}

function confirmFlight() {
  const s = store.state, gained = jellyGain(s);
  openModal('Begin the Nuptial Flight?',
    `<p>Your queens fly off and found a new colony. Sugar, ants, upgrades and milestones reset. You keep achievements and Heritage.</p>
     <p class="num"><b style="color:#e9e0ff">+${gained} Royal Jelly</b> after ${formatTime(s.clock - s.runStart)} this run. Each unspent jelly is +2% sugar/s.</p>`,
    [
      { label: 'Not yet', style: 'ghost', onClick: closeModal },
      { label: 'Take wing', onClick: () => takeWing(gained) },
    ]);
}

function takeWing(gained) {
  replaceState(nuptialFlight(store.state));
  saveGame(store.state);
  openModal('The queens took wing',
    `<p class="num">You earned <b style="color:#e9e0ff">${gained} Royal Jelly</b>. Spend it on Heritage in the Nest panel, or keep it for +2% sugar for each jelly.</p>
     <p>Each run starts over from the Anthill, but your jelly and Heritage carry you through the early eras faster, so you can push further every time.</p>`,
    [{ label: `Start run ${store.state.flights + 1}`, onClick: closeModal }]);
  store.refresh();
}

export function renderFlight(s) {
  const available = canFly(s);
  byId('flightCard').hidden = !available;
  if (!available) return;
  setText(byId('flGain'), `+${fmt(jellyGain(s))} Royal Jelly`);
  setText(byId('flNext'), `Next jelly at ${fmt(nextJellyAt(s))} sugar this run`);
  byId('flBtn').disabled = jellyGain(s) < 1;
}
