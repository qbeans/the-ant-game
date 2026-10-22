import { PRODUCERS } from './producers.js';
import { TIER_THRESHOLDS, TIER_COST_MULTIPLIERS } from '../constants.js';
import { achievementCount, era } from '../queries.js';

/**
 * One-time purchases. `cur` is the currency (sugar, milk or dust), `unlock` decides when it shows up in the shop,
 * and `effects` is a list of modifiers read by core/effects.js.
 */

const TIER_NAMES = {
  worker: ['Six-Legged Sprint', 'Crumb Backpacks', 'Pheromone Maps', 'Union Lunch Breaks', 'Ant-tique Wisdom'],
  queen: ['Royal Bassinets', 'Nursery Conveyor Belt', 'Tiny Crowns', "Queen's Gambit", 'Matriarchy'],
  aphid: ['Aphid Lullabies', 'Honeydew Buckets', 'Aphid Spa Day', 'Selective Breeding', 'Aphid Cowboys'],
  ladybug: ['Ladybug Yoga', 'Spotted Pastures', 'Milking Stools (Tiny)', 'Dairy Co-op', 'Udder Nonsense'],
  fungus: ['Compost Tea', 'Leaf Shredders', 'Mycelium Network', 'Shiitake Happens', 'Fungal Fortune'],
  picnic: ['Napkin Camouflage', 'Sandwich Cartography', 'Grape Catapults', 'Blanket Siege Tactics', 'Potato Salad Doctrine'],
  beetle: ['Saddle Polish', 'Horn Sharpening', 'Thundering Hooves (Six)', 'Beetle Ballet', 'The Long Charge'],
  wizard: ['Wizard Hats (Tiny)', 'Spellbook Abridgments', 'Familiar Fleas', 'Arcane Antennae', 'Archmage of the Anthill'],
  kitchen: ['Fridge Light Disguises', 'Cupboard Cartels', 'Toaster Listening Posts', 'Sugar Bowl Coup', 'Total Pantry Control'],
  puppet: ['Tiny Ties', 'Focus-Grouped Antennae', 'Filibuster Swarms', 'Six-Legged Constitution', 'Benevolent Hivemind'],
  rail: ['Rush Hour Pheromones', 'Sleeper Cars', 'Bullet Ants', 'Transcontinental Tunnels', 'Rails to Everywhere'],
  burrow: ['Load-Bearing Sugar', 'Magma-Proof Mandibles', 'Tectonic Tunnels', 'Planetary Plumbing', 'The Hollow Earth'],
  astro: ['Helmet Antennae Holes', 'Six-Point Harnesses', 'Moonwalk Training', 'Launch Pad Picnics', 'Ants Among the Stars'],
  lunar: ['Crater Conveyor Belts', 'Low-Gravity Lifting', 'Sea of Tranquility Mines', 'Dark Side Shifts', 'Moon Sugar Monopoly'],
  dyson: ['Polished Mirrors', 'Sunscreen (Tiny)', 'Coronal Choreography', 'Solar Wind Sails', 'Stellar Engineering'],
  wormhole: ['Folded Maps', 'Scent Compression', 'Event Horizon Crumbs', 'Spacetime Shortcuts', 'The Long Way Round, Skipped'],
  chrono: ["Yesterday's Eggs Today", 'Paradox Insurance', 'Grandmother Ants', 'Temporal Nurseries', 'The End of Waiting'],
  multiverse: ['Infinite Picnics', 'Parallel Queens', 'Every Anthill at Once', 'Multiversal Treaty', 'The Anthill of Anthills'],
};

// Queens make no sugar, so their five upgrades each do something different instead of a plain ×2.
const QUEEN_TIERS = [
  { desc: 'Ant Queens make workers twice as fast.', effects: [{ type: 'layMultiplier', mult: 2 }] },
  { desc: 'Ant Queens make workers twice as fast.', effects: [{ type: 'layMultiplier', mult: 2 }] },
  { desc: 'Worker Ants make +1% sugar per Ant Queen.', effects: [{ type: 'synergy', producer: 'worker', source: 'queen', perUnit: 0.01 }] },
  { desc: 'Royal Feast lasts twice as long and costs half.',
    effects: [{ type: 'feastDurationMultiplier', mult: 2 }, { type: 'feastCostMultiplier', mult: 0.5 }] },
  { desc: 'All sugar/s +0.5% per Ant Queen.', effects: [{ type: 'sugarPerUnit', source: 'queen', perUnit: 0.005 }] },
];

