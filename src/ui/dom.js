export const byId = id => document.getElementById(id);

/** Markup for an inline SVG icon that references a <symbol> in index.html. */
export const icon = (symbolId, className = 'ico') =>
  `<svg class="${className}" aria-hidden="true"><use href="#${symbolId}"/></svg>`;

/** Sets an element's text only when it changed, to avoid needless layout work. */
export function setText(el, text) {
  if (el.textContent !== text) el.textContent = text;
}

/** Sets an element's markup only when it changed (so hover and focus survive re-renders). */
export function setHtml(el, html) {
  if (el.innerHTML !== html) el.innerHTML = html;
}

export const percent = (value, of) => `${Math.min(100, (value / of) * 100)}%`;

export const isPhoneLayout = () => matchMedia('(max-width:960px)').matches;
