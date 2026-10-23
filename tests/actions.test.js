import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as game from '../src/core/index.js';
import { claimMilestones, newGame } from './helpers.js';

test('buying a producer spends sugar; it fails without enough', () => {
  const s = newGame();
  assert.equal(game.buyProducer(s, 'worker'), false);
  s.sugar = 20;
  assert.equal(game.buyProducer(s, 'worker'), true);
  assert.equal(s.owned.worker, 1);
  assert.equal(s.sugar, 5);
});

test('producers from a later era cannot be bought yet', () => {
  const s = newGame();
  s.sugar = 1e9;
  assert.equal(game.buyProducer(s, 'ladybug'), false);
});

test('upgrades need their unlock condition and the right currency', () => {
  const s = newGame();
  s.milk = 1000;
  assert.equal(game.buyUpgrade(s, 'diet'), false); // needs an Aphid Ranch and 3 queens
  s.owned.aphid = 1; s.owned.queen = 3;
  assert.equal(game.buyUpgrade(s, 'diet'), true);
  assert.equal(s.milk, 980);
});

test('milestones must be claimed in order and need their requirement', () => {
  const s = newGame();
  s.sugar = 1e12;
  assert.equal(game.buyMilestone(s, 'picnic'), false); // garden first
  assert.equal(game.buyMilestone(s, 'garden'), false); // needs 50 ants
  s.owned.worker = 50;
  assert.equal(game.buyMilestone(s, 'garden'), true);
  assert.deepEqual(game.drainEvents(), [{ kind: 'milestone', id: 'garden' }]);
});

test('queens fill the nest up to its room and then stop', () => {
  const s = newGame();
  s.owned.queen = 30; // 1 worker per second
  for (let i = 0; i < 100; i++) game.tick(s, 0.5);
  assert.equal(s.owned.worker, game.nestRoom(s));
});

test('an expedition takes its squad away and returns with loot', () => {
  const s = newGame({ randomValue: 0 }); // every chance roll succeeds
  s.owned.worker = 10;
  assert.equal(game.sendExpedition(s, 'scout'), true);
  assert.equal(game.workersHome(s), 0);
  for (let i = 0; i < 121; i++) game.tick(s, 0.5);
  assert.equal(game.workersHome(s), 10);
  assert.equal(s.pantry.rush, 1);
  // Loot is 90 seconds of the colony's sugar/s once the squad is home.
  const event = game.drainEvents().find(e => e.kind === 'expedition');
  assert.match(event.loot[0], /^\d+ sugar$/);
  assert.ok(Number(event.loot[0].split(' ')[0]) >= 90);
  assert.equal(event.loot[1], 'a Sugar Rush');
});

test('a risky expedition can lose a quarter of the squad', () => {
  const s = newGame({ randomValue: 0 });
  claimMilestones(s, 'garden');
  s.owned.worker = 200; s.owned.picnic = 1;
  game.sendExpedition(s, 'recon');
  s.clock = s.exp.recon.end;
  game.tick(s, 0);
  assert.equal(s.owned.worker, 150);
  assert.equal(s.anteaters, 1);
});

test('using a Pantry buff starts it; using a Popsicle Chunk pays out at once', () => {
  const s = newGame();
  s.owned.worker = 10;
  s.pantry.basket = 1; s.pantry.popsicle = 1;
  game.useBuff(s, 'basket');
  assert.equal(s.buffs.basket, s.clock + 60);
  game.useBuff(s, 'popsicle');
  assert.equal(s.sugar, 900 * game.sugarPerSecond(s));
  assert.equal(game.useBuff(s, 'popsicle'), false);
});

test('spells cost Mana; the Hex can backfire', () => {
  const s = newGame({ randomValue: 0 }); // forces a backfire
  s.owned.wizard = 1; s.mana = 40; s.sugar = 1000;
  assert.equal(game.castSpell(s, 'hex'), true);
  assert.equal(s.mana, 0);
  assert.equal(s.sugar, 900);
  assert.equal(s.backfires, 1);
  assert.equal(game.castSpell(s, 'conjure'), false); // out of Mana
});