// Five ×2 sugar upgrades per producer; side products like Bug Milk aren't affected. Queens get QUEEN_TIERS instead.
const tierUpgrades = PRODUCERS.flatMap(p => TIER_THRESHOLDS.map((threshold, i) => ({
  id: p.id + i,
  name: TIER_NAMES[p.id][i],
  cur: 'sugar',
  cost: p.cost * TIER_COST_MULTIPLIERS[i],
  tier: p.id,
  desc: p.id === 'queen' ? QUEEN_TIERS[i].desc : `${p.plural} make twice as much sugar.`,
  unlock: s => s.owned[p.id] >= threshold,
  effects: p.id === 'queen' ? QUEEN_TIERS[i].effects : [{ type: 'producerMultiplier', producers: [p.id], mult: 2 }],
})));

const producerMult = (producers, mult) => ({ type: 'producerMultiplier', producers, mult });
const synergy = (producer, source, perUnit) => ({ type: 'synergy', producer, source, perUnit });

const clickUpgrades = [
  { id: 'click0', name: 'Stronger Mandibles', cur: 'sugar', cost: 100, desc: 'Clicks are worth ×2.',
    unlock: s => s.clicks >= 15, effects: [{ type: 'clickMultiplier', mult: 2 }] },
  { id: 'click1', name: 'Formic Acid Gloves', cur: 'sugar', cost: 1000, desc: 'Clicks are worth ×2.',
    unlock: s => s.sugarRun >= 400, effects: [{ type: 'clickMultiplier', mult: 2 }] },
  { id: 'click2', name: 'Thumb of the Colossus', cur: 'sugar', cost: 12000, desc: 'Clicks also earn 1% of your sugar/s.',
    unlock: s => s.sugarRun >= 5000, effects: [{ type: 'clickShareOfSps', share: 0.01 }] },
  { id: 'click3', name: 'Sugar-Crystal Knuckles', cur: 'sugar', cost: 6e5, desc: 'Clicks earn another 2% of your sugar/s.',
    unlock: s => s.sugarRun >= 2e5, effects: [{ type: 'clickShareOfSps', share: 0.02 }] },
  { id: 'click4', name: 'Antennae of Precision', cur: 'sugar', cost: 8e6, desc: 'Clicks are worth ×3.',
    unlock: s => s.sugarRun >= 3e6, effects: [{ type: 'clickMultiplier', mult: 3 }] },
  { id: 'click5', name: 'Mandibles of Legend', cur: 'sugar', cost: 1e10, desc: 'Clicks earn another 5% of your sugar/s.',
    unlock: s => s.sugarRun >= 1e9, effects: [{ type: 'clickShareOfSps', share: 0.05 }] },
];

