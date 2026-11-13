import { test } from 'node:test';
import assert from 'node:assert/strict';

import { toRoman, fromRoman, isRoman, RomanError } from '../src/index.js';

test('toRoman converts representative values', () => {
  assert.equal(toRoman(1), 'I');
  assert.equal(toRoman(4), 'IV');
  assert.equal(toRoman(9), 'IX');
  assert.equal(toRoman(14), 'XIV');
  assert.equal(toRoman(40), 'XL');
  assert.equal(toRoman(90), 'XC');
  assert.equal(toRoman(400), 'CD');
  assert.equal(toRoman(900), 'CM');
  assert.equal(toRoman(1994), 'MCMXCIV');
  assert.equal(toRoman(2024), 'MMXXIV');
  assert.equal(toRoman(3888), 'MMMDCCCLXXXVIII');
  assert.equal(toRoman(3999), 'MMMCMXCIX');
});

test('toRoman rejects out-of-range and non-integer values', () => {
  assert.throws(() => toRoman(0), RomanError);
  assert.throws(() => toRoman(-1), RomanError);
  assert.throws(() => toRoman(4000), RomanError);
  assert.throws(() => toRoman(1.5), RomanError);
  assert.throws(() => toRoman(NaN), RomanError);
  assert.throws(() => toRoman(Infinity), RomanError);
  assert.throws(() => toRoman('10'), RomanError);
  assert.throws(() => toRoman(null), RomanError);
  assert.throws(() => toRoman(undefined), RomanError);
});

test('fromRoman parses canonical numerals', () => {
  assert.equal(fromRoman('I'), 1);
  assert.equal(fromRoman('IV'), 4);
  assert.equal(fromRoman('IX'), 9);
  assert.equal(fromRoman('MCMXCIV'), 1994);
  assert.equal(fromRoman('MMMCMXCIX'), 3999);
});

test('fromRoman rejects non-canonical forms', () => {
  assert.throws(() => fromRoman('IIII'), RomanError);
  assert.throws(() => fromRoman('IC'), RomanError);
  assert.throws(() => fromRoman('MCMC'), RomanError);
  assert.throws(() => fromRoman('MMMM'), RomanError);
  assert.throws(() => fromRoman('VX'), RomanError);
  assert.throws(() => fromRoman('iv'), RomanError);
  assert.throws(() => fromRoman(''), RomanError);
  assert.throws(() => fromRoman('ABC'), RomanError);
});

test('fromRoman rejects wrong types', () => {
  assert.throws(() => fromRoman(42), RomanError);
  assert.throws(() => fromRoman(null), RomanError);
  assert.throws(() => fromRoman(['I']), RomanError);
});

test('round-trip holds for every value in range', () => {
  for (let n = 1; n <= 3999; n += 1) {
    const roman = toRoman(n);
    assert.equal(fromRoman(roman), n, `round-trip failed for ${n} (${roman})`);
  }
});

test('isRoman classifies inputs without throwing', () => {
  assert.equal(isRoman('MCMXCIV'), true);
  assert.equal(isRoman('I'), true);
  assert.equal(isRoman('IIII'), false);
  assert.equal(isRoman('iv'), false);
  assert.equal(isRoman(''), false);
  assert.equal(isRoman(1994), false);
  assert.equal(isRoman(null), false);
  assert.equal(isRoman(undefined), false);
});

test('RomanError is a TypeError subclass', () => {
  assert.ok(new RomanError('x') instanceof TypeError);
  assert.equal(new RomanError('x').name, 'RomanError');
});

test('toRoman error message names the offending value', () => {
  assert.throws(() => toRoman(0), /received 0/);
  assert.throws(() => toRoman('x'), /received "x"/);
});