test('wizards brew Mana from Bug Milk', () => {
  const s = newGame();
  s.owned.wizard = 10; s.milk = 100;
  game.tick(s, 1);
  assert.equal(s.mana, 0.5);
  assert.equal(s.milk, 98);
});

test('Pheromone Shortcut brings expeditions home 5 minutes sooner, and needs one to be out', () => {
  const s = newGame();
  s.owned.wizard = 1; s.mana = 100;
  assert.equal(game.castSpell(s, 'shortcut'), false); // nothing out
  assert.equal(s.mana, 100);
  claimMilestones(s, 'garden');
  s.owned.worker = 60;
  game.sendExpedition(s, 'patio'); // 300s
  game.sendExpedition(s, 'scout'); // 60s
  assert.equal(game.castSpell(s, 'shortcut'), true);
  assert.equal(s.mana, 80);
  assert.equal(s.exp.patio.end, s.clock);
  assert.equal(s.exp.scout.end, s.clock);
  game.tick(s, 0);
  assert.deepEqual(s.exp, {});
});

test('spells go on cooldown after casting', () => {
  const s = newGame();
  s.owned.wizard = 1; s.mana = 100;
  const cooldown = game.SPELL_BY_ID.conjure.cooldown;
  assert.equal(game.castSpell(s, 'conjure'), true);
  assert.equal(game.spellCooldownLeft(s, 'conjure'), cooldown);
  assert.equal(game.castSpell(s, 'conjure'), false); // still recharging
  assert.equal(s.mana, 85);
  s.clock += cooldown;
  assert.equal(game.spellCooldownLeft(s, 'conjure'), 0);
  assert.equal(game.castSpell(s, 'conjure'), true);
});

test('every spell has a cooldown at least as long as its effect', () => {
  for (const sp of game.SPELLS) assert.ok(sp.cooldown >= (sp.duration || 0), sp.id);
});

test('Pheromone Shortcut can never pay for itself with Kitchen Heist Mana', () => {
  const s = newGame({ randomValue: 0.99 });
  claimMilestones(s, 'garden', 'picnic');
  s.heritage.scouts = 1; s.heritage.wizline = 1; s.upgrades.wand = 1; // fastest trip, cheapest spell
  s.owned.wizard = 1; s.owned.worker = 1000; s.mana = 30;
  game.sendExpedition(s, 'heist');
  const before = s.mana;
  game.castSpell(s, 'shortcut');
  game.tick(s, 0);
  assert.deepEqual(s.exp, {}); // the heist came home
  assert.ok(s.mana < before, `Mana went from ${before} to ${s.mana}`);
});

test('Summon Popsicle puts a Popsicle Chunk in the Pantry', () => {
  const s = newGame();
  s.owned.wizard = 1; s.mana = 35;
  assert.equal(game.castSpell(s, 'summon'), true);
  assert.equal(s.pantry.popsicle, 1);
  assert.equal(s.pantry.basket, 0);
});

test('The Grand Grimoire halves spell cooldowns, but never below the spell\'s own effect', () => {
  const s = newGame();
  s.owned.wizard = 1; s.mana = 200; s.upgrades.grimoire = 1;
  game.castSpell(s, 'conjure');
  assert.equal(game.spellCooldownLeft(s, 'conjure'), game.SPELL_BY_ID.conjure.cooldown / 2);
  for (const sp of game.SPELLS) assert.ok(game.spellCooldown(s, sp.id) >= (sp.duration || 0), sp.id);
});

test('The Grand Grimoire appears after 25 Wizard Towers and 25 spells cast', () => {
  const s = newGame();
  const grimoire = game.UPGRADE_BY_ID.grimoire;
  s.owned.wizard = 25; s.spells = 24;
  assert.equal(game.upgradeAvailable(s, grimoire), false);
  s.spells = 25; s.owned.wizard = 24;
  assert.equal(game.upgradeAvailable(s, grimoire), false);
  s.owned.wizard = 25;
  assert.equal(game.upgradeAvailable(s, grimoire), true);
});
