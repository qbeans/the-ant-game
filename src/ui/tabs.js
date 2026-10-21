// On phones the three panels become tabs. A dot marks a tab with something new.

import { byId, isPhoneLayout } from './dom.js';

const DOT_FOR_PANEL = { 'p-nest': 'nestDot', 'p-shop': 'shopDot' };

/** Marks a panel's tab as having news, unless it's the one already showing. */
export function flagPanel(panelId) {
  const dot = DOT_FOR_PANEL[panelId];
  if (dot && !byId(panelId).classList.contains('on') && isPhoneLayout()) byId(dot).hidden = false;
}

export function showPanel(panelId) {
  for (const tab of document.querySelectorAll('.tabs button')) tab.setAttribute('aria-selected', tab.dataset.tab === panelId);
  for (const panel of document.querySelectorAll('.panel')) panel.classList.toggle('on', panel.id === panelId);
  if (DOT_FOR_PANEL[panelId]) byId(DOT_FOR_PANEL[panelId]).hidden = true;
}

export function wireTabs(onChange) {
  document.querySelector('.tabs').addEventListener('click', e => {
    const tab = e.target.closest('button');
    if (!tab) return;
    showPanel(tab.dataset.tab);
    onChange();
  });
}
