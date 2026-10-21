# The Ant Game

An ant-colony idle game in the style of Cookie Clicker. Click the sugar cube, raise queens, milk ladybugs,
brew Mana with Ant Wizards, and grow from one anthill to the Andromeda Galaxy across Nuptial Flight (prestige) runs.

**Play it:** https://qbeans.github.io/the-ant-game/

Plain HTML, CSS and JavaScript modules. No build step and no dependencies.

## Run it

```bash
npm start
```

Then open http://localhost:8080. A server is needed because browsers don't load JavaScript modules from `file://`.

## Test it

```bash
npm test
```

Unit tests cover the economy, player actions, prestige, save migration and the data tables. A pacing test has a bot
play the first run and checks that it stays in the target window.

## Check the pacing

```bash
npm run simulate -- 2 12
```

A greedy bot plays for up to 12 hours of game time, clicking 2 times a second, takes a Nuptial Flight whenever
progress stalls, and prints each run. It plays close to perfectly, so expect real players to take 1.5–2× as long.
Re-run this after changing any number in `src/core/constants.js` or the data tables.

## How the code is organized

```
index.html            Page markup and SVG icons
styles.css            All styles
src/main.js           Entry point: load, build the page, run the game loop
src/core/             The game engine. No DOM access, so it runs in Node for tests and the simulator.
  data/               What exists: producers, upgrades, milestones, expeditions, buffs, spells, Heritage, achievements
  constants.js        Tunable numbers
  state.js            The save format, what survives a flight, and save migration
  effects.js          Folds owned upgrades and Heritage into one set of modifiers
  economy.js          Derived numbers: sugar/s, costs, nest room, Mana...
  actions.js          Things the player can do (buy, cast, send an expedition...)
  prestige.js         Royal Jelly, Heritage and the Nuptial Flight
  tick.js             Advancing time, and offline progress
  events.js           Messages from the engine to the UI (achievements, expedition returns...)
src/ui/               Everything that touches the page
  panels/             One module per card: init() wires it up, render(state) updates it
  colony/             The animated colony cross-section
  reveals.js          Shows features the first time they become relevant
  save.js             Saving to this browser and loading
tests/                node:test suites
tools/                The pacing bot and simulator
```

The engine is a set of pure functions over a plain JSON state object. The UI calls actions, the engine emits events,
and the UI turns events into notifications and re-renders.

## Adding content

- **A producer:** add it to `src/core/data/producers.js` with an `icon` that exists in `index.html` and five names in
  `TIER_NAMES` in `upgrades.js`. Its ×2 upgrades are generated automatically.
- **An upgrade or Heritage upgrade:** add an entry with a list of `effects`. The effect types are listed in
  `src/core/effects.js`; add a new type there if none fits. `tests/data.test.js` fails if an entry uses an unknown type.
- **A milestone or expedition:** add it to its data file. Expedition loot is described in `rollLoot`.

## Deploying

GitHub Pages serves the `main` branch as-is. Push to `main` and the site updates within a minute or two.

## Design rules from playtesting

- The first Nuptial Flight should come after about 30–45 minutes.
- No random clickables floating across the screen. Burst rewards come from things the player chooses to start:
  expeditions, the Buff Pantry and spells.
- Features appear gradually. A new game shows only the cube and the Colony shop.
- Queens make Worker Ants, not sugar, and there is only one kind of Worker Ant.
- Heritage upgrades should matter for the whole run, not just give a head start.
