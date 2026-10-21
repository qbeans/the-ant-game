import { era } from '../core/index.js';
import { byId } from './dom.js';
import { store } from './store.js';

const HEADLINES = {
  1: ['Local ant carries crumb 50 times her body weight. Crumb unimpressed.',
    'Queen announces she is "eating for four thousand."',
    'Aphids report feeling "gently milked, deeply valued."',
    'Experts warn the sugar cube "may be finite." Colony disagrees.',
    'Worker asks for a day off. Is told days are a human idea.',
    'Nest Chamber 3 voted "the cozy one" for the third week running.'],
  2: ['Ladybugs unionize, demand fewer milkings and more aphids.',
    'Garden gnome reported missing. Colony denies involvement.',
    'Leafcutters insist the mushrooms "taste like leaves, but better."',
    'Picnic guest baffled by sandwich that "just walked off."',
    'Cat stares at patio for six hours. Ants consider her a fan.',
    'Backyard property values fall for everyone except the ants.'],
  3: ['The picnic table has fallen. Napkin flags fly over the potato salad.',
    'Winged queens seen stretching on the mound. "Big trip coming," sources say.',
    'Humans move picnic indoors. Colony notes the kitchen has a door gap.',
    'Beetle Cavalry parade blocks the sidewalk for six hours. Nobody complains twice.',
    'Ant wizard denies turning a beetle into a slightly larger beetle.',
    'Local cat retires after a "tense standoff" in the pantry.'],
  4: ['UN admits it has been four thousand ants in a trench coat since 2031.',
    'Ant Express Railway posts 100% on-time record. Humans demand to know how.',
    'Sugar futures collapse as the colony corners the global market.',
    'Geologists puzzled by a tunnel that comes out the other side of the planet.'],
  5: ['NASA confused by tiny footprints on the Moon. Six of them. Many times.',
    'Astronaut ants refuse to come home. "The sugar is lighter up here."',
    'The Sun is now 4% ant by volume. Experts call it "a lot of ants."'],
  6: ['Wormhole trail delivers crumbs from next Tuesday. Next Tuesday is upset.',
    'Chrono-ants report meeting their own grandmothers. Grandmothers unimpressed.',
    'Andromeda Galaxy issues a travel warning: "Hide your picnics."'],
};

export const NEWS_INTERVAL_MS = 12000;
let index = 0;

/** Headlines for the current era. Past the Backyard, the current era's news shows twice as often as the last era's. */
function headlinePool(e) {
  if (e < 3) return [...HEADLINES[1], ...(e >= 2 ? HEADLINES[2] : [])];
  return [...HEADLINES[e], ...HEADLINES[e], ...HEADLINES[e - 1]];
}

export function rotateNews() {
  const pool = headlinePool(era(store.state));
  const el = byId('news');
  el.style.opacity = 0;
  setTimeout(() => { el.textContent = pool[index++ % pool.length]; el.style.opacity = 1; }, 400);
}