// A full first run earns roughly 3,000-6,000 Bug Milk, so not all of these fit in run one.
const milkUpgrades = [
  { id: 'diet', name: 'Royal Jelly Diet', cost: 20, desc: 'Queens make workers twice as fast.',
    unlock: s => s.owned.aphid >= 1 && s.owned.queen >= 3, effects: [{ type: 'layMultiplier', mult: 2 }] },
  { id: 'nanny', name: 'Nanny Ants', cost: 40, desc: 'The nest holds 50% more workers.',
    unlock: s => s.milkAll >= 15, effects: [{ type: 'roomMultiplier', mult: 1.5 }] },
  { id: 'banquet', name: 'Banquet Hall', cost: 80, desc: 'Nest Chambers cost 25% less to dig.',
    unlock: s => s.chambers >= 3, effects: [{ type: 'chamberCostMultiplier', mult: 0.75 }] },
  { id: 'canteens', name: 'Milk Canteens', cost: 120, desc: 'Expeditions bring back 50% more sugar and Bug Milk.',
    unlock: s => s.expDone >= 3, effects: [{ type: 'lootMultiplier', mult: 1.5 }] },
  { id: 'udder', name: 'Udder Polish', cost: 200, desc: 'Ladybug Dairies make twice as much Bug Milk.',
    unlock: s => s.owned.ladybug >= 5, effects: [{ type: 'producerMilkMultiplier', producer: 'ladybug', mult: 2 }] },
  { id: 'milkfed', name: 'Milk-Fed Workers', cost: 600, desc: 'Worker Ants produce twice as much.',
    unlock: s => s.milkAll >= 150, effects: [producerMult(['worker'], 2)] },
  { id: 'creamery', name: 'Royal Creamery', cost: 1200, desc: 'Bug Milk +1% per Ant Queen.',
    unlock: s => s.owned.queen >= 15 && s.milkAll >= 500, effects: [{ type: 'milkPerUnit', source: 'queen', perUnit: 0.01 }] },
  { id: 'fungbath', name: 'Fungus Milk Baths', cost: 2500, desc: 'Underground Fungus Farms produce twice as much.',
    unlock: s => s.owned.fungus >= 3, effects: [producerMult(['fungus'], 2)] },
  { id: 'shakes', name: 'Milkshake Rations', cost: 4000, desc: 'Picnic Raiding Parties produce twice as much.',
    unlock: s => s.owned.picnic >= 1, effects: [producerMult(['picnic'], 2)] },
  { id: 'courage', name: 'Curdled Courage', cost: 6000, desc: 'Expedition risks drop to 5%, and expeditions bring back 50% more.',
    unlock: s => s.expDone >= 5 && s.owned.picnic >= 1, effects: [{ type: 'riskCap', max: 0.05 }, { type: 'lootMultiplier', mult: 1.5 }] },
  { id: 'monument', name: 'The Great Milk Monument', cost: 12000, desc: 'All sugar/s +25%. The aphids come to admire it.',
    unlock: s => s.milkAll >= 5000, effects: [{ type: 'sugarMultiplier', mult: 1.25 }] },
  { id: 'cauldrons', name: 'Milk Cauldrons', cost: 3000, desc: 'Wizards brew Mana twice as fast.',
    unlock: s => s.owned.wizard >= 1, effects: [{ type: 'manaRateMultiplier', mult: 2 }] },
  { id: 'wand', name: 'Wand Polish', cost: 8000, desc: 'Spells cost 25% less Mana.',
    unlock: s => s.spells >= 3, effects: [{ type: 'spellCostMultiplier', mult: 0.75 }] },
  { id: 'grimoire', name: 'The Grand Grimoire', cost: 25000, desc: 'Mana holds twice as much.',
    unlock: s => s.owned.wizard >= 10, effects: [{ type: 'manaCapMultiplier', mult: 2 }] },
  { id: 'cartel', name: 'World Dairy Cartel', cost: 60000, desc: 'Triple Bug Milk production.',
    unlock: s => era(s) >= 4, effects: [{ type: 'milkMultiplier', mult: 3 }] },
].map(u => ({ ...u, cur: 'milk' }));

const synergyUpgrades = [
  { id: 'syn0', name: 'Queens Tend the Aphids', cost: 30000, desc: 'Aphid Ranches gain +2% per Ant Queen.',
    unlock: s => s.owned.queen >= 10 && s.owned.aphid >= 5, effects: [synergy('aphid', 'queen', 0.02)] },
  { id: 'syn1', name: 'Fungus-Fed Workers', cost: 6e5, desc: 'Worker Ants gain +2% per Fungus Farm.',
    unlock: s => s.owned.fungus >= 5, effects: [synergy('worker', 'fungus', 0.02)] },
  { id: 'syn2', name: 'Ladybug Escorts', cost: 6e6, desc: 'Picnic Raiding Parties gain +3% per Ladybug Dairy.',
    unlock: s => s.owned.picnic >= 2 && s.owned.ladybug >= 10, effects: [synergy('picnic', 'ladybug', 0.03)] },
  { id: 'syn3', name: 'Beetle Chauffeurs', cost: 2e8, desc: 'Picnic Raiding Parties gain +5% per Beetle Cavalry.',
    unlock: s => s.owned.beetle >= 5, effects: [synergy('picnic', 'beetle', 0.05)] },
  { id: 'syn4', name: 'Royal Court Wizards', cost: 3e9, desc: 'Ant Wizard Towers gain +1% per Ant Queen.',
    unlock: s => s.owned.wizard >= 5, effects: [synergy('wizard', 'queen', 0.01)] },
  { id: 'syn5', name: 'Cookbook Spies', cost: 5e10, desc: 'Kitchen Infiltration Cells gain +2% per Wizard Tower.',
    unlock: s => s.owned.kitchen >= 5, effects: [synergy('kitchen', 'wizard', 0.02)] },
  { id: 'syn6', name: 'Lobbyist Beetles', cost: 7e11, desc: 'Puppet Governments gain +2% per Beetle Cavalry.',
    unlock: s => s.owned.puppet >= 5, effects: [synergy('puppet', 'beetle', 0.02)] },
  { id: 'syn7', name: 'Express Megaburrows', cost: 1.5e14, desc: 'Megaburrows gain +3% per Ant Express Railway.',
    unlock: s => s.owned.burrow >= 5, effects: [synergy('burrow', 'rail', 0.03)] },
  { id: 'syn8', name: 'Freeze-Dried Picnics', cost: 2e15, desc: 'Ant Astronaut Programs gain +3% per Kitchen Cell.',
    unlock: s => s.owned.astro >= 5, effects: [synergy('astro', 'kitchen', 0.03)] },
  { id: 'syn9', name: 'Lunar Railway', cost: 3e16, desc: 'Lunar Sugar Mines gain +3% per Ant Express Railway.',
    unlock: s => s.owned.lunar >= 5, effects: [synergy('lunar', 'rail', 0.03)] },
  { id: 'syn10', name: 'Swarm Coordination', cost: 5e17, desc: 'Dyson Swarms gain +2% per Megaburrow.',
    unlock: s => s.owned.dyson >= 5, effects: [synergy('dyson', 'burrow', 0.02)] },
].map(u => ({ ...u, cur: 'sugar' }));

