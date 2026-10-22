import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as game from '../src/core/index.js';
import { claimMilestones, newGame } from './helpers.js';

test('producer prices grow 15% per unit owned, and bulk prices add up', () => {
  const s = newGame();
  assert.equal(game.producerCost(s, 'worker'), 15);
  s.owned.worker = 1;
  assert.equal(game.producerCost(s, 'worker'), Math.ceil(15 * 1.15));
  s.owned.worker = 0;
  const sumOfSingles = [0, 1, 2].reduce((sum, n) => sum + 15 * 1.15 ** n, 0);
  assert.equal(game.producerCost(s, 'worker', 3), Math.ceil(sumOfSingles));
});

test('maxAffordable buys as many as the sugar covers', () => {
  const s = newGame();
  s.sugar = game.producerCost(s, 'worker', 5);
  assert.equal(game.maxAffordable(s, 'worker'), 5);
});

test('a worker makes 0.1 sugar/s before any bonuses', () => {
  const s = newGame();
  s.owned.worker = 10;
  assert.equal(game.rawSugarPerSecond(s), 1);
});

test('workers away on an expedition make no sugar', () => {
  const s = newGame();
  s.owned.worker = 10;
  s.exp.scout = { start: 0, end: 60, squad: 10 };
  assert.equal(game.rawSugarPerSecond(s), 0);
});

test('queens make no sugar, only workers', () => {
  const s = newGame();
  s.owned.queen = 5;
  assert.equal(game.rawSugarPerSecond(s), 0);
  assert.equal(game.workerBirthRate(s), 5 / game.QUEEN_SECONDS_PER_WORKER);
});

test('tier upgrades double a producer, and queen tiers double worker births', () => {
  const s = newGame();
  s.owned.worker = 10; s.owned.queen = 1;
  const before = game.rawSugarPerSecond(s), birthsBefore = game.workerBirthRate(s);
  s.upgrades.worker0 = 1;
  s.upgrades.queen0 = 1;
  assert.equal(game.rawSugarPerSecond(s), before * 2);
  assert.equal(game.workerBirthRate(s), birthsBefore * 2);
});

test('synergy upgrades scale with the source producer', () => {
  const s = newGame();
  s.owned.aphid = 1; s.owned.queen = 10;
  const before = game.producerSugarPerSecond(s, 'aphid');
  s.upgrades.syn0 = 1; // +2% per queen
  assert.ok(Math.abs(game.producerSugarPerSecond(s, 'aphid') - before * 1.2) < 1e-9);
});

test('timed buffs multiply sugar/s only while active', () => {
  const s = newGame();
  s.owned.worker = 10;
  s.buffs.basket = s.clock + 60;
  assert.equal(game.sugarPerSecond(s), game.rawSugarPerSecond(s) * 7);
  s.clock = 61;
  assert.equal(game.sugarPerSecond(s), game.rawSugarPerSecond(s));
});

test('nest room grows with chambers and room upgrades', () => {
  const s = newGame();
  assert.equal(game.nestRoom(s), 20);
  s.chambers = 2;
  assert.equal(game.nestRoom(s), 70);
  s.upgrades.nanny = 1;
  assert.equal(game.nestRoom(s), 105);
});

test('each milestone multiplies sugar/s', () => {
  const s = newGame();
  s.owned.worker = 10;
  const before = game.rawSugarPerSecond(s);
  claimMilestones(s, 'garden', 'picnic');
  assert.ok(Math.abs(game.rawSugarPerSecond(s) - before * 1.1 * 1.25) < 1e-9);
});

test('unspent jelly adds 2% sugar/s each', () => {
  const s = newGame();
  s.owned.worker = 10;
  s.jelly = 50;
  assert.equal(game.rawSugarPerSecond(s), 2);
});

test('producers unlock by era', () => {
  const s = newGame();
  assert.equal(game.producerUnlocked(s, 'ladybug'), false);
  claimMilestones(s, 'garden');
  assert.equal(game.producerUnlocked(s, 'ladybug'), true);
  assert.equal(game.era(s), 2);
});

test('only the first two queen upgrades speed up queens; the rest do other things', () => {
  const s = newGame();
  s.owned.queen = 20; s.owned.worker = 10;
  const births = game.workerBirthRate(s);
  for (let i = 0; i < 5; i++) s.upgrades['queen' + i] = 1;
  assert.equal(game.workerBirthRate(s), births * 4);
});

test('Tiny Crowns: workers make +1% sugar per queen', () => {
  const s = newGame();
  s.owned.worker = 10; s.owned.queen = 20;
  const before = game.producerSugarPerSecond(s, 'worker');
  s.upgrades.queen2 = 1;
  assert.ok(Math.abs(game.producerSugarPerSecond(s, 'worker') - before * 1.2) < 1e-9);
});

test("Queen's Gambit: Royal Feast lasts twice as long for half the milk", () => {
  const s = newGame();
  s.upgrades.queen3 = 1;
  assert.equal(game.feastDuration(s), 120);
  assert.equal(game.feastCost(s), 8);
});

test('Matriarchy: all sugar/s +0.5% per queen', () => {
  const s = newGame();
  s.owned.worker = 10; s.owned.queen = 40;
  const before = game.rawSugarPerSecond(s);
  s.upgrades.queen4 = 1;
  assert.ok(Math.abs(game.rawSugarPerSecond(s) - before * 1.2) < 1e-9);
});

test('Royal Creamery: Bug Milk +1% per queen', () => {
  const s = newGame();
  s.owned.aphid = 10; s.owned.queen = 30;
  const before = game.milkPerSecond(s);
  s.upgrades.creamery = 1;
  assert.ok(Math.abs(game.milkPerSecond(s) - before * 1.3) < 1e-9);
});

test('Banquet Hall: Nest Chambers cost 25% less', () => {
  const s = newGame();
  s.chambers = 4;
  const before = game.chamberCost(s);
  s.upgrades.banquet = 1;
  assert.equal(game.chamberCost(s), Math.ceil(50 * 1.25 ** 4 * 0.75));
  assert.ok(game.chamberCost(s) < before);
});
