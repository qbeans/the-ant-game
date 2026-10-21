import { byId } from './dom.js';

const MAX_TOASTS = 4;
const TOAST_MS = 6000;

/** Shows a short notification in the corner. `html` is trusted game text. */
export function toast(html, { bad = false } = {}) {
  const container = byId('toasts');
  const el = document.createElement('div');
  el.className = 'toast' + (bad ? ' bad' : '');
  el.innerHTML = html;
  container.appendChild(el);
  while (container.children.length > MAX_TOASTS) container.firstChild.remove();
  setTimeout(() => el.remove(), TOAST_MS);
}