const otherSugarUpgrades = [
  { id: 'phero0', name: 'Scented Highways', cost: 40000, desc: 'Each achievement adds 50% more to the Pheromone Trail.',
    unlock: s => achievementCount(s) >= 8, effects: [{ type: 'pheromoneMultiplier', mult: 1.5 }] },
  { id: 'phero1', name: 'Pheromone Superhighways', cost: 4e6, desc: 'Each achievement adds 50% more again.',
    unlock: s => achievementCount(s) >= 16, effects: [{ type: 'pheromoneMultiplier', mult: 1.5 }] },
  { id: 'phero2', name: 'Pheromone Broadcast Towers', cost: 1e11, desc: 'Each achievement adds 50% more again.',
    unlock: s => achievementCount(s) >= 30, effects: [{ type: 'pheromoneMultiplier', mult: 1.5 }] },
  { id: 'scoutTrain', name: 'Scout Training', cost: 15000, desc: 'Expeditions finish 20% faster.',
    unlock: s => s.expDone >= 2, effects: [{ type: 'expeditionTimeMultiplier', mult: 0.8 }] },
].map(u => ({ ...u, cur: 'sugar' }));

const stardustUpgrades = [
  { id: 'suits', name: 'Ant-Sized Spacesuits', cost: 50, desc: 'Ant Astronaut Programs produce triple sugar and double Stardust.',
    unlock: s => s.owned.astro >= 1,
    effects: [producerMult(['astro'], 3), { type: 'producerDustMultiplier', producer: 'astro', mult: 2 }] },
  { id: 'zerog', name: 'Zero-G Mandibles', cost: 150, desc: 'Clicks are worth ×10.',
    unlock: s => s.dustAll >= 50, effects: [{ type: 'clickMultiplier', mult: 10 }] },
  { id: 'refinery', name: 'Moon Sugar Refinery', cost: 500, desc: 'Lunar Sugar Mines produce triple.',
    unlock: s => s.owned.lunar >= 1, effects: [producerMult(['lunar'], 3)] },
  { id: 'sails', name: 'Solar Sails', cost: 2000, desc: 'All sugar/s ×2.',
    unlock: s => s.dustAll >= 1000, effects: [{ type: 'sugarMultiplier', mult: 2 }] },
  { id: 'gravity', name: 'Gravity Tunnels', cost: 8000, desc: 'Railways and Megaburrows produce ×5.',
    unlock: s => s.dustAll >= 4000, effects: [producerMult(['rail', 'burrow'], 5)] },
  { id: 'comets', name: 'Comet Tails', cost: 25000, desc: 'Triple Stardust production.',
    unlock: s => s.dustAll >= 15000, effects: [{ type: 'dustMultiplier', mult: 3 }] },
  { id: 'stjelly', name: 'Stardust Jelly', cost: 100000, desc: 'All sugar/s ×3.',
    unlock: s => s.dustAll >= 60000, effects: [{ type: 'sugarMultiplier', mult: 3 }] },
  { id: 'warp', name: 'Warp Pheromones', cost: 500000, desc: 'Wormholes, Hatcheries and Multiverse Anthills produce ×3.',
    unlock: s => era(s) >= 6, effects: [producerMult(['wormhole', 'chrono', 'multiverse'], 3)] },
].map(u => ({ ...u, cur: 'dust' }));

export const UPGRADES = [
  ...tierUpgrades, ...clickUpgrades, ...milkUpgrades, ...synergyUpgrades, ...otherSugarUpgrades, ...stardustUpgrades,
];

export const UPGRADE_BY_ID = Object.fromEntries(UPGRADES.map(u => [u.id, u]));

export const CURRENCY_LABEL = { sugar: 'sugar', milk: 'milk', dust: 'stardust' };
