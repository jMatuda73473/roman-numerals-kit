/**
 * Core conversion logic for roman-numerals-kit.
 *
 * Design decisions worth stating up front:
 *
 * 1. Range. Classical Roman numerals have no zero and no negatives, and the
 *    standard subtractive notation is only unambiguous up to 3999. We therefore
 *    accept integers in [1, 3999] and reject everything else with a RomanError.
 *    Larger values would require overline (vinculum) notation, which is not
 *    universally agreed upon, so we deliberately do not support them.
 *
 * 2. Parsing strictness. `fromRoman` accepts only canonical subtractive form:
 *    the exact string that `toRoman` would produce for that value. Inputs like
 *    "IIII", "IC", "MCMC" or "MMMM" are rejected rather than silently coerced.
 *    A permissive parser is easy to write but makes round-tripping ambiguous;
 *    canonical-only means `fromRoman(toRoman(n)) === n` for every valid n and
 *    keeps the two directions honest about each other.
 *
 * 3. Errors. All failures throw a RomanError, a subclass of TypeError, so that
 *    callers can catch library-specific problems without swallowing unrelated
 *    TypeErrors from their own code.
 */

/**
 * Thrown for every invalid input in this library.
 *
 * Extends TypeError because the overwhelmingly common cause is passing a value
 * of the wrong shape (a string to `toRoman`, a non-string to `fromRoman`).
 */
export class RomanError extends TypeError {
  constructor(message) {
    super(message);
    this.name = 'RomanError';
  }
}

// Canonical value/symbol pairs in descending order. Using an array rather than
// an object preserves the ordering that the greedy algorithm depends on.
const NUMERALS = Object.freeze([
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]);

const MIN_VALUE = 1;
const MAX_VALUE = 3999;

// Single-character values, used by the parser. Multi-character subtractive
// tokens (IV, IX, ...) are handled by the two-character lookahead below.
const SINGLE_VALUES = Object.freeze({
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
});

/**
 * Convert an integer to its canonical Roman numeral.
 *
 * @param {number} value Integer in [1, 3999].
 * @returns {string} The Roman numeral, e.g. 1994 -> "MCMXCIV".
 * @throws {RomanError} If `value` is not an integer in range.
 */
export function toRoman(value) {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new RomanError(`toRoman expects an integer, received ${describe(value)}`);
  }
  if (value < MIN_VALUE || value > MAX_VALUE) {
    throw new RomanError(
      `toRoman expects a value in [${MIN_VALUE}, ${MAX_VALUE}], received ${value}`,
    );
  }

  let remaining = value;
  let out = '';
  for (const [amount, symbol] of NUMERALS) {
    while (remaining >= amount) {
      out += symbol;
      remaining -= amount;
    }
  }
  return out;
}

/**
 * Convert a canonical Roman numeral back to an integer.
 *
 * Accepts only the exact strings produced by `toRoman`; anything else throws.
 * Input is case-sensitive: lowercase letters are rejected.
 *
 * @param {string} roman The Roman numeral, e.g. "MCMXCIV".
 * @returns {number} The integer value.
 * @throws {RomanError} If `roman` is not a canonical numeral.
 */
export function fromRoman(roman) {
  if (typeof roman !== 'string') {
    throw new RomanError(`fromRoman expects a string, received ${describe(roman)}`);
  }
  if (roman.length === 0) {
    throw new RomanError('fromRoman expects a non-empty string');
  }

  let total = 0;
  let i = 0;
  while (i < roman.length) {
    // Try the two-character subtractive token first, then fall back to one.
    const pair = roman.slice(i, i + 2);
    const pairValue = pairValueOf(pair);
    if (pairValue !== null) {
      total += pairValue;
      i += 2;
      continue;
    }

    const single = SINGLE_VALUES[roman[i]];
    if (single === undefined) {
      throw new RomanError(`invalid Roman numeral: ${JSON.stringify(roman)}`);
    }
    total += single;
    i += 1;
  }

  // Re-encode and compare: this is the cheapest way to reject non-canonical but
  // syntactically plausible inputs such as "IIII" or "MCMC" without writing a
  // second, subtly different validator.
  if (total < MIN_VALUE || total > MAX_VALUE || toRoman(total) !== roman) {
    throw new RomanError(`invalid Roman numeral: ${JSON.stringify(roman)}`);
  }
  return total;
}

/**
 * Test whether a string is a canonical Roman numeral.
 *
 * @param {unknown} value
 * @returns {boolean} True only for strings accepted by `fromRoman`.
 */
export function isRoman(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }
  try {
    fromRoman(value);
    return true;
  } catch (err) {
    if (err instanceof RomanError) {
      return false;
    }
    throw err;
  }
}

// Returns the value of a subtractive pair, or null if the pair is not one.
function pairValueOf(pair) {
  switch (pair) {
    case 'CM':
      return 900;
    case 'CD':
      return 400;
    case 'XC':
      return 90;
    case 'XL':
      return 40;
    case 'IX':
      return 9;
    case 'IV':
      return 4;
    default:
      return null;
  }
}

// Produce a short, safe description of a value for error messages. We avoid
// JSON.stringify here because it throws on BigInt and prints undefined oddly.
function describe(value) {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'undefined') return 'undefined';
  return typeof value;
}
