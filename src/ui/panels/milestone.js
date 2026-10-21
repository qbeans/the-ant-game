import { MILESTONES, buyMilestone, canBuyMilestone, formatNumber as fmt, nextMilestone } from '../../core/index.js';
import { byId, percent, setHtml, setText } from '../dom.js';
import { store } from '../store.js';

export function initMilestone() {
  byId('msBuy').addEventListener('click', () => {
    const m = nextMilestone(store.state);
    if (m && buyMilestone(store.state, m.id)) store.refresh();
  });
}

export function renderMilestone(s) {
  const m = nextMilestone(s);
  byId('msCard').hidden = !m || !s.seen.milestone;
  if (!m) return;
  const met = m.req(s);
  setText(byId('msEyebrow'), `Milestone ${MILESTONES.indexOf(m) + 1} of ${MILESTONES.length}`);
  setText(byId('msName'), m.name);
  setText(byId('msEffect'), m.effect);
  byId('msTick').className = 'tick' + (met ? ' ok' : '');
  setText(byId('msTick'), met ? '✓' : '');
  setHtml(byId('msReq'), `<span><b class="num">${m.reqText(s)}</b><br>${m.where}</span>`);
  byId('msBar').style.width = percent(s.sugar, m.cost);
  setText(byId('msCost'), `${fmt(Math.min(s.sugar, m.cost))} / ${fmt(m.cost)} sugar`
    + (m.dust ? ` · ${fmt(Math.min(s.dust, m.dust))} / ${fmt(m.dust)} stardust` : ''));
  byId('msBuy').disabled = !canBuyMilestone(s, m);
}
