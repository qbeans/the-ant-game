import { formatNumber } from '../format.js';
import { population } from '../queries.js';

const ownTen = (producer, plural, singular) => ({
  producer,
  req: s => s.owned[producer] >= 10,
  reqText: s => `Own 10 ${plural}: ${Math.min(10, s.owned[producer])} / 10`,
  where: `${singular} is in the Colony shop.`,
});

/**
 * Milestones are bought in order. Each of the first five opens the next era.
 * `sugarMultiplier` is a permanent bonus for the rest of the run.
 */
export const MILESTONES = [
  { id: 'garden', name: 'Claim the Garden', cost: 5000, sugarMultiplier: 1.1,
    req: s => population(s) >= 50,
    reqText: s => `Have 50 ants: ${formatNumber(Math.min(50, population(s)))} / 50`,
    where: 'Worker Ants and Ant Queens both count.',
    effect: 'Opens the Backyard: Ladybug Dairies, Fungus Farms, Picnic Raids and the Patio Run. +10% sugar/s.' },
  { id: 'picnic', name: 'Raid the Picnic', cost: 150e6, sugarMultiplier: 1.25,
    ...ownTen('picnic', 'Picnic Raiding Parties', 'Picnic Raiding Party'),
    effect: 'Takes the picnic table and unlocks the Nuptial Flight. Opens the Neighborhood: Beetle Cavalry, Ant Wizards and Kitchen Cells. +25% sugar/s.' },
  { id: 'market', name: 'Infiltrate the Supermarket', cost: 1e13, sugarMultiplier: 1.25,
    ...ownTen('kitchen', 'Kitchen Infiltration Cells', 'Kitchen Infiltration Cell'),
    effect: 'Every sugar aisle in town is yours. Opens the World: Puppet Governments, Railways and Megaburrows. +25% sugar/s.' },
  { id: 'core', name: 'Tunnel Through the Core', cost: 1e17, sugarMultiplier: 1.25,
    ...ownTen('burrow', 'Supercolony Megaburrows', 'Supercolony Megaburrow'),
    effect: 'One tunnel, straight through the planet. Opens the Solar System: Astronauts, Lunar Mines, Dyson Swarms and Stardust. +25% sugar/s.' },
  { id: 'sun', name: 'Wrap the Sun', cost: 3e21, dust: 20000, sugarMultiplier: 1.25,
    ...ownTen('dyson', 'Dyson Swarms', 'Dyson Swarm'),
    effect: 'The Sun now answers to the Queen. Opens the Galaxy: Wormholes, Chrono-Ants and the Multiverse Anthill. +25% sugar/s.' },
  { id: 'andromeda', name: 'Reach Andromeda', cost: 1e24, dust: 3e5, sugarMultiplier: 1,
    ...ownTen('multiverse', 'Multiverse Anthills', 'Multiverse Anthill'),
    where: 'Multiverse Anthill is the last producer in the Colony shop.',
    effect: 'Plant the flag in the Andromeda Galaxy. The colony is complete.' },
];

/** The milestone that ends the game. */
export const FINAL_MILESTONE = 'andromeda';
