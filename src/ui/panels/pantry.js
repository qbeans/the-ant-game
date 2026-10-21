import { PANTRY_BUFFS, useBuff } from '../../core/index.js';
import { byId, icon, setText } from '../dom.js';
import { store } from '../store.js';

export function initPantry() {
  byId('pantry').innerHTML = PANTRY_BUFFS.map(b => `
    <button class="buff" data-id="${b.id}" id="bf-${b.id}">
      ${icon(b.icon)}<span class="n">${b.name}</span><span class="c num">0</span><span class="d">${b.desc}</span>
    </button>`).join('');
  byId('pantry').addEventListener('click', e => {
    const button = e.target.closest('.buff');
    if (button && useBuff(store.state, button.dataset.id)) store.refresh();
  });
}

export function renderPantry(s) {
  for (const b of PANTRY_BUFFS) {
    const button = byId('bf-' + b.id);
    setText(button.querySelector('.c'), '×' + s.pantry[b.id]);
    button.disabled = !s.pantry[b.id];
  }
}
