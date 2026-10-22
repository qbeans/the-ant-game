/**
 * Everything you can buy with sugar in the Colony shop, in shop order.
 * `sps` is base sugar per second; `milk`, `dust` and `mana` are optional side products per unit.
 * `plural` is used in upgrade text. `era` is the first era where the producer can be bought. `icon` names an SVG symbol in index.html.
 */
export const PRODUCERS = [
  { id: 'worker', name: 'Worker Ant', plural: 'Worker Ants', cost: 15, sps: 0.1, era: 1, icon: 'i-worker',
    desc: 'Carries one crumb at a time. Very proud of it.' },
  { id: 'queen', name: 'Ant Queen', plural: 'Ant Queens', cost: 100, sps: 0, era: 1, icon: 'i-queen',
    desc: 'Makes a new Worker Ant every 30s while the nest has room.' },
  { id: 'aphid', name: 'Aphid Ranch', plural: 'Aphid Ranches', cost: 800, sps: 4, era: 1, milk: 0.02, icon: 'i-aphid',
    desc: 'Ranch aphids drip honeydew: steady sugar and a trickle of Bug Milk.' },
  { id: 'ladybug', name: 'Ladybug Dairy', plural: 'Ladybug Dairies', cost: 9000, sps: 22, era: 2, milk: 0.12, icon: 'i-ladybug',
    desc: 'The main source of Bug Milk, plus some sugar. They used to eat the aphids; now they work with them.' },
  { id: 'fungus', name: 'Underground Fungus Farm', plural: 'Underground Fungus Farms', cost: 110000, sps: 120, era: 2, icon: 'i-fungus',
    desc: 'Ants tend mushroom gardens deep in the nest. They grow in the dark and turn into sugar.' },
  { id: 'picnic', name: 'Picnic Raiding Party', plural: 'Picnic Raiding Parties', cost: 1.5e6, sps: 700, era: 2, icon: 'i-basket',
    desc: 'Train a strike team to haul whole sandwiches home from human picnics.' },
  { id: 'beetle', name: 'Beetle Cavalry', plural: 'Beetle Cavalry', cost: 2e7, sps: 3900, era: 3, icon: 'i-beetle',
    desc: 'Ants riding stag beetles into battle. Nothing stops a beetle charge.' },
  { id: 'wizard', name: 'Ant Wizard Tower', plural: 'Ant Wizard Towers', cost: 3e8, sps: 22000, era: 3, mana: 0.05, icon: 'i-wizard',
    desc: 'Tiny towers of tiny wizards. They brew Mana out of Bug Milk and make some sugar on the side.' },
  { id: 'kitchen', name: 'Kitchen Infiltration Cell', plural: 'Kitchen Infiltration Cells', cost: 4.5e9, sps: 1.3e5, era: 3, icon: 'i-sugar',
    desc: 'Sleeper agents in every pantry on the street. The sugar bowl never stood a chance.' },
  { id: 'puppet', name: 'Puppet Government', plural: 'Puppet Governments', cost: 7e10, sps: 8e5, era: 4, icon: 'i-flag',
    desc: 'Four thousand ants in a very convincing suit, now running for office.' },
  { id: 'rail', name: 'Ant Express Railway', plural: 'Ant Express Railways', cost: 1e12, sps: 5e6, era: 4, icon: 'i-rail',
    desc: 'Underground rail lines between continents. Departures every six seconds.' },
  { id: 'burrow', name: 'Supercolony Megaburrow', plural: 'Supercolony Megaburrows', cost: 1.5e13, sps: 3.2e7, era: 4, icon: 'i-globe',
    desc: 'One nest, every continent. The tunnels go all the way down.' },
  { id: 'astro', name: 'Ant Astronaut Program', plural: 'Ant Astronaut Programs', cost: 2.2e14, sps: 2e8, era: 5, dust: 0.05, icon: 'i-rocket',
    desc: 'Ants in six-legged spacesuits fly out to the stars and bring home sugar and Stardust.' },
  { id: 'lunar', name: 'Lunar Sugar Mine', plural: 'Lunar Sugar Mines', cost: 3.3e15, sps: 1.3e9, era: 5, dust: 0.3, icon: 'i-moon',
    desc: 'The Moon is mostly sugar if you dig in the right place. Comes up dusty.' },
  { id: 'dyson', name: 'Dyson Swarm', plural: 'Dyson Swarms', cost: 5e16, sps: 8.5e9, era: 5, icon: 'i-sun',
    desc: 'A shell of ants around the Sun, all holding tiny mirrors.' },
  { id: 'wormhole', name: 'Wormhole Pheromone Trail', plural: 'Wormhole Pheromone Trails', cost: 7.5e17, sps: 5.5e10, era: 6, icon: 'i-swirl',
    desc: 'A scent trail through folded space. Ants arrive before they leave.' },
  { id: 'chrono', name: 'Chrono-Ant Hatchery', plural: 'Chrono-Ant Hatcheries', cost: 1.1e19, sps: 3.6e11, era: 6, icon: 'i-hourglass',
    desc: "Hatches tomorrow's ants today. Tomorrow's ants are not thrilled about it." },
  { id: 'multiverse', name: 'Multiverse Anthill', plural: 'Multiverse Anthills', cost: 1.7e20, sps: 2.4e12, era: 6, icon: 'i-galaxy',
    desc: 'Every possible anthill, connected. In most of them, you are winning.' },
];

export const PRODUCER_BY_ID = Object.fromEntries(PRODUCERS.map(p => [p.id, p]));
