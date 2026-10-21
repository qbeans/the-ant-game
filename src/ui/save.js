import { applyOfflineTime, createState, formatNumber, formatTime, migrateState } from '../core/index.js';
import { toast } from './toast.js';

// Kept from the game's earlier name so existing saves still load.
const SAVE_KEY = 'anthill-to-andromeda-v1';
const MIN_OFFLINE_SECONDS = 10;

export function serialize(s) {
  s.lastSave = Date.now();
  return JSON.stringify(s);
}

/** Saves to this browser. Storage can be unavailable (private windows, previews), so failures are ignored. */
export function saveGame(s) {
  try { localStorage.setItem(SAVE_KEY, serialize(s)); } catch { /* storage unavailable */ }
}

/**
 * Loads a save (from a hot-reload snapshot or this browser) and credits time spent away.
 * Falls back to a new game if there's nothing usable.
 */
export function loadGame(snapshot) {
  let text = snapshot;
  if (!text) {
    try { text = localStorage.getItem(SAVE_KEY); } catch { /* storage unavailable */ }
  }
  if (!text) return createState();
  try {
    const s = migrateState(JSON.parse(text));
    const secondsAway = (Date.now() - (s.lastSave || Date.now())) / 1000;
    if (!snapshot && secondsAway > MIN_OFFLINE_SECONDS) {
      const { sugar, seconds } = applyOfflineTime(s, secondsAway);
      if (sugar > 1) setTimeout(() => toast(`While you were away (${formatTime(seconds)}), the colony gathered <b>${formatNumber(sugar)}</b> sugar.`), 600);
    }
    return s;
  } catch {
    return createState();
  }
}
