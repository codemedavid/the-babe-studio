import { describe, it, expect } from 'vitest';
import { formatPrice, formatPriceWithDecimals, CURRENCY_SYMBOL, CURRENCY_CODE } from './currency';

describe('currency utils', () => {
  describe('formatPrice', () => {
    it('formats a whole number with peso sign', () => {
      expect(formatPrice(1000)).toBe('₱1,000');
    });

    it('formats zero', () => {
      expect(formatPrice(0)).toBe('₱0');
    });

    it('rounds decimals to whole number', () => {
      // toLocaleString with maximumFractionDigits: 0 rounds
      const result = formatPrice(999.99);
      expect(result).toBe('₱1,000');
    });

    it('formats large numbers with commas', () => {
      expect(formatPrice(1000000)).toBe('₱1,000,000');
    });

    it('formats small numbers without commas', () => {
      expect(formatPrice(500)).toBe('₱500');
    });

    it('formats negative numbers', () => {
      const result = formatPrice(-1500);
      expect(result).toContain('1,500');
    });
  });

  describe('formatPriceWithDecimals', () => {
    it('formats with two decimal places', () => {
      expect(formatPriceWithDecimals(1000)).toBe('₱1,000.00');
    });

    it('formats zero with decimals', () => {
      expect(formatPriceWithDecimals(0)).toBe('₱0.00');
    });

    it('preserves one decimal as two', () => {
      expect(formatPriceWithDecimals(999.5)).toBe('₱999.50');
    });

    it('rounds to two decimals', () => {
      expect(formatPriceWithDecimals(999.999)).toBe('₱1,000.00');
    });

    it('keeps exact two decimals', () => {
      expect(formatPriceWithDecimals(49.99)).toBe('₱49.99');
    });
  });

  describe('constants', () => {
    it('exports Philippine Peso symbol', () => {
      expect(CURRENCY_SYMBOL).toBe('₱');
    });

    it('exports PHP currency code', () => {
      expect(CURRENCY_CODE).toBe('PHP');
    });
  });
});
