// Public entry point for roman-numerals-kit.
// Re-exporting from core keeps the import surface stable even if the internal
// module layout changes later.
export { toRoman, fromRoman, isRoman, RomanError } from './core.js';
