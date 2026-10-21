// Entry point: loads the save, builds the page, and runs the game loop.

import { tick } from './core/index.js';
import { markColonyDirty, startColony } from './ui/colony/canvas.js';
import { handleEvents } from './ui/notifications.js';
import { rotateNews } from './ui/news.js';
import { render } from './ui/render.js';
import { loadGame, saveGame, serialize } from './ui/save.js';
import { replaceState, store } from './ui/store.js';
import { wireTabs } from './ui/tabs.js';
import { initExpeditions } from './ui/panels/expeditions.js';
import { initFlight } from './ui/panels/flight.js';
import { initHeritage } from './ui/panels/heritage.js';
import { initHud } from './ui/panels/hud.js';
import { initMilestone } from './ui/panels/milestone.js';
import { initNest } from './ui/panels/nest.js';
import { initPantry } from './ui/panels/pantry.js';
import { initRecords } from './ui/panels/records.js';
import { initShop } from './ui/panels/shop.js';
import { initWizards } from './ui/panels/wizards.js';

const FRAME_MS = 100;
const MAX_STEP_SECONDS = 0.5;   // keeps expeditions and buffs ending on time when catching up
const MAX_CATCH_UP_SECONDS = 3600;
const AUTOSAVE_MS = 30000;

function refresh() {
  handleEvents();
  render();
}

/** Advances the game by the real time since the last frame, times the playtest speed. */
function startLoop() {
  let last = performance.now();
  setInterval(() => {
    const now = performance.now();
    let remaining = Math.min(MAX_CATCH_UP_SECONDS, (now - last) / 1000) * store.speed;
    last = now;
    while (remaining > 0) {
      const step = Math.min(remaining, MAX_STEP_SECONDS);
      tick(store.state, step);
      remaining -= step;
    }
    refresh();
  }, FRAME_MS);
}

function start(hotData) {
  replaceState(loadGame(hotData?.save));
  store.refresh = refresh;

  initHud(); initNest(); initMilestone(); initFlight(); initWizards(); initExpeditions();
  initPantry(); initShop(); initHeritage(); initRecords();
  wireTabs(markColonyDirty);

  rotateNews(); // schedules itself from here on
  setInterval(() => saveGame(store.state), AUTOSAVE_MS);
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(store.state); });

  render();
  startLoop();
  startColony();
}

// When the page is updated while open, the viewer can hand the old state to the new page.
window.claude?.hot?.snapshot?.(() => ({ save: store.state ? serialize(store.state) : null }));
if (window.claude?.hot?.ready) window.claude.hot.ready(start);
else start(window.claude?.hot?.data ?? {});
