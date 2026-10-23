import {
  EXPEDITIONS, awayCount, expeditionAvailable, expeditionDuration, expeditionRisk, formatNumber as fmt, formatTime,
  sendExpedition, workersHome,
} from '../../core/index.js';
import { byId, icon, percent, setText } from '../dom.js';
import { store } from '../store.js';

export function initExpeditions() {
  byId('exps').innerHTML = EXPEDITIONS.map(e => `
    <div class="exp" id="ex-${e.id}">
      ${icon(e.icon)}
      <div><div class="t">${e.name}</div><div class="loot">${e.lootText}</div></div>
      <div class="act"><button class="btn" data-id="${e.id}">Send</button></div>
      <div class="meta num"><span class="md"></span>${e.risk ? ' · <span class="risk"></span>: lose 25% of squad' : ''}</div>
      <div class="prog" hidden><div class="bar"><i></i></div><span></span></div>
    </div>`).join('');
  byId('exps').addEventListener('click', e => {
    const button = e.target.closest('.btn');
    if (button && sendExpedition(store.state, button.dataset.id)) store.refresh();
  });
}

export function renderExpeditions(s) {
  const home = workersHome(s), away = awayCount(s);
  // Only Worker Ants who aren't already out can join a squad, so count exactly those (queens never go).
  setText(byId('expHome'), `${fmt(home)} Worker Ants free to send` + (away ? ` · ${fmt(away)} out on expeditions` : ''));
  for (const e of EXPEDITIONS) {
    const row = byId('ex-' + e.id);
    row.hidden = !expeditionAvailable(s, e);
    if (row.hidden) continue;
    setText(row.querySelector('.md'), `${e.squad} ants · ${formatTime(expeditionDuration(s, e))}`);
    if (e.risk) setText(row.querySelector('.risk'), `${Math.round(expeditionRisk(s, e) * 100)}% ${e.hazard} risk`);

    const run = s.exp[e.id], button = row.querySelector('.btn'), progress = row.querySelector('.prog');
    progress.hidden = !run;
    button.hidden = !!run;
    if (run) {
      progress.querySelector('i').style.width = percent(s.clock - run.start, run.end - run.start);
      setText(progress.querySelector('span'), formatTime(run.end - s.clock));
    } else {
      button.disabled = home < e.squad;
      setText(button, home < e.squad ? `Need ${e.squad}` : 'Send');
    }
  }
}
