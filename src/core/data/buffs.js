/**
 * Buffs stored in the Pantry and used whenever the player chooses.
 * Timed buffs carry the multipliers they apply while active; the Popsicle Chunk pays out instantly instead.
 */
export const PANTRY_BUFFS = [
  { id: 'rush', name: 'Sugar Rush', duration: 120, icon: 'i-bolt', desc: '×2 sugar/s for 2 min', sugarMultiplier: 2 },
  { id: 'basket', name: 'Picnic Basket', duration: 60, icon: 'i-basket', desc: '×7 sugar/s for 60s', sugarMultiplier: 7 },
  { id: 'flood', name: 'Honey Flood', duration: 13, icon: 'i-drop', desc: '×77 per click for 13s', clickMultiplier: 77 },
  { id: 'popsicle', name: 'Popsicle Chunk', duration: 0, icon: 'i-pop', desc: '15 min of sugar/s, now', instant: true },
];

export const PANTRY_BUFF_BY_ID = Object.fromEntries(PANTRY_BUFFS.map(b => [b.id, b]));
