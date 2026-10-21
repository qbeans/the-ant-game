// The sticky bar at the top (resources and running buffs), the era chip, and the sugar cube.

import {
  ERA_NAMES, PANTRY_BUFFS, SPELLS, click, clickValue, dustPerSecond, era, formatNumber as fmt, formatTime,
  isBuffActive, isFeastActive, milkPerSecond, nestRoom, population, rawSugarPerSecond, sugarPerSecond, workerBirthRate,
} from '../../core/index.js';
import { byId, setHtml, setText } from '../dom.js';
import { store } from '../store.js';

const MAX_FLOATING_NUMBERS = 14;

export function initHud() {
  const cube = byId('cube');
  cube.addEventListener('pointerdown', e => {
    e.preventDefault();
    const value = click(store.state);
    const box = byId('cubewrap').getBoundingClientRect();
    floatNumber(e.clientX - box.left + (Math.random() - 0.5) * 20, e.clientY - box.top - 10, value);
    cube.classList.add('press');
    setTimeout(() => cube.classList.remove('press'), 80);
  });
  cube.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    floatNumber(cube.offsetLeft + cube.offsetWidth / 2, cube.offsetTop + 20, click(store.state));
  });
}

/** The "+12" that drifts up from the cube on each click. */
function floatNumber(x, y, value) {
  const wrap = byId('cubewrap');
  if (wrap.querySelectorAll('.pop').length > MAX_FLOATING_NUMBERS) return;
  const el = document.createElement('span');
  el.className = 'pop num';
  el.textContent = '+' + fmt(value, 1);
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function buffChips(s) {
  const left = id => formatTime(s.buffs[id] - s.clock);
  const chips = [];
  for (const b of PANTRY_BUFFS) if (isBuffActive(s, b.id)) chips.push(`<span class="chip ${b.id}">${b.name} ${left(b.id)}</span>`);
  for (const sp of SPELLS) if (sp.duration && isBuffActive(s, sp.id)) chips.push(`<span class="chip spell">${sp.name} ${left(sp.id)}</span>`);
  if (isFeastActive(s)) chips.push(`<span class="chip feast">Royal Feast ${formatTime(s.feastEnd - s.clock)}</span>`);
  return chips.join('');
}

export function renderHud(s) {
  const withBuffs = sugarPerSecond(s), raw = rawSugarPerSecond(s);
  setText(byId('hSugar'), fmt(s.sugar));
  setText(byId('hSps'), `${fmt(withBuffs, 1)} per second` + (withBuffs > raw * 1.01 ? ` (×${fmt(withBuffs / raw, 0)})` : ''));
  setText(byId('hMilk'), fmt(s.milk, 1));
  setText(byId('hMps'), `${fmt(milkPerSecond(s), 2)} per second`);
  setText(byId('hDust'), fmt(s.dust, 1));
  setText(byId('hDps'), `${fmt(dustPerSecond(s), 2)} per second`);
  setText(byId('hAnts'), fmt(population(s)));
  // Like the other resources, the Ants line shows its growth rate: how fast queens are adding workers.
  const nestFull = s.owned.queen > 0 && s.owned.worker >= nestRoom(s);
  setText(byId('hAway'), nestFull ? 'nest full' : `${fmt(workerBirthRate(s), 2)} per second`);
  setHtml(byId('hBuffs'), buffChips(s));

  setText(byId('era'), s.won ? 'Andromeda reached' : `Era ${era(s)} · ${ERA_NAMES[era(s) - 1]}`);
  setText(byId('perClick'), `+${fmt(clickValue(s), 1)} per click`);
  byId('cube').classList.toggle('flood', isBuffActive(s, 'flood'));
}
