// The Colony shop (producers) and the Upgrades list.

import {
  CURRENCY_LABEL, PRODUCERS, UPGRADES, UPGRADE_BY_ID, awayCount, buyProducer, buyUpgrade, formatNumber as fmt,
  manaPerSecond, maxAffordable, nestRoom, nextMilestone, producerCost, producerSugarPerSecond, producerUnlocked,
  unitDustPerSecond, unitMilkPerSecond, unitSugarPerSecond, upgradeAvailable, workersPerQueenPerSecond,
} from '../../core/index.js';
import { byId, icon, percent, setHtml, setText } from '../dom.js';
import { store } from '../store.js';
import { flagPanel } from '../tabs.js';

// Rough exchange rates, only used to sort mixed-currency upgrades cheapest first.
const SORT_WEIGHT = { sugar: 1, milk: 500, dust: 1e7 };
const CURRENCY_CLASS = { sugar: '', milk: 'm', dust: 'd' };

export function initShop() {
  byId('prods').innerHTML = PRODUCERS.map(p => `
    <button class="prod" data-id="${p.id}" id="pr-${p.id}">
      ${icon(p.icon)}
      <span class="pname">${p.name}</span>
      <span class="pdesc">${p.desc}</span>
      <span class="pstat num"></span>
      <span class="pside"><span class="powned">0</span><span class="pcost num"></span></span>
    </button>`).join('');

  byId('prods').addEventListener('click', e => {
    const button = e.target.closest('.prod');
    if (!button || button.disabled) return;
    const id = button.dataset.id;
    const count = store.buyAmount === 'max' ? maxAffordable(store.state, id) : store.buyAmount;
    if (buyProducer(store.state, id, count)) store.refresh();
  });
  byId('upgs').addEventListener('click', e => {
    const button = e.target.closest('.upg');
    if (button && buyUpgrade(store.state, button.dataset.id)) store.refresh();
  });
  byId('amt').addEventListener('click', e => {
    const button = e.target.closest('button');
    if (!button) return;
    store.buyAmount = button.dataset.v === 'max' ? 'max' : Number(button.dataset.v);
    for (const b of byId('amt').children) b.setAttribute('aria-pressed', b === button);
    store.refresh();
  });
}

/**
 * Producers are revealed gradually: owned ones, ones you're close to affording, and the one the current
 * milestone asks for. The next unrevealed producer shows as "???".
 */
function isRevealed(s, p, index) {
  return producerUnlocked(s, p.id) && (
    index === 0 || s.owned[p.id] > 0 || s.sugarRun >= p.cost * 0.4 || nextMilestone(s)?.producer === p.id);
}

/** Two lines: what one of these makes, then what all of yours make together. */
function statLines(s, p) {
  const owned = s.owned[p.id];
  if (p.id === 'queen') {
    const each = workersPerQueenPerSecond(s) * 60, room = nestRoom(s);
    // Show the nest limit here too, so the first queen can be judged before The Nest card appears.
    const roomLine = s.owned.worker >= room
      ? `Nest full: ${fmt(s.owned.worker)} / ${fmt(room)} workers`
      : `Nest room: ${fmt(s.owned.worker)} / ${fmt(room)} workers`;
    return `Each: ${fmt(each, 1)} workers/min` + (owned ? `\nAll ${fmt(owned)}: ${fmt(each * owned, 1)} workers/min` : '') + `\n${roomLine}`;
  }
  const manaEach = p.mana ? manaPerSecond(s) / Math.max(1, s.owned.wizard) || p.mana : 0;
  const describe = (sugar, units) => [
    `${fmt(sugar, sugar < 10 ? 2 : 1)} sugar/s`,
    p.milk && `${fmt(unitMilkPerSecond(s, p.id) * units, 2)} milk/s`,
    p.dust && `${fmt(unitDustPerSecond(s, p.id) * units, 2)} stardust/s`,
    p.mana && `${fmt(manaEach * units, 2)} Mana/s`,
  ].filter(Boolean).join(' + ');
  const away = p.id === 'worker' ? awayCount(s) : 0;
  let text = `Each: ${describe(unitSugarPerSecond(s, p.id), 1)}`;
  if (owned) text += `\nAll ${fmt(owned)}: ${describe(producerSugarPerSecond(s, p.id), owned)}` + (away ? ` (${fmt(away)} away)` : '');
  return text;
}

export function renderProducers(s) {
  let mysteryShown = false;
  PRODUCERS.forEach((p, index) => {
    const row = byId('pr-' + p.id), unlocked = producerUnlocked(s, p.id), revealed = isRevealed(s, p, index);
    const show = revealed || !mysteryShown;
    if (!revealed && show) mysteryShown = true;
    row.hidden = !show;
    if (!show) return;

    row.classList.toggle('mystery', !revealed);
    setText(row.querySelector('.pname'), revealed ? p.name : '???');
    setText(row.querySelector('.pdesc'), revealed ? p.desc : unlocked ? 'Keep collecting sugar to find out.' : 'Unlocks with the next milestone.');
    const count = store.buyAmount === 'max' ? Math.max(1, maxAffordable(s, p.id)) : store.buyAmount;
    const cost = producerCost(s, p.id, count);
    setText(row.querySelector('.powned'), fmt(s.owned[p.id]));
    setText(row.querySelector('.pcost'), `${count > 1 ? '×' + count + ' · ' : ''}${fmt(cost)} sugar`);
    setText(row.querySelector('.pstat'), revealed ? statLines(s, p) : '');
    row.disabled = !revealed || s.sugar < cost;
    row.style.setProperty('--pct', revealed ? percent(s.sugar, cost) : '0%');
  });
}

let upgradeListKey = '';

export function renderUpgrades(s) {
  const available = UPGRADES.filter(u => upgradeAvailable(s, u))
    .sort((a, b) => a.cost * SORT_WEIGHT[a.cur] - b.cost * SORT_WEIGHT[b.cur]);
  const key = store.generation + ':' + available.map(u => u.id).join();
  if (key !== upgradeListKey) {
    const previousCount = upgradeListKey.split(':')[1]?.split(',').filter(Boolean).length ?? 0;
    if (available.length > previousCount) flagPanel('p-shop');
    upgradeListKey = key;
    setHtml(byId('upgs'), available.length
      ? available.map(u => `
        <button class="upg" data-id="${u.id}"><span class="un">${u.name}</span><span class="uc num ${CURRENCY_CLASS[u.cur]}">${fmt(u.cost)} ${CURRENCY_LABEL[u.cur]}</span><span class="ud">${u.desc}</span></button>`).join('')
      : '<p class="empty">Nothing yet. Keep growing the colony.</p>');
  }
  for (const button of byId('upgs').querySelectorAll('.upg')) {
    const u = UPGRADE_BY_ID[button.dataset.id];
    button.disabled = s[u.cur] < u.cost;
    button.style.setProperty('--pct', percent(s[u.cur], u.cost));
  }
}
