import { byId } from './dom.js';

/**
 * Opens the in-page dialog. `actions` is a list of { label, style, onClick }; the last one gets focus.
 * The viewer blocks alert/confirm, so every confirmation goes through here.
 */
export function openModal(title, bodyHtml, actions) {
  byId('mTitle').textContent = title;
  byId('mBody').innerHTML = bodyHtml;
  const row = byId('mActions');
  row.innerHTML = '';
  for (const { label, style = '', onClick } of actions) {
    const button = document.createElement('button');
    button.className = `btn ${style}`.trim();
    button.textContent = label;
    button.addEventListener('click', onClick);
    row.appendChild(button);
  }
  byId('modal').hidden = false;
  row.lastChild.focus();
}

export function closeModal() {
  byId('modal').hidden = true;
}
