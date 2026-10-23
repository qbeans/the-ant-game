import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatNumber, formatRate, formatTime } from '../src/core/index.js';

test('formatNumber uses commas below 1,000 and suffixes above', () => {
  assert.equal(formatNumber(0), '0');
  assert.equal(formatNumber(999), '999');
  assert.equal(formatNumber(1500), '1.5K');
  assert.equal(formatNumber(12_345), '12.35K');
  assert.equal(formatNumber(2.5e6), '2.5M');
  assert.equal(formatNumber(1e15), '1Qa');
});

test('formatNumber shows decimals only when asked and below 100', () => {
  assert.equal(formatNumber(0.25, 2), '0.25');
  assert.equal(formatNumber(4.5, 1), '4.5');
  assert.equal(formatNumber(4.5), '4');
  assert.equal(formatNumber(150.5, 1), '150');
});

test('formatNumber never shows "1000K" when rounding up', () => {
  assert.equal(formatNumber(999_960), '1M');
});

test('formatNumber falls back to exponents past the last suffix', () => {
  assert.equal(formatNumber(1e40), '1.00e+40');
  assert.equal(formatNumber(Infinity), '∞');
});

test('formatTime shows m:ss, then hours and minutes', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(65), '1:05');
  assert.equal(formatTime(3725), '1h 02m');
  assert.equal(formatTime(-5), '0:00');
});

test('formatRate shows one decimal, more only when a value would round to zero', () => {
  assert.equal(formatRate(33.333e6), '33.3M');
  assert.equal(formatRate(4.93), '4.9');
  assert.equal(formatRate(0.1), '0.1');
  assert.equal(formatRate(0.02), '0.02');   // e.g. one Aphid Ranch's milk
  assert.equal(formatRate(0.05), '0.05');   // one Wizard Tower's Mana
  assert.equal(formatRate(0.12), '0.1');
  assert.equal(formatRate(0.004), '0.004');
  assert.equal(formatRate(999.96), '1.0K');
  assert.equal(formatRate(1234.5), '1.2K');
  assert.equal(formatRate(0), '0');
});
