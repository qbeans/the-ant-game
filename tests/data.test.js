import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as game from '../src/core/index.js';
import { newGame } from './helpers.js';

const ids = list => list.map(x => x.id);
const assertUnique = (list, label) => assert.equal(new Set(ids(list)).size, list.length, `duplicate ${label} id`);

test('every data table has unique ids', () => {
  assertUnique(game.PRODUCERS, 'producer');
  assertUnique(game.UPGRADES, 'upgrade');
  assertUnique(game.MILESTONES, 'milestone');
  assertUnique(game.EXPEDITIONS, 'expedition');
  assertUnique(game.SPELLS, 'spell');
  assertUnique(game.HERITAGE, 'heritage');
  assertUnique(game.ACHIEVEMENTS, 'achievement');
});

test('every upgrade and Heritage effect is understood by the effects system', () => {
  const s = newGame();
  for (const u of game.UPGRADES) s.upgrades[u.id] = 1;
  for (const h of game.HERITAGE) s.heritage[h.id] = 1;
  assert.doesNotThrow(() => game.modifiers(s));
});

test('upgrade text names each producer in a proper plural', () => {
  for (const u of game.UPGRADES) assert.doesNotMatch(u.desc, /(Dairy|Cavalry|Party|Hatchery)s\b/, u.id);
});

test('synergies and producer effects only reference real producers', () => {
  const known = new Set(ids(game.PRODUCERS));
  for (const u of game.UPGRADES) {
    for (const e of u.effects) {
      for (const id of e.producers || []) assert.ok(known.has(id), `${u.id} -> ${id}`);
      if (e.producer) assert.ok(known.has(e.producer), `${u.id} -> ${e.producer}`);
      if (e.source) assert.ok(known.has(e.source), `${u.id} -> ${e.source}`);
    }
  }
});

test('Heritage prerequisites exist', () => {
  for (const h of game.HERITAGE) if (h.needs) assert.ok(game.HERITAGE_BY_ID[h.needs], h.id);
});
