import { describe, it, expect } from 'vitest';
import { bustAmt, hipAmt, lerp, clamp } from '../figure/geometry.js';

describe('geometry utilities', () => {
  describe('bustAmt', () => {
    it('returns 0 at neutral (0.42)', () => {
      expect(bustAmt(0.42)).toBeCloseTo(0, 10);
    });

    it('returns 1 at max (1.0)', () => {
      expect(bustAmt(1.0)).toBeCloseTo(1, 10);
    });

    it('returns negative value at min (0.0)', () => {
      expect(bustAmt(0.0)).toBeCloseTo(-0.7241, 4);
    });

    it('handles mid-range values', () => {
      const result = bustAmt(0.71);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });
  });

  describe('hipAmt', () => {
    it('returns 0 at neutral (0.48)', () => {
      expect(hipAmt(0.48)).toBeCloseTo(0, 10);
    });

    it('returns 1 at max (1.0)', () => {
      expect(hipAmt(1.0)).toBeCloseTo(1, 10);
    });

    it('returns negative value at min (0.0)', () => {
      expect(hipAmt(0.0)).toBeCloseTo(-0.9231, 4);
    });

    it('handles mid-range values', () => {
      const result = hipAmt(0.74);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });
  });

  describe('lerp', () => {
    it('interpolates between values', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
    });
  });

  describe('clamp', () => {
    it('clamps values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });
});
