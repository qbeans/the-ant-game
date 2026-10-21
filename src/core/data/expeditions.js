/**
 * Timed trips that take a squad of Worker Ants away and bring back loot.
 * `rollLoot(loot)` receives helpers from core/actions.js; random rolls happen in the order written here.
 * `risk` is the chance of losing part of the squad to `hazard`.
 */
export const EXPEDITIONS = [
  { id: 'scout', name: 'Scout the Garden', duration: 60, squad: 10, risk: 0, era: 1, icon: 'i-leaf',
    lootText: 'Sugar. Sometimes a Sugar Rush.',
    rollLoot: loot => { loot.sugarSeconds(90, 30); loot.buff('rush', 0.25); } },
  { id: 'patio', name: 'Patio Run', duration: 300, squad: 50, risk: 0, era: 2, icon: 'i-flag',
    lootText: 'Sugar and Bug Milk. Often a Picnic Basket.',
    rollLoot: loot => { loot.sugarSeconds(300); loot.milkSeconds(120, 10); loot.buff('basket', 0.4); loot.buff('rush', 0.35); } },
  { id: 'recon', name: 'Picnic Recon', duration: 900, squad: 200, risk: 0.15, hazard: 'anteater', era: 2, icon: 'i-basket',
    needs: s => s.owned.picnic >= 1,
    lootText: 'A Picnic Basket and a Honey Flood. Maybe a Popsicle Chunk.',
    rollLoot: loot => { loot.buff('basket'); loot.buff('flood'); loot.buff('popsicle', 0.6); } },
  { id: 'heist', name: 'Kitchen Heist', duration: 600, squad: 1000, risk: 0.1, hazard: 'house cat', era: 3, icon: 'i-pop',
    lootText: 'Lots of sugar and Mana. Often a Honey Flood or a Popsicle Chunk.',
    rollLoot: loot => { loot.sugarSeconds(1200); loot.mana(25); loot.buff('flood', 0.5); loot.buff('popsicle', 0.5); } },
  { id: 'march', name: 'Continental March', duration: 1200, squad: 5000, risk: 0.1, hazard: 'flock of seagulls', era: 4, icon: 'i-flag',
    lootText: 'A mountain of sugar, two Picnic Baskets and a Popsicle Chunk.',
    rollLoot: loot => { loot.sugarSeconds(1800); loot.buff('basket'); loot.buff('basket'); loot.buff('popsicle'); loot.buff('rush', 0.5); } },
  { id: 'comet', name: 'Comet Harvest', duration: 900, squad: 10000, risk: 0.05, hazard: 'solar flare', era: 5, icon: 'i-bolt',
    lootText: 'Stardust and two Sugar Rushes. Sometimes a Popsicle Chunk.',
    rollLoot: loot => { loot.dustSeconds(600, 200); loot.buff('rush'); loot.buff('rush'); loot.buff('popsicle', 0.3); } },
];

export const EXPEDITION_BY_ID = Object.fromEntries(EXPEDITIONS.map(e => [e.id, e]));
