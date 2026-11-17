# roman-numerals-kit

Convert integers to Roman numerals and back, with strict canonical-only parsing.

```js
import { toRoman, fromRoman, isRoman, RomanError } from 'roman-numerals-kit';

toRoman(1994);        // 'MCMXCIV'
fromRoman('MCMXCIV'); // 1994
isRoman('IIII');      // false

try {
  toRoman(0);
} catch (err) {
  if (err instanceof RomanError) {
    console.error(err.message); // 'toRoman expects a value in [1, 3999], received 0'
  }
}
```

## Why this exists

Roman numerals are a small, closed problem, but most snippets you find online
quietly disagree about the edges: whether `IIII` is a legal way to write 4,
whether `IC` means 99, whether zero is representable. That ambiguity is fine for
a one-off script and painful for anything that stores the result.

This library picks the strict reading and sticks to it. The only accepted form
is the canonical subtractive one: the exact string that `toRoman` produces.
`fromRoman` parses that form and rejects everything else, so the two directions
agree exactly and `fromRoman(toRoman(n)) === n` holds for all valid `n`. The
trade-off is that historically attested but non-canonical spellings — `IIII`
for 4, `IIIIII` for 6, additive `VIIII` for 9 — are errors, not aliases.

## Range

Values are integers in `[1, 3999]`. Zero and negatives are rejected because
classical Roman numerals have no representation for them, and values above 3999
are rejected because that would require overline (vinculum) notation, which has
no single agreed-upon encoding. If you need larger numbers, encode them
yourself; this library will not guess.

## API

### `toRoman(value)`

Returns the canonical Roman numeral for an integer in `[1, 3999]`. Throws
`RomanError` for non-integers, non-numbers, and out-of-range values.

### `fromRoman(roman)`

Returns the integer value of a canonical Roman numeral string. Case-sensitive:
lowercase input is rejected. Throws `RomanError` for non-strings, empty strings,
and any string that is not exactly what `toRoman` would produce.

### `isRoman(value)`

Returns `true` if `value` is a string accepted by `fromRoman`, `false`
otherwise. Never throws for ordinary inputs; it exists so you can validate
without a `try`/`catch` at the call site.

### `RomanError`

Subclass of `TypeError` thrown by every failure in this library. Extending
`TypeError` lets callers distinguish library errors from their own type errors
while still catching the common case with a single `instanceof TypeError`.

## The awkward edge

`fromRoman('IIII')` throws. So does `fromRoman('IC')`, `fromRoman('MCMC')`, and
`fromRoman('MMMM')`. If you are importing Roman numerals from another system
that used additive or mixed notation, normalise them before calling this
library — or write a permissive parser, because this one deliberately is not.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

