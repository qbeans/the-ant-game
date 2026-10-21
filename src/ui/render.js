import { markColonyDirty } from './colony/canvas.js';
import { applyReveals } from './reveals.js';
import { store } from './store.js';
import { renderExpeditions } from './panels/expeditions.js';
import { renderFlight } from './panels/flight.js';
import { renderHeritage } from './panels/heritage.js';
import { renderHud } from './panels/hud.js';
import { renderMilestone } from './panels/milestone.js';
import { renderNest } from './panels/nest.js';
import { renderPantry } from './panels/pantry.js';
import { renderRecords } from './panels/records.js';
import { renderProducers, renderUpgrades } from './panels/shop.js';
import { renderWizards } from './panels/wizards.js';

/** Brings every visible part of the page up to date with the current state. */
export function render() {
  const s = store.state;
  if (applyReveals()) markColonyDirty();
  renderHud(s);
  renderNest(s);
  renderMilestone(s);
  renderFlight(s);
  renderExpeditions(s);
  renderPantry(s);
  renderWizards(s);
  renderProducers(s);
  renderUpgrades(s);
  renderHeritage(s);
  renderRecords(s);
}
