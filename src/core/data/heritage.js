/**
 * Permanent upgrades bought with Royal Jelly. They survive every Nuptial Flight.
 * `needs` names a Heritage upgrade that must be owned first. `effects` use the same types as upgrades,
 * plus a few that only matter at the start of a run or while away.
 */
export const HERITAGE = [
  { id: 'lineage', name: 'Royal Lineage', cost: 1, desc: 'Queens produce workers twice as fast, and every run starts with 5 Ant Queens.',
    effects: [{ type: 'layMultiplier', mult: 2 }, { type: 'startingQueens', count: 5 }] },
  { id: 'deep', name: 'Deep Chambers', cost: 1, desc: 'Every Nest Chamber holds twice as many workers.',
    effects: [{ type: 'roomMultiplier', mult: 2 }] },
  { id: 'sweet', name: 'Sweet Tooth', cost: 2, desc: 'Clicks also earn 5% of your sugar/s.',
    effects: [{ type: 'clickShareOfSps', share: 0.05 }] },
  { id: 'scouts', name: 'Veteran Scouts', cost: 2, desc: 'Expeditions finish twice as fast, and every return brings a Sugar Rush.',
    effects: [{ type: 'expeditionTimeMultiplier', mult: 0.5 }, { type: 'expeditionBonusBuff', buff: 'rush' }] },
  { id: 'milkmem', name: 'Milk Memory', cost: 2, desc: 'Triple Bug Milk production. Royal Feast costs half.',
    effects: [{ type: 'milkMultiplier', mult: 3 }, { type: 'feastCostMultiplier', mult: 0.5 }] },
  { id: 'deed', name: 'Garden Deed', cost: 2, desc: 'Start every run with Claim the Garden done.',
    effects: [{ type: 'startingMilestone', milestone: 'garden' }] },
  { id: 'larder', name: 'Bottomless Larder', cost: 5, desc: 'Time away counts in full, for up to 3 days.',
    effects: [{ type: 'offline', rate: 1, maxSeconds: 259200 }] },
  { id: 'wizline', name: 'Wizard Bloodline', cost: 10, desc: 'Mana brews twice as fast and spells cost 25% less.',
    effects: [{ type: 'manaRateMultiplier', mult: 2 }, { type: 'spellCostMultiplier', mult: 0.75 }] },
  { id: 'deed2', name: 'Picnic Deed', cost: 60, needs: 'deed', desc: 'Start every run with Raid the Picnic done.',
    effects: [{ type: 'startingMilestone', milestone: 'picnic' }] },
  { id: 'carto', name: 'Royal Cartographers', cost: 40, desc: 'Expeditions bring back triple sugar, Bug Milk and Stardust.',
    effects: [{ type: 'lootMultiplier', mult: 3 }] },
  { id: 'ancestors', name: 'Ancestral Pheromones', cost: 100, desc: 'Each achievement adds twice as much to the Achievement Bonus.',
    effects: [{ type: 'pheromoneMultiplier', mult: 2 }] },
  { id: 'deed3', name: 'Supermarket Deed', cost: 1500, needs: 'deed2', desc: 'Start every run with Infiltrate the Supermarket done.',
    effects: [{ type: 'startingMilestone', milestone: 'market' }] },
  { id: 'spaceborn', name: 'Space-Born Queens', cost: 600, desc: 'Triple Stardust production.',
    effects: [{ type: 'dustMultiplier', mult: 3 }] },
  { id: 'deed4', name: 'Core Deed', cost: 20000, needs: 'deed3', desc: 'Start every run with Tunnel Through the Core done.',
    effects: [{ type: 'startingMilestone', milestone: 'core' }] },
];

export const HERITAGE_BY_ID = Object.fromEntries(HERITAGE.map(h => [h.id, h]));
