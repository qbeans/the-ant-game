import { HERITAGE, HERITAGE_BY_ID, JELLY, buyHeritage, formatNumber as fmt, heritageUnlocked } from '../../core/index.js';
import { byId, setText } from '../dom.js';
import { store } from '../store.js';

export function initHeritage() {
  byId('herit').addEventListener('click', e => {
    const button = e.target.closest('.upg');
    if (button && buyHeritage(store.state, button.dataset.id)) store.refresh();
  });
}

let listKey = '';

function priceLabel(s, h) {
  if (s.heritage[h.id]) return 'Owned';
  if (!heritageUnlocked(s, h)) return `Needs ${HERITAGE_BY_ID[h.needs].name}`;
  return `${fmt(h.cost)} jelly`;
}

export function renderHeritage(s) {
  const show = s.flights > 0 || s.jelly > 0;
  byId('heritCard').hidden = !show;
  if (!show) return;
  setText(byId('jellyHave'), `You have ${fmt(s.jelly)} Royal Jelly (+${Math.round(s.jelly * JELLY.bonusPerUnspent * 100)}% sugar/s while unspent).`);
  // Rebuild only when ownership changes, so a button isn't replaced mid-click.
  const key = HERITAGE.map(h => priceLabel(s, h)).join('|');
  if (key !== listKey) {
    listKey = key;
    byId('herit').innerHTML = HERITAGE.map(h => `
      <button class="upg ${s.heritage[h.id] ? 'own' : ''}" data-id="${h.id}"><span class="un">${h.name}</span><span class="uc num">${priceLabel(s, h)}</span><span class="ud">${h.desc}</span></button>`).join('');
  }
  for (const button of byId('herit').querySelectorAll('.upg')) {
    const h = HERITAGE_BY_ID[button.dataset.id];
    button.disabled = !!s.heritage[h.id] || !heritageUnlocked(s, h) || s.jelly < h.cost;
  }
}
