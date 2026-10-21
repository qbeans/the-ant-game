// Records: run stats, achievements, and the playtest controls (game speed, wipe save).

import {
  ACHIEVEMENTS, MILESTONES, achievementCount, createState, formatNumber as fmt, formatTime, pheromoneBonus,
} from '../../core/index.js';
import { byId, setHtml, setText } from '../dom.js';
import { closeModal, openModal } from '../modal.js';
import { saveGame } from '../save.js';
import { replaceState, store } from '../store.js';

export function initRecords() {
  byId('achs').innerHTML = ACHIEVEMENTS.map(a => `<div class="ach" id="ac-${a.id}"><b>${a.name}</b>${a.desc}</div>`).join('');
  byId('records').addEventListener('toggle', () => store.refresh());
  byId('speed').addEventListener('click', e => {
    const button = e.target.closest('button');
    if (!button) return;
    store.speed = Number(button.dataset.v);
    for (const b of byId('speed').children) b.setAttribute('aria-pressed', b === button);
  });
  byId('resetBtn').addEventListener('click', () => {
    openModal('Wipe your save?', '<p>This deletes all progress, including Royal Jelly and Heritage. It cannot be undone.</p>', [
      { label: 'Keep my colony', style: 'ghost', onClick: closeModal },
      { label: 'Wipe save', style: 'danger', onClick: () => {
        replaceState(createState());
        saveGame(store.state);
        closeModal();
        store.refresh();
      } },
    ]);
  });
}

export function renderRecords(s) {
  if (!byId('records').open) return;
  const rows = [
    ['This run', formatTime(s.clock - s.runStart)],
    ['Sugar this run', fmt(s.sugarRun)],
    ['Sugar all time', fmt(s.sugarAll)],
    ['Clicks', fmt(s.clicks)],
    ['Pheromone Trail', `+${Math.round(pheromoneBonus(s) * 100)}% sugar/s`],
    ['Expeditions', fmt(s.expDone)],
    ['Spells cast', fmt(s.spells)],
    ['Stardust all time', fmt(s.dustAll)],
    ['Nuptial Flights', fmt(s.flights)],
  ];
  for (const m of MILESTONES) if (s.milestones[m.id]) rows.push([m.name, 'at ' + formatTime(s.milestones[m.id])]);
  if (s.lastFlight) rows.push(['Last flight', `${formatTime(s.lastFlight.time)} · +${s.lastFlight.jelly} jelly`]);
  setHtml(byId('stats'), rows.map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`).join(''));
  setText(byId('achHead'), `Achievements · ${achievementCount(s)} of ${ACHIEVEMENTS.length}`);
  for (const a of ACHIEVEMENTS) byId('ac-' + a.id).classList.toggle('got', !!s.achievements[a.id]);
}
