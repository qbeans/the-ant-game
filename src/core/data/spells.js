/**
 * Spells cost Mana. Spells with a `duration` are timed buffs and carry the multipliers they apply;
 * the rest have an instant effect handled in core/actions.js.
 */
export const SPELLS = [
  { id: 'conjure', name: 'Conjure Crumbs', cost: 15, desc: 'Gain 10 minutes of sugar/s right now.' },
  { id: 'shortcut', name: 'Pheromone Shortcut', cost: 20, desc: 'Every expedition that is out comes home 5 minutes sooner.',
    needsExpedition: true },
  { id: 'poly', name: 'Polymorph Ladybugs', cost: 25, duration: 60, desc: 'Bug Milk ×5 for 60s.', milkMultiplier: 5 },
  { id: 'summon', name: 'Summon Picnic', cost: 35, desc: 'Put a Picnic Basket in the Pantry.' },
  { id: 'hex', name: 'Hex of the Magnifying Glass', cost: 40, duration: 30, sugarMultiplier: 3,
    desc: '×3 sugar/s for 30s. A 1 in 20 chance it backfires and burns 10% of your sugar.' },
];

export const SPELL_BY_ID = Object.fromEntries(SPELLS.map(x => [x.id, x]));
