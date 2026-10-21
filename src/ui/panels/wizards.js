import {
  MANA, SPELLS, SPELL_BY_ID, castSpell, formatNumber as fmt, formatTime, isBuffActive, manaCap, manaPerSecond, spellCost,
  spellUsable,
} from '../../core/index.js';
import { byId, percent, setText } from '../dom.js';
import { store } from '../store.js';

export function initWizards() {
  byId('spells').innerHTML = SPELLS.map(sp =>
    `<button class="btn ghost spell" data-id="${sp.id}">
      <span class="spell-head"><b>${sp.name}</b><span class="spell-cost num"></span></span>
      <small>${sp.desc}</small>
    </button>`).join('');
  byId('spells').addEventListener('click', e => {
    const button = e.target.closest('.spell');
    if (button && castSpell(store.state, button.dataset.id)) store.refresh();
  });
}

function brewingStatus(s, cap) {
  if (!s.owned.wizard) return 'Build an Ant Wizard Tower to brew Mana and cast spells.';
  if (s.mana >= cap - 0.01) return 'Mana is full. Cast a spell.';
  if (s.milk < 1) return 'Out of Bug Milk, so brewing has stopped.';
  const rate = manaPerSecond(s);
  return `Brewing ${fmt(rate, 2)} Mana/s from ${fmt(rate * MANA.milkPerMana, 2)} milk/s`;
}

// Always render, even with no towers: after a Nuptial Flight the card must show the new run's Mana (0), not the last run's.
export function renderWizards(s) {
  const cap = manaCap(s);
  setText(byId('manaTxt'), `Mana ${fmt(s.mana, 1)} / ${fmt(cap)}`);
  byId('manaBar').style.width = percent(s.mana, cap);
  setText(byId('manaRate'), brewingStatus(s, cap));
  for (const button of byId('spells').children) {
    const spell = SPELL_BY_ID[button.dataset.id], cost = spellCost(s, spell.id);
    const active = spell.duration && isBuffActive(s, spell.id);
    const price = button.querySelector('.spell-cost');
    setText(price, active ? `Active ${formatTime(s.buffs[spell.id] - s.clock)}` : `${cost} Mana`);
    price.classList.toggle('active', !!active);
    button.disabled = !s.owned.wizard || active || s.mana < cost || !spellUsable(s, spell.id);
  }
}
