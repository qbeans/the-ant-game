import {
  MANA, SPELLS, SPELL_BY_ID, castSpell, formatNumber as fmt, formatTime, isBuffActive, manaCap, manaPerSecond, spellCost,
} from '../../core/index.js';
import { byId, percent, setText } from '../dom.js';
import { store } from '../store.js';

export function initWizards() {
  byId('spells').innerHTML = SPELLS.map(sp =>
    `<button class="btn ghost spell" data-id="${sp.id}"><b>${sp.name}</b><small class="num"></small><small>${sp.desc}</small></button>`).join('');
  byId('spells').addEventListener('click', e => {
    const button = e.target.closest('.spell');
    if (button && castSpell(store.state, button.dataset.id)) store.refresh();
  });
}

function brewingStatus(s, cap) {
  if (s.mana >= cap - 0.01) return 'Mana is full. Cast a spell.';
  if (s.milk < 1) return 'Out of Bug Milk, so brewing has stopped.';
  const rate = manaPerSecond(s);
  return `Brewing ${fmt(rate, 2)} Mana/s from ${fmt(rate * MANA.milkPerMana, 2)} milk/s`;
}

export function renderWizards(s) {
  if (!s.owned.wizard) return;
  const cap = manaCap(s);
  setText(byId('manaTxt'), `Mana ${fmt(s.mana, 1)} / ${fmt(cap)}`);
  byId('manaBar').style.width = percent(s.mana, cap);
  setText(byId('manaRate'), brewingStatus(s, cap));
  for (const button of byId('spells').children) {
    const spell = SPELL_BY_ID[button.dataset.id], cost = spellCost(s, spell.id);
    const active = spell.duration && isBuffActive(s, spell.id);
    setText(button.children[1], active ? `Active · ${formatTime(s.buffs[spell.id] - s.clock)}` : `${cost} Mana`);
    button.disabled = active || s.mana < cost;
  }
}
