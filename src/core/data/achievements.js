import { rawSugarPerSecond } from '../economy.js';
import { isBuffActive, population } from '../queries.js';

const sugarTotal = (id, name, amount, label) =>
  ({ id, name, desc: `Collect ${label} sugar.`, test: s => s.sugarAll >= amount });
const sugarRate = (id, name, amount, label) =>
  ({ id, name, desc: `Make ${label} sugar/s.`, test: s => rawSugarPerSecond(s) >= amount });
const own = (id, name, producer, count, label, verb = 'Own') =>
  ({ id, name, desc: `${verb} ${count} ${label}.`, test: s => s.owned[producer] >= count });
const milestone = (id, name, milestoneId, label) =>
  ({ id, name, desc: `${label}.`, test: s => !!s.milestones[milestoneId] });

/** Each achievement adds to the Achievement Bonus. They are kept across Nuptial Flights. */
export const ACHIEVEMENTS = [
  sugarTotal('crumb', 'First Crumb', 1, 'your first'),
  { id: 'tap100', name: 'Tap Dancer', desc: 'Click 100 times.', test: s => s.clicks >= 100 },
  { id: 'tap1k', name: 'Antennae Cramp', desc: 'Click 1,000 times.', test: s => s.clicks >= 1000 },
  sugarTotal('s1k', 'Sweet Start', 1e3, '1,000'),
  sugarTotal('s100k', 'Sugar Hoard', 1e5, '100K'),
  sugarTotal('s10m', 'Sugar Mountain', 1e7, '10M'),
  sugarTotal('s1b', 'Sugar Continent', 1e9, '1B'),
  sugarTotal('s1t', 'Sugar Planet', 1e12, '1T'),
  sugarTotal('s1qa', 'Sugar Star', 1e15, '1Qa'),
  sugarTotal('s1qi', 'Sugar Galaxy', 1e18, '1Qi'),
  sugarRate('ps10', 'Trickle', 10, '10'),
  sugarRate('ps1k', 'Stream', 1e3, '1,000'),
  sugarRate('ps100k', 'Flood Plain', 1e5, '100K'),
  sugarRate('ps1b', 'Sugar Monsoon', 1e9, '1B'),
  own('w10', 'Ten Little Workers', 'worker', 10, 'Worker Ants', 'Have'),
  own('w50', 'Workforce', 'worker', 50, 'Worker Ants', 'Have'),
  own('w100', 'Labor Movement', 'worker', 100, 'Worker Ants', 'Have'),
  own('q10', 'Royal Court', 'queen', 10, 'Ant Queens'),
  own('q25', 'Too Many Crowns', 'queen', 25, 'Ant Queens'),
  { id: 'pop100', name: 'Six Legs, One Dream', desc: 'Have 100 ants.', test: s => population(s) >= 100 },
  { id: 'pop1k', name: 'Hill of a Time', desc: 'Have 1,000 ants.', test: s => population(s) >= 1000 },
  { id: 'pop10k', name: 'Supercolony', desc: 'Have 10,000 ants.', test: s => population(s) >= 10000 },
  own('aphid10', 'Honeydew Ranch', 'aphid', 10, 'Aphid Ranches'),
  own('lady25', 'Udderly Ridiculous', 'ladybug', 25, 'Ladybug Dairies'),
  own('fungi10', 'Fun Guys', 'fungus', 10, 'Fungus Farms'),
  own('beetle10', 'Cavalry Charge', 'beetle', 10, 'Beetle Cavalry'),
  own('wiz10', 'Hat Trick', 'wizard', 10, 'Ant Wizard Towers'),
  own('puppet10', 'Six-Legged Senate', 'puppet', 10, 'Puppet Governments'),
  { id: 'astro1', name: 'One Small Step for Ant', desc: 'Start an Ant Astronaut Program.', test: s => s.owned.astro >= 1 },
  { id: 'feast', name: 'Let Them Drink Milk', desc: 'Throw a Royal Feast.', test: s => s.feasts >= 1 },
  { id: 'spell1', name: 'Abracadabrant', desc: 'Cast a spell.', test: s => s.spells >= 1 },
  { id: 'backfire', name: 'Smoke and Mirrors', desc: 'Have a Hex backfire.', test: s => s.backfires >= 1 },
  { id: 'exp1', name: 'Back by Dinner', desc: 'Finish an expedition.', test: s => s.expDone >= 1 },
  { id: 'exp10', name: 'Seasoned Travelers', desc: 'Finish 10 expeditions.', test: s => s.expDone >= 10 },
  { id: 'anteater', name: 'Close Shave', desc: 'Lose ants on an expedition.', test: s => s.anteaters >= 1 },
  { id: 'combo', name: 'Picnic Combo', desc: 'Have a Picnic Basket and a Sugar Rush running at once.',
    test: s => isBuffActive(s, 'basket') && isBuffActive(s, 'rush') },
  milestone('gardenA', 'Garden Variety', 'garden', 'Claim the Garden'),
  milestone('picnicA', 'Blanket Statement', 'picnic', 'Raid the Picnic'),
  milestone('marketA', 'Midnight Snack', 'market', 'Infiltrate the Supermarket'),
  milestone('coreA', 'Journey to the Center', 'core', 'Tunnel Through the Core'),
  milestone('sunA', 'Here Comes the Sun', 'sun', 'Wrap the Sun'),
  milestone('endA', 'Anthill to Andromeda', 'andromeda', 'Reach Andromeda'),
  { id: 'flight', name: 'Nuptial Flight', desc: 'Send queens on a Nuptial Flight.', test: s => s.flights >= 1 },
  { id: 'flight5', name: 'Frequent Flyer', desc: 'Take 5 Nuptial Flights.', test: s => s.flights >= 5 },
];
