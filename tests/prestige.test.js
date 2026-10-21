import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as game from '../src/core/index.js';
import { claimMilestones, newGame } from './helpers.js';

test('jelly follows a fourth-root curve: about 6 for a first run', () => {
  const s = newGame();
  s.sugarRun = 2.5e8;
  assert.equal(game.jellyGain(s), 6);
  assert.ok(game.nextJellyAt(s) > s.sugarRun);
  s.sugarRun = game.nextJellyAt(s);
  assert.equal(game.jellyGain(s), 7);
});

test('the Nuptial Flight needs Raid the Picnic', () => {
  const s = newGame();
  assert.equal(game.nuptialFlight(s), null);
});

test('a flight resets the run but keeps achievements, Heritage and lifetime stats', () => {
  const s = newGame();
  claimMilestones(s, 'garden', 'picnic');
  Object.assign(s, { sugar: 5, sugarRun: 2.5e8, sugarAll: 3e8, clicks: 42, jelly: 1 });
  s.owned.worker = 100;
  s.achievements.crumb = 1;
  s.heritage.deep = 1;
  const next = game.nuptialFlight(s);
  assert.equal(next.sugar, 0);
  assert.equal(next.owned.worker, 0);
  assert.deepEqual(next.milestones, {});
  assert.equal(next.jelly, 7);
  assert.equal(next.flights, 1);
  assert.equal(next.clicks, 42);
  assert.equal(next.sugarAll, 3e8);
  assert.deepEqual(next.achievements, { crumb: 1 });
  assert.deepEqual(next.heritage, { deep: 1 });
});

test('Heritage applies its start-of-run bonuses right away and after every flight', () => {
  const s = newGame();
  s.jelly = 100;
  assert.equal(game.buyHeritage(s, 'lineage'), true);
  assert.equal(s.owned.queen, 3);
  assert.equal(game.buyHeritage(s, 'deed'), true);
  assert.equal(game.buyHeritage(s, 'deed2'), true);
  assert.deepEqual(Object.keys(s.milestones), ['garden', 'picnic']);
  const next = game.nuptialFlight(s);
  assert.equal(next.owned.queen, 3);
  assert.equal(game.era(next), 3);
});

test('a Heritage upgrade that needs another one stays locked until then', () => {
  const s = newGame();
  s.jelly = 1000;
  assert.equal(game.buyHeritage(s, 'deed2'), false);
  game.buyHeritage(s, 'deed');
  assert.equal(game.buyHeritage(s, 'deed2'), true);
});

test('offline time pays half rate, capped at a day; Bottomless Larder pays it all', () => {
  const colony = () => { const s = newGame(); s.owned.worker = 10; return s; }; // 1 sugar/s
  assert.equal(game.applyOfflineTime(colony(), 100).sugar, 50);
  assert.equal(game.applyOfflineTime(colony(), 1e6).seconds, 86400);
  const withLarder = colony();
  withLarder.heritage.larder = 1;
  assert.equal(game.applyOfflineTime(withLarder, 100).sugar, 100);
});

test('old saves are migrated: missing fields filled, brood folded into workers', () => {
  const s = game.migrateState({ sugar: 10, owned: { worker: 5 }, brood: 7 });
  assert.equal(s.owned.worker, 12);
  assert.equal(s.owned.queen, 0);
  assert.equal(s.dust, 0);
  assert.equal('brood' in s, false);
});

test('Mana and Wizard Towers reset on a Nuptial Flight', () => {
  const s = newGame();
  claimMilestones(s, 'garden', 'picnic');
  s.owned.wizard = 5; s.mana = 27; s.sugarRun = 1e9;
  const next = game.nuptialFlight(s);
  assert.equal(next.mana, 0);
  assert.equal(next.owned.wizard, 0);
});
