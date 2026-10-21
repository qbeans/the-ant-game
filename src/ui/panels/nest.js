// The Nest card (room, chambers, Royal Feast) and the caption under the colony view.

import {
  chamberCost, digChamber, feastCost, feastDuration, formatNumber as fmt, formatTime, isFeastActive, nestRoom,
  roomPerChamber, royalFeast, workerBirthRate,
} from '../../core/index.js';
import { byId, percent, setText } from '../dom.js';
import { store } from '../store.js';

export function initNest() {
  byId('digBtn').addEventListener('click', () => { if (digChamber(store.state)) store.refresh(); });
  byId('feastBtn').addEventListener('click', () => { if (royalFeast(store.state)) store.refresh(); });
}

export function renderNest(s) {
  const room = nestRoom(s), workers = s.owned.worker, full = workers >= room, queens = s.owned.queen;
  const perMinute = workerBirthRate(s) * 60;

  setText(byId('nestTxt'), `Workers ${fmt(workers)} / ${fmt(room)} room`);
  setText(byId('nestRate'), !queens ? '' : full ? 'Nest full. Dig a chamber so queens can make more.' : `Queens make ${fmt(perMinute, 1)} workers per minute`);
  byId('nestBar').style.width = percent(workers, room);

  setText(byId('cfBrood'), `Workers ${fmt(workers)} / ${fmt(room)} room · ${fmt(s.chambers + 1)} chambers`);
  setText(byId('cfLay'), queens ? `${queens} ${queens === 1 ? 'queen' : 'queens'} · ${full ? 'nest full' : fmt(perMinute, 1) + ' workers/min'}` : 'No queen yet');

  setText(byId('digCost'), `${fmt(chamberCost(s))} sugar · +${roomPerChamber(s)} room`);
  byId('digBtn').disabled = s.sugar < chamberCost(s);

  const feasting = isFeastActive(s);
  setText(byId('feastCost'), feasting ? `Feasting · ${formatTime(s.feastEnd - s.clock)}` : `${feastCost(s)} milk · queens ×5 for ${feastDuration(s)}s`);
  byId('feastBtn').disabled = feasting || s.milk < feastCost(s) || !queens;
}
